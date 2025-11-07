# Proyecto Monorepo: Django + Next.js

Este repositorio contiene la estructura base de un monorepo con un backend en Django 5 + Django REST Framework y un frontend en Next.js 14 con TypeScript.

## Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- `pip` y `npm`/`yarn`

## Backend (`backend/`)

1. Crea un entorno virtual e instala dependencias:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

2. Crea un archivo `.env` basado en `.env.example` y ajusta las credenciales de PostgreSQL:

   ```bash
   cp .env.example .env
   ```

3. Ejecuta las migraciones y levanta el servidor de desarrollo:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

4. Ejecuta los tests con Pytest:

   ```bash
   pytest
   ```

5. (Opcional) Instala y ejecuta los hooks de `pre-commit` en la raíz del repositorio:

   ```bash
   pre-commit install
   pre-commit run --all-files
   ```

### Endpoints disponibles

Los endpoints de autenticación expuestos en el backend son:

- `POST /api/v1/auth/login/` – Obtiene el par de tokens (access/refresh).
- `POST /api/v1/auth/refresh/` – Refresca el token de acceso.
- `GET /api/v1/auth/me/` – Devuelve la información del usuario autenticado.

## Frontend (`frontend/`)

1. Instala las dependencias:

   ```bash
   cd frontend
   npm install
   ```

2. Crea un archivo `.env.local` basado en `.env.local.example` para apuntar al backend:

   ```bash
   cp .env.local.example .env.local
   ```

3. Inicia el servidor de desarrollo de Next.js:

   ```bash
   npm run dev
   ```

La aplicación incluye las páginas `/login` para autenticación y `/perfil` para mostrar la información del usuario autenticado consumiendo el endpoint `me` del backend.

## Estructura del repositorio

```
backend/
  core/            # Proyecto principal de Django
  accounts/        # App con endpoints de autenticación
  tests/           # Tests básicos con Pytest
frontend/
  app/             # App Router de Next.js (páginas /login y /perfil)
  components/      # Componentes reutilizables (formularios, providers)
  lib/             # Funciones para consumir la API del backend
```

## Formato y estilo

- El backend cuenta con configuración de `pre-commit` para Black, Isort y Ruff.
- El frontend utiliza ESLint con la configuración oficial de Next.js, Tailwind CSS y React Query para la comunicación con el backend.

¡Listo! Con estas bases puedes continuar desarrollando las funcionalidades del proyecto.
