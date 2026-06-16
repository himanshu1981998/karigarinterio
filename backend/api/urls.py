from django.urls import path
from .views import (
    SendOTPView,
    VerifyOTPView,
    ProfileView,
    AddressListCreateView,
    AddressDetailView,
)
from .views import CategoryListView, ProductListView, ProductDetailView
from .admin_views import (
    AdminCategoryListView,
    AdminCategoryDetailView,
    AdminDashboardSummaryView,
    AdminExportView,
    AdminNotificationLogListView,
    AdminOrderListView,
    AdminOrderCancellationView,
    AdminOrderFulfillmentView,
    AdminOrderRefundView,
    AdminOrderReturnView,
    AdminOrderStatusView,
    AdminProductDetailView,
    AdminProductFeatureView,
    AdminProductImageCreateView,
    AdminProductImageDetailView,
    AdminProductListCreateView,
    AdminProductStockView,
    AdminServiceEnquiryListView,
    AdminServiceEnquiryStatusView,
    AdminUserListView,
    AdminWebhookEventListView,
)


urlpatterns = [
    path("auth/send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("auth/verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),


    path("profile/", ProfileView.as_view(), name="profile"),
    path("addresses/", AddressListCreateView.as_view(), name="address-list-create"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="address-detail"),



    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),

    path("admin/dashboard/", AdminDashboardSummaryView.as_view(), name="admin-dashboard"),
    path("admin/categories/", AdminCategoryListView.as_view(), name="admin-category-list"),
    path("admin/categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),
    path("admin/products/", AdminProductListCreateView.as_view(), name="admin-product-list-create"),
    path("admin/products/<int:pk>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("admin/products/<int:pk>/stock/", AdminProductStockView.as_view(), name="admin-product-stock"),
    path("admin/products/<int:pk>/feature/", AdminProductFeatureView.as_view(), name="admin-product-feature"),
    path("admin/products/<int:pk>/images/", AdminProductImageCreateView.as_view(), name="admin-product-image-create"),
    path("admin/products/<int:pk>/images/<int:image_id>/", AdminProductImageDetailView.as_view(), name="admin-product-image-detail"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/orders/<int:pk>/status/", AdminOrderStatusView.as_view(), name="admin-order-status"),
    path("admin/orders/<int:pk>/fulfillment/", AdminOrderFulfillmentView.as_view(), name="admin-order-fulfillment"),
    path("admin/orders/<int:pk>/cancellation/", AdminOrderCancellationView.as_view(), name="admin-order-cancellation"),
    path("admin/orders/<int:pk>/return/", AdminOrderReturnView.as_view(), name="admin-order-return"),
    path("admin/orders/<int:pk>/refund/", AdminOrderRefundView.as_view(), name="admin-order-refund"),
    path("admin/services/", AdminServiceEnquiryListView.as_view(), name="admin-service-list"),
    path("admin/services/<int:pk>/status/", AdminServiceEnquiryStatusView.as_view(), name="admin-service-status"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/webhooks/razorpay/", AdminWebhookEventListView.as_view(), name="admin-razorpay-webhooks"),
    path("admin/notifications/", AdminNotificationLogListView.as_view(), name="admin-notification-logs"),
    path("admin/export/<str:export_type>/", AdminExportView.as_view(), name="admin-export"),

    
]
