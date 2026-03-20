"""Routes entraînement (PMC, ACWR, running)."""

from __future__ import annotations

from fastapi import APIRouter

from analytics.training_load import (
    analyze_running,
    build_daily_tss,
    compute_acwr,
    compute_pmc,
    compute_weekly_load_breakdown,
    get_prediction_history,
)
from api.deps import db_connection

router = APIRouter(prefix="/api/training", tags=["training"])


@router.get("/pmc")
def pmc_data() -> dict:
    """Performance Management Chart : CTL, ATL, TSB."""
    with db_connection() as conn:
        daily_tss = build_daily_tss(conn)
        pmc = compute_pmc(daily_tss)
        current = pmc[-1] if pmc else {}
        series = pmc[-180:] if len(pmc) > 180 else pmc
        return {
            "ok": True,
            "current": {
                "ctl": current.get("ctl", 0),
                "atl": current.get("atl", 0),
                "tsb": current.get("tsb", 0),
                "tss": current.get("tss", 0),
                "date": current.get("date", ""),
            },
            "series": [
                {
                    "date": d.get("date", ""),
                    "ctl": round(d.get("ctl", 0), 1),
                    "atl": round(d.get("atl", 0), 1),
                    "tsb": round(d.get("tsb", 0), 1),
                }
                for d in series
            ],
        }


@router.get("/acwr")
def acwr_data() -> dict:
    """Acute:Chronic Workload Ratio."""
    with db_connection() as conn:
        daily_tss = build_daily_tss(conn)
        data = compute_acwr(daily_tss)
        return {"ok": True, "acwr": data}


@router.get("/weekly-load")
def weekly_load(weeks: int = 12) -> dict:
    """Volume hebdomadaire par type d'activité."""
    with db_connection() as conn:
        data = compute_weekly_load_breakdown(conn, weeks=weeks)
        return {"ok": True, "series": data}


@router.get("/running")
def running_analysis(weeks: int = 12) -> dict:
    """Analyse running : allure, prédictions Riegel, volume."""
    with db_connection() as conn:
        data = analyze_running(conn, weeks=weeks)
        return {"ok": True, "running": data}


@router.get("/running/prediction-history")
def prediction_history(months: int = 6) -> dict:
    """Évolution de la prédiction 10K au fil des mois."""
    with db_connection() as conn:
        data = get_prediction_history(conn, months=months)
        return {"ok": True, "series": data}
