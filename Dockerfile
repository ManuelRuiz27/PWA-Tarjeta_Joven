# --- Build stage ---
FROM node:20.16-alpine AS build
WORKDIR /app

# Instala dependencias con versiones bloqueadas cuando hay lock
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia el resto del código
COPY . .

# Argumento opcional para Vite (no crítico si el código usa rutas absolutas /api)
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

# Compila
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27.1-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copia build estático
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copia configuración de NGINX
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck simple contra endpoint de NGINX
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

