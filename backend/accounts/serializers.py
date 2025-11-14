"""Serializers for authentication endpoints."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer[User]):
    """Serializer that exposes and updates the authenticated user information."""

    full_name = serializers.SerializerMethodField()
    phone = serializers.CharField(source="profile.phone", allow_blank=True, required=False)
    avatar_url = serializers.SerializerMethodField()
    photo = serializers.FileField(
        source="profile.avatar", allow_null=True, required=False, write_only=True
    )
    created_at = serializers.DateTimeField(source="date_joined", read_only=True)
    remove_photo = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "avatar_url",
            "photo",
            "created_at",
            "remove_photo",
        ]
        read_only_fields = ("id", "username", "email", "avatar_url", "full_name", "created_at")

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name().strip() or obj.get_username()

    def get_avatar_url(self, obj: User) -> str | None:
        profile = getattr(obj, "profile", None)
        if profile is None:
            return None
        avatar_url = profile.avatar_url
        request = self.context.get("request")
        if avatar_url and profile.avatar and request is not None:
            return request.build_absolute_uri(avatar_url)
        return avatar_url

    def update(self, instance: User, validated_data: dict) -> User:
        profile_data = validated_data.pop("profile", {})
        remove_photo = validated_data.pop("remove_photo", False)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile = getattr(instance, "profile", None)
        if profile:
            if "phone" in profile_data:
                profile.phone = profile_data.get("phone", "")
            if "avatar" in profile_data and profile_data["avatar"] is not None:
                profile.avatar = profile_data["avatar"]
            if remove_photo:
                profile.avatar.delete(save=False)
                profile.avatar = None
            profile.save()

        return instance

    def to_representation(self, instance: User) -> dict:
        data = super().to_representation(instance)
        if data.get("phone") in {"", None}:
            data["phone"] = None
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Validate password change payload."""

    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True)

    def validate_password_actual(self, value: str) -> str:
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate_password_nuevo(self, value: str) -> str:
        validate_password(value)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Validate a password reset request."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validate the confirmation payload for password reset."""

    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value
