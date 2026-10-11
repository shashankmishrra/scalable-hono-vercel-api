# ResourceBox

A local-first resource publishing application: a read-only API reference at
`app.localhost` and a public resource page at `resource.localhost/:slug`.

Built with Bun, Next.js (App Router), Hono, TypeScript, Drizzle, and local
Supabase PostgreSQL, with Redis caching and a BullMQ worker.

> **Status:** Phase 2 — application skeleton. Next.js and Hono are wired with
> hostname routing and a `/api/health` endpoint. Domain features (Drizzle, the
> Resource API, caching, uploads, the worker) land in later phases.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Compose v2)
- [Bun](https://bun.sh) 1.4+
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
  (`npm i -g supabase`)

## Local services

| Service                                      | Address                                                   | Managed by     |
| -------------------------------------------- | --------------------------------------------------------- | -------------- |
| Next.js app                                  | `http://127.0.0.1:3000`                                   | Bun            |
| Nginx (hostname routing)                     | `http://app.localhost`, `http://resource.localhost`       | Docker Compose |
| Redis (cache + BullMQ)                       | `redis://127.0.0.1:6379`                                  | Docker Compose |
| Supabase Postgres                            | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Supabase CLI   |
| Supabase API gateway (REST / Auth / Storage) | `http://127.0.0.1:54321`                                  | Supabase CLI   |
| Supabase Studio                              | `http://127.0.0.1:54323`                                  | Supabase CLI   |

Ports and database version live in `supabase/config.toml`; Redis and Nginx live
in `docker-compose.yml`. Nginx proxies both hostnames to the Next.js process on
the host (`host.docker.internal:3000`) and preserves the `Host` header. The
`src/proxy.ts` file maps the hostnames to the `(admin)` and `(public)` route
groups.

## Setup

```sh
bun install                 # install dependencies
supabase start              # start Postgres, Storage, Auth, REST, Studio
docker compose up -d        # start Nginx + Redis
cp .env.example .env        # then paste keys from `supabase status`
```

`supabase start` prints the local `anon` and `service_role` keys; copy them into
`.env`. Environment variables are validated at startup by `src/lib/env.ts`.

## Run

```sh
bun run dev                 # Next.js dev server on :3000
```

- API reference: `http://app.localhost`
- Public resource page: `http://resource.localhost/<slug>`
- Health check: `http://app.localhost/api/health`

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `bun run dev`          | Start the Next.js dev server             |
| `bun run build`        | Production build                         |
| `bun run start`        | Start the production server              |
| `bun run lint`         | ESLint                                   |
| `bun run format`       | Prettier (write)                         |
| `bun run format:check` | Prettier (check)                         |
| `bun run typecheck`    | TypeScript, no emit                      |
| `bun run test`         | Vitest, single run                       |
| `bun run test:watch`   | Vitest, watch mode                       |
| `bun run plop`         | Scaffold a feature (`plop resource <n>`) |

## Database

Migrations and seeds are managed by the Supabase CLI.

```sh
supabase db reset           # apply migrations, then run supabase/seed.sql
```

Migrations live under `supabase/migrations/` and are added in Phase 3. The seed
file `supabase/seed.sql` is intentionally empty until then.

## Verify

```sh
# API (through Hono via Next.js)
curl -i http://127.0.0.1:3000/api/health
# Hostname routing (requires the dev server on :3000)
curl -i http://app.localhost/
curl -i http://resource.localhost/ai-agents-101
# Redis
docker compose exec redis redis-cli ping        # -> PONG
# Storage API (returns the Storage version)
curl -i http://127.0.0.1:54321/storage/v1/version
```

## Testing

Vitest runs unit tests colocated with the code (e.g.
`src/server/api.test.ts`). Integration, end-to-end, and infrastructure smoke
tests are added in later phases (Vitest and Playwright).

## Everyday commands

```sh
supabase status        # show URLs and keys
supabase start         # start local Supabase
supabase stop          # stop local Supabase
docker compose up -d   # start Nginx + Redis
docker compose down    # stop Nginx + Redis
```

## Shutdown

```sh
docker compose down    # stops Nginx + Redis
supabase stop          # stops local Supabase
```
