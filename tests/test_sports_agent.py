"""Tests pour analytics/sports_agent.py."""

from __future__ import annotations

import sqlite3
from datetime import date, timedelta

from analytics.sports_agent import (
    _days_ago,
    _pace_str,
    _recovery_color,
    _recovery_label,
    _safe_mean,
    _to_date,
    _trend_arrow,
    analyze_recovery,
    analyze_running,
)

# ── Helpers ─────────────────────────────────────────────────────────


class TestToDate:
    def test_valid_iso(self):
        assert _to_date("2025-03-15") == date(2025, 3, 15)

    def test_valid_datetime(self):
        assert _to_date("2025-03-15T10:30:00") == date(2025, 3, 15)

    def test_none(self):
        assert _to_date(None) is None

    def test_invalid(self):
        assert _to_date("not-a-date") is None

    def test_empty(self):
        assert _to_date("") is None


class TestDaysAgo:
    def test_today(self):
        assert _days_ago(date.today()) == 0

    def test_yesterday(self):
        assert _days_ago(date.today() - timedelta(days=1)) == 1

    def test_none_returns_large(self):
        assert _days_ago(None) == 9999


class TestSafeMean:
    def test_normal(self):
        assert _safe_mean([10, 20, 30]) == 20

    def test_with_nones(self):
        assert _safe_mean([10, None, 30]) == 20

    def test_all_none(self):
        assert _safe_mean([None, None]) is None

    def test_empty(self):
        assert _safe_mean([]) is None


class TestPaceStr:
    def test_five_min_km(self):
        assert _pace_str(5.0) == "5'00\""

    def test_five_thirty(self):
        assert _pace_str(5.5) == "5'30\""

    def test_none(self):
        assert _pace_str(None) == "–"

    def test_zero(self):
        assert _pace_str(0) == "–"


class TestTrendArrow:
    def test_improving(self):
        assert _trend_arrow(60, 50, higher_is_better=True) == "↑"

    def test_declining(self):
        assert _trend_arrow(40, 50, higher_is_better=True) == "↓"

    def test_stable(self):
        assert _trend_arrow(50, 50, higher_is_better=True) == "→"

    def test_pace_improving(self):
        # Lower pace is better
        assert _trend_arrow(4.5, 5.0, higher_is_better=False) == "↑"

    def test_none_values(self):
        assert _trend_arrow(None, 50) == "→"
        assert _trend_arrow(50, None) == "→"

    def test_zero_previous(self):
        assert _trend_arrow(50, 0) == "→"


class TestRecoveryLabel:
    def test_excellent(self):
        assert _recovery_label(85) == "Excellent"

    def test_bon(self):
        assert _recovery_label(70) == "Bon"

    def test_modere(self):
        assert _recovery_label(50) == "Modéré"

    def test_fatigue(self):
        assert _recovery_label(30) == "Fatigué"

    def test_epuise(self):
        assert _recovery_label(10) == "Épuisé"


class TestRecoveryColor:
    def test_colors_defined(self):
        assert _recovery_color(90).startswith("#")
        assert _recovery_color(70).startswith("#")
        assert _recovery_color(50).startswith("#")
        assert _recovery_color(30).startswith("#")
        assert _recovery_color(10).startswith("#")


# ── Analyse running ────────────────────────────────────────────────


def _insert_running(conn: sqlite3.Connection, days_ago: int, dist_m: float, dur_s: int, pace: float):
    d = (date.today() - timedelta(days=days_ago)).isoformat() + "T10:00:00"
    conn.execute(
        """INSERT INTO activities (source, type, name, started_at, duration_s, distance_m, avg_pace_mpm)
           VALUES ('test', 'Running', 'Run', ?, ?, ?, ?)""",
        (d, dur_s, dist_m, pace),
    )
    conn.commit()


class TestAnalyzeRunning:
    def test_no_data(self, temp_db):
        conn = sqlite3.connect(str(temp_db))
        conn.row_factory = sqlite3.Row
        result = analyze_running(conn, months=12)
        conn.close()
        assert result["sessions"] == 0
        assert result["status"] == "no_data"

    def test_with_runs(self, temp_db):
        conn = sqlite3.connect(str(temp_db))
        conn.row_factory = sqlite3.Row

        # Insert a few runs
        for i in range(5):
            _insert_running(conn, days_ago=i * 3, dist_m=5000, dur_s=1500, pace=5.0)

        result = analyze_running(conn, months=12)
        conn.close()

        assert result["sessions"] == 5
        assert result["total_km"] == 25.0
        assert "monthly" in result
        assert "best_pace_str" in result

    def test_predictions_with_long_run(self, temp_db):
        conn = sqlite3.connect(str(temp_db))
        conn.row_factory = sqlite3.Row

        _insert_running(conn, days_ago=1, dist_m=10000, dur_s=3000, pace=5.0)

        result = analyze_running(conn, months=12)
        conn.close()

        assert result["sessions"] == 1
        assert "predictions" in result
        # 10km run should allow predictions for 10km and above
        preds = result["predictions"]
        assert "10km" in preds or "semi" in preds


# ── Analyse recovery ──────────────────────────────────────────────


def _insert_health(conn: sqlite3.Connection, metric: str, value: float, days_ago: int = 0):
    d = (date.today() - timedelta(days=days_ago)).isoformat()
    conn.execute(
        "INSERT INTO health_metrics (date, metric, value, source) VALUES (?, ?, ?, 'test')",
        (d, metric, value),
    )
    conn.commit()


class TestAnalyzeRecovery:
    def test_no_data(self, temp_db):
        conn = sqlite3.connect(str(temp_db))
        conn.row_factory = sqlite3.Row
        result = analyze_recovery(conn, days=30)
        conn.close()
        assert result["score"] == 50  # default when no data

    def test_with_metrics(self, temp_db):
        conn = sqlite3.connect(str(temp_db))
        conn.row_factory = sqlite3.Row

        # Insert health data
        for i in range(10):
            _insert_health(conn, "rhr", 55, days_ago=i)
            _insert_health(conn, "sleep_h", 7.5, days_ago=i)
            _insert_health(conn, "body_battery", 80, days_ago=i)
            _insert_health(conn, "hrv_sdnn", 50, days_ago=i)

        result = analyze_recovery(conn, days=30)
        conn.close()

        assert 0 <= result["score"] <= 100
        assert result["label"] in ("Excellent", "Bon", "Modéré", "Fatigué", "Épuisé")
        assert result["color"].startswith("#")
        assert result["latest"]["rhr"] == 55
        assert result["latest"]["sleep_h"] == 7.5
