# PWA Tarjeta Joven

Aplicación React 18 + Vite + TypeScript con soporte PWA (Workbox `injectManifest`), rutas, Redux Toolkit, registro/OTP, catálogo, wallet con QR y modo offline, notificaciones Web Push, accesibilidad e i18n (es/en).

## Índice

- Requisitos previos
- Instalación
- Variables de entorno
- Ejecución (desarrollo) y tests
- Build de producción
- Docker (prod y dev)
- Estructura del proyecto
- Convenciones de commits
- Guía de contribución (ramas, versionado, checklist de PR)
- Seguridad y privacidad
- Funcionalidades principales
- Accesibilidad e i18n
- CI/CD y calidad
- FAQ y resolución de problemas

## Requisitos previos

- Node.js 20.16.x
- npm 10.8.x
- Docker/Compose (opcional) para despliegue o entorno dev en contenedor

## Instalación

1. Clona el repositorio.
2. Instala dependencias: `npm ci` (usa las versiones bloqueadas en `package-lock.json`).
   - Si utilizas `nvm`, ejecuta `nvm use` para adoptar automáticamente la versión definida en `.nvmrc`.

## Variables de entorno

Crea un archivo `.env.local` (no se commitea) con las variables necesarias:

- `VITE_API_BASE=/api` (por defecto `/api` y NGINX hace proxy al backend)
- `VITE_VAPID_PUBLIC_KEY=<clave_publica_vapid>` (si usarás notificaciones Push)

Estas variables se inyectan en tiempo de build/dev por Vite.

Ejemplo (`.env.local`):

```
VITE_API_BASE=/api
VITE_VAPID_PUBLIC_KEY=REEMPLAZAR_CON_CLAVE_VAPID_PUBLICA
VITE_SENTRY_DSN=https://<public_dsn>@oXXXX.ingest.sentry.io/XXXXX
```

## Ejecución y tests

- Desarrollo: `npm run dev` → `http://localhost:5173`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Tests unitarios: `npm run test`
- Vista previa de producción: `npm run build && npm run preview`

## Build de producción

- `npm run build` genera `dist/` con assets optimizados y Service Worker.

## Docker

Producción (NGINX):
- `docker compose build` y `docker compose up -d`
- Abre `http://localhost:8080` (healthcheck `GET /healthz`)
- Proxy `/api/*` → `http://backend:8080/*` (configurable en `deploy/nginx.conf`)

Desarrollo (Vite + HMR):
- `docker compose -f docker-compose.dev.yml up --build`
- `http://localhost:5173`

## Estructura del proyecto

- `src/app`: App shell, provider Redux, i18n, tema (`theme.tsx`) y estilos globales.
- `src/features`: Módulos (auth, catalog, wallet, notifications, help, etc.).
- `src/pages`: Páginas (`/`, `/login`, `/register`, `/wallet`, `/profile`, `/settings`, `/help`).
- `src/routes`: Rutas y `PrivateRoute`.
- `src/sw`: Service Worker (`injectManifest`).
- `src/lib`: Utilidades (push, IndexedDB, etc.).
- `src/i18n`: Mensajes y configuración i18n.
- `public`: `manifest.json`, íconos y assets estáticos (FAQ en `public/help/faq.html`).
- `deploy`: `nginx.conf` para producción.
- `.github/workflows`: CI y Lighthouse opcional.

## Convenciones de commits

Se recomienda Conventional Commits:
- `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`, `test: ...`, `ci: ...`, `build: ...`.
- Usa el imperativo y mensajes concisos.

## Guía de contribución

- Flujo de ramas:
  - `main`: estable y liberable.
  - Feature branches desde `main`: `feat/…`, `fix/…`.
- Estrategia de versionado: SemVer (`MAJOR.MINOR.PATCH`).
- Checklist de PR:
  - Descripción clara de cambios y motivación.
  - Lint y typecheck pasan.
  - Tests agregados/actualizados y pasando.
  - Actualizar README/Docs si aplica.
  - Considerar accesibilidad (roles/labels/focus) y i18n de cadenas nuevas.

## Seguridad y privacidad

- CSP recomendada (NGINX) para mitigar XSS:
  - `Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://* http://*; manifest-src 'self'; worker-src 'self';`
  - Ajusta `connect-src` según tus endpoints.
  - En `deploy/nginx.conf` hay un snippet comentado (`add_header Content-Security-Policy ... always;`) listo para habilitar.
- Manejo de tokens:
  - Preferible usar cookies HttpOnly para refresh tokens. Si se usan tokens en cliente, evitar `localStorage`; guardar en memoria/Redux y rotarlos frecuentemente.
  - Nunca loguear tokens ni incluirlos en URLs.
- Sanitización/escape:
  - Evitar `dangerouslySetInnerHTML`; si es inevitable (FAQ), asegurar origen confiable. Para contenido dinámico considera usar una librería de sanitización (p. ej., DOMPurify).
- Privacidad:
  - Minimizar datos personales; cifrar en tránsito (HTTPS). No almacenar datos sensibles en cliente.

## Funcionalidades principales

- PWA y Workbox (`injectManifest`), precache, cache de imágenes y `/api/catalog` (24h), Background Sync para wallet.
- Autenticación (Redux Toolkit): login, registro con CURP y OTP (3 intentos + cooldown), rutas privadas.
- Catálogo con filtros, paginación, skeletons, estados vacío y error.
- Wallet con QR y expiración, cola offline (IndexedDB) y reintentos.
- Notificaciones Web Push (VAPID) con toggle y persistencia.

## Accesibilidad e i18n

- Semántica, navegación por teclado, focus visible y contraste (tema claro/oscuro).
- i18n con `react-intl` (es/en), selector de idioma y tema en Configuración.
- Auditorías `jest-axe` en componentes clave.

## CI/CD y calidad

- GitHub Actions (`ci.yml`): lint, typecheck, tests y build.
- Lighthouse CI opcional (`lighthouse.yml`, `lighthouserc.json`).
- Husky + lint-staged: pre-commit con ESLint en `*.ts, *.tsx`.

Sentry y sourcemaps:
- `vite.config.ts` habilita `build.sourcemap=true` y el plugin de Sentry para subir mapas en CI si exportas `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT` como secretos del repo. Configura `VITE_SENTRY_DSN` para capturar errores en runtime.

## FAQ y resolución de problemas

## Estilos y tokens

- Archivos CSS:
  - `styles/tokens.css`: variables de diseño (colores, tipografías, espaciados, radius, sombras, safe-area, alturas del shell).
  - `styles/index.css`: importa tokens y define estilos base/utilidades (`.shadow`, `.radius`, focus-visible).
- Colores principales:
  - Verde oscuro: `#264f28` (`--color-green-900`)
  - Primario: `#588f41` (`--color-primary` / `--color-link`)
  - Acento: `#a93257` (`--color-accent`)
  - Escala de grises `--gray-100` … `--gray-900`
- Modo oscuro:
  - Actívalo añadiendo `data-theme="dark"` en `:root`/`<html>` para aplicar los overrides.
- Uso de variables (ejemplos):
  - Fondo de tarjeta: `background: var(--color-bg);`
  - Texto: `color: var(--color-text);`
  - Borde: `border: 1px solid var(--color-border);`
  - Enlaces: `color: var(--color-link);`
  - Radio/sombras: `border-radius: var(--radius); box-shadow: var(--shadow);`
  - Espaciados: `margin: var(--space-3); padding: var(--space-4);`
  - Tipografía: `font-family: var(--font-base); font-size: var(--font-size-base);`

- Puerto en uso (5173 u 8080): cambia los mapeos en Compose o flags al ejecutar Docker.
- Notificaciones no funcionan:
  - Verifica `VITE_VAPID_PUBLIC_KEY` definida y permisos del navegador.
- El Service Worker no se actualiza:
  - Forzar recarga (Ctrl+F5) o cerrar y reabrir pestaña; `registerType: 'autoUpdate'` ya está habilitado.
- Errores CORS en dev:
  - Usa `/api` y el proxy del dev-server o configura CORS en backend.
- Iconos PWA faltantes:
  - Asegura `public/icons/icon-192.png` y `public/icons/icon-512.png` existen.
- Problemas de permisos en docker dev:
  - Usa el volumen `node_modules` definido y elimina `node_modules` en host si hay conflictos.
## Storybook

- Scripts:
  - `npm run storybook`: levanta Storybook en `http://localhost:6006`.
  - `npm run build-storybook`: genera el build estático en `storybook-static/`.
- Addons: Essentials (controles, acciones, docs) + A11y habilitado.
- Historias incluidas:
  - Catálogo: CardBenefit, CardMerchant (decorada con MemoryRouter).
  - Auth: OTPInput.
  - Wallet: QRView (canvas) con temporizador.
  - UI: EmptyState.
- Docs: textos en español y controles para props principales.
- Estilos: bootstrap y `styles/index.css` cargados globalmente en Storybook.
