# Frontend invariants

checked: 2026-11-05

Rule categories that must hold on the frontend, and where each is enforced or defined.
The citation is authoritative; the rule text is a hint, verify before relying. Lines
marked "gap" are rules stated somewhere but not mechanically enforced; lines marked
"closed" are gaps that have since been fixed.

## Data flow

- `index.html` -> `js/main.js` -> `js/services/*` -> Supabase / Overpass / Leaflet / DOM -> `index.html:89`
- Only `databaseService.js` imports the Supabase client -> `js/services/databaseService.js:1`, `.claude/rules/js.md`
- `main.js` holds the search state (`userLocation`, `coffeeShops`) and calls services; services do not call `main.js` -> `js/main.js:9`
- `uiService.js` imports `mapService.js` (radius slider moves the circle); no other service imports a sibling -> `js/services/uiService.js:1`
- Services are static classes, one concern each -> `js/services/mapService.js:3`

## API contract consumption

- Services read DOM elements by id; ids must match `index.html`: `status`, `coffeeShops`, `settingsPanel`, `radiusSlider`, `radiusDisplay`, `openingFilter`, `maxResults`, `findCoffeeBtn`, `hamburgerButton`, `map`, `mapLoadingOverlay` -> `index.html`, `js/services/uiService.js`, `js/services/mapService.js`
- The location mode comes from the checked radio `locationMode` (`current` or `map`) -> `js/services/locationService.js:74`
- `OpeningHoursService.addOpenNow` must run before `filterOpenNow`, otherwise the filter returns nothing -> `js/services/OpeningHoursService.js:96`
- `openNow`: true is open, false is closed, null is unknown (hours missing or unparsed) -> `js/services/OpeningHoursService.js:5`
- Radius is metres in the UI and settings, kilometres for the RPC and `search_logs` -> `js/main.js:28`, `js/main.js:87`
- Leaflet is a global `L` loaded by a script tag, not an import -> `index.html:11`, `js/services/mapService.js:14`
- While a search runs the map is locked and an overlay shown; both are undone in `finally` -> `js/main.js:25`, `js/main.js:62`
- gap: shop text (name, address, website) is written with `innerHTML` and popup HTML without escaping -> `js/services/uiService.js:46`, `js/services/mapService.js:149`

## Types

- Plain JavaScript, no types, no JSDoc enforcement; JSDoc on methods is documentation only -> `package.json`

## Routing

- None. One page; the settings panel is toggled with the `show` class -> `js/services/uiService.js:89`
