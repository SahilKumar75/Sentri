# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-30

### Added
- Comprehensive dependency management with requirements.txt and requirements-dev.txt
- Modern Python tooling configuration (black, ruff, isort, mypy)
- Pre-commit hooks for automated code quality checks
- GitHub Actions CI/CD workflow for multi-platform testing
- Structured logging with JSON format support
- Performance monitoring and profiling utilities
- Advanced LRU cache with TTL and eviction policies
- Input validation utilities for robust error handling
- Centralized error handling with retry logic
- Configuration management with environment variable support
- Metrics collection and reporting system
- Makefile for common development tasks
- Optimized multi-stage Dockerfile with security best practices
- Docker Compose configuration for easy deployment
- Comprehensive pytest fixtures and test configuration
- Unit tests for metrics and validation modules

### Changed
- Upgraded pyproject.toml with modern Python packaging standards
- Enhanced project metadata and classifiers
- Improved code organization with new lib modules

### Fixed
- N/A

## [0.1.0] - 2026-03-23

### Added
- Initial release
- OCR service with Tesseract integration
- Timetable parser with cell-based and text-based parsing
- Tuning profiles for customization
- Evaluation framework for parser accuracy
- CLI interface for processing timetables
- Basic test suite

[0.2.0]: https://github.com/yourusername/sentri-worker/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/sentri-worker/releases/tag/v0.1.0
