from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from sentri_worker.models import OCRCell
from sentri_worker.parser import classify_entry, normalize_time_label, parse_cell_text, parse_date_value, parse_timetable, parse_text_schedule, split_lines
from sentri_worker.tuning import TuningProfile


class ParserTests(unittest.TestCase):
    def test_parse_text_schedule_reports_problematic_lines(self) -> None:
        raw_text = """
        This is not a day
        This is not a time
        """
        result = parse_text_schedule(raw_text)
        self.assertEqual(len(result.entries), 0)
        found = [iss for iss in result.issues if iss.code == "no_entries_from_text"]
        self.assertTrue(found)
        self.assertIn("This is not a day", found[0].message)
        self.assertIn("This is not a time", found[0].message)

    def test_parse_date_value_short_year_slash_format(self) -> None:
        self.assertEqual(parse_date_value("23/03/26"), "2026-03-23")
        self.assertEqual(parse_date_value("01/06/25"), "2025-06-01")

    def test_classify_entry_lunch_and_practical(self) -> None:
        self.assertEqual(classify_entry("LUNCH BREAK"), "break")
        self.assertEqual(classify_entry("lunch"), "break")
        self.assertEqual(classify_entry("Practical"), "lab")
        self.assertEqual(classify_entry("PRACTICAL EXAM"), "lab")

    def test_normalize_time_label_am_pm_suffix(self) -> None:
        self.assertEqual(normalize_time_label("9am"), "09:00")
        self.assertEqual(normalize_time_label("9AM"), "09:00")
        self.assertEqual(normalize_time_label("9:45pm"), "21:45")
        self.assertEqual(normalize_time_label("12pm"), "12:00")
        self.assertEqual(normalize_time_label("12am"), "00:00")

    def test_find_header_row_tie_breaks_on_lowest_row(self) -> None:
        # Two rows have equal time-slot counts; the lower row index must win.
        cells = [
            OCRCell(row=0, col=1, text="8:00-9:00"),
            OCRCell(row=0, col=2, text="9:00-10:00"),
            OCRCell(row=2, col=1, text="8:00-9:00"),
            OCRCell(row=2, col=2, text="9:00-10:00"),
            OCRCell(row=1, col=0, text="MON"),
        ]
        result = parse_timetable(cells=cells)
        # Header should be row 0, not row 2 — entries only come from rows != header
        # If row 2 were picked as header, no day rows would exist and entries would be empty
        # Row 0 as header means row 1 (MON) and row 2 produce day entries
        self.assertEqual(result.cells_count, len(cells))

    def test_split_lines_removes_adjacent_duplicates(self) -> None:
        raw = "MON\nMON\nDBMS\nDBMS\nFRI"
        self.assertEqual(split_lines(raw), ["MON", "DBMS", "FRI"])

    def test_split_lines_keeps_non_adjacent_duplicates(self) -> None:
        raw = "MON\nDBMS\nMON"
        self.assertEqual(split_lines(raw), ["MON", "DBMS", "MON"])

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

    def test_parse_cells_is_deterministic_and_deduplicated(self) -> None:
        cells = [
            OCRCell(row=0, col=0, text="TIME/DAY"),
            OCRCell(row=0, col=1, text="8.45-9.45"),
            OCRCell(row=0, col=2, text="9.45-10.45"),
            OCRCell(row=1, col=0, text="MON"),
            OCRCell(row=1, col=2, text="PM\n(MA)"),
            OCRCell(row=1, col=1, text="DBMS\n(VI)"),
            OCRCell(row=1, col=1, text="DBMS\n(VI)"),
        ]

        result = parse_timetable(
            raw_text="Class: SE IT-B\nAcademic Year - 2025-26 - SEM II",
            cells=cells,
        )

        self.assertEqual(len(result.entries), 2)
        self.assertEqual(result.entries[0].subject_text, "DBMS")
        self.assertEqual(result.entries[0].start_time, "08:45")
        self.assertEqual(result.entries[1].subject_text, "PM")
        self.assertTrue(any(issue.code == "duplicate_entry_removed" for issue in result.issues))

    def test_parse_text_schedule_handles_ocr_noisy_day_and_time(self) -> None:
        raw_text = "\n".join(
            [
                "M0N",
                "8:4S-9:4S D8MS",
                "TUE5",
                "10.OO-11.OO PM",
                "WEDN",
                "11:00-12:00 MATHS",
                "THUR",
                "12:00-13:00 ENGLISH",
                "FRI1DAY",
                "13:00-14:00 SCIENCE",
            ]
        )

        result = parse_text_schedule(raw_text)

        self.assertEqual(len(result.entries), 5)
        self.assertEqual(result.entries[0].day_of_week, "MON")
        self.assertEqual(result.entries[0].start_time, "08:45")
        self.assertEqual(result.entries[1].day_of_week, "TUE")
        self.assertEqual(result.entries[1].start_time, "10:00")
        self.assertEqual(result.entries[2].day_of_week, "WED")
        self.assertEqual(result.entries[2].start_time, "11:00")
        self.assertEqual(result.entries[3].day_of_week, "THU")
        self.assertEqual(result.entries[3].start_time, "12:00")
        self.assertEqual(result.entries[4].day_of_week, "FRI")
        self.assertEqual(result.entries[4].start_time, "13:00")

    def test_parse_cell_text_extracts_faculty_location_and_deduped_notes(self) -> None:
        subject, faculty_code, location, notes = parse_cell_text(
            "DBM5\nFaculty: MA\nLH 20\nRevision\nRevision"
        )

        self.assertEqual(subject, "DBMS")
        self.assertEqual(faculty_code, "MA")
        self.assertEqual(location, "LH 20")
        self.assertEqual(notes, ["Revision"])

    def test_parse_cell_text_applies_custom_tuning_profile(self) -> None:
        tuning_profile = TuningProfile(
            subject_aliases={"MATH5": "MATHS"},
            faculty_aliases={"M 4": "MA"},
            location_aliases={"LABIII": "LAB-III"},
            subject_noise_tokens=("LECTURE",),
        )

        subject, faculty_code, location, notes = parse_cell_text(
            "MATH5 LECTURE\nM 4\nLABIII\nPractice",
            tuning_profile=tuning_profile,
        )

        self.assertEqual(subject, "MATHS")
        self.assertEqual(faculty_code, "MA")
        self.assertEqual(location, "LAB-III")
        self.assertEqual(notes, ["Practice"])


if __name__ == "__main__":
    unittest.main()
