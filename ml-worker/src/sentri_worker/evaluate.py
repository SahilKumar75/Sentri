from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any

from .pipeline import SentriWorker


@dataclass(slots=True)
class EvaluationResult:
    matched: int
    expected: int
    predicted: int
    precision: float
    recall: float
    f1: float
    slot_accuracy: float
    subject_accuracy: float
    false_negatives: list[dict[str, Any]]
    false_positives: list[dict[str, Any]]

    def to_dict(self) -> dict[str, Any]:
        return {
            "matched": self.matched,
            "expected": self.expected,
            "predicted": self.predicted,
            "precision": self.precision,
            "recall": self.recall,
            "f1": self.f1,
            "slot_accuracy": self.slot_accuracy,
            "subject_accuracy": self.subject_accuracy,
            "false_negatives": self.false_negatives,
            "false_positives": self.false_positives,
        }


def evaluate_fixture(fixture_payload: dict[str, Any], worker: SentriWorker | None = None) -> EvaluationResult:
    worker = worker or SentriWorker()
    payload = fixture_payload.get("payload")
    expected_entries = fixture_payload.get("expected_entries")

    if not isinstance(payload, dict):
        raise ValueError("Fixture must include a payload object")
    if not isinstance(expected_entries, list):
        raise ValueError("Fixture must include expected_entries list")

    prediction = worker.process(payload)
    predicted_entries = prediction.get("entries")
    if not isinstance(predicted_entries, list):
        predicted_entries = []

    expected_normalized = [_normalize_entry(entry) for entry in expected_entries if isinstance(entry, dict)]
    predicted_normalized = [_normalize_entry(entry) for entry in predicted_entries if isinstance(entry, dict)]

    expected_set = {entry["_key"] for entry in expected_normalized}
    predicted_set = {entry["_key"] for entry in predicted_normalized}

    matched_set = expected_set & predicted_set
    false_negative_set = expected_set - matched_set
    false_positive_set = predicted_set - matched_set

    expected_lookup = {entry["_key"]: entry for entry in expected_normalized}
    predicted_lookup = {entry["_key"]: entry for entry in predicted_normalized}

    matched = len(matched_set)
    expected_count = len(expected_set)
    predicted_count = len(predicted_set)

    precision = round(matched / predicted_count, 4) if predicted_count else 0.0
    recall = round(matched / expected_count, 4) if expected_count else 0.0
    f1 = round((2 * precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0

    expected_slots = {entry["_slot_key"]: entry["subjectName"] for entry in expected_normalized}
    predicted_slots = {entry["_slot_key"]: entry["subjectName"] for entry in predicted_normalized}
    slot_matches = set(expected_slots.keys()) & set(predicted_slots.keys())
    slot_accuracy = round(len(slot_matches) / len(expected_slots), 4) if expected_slots else 0.0
    subject_matches = sum(1 for slot in slot_matches if expected_slots[slot] == predicted_slots[slot])
    subject_accuracy = round(subject_matches / len(slot_matches), 4) if slot_matches else 0.0

    return EvaluationResult(
        matched=matched,
        expected=expected_count,
        predicted=predicted_count,
        precision=precision,
        recall=recall,
        f1=f1,
        slot_accuracy=slot_accuracy,
        subject_accuracy=subject_accuracy,
        false_negatives=[expected_lookup[key] for key in sorted(false_negative_set)],
        false_positives=[predicted_lookup[key] for key in sorted(false_positive_set)],
    )


def evaluate_fixture_file(path: str | Path, worker: SentriWorker | None = None) -> dict[str, Any]:
    fixture_path = Path(path)
    payload = json.loads(fixture_path.read_text(encoding="utf-8"))
    result = evaluate_fixture(payload, worker=worker)
    return {
        "fixture": str(fixture_path),
        "metrics": result.to_dict(),
    }


def _normalize_entry(entry: dict[str, Any]) -> dict[str, Any]:
    day = str(entry.get("dayOfWeek") or "").strip().upper()
    start = str(entry.get("startTime") or "").strip()
    end = str(entry.get("endTime") or "").strip()
    subject = str(entry.get("subjectName") or "").strip().upper()
    key = "|".join([day, start, end, subject])
    slot_key = "|".join([day, start, end])
    return {
        "dayOfWeek": day,
        "startTime": start,
        "endTime": end,
        "subjectName": subject,
        "_key": key,
        "_slot_key": slot_key,
    }
