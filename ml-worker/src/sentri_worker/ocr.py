from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
import re
from typing import Any, Optional


@dataclass(slots=True)
class OCRResult:
    text: str = ""
    engine: str = "unavailable"
    quality: Optional[float] = None
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "engine": self.engine,
            "quality": self.quality,
            "warnings": list(self.warnings),
        }


class OCRService:
    def extract_from_payload(self, payload: dict[str, Any]) -> OCRResult:
        if payload.get("ocr_text"):
            normalized_text = self._normalize_ocr_text(str(payload["ocr_text"]))
            return OCRResult(
                text=normalized_text,
                engine="provided",
                quality=self._score_ocr_text(normalized_text),
            )

        image_path = payload.get("image_path")
        if not image_path:
            return OCRResult(warnings=["No image_path or ocr_text was supplied."])

        return self.extract_from_image(Path(image_path))

    def extract_from_image(self, image_path: Path) -> OCRResult:
        warnings: list[str] = []
        try:
            from PIL import Image  # type: ignore
        except Exception:
            return OCRResult(
                warnings=[
                    "Pillow is not installed, so image OCR cannot be run locally.",
                    f"Image received: {image_path}",
                ]
            )

        try:
            import pytesseract  # type: ignore
        except Exception:
            return OCRResult(
                warnings=[
                    "pytesseract is not installed, so OCR was skipped.",
                    f"Image received: {image_path}",
                ]
            )

        if not image_path.exists():
            warnings.append(f"Image does not exist: {image_path}")
            return OCRResult(warnings=warnings)

        try:
            text = pytesseract.image_to_string(Image.open(image_path))
            normalized_text = self._normalize_ocr_text(text)
            return OCRResult(
                text=normalized_text,
                engine="tesseract",
                quality=self._score_ocr_text(normalized_text),
                warnings=warnings,
            )
        except Exception as exc:
            warnings.append(f"OCR failed: {exc}")
            return OCRResult(warnings=warnings)

    def _normalize_ocr_text(self, text: str) -> str:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[|]", "I", text)
        text = re.sub(r"[‘’]", "'", text)
        return text.strip()

    def _score_ocr_text(self, text: str) -> float:
        if not text.strip():
            return 0.0
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not lines:
            return 0.0
        alpha_chars = sum(1 for char in text if char.isalpha())
        digit_chars = sum(1 for char in text if char.isdigit())
        useful_ratio = (alpha_chars + digit_chars) / max(len(text), 1)

        timetable_signals = 0
        upper_text = text.upper()
        for token in ("MON", "TUE", "WED", "THU", "FRI", "SAT", "CLASS", "SEM", "VENUE"):
            if token in upper_text:
                timetable_signals += 1

        line_quality = min(len(lines) / 12.0, 1.0)
        signal_quality = min(timetable_signals / 4.0, 1.0)
        return round(min((0.45 * useful_ratio) + (0.30 * line_quality) + (0.25 * signal_quality), 1.0), 4)
