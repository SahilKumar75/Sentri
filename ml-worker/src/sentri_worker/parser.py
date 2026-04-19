from __future__ import annotations

import re
from collections import Counter
from datetime import datetime
from typing import Sequence

from .models import OCRCell, ParseIssue, ParseResult, TimetableBatch, TimetableEntry
from .tuning import TuningProfile

DAY_ALIASES = {
    "MON": "MON",
    "MONDAY": "MON",
    "TUE": "TUE",
    "TUES": "TUE",
    "TUESDAY": "TUE",
    "WED": "WED",
    "WEDNES": "WED",
    "WEDNESDAY": "WED",
    "THU": "THU",
    "THUR": "THU",
    "THURS": "THU",
    "THURSDAY": "THU",
    "FRI": "FRI",
    "FRIDAY": "FRI",
    "SAT": "SAT",
    "SATURDAY": "SAT",
    "SUN": "SUN",
    "SUNDAY": "SUN",
}

OCR_DAY_CHAR_SUBSTITUTIONS = str.maketrans(
    {
        "0": "O",
        "1": "I",
        "5": "S",
        "8": "B",
    }
)

OCR_TIME_CHAR_SUBSTITUTIONS = str.maketrans(
    {
        "O": "0",
        "o": "0",
        "I": "1",
        "l": "1",
        "S": "5",
        "s": "5",
        "B": "8",
    }
)

DAY_ORDER = {
    "MON": 1,
    "TUE": 2,
    "WED": 3,
    "THU": 4,
    "FRI": 5,
    "SAT": 6,
    "SUN": 7,
}

DAY_PATTERN = re.compile(r"\b(MON(?:DAY)?|TUE(?:S|SDAY)?|WED(?:NESDAY)?|THU(?:RS(?:DAY)?)?|FRI(?:DAY)?|SAT(?:URDAY)?|SUN(?:DAY)?)\b", re.IGNORECASE)
TIME_PATTERN = re.compile(r"(?P<start>\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|—|~|to)\s*(?P<end>\d{1,2}(?:[:.]\d{2})?)", re.IGNORECASE)
CLASS_PATTERN = re.compile(r"\b(?:Class|CLASS)\s*[:\-]\s*(?P<class>[A-Z0-9 &/-]+)", re.IGNORECASE)
VENUE_PATTERN = re.compile(r"\bVenue\s*[:\-]\s*(?P<venue>.+)$", re.IGNORECASE)
ACADEMIC_PATTERN = re.compile(r"\bAcademic Year\b.*?(?P<year>\d{4}\s*[-/]\s*\d{2,4})", re.IGNORECASE)
SEMESTER_PATTERN = re.compile(r"\bSEM(?:ESTER)?\s*([IVX]+|\d+)\b", re.IGNORECASE)
WEF_PATTERN = re.compile(r"\b(?:WEF|Week Effective From)\s*[:\-]\s*(?P<date>.+)$", re.IGNORECASE)
PARENTHESES_CODE_PATTERN = re.compile(r"^\(([A-Z0-9]{1,6})\)$")
FACULTY_CODE_PATTERN = re.compile(r"^(?:FACULTY|TEACHER|PROF)\s*[:\-]\s*([A-Z0-9]{2,8})$", re.IGNORECASE)
LOCATION_PATTERN = re.compile(
    r"\b(LAB(?:-?[IVX\d]+)?|LIBRARY\s+[A-Z\d]+|TUT\s+ROOM|ROOM\s+[A-Z0-9-]+|CLASSROOM|LH\s*\d+|NGC|CGL|CR\s*[-:]?\s*\d+)\b",
    re.IGNORECASE,
)

SUBJECT_ALIASES = {
    "DBM5": "DBMS",
    "D8MS": "DBMS",
    "PR0JECT MANAGEMENT": "PROJECT MANAGEMENT",
    "TUT0RIAL": "TUTORIAL",
}


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def normalize_day(value: str) -> str | None:
    # Remove non-alphabetic, but keep trailing digits for cases like 'TUE5'
    raw = value.upper().translate(OCR_DAY_CHAR_SUBSTITUTIONS)
    token = re.sub(r"[^A-Z0-9]", "", raw)
    if not token:
        return None
    # Direct match
    if token in DAY_ALIASES:
        return DAY_ALIASES[token]
    # Remove trailing digits (e.g., 'TUE5' -> 'TUE')
    token_alpha = re.sub(r"\d+$", "", token)
    if token_alpha in DAY_ALIASES:
        return DAY_ALIASES[token_alpha]
    # Fuzzy match: allow partials and common OCR errors
    for alias, normalized in DAY_ALIASES.items():
        if alias.startswith(token_alpha) or token_alpha.startswith(alias):
            return normalized
        # Allow up to 1 character difference (simple typo tolerance)
        if len(token_alpha) == len(alias) and sum(a != b for a, b in zip(token_alpha, alias)) == 1:
            return normalized
    return None


def normalize_time_label(value: str) -> str | None:
    value = value.strip().replace(".", ":")
    value = value.translate(OCR_TIME_CHAR_SUBSTITUTIONS)
    value = value.replace(" ", "")
    if not value:
        return None

    # Handle am/pm suffix (e.g. "9am", "9:45pm", "9:45AM")
    am_pm_match = re.match(r"^(\d{1,2}(?::\d{2})?)([AaPp][Mm])$", value)
    if am_pm_match:
        time_part, meridiem = am_pm_match.group(1), am_pm_match.group(2).upper()
        if ":" not in time_part:
            time_part = f"{time_part}:00"
        try:
            parsed = datetime.strptime(f"{time_part} {meridiem}", "%I:%M %p")
            return parsed.strftime("%H:%M")
        except ValueError:
            pass

    if ":" not in value:
        if len(value) in {3, 4}:
            value = f"{value[:-2]}:{value[-2:]}"
        else:
            value = f"{value}:00"
    try:
        parsed = datetime.strptime(value, "%H:%M")
    except ValueError:
        try:
            parsed = datetime.strptime(value, "%I:%M")
        except ValueError:
            return None
    return parsed.strftime("%H:%M")


def _time_label_to_minutes(value: str | None) -> int | None:
    if not value:
        return None
    try:
        hour, minute = value.split(":", 1)
        return int(hour) * 60 + int(minute)
    except ValueError:
        return None


def _minutes_to_time_label(value: int | None) -> str | None:
    if value is None:
        return None
    value %= 24 * 60
    return f"{value // 60:02d}:{value % 60:02d}"


def _make_monotonic_range(
    start_label: str | None,
    end_label: str | None,
    previous_end_minutes: int | None,
) -> tuple[str | None, str | None, int | None]:
    start_minutes = _time_label_to_minutes(start_label)
    end_minutes = _time_label_to_minutes(end_label)
    if start_minutes is None or end_minutes is None:
        return start_label, end_label, previous_end_minutes

    while previous_end_minutes is not None and start_minutes < previous_end_minutes:
        start_minutes += 12 * 60
        end_minutes += 12 * 60

    while end_minutes <= start_minutes:
        end_minutes += 12 * 60

    return _minutes_to_time_label(start_minutes), _minutes_to_time_label(end_minutes), end_minutes


def normalize_time_range(value: str) -> tuple[str | None, str | None] | None:
    normalized = value.replace(".", ":").translate(OCR_TIME_CHAR_SUBSTITUTIONS)
    normalized = normalized.replace(" TO ", " to ")
    match = TIME_PATTERN.search(normalized)
    if not match:
        return None
    start = normalize_time_label(match.group("start"))
    end = normalize_time_label(match.group("end"))
    if not start or not end:
        return None
    return start, end


def split_lines(raw_text: str) -> list[str]:
    lines = [normalize_whitespace(line) for line in raw_text.splitlines() if normalize_whitespace(line)]
    # Remove adjacent duplicate lines (common OCR doubling artifact)
    deduplicated: list[str] = []
    for line in lines:
        if not deduplicated or line != deduplicated[-1]:
            deduplicated.append(line)
    return deduplicated


def parse_date_value(value: str) -> str | None:
    cleaned = normalize_whitespace(value)
    cleaned = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", cleaned, flags=re.IGNORECASE)
    formats = [
        "%d %B %Y",
        "%d %b %Y",
        "%d %B %y",
        "%d %b %y",
        "%d-%m-%Y",
        "%d-%m-%y",
        "%d/%m/%Y",
        "%d/%m/%y",
        "%d %m %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt).date().isoformat()
        except ValueError:
            continue
    match = re.search(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})", cleaned)
    if match:
        day, month, year = match.groups()
        if len(year) == 2:
            year = f"20{year}"
        try:
            return datetime.strptime(f"{day} {month} {year}", "%d %B %Y").date().isoformat()
        except ValueError:
            try:
                return datetime.strptime(f"{day} {month} {year}", "%d %b %Y").date().isoformat()
            except ValueError:
                return None
    return None


def parse_class_label(class_label: str | None) -> tuple[str | None, str | None, str | None]:
    if not class_label:
        return None, None, None
    cleaned = normalize_whitespace(class_label).upper()
    match = re.match(r"^(?P<year>FY|SY|TY|BE|SE|TE|FE)\s+(?P<branch>[A-Z0-9 &/]+?)(?:-(?P<division>[A-Z0-9]+))?$", cleaned)
    if not match:
        return None, None, None
    return match.group("year"), normalize_whitespace(match.group("branch")), match.group("division")


def extract_batch_metadata(lines: Sequence[str]) -> TimetableBatch:
    batch = TimetableBatch()
    for line in lines:
        class_match = CLASS_PATTERN.search(line)
        if class_match:
            batch.class_label = normalize_whitespace(class_match.group("class"))
            year, branch, division = parse_class_label(batch.class_label)
            batch.year_label = year
            batch.branch_label = branch
            batch.division_label = division

        venue_match = VENUE_PATTERN.search(line)
        if venue_match:
            batch.venue = normalize_whitespace(venue_match.group("venue"))

        academic_match = ACADEMIC_PATTERN.search(line)
        if academic_match:
            batch.academic_year = normalize_whitespace(academic_match.group("year"))

        semester_match = SEMESTER_PATTERN.search(line)
        if semester_match:
            batch.semester_label = f"SEM {semester_match.group(1).upper()}"

        wef_match = WEF_PATTERN.search(line)
        if wef_match:
            batch.effective_from = parse_date_value(wef_match.group("date"))

        normalized = line.upper()
        if "AUTONOMOUS" in normalized:
            batch.pattern_label = "AUTONOMOUS"
        elif "NEP 2024" in normalized:
            batch.pattern_label = "NEP 2024"
        elif "2019 CREDIT PATTERN" in normalized:
            batch.pattern_label = "SPPU 2019"

        if "DEPARTMENT OF INFORMATION TECHNOLOGY" in normalized:
            batch.branch_label = batch.branch_label or "IT"
    if batch.class_label and not batch.year_label:
        year, branch, division = parse_class_label(batch.class_label)
        batch.year_label = year
        batch.branch_label = batch.branch_label or branch
        batch.division_label = batch.division_label or division
    return batch


def classify_entry(text: str) -> str:
    upper = text.upper()
    if not upper.strip():
        return "blank"
    if "HOLIDAY" in upper:
        return "holiday"
    if "LUNCH" in upper or "BREAK" in upper:
        return "break"
    if "LAB" in upper or "PRACTICAL" in upper:
        return "lab"
    if "TUT" in upper or "TUTORIAL" in upper:
        return "tutorial"
    return "lecture"


def parse_cell_text(
    text: str,
    tuning_profile: TuningProfile | None = None,
) -> tuple[str, str | None, str | None, list[str]]:
    lines = split_lines(text)
    if not lines:
        return "", None, None, []
    subject = normalize_subject_text(lines[0], tuning_profile=tuning_profile)
    faculty_code = None
    location = None
    notes: list[str] = []
    for line in lines[1:]:
        normalized_line = normalize_subject_text(line, tuning_profile=tuning_profile)
        if not faculty_code:
            code_match = PARENTHESES_CODE_PATTERN.match(normalized_line)
            if code_match:
                faculty_code = code_match.group(1)
                continue
            short_code_match = re.fullmatch(r"\(([A-Z0-9]{2,6})\)", normalized_line)
            if short_code_match:
                faculty_code = short_code_match.group(1)
                continue

            long_code_match = FACULTY_CODE_PATTERN.match(normalized_line)
            if long_code_match:
                faculty_code = long_code_match.group(1)
                continue

            if tuning_profile is not None:
                tuned_code = tuning_profile.normalize_faculty_code(normalized_line)
                if tuned_code and re.fullmatch(r"[A-Z0-9]{2,4}", tuned_code):
                    faculty_code = tuned_code
                    continue

            uppercase = re.sub(r"[^A-Z0-9]", "", normalized_line.upper())
            if (
                2 <= len(uppercase) <= 4
                and uppercase.isalnum()
                and " " not in normalized_line
                and not LOCATION_PATTERN.search(normalized_line)
            ):
                faculty_code = uppercase
                continue

        if not location and LOCATION_PATTERN.search(normalized_line):
            location = normalized_line
            continue
        notes.append(normalized_line)
    if location is None:
        location_guess = next((normalize_subject_text(line, tuning_profile=tuning_profile) for line in lines if LOCATION_PATTERN.search(line)), None)
        if location_guess and location_guess != subject:
            location = location_guess

    if tuning_profile is not None:
        faculty_code = tuning_profile.normalize_faculty_code(faculty_code)
        location = tuning_profile.normalize_location_label(location)

    return subject, faculty_code, location, _cleanup_notes(notes, subject, faculty_code, location)


def normalize_subject_text(value: str, tuning_profile: TuningProfile | None = None) -> str:
    cleaned = normalize_whitespace(value)
    cleaned = re.sub(r"^[^A-Za-z0-9]+", "", cleaned)
    original_upper = cleaned.upper()
    upper_cleaned = original_upper
    upper_cleaned = upper_cleaned.replace("D8MS", "DBMS")
    upper_cleaned = upper_cleaned.replace("DBM5", "DBMS")
    upper_cleaned = upper_cleaned.replace("PR0JECT", "PROJECT")
    upper_cleaned = upper_cleaned.replace("TUT0RIAL", "TUTORIAL")
    normalized = SUBJECT_ALIASES.get(upper_cleaned)
    if normalized is not None:
        resolved = normalized
    elif upper_cleaned != original_upper:
        resolved = upper_cleaned
    else:
        resolved = cleaned

    if tuning_profile is not None:
        return tuning_profile.normalize_subject(resolved)
    return resolved


def _cleanup_notes(
    notes: Sequence[str],
    subject: str,
    faculty_code: str | None,
    location: str | None,
) -> list[str]:
    cleaned_notes: list[str] = []
    seen: set[str] = set()
    subject_upper = normalize_whitespace(subject).upper()
    faculty_upper = faculty_code.upper() if faculty_code else None
    location_upper = normalize_whitespace(location).upper() if location else None

    for note in notes:
        normalized = normalize_whitespace(note)
        if not normalized:
            continue
        upper = normalized.upper()
        if upper == subject_upper:
            continue
        if faculty_upper and upper == faculty_upper:
            continue
        if location_upper and upper == location_upper:
            continue
        if upper in seen:
            continue
        seen.add(upper)
        cleaned_notes.append(normalized)
    return cleaned_notes


def _find_header_row(cells: Sequence[OCRCell]) -> int | None:
    score_by_row: Counter[int] = Counter()
    for cell in cells:
        if normalize_time_range(cell.text):
            score_by_row[cell.row] += 1
    if not score_by_row:
        return None
    max_score = max(score_by_row.values())
    # Among all rows with the top score, prefer the lowest row index for determinism
    candidates = [row for row, score in score_by_row.items() if score == max_score]
    return min(candidates)


def _find_day_col(cells: Sequence[OCRCell]) -> int | None:
    score_by_col: Counter[int] = Counter()
    for cell in cells:
        if normalize_day(cell.text):
            score_by_col[cell.col] += 1
    if not score_by_col:
        return None
    return score_by_col.most_common(1)[0][0]


def _build_time_map(cells: Sequence[OCRCell], header_row: int, day_col: int | None) -> dict[int, tuple[str | None, str | None]]:
    time_map: dict[int, tuple[str | None, str | None]] = {}
    previous_end_minutes: int | None = None
    for cell in sorted(cells, key=lambda item: item.col):
        if cell.row != header_row:
            continue
        if day_col is not None and cell.col == day_col:
            continue
        time_range = normalize_time_range(cell.text)
        if time_range:
            start_label, end_label, previous_end_minutes = _make_monotonic_range(
                time_range[0],
                time_range[1],
                previous_end_minutes,
            )
            time_map[cell.col] = (start_label, end_label)
    return time_map


def _build_day_map(cells: Sequence[OCRCell], day_col: int, header_row: int) -> dict[int, str]:
    day_map: dict[int, str] = {}
    for cell in cells:
        if cell.col != day_col or cell.row == header_row:
            continue
        day = normalize_day(cell.text)
        if day:
            day_map[cell.row] = day
    return day_map


def _span_times(time_map: dict[int, tuple[str | None, str | None]], start_col: int, col_span: int) -> tuple[str | None, str | None]:
    columns = [time_map.get(col) for col in range(start_col, start_col + max(col_span, 1))]
    columns = [slot for slot in columns if slot]
    if not columns:
        return None, None
    return columns[0][0], columns[-1][1]


def _entry_sort_key(entry: TimetableEntry) -> tuple[int, int, int, int, int, str]:
    start_minutes = _time_label_to_minutes(entry.start_time)
    end_minutes = _time_label_to_minutes(entry.end_time)
    return (
        DAY_ORDER.get(entry.day_of_week, 99),
        start_minutes if start_minutes is not None else 10_000,
        end_minutes if end_minutes is not None else 10_001,
        entry.source_row if entry.source_row is not None else 10_000,
        entry.source_col if entry.source_col is not None else 10_000,
        normalize_whitespace(entry.subject_text).upper(),
    )


def _deduplicate_entries(entries: Sequence[TimetableEntry], issues: list[ParseIssue]) -> list[TimetableEntry]:
    deduplicated: list[TimetableEntry] = []
    seen: set[tuple[str, str | None, str | None, str, str]] = set()

    for entry in entries:
        dedupe_key = (
            entry.day_of_week,
            entry.start_time,
            entry.end_time,
            normalize_whitespace(entry.subject_text).upper(),
            entry.entry_type,
        )
        if dedupe_key in seen:
            issues.append(
                ParseIssue(
                    code="duplicate_entry_removed",
                    message=f"Removed duplicate entry for {entry.day_of_week} {entry.start_time or 'unknown'} {entry.subject_text}",
                )
            )
            continue
        seen.add(dedupe_key)
        deduplicated.append(entry)
    return deduplicated


def parse_cells(
    cells: Sequence[OCRCell],
    raw_text: str = "",
    source: dict[str, object] | None = None,
    tuning_profile: TuningProfile | None = None,
) -> ParseResult:
    source = dict(source or {})
    issues: list[ParseIssue] = []
    if not cells:
        batch = extract_batch_metadata(split_lines(raw_text))
        if source:
            batch.source_name = source.get("source_name") if isinstance(source.get("source_name"), str) else None
            batch.image_path = source.get("image_path") if isinstance(source.get("image_path"), str) else None
        return ParseResult(source=source, batch=batch, entries=[], issues=[ParseIssue(code="no_cells", message="No timetable cells were supplied.")], raw_text=raw_text, cells_count=0)

    header_row = _find_header_row(cells)
    if header_row is None:
        issues.append(ParseIssue(code="header_row_missing", message="Could not infer a time header row."))
        header_row = min(cell.row for cell in cells)

    day_col = _find_day_col(cells)
    if day_col is None:
        issues.append(ParseIssue(code="day_column_missing", message="Could not infer a day label column."))
        day_col = min(cell.col for cell in cells)

    time_map = _build_time_map(cells, header_row, day_col)
    day_map = _build_day_map(cells, day_col, header_row) if day_col is not None else {}
    batch = extract_batch_metadata(split_lines(raw_text))
    if source.get("source_name"):
        batch.source_name = str(source["source_name"])
    if source.get("image_path"):
        batch.image_path = str(source["image_path"])

    entries: list[TimetableEntry] = []
    for cell in sorted(cells, key=lambda current: (current.row, current.col, current.row_span, current.col_span)):
        if cell.row == header_row or cell.col == day_col:
            continue
        raw_cell_text = cell.text.strip()
        normalized_text = normalize_whitespace(raw_cell_text)
        if not normalized_text:
            continue

        day = day_map.get(cell.row)
        if not day:
            continue

        entry_type = classify_entry(raw_cell_text)
        if entry_type == "blank":
            continue

        subject_text, faculty_code, location_label, notes = parse_cell_text(raw_cell_text, tuning_profile=tuning_profile)
        start_time, end_time = _span_times(time_map, cell.col, cell.col_span)
        entries.append(
            TimetableEntry(
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                subject_text=subject_text,
                entry_type=entry_type,
                faculty_code=faculty_code,
                location_label=location_label,
                notes=notes,
                raw_text=raw_cell_text,
                source_row=cell.row,
                source_col=cell.col,
                row_span=cell.row_span,
                col_span=cell.col_span,
            )
        )

    entries = sorted(_deduplicate_entries(entries, issues), key=_entry_sort_key)

    if not entries and raw_text:
        issues.append(ParseIssue(code="no_entries_from_cells", message="No schedule entries were produced from the supplied cells."))
    return ParseResult(source=source, batch=batch, entries=entries, issues=issues, raw_text=raw_text, cells_count=len(cells))


def parse_text_schedule(
    raw_text: str,
    source: dict[str, object] | None = None,
    tuning_profile: TuningProfile | None = None,
) -> ParseResult:
    lines = split_lines(raw_text)
    source = dict(source or {})
    batch = extract_batch_metadata(lines)
    if source.get("source_name"):
        batch.source_name = str(source["source_name"])
    if source.get("image_path"):
        batch.image_path = str(source["image_path"])

    entries: list[TimetableEntry] = []
    current_day: str | None = None
    pending_time: tuple[str, str] | None = None
    previous_end_minutes: int | None = None
    issues: list[ParseIssue] = []
    for line in lines:
        day = normalize_day(line)
        if day:
            current_day = day
            pending_time = None
            previous_end_minutes = None
            continue
        time_range = normalize_time_range(line)
        if time_range:
            start_label, end_label, previous_end_minutes = _make_monotonic_range(
                time_range[0],
                time_range[1],
                previous_end_minutes,
            )
            pending_time = (start_label, end_label)
            remainder = normalize_whitespace(line)
            remainder = re.sub(TIME_PATTERN, "", remainder).strip()
            if remainder and current_day:
                subject_text, faculty_code, location_label, notes = parse_cell_text(remainder, tuning_profile=tuning_profile)
                entry_type = classify_entry(remainder)
                if entry_type != "blank":
                    entries.append(
                        TimetableEntry(
                            day_of_week=current_day,
                            start_time=pending_time[0],
                            end_time=pending_time[1],
                            subject_text=subject_text,
                            entry_type=entry_type,
                            faculty_code=faculty_code,
                            location_label=location_label,
                            notes=notes,
                            raw_text=line,
                        )
                    )
                    continue
            continue
        if not current_day:
            continue
        if not pending_time:
            pending_time = (None, None)
        subject_text, faculty_code, location_label, notes = parse_cell_text(line, tuning_profile=tuning_profile)
        entry_type = classify_entry(line)
        if entry_type == "blank":
            continue
        entries.append(
            TimetableEntry(
                day_of_week=current_day,
                start_time=pending_time[0],
                end_time=pending_time[1],
                subject_text=subject_text,
                entry_type=entry_type,
                faculty_code=faculty_code,
                location_label=location_label,
                notes=notes,
                raw_text=line,
            )
        )

    entries = sorted(_deduplicate_entries(entries, issues), key=_entry_sort_key)

    if not entries:
        # Find non-blank, non-day, non-time lines for debugging
        debug_lines = [line for line in lines if line.strip() and not normalize_day(line) and not normalize_time_range(line)]
        msg = "Could not infer timetable entries from OCR text. Problematic lines: " + ", ".join(repr(l) for l in debug_lines) if debug_lines else "Could not infer timetable entries from OCR text."
        issues.append(ParseIssue(code="no_entries_from_text", message=msg))

    return ParseResult(source=source, batch=batch, entries=entries, issues=issues, raw_text=raw_text, cells_count=0)


def parse_timetable(
    raw_text: str = "",
    cells: Sequence[OCRCell] | None = None,
    source: dict[str, object] | None = None,
    tuning_profile: TuningProfile | None = None,
    fallback_to_text_schedule: bool = True,
) -> ParseResult:
    if cells:
        cell_result = parse_cells(cells=cells, raw_text=raw_text, source=source, tuning_profile=tuning_profile)
        if fallback_to_text_schedule and not cell_result.entries and raw_text.strip():
            text_result = parse_text_schedule(raw_text=raw_text, source=source, tuning_profile=tuning_profile)
            if text_result.entries:
                return ParseResult(
                    source=cell_result.source,
                    batch=text_result.batch,
                    entries=text_result.entries,
                    issues=cell_result.issues
                    + [
                        ParseIssue(
                            code="fallback_to_text_schedule",
                            message="Used text-based parsing because cell parsing produced no entries.",
                        )
                    ]
                    + text_result.issues,
                    raw_text=raw_text,
                    cells_count=cell_result.cells_count,
                )
        return cell_result
    return parse_text_schedule(raw_text=raw_text, source=source, tuning_profile=tuning_profile)
