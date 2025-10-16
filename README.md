# Tarjeta Joven API

Backend para la Tarjeta Joven construido con [NestJS](https://nestjs.com/) + [Fastify](https://fastify.dev/), [Prisma](https://www.prisma.io/) y PostgreSQL. Expone un API REST para autenticación por OTP, administración de usuarios y catálogo de comercios, además de endpoints para registro de notificaciones push.

## Requisitos

* Docker 24+ y Docker Compose v2
* Node.js 20 (usa `.nvmrc` para alinearte en desarrollo local)
* npm 10+

## Configuración de variables de entorno

Copia el archivo `.env.example` y ajusta los valores según tu entorno antes de iniciar los servicios:

```bash
cp .env.example .env
```

Las variables principales son:

| Variable | Descripción | Valor por defecto sugerido |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución. | `development` |
| `PORT` | Puerto expuesto por la API. | `8080` |
| `LOG_LEVEL` | Nivel mínimo de logs (`fatal`, `error`, `warn`, `log`, `debug`, `verbose`). | `debug` |
| `DATABASE_URL` | Cadena de conexión utilizada por Prisma. | `postgresql://tjuser:tjpass@db:5432/tjdb?schema=public` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos usados para firmar tokens JWT. | Cambia ambos por valores robustos |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Tiempo de vida de los tokens. | `900s` / `7d` |
| `OTP_*` | Configuración de OTP (TTL, reintentos y cooldown). | Valores de ejemplo en `.env.example` |
| `RATE_LIMIT_*` | Límites globales y específicos de OTP. | Valores de ejemplo en `.env.example` |
| `CORS_ORIGIN` / `CORS_CREDENTIALS` | Orígenes permitidos para CORS. | `http://localhost:4200` / `true` |
| `STORAGE_DRIVER` | Driver de almacenamiento de archivos. Actualmente solo `local`. | `local` |
| `SENTRY_DSN` | DSN de Sentry para reportar errores. Déjalo vacío para desactivar. | — |

## Ejecutar con Docker

Compila la imagen y levanta los servicios (base de datos y API) en segundo plano:

```bash
docker compose up -d --build
```

* La API quedará disponible en `http://localhost:8080`.
* Las migraciones se aplican automáticamente en el arranque (`npx prisma migrate deploy`).
* El volumen `./uploads` se comparte con el contenedor para persistir archivos de usuarios.

Para revisar los logs del backend:

```bash
docker compose logs -f backend
```

Detén y elimina los contenedores cuando termines:

```bash
docker compose down
```

## Migraciones y seed

Si trabajas sin contenedores, instala dependencias, ejecuta migraciones y corre el seed:

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

Dentro del contenedor puedes ejecutar el seed manualmente:

```bash
docker compose exec backend npm run db:seed
```

## Documentación Swagger

La documentación interactiva está disponible en `http://localhost:8080/docs`. El documento JSON puede obtenerse en `http://localhost:8080/docs-json`.

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

Para ejecutar la API en modo desarrollo con recarga automática:

```bash
npm install
npm run prisma:migrate
npm run start:dev
```

La API estará disponible en `http://localhost:8080`. Ejecuta los seeds con `npm run db:seed`.
