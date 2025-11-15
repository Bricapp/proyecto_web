"""Database models for the accounts app."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """Additional information stored for each user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField("Teléfono", max_length=30, blank=True)
    avatar = models.FileField("Foto de perfil", upload_to="avatars/", blank=True, null=True)
    google_avatar_url = models.URLField("Avatar de Google", blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "perfil de usuario"
        verbose_name_plural = "perfiles de usuario"

    def __str__(self) -> str:  # pragma: no cover - representación simple
        return f"Perfil de {self.user.get_full_name() or self.user.get_username()}"

    @property
    def avatar_url(self) -> str | None:
        """Return the URL that should be used for the avatar."""

        if self.avatar:
            return self.avatar.url
        if self.google_avatar_url:
            return self.google_avatar_url
        return None
