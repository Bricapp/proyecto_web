"""Authentication views."""
from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChangePasswordSerializer, UserSerializer


class MeView(APIView):
    """Return the authenticated user's profile information."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
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
