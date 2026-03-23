# Sentri OCR Worker

This package is the zero-budget OCR and timetable parsing worker for Sentri.

It is designed to sit behind the Spring Boot backend and turn timetable screenshots into stable JSON that the Java service can store and serve.

## Responsibilities

- accept screenshot metadata, OCR text, or cell-like table data
- extract timetable headers from raw OCR text
- normalize timetable rows into structured entries
- keep OCR optional so the worker still runs when Tesseract is not installed

## JSON Contract

The worker returns a backend-ready payload for the Spring Boot import endpoint.

```json
{
  "metadata": {
    "yearLabel": "SE",
    "branchLabel": "IT",
    "divisionLabel": "B",
    "semesterLabel": "SEM II",
    "academicPatternLabel": "SPPU 2019",
    "effectiveFrom": "2026-03-23",
    "venue": "LH 20",
    "sourceImageName": "SE_IT_B_sem2.png",
    "sourceImageMimeType": null,
    "sourceImageChecksum": null,
    "sourceHint": "ocr-worker",
    "sourceNotes": "class_label=SE IT-B\nacademic_year=2025-26"
  },
  "rawOcrText": "Class: SE IT-B\nAcademic Year - 2025-26 - SEM II\nVenue: LH 20",
  "extractionConfidence": null,
  "entries": [
    {
      "dayOfWeek": "MON",
      "startTime": "08:45:00",
      "endTime": "10:45:00",
      "subjectName": "DM & SM (A) Lab-III",
      "facultyCode": "MA",
      "locationLabel": "Lab-III",
      "entryType": "LAB",
      "noteText": "Assignment No.7",
      "rawCellText": "DM & SM (A) Lab-III\\n(MA)\\nAssignment No.7",
      "sortOrder": 1,
      "breakEntry": false,
      "holidayEntry": false
    }
  ]
}
```

## Run

```bash
python -m sentri_worker --input sample.json
```

If you have a real image and OCR installed:

```bash
python -m sentri_worker --image /path/to/timetable.png
```

If Tesseract is not installed, the worker will still run and return a warning instead of crashing.

## Tests

```bash
python -m unittest discover -s tests
```

## Notes

- OCR is intentionally optional.
- The parser is deterministic and should stay easy to debug.
- The worker outputs Spring Boot import JSON directly.
- The worker should only normalize timetable data, not try to become a general AI assistant.
