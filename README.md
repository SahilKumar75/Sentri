# Sentri

Sentri is a zero-budget cross-platform student companion for Army Institute of Technology.

[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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
- Code of conduct: [CODE_OF_CONDUCT.md](/Users/sahilkumarsingh/Desktop/SENTRI/CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](/Users/sahilkumarsingh/Desktop/SENTRI/SECURITY.md)
- Support policy: [SUPPORT.md](/Users/sahilkumarsingh/Desktop/SENTRI/SUPPORT.md)

### Performance Optimizations

- on-demand tab mounting in the mobile shell
- shared persisted state utilities with cached storage reads
- deferred Myspace search filtering
- shared mobile HTTP client with request timeouts
- backend indexes, cacheable read paths, and read-only transactions

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 16+ (for the Expo frontend)
- Java 17+ (for the Spring Boot backend)
- Python 3.11+ (for the ML worker)
- Android Studio or Xcode (for mobile emulation)

### Setup Steps

1. **Frontend (Expo App)**
   ```bash
   cd app
   npm install
   npm start
   ```
   This will start the Expo development server. You can then open the app in an emulator or on a physical device.

2. **Backend (Spring Boot)**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`. You can verify it's running by visiting `http://localhost:8080/actuator/health`.

3. **ML Worker (Python)**
   ```bash
   cd ml-worker
   python -m pip install -e ".[dev]"
   python worker.py
   ```
   The worker will start processing tasks from the backend queue.

### Verification

- Frontend: Open `http://localhost:19002` to see the Expo DevTools
- Backend: Visit `http://localhost:8080/actuator/health` to confirm the backend is healthy
- ML Worker: Check the terminal where you started the worker for processing logs

## Notes

- The OCR worker now emits a payload shape that the Spring Boot backend can consume.
- The frontend is currently a polished shell for the main tabs and shared design system.
- The home flow now reflects the AIT reality that a fresh timetable arrives every Saturday for the next week.
- The Home upload action now opens the native image picker and creates a real timetable upload batch through Spring Boot.
- Full parser wiring still needs the backend worker step that turns the stored screenshot into parsed timetable entries.
