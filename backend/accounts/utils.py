"""Utility helpers for the accounts app."""
from __future__ import annotations

import secrets
import unicodedata

from django.contrib.auth import get_user_model

User = get_user_model()


def slugify_username(value: str) -> str:
    """Create a slug-like string that can be used as username."""

    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = ascii_value.lower()

    allowed = "abcdefghijklmnopqrstuvwxyz0123456789_"
    cleaned = [char if char in allowed else "_" for char in ascii_value]
    collapsed = "".join(cleaned).strip("_")
    return collapsed or secrets.token_hex(4)


def generate_unique_username(seed: str) -> str:
    """Generate a username derived from ``seed`` ensuring it is unique."""

    base_username = slugify_username(seed)
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    return username

