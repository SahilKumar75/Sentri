# Sentri

Sentri is a zero-budget cross-platform student companion for Army Institute of Technology.

[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

This repository is currently split into 3 working parts:

- `app/`: Expo React Native frontend for iPhone and Android
- `backend/`: Spring Boot API and timetable storage layer
- `ml-worker/`: Python OCR and timetable normalization worker

## Product Scope

### Current Focus

- timetable import from screenshots
- weekly Saturday prompt to refresh the next timetable
- clean home dashboard for now/next/today
- Myspace vault for saved screenshots, notes, and links
- calorie tracking shell
- hangout shell

## Why This Structure

### Design Philosophy

The app should stay simple and cheap to run:

- Expo keeps one mobile codebase for both platforms
- Spring Boot handles the main API and persistence
- Python is used only where it helps most: OCR and deterministic parsing

## Architecture

### Documentation

- HLD: [docs/system-design-hld.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/system-design-hld.md)
- LLD: [docs/system-design-lld.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/system-design-lld.md)
- Home AI logic: [docs/ai-logic-home-timetable.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/ai-logic-home-timetable.md)
- Myspace AI logic: [docs/ai-logic-myspace.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/ai-logic-myspace.md)
- Myspace indexing pipeline: [docs/myspace-indexing-pipeline.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/myspace-indexing-pipeline.md)
- Contribution workflow: [CONTRIBUTING.md](/Users/sahilkumarsingh/Desktop/SENTRI/CONTRIBUTING.md)

### Performance Optimizations

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
- The Home upload action now opens the native image picker and creates a real timetable upload batch through Spring Boot.
- Full parser wiring still needs the backend worker step that turns the stored screenshot into parsed timetable entries.
