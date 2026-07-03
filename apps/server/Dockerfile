# ---- build (install + prisma generate) ----
FROM node:22-slim AS build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# workspace manifests first (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# prisma schema must exist before install (postinstall runs prisma generate)
COPY apps/server/prisma ./apps/server/prisma

RUN pnpm install --frozen-lockfile

# source
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# ---- runtime ----
FROM node:22-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# copy the fully-installed workspace from build (node_modules, source, generated client)
COPY --from=build /app ./

WORKDIR /app/apps/server
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]