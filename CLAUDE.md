**Skill work**: before polishing or adding a skill in `.claude/skills/`, read
`docs/skills/new-skills.md` (authoring and polish guide).

**Config work**: changes to `.claude/settings.json` (permissions, hooks) must cite
the relevant code.claude.com docs and get user sign-off before writing.

**Attribution**: never add Claude as author, co-author (`Co-Authored-By`), or
contributor in anything that goes to git — commits, merges, tags, PRs. Enforced
by a PreToolUse hook; policy: `docs/permissions/v3-no-coauthor.md`.

**Session notes** (`docs/notes.md`, gitignored) — before adding a line:
1. Bar: only a reusable directive not already in CLAUDE.md, a skill, or the code.
2. Dedup: refine a related line in place; add new only if none covers it.
3. Shape: matching section, one line, directive voice.
4. Sync: new section → add its index line in `memory/MEMORY.md`; emptied → remove it.

Promote to CLAUDE.md or a skill only with user review. Mechanism: `docs/notes-system.md`.

**Doc voice**:
- Planning or exploring options: keep intention and reasoning.
- Settling, or writing for a future session or reader: cut to the minimum.
- Docs addressed to Claude: write directives, not prose.

**Response style**:
- Answer only what was asked. No preamble, postamble, or summary of what you just did.
- Default concise; match answer length to question length.
- No hedging words (may/might/could/possibly). Verify the claim, or drop it and
  say in one line what could not be verified.
- Ask clarifying questions as plain text; do not use the AskUserQuestion tool.
- Verify version numbers, pricing, and API signatures against official docs, not memory.
- Scope discipline (YAGNI): understand the real goal, then make the smallest change that meets it.

## Project Overview

Coffee Finder finds cafes near the user. It takes the browser location (or a map pick), reads cached shops from Supabase, falls back to the OpenStreetMap Overpass API when the cache has too few results, and shows them on a Leaflet map with distance and opening status. Live at http://nagarenegishi.com/Coffee-Finder/ (GitHub Pages, `deploy` branch).

- **Backend**: none. Supabase is called straight from the browser.
- **Frontend**: vanilla JS (ES modules) + Vite ^4 (`app/`: `index.html`, `js/`, `style.css`)
- **Database**: hosted Supabase Postgres via `@supabase/supabase-js`; schema and functions in `SQL/`, run by hand in the Supabase SQL editor. No local database.
- **Test project**: none

The dev environment runs in a Dev Container (`.devcontainer/`).

## Docs

- `CONTEXT.md` + `context/` — fast-orientation index (parts, seams, invariants,
  direction), citation-per-line, pulled on demand. Not a source of truth — see
  `CONTEXT.md` for the convention and which file to read per task.
- `docs/progress.md` — read at session start; update after each major feature completes.
- `docs/plans/` — per-feature product plan/decision files; read only the relevant file when working on a feature.
- `docs/skills/` — plan/decision docs for the `.claude/skills/` tooling itself (authoring guide + per-skill decision logs). Kept out of `docs/plans/` so product plans don't mix with tooling meta-docs.

## Reusables

`reusables/` holds portable React/TypeScript pieces to copy into projects:
`component/` (app components), `shadcn/` (shadcn/ui primitives), `util/` (helpers
and hooks). Check here before writing a new component or util; not part of any build.

## Commands

No backend and no tests. npm commands run from `app/`; `docker compose` runs from the repo root.

```bash
cd app
npm run dev       # http://localhost:5173
npm run build     # outputs app/dist/
npm run preview
cd .. && docker compose up --build   # production image (Vite build + nginx), http://localhost:3000
```

## Configuration

### Frontend

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - read in `app/js/config.js` via `import.meta.env`. Set in the root `.env` (gitignored; `envDir: '..'` in `app/vite.config.js` points Vite at it); `compose.yaml` passes them as build args. Never read or edit `.env`.
- Search defaults (radius, result counts, cache days, map, Overpass URL) live in `CONFIG` in `app/js/config.js`.

### CI

- `.github/workflows/cleanup.yml` (weekly) deletes shops older than 30 days with `SUPABASE_SERVICE_ROLE_KEY`. `ping.yml` (daily) runs a SELECT so the free tier does not pause. Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- The service role key bypasses RLS. Never use it in frontend code.

## Architecture

### Backend

No server. Supabase tables `coffee_shops` (upsert on `osm_type, osm_id`) and `search_logs`; nearby search is the RPC `find_nearby_cafe` (`SQL/function find nearby cafe.sql`). Access goes only through `app/js/services/databaseService.js`.

### Frontend

`app/index.html` -> `app/js/main.js` -> `app/js/services/*` (one class per concern: database, location, map, osm, opening hours, ui). Flow in `main.js`: read DB cache -> drop results older than 14 days -> if under 5, fetch Overpass and save -> re-read DB (sorted by distance) -> add open-now -> render list and markers. Single page, no router, no path aliases.

### Tests

None yet.

## Skills

- When writing or editing code: follow: `.claude/skills/code-commenting/SKILL.md`
- When committing: follow `.claude/skills/git-commit/SKILL.md` — Conventional
  Commits, atomic commits, `feat`/`fix` need an issue ref.

## Non-negotiable rules

- Don't use AskUserQuestion for open-ended architecture, design, or stack decisions, only for genuinely simple, discrete preference picks. For anything with real tradeoffs, lay out the options and a recommendation in plain text and let the user redirect.

- Read docs before probing - absolute. Verify from docs/,.devcontainer/, CI, or prior output; never inspect package or binary internals or run a throwaway script to find out.

- No em dash, ever: use - instead.

- No AI-clichéd wording, anywhere - write like a person would.

- Never write or edit outside `/workspaces/Coffee-Finder` (scratchpad excepted).

## Response style

- Answer only what was asked. No preamble, postamble, or summary of what you just did.
- Default concise; match answer length to question length.
- No hedging words (may/might/could/possibly). Verify the claim, or drop it and say in one line what could not be verified.
- Verify version numbers, pricing, and API signatures against official docs, not memory.
- Scope discipline (YAGNI): understand the real goal, then make the smallest change that meets it.