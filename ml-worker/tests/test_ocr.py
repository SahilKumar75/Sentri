from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from sentri_worker.ocr import OCRResult, OCRService
from sentri_worker.pipeline import SentriWorker


class _FakeOCRService:
    def extract_from_payload(self, payload: dict[str, object]) -> OCRResult:
        return OCRResult(
            text="MON\n8.45-9.45 DBMS",
            engine="fake",
            quality=0.83,
            warnings=[],
        )


class OCRTests(unittest.TestCase):
    def test_provided_ocr_text_is_normalized_and_scored(self) -> None:
        service = OCRService()

        result = service.extract_from_payload(
            {
                "ocr_text": "MON\r\n\r\n8.45-9.45  DBMS  |  PM",
            }
        )

        self.assertEqual(result.engine, "provided")
        self.assertIn("\n", result.text)
        self.assertNotIn("\r", result.text)
        self.assertIsNotNone(result.quality)
        self.assertGreaterEqual(result.quality or 0.0, 0.0)
        self.assertLessEqual(result.quality or 1.0, 1.0)

    def test_coerce_psm_candidates_filters_invalid_values(self) -> None:
        service = OCRService()

        candidates = service._coerce_psm_candidates([6, "11", 6, "bad", 2, 15, 4])

        self.assertEqual(candidates, (6, 11, 4))

    def test_pipeline_uses_ocr_quality_as_confidence_fallback(self) -> None:
        worker = SentriWorker(ocr_service=_FakeOCRService())

        result = worker.process({"source_name": "mock.png"})

        self.assertEqual(result["extractionConfidence"], 0.83)


if __name__ == "__main__":
    unittest.main()
