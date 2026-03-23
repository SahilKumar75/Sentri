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


if __name__ == "__main__":
    unittest.main()
