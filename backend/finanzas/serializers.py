"""Serializers for finance API endpoints."""
from __future__ import annotations

from collections import defaultdict
from datetime import date
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from .models import Gasto, Ingreso, Partida


class PartidaSerializer(serializers.ModelSerializer[Partida]):
    """Serializer for budget items including calculated monthly amounts."""

    gastado_mes = serializers.SerializerMethodField()
    disponible_mes = serializers.SerializerMethodField()

    class Meta:
        model = Partida
        fields = [
            "id",
            "nombre",
            "tipo",
            "monto_asignado",
            "gastado_mes",
            "disponible_mes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("created_at", "updated_at", "gastado_mes", "disponible_mes")

    def _rango_mes(self, referencia: date | None = None) -> tuple[date, date]:
        referencia = referencia or timezone.localdate()
        inicio = referencia.replace(day=1)
        if inicio.month == 12:
            fin = inicio.replace(year=inicio.year + 1, month=1)
        else:
            fin = inicio.replace(month=inicio.month + 1)
        return inicio, fin

    def get_gastado_mes(self, obj: Partida) -> Decimal:
        request = self.context.get("request")
        usuario = getattr(request, "user", None)
        inicio, fin = self._rango_mes()
        queryset = obj.gastos.filter(fecha__gte=inicio, fecha__lt=fin)
        if usuario is not None and usuario.is_authenticated:
            queryset = queryset.filter(usuario=usuario)
        total = queryset.aggregate(total=Sum("monto")).get("total")
        if total is None:
            return Decimal("0.00")
        if not isinstance(total, Decimal):
            total = Decimal(str(total))
        return total.quantize(Decimal("0.01"))

    def get_disponible_mes(self, obj: Partida) -> Decimal:
        gastado = self.get_gastado_mes(obj)
        return obj.monto_asignado - gastado


class GastoSerializer(serializers.ModelSerializer[Gasto]):
    """Serializer for expense records."""

    partida_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Gasto
        fields = [
            "id",
            "partida",
            "partida_nombre",
            "monto",
            "fecha",
            "tipo",
            "categoria",
            "observacion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("created_at", "updated_at", "partida_nombre")

    def get_partida_nombre(self, obj: Gasto) -> str | None:
        if obj.partida:
            return obj.partida.nombre
        return obj.categoria or None

    def validate(self, attrs: dict) -> dict:
        categoria = attrs.get("categoria")
        partida = attrs.get("partida")
        if not categoria and not partida:
            raise serializers.ValidationError(
                "Debes seleccionar una partida o indicar una categoría para el gasto."
            )
        return super().validate(attrs)


class IngresoSerializer(serializers.ModelSerializer[Ingreso]):
    """Serializer for income records."""

    class Meta:
        model = Ingreso
        fields = [
            "id",
            "monto",
            "fecha",
            "tipo",
            "observacion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("created_at", "updated_at")


class ResumenFinancieroSerializer(serializers.Serializer):
    """Serializer that structures the dashboard summary response."""

    total_ingresos = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_gastos = serializers.DecimalField(max_digits=12, decimal_places=2)
    saldo = serializers.DecimalField(max_digits=12, decimal_places=2)
    ahorro_porcentaje = serializers.DecimalField(max_digits=5, decimal_places=2)
    gastos_por_categoria = serializers.DictField(
        child=serializers.DecimalField(max_digits=12, decimal_places=2)
    )
    partidas = PartidaSerializer(many=True)
    sugerencias = serializers.ListField(child=serializers.CharField())
    ingresos_recientes = IngresoSerializer(many=True)
    gastos_recientes = GastoSerializer(many=True)

    @staticmethod
    def build(
        *,
        ingresos: list[Ingreso],
        gastos: list[Gasto],
        partidas: list[Partida],
        sugerencias: list[str],
    ) -> dict:
        total_ingresos = sum((ingreso.monto for ingreso in ingresos), Decimal("0.00"))
        total_gastos = sum((gasto.monto for gasto in gastos), Decimal("0.00"))
        saldo = total_ingresos - total_gastos
        ahorro_porcentaje = Decimal("0.00")
        if total_ingresos > 0:
            ahorro_porcentaje = (saldo / total_ingresos * Decimal("100")).quantize(Decimal("0.01"))

        categorias: dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
        for gasto in gastos:
            key = gasto.partida.nombre if gasto.partida else (gasto.categoria or "Otros")
            categorias[key] += gasto.monto

        return {
            "total_ingresos": total_ingresos,
            "total_gastos": total_gastos,
            "saldo": saldo,
            "ahorro_porcentaje": ahorro_porcentaje,
            "gastos_por_categoria": dict(categorias),
            "partidas": partidas,
            "sugerencias": sugerencias,
            "ingresos_recientes": ingresos[:5],
            "gastos_recientes": gastos[:5],
        }
