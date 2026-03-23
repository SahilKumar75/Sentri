from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional


@dataclass(slots=True)
class OCRResult:
    text: str = ""
    engine: str = "unavailable"
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"text": self.text, "engine": self.engine, "warnings": list(self.warnings)}


class OCRService:
    def extract_from_payload(self, payload: dict[str, Any]) -> OCRResult:
        if payload.get("ocr_text"):
            return OCRResult(text=str(payload["ocr_text"]), engine="provided")

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
            return OCRResult(text=text, engine="tesseract", warnings=warnings)
        except Exception as exc:
            warnings.append(f"OCR failed: {exc}")
            return OCRResult(warnings=warnings)
