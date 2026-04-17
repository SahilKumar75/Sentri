from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from sentri_worker.evaluate import evaluate_fixture, evaluate_fixture_directory, evaluate_fixture_file
from sentri_worker.pipeline import SentriWorker
from sentri_worker.tuning import load_tuning_profile


class TuningAndEvaluateTests(unittest.TestCase):
    def test_load_tuning_profile_applies_custom_aliases(self) -> None:
        profile = load_tuning_profile(
            {
                "tuning": {
                    "subject_aliases": {
                        "math5": "maths"
                    },
                    "faculty_aliases": {
                        "m 4": "ma"
                    },
                    "location_aliases": {
                        "labiii": "lab-iii"
                    },
                    "subject_noise_tokens": ["lecture"],
                    "subject_vocabulary": ["MATHS", "DBMS"],
                    "min_match_score": 0.8,
                }
            }
        )

        self.assertEqual(profile.normalize_subject("math5"), "MATHS")
        self.assertEqual(profile.normalize_subject("DBMS Lecture"), "DBMS")
        self.assertEqual(profile.normalize_subject("dbm5"), "DBMS")
        self.assertEqual(profile.normalize_faculty_code("m 4"), "MA")
        self.assertEqual(profile.normalize_location_label("labiii"), "LAB-III")

    def test_worker_applies_payload_tuning_to_subjects(self) -> None:
        worker = SentriWorker()
        payload = {
            "source_name": "tuning.png",
            "ocr_text": "Class: SE IT-B",
            "tuning": {
                "subject_aliases": {
                    "MATH5": "MATHS"
                }
            },
            "cells": [
                {"row": 0, "col": 0, "text": "TIME/DAY"},
                {"row": 0, "col": 1, "text": "8.45-9.45"},
                {"row": 1, "col": 0, "text": "MON"},
                {"row": 1, "col": 1, "text": "MATH5\n(MA)"}
            ],
        }

        result = worker.process(payload)

        self.assertEqual(result["entries"][0]["subjectName"], "MATHS")

    def test_evaluate_fixture_returns_perfect_match(self) -> None:
        fixture_path = ROOT / "tests" / "fixtures" / "parser_eval_fixture.json"
        report = evaluate_fixture_file(fixture_path)

        self.assertEqual(report["metrics"]["precision"], 1.0)
        self.assertEqual(report["metrics"]["recall"], 1.0)
        self.assertEqual(report["metrics"]["f1"], 1.0)
        self.assertEqual(report["metrics"]["slot_accuracy"], 1.0)
        self.assertEqual(report["metrics"]["subject_accuracy"], 1.0)
        self.assertIn("MON", report["metrics"]["per_day"])

    def test_evaluate_fixture_detects_missing_entries(self) -> None:
        fixture_payload = {
            "payload": {
                "source_name": "missing.png",
                "ocr_text": "Class: SE IT-B",
                "cells": [
                    {"row": 0, "col": 0, "text": "TIME/DAY"},
                    {"row": 0, "col": 1, "text": "8.45-9.45"},
                    {"row": 1, "col": 0, "text": "MON"},
                    {"row": 1, "col": 1, "text": "DBMS"}
                ]
            },
            "expected_entries": [
                {"dayOfWeek": "MON", "startTime": "08:45:00", "endTime": "09:45:00", "subjectName": "DBMS"},
                {"dayOfWeek": "MON", "startTime": "09:45:00", "endTime": "10:45:00", "subjectName": "PM"}
            ]
        }

        report = evaluate_fixture(fixture_payload).to_dict()

        self.assertEqual(report["matched"], 1)
        self.assertEqual(report["expected"], 2)
        self.assertEqual(report["predicted"], 1)
        self.assertEqual(report["recall"], 0.5)

    def test_evaluate_fixture_directory_builds_aggregate_summary(self) -> None:
        fixture_dir = ROOT / "tests" / "fixtures"
        report = evaluate_fixture_directory(fixture_dir, pattern="parser_eval_fixture*.json")

        self.assertEqual(report["fixture_count"], 2)
        self.assertIn("aggregate", report)
        self.assertEqual(report["aggregate"]["expected"], 4)
        self.assertEqual(report["aggregate"]["predicted"], 3)
        self.assertEqual(report["aggregate"]["matched"], 3)
        self.assertEqual(report["aggregate"]["precision"], 1.0)
        self.assertEqual(report["aggregate"]["recall"], 0.75)
        self.assertTrue(len(report["aggregate"]["worst_fixtures"]) >= 1)


if __name__ == "__main__":
    unittest.main()
