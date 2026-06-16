from django.contrib import admin
from .models import ServiceEnquiry


@admin.register(ServiceEnquiry)
class ServiceEnquiryAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "city", "status", "created_at")
    list_filter = ("status", "city", "created_at")
    search_fields = ("full_name", "phone", "city", "other_service")
    readonly_fields = ("created_at", "updated_at")