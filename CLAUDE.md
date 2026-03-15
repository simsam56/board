# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

- **Backend**: FastAPI (Python 3.11+) on port 8765
- **Frontend**: Next.js 16 + React 19 + TypeScript on port 3001
- **Database**: SQLite (WAL mode, FK enabled, 10s timeout) — `athlete.db`
- **Startup**: `./start-board.command` launches both backend and frontend
- **Project name**: Bord (pyproject.toml uses "performos" for historical reasons — ignore it)

## Project structure

```
api/            → FastAPI app + routes (activities, calendar, health, muscles, planner, training)
api/main.py     → App entry, lifespan, CORS, router registration, /api/dashboard aggregate endpoint
api/deps.py     → get_db() / get_db_rw(), require_auth, @cached decorator with invalidate_cache()
analytics/      → Business logic (training_load, planner, muscle_groups, sports_agent)
pipeline/       → Data ingestion & schema (parse_garmin_connect, parse_apple_health, parse_strava_fit)
integrations/   → Apple Calendar sync (macOS only, EventKit + AppleScript fallback)
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

# Lint with autofix
ruff check --fix .

# Type check (strict on analytics/)
mypy analytics/

# Backend dev (standalone)
python3 -m uvicorn api.main:app --host 127.0.0.1 --port 8765

# Frontend dev
cd frontend && npm run dev

# Frontend build (also validates TypeScript)
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

Frontend proxy: `/api/python/:path*` → `http://127.0.0.1:8765/api/:path*` (configured in `next.config.ts`).

## Data sources

- **Garmin Connect** (primary, real-time): activities, RHR, HRV, sleep, Body Battery, stress, VO2max via `pipeline/parse_garmin_connect.py`
- **Strava FIT files** (historical): activities + strength training sets via `pipeline/parse_strava_fit.py`
- **Apple Health XML** (historical only — no Apple Watch): used for historical HRV, RHR, steps, walk metrics via `pipeline/parse_apple_health.py`
- Deduplication: `deduplicate_activities()` in `pipeline/schema.py`, priority strava_fit > garmin_connect > apple_health

## Key conventions

- API response envelope: `{"ok": true, "<resource>": {...}}` — resource key varies by endpoint (e.g., `metrics`, `rings`, `readiness`, `trends`, `highlights`)
- Auth via `X-Bord-Token` header (optional, set via `BORD_API_TOKEN` env var)
- DB connections: `get_db()` / `get_db_rw()` in `deps.py`, opened/closed per endpoint in try/finally
- `deps.py` module-level vars (`DB_PATH`, `API_TOKEN`) initialized in `main.py` lifespan startup
- Cache: `@cached` decorator registers lru_cache functions; `invalidate_cache()` clears them globally after sync ops
- Schema managed in `pipeline/schema.py` (DDL + `migrate_db()` with safe ALTER TABLE ADD COLUMN)
- Tests use `temp_db` fixture (temporary file-based SQLite, not in-memory) — see `conftest.py`
- Integration tests (requiring running server) marked with `@pytest.mark.integration`
- Categories: `sport`, `yoga`, `travail`, `formation`, `social`, `lecon`, `autre` — French UI labels
- TypeScript types in `frontend/lib/types.ts` mirror backend models
- Ruff: line-length 100, Python 3.11 target
- Commit messages in French: `"feat: ajoute widget HRV"`, `"fix: corrige affichage readiness"`

## API routes

Main aggregate endpoint: **GET `/api/dashboard`** — returns health, readiness, rings, acwr, pmc, running, muscles, week (summary + events + board), activities. This is what `useDashboard()` calls.

Route modules (all under `/api/` prefix):
- `health.py`: `/health/metrics`, `/health/rings`, `/health/weekly-trends`, `/health/highlights`, `/health/readiness`
- `training.py`: `/training/acwr`, `/training/weekly-load`, `/training/running/prediction-history`
- `activities.py`: `/activities/recent`, `/activities/weekly-grouped`, `/activities/weekly-hours`
- `planner.py`: `/planner/tasks` (CRUD), `/planner/events`, `/planner/board`
- `calendar.py`: `/planner/calendar/sync`, `/calendar/status`
- `muscles.py`: `/muscles/*`

## Planner API (task lifecycle)

**POST /planner/tasks** — create task. Key fields:
- `title` (required, 120 char max), `category`, `triage_status`
- Scheduling: `start_at`/`end_at` (ISO strings) OR `task_date`+`task_time`+`duration_min`
- `scheduled` (bool), `sync_apple` (bool, default true if scheduled), `calendar_name`
- Category aliases: `"cardio"`→`"sport"`, `"musculation"`→`"sport"`, `"mobilite"`→`"yoga"`, `"apprentissage"`→`"formation"`, `"relationnel"`→`"social"`

**PATCH /planner/tasks/{id}** — update task. All fields optional.

**Validation**: `end_at` must be after `start_at`, max duration 3 days.

## Analytics modules

- **training_load.py**: `build_daily_tss()`, `compute_pmc()` (CTL/ATL/TSB), `compute_acwr()` (zones with low_data threshold), `compute_wakeboard_score()` (readiness 0-100), `get_health_metrics()` (with freshness factors), `analyze_running()` (Riegel predictions), `generate_highlights()` (intelligent insights), `compute_weekly_trends()`
- **muscle_groups.py**: Weekly volume targets per muscle, agonist/antagonist ratio alerts, imbalance detection
- **planner.py**: Task triage (a_determiner → urgent/a_planifier/non_urgent → termine), category mapping with aliases, weekly summaries

**Pitfall**: `compute_pmc()` and `compute_acwr()` take a `daily_tss` dict, NOT a database Connection.

## Frontend data fetching

API helpers in `frontend/lib/api.ts`:
- `fetchAPI<T>(path)` — GET, throws `ApiError(status, message)` on failure
- `mutateAPI<T>(path, method, body?)` — POST/PATCH/DELETE

TanStack React Query hooks in `frontend/lib/queries/`:
- `useDashboard()` — GET `/api/dashboard`, staleTime 5min, refetch 60s
- `usePlannerEvents(start?, end?)` — GET `/planner/events`, staleTime 10s
- `useBoardTasks()` — GET `/planner/board`, staleTime 10s
- `useCreateTask()` / `useUpdateTask()` / `useDeleteTask()` — mutations that invalidate `["planner-events"]`, `["board-tasks"]`, `["dashboard"]`
- `useSyncCalendar()` — POST `/planner/calendar/sync`, invalidates events + dashboard
- Health-specific: `useHealthHighlights()`, `useWeeklyTrends(weeks)`, `useWeeklyLoad()`, `usePredictionHistory()`

## Frontend patterns

- Pages are `"use client"`, fetch via React Query hooks
- Glass cards: `.glass rounded-2xl p-5` (standard), `.glass-strong` (hero sections like ReadinessCard)
- Animations: `<FadeInSection delay={n}>` with 0.08s increments
- Loading: `<SectionSkeleton variant="pills|chart|map" />` as Suspense fallback
- Domain colors: use `CATEGORY_COLORS` from `lib/constants.ts`, or `style={{ color: "var(--color-xxx)" }}` — avoid Tailwind classes for domain colors like `text-formation` (may not resolve)
- Icons: `lucide-react` exclusively
- Charts: `recharts` with `<ResponsiveContainer>`
- Drag & drop: `@dnd-kit/core` + `@dnd-kit/sortable` (Semaine page)
- Toasts: `sonner`

## Frontend constants

Use shared constants from `frontend/lib/constants.ts` — don't duplicate color maps or labels:
- `CATEGORY_COLORS` — maps category → CSS var (e.g., `var(--color-sport)`)
- `CATEGORY_LABELS` — French labels per category
- `CATEGORY_ICONS` — emoji icons per category
- `TRIAGE_LABELS` / `TRIAGE_ORDER` — triage status display

## Environment variables

- `BORD_DB` — database path (default: `athlete.db`)
- `BORD_API_TOKEN` — API write protection token
- `BORD_PORT` — backend port (default: 8765)
- `GARMIN_EMAIL` / `GARMIN_PASSWORD` — Garmin Connect credentials (primary health data source)
- `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` / `STRAVA_ACCESS_TOKEN` / `STRAVA_REFRESH_TOKEN` — optional, for historical data
