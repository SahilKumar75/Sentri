from __future__ import annotations

from typing import Iterable, Optional

from .models import ParseIssue, TimetableEntry


class ScheduleConflictDetector:
    """
    Utility for detecting time overlaps in a parsed timetable schedule.
    """

    @staticmethod
    def detect_conflicts(entries: Iterable[TimetableEntry]) -> list[ParseIssue]:
        issues: list[ParseIssue] = []
        
        # Group entries by day
        by_day: dict[str, list[TimetableEntry]] = {}
        for entry in entries:
            if not entry.start_time or not entry.end_time:
                continue
            day = entry.day_of_week.lower()
            if day not in by_day:
                by_day[day] = []
            by_day[day].append(entry)

        # Check for overlaps within each day
        for day, day_entries in by_day.items():
            # Sort by start time
            sorted_entries = sorted(day_entries, key=lambda e: e.start_time or "")
            
            for i in range(len(sorted_entries) - 1):
                current = sorted_entries[i]
                nxt = sorted_entries[i + 1]
                
                # Check overlap (assuming formats like HH:MM)
                if current.end_time and nxt.start_time and current.end_time > nxt.start_time:
                    # Skip if one of them is a break or holiday, as these might overlap by design in some schedules
                    if current.entry_type in ("break", "holiday") or nxt.entry_type in ("break", "holiday"):
                        continue
                        
                    issues.append(
                        ParseIssue(
                            code="schedule_conflict",
                            message=f"Schedule conflict on {day.capitalize()}: '{current.subject_text}' ({current.start_time}-{current.end_time}) overlaps with '{nxt.subject_text}' ({nxt.start_time}-{nxt.end_time}).",
                        )
                    )

        return issues
