FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM deps AS production-deps
COPY prisma ./prisma
RUN npm prune --omit=dev
RUN npx prisma generate

FROM base AS production
ENV NODE_ENV=production
COPY package.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
