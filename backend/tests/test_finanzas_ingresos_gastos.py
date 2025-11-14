import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from finanzas.models import Partida


@pytest.mark.django_db
def test_create_gasto_accepts_null_optional_fields(settings):
    settings.ALLOWED_HOSTS.append("testserver")
    client = APIClient()
    user = get_user_model().objects.create_user(
        username="tester", password="secret"
    )
    partida = Partida.objects.create(
        usuario=user,
        nombre="Servicios",
        monto_asignado=Decimal("100.00"),
    )
    client.force_authenticate(user=user)
    payload = {
        "partida": partida.pk,
        "monto": "25.50",
        "fecha": str(timezone.localdate()),
        "tipo": "variable",
        "categoria": None,
        "observacion": None,
    }

    response = client.post("/api/v1/gastos/", payload, format="json")

    assert response.status_code == 201, response.content
    data = response.json()
    assert data["categoria"] == ""
    assert data["observacion"] == ""


@pytest.mark.django_db
def test_create_ingreso_accepts_null_optional_fields(settings):
    settings.ALLOWED_HOSTS.append("testserver")
    client = APIClient()
    user = get_user_model().objects.create_user(
        username="ingresos", password="secret"
    )
    client.force_authenticate(user=user)
    payload = {
        "monto": "1200.00",
        "fecha": str(timezone.localdate()),
        "tipo": "fijo",
        "observacion": None,
    }

    response = client.post("/api/v1/ingresos/", payload, format="json")

    assert response.status_code == 201, response.content
    data = response.json()
    assert data["observacion"] == ""
