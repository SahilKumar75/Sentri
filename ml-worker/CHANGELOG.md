# Changelog

All notable changes to the Sentri ML Worker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-30

### Added
- Comprehensive dependency management with requirements.txt and requirements-dev.txt
- Modern Python tooling configuration (black, ruff, isort, mypy)
- Pre-commit hooks for automated code quality checks
- GitHub Actions CI/CD workflow for multi-platform testing
- Structured logging module with JSON format support
- Performance monitoring and profiling utilities
- Advanced LRU cache manager with TTL support
- Input validation utilities for robust error handling
- Makefile for common development tasks
- Multi-stage Dockerfile with security best practices
- Docker Compose configuration for easy deployment
- Comprehensive pytest fixtures and test configuration

### Changed
- Upgraded pyproject.toml with modern tool configurations
- Enhanced project metadata and classifiers
- Improved code organization and structure

### Fixed
- Various code quality improvements
- Better error handling throughout the codebase

## [0.1.0] - 2026-03-01

### Added
- Initial release of Sentri OCR Worker
- OCR text extraction with Tesseract support
- Timetable parsing from OCR text and cell data
- Support for multiple timetable formats
- Tuning profiles for customization
- Evaluation framework for parser accuracy
- CLI interface for processing timetables
- Basic test suite

### Features
- Zero-budget OCR processing
- Deterministic parsing logic
- Optional Tesseract integration
- JSON contract for backend integration
- Cell-based and text-based parsing modes
- Metadata extraction from timetable images
- Faculty code and location detection
- Entry type classification (lecture, lab, tutorial, break)

[0.2.0]: https://github.com/SahilKumar75/sentri/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/SahilKumar75/sentri/releases/tag/v0.1.0
