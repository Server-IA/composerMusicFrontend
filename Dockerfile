# ---------------------------------------------------------------
# Composer Music - Frontend (Next.js) - Puerto 3002
# ---------------------------------------------------------------

# 1) Instalación de dependencias
FROM node:18-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# 2) Compilación de la aplicación
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# URLs del backend que usará el navegador (se incrustan en la compilación)
ARG NEXT_PUBLIC_BASE_URL_BACKEND=http://127.0.0.1:5000
ARG NEXT_PUBLIC_BASE_URL_BACKEND_GEN=http://127.0.0.1:5000
ENV NEXT_PUBLIC_BASE_URL_BACKEND=$NEXT_PUBLIC_BASE_URL_BACKEND \
    NEXT_PUBLIC_BASE_URL_BACKEND_GEN=$NEXT_PUBLIC_BASE_URL_BACKEND_GEN \
    NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# 3) Imagen final de ejecución
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 3002

CMD ["yarn", "start", "-p", "3002"]
