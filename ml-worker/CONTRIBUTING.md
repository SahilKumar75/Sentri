# Contributing to Sentri ML Worker

Thank you for your interest in contributing to the Sentri ML Worker! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your changes
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.11 or higher
- Tesseract OCR (optional, for OCR functionality)
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sentri.git
cd sentri/ml-worker

# Install development dependencies
make install-dev

# Or manually:
pip install -e ".[dev]"
pre-commit install
```

### Tesseract Installation

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-parser`
- `fix/ocr-confidence-calculation`
- `docs/update-readme`
- `refactor/improve-caching`

### Commit Messages

Follow conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `test: add tests`
- `refactor: improve code structure`
- `perf: performance improvements`
- `chore: maintenance tasks`

Example:
```
feat: add support for multi-language OCR

- Add language parameter to OCR service
- Update tests for language support
- Document new language options
```

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest tests/test_parser.py

# Run specific test
pytest tests/test_parser.py::TestParser::test_normalize_day
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files `test_*.py`
- Use descriptive test names
- Include docstrings explaining what is being tested
- Use fixtures from `conftest.py`
- Aim for high test coverage (>80%)

Example:
```python
def test_normalize_day_valid_input():
    """Test that valid day names are normalized correctly."""
    assert normalize_day("monday") == "MON"
    assert normalize_day("TUESDAY") == "TUE"
```

## Code Quality

### Formatting and Linting

We use several tools to maintain code quality:

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

### Pre-commit Hooks

Pre-commit hooks run automatically before each commit:
- Black (code formatting)
- isort (import sorting)
- Ruff (linting)
- Mypy (type checking)

To run manually:
```bash
pre-commit run --all-files
```

### Code Style Guidelines

- Follow PEP 8
- Use type hints for function signatures
- Write docstrings for public functions and classes
- Keep functions focused and small
- Use meaningful variable names
- Add comments for complex logic

Example:
```python
def normalize_time_label(value: str) -> str | None:
    """Normalize a time label to HH:MM format.
    
    Args:
        value: Time string to normalize (e.g., "9:30", "945", "9am")
        
    Returns:
        Normalized time in HH:MM format or None if invalid
        
    Examples:
        >>> normalize_time_label("9:30")
        "09:30"
        >>> normalize_time_label("945")
        "09:45"
    """
    # Implementation...
```

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure all tests pass**:
   ```bash
   make ci
   ```

3. **Push to your fork**:
   ```bash
   git push origin your-branch
   ```

4. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what and why
   - Reference any related issues
   - Screenshots/examples if applicable

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Code follows style guidelines
- [ ] Commit messages are clear
- [ ] No merge conflicts

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `pyproject.toml`
2. Update `CHANGELOG.md` with release notes
3. Create and push a version tag:
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git push origin v0.2.0
   ```
4. GitHub Actions will:
   - Build the package
   - Create a GitHub release
   - Publish to PyPI (for stable releases)

## Questions?

If you have questions or need help:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues and PRs

Thank you for contributing! 🎉
