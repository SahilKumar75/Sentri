from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from sentri_worker.models import OCRCell
from sentri_worker.parser import parse_timetable, parse_text_schedule


class ParserTests(unittest.TestCase):
    def test_parse_header_metadata_from_text(self) -> None:
        raw_text = "\n".join(
            [
                "Army Institute of Technology",
                "Department of Information Technology",
                "Academic Year - 2025-26 - SEM II",
                "Class: SE IT-B",
                "WEF: 23rd March 26",
                "Venue: LH 20",
            ]
        )

        result = parse_text_schedule(raw_text)

        self.assertEqual(result.batch.class_label, "SE IT-B")
        self.assertEqual(result.batch.year_label, "SE")
        self.assertEqual(result.batch.branch_label, "IT")
        self.assertEqual(result.batch.division_label, "B")
        self.assertEqual(result.batch.academic_year, "2025-26")
        self.assertEqual(result.batch.semester_label, "SEM II")
        self.assertEqual(result.batch.venue, "LH 20")
        self.assertEqual(result.batch.effective_from, "2026-03-23")

    def test_parse_cells_into_entries(self) -> None:
        cells = [
            OCRCell(row=0, col=0, text="TIME/DAY"),
            OCRCell(row=0, col=1, text="8.45-9.45"),
            OCRCell(row=0, col=2, text="9.45-10.45"),
            OCRCell(row=0, col=3, text="10.45-11.00"),
            OCRCell(row=0, col=4, text="11.00-12.00"),
            OCRCell(row=0, col=5, text="12.00-12.45"),
            OCRCell(row=0, col=6, text="12.45-1.45"),
            OCRCell(row=1, col=0, text="MON"),
            OCRCell(row=1, col=1, text="DM & SM (A) Lab-III\n(MA)\nAssignment No.7", col_span=2),
            OCRCell(row=1, col=4, text="PM\n(MA)\nProject\nSchedule, Activities"),
            OCRCell(row=1, col=6, text="DBMS\n(VI)\nParallel Databases"),
            OCRCell(row=2, col=0, text="TUES"),
            OCRCell(row=2, col=1, text="P & S\n(SG)\nLab III\nCentral limit theorem"),
        ]

        result = parse_timetable(
            raw_text="Class: SE IT-B\nAcademic Year - 2025-26 - SEM II\nVenue: LH 20",
            cells=cells,
        )

        self.assertEqual(result.batch.class_label, "SE IT-B")
        self.assertEqual(result.cells_count, len(cells))
        self.assertEqual(len(result.entries), 4)

        first = result.entries[0]
        self.assertEqual(first.day_of_week, "MON")
        self.assertEqual(first.start_time, "08:45")
        self.assertEqual(first.end_time, "10:45")
        self.assertEqual(first.entry_type, "lab")
        self.assertIn("Assignment No.7", first.notes)
        self.assertEqual(first.faculty_code, "MA")

        second = result.entries[1]
        self.assertEqual(second.start_time, "11:00")
        self.assertEqual(second.end_time, "12:00")
        self.assertEqual(second.subject_text, "PM")
        self.assertEqual(second.faculty_code, "MA")

    def test_parse_text_schedule_with_line_based_fallback(self) -> None:
        raw_text = "\n".join(
            [
                "MON",
                "8.45-9.45 DM & SM Lab-III",
                "TUES",
                "9.45-10.45 DBMS",
            ]
        )

        result = parse_text_schedule(raw_text)

        self.assertEqual(len(result.entries), 2)
        self.assertEqual(result.entries[0].day_of_week, "MON")
        self.assertEqual(result.entries[0].start_time, "08:45")
        self.assertEqual(result.entries[1].day_of_week, "TUE")


if __name__ == "__main__":
    unittest.main()
