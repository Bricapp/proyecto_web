"""Admin registrations for accounts app."""
from __future__ import annotations

from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "updated_at")
    search_fields = ("user__username", "user__email", "phone")
    readonly_fields = ("updated_at",)
