"""Bord API — FastAPI server (remplace cockpit_server.py)."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analytics import planner
from analytics.muscle_groups import (
    analyze_imbalances,
    get_cumulative_volume,
    get_weekly_volume,
)
from analytics.training_load import (
    analyze_running,
    build_daily_tss,
    compute_acwr,
    compute_pmc,
    compute_wakeboard_score,
    get_health_metrics,
)
from api import deps
from api.routes import activities, health, muscles, training
from api.routes import planner as planner_routes
from pipeline.schema import get_connection, init_db, migrate_db

logger = logging.getLogger("bord.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup : migration DB + config."""
    # Config depuis .env ou variables d'environnement
    db_path = Path(os.getenv("BORD_DB", "athlete.db"))
    api_token = os.getenv("BORD_API_TOKEN", "")

    deps.DB_PATH = db_path
    deps.API_TOKEN = api_token

    # Initialisation + migration DB au démarrage
    try:
        conn = init_db(db_path)
        conn.close()
        conn = get_connection(db_path)
        migrate_db(conn)
        conn.close()
        print(f"✅ DB initialisée et migrée : {db_path}")
    except Exception as e:
        logger.error("Migration DB échouée: %s", e, exc_info=True)
        print(f"⚠️  Migration DB: {e}")

    print("🚀 Bord API démarrée")
    print(f"   DB: {db_path}")
    if api_token:
        print("   API write protection: enabled")

    yield


app = FastAPI(
    title="Bord API",
    description="API du tableau de bord personnel",
    version="4.0.0",
    lifespan=lifespan,
)

# CORS pour Next.js (dev sur port 3001) + armor-analytics (port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrer les routers
app.include_router(planner_routes.router)
app.include_router(planner_routes.calendar_router)
app.include_router(health.router)
app.include_router(training.router)
app.include_router(muscles.router)
app.include_router(activities.router)


# ── Helpers dashboard ─────────────────────────────────────────────────


def _compute_rings(metrics: dict, acwr: dict, readiness: dict) -> dict:
    """Calcule les 3 anneaux : Recovery, Activity, Sleep."""
    acwr_val = acwr.get("acwr", 0)
    acwr_low_data = acwr.get("low_data", False)

    if acwr_low_data:
        activity_ring = max(30, int(acwr_val / 0.8 * 60))
    elif 0.8 <= acwr_val <= 1.3:
        activity_ring = 100
    elif acwr_val < 0.8:
        activity_ring = int(acwr_val / 0.8 * 100)
    else:
        activity_ring = max(0, int(100 - (acwr_val - 1.3) / 0.7 * 100))

    sleep_h = metrics.get("sleep_h") or 0
    if 7.5 <= sleep_h <= 9.0:
        sleep_ring = 100
    elif sleep_h >= 6.5:
        sleep_ring = int(60 + 40 * (sleep_h - 6.5))
    elif sleep_h >= 5.0:
        sleep_ring = int(20 + 40 * (sleep_h - 5.0) / 1.5)
    elif sleep_h > 0:
        sleep_ring = int(sleep_h / 5.0 * 20)
    else:
        sleep_ring = 0

    return {
        "recovery": {
            "score": readiness["score"],
            "label": readiness["label"],
            "color": readiness["color"],
        },
        "activity": {
            "score": min(100, max(0, activity_ring)),
            "label": (
                "Charge insuffisante" if acwr_low_data
                else "Optimal" if 0.8 <= acwr_val <= 1.3
                else "Sous-charge" if acwr_val < 0.8
                else "Surcharge"
            ),
            "color": (
                "#8e8e93" if acwr_low_data
                else "#30d158" if 0.8 <= acwr_val <= 1.3
                else "#ff9f0a" if acwr_val < 0.8
                else "#ff3b30"
            ),
        },
        "sleep": {
            "score": min(100, max(0, sleep_ring)),
            "label": f"{sleep_h:.1f}h" if sleep_h else "—",
            "color": (
                "#30d158" if sleep_ring >= 80
                else "#ff9f0a" if sleep_ring >= 50
                else "#ff3b30"
            ),
        },
    }


def _compute_muscle_data(conn) -> dict:
    """Calcule zones heatmap, volume hebdo et alertes musculaires."""
    muscle_cumul = get_cumulative_volume(conn, weeks=4)
    muscle_weekly = get_weekly_volume(conn, weeks=8)
    muscle_alerts = analyze_imbalances(muscle_cumul, weeks=4)

    max_sets = max(
        (v.get("sets_per_week", 0) for v in muscle_cumul.values()),
        default=1,
    ) or 1
    zones = {}
    for mg, data in muscle_cumul.items():
        spw = data.get("sets_per_week", 0)
        zones[mg] = round(min(1.0, max(0.05, spw / max_sets)) if spw > 0 else 0.05, 2)

    return {"zones": zones, "weekly_volume": muscle_weekly, "alerts": muscle_alerts}


def _get_recent_activities(conn) -> list[dict]:
    """10 dernières activités."""
    recent = conn.execute(
        """
        SELECT id, source, type, name, started_at, duration_s, distance_m,
               calories, avg_hr, tss_proxy
        FROM activities WHERE started_at IS NOT NULL
        ORDER BY started_at DESC LIMIT 10
        """,
    ).fetchall()
    return [
        {
            "id": r[0], "source": r[1], "type": r[2], "name": r[3],
            "started_at": r[4], "duration_s": r[5], "distance_m": r[6],
            "calories": r[7], "avg_hr": r[8], "tss": round(r[9], 1) if r[9] else None,
        }
        for r in recent
    ]


def _get_hours_series(conn) -> list[dict]:
    """Heures d'entraînement par semaine (12 dernières)."""
    hours = [
        dict(r) for r in conn.execute(
            """
            SELECT strftime('%Y-W%W', started_at) AS week,
                   ROUND(SUM(COALESCE(duration_s,0))/3600.0, 2) AS hours
            FROM activities WHERE started_at IS NOT NULL
            GROUP BY week ORDER BY week DESC LIMIT 12
            """
        ).fetchall()
    ]
    hours.reverse()
    return hours


# ── Endpoint agrégat /api/dashboard ────────────────────────────────


@app.get("/api/dashboard", tags=["dashboard"])
def dashboard_aggregate():
    """Agrégat complet : toutes les données pour le frontend en 1 requête."""
    with deps.db_connection() as conn:
        # Métriques santé
        metrics = get_health_metrics(conn)

        # PMC
        daily_tss = build_daily_tss(conn)
        pmc = compute_pmc(daily_tss)
        current_pmc = pmc[-1] if pmc else {}

        # ACWR
        acwr = compute_acwr(daily_tss)

        # Readiness
        freshness = {
            "hrv": metrics.get("hrv_freshness", 0),
            "sleep": metrics.get("sleep_freshness", 0),
            "rhr": metrics.get("rhr_freshness", 0),
            "body_battery": metrics.get("body_battery_freshness", 0),
        }
        readiness = compute_wakeboard_score(
            hrv_val=metrics.get("hrv"),
            hrv_baseline=metrics.get("hrv_baseline"),
            sleep_h=metrics.get("sleep_h"),
            acwr_val=acwr.get("acwr", 0),
            rhr_val=metrics.get("rhr"),
            rhr_baseline=metrics.get("rhr_baseline"),
            body_battery=metrics.get("body_battery"),
            freshness=freshness,
        )

        # Running
        running = analyze_running(conn, weeks=12)

        # Planner events
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        events_start = (week_start - timedelta(days=7)).strftime("%Y-%m-%dT00:00:00")
        events_end = (week_start + timedelta(days=21)).strftime("%Y-%m-%dT23:59:59")
        events = planner.get_planner_events_db(
            deps.DB_PATH, start_at=events_start, end_at=events_end
        )
        week_summary = planner.weekly_category_summary(events, week_start)
        board = planner.get_board_tasks_db(deps.DB_PATH)

        # PMC série (6 derniers mois)
        pmc_series = [
            {"date": d["date"], "ctl": round(d.get("ctl", 0), 1),
             "atl": round(d.get("atl", 0), 1), "tsb": round(d.get("tsb", 0), 1)}
            for d in pmc[-180:]
        ]

        return {
            "ok": True,
            "health": metrics,
            "readiness": readiness,
            "rings": _compute_rings(metrics, acwr, readiness),
            "acwr": acwr,
            "pmc": {
                "current": {
                    "ctl": current_pmc.get("ctl", 0),
                    "atl": current_pmc.get("atl", 0),
                    "tsb": current_pmc.get("tsb", 0),
                },
                "series": pmc_series,
            },
            "running": running,
            "muscles": _compute_muscle_data(conn),
            "week": {
                "start": str(week_start),
                "summary": week_summary,
                "events": events,
                "board": board,
            },
            "activities": {
                "recent": _get_recent_activities(conn),
                "hours_series": _get_hours_series(conn),
            },
        }


# ── Lancement direct ───────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("BORD_PORT", "8765"))
    uvicorn.run(
        "api.main:app",
        host="127.0.0.1",
        port=port,
        reload=True,
    )
