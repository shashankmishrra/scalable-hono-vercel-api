# ResourceBox Design System

A single source of truth for the visual language of ResourceBox. It covers the
two surfaces: the read-only API reference at `app.localhost` and the public
resource page at `resource.localhost/:slug`. Both are dark, dense, and quiet.

Values, not adjectives. When a value is not listed here, do not invent one.

---

## 1. Visual direction

Dark, low-noise developer tool. Hierarchy comes from type weight and spacing,
not colour or decoration. Content sits on near-black surfaces separated by
1px hairlines; nothing glows and nothing floats. Code is monospaced, the shell
is not. Colour appears only as a status or method signal, never as ambience.

The interface should read as an instrument: precise, dense, calm.

Not: bright, playful, gradient-heavy, card-on-card, or animated.

---

## 2. Colors

Dark theme is canonical for the MVP. Light mode is out of scope.

| Token | Value | Role |
|---|---|---|
| `bg` | `#0a0a0a` | Page ground |
| `surface` | `#141416` | Panels, cards, sidebars, inset regions |
| `surface-raised` | `#1c1c1f` | Popovers, hovered rows, active nav |
| `border` | `#262629` | 1px hairlines and dividers |
| `border-strong` | `#3a3a3e` | Focused inputs, active separators |
| `ink` | `#f2f2f2` | Headings and primary text |
| `muted` | `#9a9aa2` | Labels, captions, metadata, secondary text |
| `primary` | `#ffffff` | Primary buttons and key affordances |
| `on-primary` | `#0a0a0a` | Text on `primary` |
| `success` | `#22c55e` | Completed status, `POST` badge, `200` |
| `info` | `#3b82f6` | `GET` badge, links |
| `warning` | `#f59e0b` | `409` / conflicts |
| `error` | `#ef4444` | `4xx`/`5xx`, validation, destructive |

Rules:
- `primary` is only for the single most important action per view. It is not a
  border, badge, or hover colour.
- Status/method colour is the only chromatic accent in a view.
- Pair every fill with its ink; default text on a filled control is
  `on-primary`, not `ink`.

---

## 3. Typography

| Family | Use |
|---|---|
| `Inter, system-ui, sans-serif` | All UI and prose |
| `'JetBrains Mono', ui-monospace, monospace` | Code, paths, method badges, IDs, slugs |

| Token | Size | Weight | Line height | Use |
|---|---|---|---|---|
| `display` | 40px | 700 | 1.1 | Page title (`Create a resource`) |
| `heading-lg` | 24px | 600 | 1.25 | Section title (`Request`, `Response`) |
| `heading-md` | 18px | 600 | 1.3 | Card title (`Download`, `Resource details`) |
| `body` | 15px | 400 | 1.6 | Paragraphs, list items, table values |
| `label` | 13px | 500 | 1.4 | Field labels, sidebar items |
| `caption` | 12px | 400 | 1.4 | Metadata, helper text, status codes |
| `eyebrow` | 11px | 600 | 1.4 | Uppercase group labels (`ENDPOINTS`, `RESOURCES`), `+0.06em` tracking |

Rule: at most three sizes visible in one viewport section.

---

## 4. Spacing and layout

Base unit: `4px`. Use only these steps: `4, 8, 12, 16, 24, 32, 48, 64, 96`.

- `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `2xl` 48 · `3xl` 64
- Card padding: `lg` (24px)
- Gap between stacked cards/sections: `lg` (24px)
- Page content max width: `1200px`; page gutters `xl` (32px)
- Admin: fixed left sidebar `280px` + fluid main + right example panel `360px`
- Public: fluid main content + right rail `380px`, collapsing to one column
  under `1024px`

Breakpoints: `640 · 768 · 1024 · 1280`.

---

## 5. Shape and depth

- Radius: `6px` for controls and inputs, `10px` for cards and panels,
  `9999px` for status pills only. Do not mix radii within one view.
- Depth comes from `surface` contrast against `bg` and from 1px `border`.
  `box-shadow` is not used for elevation.
- No gradients anywhere, including buttons and previews.

---

## 6. Components

### Header (both pages)
Height `64px`, `surface` background, 1px bottom `border`. Left: cube logo +
`ResourceBox` wordmark + scope badge (`Local` on admin, `Public` on public).
Right: nav links (`caption`/`label`, `muted`, active = `ink`) and a theme
toggle icon. Admin nav: `API Reference`, `Changelog`. Public nav: `View API
Docs` button (`primary` outline).

### Sidebar (admin)
`280px`, `surface`, 1px right `border`. Top: search input with `⌘K` hint.
Groups separated by `eyebrow` labels (`ENDPOINTS`, `PUBLIC PAGES`). Items are
`label` size, `muted`; hover → `surface-raised`; active → `surface-raised` +
`ink`. Expandable groups (`Resources`, `Uploads`) use a chevron; children are
indented.

### Endpoint header
Breadcrumb `eyebrow` (`RESOURCES`) above a `display` title. Method badge:
monospace, uppercase, small pill, colour by method (`POST` `success`, `GET`
`info`), on a tinted background of the same hue. Path in `body` mono. Right:
`Try it out` outline button.

### Parameter / data tables
Two-column rows: left = field name (`body`, mono optional) + type (`caption`,
`muted`) + description; right = example value or control. Required marker `*`
in `error`. Rows separated by `border`; no zebra striping.

### Code block
`surface-raised` background, `border`, radius `10px`, mono `caption`, `bg`
inset. Top-right copy icon affordance. Used for requests and responses.

### Segmented tabs
Inline row (e.g. `curl · JavaScript · Python · HTTP`, `Body · Headers ·
JSON`, `Description · File Info · Related`). Active tab = `ink` on
`surface-raised`; inactive = `muted`.

### Primary button
Fill `primary`, text `on-primary`, radius `6px`, height `40px`, padding
`12px 20px`, weight 500. Full width in the public Download and admin Send
request contexts.

### Outline button
Transparent fill, 1px `border`, text `ink`, same height as primary. Used for
`Try it out`, `View API Docs`.

### Status pill
Radius full, tinted background, `caption` text, leading colour dot. Maps to
resource status: `pending` (`warning`), `completed` (`success`), `failed`
(`error`).

### Status-code list
Row per code: coloured dot + code (mono) + description (`caption`, `muted`),
separated by `border`.

### Public resource page
- Breadcrumb: home icon › `Resources` › `{slug}`.
- Status pill, `display` title, `body` `muted` description.
- Meta row: date, file type, file size, each with a leading icon.
- Document preview card: toolbar (filename, page `n / N`, zoom, search,
  fullscreen) over an inset preview area.
- Tabs: `Description` (prose), `File Info`, `Related`.
- Right rail cards: `Download` (file icon, name, size · type, full-width
  Download button, hosting note), `Resource details` (Name, Slug, File type,
  File size, Created at, Status — label/value rows), `Share` (read-only URL
  input + copy, X, LinkedIn, Copy link).
- Footer: logo + tagline left; `API Docs`, `Changelog`, `GitHub`, theme
  toggle right.

### Empty, loading, error states
- Loading: skeleton blocks matching the final layout. No centered spinner.
- Empty: short message in `muted`; never a blank region.
- Error / missing resource: `error`-tinted message with a retry affordance;
  never expose stack traces or internal identifiers.

---

## 7. Interaction states

- Hover: background lightens to `surface-raised`; no colour shift, no lift.
- Active/pressed: primary fill darkens slightly; no transform.
- Focus: 2px `border-strong` outline with 2px offset on every focusable
  element. Never remove it.
- Disabled: 50% opacity, `not-allowed` cursor, fill unchanged.
- Motion: colour/opacity transitions only, `150ms`. Respect
  `prefers-reduced-motion`.

---

## 8. Content and tone

- Labels are sentence case; eyebrow group labels are uppercase.
- Button text is an imperative verb (`Download file`, `Send request`,
  `Try it out`).
- API errors use the envelope from `mvp.md`:
  `{ "error": { "code", "message" }, "requestId" }` — code uppercase
  snake case, message human-readable and safe.
- Metadata is terse: dates, sizes, and types, no filler.

---

## 9. Avoid

- Gradients anywhere.
- Drop shadows for elevation.
- More than one accent colour on a screen.
- Colour on borders, badges, or hovers that are not status/method signals.
- Radii or font sizes outside this file.
- Timestamps in `${created_at}` style; format them readably.
- Admin request execution beyond the read-only documentation surface
  (no forms, mutations, or "try it" behaviour).
- Emoji as icons; animation beyond a 150ms colour/opacity change.

---

*Derived from `artefacts/admin-page-design.png` and
`artefacts/public-page-design.png`, consistent with `docs/mvp.md`,
`docs/engineering-doc.md`, and `docs/implementation-roadmap.md`.*
