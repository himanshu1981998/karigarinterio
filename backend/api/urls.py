from django.urls import path
from .views import (
    SendOTPView,
    VerifyOTPView,
    ProfileView,
    AddressListCreateView,
    AddressDetailView,
)

urlpatterns = [
    path("auth/send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("auth/verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),

    path("profile/", ProfileView.as_view(), name="profile"),

    path("addresses/", AddressListCreateView.as_view(), name="address-list-create"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="address-detail"),
]