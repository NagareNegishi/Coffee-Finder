# Architecture

checked: 2026-11-05

The parts and the seams between them. Every line ends in a citation; the citation is
the truth, the line is a hint. Verify before relying.

CLAUDE.md "Architecture" is the prose companion but lags the code -> CLAUDE.md
"Architecture", `app/js/main.js`

## Parts

### Backend - none

- No server code. The browser calls Supabase and Overpass directly -> `app/js/config.js`, `app/js/services/osmService.js:91`

### Frontend - `app/` (`index.html`, `js/`, `style.css`)

- Page shell, settings panel, map container, results container; loads Leaflet 1.9.4 from unpkg and `app/js/main.js` as a module -> `app/index.html`
- Orchestration (search flow, event wiring) -> `app/js/main.js`
- Supabase client and `CONFIG` constants -> `app/js/config.js`
- Database access (read nearby, upsert, log, cleanup) -> `app/js/services/databaseService.js`
- Geolocation and location-mode choice -> `app/js/services/locationService.js`
- Leaflet map, search circle, markers, loading overlay -> `app/js/services/mapService.js`
- Overpass fetch and parse into the DB row shape -> `app/js/services/osmService.js`
- Open-now computation and filter -> `app/js/services/OpeningHoursService.js`
- DOM output, status messages, settings state -> `app/js/services/uiService.js`
- `app/js/OriginalCode.js` is the pre-refactor single file, unused -> `app/js/OriginalCode.js:1`

### Database - hosted Supabase Postgres via supabase-js

- Schema changes are SQL scripts run by hand in the Supabase SQL editor -> `SQL/`, CLAUDE.md "Configuration"
- Tables `coffee_shops` (unique on `osm_type, osm_id`) and `search_logs` -> `SQL/create coffee shops.sql`, `SQL/search logs.sql`
- `search_history.sql` is replaced by `search_logs` and unused -> `SQL/search history.sql:1`

### Tests - none

- No test framework or tests -> `app/package.json`

## Seams

- Browser to Supabase: table upsert/insert and RPC `find_nearby_cafe` -> `app/js/services/databaseService.js`
- Browser to Overpass: POST of a query string to `https://overpass-api.de/api/interpreter` -> `app/js/services/osmService.js:107`
- Browser to Geolocation API -> `app/js/services/locationService.js:31`
- Browser to OSM tile server -> `app/js/services/mapService.js:19`
- GitHub Actions to Supabase: weekly delete (service role) and daily SELECT (anon) -> `.github/workflows/cleanup.yml`, `.github/workflows/ping.yml`
- pg_cron inside Supabase: monthly delete of rows older than 30 days -> `SQL/setup monthly cleanup.sql:35`

## What crosses each seam

- Shop object shape: `osm_id, osm_type, name, latitude, longitude, address, opening_hours, phone, website, suburb, city`; the DB adds `id, created_at, updated_at` and the RPC adds `distance_km` -> `app/js/services/osmService.js:67`, `SQL/function find nearby cafe.sql:10`
- `openNow` (true, false or null) is added client-side and never stored -> `app/js/services/OpeningHoursService.js:87`
- RPC takes `search_lat, search_lon, radius_km, max_results`; the UI radius is in metres and `main.js` divides by 1000 -> `app/js/main.js:28`
- `settings.radius` comes from a range input as a string -> `app/js/services/uiService.js:98`

## Cross-cutting

- Search order: DB read -> drop stale -> Overpass if under 5 -> save -> DB re-read -> open-now -> render -> `app/js/main.js:22`
- Search logging is fire-and-forget, never awaited -> `app/js/main.js:87`
- Services are static classes; shared state is static properties (`MapService.map`, `UIService.settings`) -> `app/js/services/mapService.js:6`, `app/js/services/uiService.js:5`

## Infra

- Dev: Dev Container, Vite dev server on 5173 -> `.devcontainer/devcontainer.json`
- Build: `vite build` with `base: './'` -> `app/vite.config.js`
- Production image: Vite build served by nginx on port 80, mapped to 3000 -> `Dockerfile`, `compose.yaml`
- Hosting: GitHub Pages from the `deploy` branch -> `docs/progress.md`
- CI: cleanup (Mon 09:30 UTC) and ping (daily 09:37 UTC) -> `.github/workflows/`

## Weak or missing seams

- Overpass URL, tile URL, query timeout and the London default circle are hardcoded in services although `CONFIG` holds the same values -> `app/js/services/osmService.js:107`, `app/js/services/mapService.js:19`, `app/js/config.js:34`
- Search defaults (14 days, 5 minimum, 2000 m) are hardcoded in `main.js`; `CONFIG.search` is not read there -> `app/js/main.js:29`, `app/js/config.js:9`
- OSM text (name, address, website) is placed into `innerHTML` and popups unescaped -> `app/js/services/uiService.js:46`, `app/js/services/mapService.js:149`
- Stale cleanup layers overlap: pg_cron monthly and the weekly workflow both delete rows older than 30 days -> `SQL/setup monthly cleanup.sql`, `.github/workflows/cleanup.yml`
- The find-nearby query scans every row (Haversine over the whole table, no bounding-box filter) -> `SQL/function find nearby cafe.sql:50`
- `fetchAllCoffeeShopsNZ` is a bulk-collection helper guarded by a `forceRun` flag -> `app/js/services/osmService.js:130`
