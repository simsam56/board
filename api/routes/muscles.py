"""Routes analyse musculaire."""

from __future__ import annotations

from fastapi import APIRouter

from analytics.muscle_groups import (
    analyze_imbalances,
    get_cumulative_volume,
    get_recent_sessions,
    get_weekly_volume,
)
from api.deps import db_connection

router = APIRouter(prefix="/api/muscles", tags=["muscles"])

# Groupes musculaires pour le heatmap
MUSCLE_GROUPS = [
    "Pecs", "Dos", "Épaules", "Biceps", "Triceps",
    "Core", "Quadriceps", "Ischio-jambiers", "Mollets", "Fessiers",
]


@router.get("/volume")
def muscle_volume(weeks: int = 8) -> dict:
    """Volume musculaire par semaine et groupe."""
    with db_connection() as conn:
        weekly = get_weekly_volume(conn, weeks=weeks)
        return {"ok": True, "weekly_volume": weekly}


@router.get("/heatmap")
def muscle_heatmap(weeks: int = 4) -> dict:
    """Carte de chaleur musculaire : opacité par groupe (0-1)."""
    with db_connection() as conn:
        cumul = get_cumulative_volume(conn, weeks=weeks)
        max_sets = max(
            (v.get("sets_per_week", 0) for v in cumul.values()),
            default=1,
        )
        if max_sets == 0:
            max_sets = 1

        zones = {}
        for mg in MUSCLE_GROUPS:
            data = cumul.get(mg, {})
            spw = data.get("sets_per_week", 0)
            opacity = min(1.0, max(0.05, spw / max_sets)) if spw > 0 else 0.05
            zones[mg] = {
                "opacity": round(opacity, 2),
                "sets_per_week": round(spw, 1),
                "total_sets": data.get("total_sets", 0),
                "total_reps": data.get("total_reps", 0),
            }

        return {"ok": True, "zones": zones}


@router.get("/imbalances")
def muscle_imbalances(weeks: int = 4) -> dict:
    """Détection des déséquilibres musculaires."""
    with db_connection() as conn:
        cumul = get_cumulative_volume(conn, weeks=weeks)
        alerts = analyze_imbalances(cumul, weeks=weeks)
        return {"ok": True, "alerts": alerts}


@router.get("/sessions")
def recent_sessions(limit: int = 10) -> dict:
    """Sessions muscu récentes avec détail exercices."""
    with db_connection() as conn:
        sessions = get_recent_sessions(conn, limit=limit)
        return {"ok": True, "sessions": sessions}
