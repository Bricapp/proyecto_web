"""Utility helpers for the accounts app."""
from __future__ import annotations

import json
import secrets
import unicodedata
from typing import Any
from urllib import error as urllib_error
from urllib import parse as urllib_parse
from urllib import request as urllib_request

from django.conf import settings
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


def verify_recaptcha_token(token: str, *, remote_ip: str | None = None) -> bool:
    """Validate a Google reCAPTCHA token."""

    secret_key = getattr(settings, "GOOGLE_RECAPTCHA_SECRET_KEY", "")
    if not secret_key:
        raise RuntimeError("Google reCAPTCHA secret key is not configured.")

    payload: dict[str, Any] = {
        "secret": secret_key,
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    data = urllib_parse.urlencode(payload).encode("utf-8")
    request = urllib_request.Request(
        "https://www.google.com/recaptcha/api/siteverify",
        data=data,
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=5) as response:
            raw = response.read().decode("utf-8")
            verification = json.loads(raw)
    except (urllib_error.URLError, ValueError):
        return False

    if not verification.get("success"):
        return False

    score = verification.get("score")
    if score is not None:
        try:
            min_score = float(getattr(settings, "GOOGLE_RECAPTCHA_MIN_SCORE", 0.5))
        except (TypeError, ValueError):
            min_score = 0.5
        if float(score) < min_score:
            return False

    return True

