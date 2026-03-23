from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass(slots=True)
class OCRCell:
    row: int
    col: int
    text: str
    row_span: int = 1
    col_span: int = 1
    confidence: Optional[float] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "row": self.row,
            "col": self.col,
            "text": self.text,
            "row_span": self.row_span,
            "col_span": self.col_span,
            "confidence": self.confidence,
        }


@dataclass(slots=True)
class ParseIssue:
    code: str
    message: str
    location: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        payload = {"code": self.code, "message": self.message}
        if self.location:
            payload["location"] = self.location
        return payload


@dataclass(slots=True)
class TimetableBatch:
    class_label: Optional[str] = None
    year_label: Optional[str] = None
    branch_label: Optional[str] = None
    division_label: Optional[str] = None
    academic_year: Optional[str] = None
    semester_label: Optional[str] = None
    pattern_label: Optional[str] = None
    effective_from: Optional[str] = None
    venue: Optional[str] = None
    verified: bool = False
    source_name: Optional[str] = None
    image_path: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "class_label": self.class_label,
            "year_label": self.year_label,
            "branch_label": self.branch_label,
            "division_label": self.division_label,
            "academic_year": self.academic_year,
            "semester_label": self.semester_label,
            "pattern_label": self.pattern_label,
            "effective_from": self.effective_from,
            "venue": self.venue,
            "verified": self.verified,
            "source_name": self.source_name,
            "image_path": self.image_path,
        }

    def to_backend_metadata(self, issues: list["ParseIssue"] | None = None) -> dict[str, Any]:
        notes: list[str] = []
        if self.class_label:
            notes.append(f"class_label={self.class_label}")
        if self.academic_year:
            notes.append(f"academic_year={self.academic_year}")
        if self.image_path:
            notes.append(f"image_path={self.image_path}")
        if issues:
            notes.extend(f"issue:{issue.code}:{issue.message}" for issue in issues)

        return {
            "yearLabel": self.year_label,
            "branchLabel": self.branch_label,
            "divisionLabel": self.division_label,
            "semesterLabel": self.semester_label,
            "academicPatternLabel": self.pattern_label,
            "effectiveFrom": self.effective_from,
            "venue": self.venue,
            "sourceImageName": self.source_name,
            "sourceImageMimeType": None,
            "sourceImageChecksum": None,
            "sourceHint": "ocr-worker",
            "sourceNotes": "\n".join(notes) if notes else None,
        }


@dataclass(slots=True)
class TimetableEntry:
    day_of_week: str
    start_time: Optional[str]
    end_time: Optional[str]
    subject_text: str
    entry_type: str = "lecture"
    faculty_code: Optional[str] = None
    location_label: Optional[str] = None
    notes: list[str] = field(default_factory=list)
    raw_text: str = ""
    source_row: Optional[int] = None
    source_col: Optional[int] = None
    row_span: int = 1
    col_span: int = 1

    def to_dict(self) -> dict[str, Any]:
        return {
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "subject_text": self.subject_text,
            "entry_type": self.entry_type,
            "faculty_code": self.faculty_code,
            "location_label": self.location_label,
            "notes": list(self.notes),
            "raw_text": self.raw_text,
            "source_row": self.source_row,
            "source_col": self.source_col,
            "row_span": self.row_span,
            "col_span": self.col_span,
        }

    def to_backend_dict(self, sort_order: int) -> dict[str, Any]:
        subject_name = self.subject_text
        note_text = "\n".join(self.notes) if self.notes else None
        return {
            "dayOfWeek": self.day_of_week,
            "startTime": f"{self.start_time}:00" if self.start_time else None,
            "endTime": f"{self.end_time}:00" if self.end_time else None,
            "subjectName": subject_name,
            "facultyCode": self.faculty_code,
            "locationLabel": self.location_label,
            "entryType": self.entry_type.upper(),
            "noteText": note_text,
            "rawCellText": self.raw_text,
            "sortOrder": sort_order,
            "breakEntry": self.entry_type == "break",
            "holidayEntry": self.entry_type == "holiday",
        }


@dataclass(slots=True)
class ParseResult:
    source: dict[str, Any]
    batch: TimetableBatch
    entries: list[TimetableEntry]
    issues: list[ParseIssue] = field(default_factory=list)
    raw_text: str = ""
    cells_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "source": dict(self.source),
            "batch": self.batch.to_dict(),
            "entries": [entry.to_dict() for entry in self.entries],
            "issues": [issue.to_dict() for issue in self.issues],
            "raw_text": self.raw_text,
            "cells_count": self.cells_count,
        }

    def to_backend_import_dict(
        self,
        extraction_confidence: float | None = None,
    ) -> dict[str, Any]:
        return {
            "metadata": self.batch.to_backend_metadata(self.issues),
            "rawOcrText": self.raw_text,
            "extractionConfidence": extraction_confidence,
            "entries": [
                entry.to_backend_dict(sort_order=index + 1)
                for index, entry in enumerate(self.entries)
            ],
        }
