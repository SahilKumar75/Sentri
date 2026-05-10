# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Pipeline preprocessing for malformed option payloads.
- Low-confidence issue reporting through `quality_options.min_extraction_confidence`.
- Fixture regression tests for backend-ready worker output.
- Operation-level metrics compatibility for existing metrics tests.

## [0.2.0] - 2026-04-30

### Added
- Comprehensive dependency management with requirements.txt and requirements-dev.txt
- Modern Python tooling configuration (black, ruff, isort, mypy, pytest)
- Pre-commit hooks for automated code quality checks
- GitHub Actions CI/CD workflow for multi-platform testing
- Structured logging configuration with JSON support
- Performance monitoring and profiling utilities
- Input validation utilities for robust error handling
- Advanced LRU cache manager with TTL support
- Makefile for common development tasks
- Optimized multi-stage Dockerfile with security best practices
- Docker Compose configuration for easy deployment
- Comprehensive pytest fixtures and test configuration
- Metrics collection system for OCR and parsing operations
- Custom exception hierarchy for better error handling
- Exception test suite

### Changed
- Upgraded pyproject.toml with modern Python packaging standards
- Improved project structure and organization
- Enhanced documentation

### Fixed
- Various code quality improvements
- Better error handling throughout the codebase

## [0.1.0] - 2026-03-23

### Added
- Initial release
- OCR functionality with Tesseract integration
- Timetable parsing from text and cells
- Metadata extraction from timetable images
- CLI interface for processing timetables
- Evaluation framework for parser accuracy
- Tuning profiles for customization
- Basic test suite

### Features
- Zero-budget OCR with optional Tesseract
- Deterministic parsing logic
- Spring Boot backend integration
- Support for multiple timetable formats
- Confidence scoring for OCR results
- Issue tracking and reporting
