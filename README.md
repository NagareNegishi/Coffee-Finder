# ☕ Coffee Finder

A web application that helps users find coffee shops near their current location using geolocation and OpenStreetMap data.

## 📋 Project Overview

This project is a learning exercise focused on applying JavaScript fundamentals, working with APIs, database integration, and modern deployment workflows. The goal is to demonstrate practical web development skills from development to production.


## 🎯 Learning Objectives

- **JavaScript Fundamentals**: Async/await, Promises, DOM manipulation, error handling
- **Web APIs**: Geolocation API, Fetch API, third-party API integration
- **Database Integration**: Planning for PostgreSQL storage and data processing
- **API Integration**: Working with OpenStreetMap's Overpass API
- **User Experience**: Location-based services, responsive design, status feedback
- **Build Tools**: Vite for modern development and optimized production builds
- **Containerization**: Docker for consistent development environments


## 🚀 Features

- **Location Detection**: Uses browser's Geolocation API to find user's current position
- **Coffee Shop Search**: Queries OpenStreetMap data via Overpass API for nearby cafes
- **Interactive Display**: Shows coffee shops with ratings, distances, and opening status
- **Error Handling**: Comprehensive error messages for location and API failures
- **Responsive Design**: Clean, mobile-friendly interface
- **Data Caching**: Stores results in Supabase to reduce API calls and improve performance


## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Build Tool**: Vite for development server and production builds
- **APIs**:
  - Browser Geolocation API
  - OpenStreetMap Overpass API
  - Leaflet for interactive maps
- **Backend/Database**:
  - Supabase (PostgreSQL) for data storage and caching
  - pg_cron for automated data cleanup
- **DevOps**:
  - Docker & Docker Compose for containerized development
  - GitHub Pages for production deployment


## 📁 Project Structure

```
coffee-finder/
├── index.html          # Main HTML structure
├── js/
│   ├── config.js         # Configuration for Supabase and Overpass API
│   ├── main.js            # Application entry point and initialization
│   └── services/
│       ├── databaseService.js    # Supabase database operations
│       ├── locationService.js    # Geolocation handling
│       ├── mapService.js         # Leaflet map integration
│       ├── OpeningHoursService.js # Opening hours parsing
│       ├── osmService.js         # OpenStreetMap API integration
│       └── uiService.js          # User interface management
├── database/
│   ├── create coffee shops.sql       # Database schema
│   ├── function find nearby cafe.sql # Search function
│   └── setup monthly cleanup.sql     # Automated cleanup setup
├── style.css           # Styling and responsive design
└── README.md           # Project documentation
```

## 🚦 Getting Started

1. Clone the repository
2. Set up Supabase database:
   - Run `database/create coffee shops.sql` in Supabase SQL Editor
   - Run `database/function find nearby cafe.sql` for search functionality
   - Run `database/cleanup.sql` for automated data maintenance
3. Configure Supabase connection in `js/config.js`
4. Open `index.html` in a web browser
5. Allow location access when prompted
6. Click "Find Coffee Shops" to search for nearby cafes


## 🐳 Docker Setup

### Local Development with Docker

This project can be run in a Docker container for consistent development environments.

#### Prerequisites
- Docker and Docker Compose installed
- `.env` file with Supabase credentials:
```env
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### Running with Docker
```bash
# Build and start the container
docker compose up --build

# Access the app at http://localhost:3000

# Stop the container
docker compose down
```

#### Docker Architecture
- **Stage 1**: Builds the Vite app with Node.js
- **Stage 2**: Serves built files with nginx

### Branch Structure
- **`main`**: Source code with Docker setup for development
- **`deploy`**: Built static files deployed to GitHub Pages










/////
# Project Seed

Template repository: a stack-agnostic dev container with a Claude Code sandbox
behind an outbound firewall, plus portable skills, path-scoped rules, and
reference docs. New projects start from this repo (GitHub → "Use this template").

## Layout

- `.devcontainer/` — generic container: app service, firewall, Claude Code. Placeholders marked `<placeholder>`.
- `.claude/` — permissions (`settings.json`), path-scoped rules example, portable skills.
- `CONTEXT.md` + `context/` — skeleton for a per-project fast-orientation index (parts,
  seams, invariants, direction), citation-per-line, pulled on demand rather than
  auto-loaded. Fill in once the architecture settles — `CONTEXT.md` explains the
  convention; delete both if the project stays small enough that CLAUDE.md covers it.
- `docs/` — `progress.md` template, `plans/` convention, `reference/` concept docs,
  `notes-system.md` (session-notes convention), `session/` (baton template for the
  `session-start`/`session-end` skills; the filled `baton.md` is gitignored).
  `reference/project-specific/` holds the seed author's own worked examples
  (real domain, real AWS decisions) — read for ideas, don't carry into a new
  project; delete it during instantiation if you don't want it.
- `examples/stack/<stack>/` — real files from working projects; the stack-specific pieces the seed leaves out.
- `examples/cicd/` — real GitHub Actions pipelines (test gates, deploy, dependency updates) from working projects.
- `reusables/` — portable React/TypeScript pieces carried between projects: `component/` (app components), `shadcn/` (shadcn/ui primitives), `util/` (helpers and hooks). Copy what a new project needs; not wired into any build.

## Instantiation checklist

1. Create a repo from this template and open it locally.
2. Pick a stack from `examples/stack/` and merge its files over the `<placeholder>` markers (its README says what goes where): Dockerfile base image + packages, compose services/volumes, devcontainer ports/mounts/env/postCreate, firewall stack domains. Then delete the `examples/` entries you didn't use.
3. Create `.devcontainer/.env` from `.env.example` and fill the values.
4. Fill `CLAUDE.md` (skeleton at repo root) and `.claude/rules/` paths.
   Review `LICENSE` — the seed ships MIT under the seed author's name; replace or
   delete it if this project is closed-source or licensed differently.
5. Open in the dev container ("Reopen in Container"). The firewall runs on every start; only allowlisted domains are reachable.
6. Set up GitHub for the repo (one-time) — see "GitHub issue & PR skills" below:
   authenticate `gh`, run `/label-setup`, and protect the default branch with
   `scripts/protect-main.sh`. The publish and label skills stop until `gh` is
   authenticated.
7. After the first feature, start updating `docs/progress.md`. Once the architecture
   has settled, fill in `CONTEXT.md` + `context/` (or delete both if the project
   stays small enough that CLAUDE.md covers orientation on its own).

## Claude credentials volume

`docker-compose.yml` mounts a volume with the fixed name `claude-credentials`:
every project built from this seed shares one Claude login/config. Log in once
in any of them; delete the volume to reset.

## Firewall

`.devcontainer/project-firewall.sh` allows GitHub (dynamic IP ranges),
`api.anthropic.com`, `registry.npmjs.org`, and `api.osv.dev` (owasp-* skills).
Add stack domains at the marked insertion point — examples ship ready-made blocks.

## GitHub issue & PR skills

The seed ships paired skills for drafting and publishing GitHub issues and PRs:
`github-issue-creator` + `issue-publish`, `pr-draft` + `pr-publish`, and
`label-setup`. Three one-time steps per project before first use:

1. Authenticate `gh` yourself with `gh auth login`. No skill runs it, and the
   publish and label skills stop with a reminder if `gh` isn't authenticated.
2. Run `/label-setup` once. It creates the preset labels from
   `.claude/skills/label-setup/labels.yml` in the repo. Publishing a draft that
   names a label the repo lacks stops, because the publish skills never create
   labels. Edit `labels.yml` first if you want a different set.
3. Run `scripts/protect-main.sh` once to protect the default branch: require a
   PR to merge, block force-push and deletion. It shows the plan and asks before
   applying (`-y` skips the prompt); re-running updates the same ruleset. Needs
   admin on the repo. Required status checks are off by default — flip on
   `REQUIRED_CHECKS` in the script once this project has CI.

Then the flow is draft (`/pr-draft` or `/github-issue-creator`), review the file,
publish (`/pr-publish` or `/issue-publish`). Design notes:
`docs/skills/pr-issue-publish.md`.

## Build orchestration

`build-orchestration` runs a feature build as a multi-agent session. The main Claude
session acts as manager: it cuts the feature into units and spawns implementer,
tester, and adviser subagents to build, test, and review the work to completion, with
guardrails that keep it from thrashing on a unit that won't pass. Run it with
`/build-orchestration`; it never starts on its own.

It drives the subagent fleet in `.claude/agents/` (catalog in
[`docs/agents/README.md`](docs/agents/README.md)) and needs a feature plan under
`docs/plans/<feature>/` to build from. Design notes:
[`docs/skills/build-orchestration-design-notes.md`](docs/skills/build-orchestration-design-notes.md).

## Claude attribution

Claude must never appear as a contributor in projects built from this seed. The
seed ships three layers, and all of them carry over on instantiation — keep them:

1. `.claude/settings.json` sets `attribution.commit` to `""`, so Claude Code
   does not generate the `Co-Authored-By` trailer.
2. `CLAUDE.md` states the rule (top block, "Attribution").
3. A PreToolUse hook (`.claude/hooks/coauthor-guard.sh`) blocks any command
   carrying a co-author trailer or the Claude author identity, as a backstop
   for the known cases where the setting alone fails.

Policy and verification: `docs/permissions/v3-no-coauthor.md`.
