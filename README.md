# FUGA Product Management

A full-stack product management system for music releases. Users can create, view, edit, and delete products, attach cover art, and manage artist credits including one main artist and optional featured artists.

This project was built for the FUGA full-stack take-home assignment. The core path is intentionally simple to review:

1. Create or select an artist.
2. Create a product with name, artist credits, and optional cover art.
3. See the product in the list with a thumbnail.
4. Edit product metadata or replace/remove cover art.
5. Delete the product.

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- CSS Modules
- Vitest + Testing Library
- nginx for the production client image

### Backend

- Node.js 22
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod validation
- Multer for multipart uploads
- Sharp for cover image normalization
- MinIO/S3-compatible object storage
- Redis cache
- OpenAPI + Swagger UI
- Vitest + Supertest

### Infrastructure

- pnpm workspaces monorepo
- Docker Compose for local runtime
- GitHub Actions CI/CD
- GHCR image publishing
- Trivy, Snyk, and CodeQL security checks
- Railway deployment support

## Repository structure

```txt
.
├── apps/
│   ├── client/              # React/Vite app served by nginx in production
│   └── server/              # Express API, Prisma, OpenAPI, tests
├── packages/
│   └── shared/              # Shared Zod schemas, types, constants
├── docker-compose.yml       # Local full-stack runtime
├── pnpm-workspace.yaml
└── README.md
```

## Features

- Product CRUD API and UI
- Artist create/search API and UI
- Main artist plus ordered featured artists
- Cover art upload with client preview
- Cover art replacement and removal during edit
- JPEG, PNG, and WebP upload support
- Server-side magic-byte validation, not just browser MIME type
- 5MB cover art limit
- Sharp-based cover normalization to WebP thumbnails
- MinIO-backed object storage
- Compensation logic for failed product writes after an image upload
- Redis cache-aside for product list reads
- Short-lived Redis cache for artist autocomplete
- Graceful Redis degradation: if Redis is unavailable, reads fall back to PostgreSQL
- Shared Zod schemas for client validation, server validation, and OpenAPI generation
- Loading, empty, error, retry, and delete-confirmation UI states
- OpenAPI docs exposed by the server
- Dockerized local environment
- CI/CD with validation, image build, image scan, and deploy stages

## Local setup

### Prerequisites

- Docker and Docker Compose
- Node.js 22
- pnpm 11

### Run the full stack with Docker Compose

From the repository root:

```bash
docker compose up --build
```

Then open:

- Client: http://localhost:8080
- API health check through nginx: http://localhost:8080/api/health
- API docs: http://localhost:8080/api/docs
- OpenAPI JSON: http://localhost:8080/api/openapi.json
- MinIO console: http://localhost:9001

Default MinIO credentials for local development:

```txt
username: minioadmin
password: minioadmin
```

To stop the stack:

```bash
docker compose down
```

To reset local data, including Postgres and MinIO volumes:

```bash
docker compose down -v
```

## Local development without the production client container

Install dependencies:

```bash
pnpm install
```

Start local infrastructure:

```bash
docker compose up -d postgres minio redis
```

Create the server environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

Apply database migrations:

```bash
pnpm --filter @fuga/server exec prisma migrate deploy
```

Run the server:

```bash
pnpm --filter @fuga/server dev
```

Run the client in another terminal:

```bash
pnpm --filter @fuga/client dev
```

In local Vite development, the client uses `/api` as its API base path. For the production Docker Compose setup, nginx proxies `/api/*` to the server container.

## Environment variables

The Docker Compose file provides the runtime environment automatically. For local server development, use `apps/server/.env.example` as the starting point.

| Variable | Purpose | Local default |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://fuga:fuga@localhost:5432/fuga` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `MINIO_ENDPOINT` | Internal MinIO host used by the server | `localhost` |
| `MINIO_PUBLIC_ENDPOINT` | Browser-reachable MinIO host when different from internal host | optional locally |
| `MINIO_PUBLIC_URL` | Public cover URL base used in Docker/Railway-style setups | set in Compose |
| `MINIO_PORT` | MinIO API port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `MINIO_BUCKET` | Cover art bucket name | `covers` |
| `MINIO_USE_SSL` | Whether to connect to MinIO with SSL | `false` |

The client container also accepts:

| Variable | Purpose | Local Docker Compose value |
| --- | --- | --- |
| `API_UPSTREAM` | nginx upstream for `/api/*` proxying | `server:3000` |

## API overview

The API is served under `/api`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products` | List products, newest first |
| `POST` | `/api/products` | Create product with optional cover upload |
| `PATCH` | `/api/products/:id` | Partially update product metadata and/or cover |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/api/artists?search=` | List or search artists |
| `POST` | `/api/artists` | Create artist |
| `GET` | `/api/covers/:key` | Stream normalized cover image |
| `GET` | `/api/docs` | Swagger UI |
| `GET` | `/api/openapi.json` | OpenAPI document |

### Product create request

`POST /api/products` expects `multipart/form-data`:

```txt
name               Album name, required
mainArtistId       Existing artist ID, required
featuredArtistIds  Existing artist ID, optional and repeatable
cover              JPEG/PNG/WebP image, optional, max 5MB
```

### Product update request

`PATCH /api/products/:id` also expects `multipart/form-data`. Fields are optional; omitted fields are unchanged.

```txt
name               New product name
mainArtistId       New main artist ID
featuredArtistIds  Optional repeatable featured artist IDs
cover              New JPEG/PNG/WebP image
removeCover        true, to remove the current cover
```

Cover update behavior:

- `cover` present: upload new cover and delete the old object.
- no `cover` and no `removeCover`: keep the existing cover.
- `removeCover=true`: clear the cover key and delete the old object.

### Product response shape

```json
{
  "id": "...",
  "name": "Album X",
  "coverArtUrl": "http://localhost:8080/api/covers/....webp",
  "createdAt": "...",
  "updatedAt": "...",
  "artists": [
    {
      "id": "...",
      "name": "Main Artist",
      "role": "PRIMARY",
      "position": 0
    },
    {
      "id": "...",
      "name": "Featured Artist",
      "role": "FEATURED",
      "position": 1
    }
  ]
}
```

### Error response shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid product",
    "fields": {
      "name": "Enter a product name"
    }
  }
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `200` | Successful read/update |
| `201` | Successful create |
| `204` | Successful delete |
| `400` | Validation error |
| `404` | Resource not found |
| `413` | Uploaded file too large |
| `415` | Unsupported image type |
| `500` | Unexpected server error |

## Architecture notes

### Shared contracts

Product and artist schemas live in `packages/shared`. The same Zod schemas are used for:

- frontend form validation
- backend request validation
- generated OpenAPI schemas
- shared TypeScript types

This keeps the client and server contract aligned without duplicating validation rules.

### Product and artist model

Products and artists are separate entities. A join model stores artist role and display position:

- one `PRIMARY` artist per product
- zero or more `FEATURED` artists
- feature order preserved by `position`

This supports the assignment's simple “artist name” requirement while leaving room for real-world music metadata.

### Cover storage

Uploaded covers are validated by file signature, normalized with Sharp, and stored in MinIO. Products store only the object key in Postgres. Read responses derive `coverArtUrl` from that key.

The API includes compensation logic for the most important failure path: if a cover uploads successfully but the subsequent database write fails, the uploaded object is deleted to avoid an orphan.

### Caching

Redis is used where it gives value without complicating correctness:

- Product list: cache-aside, invalidated on create/update/delete.
- Artist autocomplete: 60-second TTL, active invalidation on adding new artists.

If Redis is unavailable, the server falls back to PostgreSQL rather than failing user requests.

## Testing

Run client tests:

```bash
pnpm --filter @fuga/client test
```

Run server tests:

```bash
pnpm --filter @fuga/server test
```

Run client lint:

```bash
pnpm --filter @fuga/client lint
```

Run server typecheck:

```bash
pnpm --filter @fuga/server exec tsc --noEmit
```

The backend tests cover product creation/listing/deletion, artist creation, validation failures, connecting products to existing artists, and invalid upload handling.

The frontend tests cover product form rendering, product list rendering, field validation messages, image preview behavior, and delete confirmation UI.

## CI/CD

GitHub Actions runs one workflow with three triggers:

- `pull_request` to `main`: validate client, validate server, run CodeQL.
- `push` to `main`: validate, build Docker images, push to GHCR, scan, then deploy.
- nightly schedule: rescan shipped images and code to catch newly disclosed vulnerabilities.

Push-to-main pipeline:

```txt
client lint/test
server typecheck/integration tests
CodeQL
build server/client images
push images to GHCR
Trivy image scans
Snyk dependency scan
Railway redeploy
```

Deploy is intentionally gated after tests, image build, and high/critical Trivy checks.

## Trade-offs and scope decisions

- The application has no authentication or authorization. The assignment scope is product management, not account management.
- Product list reads are currently unpaginated, but pagination is the first scaling improvement for larger catalogs.
- Redis is used as a performance layer only.
- MinIO is used locally to keep object storage behavior close to production S3-compatible storage.
- The API supports richer music credits than the minimum assignment wording by modeling artists separately and supporting featured artists.

## Future improvements / scale todo

These are intentionally outside the core take-home path and can be added without changing the main product-management feature set:

- Add end-to-end tests with Playwright or Cypress for the full browser flow: create artist, create product with cover, edit, remove cover, and delete.
- Add pagination to `GET /api/products`, plus UI pagination or infinite scroll, to support larger product catalogs.
- Add a scheduled orphan-cover cleanup job that compares MinIO objects against `Product.coverArtKey` values and deletes unreferenced objects. The current synchronous compensation covers the main failed-write case; a cron job would handle any remaining edge cases from deploy interruptions or unexpected crashes.
- Add sorting and filtering to the product list.
- Add structured request logging and basic metrics.
- Add auth if this becomes a multi-user or production-facing system.
