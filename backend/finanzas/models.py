"""Financial domain models."""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract base model that tracks creation and update timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Partida(TimeStampedModel):
    """Budget category assigned to a user."""

    class Tipo(models.TextChoices):
        FIJO = "fijo", "Gasto fijo"
        VARIABLE = "variable", "Gasto variable"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="partidas",
    )
    nombre = models.CharField(max_length=120)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.VARIABLE)
    monto_asignado = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["nombre"]
        unique_together = ("usuario", "nombre")
        verbose_name = "partida"
        verbose_name_plural = "partidas"

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.nombre} ({self.usuario})"

    def gasto_total_mes(self, fecha: date | None = None) -> Decimal:
        """Return the total spent for the current month."""

        fecha = fecha or timezone.localdate()
        inicio_mes = fecha.replace(day=1)
        if inicio_mes.month == 12:
            siguiente_mes = inicio_mes.replace(year=inicio_mes.year + 1, month=1)
        else:
            siguiente_mes = inicio_mes.replace(month=inicio_mes.month + 1)

        return (
            self.gastos.filter(fecha__gte=inicio_mes, fecha__lt=siguiente_mes)
            .aggregate(total=models.Sum("monto"))
            .get("total")
            or Decimal("0.00")
        )

    def disponible_mes(self, fecha: date | None = None) -> Decimal:
        """Return remaining amount for the month."""

        return self.monto_asignado - self.gasto_total_mes(fecha)


class Gasto(TimeStampedModel):
    """Represents an expense."""

    class Tipo(models.TextChoices):
        FIJO = "fijo", "Fijo"
        VARIABLE = "variable", "Variable"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gastos",
    )
    partida = models.ForeignKey(
        Partida,
        on_delete=models.SET_NULL,
        related_name="gastos",
        null=True,
        blank=True,
    )
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateField(default=timezone.localdate)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.VARIABLE)
    categoria = models.CharField(max_length=120, blank=True)
    observacion = models.TextField(blank=True)

    class Meta:
        ordering = ["-fecha", "-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        categoria = self.partida.nombre if self.partida else (self.categoria or "General")
        return f"{categoria}: {self.monto}"


class Ingreso(TimeStampedModel):
    """Represents an income."""

    class Tipo(models.TextChoices):
        FIJO = "fijo", "Fijo"
        EVENTUAL = "eventual", "Eventual"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ingresos",
    )
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateField(default=timezone.localdate)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.FIJO)
    observacion = models.TextField(blank=True)

    class Meta:
        ordering = ["-fecha", "-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"Ingreso {self.monto} ({self.get_tipo_display()})"
