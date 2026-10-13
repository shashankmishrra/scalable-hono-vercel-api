# AGENTS.md

## Source of Truth
- `docs/mvp.md` — Product scope and acceptance criteria.
- `docs/implementation-roadmap.md` — Architecture, project structure, API contracts, and implementation phases.
- `docs/engineering-doc.md` — Layer responsibilities and architectural rules.
- `docs/design.md` — UI design tokens and visual specifications. Reference images are in `artefacts/`.

Use these documents as the source of truth. Do not duplicate their contents here.

## Architecture Rules
- **API flow:** Controller → Service → Model → Drizzle → PostgreSQL.
- Controllers handle HTTP; services contain business logic; models handle database operations.
- Services must not import Hono. Models must not depend on services, HTTP, or Redis.
- React Server Components call services directly, never the application's own HTTP API.
- Use Zod for external input validation and Drizzle for all database access.
- Keep the `resources` feature self-contained in `src/features/resources/`.
- The admin page (`app.localhost`) is a read-only API reference. No mutations, forms, interactive API testing, or Swagger UI.

## Stack & Commands
- **Stack:** Bun, Next.js App Router, Hono, TypeScript, Drizzle, and local Supabase PostgreSQL.
- **Infrastructure:** Redis read-through cache (60-second list TTL), BullMQ worker, Docker Compose, and Nginx host routing.
- **Shared SDKs:** Keep caching, uploads, and jobs in `src/lib/cache/`, `src/lib/upload/`, and `src/lib/jobs/`. Support local providers and production integrations (Upstash, S3, and QStash).

| Task | Command |
|---|---|
| Run tests | `bun run test` |
| Verify local infrastructure and SDKs | `bun run verify:infra` |
| Run the worker | `bun run worker` |

Use Vitest for tests, colocated with the code. Playwright E2E tests are planned for later phases.

## Local Hosts
- Admin: `app.localhost`
- Public resource: `resource.localhost/:slug`