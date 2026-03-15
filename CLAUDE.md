# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

- **Backend**: FastAPI (Python 3.11+) on port 8765
- **Frontend**: Next.js 16 + React 19 + TypeScript on port 3001
- **Database**: SQLite (WAL mode, synchronous connections) — `athlete.db`
- **Startup**: `./start-board.command` launches both backend and frontend

## Project structure

```
api/            → FastAPI app + routes (activities, calendar, health, muscles, planner, training)
analytics/      → Business logic (training_load, planner, muscle_groups, sports_agent)
pipeline/       → Data ingestion & schema (parse_garmin, parse_apple_health, parse_strava_fit)
integrations/   → External services (apple_calendar)
frontend/       → Next.js app (app router, components, lib)
tests/          → pytest suite
```

## Commands

```bash
# Run tests (excludes integration tests by default)
python3 -m pytest

# Run a single test file
python3 -m pytest tests/test_training_load.py

# Run a single test function
python3 -m pytest tests/test_training_load.py::test_compute_pmc -v

# Run including integration tests (requires running server)
python3 -m pytest -m integration

# Lint
ruff check .

# Type check (strict on analytics/)
mypy analytics/

# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build
```

## Data flow

```
Browser → localhost:3001/api/python/* → Next.js rewrite → localhost:8765/api/*
                                                              ↓
                                                    FastAPI route handler
                                                              ↓
                                                  analytics/* (business logic)
                                                              ↓
                                                    SQLite (athlete.db)
```

Frontend uses TanStack React Query (v5) for data fetching/caching. Custom hooks in `frontend/lib/queries/` wrap `useQuery` with `staleTime` settings. API calls go through `fetchAPI`/`mutateAPI` helpers in `frontend/lib/api.ts`.

## Key conventions

- API response envelope: `{"ok": true, "data": {...}}` or `{"ok": true, "detail": "..."}`
- API routes under `/api/` prefix, proxied from frontend via `/api/python/` (rewrite in `next.config.ts`)
- Auth via `X-Bord-Token` header (optional, set via `BORD_API_TOKEN` env var)
- DB connections: synchronous `sqlite3` with WAL mode, row_factory=`sqlite3.Row`, opened/closed per endpoint in try/finally
- `deps.py` module-level vars (`DB_PATH`, `API_TOKEN`) initialized in `main.py` lifespan startup
- Cache: `@cached` decorator registers lru_cache functions; `invalidate_cache()` clears them globally after sync ops
- Schema managed in `pipeline/schema.py` (DDL + `migrate_db()` with safe ALTER TABLE ADD COLUMN)
- Data dedup: `deduplicate_activities()` uses source priority (strava_fit > garmin_api > apple_health)
- Tests use temporary in-memory SQLite databases (fixtures in `conftest.py`)
- Integration tests (requiring running server) marked with `@pytest.mark.integration`
- French UI labels (categories: sport, yoga, travail, formation, social, autre)
- TypeScript types in `frontend/lib/types.ts` mirror backend Pydantic models

## Analytics modules

- **training_load.py**: PMC (CTL/ATL/TSB), ACWR zones, readiness score (0-100), running analysis with Riegel predictions, health metric freshness
- **muscle_groups.py**: Weekly volume targets per muscle, agonist/antagonist ratio alerts, imbalance detection
- **planner.py**: Task triage (a_determiner → urgent/a_planifier/non_urgent → termine), category mapping with aliases, weekly summaries

## Environment variables

- `BORD_DB` — database path (default: `athlete.db`)
- `BORD_API_TOKEN` — API write protection token
- `BORD_PORT` — backend port (default: 8765)
- `GARMIN_EMAIL` / `GARMIN_PASSWORD` — Garmin Connect credentials
- `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` / `STRAVA_ACCESS_TOKEN` / `STRAVA_REFRESH_TOKEN`
