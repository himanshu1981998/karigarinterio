from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Cart, CartItem, Order, OrderItem, RazorpayWebhookEvent
from .payments import (
    RazorpayConfigurationError,
    build_checkout_payload,
    create_razorpay_refund,
    create_razorpay_order,
    parse_webhook_body,
    verify_payment_signature,
    verify_webhook_signature,
)
from .notifications import notify_admin_event, notify_customer_order_event
from .serializers import (
    CartSerializer,
    CartAddItemSerializer,
    CartUpdateItemSerializer,
    OrderSerializer,
    BuyNowCheckoutSerializer,
    OrderCancellationRequestSerializer,
    OrderReturnRequestSerializer,
)


REQUIRED_CHECKOUT_FIELDS = [
    "shipping_full_name",
    "shipping_phone",
    "shipping_address_line",
    "shipping_city",
    "shipping_state",
    "shipping_pincode",
    "payment_method",
]


def get_missing_checkout_fields(data):
    return [field for field in REQUIRED_CHECKOUT_FIELDS if not data.get(field)]


def get_shipping_payload(data):
    return {
        "shipping_full_name": data.get("shipping_full_name"),
        "shipping_phone": data.get("shipping_phone"),
        "shipping_address_line": data.get("shipping_address_line"),
        "shipping_landmark": data.get("shipping_landmark"),
        "shipping_city": data.get("shipping_city"),
        "shipping_state": data.get("shipping_state"),
        "shipping_pincode": data.get("shipping_pincode"),
    }


def build_order_response(order, message, http_status=status.HTTP_201_CREATED, include_razorpay=False):
    payload = {
        "message": message,
        "order": OrderSerializer(order).data,
    }

    if include_razorpay:
        payload["razorpay"] = build_checkout_payload(order)

    return Response(payload, status=http_status)


def create_order_items(order, source_items):
    order_items = []
    for item in source_items:
        product = item.product
        order_items.append(
            OrderItem(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                unit_price=product.price,
                quantity=item.quantity,
                line_total=item.line_total,
            )
        )

    OrderItem.objects.bulk_create(order_items)


def create_buy_now_order_item(order, product, quantity, line_total):
    OrderItem.objects.create(
        order=order,
        product=product,
        product_name=product.name,
        product_sku=product.sku,
        unit_price=product.price,
        quantity=quantity,
        line_total=line_total,
    )


def decrement_stock_for_order(order):
    order_items = list(order.items.select_related("product").all())
    product_ids = [item.product_id for item in order_items if item.product_id]
    products = Product.objects.select_for_update().in_bulk(product_ids)

    for item in order_items:
        product = products.get(item.product_id)
        if not product or not product.is_active:
            return f"{item.product_name} is no longer available."
        if product.stock < item.quantity:
            return f"Only {product.stock} item(s) available for {item.product_name}."

    for item in order_items:
        product = products[item.product_id]
        product.stock -= item.quantity
        product.save(update_fields=["stock"])

    return None


def restore_stock_for_order(order):
    if order.stock_restored_at:
        return False

    order_items = list(order.items.select_related("product").all())
    product_ids = [item.product_id for item in order_items if item.product_id]
    products = Product.objects.select_for_update().in_bulk(product_ids)

    for item in order_items:
        product = products.get(item.product_id)
        if not product:
            continue
        product.stock += item.quantity
        product.save(update_fields=["stock"])

    order.stock_restored_at = timezone.now()
    order.save(update_fields=["stock_restored_at", "updated_at"])
    return True


def clear_cart_for_order(order):
    if order.checkout_type != "cart":
        return

    try:
        order.user.cart.items.all().delete()
    except Cart.DoesNotExist:
        return


def fail_order_payment(order, code, description, razorpay_payment_id=None, razorpay_order_id=None):
    order.payment_status = "failed"
    order.razorpay_payment_status = "failed"
    order.payment_error_code = code
    order.payment_error_description = description
    if razorpay_payment_id:
        order.razorpay_payment_id = razorpay_payment_id
    if razorpay_order_id:
        order.razorpay_order_id = razorpay_order_id
    order.save(
        update_fields=[
            "payment_status",
            "razorpay_payment_status",
            "payment_error_code",
            "payment_error_description",
            "razorpay_payment_id",
            "razorpay_order_id",
            "updated_at",
        ]
    )


@transaction.atomic
def mark_order_paid(order, razorpay_payment_id=None, razorpay_order_id=None, razorpay_signature=None, payment_status_text="captured"):
    locked_order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)

    if locked_order.payment_status == "paid":
        update_fields = ["updated_at"]
        if razorpay_payment_id and not locked_order.razorpay_payment_id:
            locked_order.razorpay_payment_id = razorpay_payment_id
            update_fields.append("razorpay_payment_id")
        if razorpay_order_id and not locked_order.razorpay_order_id:
            locked_order.razorpay_order_id = razorpay_order_id
            update_fields.append("razorpay_order_id")
        if razorpay_signature and not locked_order.razorpay_signature:
            locked_order.razorpay_signature = razorpay_signature
            update_fields.append("razorpay_signature")
        if payment_status_text and not locked_order.razorpay_payment_status:
            locked_order.razorpay_payment_status = payment_status_text
            update_fields.append("razorpay_payment_status")
        if len(update_fields) > 1:
            locked_order.save(update_fields=update_fields)
        return locked_order, None

    stock_error = decrement_stock_for_order(locked_order)
    if stock_error:
        fail_order_payment(
            locked_order,
            code="stock_unavailable",
            description=stock_error,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_order_id=razorpay_order_id,
        )
        return locked_order, stock_error

    locked_order.payment_status = "paid"
    locked_order.status = "confirmed"
    locked_order.razorpay_payment_status = payment_status_text
    locked_order.payment_error_code = None
    locked_order.payment_error_description = None
    locked_order.paid_at = locked_order.paid_at or timezone.now()

    if razorpay_payment_id:
        locked_order.razorpay_payment_id = razorpay_payment_id
    if razorpay_order_id:
        locked_order.razorpay_order_id = razorpay_order_id
    if razorpay_signature:
        locked_order.razorpay_signature = razorpay_signature

    locked_order.save(
        update_fields=[
            "payment_status",
            "status",
            "razorpay_payment_id",
            "razorpay_order_id",
            "razorpay_signature",
            "razorpay_payment_status",
            "payment_error_code",
            "payment_error_description",
            "paid_at",
            "updated_at",
        ]
    )
    clear_cart_for_order(locked_order)
    notify_customer_order_event(
        locked_order,
        "payment_success",
        f"Payment confirmed for {locked_order.order_number}",
        f"Your payment for order {locked_order.order_number} has been confirmed.",
    )
    return locked_order, None


class CartMixin:
    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart


class CartDetailView(CartMixin, generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.get_cart(self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class CartAddItemView(CartMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CartAddItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self.get_cart(request.user)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            new_quantity = cart_item.quantity + quantity

            if product.stock < new_quantity:
                return Response(
                    {
                        "detail": f"Only {product.stock} item(s) available in stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_item.quantity = new_quantity
            cart_item.save(update_fields=["quantity"])

        cart_serializer = CartSerializer(
            cart,
            context={"request": request},
        )
        return Response(
            {
                "message": "Item added to cart successfully.",
                "cart": cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CartUpdateItemView(CartMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id, *args, **kwargs):
        serializer = CartUpdateItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self.get_cart(request.user)

        try:
            cart_item = cart.items.select_related("product").get(id=item_id)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = serializer.validated_data["quantity"]

        if cart_item.product.stock < quantity:
            return Response(
                {"detail": f"Only {cart_item.product.stock} item(s) available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save(update_fields=["quantity"])

        cart_serializer = CartSerializer(
            cart,
            context={"request": request},
        )
        return Response(
            {
                "message": "Cart item updated successfully.",
                "cart": cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CartRemoveItemView(CartMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id, *args, **kwargs):
        cart = self.get_cart(request.user)

        try:
            cart_item = cart.items.get(id=item_id)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart_item.delete()

        cart_serializer = CartSerializer(
            cart,
            context={"request": request},
        )
        return Response(
            {
                "message": "Cart item removed successfully.",
                "cart": cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CartClearView(CartMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        cart = self.get_cart(request.user)
        cart.items.all().delete()

        cart_serializer = CartSerializer(
            cart,
            context={"request": request},
        )
        return Response(
            {
                "message": "Cart cleared successfully.",
                "cart": cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CheckoutCreateOrderView(CartMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = self.get_cart(request.user)
        cart_items = cart.items.select_related("product").all()

        if not cart_items.exists():
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing_fields = get_missing_checkout_fields(request.data)
        if missing_fields:
            return Response(
                {"detail": f"Missing required fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = request.data.get("payment_method")
        if payment_method not in {"cod", "online"}:
            return Response(
                {"payment_method": "Invalid payment method."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subtotal = Decimal("0.00")

        for item in cart_items:
            if not item.product.is_active:
                return Response(
                    {"detail": f"{item.product.name} is no longer available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if item.product.stock < item.quantity:
                return Response(
                    {
                        "detail": f"Only {item.product.stock} item(s) available for {item.product.name}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            subtotal += item.line_total

        shipping_charge = Decimal("0.00")
        total = subtotal + shipping_charge

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                payment_method=payment_method,
                payment_status="pending",
                checkout_type="cart",
                subtotal=subtotal,
                shipping_charge=shipping_charge,
                total=total,
                **get_shipping_payload(request.data),
            )

            create_order_items(order, cart_items)

            if payment_method == "cod":
                stock_error = decrement_stock_for_order(order)
                if stock_error:
                    transaction.set_rollback(True)
                    return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)

                cart.items.all().delete()

        if payment_method == "cod":
            notify_customer_order_event(
                order,
                "order_placed",
                f"Order placed: {order.order_number}",
                f"Your order {order.order_number} has been placed successfully.",
            )
            notify_admin_event(
                "new_order",
                f"New order {order.order_number}",
                f"New COD order {order.order_number} for {order.shipping_full_name}.",
                order=order,
            )
            return build_order_response(order, "Order placed successfully.")

        try:
            razorpay_order = create_razorpay_order(order)
        except RazorpayConfigurationError as exc:
            fail_order_payment(order, "razorpay_configuration_error", str(exc))
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            fail_order_payment(order, "razorpay_order_error", str(exc))
            return Response(
                {"detail": "Unable to start online payment. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        order.razorpay_order_id = razorpay_order.get("id")
        order.razorpay_payment_status = razorpay_order.get("status")
        order.save(
            update_fields=[
                "razorpay_order_id",
                "razorpay_payment_status",
                "updated_at",
            ]
        )
        notify_admin_event(
            "online_payment_started",
            f"Online payment started {order.order_number}",
            f"Customer started Razorpay payment for order {order.order_number}.",
            order=order,
        )
        return build_order_response(
            order,
            "Razorpay order created successfully.",
            include_razorpay=True,
        )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items").order_by("-placed_at")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderCancellationRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number, *args, **kwargs):
        serializer = OrderCancellationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in {"pending", "confirmed", "processing"}:
            return Response(
                {"detail": "Cancellation can only be requested before shipment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.cancellation_status == "requested":
            return Response(
                {"detail": "Cancellation request is already pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.cancellation_status = "requested"
        order.cancellation_reason = serializer.validated_data["reason"]
        order.cancellation_requested_at = timezone.now()
        order.save(
            update_fields=[
                "cancellation_status",
                "cancellation_reason",
                "cancellation_requested_at",
                "updated_at",
            ]
        )
        notify_admin_event(
            "cancellation_requested",
            f"Cancellation requested {order.order_number}",
            f"Customer requested cancellation for order {order.order_number}: {order.cancellation_reason}",
            order=order,
        )
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class OrderReturnRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number, *args, **kwargs):
        serializer = OrderReturnRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "delivered":
            return Response(
                {"detail": "Return can only be requested after delivery."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.return_status == "requested":
            return Response(
                {"detail": "Return request is already pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.return_status = "requested"
        order.return_reason = serializer.validated_data["reason"]
        order.return_requested_at = timezone.now()
        order.save(
            update_fields=[
                "return_status",
                "return_reason",
                "return_requested_at",
                "updated_at",
            ]
        )
        notify_admin_event(
            "return_requested",
            f"Return requested {order.order_number}",
            f"Customer requested return for order {order.order_number}: {order.return_reason}",
            order=order,
        )
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
    


class BuyNowCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = BuyNowCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        subtotal = product.price * quantity
        shipping_charge = Decimal("0.00")
        total = subtotal + shipping_charge

        payment_method = serializer.validated_data["payment_method"]

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                payment_method=payment_method,
                payment_status="pending",
                checkout_type="buy_now",
                subtotal=subtotal,
                shipping_charge=shipping_charge,
                total=total,
                shipping_full_name=serializer.validated_data["shipping_full_name"],
                shipping_phone=serializer.validated_data["shipping_phone"],
                shipping_address_line=serializer.validated_data["shipping_address_line"],
                shipping_landmark=serializer.validated_data.get("shipping_landmark"),
                shipping_city=serializer.validated_data["shipping_city"],
                shipping_state=serializer.validated_data["shipping_state"],
                shipping_pincode=serializer.validated_data["shipping_pincode"],
            )

            create_buy_now_order_item(order, product, quantity, subtotal)

            if payment_method == "cod":
                stock_error = decrement_stock_for_order(order)
                if stock_error:
                    transaction.set_rollback(True)
                    return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)

        if payment_method == "cod":
            notify_customer_order_event(
                order,
                "order_placed",
                f"Order placed: {order.order_number}",
                f"Your order {order.order_number} has been placed successfully.",
            )
            notify_admin_event(
                "new_order",
                f"New order {order.order_number}",
                f"New buy-now COD order {order.order_number} for {order.shipping_full_name}.",
                order=order,
            )
            return build_order_response(order, "Buy now order placed successfully.")

        try:
            razorpay_order = create_razorpay_order(order)
        except RazorpayConfigurationError as exc:
            fail_order_payment(order, "razorpay_configuration_error", str(exc))
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            fail_order_payment(order, "razorpay_order_error", str(exc))
            return Response(
                {"detail": "Unable to start online payment. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        order.razorpay_order_id = razorpay_order.get("id")
        order.razorpay_payment_status = razorpay_order.get("status")
        order.save(
            update_fields=[
                "razorpay_order_id",
                "razorpay_payment_status",
                "updated_at",
            ]
        )
        notify_admin_event(
            "online_payment_started",
            f"Online payment started {order.order_number}",
            f"Customer started Razorpay payment for buy-now order {order.order_number}.",
            order=order,
        )
        return build_order_response(
            order,
            "Razorpay order created successfully.",
            include_razorpay=True,
        )


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        required_fields = [
            "order_number",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",
        ]
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response(
                {"detail": f"Missing required fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(
                order_number=request.data["order_number"],
                user=request.user,
                payment_method="online",
            )
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        razorpay_order_id = request.data["razorpay_order_id"]
        razorpay_payment_id = request.data["razorpay_payment_id"]
        razorpay_signature = request.data["razorpay_signature"]

        if order.razorpay_order_id != razorpay_order_id:
            fail_order_payment(
                order,
                "razorpay_order_mismatch",
                "Payment order id does not match this order.",
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
            )
            return Response(
                {"detail": "Payment order id does not match this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            signature_valid = verify_payment_signature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            )
        except RazorpayConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if not signature_valid:
            fail_order_payment(
                order,
                "invalid_signature",
                "Razorpay payment signature verification failed.",
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
            )
            return Response(
                {"detail": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order, stock_error = mark_order_paid(
            order,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_order_id=razorpay_order_id,
            razorpay_signature=razorpay_signature,
            payment_status_text="captured",
        )

        if stock_error:
            return Response(
                {
                    "detail": stock_error,
                    "order": OrderSerializer(order).data,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                "message": "Payment verified successfully.",
                "order": OrderSerializer(order).data,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name="dispatch")
class RazorpayWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        signature = request.headers.get("X-Razorpay-Signature")
        event_id = request.headers.get("X-Razorpay-Event-Id")
        raw_body = request.body

        if not event_id:
            return Response({"detail": "Missing Razorpay event id."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            signature_valid = verify_webhook_signature(raw_body, signature)
        except RazorpayConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if not signature_valid:
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = parse_webhook_body(raw_body)
        except ValueError:
            return Response({"detail": "Invalid webhook payload."}, status=status.HTTP_400_BAD_REQUEST)

        event_name = payload.get("event", "")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {}) or {}
        order_entity = payload.get("payload", {}).get("order", {}).get("entity", {}) or {}
        razorpay_order_id = payment_entity.get("order_id") or order_entity.get("id")
        razorpay_payment_id = payment_entity.get("id")

        _, created = RazorpayWebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={
                "event_name": event_name,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "payload": payload,
            },
        )

        if not created:
            return Response({"message": "Duplicate webhook ignored."}, status=status.HTTP_200_OK)

        if not razorpay_order_id:
            return Response({"message": "Webhook received."}, status=status.HTTP_200_OK)

        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id, payment_method="online")
        except Order.DoesNotExist:
            return Response({"message": "Webhook received for unknown order."}, status=status.HTTP_200_OK)

        if event_name in {"payment.captured", "order.paid"}:
            order, stock_error = mark_order_paid(
                order,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
                payment_status_text=payment_entity.get("status") or order_entity.get("status") or "paid",
            )
            if stock_error:
                return Response(
                    {"message": "Webhook received, but stock is unavailable.", "detail": stock_error},
                    status=status.HTTP_200_OK,
                )

        if event_name == "payment.failed":
            fail_order_payment(
                order,
                payment_entity.get("error_code") or "payment_failed",
                payment_entity.get("error_description") or "Razorpay payment failed.",
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
            )

        return Response({"message": "Webhook processed."}, status=status.HTTP_200_OK)
