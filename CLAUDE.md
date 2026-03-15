# Board — Personal Health & Performance Dashboard

## Architecture

- **Backend**: FastAPI (Python 3.11+) on port 8765
- **Frontend**: Next.js 16 + React 19 + TypeScript on port 3001
- **Database**: SQLite (WAL mode) — `athlete.db`
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

# Run including integration tests (requires running server)
python3 -m pytest -m integration

# Lint
ruff check .

# Type check
mypy analytics/

# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build
```

## Key conventions

- API routes under `/api/` prefix, proxied from frontend via `/api/python/`
- Auth via `X-Bord-Token` header (optional, set via `BORD_API_TOKEN` env var)
- Database schema managed in `pipeline/schema.py` (DDL + manual migrations)
- Tests use temporary in-memory SQLite databases
- Integration tests (requiring running server) are marked with `@pytest.mark.integration`
- French UI labels (categories: sport, yoga, travail, formation, social, autre)

## Environment variables

- `BORD_DB` — database path (default: `athlete.db`)
- `BORD_API_TOKEN` — API write protection token
- `BORD_PORT` — backend port (default: 8765)
- `GARMIN_EMAIL` / `GARMIN_PASSWORD` — Garmin Connect credentials
- `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` / `STRAVA_ACCESS_TOKEN` / `STRAVA_REFRESH_TOKEN`
