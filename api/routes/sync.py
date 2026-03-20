"""Routes de synchronisation — Garmin Connect + statut global."""

from __future__ import annotations

import logging
import os
import time
from pathlib import Path

from fastapi import APIRouter, Depends

from api import deps
from api.deps import get_db, invalidate_cache, require_auth
from pipeline.schema import get_connection, get_sync_metadata, update_sync_metadata

logger = logging.getLogger("bord.sync")

router = APIRouter(prefix="/api/sync", tags=["sync"])

# Disponibilité Garmin (import conditionnel)
try:
    from pipeline.parse_garmin_connect import GARMIN_AVAILABLE
except ImportError:
    GARMIN_AVAILABLE = False


def _garmin_configured() -> bool:
    """Vérifie si les credentials Garmin sont disponibles."""
    if os.getenv("GARMIN_EMAIL") and os.getenv("GARMIN_PASSWORD"):
        return True
    garth_dir = Path.home() / ".garth"
    return garth_dir.exists() and any(garth_dir.iterdir())


# ── POST /api/sync/garmin ─────────────────────────────────────────


@router.post("/garmin")
def sync_garmin(
    body: dict | None = None,
    _: None = Depends(require_auth),
) -> dict:
    """Lance la synchronisation Garmin Connect → SQLite."""
    if not GARMIN_AVAILABLE:
        return {"ok": False, "error": "garmin_not_available"}

    if not _garmin_configured():
        return {"ok": False, "error": "garmin_not_configured"}

    days = 7
    if body and isinstance(body.get("days"), int):
        days = min(max(1, body["days"]), 90)

    # Marquer "running"
    conn = get_connection(deps.DB_PATH)
    try:
        update_sync_metadata(conn, "garmin_connect", "running")
    finally:
        conn.close()

    t0 = time.time()
    try:
        from pipeline.parse_garmin_connect import run as garmin_run

        result = garmin_run(db_path=deps.DB_PATH, days=days, verbose=False)
    except Exception as e:
        logger.error("Sync Garmin échouée: %s", e, exc_info=True)
        conn = get_connection(deps.DB_PATH)
        try:
            update_sync_metadata(conn, "garmin_connect", "error", {"detail": str(e)})
        finally:
            conn.close()

        error_type = "garmin_rate_limited" if "429" in str(e) or "TooMany" in str(e) else "garmin_sync_failed"
        return {"ok": False, "error": error_type, "detail": str(e)}

    duration_s = round(time.time() - t0, 1)

    # Garmin a retourné une erreur
    if "error" in result:
        conn = get_connection(deps.DB_PATH)
        try:
            update_sync_metadata(conn, "garmin_connect", "error", result)
        finally:
            conn.close()

        error_msg = result["error"]
        error_type = "garmin_auth_failed" if "connexion" in error_msg.lower() else "garmin_sync_failed"
        return {"ok": False, "error": error_type, "detail": error_msg}

    # Succès
    result["duration_s"] = duration_s
    conn = get_connection(deps.DB_PATH)
    try:
        update_sync_metadata(conn, "garmin_connect", "success", result)
    finally:
        conn.close()

    invalidate_cache()
    logger.info("Sync Garmin OK: %s", result)
    return {"ok": True, "sync": result}


# ── GET /api/sync/status ──────────────────────────────────────────


@router.get("/status")
def sync_status() -> dict:
    """Statut de synchronisation de toutes les sources."""
    conn = get_db()
    try:
        garmin_meta = get_sync_metadata(conn, "garmin_connect")
        apple_meta = get_sync_metadata(conn, "apple_calendar")
    finally:
        conn.close()

    return {
        "ok": True,
        "sources": {
            "garmin": {
                "available": GARMIN_AVAILABLE,
                "configured": _garmin_configured() if GARMIN_AVAILABLE else False,
                "last_sync": garmin_meta["last_sync"] if garmin_meta else None,
                "status": garmin_meta["status"] if garmin_meta else None,
                "result": garmin_meta["result"] if garmin_meta else None,
            },
            "apple_calendar": {
                "available": True,
                "configured": True,
                "last_sync": apple_meta["last_sync"] if apple_meta else None,
                "status": apple_meta["status"] if apple_meta else None,
                "result": apple_meta["result"] if apple_meta else None,
            },
        },
    }
