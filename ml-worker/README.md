# Sentri OCR Worker

[![ML Worker](https://github.com/SahilKumar75/sentri/actions/workflows/ml-worker.yml/badge.svg)](https://github.com/SahilKumar75/sentri/actions/workflows/ml-worker.yml)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Zero-budget OCR and timetable parsing worker for Sentri. Designed to sit behind the Spring Boot backend and turn timetable screenshots into stable JSON that the Java service can store and serve.

## Features

- OCR processing with Tesseract when the binary is available
- Deterministic parsing from raw OCR text and cell-like table input
- Fuzzy matching for common timetable OCR errors
- Tuning profiles for subject, faculty, and parser behavior
- Metrics and fixture evaluation for parser quality checks
- Docker support for repeatable local runs
- Pytest coverage for parser, worker, cache, validation, and utility code

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sentri.git
cd sentri/ml-worker

# Install with pip
pip install -e .

# Or install with development dependencies
pip install -e ".[dev]"
```

### Basic Usage

```bash
# Process a timetable image
sentri-worker --image path/to/timetable.png

# Process with JSON input
sentri-worker --input request.json

# Process with raw OCR text
sentri-worker --text "Class: SE IT-B\nMON 08:45-10:45 DBMS"
```

### Docker Usage

```bash
# Build and run with Docker Compose
docker-compose up sentri-worker

# Or build manually
docker build -t sentri-worker .
docker run -v $(pwd)/data:/app/data sentri-worker --image /app/data/timetable.png
```

## Responsibilities

- Accept screenshot metadata, OCR text, or cell-like table data
- Extract timetable headers from raw OCR text
- Normalize timetable rows into structured entries
- Keep OCR optional so the worker still runs when Tesseract is not installed

## JSON Contract

The worker returns a backend-ready payload for the Spring Boot import endpoint:

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
    "sourceHint": "ocr-worker"
  },
  "rawOcrText": "Class: SE IT-B\nAcademic Year - 2025-26 - SEM II",
  "extractionConfidence": 0.85,
  "entries": [
    {
      "dayOfWeek": "MON",
      "startTime": "08:45:00",
      "endTime": "10:45:00",
      "subjectName": "DBMS",
      "facultyCode": "MA",
      "locationLabel": "Lab-III",
      "entryType": "LAB",
      "noteText": "Assignment No.7",
      "sortOrder": 1,
      "breakEntry": false,
      "holidayEntry": false
    }
  ]
}
```

## Development

### Setup Development Environment

```bash
# Install development dependencies
make install-dev

# Install pre-commit hooks
pre-commit install
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
make test-cov

# Run specific test
pytest tests/test_parser.py -v

# Run without OCR tests (if Tesseract is missing)
pytest -m "not ocr"
```

GitHub Actions runs `pytest` on Python 3.11 and 3.12 whenever a pull request changes worker files.

### Code Quality

```bash
# Format code
make format

# Run linters
make lint

# Run type checker
make type-check

# Run all quality checks
make quality
```

### Benchmarking

```bash
# Run performance benchmarks
python scripts/benchmark.py --payload tests/fixtures/sample.json --iterations 100

# Validate test fixtures
python scripts/validate_fixtures.py tests/fixtures/
```

## Configuration

### Tuning Profiles

Customize parsing behavior with tuning profiles. This is particularly useful for normalizing OCR errors (like "DBM5" to "DBMS") and mapping raw text to canonical faculty codes and locations.

Create a `tuning.json` file:

```json
{
  "tuning": {
    "subject_vocabulary": ["DBMS", "PROJECT MANAGEMENT", "COMPUTER NETWORKS"],
    "subject_aliases": {
      "DBM5": "DBMS",
      "PROJ MGMT": "PROJECT MANAGEMENT",
      "C0MP NETW0RKS": "COMPUTER NETWORKS"
    },
    "faculty_aliases": {
      "M A": "MA",
      "5M": "SM"
    },
    "location_aliases": {
      "Lab-lI!": "Lab-III"
    },
    "min_match_score": 0.83
  }
}
```

Run the worker with the tuning file:

```bash
sentri-worker --image path/to/timetable.png --tuning tuning.json
```

To test tuning changes during development, you can run evaluate tests:

```bash
pytest tests/test_tuning_evaluate.py
```

### OCR Options

```json
{
  "ocr_options": {
    "language": "eng",
    "psm_candidates": [6, 11, 4]
  }
}
```

### Quality Options

```json
{
  "quality_options": {
    "min_extraction_confidence": 0.75
  }
}
```

When `extractionConfidence` is below `min_extraction_confidence`, the worker still returns parsed entries and adds a `low_confidence` issue to `metadata.sourceNotes`.

## Architecture

```
┌─────────────────┐
│  Input Image    │
│  or OCR Text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OCR Service    │
│  (Tesseract)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parser         │
│  (Deterministic)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JSON Output    │
│  (Backend Ready)│
└─────────────────┘
```

## Performance

- **OCR Processing**: ~2-5 seconds per image
- **Parsing**: <100ms for typical timetables
- **Memory Usage**: <100MB typical, <500MB peak

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tesseract OCR for text extraction
- Python community for excellent tooling
- Contributors and maintainers

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/sentri/issues)
- 💬 [Discussions](https://github.com/yourusername/sentri/discussions)

## Troubleshooting

### OCR Setup Issues

**Tesseract is missing:**
The ML worker is designed to run even if Tesseract is not installed on your system. If Tesseract is missing:
- You cannot process raw images (`--image`).
- You can still process JSON payloads containing `ocr_text` (`--input`).
- You can still process raw text strings directly (`--text`).

**pytest fails on OCR tests:**
If you run `pytest` without Tesseract installed, some tests in `test_ocr.py` will fail. You can skip them by running:
```bash
pytest -m "not ocr"
```

### Python Environment Issues

- Ensure you are using Python 3.11+.
- If modules are not found, make sure you ran `pip install -e .` from the `ml-worker` directory.
- For linting/formatting issues, run `make install-dev` to ensure all development dependencies are present.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
