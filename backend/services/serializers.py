from rest_framework import serializers
from .models import ServiceEnquiry


class ServiceEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceEnquiry
        fields = [
            "id",
            "full_name",
            "phone",
            "city",
            "selected_services",
            "other_service",
            "requirements",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain digits only.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_selected_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Selected services must be a list.")
        return value

    def validate(self, attrs):
        selected_services = attrs.get("selected_services", [])
        other_service = attrs.get("other_service", "").strip()

        if not selected_services and not other_service:
            raise serializers.ValidationError(
                "Please select at least one service or write another service."
            )

        return attrs