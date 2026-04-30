"""Pytest configuration and shared fixtures."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from sentri_worker.models import OCRCell, TimetableBatch, TimetableEntry
from sentri_worker.ocr import OCRService
from sentri_worker.pipeline import SentriWorker


@pytest.fixture
def fixtures_dir() -> Path:
    """Return the path to the fixtures directory."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_ocr_text() -> str:
    """Return sample OCR text for testing."""
    return """Class: SE IT-B
Academic Year - 2025-26 - SEM II
Venue: LH 20

MON 08:45-10:45 DBMS (MA) Lab-III
TUE 10:45-12:45 PROJECT MANAGEMENT (SG)
WED 14:00-16:00 COMPUTER NETWORKS (VI)
"""


@pytest.fixture
def sample_cells() -> list[OCRCell]:
    """Return sample OCR cells for testing."""
    return [
        OCRCell(row=0, col=0, text="Day"),
        OCRCell(row=0, col=1, text="08:45-10:45"),
        OCRCell(row=0, col=2, text="10:45-12:45"),
        OCRCell(row=1, col=0, text="MON"),
        OCRCell(row=1, col=1, text="DBMS\n(MA)\nLab-III"),
        OCRCell(row=1, col=2, text="PROJECT MANAGEMENT\n(SG)"),
        OCRCell(row=2, col=0, text="TUE"),
        OCRCell(row=2, col=1, text="COMPUTER NETWORKS\n(VI)"),
        OCRCell(row=2, col=2, text="LUNCH BREAK"),
    ]


@pytest.fixture
def sample_batch() -> TimetableBatch:
    """Return sample timetable batch for testing."""
    return TimetableBatch(
        class_label="SE IT-B",
        year_label="SE",
        branch_label="IT",
        division_label="B",
        academic_year="2025-26",
        semester_label="SEM II",
        pattern_label="SPPU 2019",
        effective_from="2026-03-23",
        venue="LH 20",
        verified=False,
        source_name="test.png",
    )


@pytest.fixture
def sample_entry() -> TimetableEntry:
    """Return sample timetable entry for testing."""
    return TimetableEntry(
        day_of_week="MON",
        start_time="08:45",
        end_time="10:45",
        subject_text="DBMS",
        entry_type="lab",
        faculty_code="MA",
        location_label="Lab-III",
        notes=[],
        raw_text="DBMS\n(MA)\nLab-III",
        source_row=1,
        source_col=1,
    )


@pytest.fixture
def sample_payload() -> dict[str, Any]:
    """Return sample worker payload for testing."""
    return {
        "source_name": "test.png",
        "ocr_text": """Class: SE IT-B
Academic Year - 2025-26 - SEM II
Venue: LH 20

MON 08:45-10:45 DBMS (MA) Lab-III
""",
        "cells": [
            {"row": 0, "col": 0, "text": "Day"},
            {"row": 0, "col": 1, "text": "08:45-10:45"},
            {"row": 1, "col": 0, "text": "MON"},
            {"row": 1, "col": 1, "text": "DBMS\n(MA)\nLab-III"},
        ],
    }


@pytest.fixture
def ocr_service() -> OCRService:
    """Return OCR service instance."""
    return OCRService()


@pytest.fixture
def worker() -> SentriWorker:
    """Return worker instance."""
    return SentriWorker()


@pytest.fixture
def load_fixture(fixtures_dir: Path):
    """Return a function to load JSON fixtures."""

    def _load(filename: str) -> dict[str, Any]:
        fixture_path = fixtures_dir / filename
        if not fixture_path.exists():
            raise FileNotFoundError(f"Fixture not found: {fixture_path}")
        return json.loads(fixture_path.read_text(encoding="utf-8"))

    return _load


@pytest.fixture(autouse=True)
def reset_caches():
    """Reset all caches before each test."""
    # Import cache functions
    from sentri_worker.parser import normalize_day, normalize_time_label

    # Clear LRU caches
    if hasattr(normalize_day, "cache_clear"):
        normalize_day.cache_clear()
    if hasattr(normalize_time_label, "cache_clear"):
        normalize_time_label.cache_clear()

    yield

    # Cleanup after test
    if hasattr(normalize_day, "cache_clear"):
        normalize_day.cache_clear()
    if hasattr(normalize_time_label, "cache_clear"):
        normalize_time_label.cache_clear()


# Markers for test categorization
def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "slow: Slow running tests")
    config.addinivalue_line("markers", "benchmark: Performance benchmark tests")
