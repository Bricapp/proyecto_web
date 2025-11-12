"""Viewsets and API endpoints for finance module."""
from __future__ import annotations

from decimal import Decimal

from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Gasto, Ingreso, Partida
from .serializers import (
    GastoSerializer,
    IngresoSerializer,
    PartidaSerializer,
    ResumenFinancieroSerializer,
)


class BaseOwnerViewSet(viewsets.ModelViewSet):
    """Base viewset that restricts access to the authenticated user's records."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        assert self.queryset is not None, "queryset must be defined"
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):  # type: ignore[override]
        serializer.save(usuario=self.request.user)

    def perform_update(self, serializer):  # type: ignore[override]
        serializer.save(usuario=self.request.user)


class PartidaViewSet(BaseOwnerViewSet):
    """CRUD for budget categories."""

    serializer_class = PartidaSerializer
    queryset = Partida.objects.all()

    def get_serializer_context(self):  # type: ignore[override]
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class GastoViewSet(BaseOwnerViewSet):
    """CRUD for expenses."""

    serializer_class = GastoSerializer
    queryset = Gasto.objects.select_related("partida")

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset().select_related("partida")
        fecha_desde = self.request.query_params.get("desde")
        fecha_hasta = self.request.query_params.get("hasta")
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        partida_id = self.request.query_params.get("partida")
        if partida_id:
            queryset = queryset.filter(Q(partida_id=partida_id) | Q(partida__isnull=True))
        return queryset


class IngresoViewSet(BaseOwnerViewSet):
    """CRUD for incomes."""

    serializer_class = IngresoSerializer
    queryset = Ingreso.objects.all()

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        fecha_desde = self.request.query_params.get("desde")
        fecha_hasta = self.request.query_params.get("hasta")
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        return queryset


class ResumenFinancieroView(APIView):
    """Return key metrics and suggestions for the dashboard."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hoy = timezone.localdate()
        inicio_mes = hoy.replace(day=1)
        if inicio_mes.month == 12:
            siguiente_mes = inicio_mes.replace(year=inicio_mes.year + 1, month=1)
        else:
            siguiente_mes = inicio_mes.replace(month=inicio_mes.month + 1)

        gastos = list(
            Gasto.objects.filter(
                usuario=request.user,
                fecha__gte=inicio_mes,
                fecha__lt=siguiente_mes,
            ).select_related("partida")
        )
        ingresos = list(
            Ingreso.objects.filter(
                usuario=request.user,
                fecha__gte=inicio_mes,
                fecha__lt=siguiente_mes,
            )
        )
        partidas = list(Partida.objects.filter(usuario=request.user))

        sugerencias: list[str] = []
        total_ingresos = sum((ingreso.monto for ingreso in ingresos), Decimal("0.00"))
        total_gastos = sum((gasto.monto for gasto in gastos), Decimal("0.00"))
        saldo = total_ingresos - total_gastos

        if total_ingresos > 0:
            porcentaje_uso = (total_gastos / total_ingresos * Decimal("100")).quantize(Decimal("0.01"))
            if porcentaje_uso <= Decimal("85"):
                sugerencias.append(
                    "Vas administrando bien tu dinero. Considera destinar parte del excedente a un fondo de inversión."
                )
            elif porcentaje_uso > Decimal("100"):
                sugerencias.append(
                    "Has gastado más de lo que ingresó este mes. Revisa tus gastos variables para realizar ajustes."
                )
        else:
            sugerencias.append("Aún no registras ingresos este mes. Recuerda ingresarlos para obtener un balance realista.")

        if saldo > Decimal("0"):
            sugerencias.append(
                "Excelente, tienes un saldo positivo. Define un objetivo de ahorro para mantener esta tendencia."
            )
        elif saldo < Decimal("0"):
            sugerencias.append(
                "Tu saldo es negativo. Intenta posponer compras no esenciales para equilibrar tus finanzas."
            )

        for partida in partidas:
            disponible = partida.disponible_mes()
            if disponible < Decimal("0"):
                sugerencias.append(
                    f"Has superado el presupuesto de {partida.nombre} en ${abs(disponible):,.2f}. Considera reducir gastos en esta categoría."
                )
            elif disponible <= partida.monto_asignado * Decimal("0.1"):
                sugerencias.append(
                    f"Estás por alcanzar el límite de {partida.nombre}. Monitorea tus próximos gastos en esta partida."
                )

        resumen_data = ResumenFinancieroSerializer.build(
            ingresos=ingresos,
            gastos=gastos,
            partidas=partidas,
            sugerencias=sugerencias,
        )
        serializer = ResumenFinancieroSerializer(data=resumen_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
