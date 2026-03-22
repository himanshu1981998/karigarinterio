from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP, Profile, Address


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("id", "phone", "is_phone_verified", "is_staff", "is_active")
    ordering = ("id",)

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Verification", {"fields": ("is_phone_verified",)}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )

    search_fields = ("phone",)


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("id", "phone", "code", "purpose", "is_verified", "created_at", "expires_at")
    search_fields = ("phone",)
    list_filter = ("purpose", "is_verified")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "email", "contact_number")
    search_fields = ("full_name", "email", "contact_number", "user__phone")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "phone", "city", "state", "pincode", "is_default")
    search_fields = ("full_name", "phone", "city", "state", "pincode", "user__phone")
    list_filter = ("label", "is_default", "state")