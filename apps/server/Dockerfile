# ---- build ----
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

# workspace manifests first (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# prisma schema must exist before install (postinstall runs prisma generate)
COPY apps/server/prisma ./apps/server/prisma

RUN pnpm install --frozen-lockfile

# now the source
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

RUN pnpm --filter @fuga/server build

# ---- runtime ----
FROM node:22-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# compiled output + generated prisma client
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/server/src/generated ./apps/server/src/generated
COPY packages/shared ./packages/shared

WORKDIR /app/apps/server
# migrate then start
CMD ["sh", "-c", "pnpm prisma db push && node dist/server.js"]