from django.contrib import admin
from .models import Cart, CartItem, NotificationLog, Order, OrderItem, RazorpayWebhookEvent


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("product", "quantity", "unit_price", "line_total", "created_at")
    can_delete = False


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at")
    search_fields = ("user__phone",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "product_name",
        "product_sku",
        "unit_price",
        "quantity",
        "line_total",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "payment_method",
        "payment_status",
        "razorpay_payment_status",
        "total",
        "placed_at",
    )
    list_filter = ("status", "payment_method", "payment_status", "placed_at")
    search_fields = (
        "order_number",
        "user__phone",
        "shipping_full_name",
        "shipping_phone",
        "shipping_city",
        "shipping_pincode",
        "razorpay_order_id",
        "razorpay_payment_id",
    )
    readonly_fields = (
        "order_number",
        "user",
        "checkout_type",
        "subtotal",
        "shipping_charge",
        "total",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "razorpay_payment_status",
        "paid_at",
        "payment_error_code",
        "payment_error_description",
        "placed_at",
        "updated_at",
    )
    inlines = [OrderItemInline]


@admin.register(RazorpayWebhookEvent)
class RazorpayWebhookEventAdmin(admin.ModelAdmin):
    list_display = (
        "event_id",
        "event_name",
        "razorpay_order_id",
        "razorpay_payment_id",
        "processed_at",
    )
    search_fields = ("event_id", "razorpay_order_id", "razorpay_payment_id")
    list_filter = ("event_name", "processed_at")
    readonly_fields = (
        "event_id",
        "event_name",
        "razorpay_order_id",
        "razorpay_payment_id",
        "payload",
        "processed_at",
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ("event_type", "channel", "recipient", "status", "created_at", "sent_at")
    list_filter = ("event_type", "channel", "status", "created_at")
    search_fields = ("recipient", "subject", "message", "order__order_number")
    readonly_fields = (
        "user",
        "order",
        "event_type",
        "channel",
        "recipient",
        "subject",
        "message",
        "status",
        "error",
        "created_at",
        "sent_at",
    )
