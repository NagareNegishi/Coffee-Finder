# Frontend invariants

checked: 2026-11-05

Rule categories that must hold on the frontend, and where each is enforced or defined.
The citation is authoritative; the rule text is a hint, verify before relying. Lines
marked "gap" are rules stated somewhere but not mechanically enforced; lines marked
"closed" are gaps that have since been fixed.

## Data flow

- `app/index.html` -> `app/js/main.js` -> `app/js/services/*` -> Supabase / Overpass / Leaflet / DOM -> `app/index.html:89`
- Only `databaseService.js` imports the Supabase client -> `app/js/services/databaseService.js:1`, `.claude/rules/js.md`
- `main.js` holds the search state (`userLocation`, `coffeeShops`) and calls services; services do not call `main.js` -> `app/js/main.js:9`
- `uiService.js` imports `mapService.js` (radius slider moves the circle); no other service imports a sibling -> `app/js/services/uiService.js:1`
- Services are static classes, one concern each -> `app/js/services/mapService.js:3`

## API contract consumption

- Services read DOM elements by id; ids must match `app/index.html`: `status`, `coffeeShops`, `settingsPanel`, `radiusSlider`, `radiusDisplay`, `openingFilter`, `maxResults`, `findCoffeeBtn`, `hamburgerButton`, `map`, `mapLoadingOverlay` -> `app/index.html`, `app/js/services/uiService.js`, `app/js/services/mapService.js`
- The location mode comes from the checked radio `locationMode` (`current` or `map`) -> `app/js/services/locationService.js:74`
- `OpeningHoursService.addOpenNow` must run before `filterOpenNow`, otherwise the filter returns nothing -> `app/js/services/OpeningHoursService.js:96`
- `openNow`: true is open, false is closed, null is unknown (hours missing or unparsed) -> `app/js/services/OpeningHoursService.js:5`
- Radius is metres in the UI and settings, kilometres for the RPC and `search_logs` -> `app/js/main.js:28`, `app/js/main.js:87`
- Leaflet is a global `L` loaded by a script tag, not an import -> `app/index.html:11`, `app/js/services/mapService.js:14`
- While a search runs the map is locked and an overlay shown; both are undone in `finally` -> `app/js/main.js:25`, `app/js/main.js:62`
- gap: shop text (name, address, website) is written with `innerHTML` and popup HTML without escaping -> `app/js/services/uiService.js:46`, `app/js/services/mapService.js:149`

## Types

- Plain JavaScript, no types, no JSDoc enforcement; JSDoc on methods is documentation only -> `app/package.json`

## Routing

- None. One page; the settings panel is toggled with the `show` class -> `app/js/services/uiService.js:89`
