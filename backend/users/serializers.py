import random
import phonenumbers
from phonenumbers import NumberParseException
from rest_framework import serializers
from .models import User, OTP, Profile, Address
from django.conf import settings


class OTPSendSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        value = value.strip()

        try:
            parsed = phonenumbers.parse(value, "IN")
            if not phonenumbers.is_valid_number(parsed):
                raise serializers.ValidationError("Invalid phone number")
        except NumberParseException:
            raise serializers.ValidationError("Invalid phone format")

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164
        )

    def create(self, validated_data):
        phone = validated_data["phone"]

        OTP.objects.filter(
            phone=phone,
            purpose="login",
            is_verified=False,
        ).delete()

        code = str(random.randint(100000, 999999))

        otp = OTP.objects.create(
            phone=phone,
            code=code,
            purpose="login",
        )
        
            # DEV ONLY: print OTP
        if settings.DEBUG:
            print(f"OTP for {phone}: {code}")

        return otp


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

    def validate_phone(self, value):
        value = value.strip()

        try:
            parsed = phonenumbers.parse(value, "IN")
            if not phonenumbers.is_valid_number(parsed):
                raise serializers.ValidationError("Invalid phone number")
        except NumberParseException:
            raise serializers.ValidationError("Invalid phone format")

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164
        )

    def validate_code(self, value):
        value = value.strip()

        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be a 6-digit number.")

        return value

    def validate(self, attrs):
        phone = attrs["phone"]
        code = attrs["code"]

        try:
            otp = OTP.objects.filter(
                phone=phone,
                purpose="login",
                is_verified=False,
            ).latest("created_at")
        except OTP.DoesNotExist:
            raise serializers.ValidationError("No OTP found. Please resend OTP.")

        if otp.is_blocked:
            raise serializers.ValidationError("OTP blocked. Please resend OTP.")

        if otp.is_expired:
            raise serializers.ValidationError("OTP has expired. Please resend OTP.")

        if otp.code != code:
            otp.attempts += 1

            if otp.attempts >= 3:
                otp.is_blocked = True
                otp.save(update_fields=["attempts", "is_blocked"])
                raise serializers.ValidationError(
                    "OTP blocked after 3 failed attempts. Please resend OTP."
                )

            otp.save(update_fields=["attempts"])
            remaining = 3 - otp.attempts
            raise serializers.ValidationError(
                f"Invalid OTP. {remaining} attempt(s) remaining."
            )

        attrs["otp_obj"] = otp
        return attrs

    def create(self, validated_data):
        phone = validated_data["phone"]
        otp = validated_data["otp_obj"]

        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={"is_phone_verified": True},
        )

        if not created and not user.is_phone_verified:
            user.is_phone_verified = True
            user.save(update_fields=["is_phone_verified"])

        otp.is_verified = True
        otp.save(update_fields=["is_verified"])

        Profile.objects.get_or_create(
            user=user,
            defaults={
                "full_name": "",
                "contact_number": phone,
            },
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "full_name", "email", "contact_number", "phone"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "full_name",
            "phone",
            "address_line",
            "landmark",
            "city",
            "state",
            "pincode",
            "is_default",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value):
        value = value.strip()

        try:
            parsed = phonenumbers.parse(value, "IN")
            if not phonenumbers.is_valid_number(parsed):
                raise serializers.ValidationError("Invalid phone number")
        except NumberParseException:
            raise serializers.ValidationError("Invalid phone format")

        return phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164
        )

    def create(self, validated_data):
        user = self.context["request"].user

        if validated_data.get("is_default"):
            Address.objects.filter(user=user, is_default=True).update(is_default=False)

        return Address.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user

        if validated_data.get("is_default"):
            Address.objects.filter(user=user, is_default=True).exclude(id=instance.id).update(is_default=False)

        return super().update(instance, validated_data)