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
        payload, pipeline_warnings = self._prepare_payload(payload)
        source = {
            "source_name": payload.get("source_name"),
            "image_path": payload.get("image_path"),
        }
        ocr_result = self.ocr_service.extract_from_payload(payload)
        raw_text = payload.get("ocr_text") or ocr_result.text or ""

        cells, payload_warnings = self._parse_cells(payload.get("cells"))
        tuning_profile = load_tuning_profile(payload)
        parsing_options = payload["parsing_options"]
        fallback_to_text_schedule = parsing_options.get("fallback_to_text_schedule")
        if not isinstance(fallback_to_text_schedule, bool):
            fallback_to_text_schedule = True

        result = parse_timetable(
            raw_text=raw_text,
            cells=cells,
            source=source,
            tuning_profile=tuning_profile,
            fallback_to_text_schedule=fallback_to_text_schedule,
        )
        result.source["ocr"] = ocr_result.to_dict()
        if ocr_result.warnings:
            result.issues.extend([ParseIssue(code="ocr_warning", message=warning) for warning in ocr_result.warnings])
        if payload_warnings:
            result.issues.extend([ParseIssue(code="payload_warning", message=warning) for warning in payload_warnings])
        if pipeline_warnings:
            result.issues.extend(
                [ParseIssue(code="pipeline_warning", message=warning) for warning in pipeline_warnings]
            )

        extraction_confidence = self._coerce_float(payload.get("extraction_confidence"))
        if extraction_confidence is None:
            confidences = [float(cell.confidence) for cell in cells if cell.confidence is not None]
            cell_confidence = round(sum(confidences) / len(confidences), 4) if confidences else None
            extraction_confidence = self._blend_confidence(
                cell_confidence,
                ocr_result.quality,
                payload.get("confidence_weights"),
            )
        extraction_confidence = self._clamp_confidence(extraction_confidence)
        threshold, threshold_warning = self._parse_confidence_threshold(payload["quality_options"])
        if threshold_warning:
            result.issues.append(ParseIssue(code="pipeline_warning", message=threshold_warning))
        if extraction_confidence is not None and threshold is not None and extraction_confidence < threshold:
            result.issues.append(
                ParseIssue(
                    code="low_confidence",
                    message=f"Extraction confidence {extraction_confidence:.2f} is below threshold {threshold:.2f}.",
                )
            )

        return result.to_backend_import_dict(extraction_confidence=extraction_confidence)

    def _prepare_payload(self, payload: Any) -> tuple[dict[str, Any], list[str]]:
        warnings: list[str] = []
        if not isinstance(payload, dict):
            warnings.append("Replaced payload because it is not an object.")
            payload = {}
        else:
            payload = dict(payload)

        for field in ("parsing_options", "quality_options"):
            value = payload.get(field)
            if value is None:
                payload[field] = {}
                continue
            if not isinstance(value, dict):
                warnings.append(f"Ignored {field} because it is not an object.")
                payload[field] = {}

        confidence_weights = payload.get("confidence_weights")
        if confidence_weights is not None and not isinstance(confidence_weights, dict):
            warnings.append("Ignored confidence_weights because it is not an object.")
            payload["confidence_weights"] = None

        return payload, warnings

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

    def _parse_confidence_threshold(self, quality_options: dict[str, Any]) -> tuple[float | None, str | None]:
        if "min_extraction_confidence" not in quality_options:
            return None, None
        threshold = self._coerce_float(quality_options.get("min_extraction_confidence"))
        if threshold is None:
            return None, "Ignored min_extraction_confidence because it is not numeric."
        return self._clamp_confidence(threshold), None

    def _blend_confidence(
        self,
        cell_confidence: float | None,
        ocr_confidence: float | None,
        weights_payload: Any,
    ) -> float | None:
        if cell_confidence is None and ocr_confidence is None:
            return None
        if cell_confidence is None:
            return ocr_confidence
        if ocr_confidence is None:
            return cell_confidence

        # Keep historical behavior (prefer cell confidence) unless explicit weights are provided.
        if not isinstance(weights_payload, dict):
            return cell_confidence

        default_cell_weight = 0.7
        default_ocr_weight = 0.3
        cell_weight = self._coerce_float(weights_payload.get("cell_weight"))
        ocr_weight = self._coerce_float(weights_payload.get("ocr_weight"))
        if cell_weight is not None and ocr_weight is not None and (cell_weight + ocr_weight) > 0:
            total = cell_weight + ocr_weight
            cell_weight = cell_weight / total
            ocr_weight = ocr_weight / total
        else:
            cell_weight = default_cell_weight
            ocr_weight = default_ocr_weight

        return round((cell_weight * cell_confidence) + (ocr_weight * ocr_confidence), 4)
