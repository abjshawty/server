# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project summary
This repo is a Fastify + TypeScript backend template with Prisma as the data layer. Source lives in `src/`; `tsc` outputs compiled JS to `build/`. The project is ESM (`"type": "module"` in `package.json`).

Key entrypoint: `src/index.ts` → runs `init()` (from `src/utils/default.ts`) → starts Fastify via `src/helpers/server.ts`.

## Runtime requirements
- Node.js: `>= 22.14.0` (see `package.json` `engines`)
- Yarn: `>= 1.22.19` (recommended; see `package.json` `engines`)

## Common commands (PowerShell-friendly)
### Install
- Install dependencies:
  - `yarn install`

### Run (dev)
- Start the dev server (uses `tsx` to run TypeScript directly):
  - `yarn dev`

When running locally, Swagger UI is mounted at `/` and API routes are mounted under `/<apiVersion>` (computed in `src/helpers/env.ts` from the `package.json` major version; with the current `package.json` version `0.3.6`, this is `/v0`).

### Build / run (prod)
- Typecheck + compile to `build/`:
  - `yarn build`
- Run compiled server:
  - `yarn start`

### Lint / typecheck
There is no dedicated ESLint script in `package.json`.
- Typecheck/compile (TypeScript strict mode): `yarn build`
- Formatting (Prettier): `yarn format`

### Tests
Jest is configured inline in `package.json` (ts-jest, Node env, `src/test/setup.ts` as setup file, `**/*.test.ts` match).

- Run tests (watch mode):
  - `yarn test`
- Run a single test file:
  - `yarn jest src/path/to/foo.test.ts`
- Run tests matching a name/pattern:
  - `yarn jest -t "some test name"`

### Environment setup
- Create local env file:
  - `Copy-Item .env.example .env`

Key env vars are defined in `src/helpers/env.ts` and exemplified in `.env.example` (notably `DATABASE_URL`, `APP_HOST`, `APP_PORT`, `AUTH_ENABLED`, `JWT_SECRET`, and optional provider/API keys).

### Prisma / database
Prisma schema is `prisma/schema.prisma` (currently declares `datasource db { provider = "postgresql" }`). The Prisma client is generated into `src/db/orm/` (see the `generator client` output path). Runtime DB client is exported from `src/db/index.ts` as `client`.

Note: `.env.example` includes a MongoDB connection string example, but the current Prisma schema/adapters in `src/db/adapter.ts` are set up for PostgreSQL (and partially for MySQL/MariaDB).

- Generate Prisma client:
  - `yarn db:gen`
- Create/apply migrations:
  - Dev migration: `yarn db:dev`
  - Deploy migrations (prod): `yarn db:migrate`
  - Push schema without migrations: `yarn db:push`
  - Reset DB (destructive): `yarn db:reset`

### Auth schema generation (Better Auth)
- Generate Better Auth tables:
  - `yarn db:auth`
- Full init (install + reset + auth generate + migrate):
  - `yarn db:init`

### CRUD scaffolding (code generation)
`src/helpers/generator.ts` can generate controllers/services/schemas/routes from Prisma’s DMMF and update the `index.ts` barrels.

- Generate for all Prisma models:
  - `yarn create`
- Generate for a single model (bypasses the package script; uses generator’s CLI arg):
  - `yarn ts-node src/helpers/generator.ts User`

## High-level architecture
### Runtime flow
- `src/index.ts`: bootstraps startup (`init()` then `server.start()`).
- `src/helpers/server.ts`: builds the Fastify instance and registers:
  - `@fastify/jwt`, `@fastify/multipart`, `@fastify/helmet`, `@fastify/cors`
  - Swagger + Swagger UI (`@fastify/swagger`, `@fastify/swagger-ui`) at route prefix `/`
  - An “experimental” root handler plugin (`src/helpers/handler.ts`) via `handler.routes` (currently defines `GET /` → `Hello World!`, which can conflict with Swagger UI’s root route).
  - API routes (`src/routes/index.ts`) under prefix `/<apiVersion>`.
  - Optional Kafka producer/consumer startup via `src/utils/kafka.ts` depending on `KAFKA_ROLE`.

### Layered request handling
This template is organized as:
- `src/routes/*`: Fastify route definitions (HTTP methods/paths). Routes call into API handlers and attach JSON schemas for validation/docs.
- `src/schemas/*`: Fastify schema objects (also used to generate OpenAPI tags/docs).
- `src/api/*`: request/response handlers (translates HTTP inputs to service calls; shapes responses).
- `src/services/*`: business-logic layer. Most model services are thin wrappers around a generic `ServiceFactory`.
- `src/controllers/*`: data-access layer. Most model controllers are thin wrappers around a generic `ControllerFactory` which uses `client[model]`.
- `src/db/*`: Prisma client setup and adapter selection.

The generic factories are:
- `src/helpers/controller.ts`: generic Prisma CRUD + export helpers (CSV/XLSX/PDF/JSON).
- `src/helpers/service.ts`: generic service wrapper delegating to a controller.

### TypeScript path aliases
`tsconfig.json` defines a few important path aliases used throughout the codebase:
- `@/*` → `src/*`
- `client` → `src/db/orm/client` (generated Prisma client)
- `db/*` → `src/db/*`

### Database + Prisma client generation
- `prisma/schema.prisma` defines models and generates the client into `src/db/orm/`.
- `src/db/adapter.ts` selects a Prisma adapter based on the `DATABASE_URL` scheme (postgres vs mysql).
- `src/db/index.ts` exports the `PrismaClient` instance as `client` and exposes `die()` for graceful disconnect.

### Authentication
- Better Auth is configured in `src/utils/auth.ts` using the Prisma adapter.
- `src/routes/auth.ts` mounts the Better Auth handler under `/auth/*` by translating Fastify requests into Fetch `Request` objects.
- Fastify JWT plugin is registered in `src/helpers/server.ts` (useful for JWT-based auth), but route protection is currently opt-in at the route level.

### Source vs build output
- Prefer editing `src/**`.
- `build/**` is the TypeScript compiler output (`tsconfig.json` sets `outDir: ./build`). Avoid making manual edits in `build/` unless you are explicitly working on build artifacts.
