# ---- build ----
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/client/package.json ./apps/client/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/client ./apps/client

RUN pnpm --filter @fuga/client build:docker

# ---- runtime ----
FROM nginx:alpine AS runtime
ENV API_UPSTREAM=server:3000
COPY apps/client/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80