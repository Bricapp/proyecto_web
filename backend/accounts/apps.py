from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self) -> None:  # pragma: no cover - side effects only
        from . import signals  # noqa: F401 - ensure signal handlers are registered

        return super().ready()
