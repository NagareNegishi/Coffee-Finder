---
paths:
  - "js/**"
---

- All Supabase calls go through `js/services/databaseService.js`; no `supabase` use elsewhere.
- Read settings from `CONFIG` in `js/config.js`; no hardcoded radius, cache days or URLs.
- Services are static classes, one concern each; `main.js` only orchestrates.
