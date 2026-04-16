from __future__ import annotations

from typing import Any

from .models import OCRCell, ParseIssue
from .ocr import OCRService
from .parser import parse_timetable
from .tuning import load_tuning_profile


class SentriWorker:
    def __init__(self, ocr_service: OCRService | None = None) -> None:
        self.ocr_service = ocr_service or OCRService()

    def process(self, payload: dict[str, Any]) -> dict[str, Any]:
        source = {
            "source_name": payload.get("source_name"),
            "image_path": payload.get("image_path"),
        }
        ocr_result = self.ocr_service.extract_from_payload(payload)
        raw_text = payload.get("ocr_text") or ocr_result.text or ""

        cells, payload_warnings = self._parse_cells(payload.get("cells"))
        tuning_profile = load_tuning_profile(payload)

        result = parse_timetable(
            raw_text=raw_text,
            cells=cells,
            source=source,
            tuning_profile=tuning_profile,
        )
        result.source["ocr"] = ocr_result.to_dict()
        if ocr_result.warnings:
            result.issues.extend(
                [
                    ParseIssue(code="ocr_warning", message=warning)
                    for warning in ocr_result.warnings
                ]
            )
        if payload_warnings:
            result.issues.extend(
                [
                    ParseIssue(code="payload_warning", message=warning)
                    for warning in payload_warnings
                ]
            )

        extraction_confidence = self._coerce_float(payload.get("extraction_confidence"))
        if extraction_confidence is None:
            confidences = [
                float(cell.confidence)
                for cell in cells
                if cell.confidence is not None
            ]
            extraction_confidence = round(sum(confidences) / len(confidences), 4) if confidences else None
        if extraction_confidence is None and ocr_result.quality is not None:
            extraction_confidence = ocr_result.quality
        extraction_confidence = self._clamp_confidence(extraction_confidence)

        return result.to_backend_import_dict(
            extraction_confidence=extraction_confidence
        )

    def _parse_cells(self, cells_payload: Any) -> tuple[list[OCRCell], list[str]]:
        if cells_payload is None:
            return [], []
        if not isinstance(cells_payload, list):
            return [], ["Ignored cells payload because it is not a list."]

        cells: list[OCRCell] = []
        warnings: list[str] = []
        for index, cell in enumerate(cells_payload):
            if not isinstance(cell, dict):
                warnings.append(f"Ignored non-object cell at index {index}.")
                continue

            row = self._coerce_int(cell.get("row"))
            col = self._coerce_int(cell.get("col"))
            if row is None or col is None:
                warnings.append(f"Ignored cell at index {index} because row/col is missing or invalid.")
                continue

            row_span = self._coerce_int(cell.get("row_span"), default=1)
            col_span = self._coerce_int(cell.get("col_span"), default=1)
            confidence = self._coerce_float(cell.get("confidence"))
            confidence = self._clamp_confidence(confidence)
            cells.append(
                OCRCell(
                    row=row,
                    col=col,
                    text=str(cell.get("text", "")),
                    row_span=max(row_span, 1),
                    col_span=max(col_span, 1),
                    confidence=confidence,
                )
            )
        return cells, warnings

    def _coerce_int(self, value: Any, default: int | None = None) -> int | None:
        if value is None:
            return default
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def _coerce_float(self, value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _clamp_confidence(self, value: float | None) -> float | None:
        if value is None:
            return None
        return max(0.0, min(1.0, value))
