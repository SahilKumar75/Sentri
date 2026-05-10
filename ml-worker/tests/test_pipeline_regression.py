from __future__ import annotations

from typing import Any

from sentri_worker.pipeline import SentriWorker


def _source_notes(result: dict[str, Any]) -> str:
    return result["metadata"].get("sourceNotes") or ""


def test_pipeline_fixture_keeps_backend_contract(load_fixture) -> None:
    result = SentriWorker().process(load_fixture("pipeline_valid_payload.json"))

    assert result["metadata"]["yearLabel"] == "SE"
    assert result["metadata"]["branchLabel"] == "IT"
    assert result["metadata"]["sourceImageName"] == "fixture-valid.png"
    assert result["extractionConfidence"] == 0.81
    assert result["entries"][0]["dayOfWeek"] == "MON"
    assert result["entries"][0]["subjectName"] == "DBMS"
    assert "issue:low_confidence" not in _source_notes(result)


def test_pipeline_fixture_reports_malformed_payload_and_low_confidence(load_fixture) -> None:
    result = SentriWorker().process(load_fixture("pipeline_malformed_payload.json"))
    source_notes = _source_notes(result)

    assert result["extractionConfidence"] == 0.42
    assert result["entries"][0]["dayOfWeek"] == "MON"
    assert "issue:payload_warning:Ignored cells payload because it is not a list." in source_notes
    assert "issue:pipeline_warning:Ignored parsing_options because it is not an object." in source_notes
    assert "issue:pipeline_warning:Ignored confidence_weights because it is not an object." in source_notes
    assert "issue:low_confidence:Extraction confidence 0.42 is below threshold 0.75." in source_notes


def test_pipeline_ignores_invalid_confidence_threshold() -> None:
    result = SentriWorker().process(
        {
            "ocr_text": "Class: SE IT-B\nMON 08:45-09:45 DBMS",
            "extraction_confidence": 0.8,
            "quality_options": {"min_extraction_confidence": "high"},
        }
    )

    assert "issue:pipeline_warning:Ignored min_extraction_confidence because it is not numeric." in _source_notes(
        result
    )
