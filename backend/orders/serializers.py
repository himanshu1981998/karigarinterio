from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem
from products.models import Product


class CartProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "price",
            "original_price",
            "discount_percentage",
            "stock",
            "category",
            "primary_image",
        ]

    def get_category(self, obj):
        if obj.category:
            return {
                "id": obj.category.id,
                "name": obj.category.name,
                "slug": obj.category.slug,
            }
        return None

    def get_primary_image(self, obj):
        request = self.context.get("request")
        image_obj = obj.images.filter(is_primary=True).first() or obj.images.first()

        if image_obj and image_obj.image:
            if request:
                return request.build_absolute_uri(image_obj.image.url)
            return image_obj.image.url
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "quantity",
            "unit_price",
            "line_total",
            "created_at",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        ]

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        total = sum(item.line_total for item in obj.items.all())
        return f"{total:.2f}"


class CartAddItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        return value

    def validate(self, attrs):
        product = Product.objects.get(id=attrs["product_id"], is_active=True)
        quantity = attrs["quantity"]

        if product.stock < quantity:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.stock} item(s) available in stock."}
            )

        attrs["product"] = product
        return attrs


class CartUpdateItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "unit_price",
            "quantity",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    can_request_cancellation = serializers.SerializerMethodField()
    can_request_return = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "checkout_type",
            "subtotal",
            "shipping_charge",
            "total",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_payment_status",
            "paid_at",
            "payment_error_code",
            "payment_error_description",
            "razorpay_refund_id",
            "refund_status",
            "refund_amount",
            "refund_error",
            "refunded_at",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address_line",
            "shipping_landmark",
            "shipping_city",
            "shipping_state",
            "shipping_pincode",
            "courier_name",
            "tracking_number",
            "tracking_url",
            "shipped_at",
            "delivered_at",
            "cancelled_at",
            "cancellation_status",
            "cancellation_reason",
            "cancellation_admin_note",
            "cancellation_requested_at",
            "cancellation_resolved_at",
            "return_status",
            "return_reason",
            "return_admin_note",
            "return_requested_at",
            "return_resolved_at",
            "can_request_cancellation",
            "can_request_return",
            "placed_at",
            "items",
        ]

    def get_can_request_cancellation(self, obj):
        return obj.status in {"pending", "confirmed", "processing"} and obj.cancellation_status in {"none", "rejected"}

    def get_can_request_return(self, obj):
        return obj.status == "delivered" and obj.return_status in {"none", "rejected"}


class BuyNowCheckoutSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    shipping_full_name = serializers.CharField(max_length=255)
    shipping_phone = serializers.CharField(max_length=15)
    shipping_address_line = serializers.CharField()
    shipping_landmark = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_pincode = serializers.CharField(max_length=10)
    payment_method = serializers.ChoiceField(choices=["cod", "online"])

    def validate(self, attrs):
        from products.models import Product

        try:
            product = Product.objects.get(id=attrs["product_id"], is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product not found."})

        if product.stock < attrs["quantity"]:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.stock} item(s) available in stock."}
            )

        attrs["product"] = product
        return attrs


class OrderCancellationRequestSerializer(serializers.Serializer):
    reason = serializers.CharField()


class OrderReturnRequestSerializer(serializers.Serializer):
    reason = serializers.CharField()


class AdminOrderFulfillmentSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[choice[0] for choice in Order.STATUS_CHOICES], required=False)
    courier_name = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=120)
    tracking_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=120)
    tracking_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)


class AdminOrderResolutionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AdminOrderReturnResolutionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject", "received", "refund"])
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)
