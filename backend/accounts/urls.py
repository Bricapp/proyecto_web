"""URL configuration for authentication endpoints."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AuthConfigView,
    ChangePasswordView,
    EmailTokenObtainPairView,
    GoogleLoginView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)

urlpatterns = [
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("login/google/", GoogleLoginView.as_view(), name="google_login"),
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="auth_me"),
    path("password/change/", ChangePasswordView.as_view(), name="auth_change_password"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="auth_password_reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="auth_password_reset_confirm"),
    path("config/", AuthConfigView.as_view(), name="auth_config"),
]
