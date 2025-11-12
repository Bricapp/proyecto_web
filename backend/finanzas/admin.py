"""Admin registrations for finance models."""
from __future__ import annotations

from django.contrib import admin

from .models import Gasto, Ingreso, Partida


@admin.register(Partida)
class PartidaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "usuario", "tipo", "monto_asignado", "created_at")
    search_fields = ("nombre", "usuario__username")
    list_filter = ("tipo",)


@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "partida", "categoria", "monto", "fecha", "tipo")
    list_filter = ("tipo", "fecha", "partida")
    search_fields = ("usuario__username", "categoria", "observacion")


@admin.register(Ingreso)
class IngresoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "monto", "fecha", "tipo")
    list_filter = ("tipo", "fecha")
    search_fields = ("usuario__username", "observacion")
