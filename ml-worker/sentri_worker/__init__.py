from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_PACKAGE = ROOT / "src" / "sentri_worker"

if SRC_PACKAGE.exists():
    __path__.append(str(SRC_PACKAGE))  # type: ignore[name-defined]

from .models import OCRCell, ParseIssue, ParseResult, TimetableBatch, TimetableEntry  # noqa: E402
from .pipeline import SentriWorker  # noqa: E402

__all__ = [
    "OCRCell",
    "ParseIssue",
    "ParseResult",
    "TimetableBatch",
    "TimetableEntry",
    "SentriWorker",
]
