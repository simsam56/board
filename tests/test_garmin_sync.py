"""Tests pour le système de synchronisation (sync_metadata + endpoints)."""

import sqlite3

import pytest

from pipeline.schema import get_sync_metadata, update_sync_metadata

# ── Tests sync_metadata helpers ────────────────────────────────────


def test_sync_metadata_table_created(temp_db):
    """La table sync_metadata est créée par init_db."""
    conn = sqlite3.connect(str(temp_db))
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    conn.close()
    assert "sync_metadata" in tables


def test_update_and_get_sync_metadata(temp_db):
    """Upsert + lecture sync_metadata."""
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row

    # Insert
    update_sync_metadata(conn, "garmin_connect", "success", {"activities_inserted": 5})
    meta = get_sync_metadata(conn, "garmin_connect")
    assert meta is not None
    assert meta["status"] == "success"
    assert meta["result"]["activities_inserted"] == 5
    assert meta["last_sync"] is not None

    # Update (upsert)
    update_sync_metadata(conn, "garmin_connect", "error", {"detail": "rate limited"})
    meta = get_sync_metadata(conn, "garmin_connect")
    assert meta["status"] == "error"
    assert meta["result"]["detail"] == "rate limited"

    conn.close()


def test_get_sync_metadata_missing(temp_db):
    """get_sync_metadata retourne None si source inconnue."""
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    meta = get_sync_metadata(conn, "unknown_source")
    assert meta is None
    conn.close()


def test_sync_metadata_multiple_sources(temp_db):
    """Plusieurs sources coexistent."""
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row

    update_sync_metadata(conn, "garmin_connect", "success", {"activities_inserted": 3})
    update_sync_metadata(conn, "apple_calendar", "success", {"events_synced": 15})

    garmin = get_sync_metadata(conn, "garmin_connect")
    apple = get_sync_metadata(conn, "apple_calendar")

    assert garmin["result"]["activities_inserted"] == 3
    assert apple["result"]["events_synced"] == 15

    conn.close()


def test_sync_metadata_null_result(temp_db):
    """sync_metadata accepte un résultat None."""
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row

    update_sync_metadata(conn, "garmin_connect", "running", None)
    meta = get_sync_metadata(conn, "garmin_connect")
    assert meta["status"] == "running"
    assert meta["result"] is None

    conn.close()


# ── Tests API sync endpoints (avec TestClient) ────────────────────


@pytest.fixture
def api_client(temp_db, monkeypatch):
    """FastAPI TestClient avec DB temporaire."""
    from api import deps

    monkeypatch.setattr(deps, "DB_PATH", temp_db)
    monkeypatch.setattr(deps, "API_TOKEN", "")

    from fastapi.testclient import TestClient

    from api.main import app

    return TestClient(app)


def test_sync_status_endpoint(api_client):
    """GET /api/sync/status retourne les deux sources."""
    r = api_client.get("/api/sync/status")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert "garmin" in data["sources"]
    assert "apple_calendar" in data["sources"]
    # Garmin doit être marqué available (lib installée)
    assert isinstance(data["sources"]["garmin"]["available"], bool)


def test_sync_garmin_not_configured(api_client, monkeypatch):
    """POST /api/sync/garmin échoue si Garmin pas configuré."""
    # Forcer garmin non-configuré
    import api.routes.sync as sync_mod

    monkeypatch.setattr(sync_mod, "_garmin_configured", lambda: False)
    monkeypatch.setattr(sync_mod, "GARMIN_AVAILABLE", True)

    r = api_client.post("/api/sync/garmin", json={})
    data = r.json()
    assert data["ok"] is False
    assert data["error"] == "garmin_not_configured"


def test_sync_garmin_success_mocked(api_client, monkeypatch):
    """POST /api/sync/garmin avec pipeline mocké retourne succès."""
    import api.routes.sync as sync_mod

    monkeypatch.setattr(sync_mod, "GARMIN_AVAILABLE", True)
    monkeypatch.setattr(sync_mod, "_garmin_configured", lambda: True)

    fake_result = {
        "activities_fetched": 10,
        "activities_inserted": 3,
        "activities_skipped": 7,
        "strength_sessions_inserted": 1,
        "exercise_sets_inserted": 5,
        "strength_sessions_skipped": 0,
        "metrics_inserted": 42,
    }

    def mock_run(**kwargs):
        return fake_result

    # Patcher l'import dynamique dans sync.py
    import pipeline.parse_garmin_connect as garmin_mod

    monkeypatch.setattr(garmin_mod, "run", mock_run)

    r = api_client.post("/api/sync/garmin", json={"days": 3})
    data = r.json()
    assert data["ok"] is True
    assert data["sync"]["activities_inserted"] == 3
    assert data["sync"]["metrics_inserted"] == 42
    assert "duration_s" in data["sync"]


def test_sync_garmin_auth_failed_mocked(api_client, monkeypatch):
    """POST /api/sync/garmin avec erreur auth retourne garmin_auth_failed."""
    import api.routes.sync as sync_mod

    monkeypatch.setattr(sync_mod, "GARMIN_AVAILABLE", True)
    monkeypatch.setattr(sync_mod, "_garmin_configured", lambda: True)

    def mock_run(**kwargs):
        return {"error": "connexion impossible"}

    import pipeline.parse_garmin_connect as garmin_mod

    monkeypatch.setattr(garmin_mod, "run", mock_run)

    r = api_client.post("/api/sync/garmin", json={})
    data = r.json()
    assert data["ok"] is False
    assert data["error"] == "garmin_auth_failed"
