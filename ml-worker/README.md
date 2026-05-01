# Sentri OCR Worker

[![CI](https://github.com/yourusername/sentri/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/sentri/actions/workflows/ci.yml)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

This package is the zero-budget OCR and timetable parsing worker for Sentri.

It is designed to sit behind the Spring Boot backend and turn timetable screenshots into stable JSON that the Java service can store and serve.

## Features

- 🔍 **OCR Integration**: Tesseract-based text extraction with multiple preprocessing strategies
- 📊 **Smart Parsing**: Cell-based and text-based timetable parsing with fallback mechanisms
- ⚡ **Performance**: Advanced caching with LRU and TTL, performance monitoring
- 🛡️ **Robust**: Comprehensive error handling, retry logic, and validation
- 🔧 **Configurable**: Environment-based configuration, tuning profiles
- 📈 **Observable**: Structured logging, metrics collection, profiling tools
- 🧪 **Well-tested**: Comprehensive test suite with pytest
- 🐳 **Docker Ready**: Multi-stage Dockerfile with security best practices

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/sentri.git
cd sentri/ml-worker

# Install with development dependencies
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install
```

### Using Docker

```bash
# Build the image
docker build -t sentri-worker .

# Run with docker-compose
docker-compose up sentri-worker
```

## Quick Start

### Basic Usage

```bash
# Process from JSON input
sentri-worker --input sample.json

# Process from image (requires Tesseract)
sentri-worker --image /path/to/timetable.png

# Process from text
sentri-worker --text "MON 08:45-10:45 DBMS"

# Save output to file
sentri-worker --input sample.json --output result.json
```

### Python API

```python
from sentri_worker.pipeline import SentriWorker

worker = SentriWorker()
payload = {
    "ocr_text": "Class: SE IT-B\nMON 08:45-10:45 DBMS",
    "source_name": "timetable.png"
}
result = worker.process(payload)
print(result)
```

## Configuration

Configuration can be set via environment variables. See `.env.example` for all options:

```bash
# Copy example configuration
cp .env.example .env

# Edit configuration
vim .env
```

Key configuration options:
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `OCR_ENABLED`: Enable/disable OCR processing
- `CACHE_ENABLED`: Enable/disable caching
- `MAX_WORKERS`: Number of worker threads

## Development

### Setup Development Environment

```bash
# Install development dependencies
make install-dev

# Run tests
make test

# Run tests with coverage
make test-cov

# Run linters
make lint

# Format code
make format

# Run type checker
make type-check

# Run all quality checks
make quality
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test file
pytest tests/test_parser.py

# Run with markers
pytest -m unit
pytest -m "not slow"
```

### Benchmarking

```bash
# Run performance benchmarks
python scripts/benchmark.py --text "MON 08:45-10:45 DBMS" --iterations 100

# Profile memory usage
python scripts/profile_memory.py --input sample.json
```

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
      "sortOrder": 1
    }
  ]
}
```

## Architecture

```
ml-worker/
├── src/sentri_worker/
│   ├── lib/              # Utility modules
│   │   ├── cache_manager.py
│   │   ├── config.py
│   │   ├── error_handler.py
│   │   ├── logging_config.py
│   │   ├── lru_cache.py
│   │   ├── metrics.py
│   │   ├── performance.py
│   │   └── validation.py
│   ├── cli.py            # Command-line interface
│   ├── evaluate.py       # Evaluation framework
│   ├── models.py         # Data models
│   ├── ocr.py           # OCR service
│   ├── parser.py        # Timetable parser
│   ├── pipeline.py      # Main processing pipeline
│   └── tuning.py        # Tuning profiles
├── tests/               # Test suite
├── scripts/             # Utility scripts
└── pyproject.toml       # Project configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`make quality`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## License

This project is part of the Sentri application suite.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for usage examples
