from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from sentri_worker.pipeline import SentriWorker


class PipelineTests(unittest.TestCase):
    def test_process_with_provided_text_and_cells(self) -> None:
        payload = {
            "source_name": "se_it_b_sem2.png",
            "ocr_text": "Class: SE IT-B\nAcademic Year - 2025-26 - SEM II\nVenue: LH 20",
            "cells": [
                {"row": 0, "col": 0, "text": "TIME/DAY"},
                {"row": 0, "col": 1, "text": "8.45-9.45"},
                {"row": 1, "col": 0, "text": "MON"},
                {"row": 1, "col": 1, "text": "DBMS\n(VI)\nParallel Databases"},
            ],
        }

        result = SentriWorker().process(payload)

        self.assertEqual(result["metadata"]["yearLabel"], "SE")
        self.assertEqual(result["metadata"]["branchLabel"], "IT")
        self.assertEqual(result["entries"][0]["dayOfWeek"], "MON")
        self.assertEqual(result["entries"][0]["subjectName"], "DBMS")
        self.assertEqual(result["entries"][0]["entryType"], "LECTURE")
        self.assertEqual(result["rawOcrText"], payload["ocr_text"])
        self.assertEqual(result["metadata"]["sourceImageName"], "se_it_b_sem2.png")

    def test_process_skips_invalid_cells_and_clamps_confidence(self) -> None:
        payload = {
            "source_name": "bad-cells.png",
            "ocr_text": "Class: SE IT-B",
            "extraction_confidence": "1.7",
            "cells": [
                {"row": 0, "col": 0, "text": "TIME/DAY"},
                {"row": 0, "col": 1, "text": "8.45-9.45"},
                {"row": 1, "col": 0, "text": "MON"},
                {"row": 1, "col": 1, "text": "DBMS", "confidence": "0.8"},
                {"row": "x", "col": 2, "text": "invalid-row"},
                "not-a-dict",
            ],
        }

        result = SentriWorker().process(payload)

        self.assertEqual(result["extractionConfidence"], 1.0)
        self.assertEqual(len(result["entries"]), 1)
        self.assertIn("issue:payload_warning", result["metadata"]["sourceNotes"])

    def test_process_uses_cell_confidence_average_when_payload_confidence_invalid(self) -> None:
        payload = {
            "source_name": "avg-confidence.png",
            "ocr_text": "Class: SE IT-B",
            "extraction_confidence": "not-a-number",
            "cells": [
                {"row": 0, "col": 0, "text": "TIME/DAY"},
                {"row": 0, "col": 1, "text": "8.45-9.45"},
                {"row": 1, "col": 0, "text": "MON"},
                {"row": 1, "col": 1, "text": "DBMS", "confidence": 0.5},
                {"row": 1, "col": 2, "text": "PM", "confidence": 0.9},
            ],
        }

        result = SentriWorker().process(payload)

        self.assertEqual(result["extractionConfidence"], 0.7)


if __name__ == "__main__":
    unittest.main()
