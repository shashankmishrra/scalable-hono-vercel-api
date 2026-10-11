# AGENTS.md

## Repo state
Spec-first: docs only, no application code yet. Build it from `docs/implementation-roadmap.md` in phases. Don't create files ahead of the phase that needs them.

## Source of truth (read before coding)
- `docs/mvp.md` — product scope, UX states, acceptance criteria (the *what*).
- `docs/implementation-roadmap.md` — architecture, project structure, API contract, phases, agent protocol (the *how*).
- `docs/engineering-doc.md` — layer responsibilities and the 18 architectural rules.
- `docs/design.md` — UI design tokens; matches the PNGs in `artefacts/` (the visual source of truth).
- `docs/mvp.md` points at `docs/implementation.md`, which does not exist — `implementation-roadmap.md` is the implementation doc. The roadmap's UI spec is `docs/design.md`, derived from the artefacts.

## Non-negotiable architecture
- One-way flow only: `Controller → Service → Model → Drizzle → PostgreSQL`. Controllers never touch the DB, models never touch services/HTTP/Redis, services never import Hono.
- React Server Components call domain services directly; never call the app's own HTTP API.
- Admin page (`app.localhost`) is a read-only API reference — no "try it", forms, mutations, or Swagger UI.
- Zod validates external input. Drizzle is the only DB access path.
- Keep the `resources` feature self-contained under `src/features/resources/`.

## Stack & commands
Bun + Next.js App Router + Hono + TypeScript; Drizzle + local Supabase Postgres; Redis read-through cache (60s list TTL); BullMQ worker as a separate Bun process; Nginx host routing.
- Scaffold a feature: `bun plop resource <name>` (structure only, no business logic).
- Tests: Vitest (unit/integration primary), Playwright (E2E). No `package.json`/test script exists yet.
- Hostnames: `app.localhost` (admin), `resource.localhost/:slug` (public).
