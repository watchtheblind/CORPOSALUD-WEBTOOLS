FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copiar fuente y buildear
COPY . .
RUN bun run build

# Stage de Producción
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponemos el puerto
EXPOSE 3000

# Ejecutamos NestJS
CMD ["bun", "run", "dist/main.js"]