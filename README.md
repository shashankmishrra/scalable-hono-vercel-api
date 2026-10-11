# ResourceBox

A local-first resource publishing application: a read-only API reference at
`app.localhost` and a public resource page at `resource.localhost/:slug`.

Built with Bun, Next.js (App Router), Hono, TypeScript, Drizzle, and local
Supabase PostgreSQL, with Redis caching and a BullMQ worker.

> **Status:** Phase 1 — local infrastructure. Application code (Next.js, Hono,
> Drizzle) is added in later phases. This README documents the infrastructure
> that exists today.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Compose v2)
- [Bun](https://bun.sh) 1.4+
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
  (`npm i -g supabase`)

## Local services

| Service | Address | Managed by |
|---|---|---|
| Supabase Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Supabase CLI |
| Supabase API gateway (REST / Auth / Storage) | `http://127.0.0.1:54321` | Supabase CLI |
| Supabase Studio | `http://127.0.0.1:54323` | Supabase CLI |
| Redis (cache + BullMQ) | `redis://127.0.0.1:6379` | Docker Compose |
| Nginx (hostname routing) | `http://app.localhost`, `http://resource.localhost` | Docker Compose |
| Next.js app | `http://127.0.0.1:3000` (host process, added in Phase 2) | Bun |

Ports and database version are defined in `supabase/config.toml`; Redis and
Nginx are defined in `docker-compose.yml`. Nginx proxies both hostnames to the
Next.js process on the host (`host.docker.internal:3000`) and preserves the
`Host` header.

## Setup

```sh
supabase start      # starts Postgres, Storage, Auth, REST, Studio
docker compose up -d     # starts Redis and Nginx
cp .env.example .env     # then paste keys from `supabase status`
```

`supabase start` prints the local `anon` and `service_role` keys on first run;
copy them into `.env`.

## Everyday commands

```sh
supabase status     # show URLs and keys
supabase start      # start local Supabase
supabase stop       # stop local Supabase
docker compose up -d     # start Redis + Nginx
docker compose down      # stop Redis + Nginx
```

## Database

Migrations and seeds are managed by the Supabase CLI.

```sh
supabase db reset   # apply migrations, then run supabase/seed.sql
```

Migrations live under `supabase/migrations/` and are added in Phase 3. The seed
file `supabase/seed.sql` is intentionally empty until then.

## Verify infrastructure

```sh
# Postgres
supabase status
# Redis
docker compose exec redis redis-cli ping        # -> PONG
# Storage API (returns the Storage version)
curl -i http://127.0.0.1:54321/storage/v1/version
# Hostname routing (requires the Next.js app on :3000 from Phase 2)
curl -i http://app.localhost/
curl -i http://resource.localhost/
```

## Testing

Unit, integration, and E2E tests are introduced in Phases 2–9 (Vitest and
Playwright). No test runner exists yet.

## Shutdown

```sh
docker compose down      # stops Redis + Nginx
supabase stop       # stops local Supabase
```
