from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductSpecification
from .media import get_media_url


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        return get_media_url(obj.image, request)

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "sort_order"]

    def get_image(self, obj):
        request = self.context.get("request")
        return get_media_url(obj.image, request)


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ["id", "name", "value", "sort_order"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "short_description",
            "price",
            "original_price",
            "discount_percentage",
            "stock",
            "is_featured",
            "category",
            "primary_image",
            "images",
        ]

    def get_primary_image(self, obj):
        request = self.context.get("request")
        image_obj = obj.images.filter(is_primary=True).first() or obj.images.first()

        if image_obj and image_obj.image:
            return get_media_url(image_obj.image, request)

        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
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
            "images",
            "specifications",
        ]
