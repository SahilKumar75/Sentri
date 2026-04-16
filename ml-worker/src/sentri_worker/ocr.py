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

        ocr_options = payload.get("ocr_options") if isinstance(payload.get("ocr_options"), dict) else {}
        language = ocr_options.get("language") if isinstance(ocr_options.get("language"), str) else "eng"
        psm_candidates = self._coerce_psm_candidates(ocr_options.get("psm_candidates"))

        return self.extract_from_image(Path(image_path), language=language, psm_candidates=psm_candidates)

    def extract_from_image(
        self,
        image_path: Path,
        language: str = "eng",
        psm_candidates: tuple[int, ...] = (6, 11, 4),
    ) -> OCRResult:
        warnings: list[str] = []
        try:
            from PIL import Image  # type: ignore
            from PIL import ImageFilter, ImageOps  # type: ignore
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
            with Image.open(image_path) as source_image:
                prepared_images = self._prepare_image_variants(source_image, ImageOps=ImageOps, ImageFilter=ImageFilter)

            best_text = ""
            best_quality = -1.0
            best_engine = "tesseract"
            for variant_name, variant_image in prepared_images:
                for psm in psm_candidates:
                    config = f"--oem 1 --psm {psm} -l {language}"
                    text = pytesseract.image_to_string(variant_image, config=config)
                    normalized = self._normalize_ocr_text(text)
                    quality = self._score_ocr_text(normalized)
                    if quality > best_quality:
                        best_text = normalized
                        best_quality = quality
                        best_engine = f"tesseract:{variant_name}:psm{psm}"

            if best_quality < 0:
                warnings.append("No OCR candidate produced usable text.")
                return OCRResult(warnings=warnings)

            return OCRResult(
                text=best_text,
                engine=best_engine,
                quality=best_quality,
                warnings=warnings,
            )
        except Exception as exc:
            warnings.append(f"OCR failed: {exc}")
            return OCRResult(warnings=warnings)

    def _prepare_image_variants(self, source_image: Any, ImageOps: Any, ImageFilter: Any) -> list[tuple[str, Any]]:
        grayscale = ImageOps.grayscale(source_image)
        autocontrast = ImageOps.autocontrast(grayscale)
        denoised = autocontrast.filter(ImageFilter.MedianFilter(size=3))
        binary = denoised.point(lambda px: 255 if px > 150 else 0)

        return [
            ("grayscale", grayscale),
            ("autocontrast", autocontrast),
            ("binary", binary),
        ]

    def _coerce_psm_candidates(self, value: Any) -> tuple[int, ...]:
        if not isinstance(value, list):
            return (6, 11, 4)

        candidates: list[int] = []
        for item in value:
            try:
                parsed = int(item)
            except (TypeError, ValueError):
                continue
            if 3 <= parsed <= 13 and parsed not in candidates:
                candidates.append(parsed)

        return tuple(candidates) if candidates else (6, 11, 4)

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
