from django.contrib import admin
from .models import Category, Product, ProductImage, ProductSpecification


# 🔹 Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    fields = ("name", "slug", "parent", "image", "is_active")

# 🔹 Product Image Inline
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


# 🔹 Product Specification Inline
class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1


# 🔹 Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_active", "is_featured")
    list_filter = ("is_active", "is_featured", "category")
    search_fields = ("name", "sku")

    prepopulated_fields = {"slug": ("name",)}

    inlines = [ProductImageInline, ProductSpecificationInline]

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "slug", "sku", "category")
        }),

        ("Pricing & Stock", {
            "fields": ("price", "original_price", "stock")
        }),

        ("Descriptions", {
            "fields": ("short_description", "description")
        }),

        ("Product Details", {
            "fields": ("material_summary", "finish")
        }),

        ("Dimensions (cm)", {
            "fields": ("width_cm", "depth_cm", "height_cm")
        }),

        ("Shipping", {
            "fields": ("estimated_shipping_text",)
        }),

        ("Status", {
            "fields": ("is_active", "is_featured")
        }),
    )