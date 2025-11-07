import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_me_requires_authentication() -> None:
    client = APIClient()
    response = client.get("/api/v1/auth/me/")
    assert response.status_code == 401
