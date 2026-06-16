from django.urls import path

from .views import (
    CartDetailView,
    CartAddItemView,
    CartUpdateItemView,
    CartRemoveItemView,
    CartClearView,
    CheckoutCreateOrderView,
    OrderListView,
    OrderDetailView,
    BuyNowCheckoutView,
    RazorpayVerifyPaymentView,
    RazorpayWebhookView,
    OrderCancellationRequestView,
    OrderReturnRequestView,
)

urlpatterns = [
    path("cart/", CartDetailView.as_view(), name="cart-detail"),
    path("cart/add/", CartAddItemView.as_view(), name="cart-add-item"),
    path("cart/items/<int:item_id>/", CartUpdateItemView.as_view(), name="cart-update-item"),
    path("cart/items/<int:item_id>/remove/", CartRemoveItemView.as_view(), name="cart-remove-item"),
    path("cart/clear/", CartClearView.as_view(), name="cart-clear"),

    path("checkout/", CheckoutCreateOrderView.as_view(), name="checkout-create-order"),
    path("checkout/buy-now/", BuyNowCheckoutView.as_view(), name="checkout-buy-now"),
    path("payments/razorpay/verify/", RazorpayVerifyPaymentView.as_view(), name="razorpay-verify-payment"),
    path("payments/razorpay/webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("orders/<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<str:order_number>/cancel-request/", OrderCancellationRequestView.as_view(), name="order-cancel-request"),
    path("orders/<str:order_number>/return-request/", OrderReturnRequestView.as_view(), name="order-return-request"),
   
]
