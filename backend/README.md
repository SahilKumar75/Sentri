# Sentri Backend

Spring Boot backend for the Sentri student app.

## Stack

- Java 17
- Spring Boot
- PostgreSQL
- JPA / Hibernate
- H2 for tests

## Run

Set the database variables if needed:

```bash
export SENTRI_DATABASE_URL=jdbc:postgresql://localhost:5432/sentri
export SENTRI_DATABASE_USERNAME=sentri
export SENTRI_DATABASE_PASSWORD=sentri
```

Start the app:

```bash
mvn spring-boot:run
```

Run tests:

```bash
mvn test
```

## API

Base path: `/api/v1`

### Health

`GET /health`

Returns service status.

### Timetable batches

`POST /timetable-batches`

Creates a placeholder timetable batch from screenshot metadata.

`POST /timetable-batches/uploads`

Accepts `multipart/form-data` with:

- `file`: timetable screenshot image
- `sourceHint`: optional source tag such as `share`, `photos`, or `outlook-screenshot`
- `sourceNotes`: optional note about where the upload came from

The backend stores the screenshot locally and creates a placeholder batch ready for OCR parsing.

`GET /timetable-batches`

Lists all timetable batches.

`GET /timetable-batches/{batchId}`

Returns one batch with all timetable entries.

`POST /timetable-batches/{batchId}/parsed-data`

Saves parsed timetable JSON from the OCR worker.

## Example parsed payload

```json
{
  "metadata": {
    "yearLabel": "SE",
    "branchLabel": "IT",
    "divisionLabel": "B",
    "semesterLabel": "II",
    "academicPatternLabel": "Autonomous",
    "effectiveFrom": "2026-03-23",
    "venue": "LH 20",
    "sourceImageName": "timetable.png",
    "sourceImageMimeType": "image/png",
    "sourceImageChecksum": "abc123",
    "sourceHint": "share-sheet",
    "sourceNotes": "Uploaded by student"
  },
  "rawOcrText": "MON 8.45-9.45 DM & SM",
  "extractionConfidence": 0.91,
  "entries": [
    {
      "dayOfWeek": "MON",
      "startTime": "08:45:00",
      "endTime": "09:45:00",
      "subjectName": "DM & SM",
      "facultyCode": "MA",
      "locationLabel": "Lab-III",
      "entryType": "LAB",
      "noteText": "Assignment No. 7",
      "rawCellText": "DM & SM (A) Lab-III",
      "sortOrder": 1,
      "breakEntry": false,
      "holidayEntry": false
    }
  ]
}
```
