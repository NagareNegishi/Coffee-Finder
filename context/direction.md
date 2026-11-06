# Direction & deferrals

checked: 2026-11-05

Where things are heading and what is deliberately not being done. The "why" is the
durable part. Verify status against `docs/progress.md`, `docs/plans/`, and issues.

## Heading toward

Near-term, roughly in queue order:

- Finish wrapping the finished app in the project seed: container rebuild check and `gh` setup -> `docs/progress.md`

## Deferred but real

- Analytics on popular search areas from `search_logs`; no code reads the table yet -> `SQL/search history.sql:4`
- Ratings in the result list; the UI renders `rating` but no source supplies it -> `js/services/uiService.js:52`

## Deliberately deferred (why)

- Nothing recorded. No plan or decision doc exists for Coffee Finder yet -> `docs/plans/`

## Not in scope for the product

- No backend of its own, no accounts -> CLAUDE.md "Project Overview"

## Where the live plans are

- `docs/plans/<feature>/` = per-feature product plan and decision files -> `docs/plans/`
- This file indexes the live plans; it does not replace them.

## Notes for a reader

- Everything under `docs/plans/` today comes from the seed (site-factory, verify-fanout and others), not from Coffee Finder -> `docs/plans/`
- `README.md` Project Structure and Getting Started name a `database/` folder and a `database/cleanup.sql` file; the real folder is `SQL/` and the cleanup script is `SQL/setup monthly cleanup.sql` -> `README.md:62`, `SQL/`
- `PROJECT_CONFIG.md` (deploy and secret names) is gitignored and exists only locally -> `.gitignore`
- `js/OriginalCode.js` and `SQL/search history.sql` are kept for reference and unused -> `js/OriginalCode.js:1`, `SQL/search history.sql:2`
- `docs/` also holds Coffee Finder research notes (Supabase, pg_cron, Leaflet, Overpass data format, NZ data collection) -> `docs/`
