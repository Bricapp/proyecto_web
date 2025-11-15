"""Authentication views."""
from __future__ import annotations

import json
import os
from urllib import error as urllib_error
from urllib import parse as urllib_parse
from urllib import request as urllib_request

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import UserProfile
from .serializers import (
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .utils import generate_unique_username

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Authenticate users using their email address."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop(self.username_field)
        self.fields["email"] = serializers.EmailField()

    def validate(self, attrs: dict) -> dict:
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise AuthenticationFailed("Debes proporcionar correo y contraseña.")

        try:
            user = User.objects.get(email__iexact=email.strip())
        except User.DoesNotExist as exc:  # pragma: no cover - handled as auth failure
            raise AuthenticationFailed("Correo o contraseña incorrectos.") from exc

        attrs["username"] = user.get_username()

        try:
            data = super().validate(attrs)
        except AuthenticationFailed as exc:  # pragma: no cover - custom message
            raise AuthenticationFailed("Correo o contraseña incorrectos.") from exc

        data["user"] = UserSerializer(self.user, context=self.context).data
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    """Return or update the authenticated user's profile information."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Allow a logged-in user to change their password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["password_nuevo"])
        request.user.save(update_fields=["password"])

        return Response({"detail": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Send a password reset link via email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip()
        frontend_base = getattr(settings, "FRONTEND_PASSWORD_RESET_URL", None) or os.environ.get(
            "FRONTEND_PASSWORD_RESET_URL"
        )
        if not frontend_base:
            frontend_base = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/recuperar-clave"

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Respond with success to avoid leaking which emails are registered.
            return Response(
                {"detail": "Si el correo está registrado, enviaremos instrucciones para recuperar tu contraseña."}
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{frontend_base.rstrip('/')}/{uid}/{token}"
        subject = "Recuperación de contraseña"
        message = (
            "Hola,\n\n"
            "Recibimos una solicitud para restablecer tu contraseña en Finova. "
            "Si tú la hiciste, ingresa al siguiente enlace para crear una nueva contraseña:\n\n"
            f"{reset_link}\n\n"
            "Si no solicitaste este cambio, puedes ignorar este mensaje."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response(
            {"detail": "Si el correo está registrado, enviaremos instrucciones para recuperar tu contraseña."}
        )


class PasswordResetConfirmView(APIView):
    """Allow setting a new password using the token from the email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (ValueError, User.DoesNotExist, TypeError, OverflowError) as exc:
            raise ValidationError({"detail": "El enlace de recuperación no es válido."}) from exc

        if not default_token_generator.check_token(user, token):
            raise ValidationError({"detail": "El enlace de recuperación no es válido o expiró."})

        user.set_password(password)
        user.save(update_fields=["password"])

        return Response({"detail": "Tu contraseña fue actualizada correctamente."})


class RegisterView(APIView):
    """Create a new user using email and password credentials."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context={"request": request}).data,
        }
        return Response(data, status=status.HTTP_201_CREATED)


class GoogleLoginView(APIView):
    """Handle Google OAuth login exchanging an ID token for JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        id_token_value = request.data.get("id_token")
        client_id = getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", None)
        if not id_token_value or not isinstance(id_token_value, str):
            raise ValidationError({"id_token": "Debes proporcionar el token de Google."})
        if not client_id:
            raise ValidationError({"detail": "Google OAuth no está configurado."})

        tokeninfo_url = (
            "https://oauth2.googleapis.com/tokeninfo?id_token="
            + urllib_parse.quote(id_token_value)
        )
        try:
            with urllib_request.urlopen(tokeninfo_url, timeout=5) as response:
                if response.status != 200:
                    raise ValidationError({"detail": "Token de Google inválido."})
                payload = json.loads(response.read().decode("utf-8"))
        except (urllib_error.URLError, ValueError) as exc:
            raise ValidationError({"detail": "No se pudo validar el token de Google."}) from exc

        audience = payload.get("aud")
        if client_id and audience != client_id:
            raise ValidationError({"detail": "Token de Google inválido para esta aplicación."})

        email = payload.get("email")
        email_verified = payload.get("email_verified")
        given_name = payload.get("given_name") or ""
        family_name = payload.get("family_name") or ""
        picture = payload.get("picture") or ""

        is_verified = (
            email_verified is True
            or (isinstance(email_verified, str) and email_verified.lower() == "true")
        )

        if not email or not is_verified:
            raise ValidationError({"detail": "El correo de Google no fue verificado."})

        user = User.objects.filter(email__iexact=email).first()
        created = False
        if user is None:
            created = True
            user = User()
            username = generate_unique_username(email.split("@")[0])
            user.username = username
            user.email = email
            user.first_name = given_name
            user.last_name = family_name
            user.set_unusable_password()
            user.save()
        if not created:
            updated = False
            email_updated = False
            if given_name and user.first_name != given_name:
                user.first_name = given_name
                updated = True
            if family_name and user.last_name != family_name:
                user.last_name = family_name
                updated = True
            if user.email != email:
                user.email = email
                updated = True
                email_updated = True
            if updated:
                fields = ["first_name", "last_name"]
                if email_updated:
                    fields.append("email")
                user.save(update_fields=fields)

        profile, _created = UserProfile.objects.get_or_create(user=user)
        if picture:
            profile.google_avatar_url = picture
            profile.save(update_fields=["google_avatar_url"])

        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context={"request": request}).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class AuthConfigView(APIView):
    """Expose public authentication configuration values."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "google_client_id": getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", ""),
                "recaptcha_site_key": getattr(settings, "GOOGLE_RECAPTCHA_SITE_KEY", ""),
            }
        )
