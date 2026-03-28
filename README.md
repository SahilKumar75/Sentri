# Sentri

Sentri is a zero-budget cross-platform student companion for Army Institute of Technology.

This repository is currently split into 3 working parts:

- `app/`: Expo React Native frontend for iPhone and Android
- `backend/`: Spring Boot API and timetable storage layer
- `ml-worker/`: Python OCR and timetable normalization worker

## Product Scope

Current focus:

- timetable import from screenshots
- weekly Saturday prompt to refresh the next timetable
- clean home dashboard for now/next/today
- Myspace vault for saved screenshots, notes, and links
- calorie tracking shell
- hangout shell

## Why This Structure

The app should stay simple and cheap to run:

- Expo keeps one mobile codebase for both platforms
- Spring Boot handles the main API and persistence
- Python is used only where it helps most: OCR and deterministic parsing

## Architecture

- HLD: [docs/system-design-hld.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/system-design-hld.md)
- LLD: [docs/system-design-lld.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/system-design-lld.md)
- Home AI logic: [docs/ai-logic-home-timetable.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/ai-logic-home-timetable.md)
- Myspace AI logic: [docs/ai-logic-myspace.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/ai-logic-myspace.md)
- Contribution workflow: [CONTRIBUTING.md](/Users/sahilkumarsingh/Desktop/SENTRI/CONTRIBUTING.md)

Recent performance-focused work includes:

- on-demand tab mounting in the mobile shell
- shared persisted state utilities with cached storage reads
- deferred Myspace search filtering
- shared mobile HTTP client with request timeouts
- backend indexes, cacheable read paths, and read-only transactions

## Run Locally

### Frontend

```bash
cd app
npm start
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

### OCR worker tests

```bash
cd ml-worker
python3 -m unittest discover -s tests
```

## Notes

- The OCR worker now emits a payload shape that the Spring Boot backend can consume.
- The frontend is currently a polished shell for the main tabs and shared design system.
- The home flow now reflects the AIT reality that a fresh timetable arrives every Saturday for the next week.
- Timetable screenshot upload and full backend-worker wiring is the next backend integration step.
