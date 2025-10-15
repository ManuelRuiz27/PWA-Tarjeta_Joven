# Tarjeta Joven API

Backend construido con [NestJS](https://nestjs.com/) + [Fastify](https://fastify.dev/), [Prisma](https://www.prisma.io/) y PostgreSQL para la Tarjeta Joven.

## Requisitos previos

* Docker y Docker Compose
* Node.js 20 (para desarrollo local sin contenedores)

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores según tu entorno. Incluye credenciales de base de datos, secretos JWT y parámetros de OTP (TTL, máximo de reenvíos y cooldown).

```bash
cp .env.example .env
```

## Ejecutar con Docker

Compila e inicia los servicios con Docker Compose:

```bash
docker compose up -d --build
```

Esto levantará una base de datos PostgreSQL y el backend en `http://localhost:8080`.

## Migraciones y seed

Si trabajas de forma local (sin Docker) instala dependencias y ejecuta:

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

Con Docker Compose las migraciones se aplican automáticamente al iniciar el contenedor (`npx prisma migrate deploy`). Para ejecutar el seed manualmente dentro del contenedor:

```bash
docker compose exec backend npm run db:seed
```

## Documentación Swagger

La documentación interactiva está disponible en `http://localhost:8080/docs`. El documento JSON puede obtenerse desde `http://localhost:8080/docs-json`.

## Endpoints principales

Todos los endpoints están prefijados con `/api/v1`.

* `GET /api/v1/healthz` – Verifica el estado del servicio.
* `GET /api/v1/version` – Obtiene la versión y commit desplegado.
* `POST /api/v1/auth/otp/send` – Solicita un OTP para un CURP.
* `POST /api/v1/auth/otp/verify` – Verifica el OTP y entrega tokens JWT.
* `POST /api/v1/auth/register` – Registro de usuario (multipart/form-data).
* `POST /api/v1/auth/refresh` – Renueva el token de acceso.
* `POST /api/v1/auth/logout` – Cierra sesión.
* `GET /api/v1/me` – Información del usuario autenticado.
* `GET /api/v1/catalog` – Catálogo paginado de comercios.
* `GET /api/v1/catalog/:id` – Detalle de comercio.
* `POST /api/v1/push/subscriptions` – Registrar una suscripción push.
* `DELETE /api/v1/push/subscriptions/:id` – Eliminar suscripción push.

## Desarrollo local

```bash
npm install
npm run prisma:migrate
npm run start:dev
```

La API estará disponible en `http://localhost:8080`. Ejecuta los seeds con `npm run db:seed`.
