"""URL configuration for finance endpoints."""
from __future__ import annotations

from django.urls import include, path
from rest_framework import routers

from .views import GastoViewSet, IngresoViewSet, PartidaViewSet, ResumenFinancieroView

router = routers.DefaultRouter()
router.register(r"gastos", GastoViewSet, basename="gasto")
router.register(r"ingresos", IngresoViewSet, basename="ingreso")
router.register(r"partidas", PartidaViewSet, basename="partida")

urlpatterns = [
    path("", include(router.urls)),
    path("resumen/", ResumenFinancieroView.as_view(), name="resumen_financiero"),
]
