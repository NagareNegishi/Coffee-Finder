# Product

checked: 2026-11-05

Purpose and audience. Claims here may lag; verify against `docs/plans/*/product.md`
and `docs/progress.md`. The citation is authoritative.

## What Coffee Finder is

- A web page that lists cafes near the user's location (or the map centre) on a Leaflet map -> `README.md`, `index.html`
- Each result shows name, address, opening hours, phone, website, distance and an open-now status -> `js/services/uiService.js:38`
- Shop data comes from OpenStreetMap via Overpass and is cached in Supabase -> `js/main.js:22`
- Built as a learning project (JavaScript, APIs, database, deployment) -> `README.md`
- Live at http://nagarenegishi.com/Coffee-Finder/ on GitHub Pages -> `docs/progress.md`

## Who it serves

- Anyone with a browser who wants a cafe nearby; no accounts, no login -> `js/config.js`
- Searches are logged anonymously (coordinates, mode, radius only) -> `js/services/databaseService.js:125`

## What "done well" means

- Fewer Overpass calls: the DB is read first, Overpass only when under 5 results -> `js/main.js:28`
- Cached data stays fresh: results older than 14 days are dropped, rows older than 30 days are deleted -> `js/main.js:29`, `.github/workflows/cleanup.yml`
- Free Supabase tier stays awake -> `.github/workflows/ping.yml`
- Clear status and error messages for location and API failures -> `js/services/locationService.js:42`

## Product boundaries

- No backend of its own; no user accounts -> `CLAUDE.md` "Project Overview"
- Opening-hours parsing covers common OSM formats only; anything else shows as unknown -> `js/services/OpeningHoursService.js:8`
- `rating` is rendered if present but no code produces it -> `js/services/uiService.js:52`
