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
# Las URLs del backend y del player se toman del archivo .env (se incrustan en la compilación)
ENV NEXT_TELEMETRY_DISABLED=1
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
