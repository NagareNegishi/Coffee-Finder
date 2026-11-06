# Backend invariants

checked: 2026-11-05

Rule categories that must hold on the backend, and where each is enforced or defined.
The citation is authoritative; the rule text is a hint, verify before relying. Lines
marked "gap" are rules the code states but does not fully enforce; lines marked
"closed" are gaps that have since been fixed.

There is no server. "Backend" here is the Supabase data layer and the code that talks
to it.

## Auth & authorization

- The browser uses the anon key only -> `js/config.js:3`
- The anon role has SELECT and INSERT policies on `coffee_shops` and no DELETE policy -> `.github/workflows/cleanup.yml:59`
- Deletes need the service role key, which lives only in GitHub secrets and never in frontend code -> `.github/workflows/cleanup.yml:65`, CLAUDE.md "Configuration"
- gap: `DatabaseService.cleanUpOldCoffeeShops` deletes from the browser and cannot succeed under anon; nothing calls it -> `js/services/databaseService.js:92`
- RLS policies themselves are not in `SQL/`; they exist only in the Supabase project -> `SQL/`

## Data model gotchas

- A shop is identified by `(osm_type, osm_id)`, not by `id`; upserts conflict on that pair -> `SQL/create coffee shops.sql:21`, `js/services/databaseService.js:20`
- `osm_id` is BIGINT because way ids exceed int range -> `SQL/create coffee shops.sql:7`
- `created_at` and `updated_at` are TIMESTAMP without time zone -> `SQL/create coffee shops.sql:18`
- Freshness and cleanup both key off `updated_at`; no SQL in the repo updates it on conflict, and whether a Supabase trigger does is not verified -> `js/services/databaseService.js:79`, `SQL/create coffee shops.sql:19`
- Distance is computed in the RPC (Haversine, km) and returned as `distance_km`; results are ordered by it -> `SQL/function find nearby cafe.sql:45`
- `search_logs.radius_km` is DECIMAL(2,1), so values up to 9.9 -> `SQL/search logs.sql:7`
- `search_history` is replaced by `search_logs` and not used -> `SQL/search history.sql:2`

## Validation

- Column limits: `name` 255 (NOT NULL), `phone` 50, `website` 255, `suburb` and `city` 100; one over-long value fails the whole batch upsert -> `SQL/create coffee shops.sql:9`
- Missing OSM name becomes `Unnamed Venue` before saving -> `js/services/osmService.js:57`
- Ways without a `center` are skipped when parsing -> `js/services/osmService.js:50`
- `logSearch` returns without writing when location, mode or radius is falsy -> `js/services/databaseService.js:126`
- `saveCoffeeShopsToDatabase` returns undefined for an empty list, not a result object -> `js/services/databaseService.js:12`

## Fail-fast config

- gap: nothing checks `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before `createClient` -> `js/config.js:2`
- `fetchAllCoffeeShopsNZ` throws unless called with `forceRun = true` -> `js/services/osmService.js:131`

## Error responses

- Writes return `{ success, data | error }` -> `js/services/databaseService.js:30`
- Reads swallow the error, log it and return `[]`, so a failed read looks like an empty cache and triggers an Overpass fetch -> `js/services/databaseService.js:59`
- `logSearch` logs failures and never throws -> `js/services/databaseService.js:139`
- A non-OK Overpass response throws; `main.js` shows it as a status error -> `js/services/osmService.js:112`, `js/main.js:58`
- CI jobs exit 1 on any Supabase error -> `.github/workflows/cleanup.yml:85`, `.github/workflows/ping.yml:53`
