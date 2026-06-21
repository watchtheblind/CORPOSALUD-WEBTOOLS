# Stage 1: Instalar dependencias y compilar
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Servidor de producción
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar el build optimizado standalone de NextJS
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]