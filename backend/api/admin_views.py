from datetime import timedelta
from decimal import Decimal
import csv

from django.http import HttpResponse
from django.db import transaction
from django.db.models import Count, F, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import NotificationLog, Order, RazorpayWebhookEvent
from orders.payments import RazorpayConfigurationError, create_razorpay_refund
from orders.serializers import (
    AdminOrderFulfillmentSerializer,
    AdminOrderResolutionSerializer,
    AdminOrderReturnResolutionSerializer,
    OrderSerializer,
)
from orders.notifications import notify_customer_order_event
from orders.views import restore_stock_for_order
from products.models import Category, Product, ProductImage, ProductSpecification
from products.media import get_media_url
from products.serializers import (
    CategorySerializer,
    ProductImageSerializer,
    ProductSpecificationSerializer,
)
from services.models import ServiceEnquiry
from services.serializers import ServiceEnquirySerializer
from users.models import User


class AdminProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, required=False)
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "short_description",
            "description",
            "price",
            "original_price",
            "discount_percentage",
            "stock",
            "is_active",
            "is_featured",
            "material_summary",
            "finish",
            "width_cm",
            "depth_cm",
            "height_cm",
            "estimated_shipping_text",
            "created_at",
            "updated_at",
            "category",
            "category_id",
            "primary_image",
            "images",
            "specifications",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_primary_image(self, obj):
        request = self.context.get("request")
        image_obj = obj.images.filter(is_primary=True).first() or obj.images.first()

        if image_obj and image_obj.image:
            return get_media_url(image_obj.image, request)
        return None

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        original_price = attrs.get("original_price", getattr(self.instance, "original_price", None))
        stock = attrs.get("stock", getattr(self.instance, "stock", 0))

        if price is not None and price <= 0:
            raise serializers.ValidationError({"price": "Price must be greater than zero."})

        if original_price is not None and price is not None and original_price < price:
            raise serializers.ValidationError({"original_price": "MRP cannot be lower than selling price."})

        if stock is not None and stock < 0:
            raise serializers.ValidationError({"stock": "Stock cannot be negative."})

        for field in ("width_cm", "depth_cm", "height_cm"):
            value = attrs.get(field, getattr(self.instance, field, None))
            if value is not None and value < 0:
                raise serializers.ValidationError({field: "Dimension cannot be negative."})

        return attrs

    def _sync_specifications(self, product, specifications):
        if specifications is None:
            return

        product.specifications.all().delete()

        ProductSpecification.objects.bulk_create(
            [
                ProductSpecification(
                    product=product,
                    name=spec.get("name", ""),
                    value=spec.get("value", ""),
                    sort_order=spec.get("sort_order", index),
                )
                for index, spec in enumerate(specifications)
                if spec.get("name") and spec.get("value")
            ]
        )

    def create(self, validated_data):
        specifications = validated_data.pop("specifications", None)
        product = super().create(validated_data)
        self._sync_specifications(product, specifications)
        return product

    def update(self, instance, validated_data):
        specifications = validated_data.pop("specifications", None)
        product = super().update(instance, validated_data)
        self._sync_specifications(product, specifications)
        return product


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    orders_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "is_phone_verified",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
            "orders_count",
            "total_spent",
        ]

    def get_full_name(self, obj):
        profile = getattr(obj, "profile", None)
        if not profile:
            return ""
        return f"{profile.first_name} {profile.last_name}".strip()

    def get_total_spent(self, obj):
        return obj.total_spent or Decimal("0.00")


class AdminCategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    clear_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "image", "clear_image", "is_active", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        data["image"] = get_media_url(instance.image, request)

        return data

    def create(self, validated_data):
        validated_data.pop("clear_image", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        clear_image = validated_data.pop("clear_image", False)

        if clear_image and instance.image:
            instance.image.delete(save=False)
            validated_data["image"] = None

        return super().update(instance, validated_data)


class AdminDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        start_date = today - timedelta(days=6)

        orders = Order.objects.all()
        products = Product.objects.all()
        service_enquiries = ServiceEnquiry.objects.all()
        users = User.objects.all()

        total_revenue = orders.exclude(status="cancelled").aggregate(
            total=Sum("total")
        )["total"] or Decimal("0.00")

        today_revenue = orders.filter(placed_at__date=today).exclude(
            status="cancelled"
        ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

        status_counts = {
            item["status"]: item["count"]
            for item in orders.values("status").annotate(count=Count("id"))
        }

        payment_counts = {
            item["payment_status"]: item["count"]
            for item in orders.values("payment_status").annotate(count=Count("id"))
        }

        service_status_counts = {
            item["status"]: item["count"]
            for item in service_enquiries.values("status").annotate(count=Count("id"))
        }

        sales_rows = (
            orders.filter(placed_at__date__gte=start_date)
            .exclude(status="cancelled")
            .annotate(day=TruncDate("placed_at"))
            .values("day")
            .annotate(revenue=Sum("total"), orders=Count("id"))
            .order_by("day")
        )
        sales_by_day = {
            row["day"].isoformat(): {
                "revenue": row["revenue"] or Decimal("0.00"),
                "orders": row["orders"],
            }
            for row in sales_rows
        }

        sales_trend = []
        for offset in range(7):
            day = start_date + timedelta(days=offset)
            row = sales_by_day.get(day.isoformat(), {})
            sales_trend.append(
                {
                    "date": day.isoformat(),
                    "orders": row.get("orders", 0),
                    "revenue": row.get("revenue", Decimal("0.00")),
                }
            )

        low_stock_products = products.filter(is_active=True, stock__lte=5).order_by("stock")[:8]

        return Response(
            {
                "totals": {
                    "revenue": total_revenue,
                    "today_revenue": today_revenue,
                    "orders": orders.count(),
                    "pending_orders": status_counts.get("pending", 0),
                    "products": products.count(),
                    "active_products": products.filter(is_active=True).count(),
                    "low_stock_products": products.filter(is_active=True, stock__lte=5).count(),
                    "users": users.count(),
                    "staff_users": users.filter(is_staff=True).count(),
                },
                "order_status_counts": status_counts,
                "payment_status_counts": payment_counts,
                "service_status_counts": service_status_counts,
                "sales_trend": sales_trend,
                "low_stock_products": AdminProductSerializer(
                    low_stock_products,
                    many=True,
                    context={"request": request},
                ).data,
                "recent_orders": OrderSerializer(
                    orders.prefetch_related("items").order_by("-placed_at")[:6],
                    many=True,
                ).data,
            }
        )


class AdminProductListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminProductSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Product.objects.select_related("category").prefetch_related("images", "specifications")

        search = self.request.query_params.get("search")
        status_filter = self.request.query_params.get("status")
        stock_filter = self.request.query_params.get("stock")
        featured = self.request.query_params.get("featured")

        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(sku__icontains=search)

        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        if stock_filter == "low":
            queryset = queryset.filter(stock__lte=5)
        elif stock_filter == "out":
            queryset = queryset.filter(stock=0)

        if featured == "true":
            queryset = queryset.filter(is_featured=True)

        return queryset.order_by("-updated_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("category").prefetch_related("images", "specifications")
    serializer_class = AdminProductSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class AdminProductStockView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        stock = request.data.get("stock")
        if stock is None:
            return Response({"stock": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = int(stock)
        except (TypeError, ValueError):
            return Response({"stock": "Stock must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        if stock < 0:
            return Response({"stock": "Stock cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)

        product.stock = stock
        product.save(update_fields=["stock", "updated_at"])
        return Response(AdminProductSerializer(product, context={"request": request}).data)


class AdminProductFeatureView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        product.is_featured = bool(request.data.get("is_featured", not product.is_featured))
        product.save(update_fields=["is_featured", "updated_at"])
        return Response(AdminProductSerializer(product, context={"request": request}).data)


class AdminProductImageCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist("images") or request.FILES.getlist("image")
        if not images:
            single_image = request.FILES.get("image")
            images = [single_image] if single_image else []

        if not images:
            return Response({"images": "At least one image is required."}, status=status.HTTP_400_BAD_REQUEST)

        is_primary = str(request.data.get("is_primary", "true")).lower() in {"true", "1", "yes"}

        if is_primary:
            product.images.update(is_primary=False)

        created_images = []
        existing_count = product.images.count()

        for index, image in enumerate(images):
            created_images.append(
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    alt_text=request.data.get("alt_text") or product.name,
                    is_primary=is_primary and index == 0,
                    sort_order=request.data.get("sort_order") or existing_count + index,
                )
            )

        return Response(
            {
                "images": ProductImageSerializer(
                    created_images,
                    many=True,
                    context={"request": request},
                ).data,
                "product": AdminProductSerializer(product, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminProductImageDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk, image_id):
        try:
            product = Product.objects.get(pk=pk)
            image = product.images.get(pk=image_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except ProductImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

        if "alt_text" in request.data:
            image.alt_text = request.data.get("alt_text") or ""

        if "sort_order" in request.data:
            try:
                image.sort_order = int(request.data.get("sort_order"))
            except (TypeError, ValueError):
                return Response({"sort_order": "Sort order must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        if str(request.data.get("is_primary", "false")).lower() in {"true", "1", "yes"}:
            product.images.exclude(pk=image.pk).update(is_primary=False)
            image.is_primary = True

        image.save()

        return Response(
            {
                "image": ProductImageSerializer(image, context={"request": request}).data,
                "product": AdminProductSerializer(product, context={"request": request}).data,
            }
        )

    def delete(self, request, pk, image_id):
        try:
            product = Product.objects.get(pk=pk)
            image = product.images.get(pk=image_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except ProductImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

        was_primary = image.is_primary
        image.delete()

        if was_primary:
            next_image = product.images.order_by("sort_order", "id").first()
            if next_image:
                next_image.is_primary = True
                next_image.save(update_fields=["is_primary"])

        return Response(
            {
                "product": AdminProductSerializer(product, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Order.objects.select_related("user").prefetch_related("items").order_by("-placed_at")

        status_filter = self.request.query_params.get("status")
        payment_status = self.request.query_params.get("payment_status")
        search = self.request.query_params.get("search")

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        if search:
            queryset = queryset.filter(order_number__icontains=search) | queryset.filter(
                shipping_phone__icontains=search
            ) | queryset.filter(shipping_full_name__icontains=search)

        return queryset


class AdminOrderStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        next_status = request.data.get("status")
        payment_status = request.data.get("payment_status")

        valid_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        valid_payment_statuses = {choice[0] for choice in Order.PAYMENT_STATUS_CHOICES}

        update_fields = ["updated_at"]

        if next_status:
            if next_status not in valid_statuses:
                return Response({"status": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)
            order.status = next_status
            update_fields.append("status")

        if payment_status:
            if payment_status not in valid_payment_statuses:
                return Response(
                    {"payment_status": "Invalid payment status."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            order.payment_status = payment_status
            update_fields.append("payment_status")

        order.save(update_fields=update_fields)
        return Response(OrderSerializer(order).data)


class AdminOrderFulfillmentView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderFulfillmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        update_fields = ["updated_at"]

        next_status = data.get("status")
        if next_status:
            order.status = next_status
            update_fields.append("status")
            now = timezone.now()
            if next_status == "shipped" and not order.shipped_at:
                order.shipped_at = now
                update_fields.append("shipped_at")
            if next_status == "delivered" and not order.delivered_at:
                order.delivered_at = now
                update_fields.append("delivered_at")
            if next_status == "cancelled" and not order.cancelled_at:
                order.cancelled_at = now
                update_fields.append("cancelled_at")

        for field in ("courier_name", "tracking_number", "tracking_url"):
            if field in data:
                setattr(order, field, data.get(field) or None)
                update_fields.append(field)

        order.save(update_fields=list(dict.fromkeys(update_fields)))

        if next_status in {"shipped", "delivered", "cancelled"}:
            notify_customer_order_event(
                order,
                f"order_{next_status}",
                f"Order {next_status}: {order.order_number}",
                f"Your order {order.order_number} is now {next_status}.",
            )

        return Response(OrderSerializer(order).data)


class AdminOrderCancellationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderResolutionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        note = serializer.validated_data.get("note") or ""

        if order.cancellation_status != "requested":
            return Response({"detail": "No pending cancellation request."}, status=status.HTTP_400_BAD_REQUEST)

        if action == "reject":
            order.cancellation_status = "rejected"
            order.cancellation_admin_note = note
            order.cancellation_resolved_at = timezone.now()
            order.save(
                update_fields=[
                    "cancellation_status",
                    "cancellation_admin_note",
                    "cancellation_resolved_at",
                    "updated_at",
                ]
            )
            notify_customer_order_event(
                order,
                "cancellation_rejected",
                f"Cancellation rejected: {order.order_number}",
                f"Your cancellation request for {order.order_number} was rejected. {note}",
            )
            return Response(OrderSerializer(order).data)

        order.cancellation_status = "approved"
        order.cancellation_admin_note = note
        order.cancellation_resolved_at = timezone.now()
        order.status = "cancelled"
        order.cancelled_at = order.cancelled_at or timezone.now()

        with transaction.atomic():
            locked_order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
            locked_order.cancellation_status = order.cancellation_status
            locked_order.cancellation_admin_note = order.cancellation_admin_note
            locked_order.cancellation_resolved_at = order.cancellation_resolved_at
            locked_order.status = order.status
            locked_order.cancelled_at = order.cancelled_at
            locked_order.save(
                update_fields=[
                    "cancellation_status",
                    "cancellation_admin_note",
                    "cancellation_resolved_at",
                    "status",
                    "cancelled_at",
                    "updated_at",
                ]
            )
            restore_stock_for_order(locked_order)
            order = locked_order

        notify_customer_order_event(
            order,
            "cancellation_approved",
            f"Cancellation approved: {order.order_number}",
            f"Your cancellation request for {order.order_number} was approved. {note}",
        )
        return Response(OrderSerializer(order).data)


class AdminOrderReturnView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderReturnResolutionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        note = serializer.validated_data.get("note") or ""

        if action in {"approve", "reject"} and order.return_status != "requested":
            return Response({"detail": "No pending return request."}, status=status.HTTP_400_BAD_REQUEST)

        if action == "approve":
            order.return_status = "approved"
        elif action == "reject":
            order.return_status = "rejected"
        elif action == "received":
            if order.return_status not in {"approved", "received"}:
                return Response({"detail": "Return must be approved before marking received."}, status=status.HTTP_400_BAD_REQUEST)
            order.return_status = "received"
        elif action == "refund":
            if order.return_status not in {"received", "refunded"}:
                return Response({"detail": "Return must be received before refund."}, status=status.HTTP_400_BAD_REQUEST)
            order.return_status = "refunded"

        order.return_admin_note = note
        order.return_resolved_at = timezone.now()
        order.save(update_fields=["return_status", "return_admin_note", "return_resolved_at", "updated_at"])

        if action == "refund":
            with transaction.atomic():
                locked_order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
                restore_stock_for_order(locked_order)
                order = locked_order

        notify_customer_order_event(
            order,
            f"return_{action}",
            f"Return update: {order.order_number}",
            f"Your return request for {order.order_number} is now {order.return_status}. {note}",
        )
        return Response(OrderSerializer(order).data)


class AdminOrderRefundView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_method != "online" or order.payment_status != "paid":
            return Response({"detail": "Only paid online orders can be refunded."}, status=status.HTTP_400_BAD_REQUEST)

        if order.refunded_at:
            return Response({"detail": "Order is already refunded."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refund = create_razorpay_refund(
                order,
                amount=order.total,
                notes={"reason": request.data.get("reason", "admin_refund")},
            )
        except RazorpayConfigurationError as exc:
            order.refund_error = str(exc)
            order.save(update_fields=["refund_error", "updated_at"])
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            order.refund_error = str(exc)
            order.save(update_fields=["refund_error", "updated_at"])
            return Response({"detail": "Unable to create Razorpay refund."}, status=status.HTTP_502_BAD_GATEWAY)

        order.razorpay_refund_id = refund.get("id")
        order.refund_status = refund.get("status") or "created"
        order.refund_amount = order.total
        order.refunded_at = timezone.now()
        order.payment_status = "refunded"
        order.refund_error = None
        order.save(
            update_fields=[
                "razorpay_refund_id",
                "refund_status",
                "refund_amount",
                "refunded_at",
                "payment_status",
                "refund_error",
                "updated_at",
            ]
        )

        with transaction.atomic():
            locked_order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
            restore_stock_for_order(locked_order)
            order = locked_order

        notify_customer_order_event(
            order,
            "refund_created",
            f"Refund created: {order.order_number}",
            f"Refund has been initiated for order {order.order_number}.",
        )
        return Response(OrderSerializer(order).data)


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.select_related("profile").annotate(
            orders_count=Count("orders", distinct=True),
            total_spent=Sum("orders__total"),
        )

        search = self.request.query_params.get("search")
        staff = self.request.query_params.get("staff")

        if search:
            queryset = queryset.filter(phone__icontains=search)

        if staff == "true":
            queryset = queryset.filter(is_staff=True)

        return queryset.order_by("-date_joined")


class AdminCategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = AdminCategorySerializer
    permission_classes = [permissions.IsAdminUser]


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = AdminCategorySerializer
    permission_classes = [permissions.IsAdminUser]


class AdminServiceEnquiryListView(generics.ListAPIView):
    serializer_class = ServiceEnquirySerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = ServiceEnquiry.objects.all().order_by("-created_at")

        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if search:
            queryset = (
                queryset.filter(full_name__icontains=search)
                | queryset.filter(phone__icontains=search)
                | queryset.filter(city__icontains=search)
                | queryset.filter(other_service__icontains=search)
                | queryset.filter(requirements__icontains=search)
            )

        return queryset


class AdminServiceEnquiryStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            enquiry = ServiceEnquiry.objects.get(pk=pk)
        except ServiceEnquiry.DoesNotExist:
            return Response({"detail": "Service enquiry not found."}, status=status.HTTP_404_NOT_FOUND)

        next_status = request.data.get("status")
        valid_statuses = {choice[0] for choice in ServiceEnquiry.STATUS_CHOICES}

        if next_status not in valid_statuses:
            return Response({"status": "Invalid service status."}, status=status.HTTP_400_BAD_REQUEST)

        enquiry.status = next_status
        enquiry.save(update_fields=["status", "updated_at"])

        return Response(ServiceEnquirySerializer(enquiry).data)


class AdminWebhookEventListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return RazorpayWebhookEvent.objects.all().order_by("-processed_at")[:100]

    def get(self, request, *args, **kwargs):
        events = [
            {
                "id": event.id,
                "event_id": event.event_id,
                "event_name": event.event_name,
                "razorpay_order_id": event.razorpay_order_id,
                "razorpay_payment_id": event.razorpay_payment_id,
                "processed_at": event.processed_at,
            }
            for event in self.get_queryset()
        ]
        return Response(events)


class AdminNotificationLogListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return NotificationLog.objects.select_related("order", "user").order_by("-created_at")[:100]

    def get(self, request, *args, **kwargs):
        logs = [
            {
                "id": log.id,
                "event_type": log.event_type,
                "channel": log.channel,
                "recipient": log.recipient,
                "subject": log.subject,
                "status": log.status,
                "error": log.error,
                "order_number": log.order.order_number if log.order else "",
                "created_at": log.created_at,
                "sent_at": log.sent_at,
            }
            for log in self.get_queryset()
        ]
        return Response(logs)


class AdminExportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, export_type):
        if export_type == "orders":
            return self.export_orders()
        if export_type == "products":
            return self.export_products()
        if export_type == "users":
            return self.export_users()
        return Response({"detail": "Invalid export type."}, status=status.HTTP_400_BAD_REQUEST)

    def _response(self, filename):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    def export_orders(self):
        response = self._response("karigar-orders.csv")
        writer = csv.writer(response)
        writer.writerow([
            "Order Number",
            "Customer",
            "Phone",
            "Status",
            "Payment Status",
            "Payment Method",
            "Total",
            "Courier",
            "Tracking Number",
            "Placed At",
        ])
        for order in Order.objects.order_by("-placed_at"):
            writer.writerow([
                order.order_number,
                order.shipping_full_name,
                order.shipping_phone,
                order.status,
                order.payment_status,
                order.payment_method,
                order.total,
                order.courier_name or "",
                order.tracking_number or "",
                order.placed_at.isoformat(),
            ])
        return response

    def export_products(self):
        response = self._response("karigar-products.csv")
        writer = csv.writer(response)
        writer.writerow(["SKU", "Name", "Category", "Price", "MRP", "Stock", "Active", "Featured"])
        for product in Product.objects.select_related("category").order_by("sku"):
            writer.writerow([
                product.sku,
                product.name,
                product.category.name if product.category else "",
                product.price,
                product.original_price or "",
                product.stock,
                product.is_active,
                product.is_featured,
            ])
        return response

    def export_users(self):
        response = self._response("karigar-users.csv")
        writer = csv.writer(response)
        writer.writerow(["Phone", "Is Staff", "Is Superuser", "Date Joined", "Orders"])
        users = User.objects.annotate(orders_count=Count("orders", distinct=True)).order_by("-date_joined")
        for user in users:
            writer.writerow([
                user.phone,
                user.is_staff,
                user.is_superuser,
                user.date_joined.isoformat(),
                user.orders_count,
            ])
        return response
