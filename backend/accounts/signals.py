"""Signals used by the accounts app."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=get_user_model())
def ensure_user_profile(sender, instance, created, **kwargs):
    """Create a profile automatically for every user."""

    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Ensure the profile exists for legacy users
        UserProfile.objects.get_or_create(user=instance)
