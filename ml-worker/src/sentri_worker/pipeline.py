from __future__ import annotations

from typing import Any

from .models import OCRCell, ParseIssue
from .ocr import OCRService
from .parser import parse_timetable


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

        cells_payload = payload.get("cells") or []
        cells = [
            OCRCell(
                row=int(cell["row"]),
                col=int(cell["col"]),
                text=str(cell.get("text", "")),
                row_span=int(cell.get("row_span", 1)),
                col_span=int(cell.get("col_span", 1)),
                confidence=cell.get("confidence"),
            )
            for cell in cells_payload
            if isinstance(cell, dict)
        ]

        result = parse_timetable(raw_text=raw_text, cells=cells, source=source)
        result.source["ocr"] = ocr_result.to_dict()
        if ocr_result.warnings:
            result.issues.extend(
                [
                    ParseIssue(code="ocr_warning", message=warning)
                    for warning in ocr_result.warnings
                ]
            )

        extraction_confidence = payload.get("extraction_confidence")
        if extraction_confidence is None:
            confidences = [
                float(cell.confidence)
                for cell in cells
                if cell.confidence is not None
            ]
            extraction_confidence = round(sum(confidences) / len(confidences), 4) if confidences else None

        return result.to_backend_import_dict(
            extraction_confidence=float(extraction_confidence)
            if extraction_confidence is not None
            else None
        )
