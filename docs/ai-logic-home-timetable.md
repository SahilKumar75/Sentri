## Home Timetable Intelligence

### Goal

The Home screen should behave like a reliable academic copilot, not a static calendar.

Its job is to answer:

- what is happening now
- what is next
- whether the timetable is stale
- what the student should do next

### Inputs

- weekly timetable entries
- current local time
- selected focus date
- last upload source and timestamp
- current weekday and Saturday refresh rule

### Reasoning Pipeline

1. Normalize timetable entries into a sortable day schedule.
2. Detect whether the focused date is today or a future/past day.
3. Determine the schedule state:
   - live class
   - upcoming class
   - free slot
   - day complete
   - holiday
4. Compute refresh urgency:
   - low before Saturday
   - high on Saturday and after
5. Produce user-facing guidance:
   - current class summary
   - next class summary
   - refresh prompt copy
   - confidence/explanation labels

### Output Contract

- `headline`
- `status`
- `currentClass`
- `nextClass`
- `refreshState`
- `refreshReason`
- `recommendedAction`

### Product Rules

- If the focused date is not today, Home should stop pretending a class is “live”.
- If there are no entries for the day, Home should say that clearly.
- If the current week is stale, the upload path should be promoted.
- The “why” behind the recommendation should remain explainable.

### Future Upgrade Path

This deterministic layer can later be combined with:

- OCR confidence from the parser
- class-change anomaly detection
- reminders learned from user behavior
