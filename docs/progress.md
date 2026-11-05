<!-- Update convention: read at session start; update after each major feature
     completes. One line per decision — state the decision, skip the reasoning. -->

Vanilla JS + Vite + Leaflet cafe finder backed by Supabase and the Overpass API. Live: http://nagarenegishi.com/Coffee-Finder/

## Key Decisions

### Backend
- No server. The browser calls Supabase directly with the anon key; RLS protects the tables.
- Nearby search is the Supabase RPC `find_nearby_cafe`; schema and functions live in `SQL/`.

### Data
- Overpass results are cached in `coffee_shops`; results older than 14 days are treated as stale.
- Weekly `cleanup.yml` deletes shops older than 30 days; daily `ping.yml` keeps the free tier awake.

### Deploy
- GitHub Pages serves the `deploy` branch; `main` is development.
- Docker (Vite build + nginx) is the production image, not the dev environment.

## In Progress - pick up next session

- Project seed wrap: container rebuild check and `gh` setup (`gh auth login`, `/label-setup`, `scripts/protect-main.sh`).
