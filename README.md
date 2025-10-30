# Tarjeta Joven API

Backend basado en NestJS + Fastify que ofrece autenticacion JWT, registro de beneficiarios y un catalogo de comercios para el programa Tarjeta Joven.

## Requisitos previos

- Node.js 20 (usa `nvm use` si tienes `.nvmrc` cargado).
- npm 10 o superior.
- Docker 24+ y Docker Compose v2 si deseas ejecutar todo en contenedores.
- PostgreSQL 15 si trabajas sin Docker.

## Variables de entorno

Duplica `.env.example` como `.env` y completa los valores antes de iniciar el proyecto.

| Variable | Descripcion | Ejemplo |
| --- | --- | --- |
| `NODE_ENV` | Entorno activo (`development`, `production`, `test`). | `development` |
| `PORT` | Puerto de escucha de la API. | `8080` |
| `LOG_LEVEL` | Nivel minimo de logging (`fatal`, `error`, `warn`, `log`, `debug`, `verbose`). | `debug` |
| `DB_URI` | Cadena de conexion para Prisma. | `postgresql://tjuser:tjpass@db:5432/tjdb?schema=public` |
| `JWT_SECRET` | Secreto para firmar access tokens. | `cambia-esta-clave` |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens. | `cambia-esta-clave` |
| `JWT_ACCESS_TTL` | Tiempo de vida del access token. | `15m` |
| `JWT_REFRESH_TTL` | Tiempo de vida del refresh token. | `30d` |
| `OTP_*` | Configuracion de OTP (TTL, maximos, cooldown). | Valores de ejemplo en `.env.example` |
| `RATE_LIMIT_*` | Limites globales y para OTP. | Valores de ejemplo en `.env.example` |
| `CORS_ORIGIN` | Origen permitido para CORS. | `http://localhost:4200` |
| `CORS_CREDENTIALS` | Habilita cookies/autenticacion cruzada. | `true` |
| `STORAGE_DRIVER` | Mecanismo de archivos de usuario (`local`). | `local` |
| `SENTRY_DSN` | DSN de Sentry, deja vacio para desactivar. | `` |

## Instalacion

```bash
npm install
```

Genera el cliente de Prisma si cambiaste el esquema:

```bash
npx prisma generate
```

Aplica migraciones y carga datos iniciales:

```bash
npx prisma migrate dev
npm run db:seed
npm run seed:test-users   # usuarios adicionales de prueba
```

## Ejecucion

### Desarrollo local

```bash
npm run start:dev
```

La API quedara disponible en `http://localhost:8080/api/v1`.

### Docker

Sigue estos pasos para levantar la API y la base de datos en contenedores por tu cuenta:

1. Verifica que exista un archivo `.env` completo (puedes partir de `.env.example`).
2. Levanta la pila en segundo plano y fuerza la reconstrucción de la imagen:
   ```bash
   docker compose up -d --build
   ```
3. Comprueba el estado de los servicios y que ambos aparezcan como `healthy`:
   ```bash
   docker compose ps
   ```
4. Supervisa los logs en vivo si necesitas diagnosticar algo:
   ```bash
   docker compose logs -f backend
   ```
5. (Opcional) Ejecuta los seeds dentro del contenedor si quieres datos de ejemplo:
   ```bash
   docker compose exec backend npm run db:seed
   ```
6. Cuando termines, detén y limpia los recursos creados:
   ```bash
   docker compose down
   ```

Esto levanta PostgreSQL y el backend en:

- API: `http://localhost:8080`
- Base de datos: `localhost:5432` (usuario `tjuser`, clave `tjpass` por defecto)

## Documentacion de la API

- Swagger UI: `http://localhost:8080/docs`
- Documento OpenAPI (JSON): `http://localhost:8080/docs-json`

### Formato de respuesta y CORS

- Todas las rutas REST responden en JSON (`application/json`) salvo los endpoints que aceptan `multipart/form-data` para el registro.
- El backend expone CORS mediante Fastify y toma sus reglas de `CORS_ORIGIN` y `CORS_CREDENTIALS`; por defecto permite el origen configurado en `.env` (por ejemplo `http://localhost:3000` o `http://localhost:4200`).

## Rutas disponibles

### Vistas y documentacion

| Ruta | Descripcion | Notas |
| --- | --- | --- |
| `GET /` | Landing y PWA de Tarjeta Joven. | Si no se adjunta un build estatico del frontend, la ruta respondera 404; el backend sigue disponible en `/api/v1`. |
| `GET /docs` | Swagger UI con la coleccion de endpoints. | Expuesto sin prefijo `api/v1`. |
| `GET /docs-json` | Documento OpenAPI en JSON. | Importable en Postman/Insomnia. |

### API REST (prefijo `/api/v1`)

| Metodo | Ruta | Auth | Descripcion | Notas |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/otp/send` | No | Solicita el envio de un codigo OTP usando la CURP. | Protegido por `OtpThrottleGuard` (limite configurable via `RATE_LIMIT_OTP_*`); responde `204 No Content`. |
| `POST` | `/api/v1/auth/otp/verify` | No | Valida el OTP y entrega tokens iniciales. | Devuelve `accessToken`, `refreshToken` y el perfil (placeholder si es alta nueva). |
| `POST` | `/api/v1/auth/register` | No | Completa el registro del beneficiario. | `multipart/form-data` con datos personales, `acepta_tc` y archivos `ine`, `curp`, `comprobante` (2 MB max c/u). |
| `POST` | `/api/v1/auth/login` | No | Autentica con CURP y contrasena. | Retorna tokens JWT y perfil resumido. |
| `POST` | `/api/v1/auth/refresh` | No | Emite un nuevo access token. | Envia `refreshToken` en el cuerpo; validado por `RefreshGuard`. |
| `POST` | `/api/v1/auth/logout` | Opcional | Finaliza la sesion del lado del cliente. | Responde `204`; no invalida tokens en servidor. |
| `GET` | `/api/v1/me` | `Bearer` (access) | Devuelve el perfil del usuario autenticado. | Protegido por `JwtAuthGuard`. |
| `GET` | `/api/v1/catalog` | No | Lista comercios activos del programa. | Filtros opcionales `q`, `categoria`, `municipio`, `page` (>=1) y `pageSize` (<=50). |
| `GET` | `/api/v1/catalog/:id` | No | Obtiene el detalle de un comercio. | Responde 404 si no existe o esta inactivo. |
| `POST` | `/api/v1/push/subscriptions` | `Bearer` (access) | Registra una suscripcion a notificaciones push. | Requiere `endpoint`, `keys.p256dh` y `keys.auth`. |
| `DELETE` | `/api/v1/push/subscriptions/:id` | `Bearer` (access) | Elimina una suscripcion push propia. | Solo borra si pertenece al usuario. |
| `GET` | `/api/v1/healthz` | No | Healthcheck de la API. | Usado por el `healthcheck` de Docker. |
| `GET` | `/api/v1/version` | No | Expone version y commit desplegados. | Respuesta `{ version, commit }`. |

## Flujo de la aplicacion

1. **Identificacion inicial con CURP y OTP**  
   `POST /api/v1/auth/otp/send` genera un codigo de 6 digitos por CURP (rate limitado por IP).  
   `POST /api/v1/auth/otp/verify` valida el codigo, crea al usuario placeholder si no existe y entrega `accessToken` + `refreshToken` para continuar el onboarding.
2. **Registro asistido con documentos**  
   `POST /api/v1/auth/register` recibe los datos personales, fuerza el formato de fecha `DD/MM/AAAA`, exige `acepta_tc = true` y tres archivos (`ine`, `curp`, `comprobante`).  
   Los archivos se almacenan via `StorageModule` en `uploads/users/<userId>` cuando `STORAGE_DRIVER=local`, o en S3 si se configura el driver correspondiente.
3. **Sesion y tokens**  
   `POST /api/v1/auth/login` permite reingresar con CURP + contrasena definida en el registro.  
   `POST /api/v1/auth/refresh` toma `refreshToken` en el cuerpo y devuelve un nuevo `accessToken`.  
   `POST /api/v1/auth/logout` responde `204` para que el cliente limpie tokens y recursos locales.
4. **Perfil y experiencia autenticada**  
   `GET /api/v1/me` expone el perfil resumido del beneficiario autenticado.  
   `POST /api/v1/push/subscriptions` y `DELETE /api/v1/push/subscriptions/:id` gestionan endpoints Web Push vinculados al usuario.
5. **Descubrimiento de beneficios**  
   `GET /api/v1/catalog` ofrece paginacion (`page`, `pageSize`) y filtros (`q`, `categoria`, `municipio`) devolviendo `{ items, total, page, totalPages }`.  
   `GET /api/v1/catalog/:id` muestra la ficha detallada de un comercio activo.
6. **Monitoreo y soporte**  
   `GET /api/v1/healthz` y `GET /api/v1/version` sirven para monitoreo externo.  
   La documentacion ejecutable permanece disponible en `GET /docs`.

## Colecciones y seeds

- `npm run db:seed`: crea comercios de ejemplo y usuarios Ana, Luis y Sofia.
- `npm run seed:test-users`: agrega cinco usuarios adicionales (Laura, Diego, Valeria, Carlos, Fernanda).

Los CURP de prueba estan documentados en `scripts/create-test-users.ts` y `scripts/seed.ts`.

## Pruebas y lint

Ejecucion de lint:

```bash
npm run lint
```

Ejecucion de pruebas unitarias/integracion (Jest):

```bash
npm test
```

> Nota: revisa el estado actual del linting; es posible que se requieran ajustes en el codigo para alinear con las reglas estrictas de `@typescript-eslint`.

## Estructura del proyecto

```
src/
  common/            Utilidades, guards, pipes y logger JSON
  config/            Configuracion por modulo
  modules/
    auth/            Login, registro y OTP
    catalog/         Comercios y beneficios
    users/           Perfil del usuario autenticado
    push/            Suscripciones push
    health/          Healthcheck
    version/         Datos de version
scripts/             Seeds y utilidades post-build
prisma/              Esquema y migraciones
```

## Notas de seguridad

- Cambia todos los secretos (`JWT_*`) antes de desplegar.
- Revisa la configuracion de CORS segun el dominio del frontend.
- Implementa HTTPS en entornos productivos.
- Integra Sentry (variable `SENTRY_DSN`) para captura de excepciones.

## Licencia

Proyecto interno del programa Tarjeta Joven. Ajusta esta seccion si se publica bajo una licencia especifica.
