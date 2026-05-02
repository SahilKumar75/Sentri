# Contributing to Sentri Worker

Thank you for your interest in contributing to Sentri Worker! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Git
- Tesseract OCR (optional, for OCR functionality)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentri.git
   cd sentri/ml-worker
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install development dependencies**
   ```bash
   make install-dev
   # or
   pip install -e ".[dev]"
   ```

4. **Install pre-commit hooks**
   ```bash
   pre-commit install
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest tests/test_parser.py

# Run with verbose output
make test-verbose
```

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

### Running the Worker

```bash
# Process a timetable image
python -m sentri_worker --image path/to/timetable.png

# Process with JSON input
python -m sentri_worker --input request.json

# Run evaluation
make evaluate
```

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/changes

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(parser): add support for 12-hour time format
fix(ocr): handle missing Tesseract gracefully
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass
   - Run code quality checks

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

## Code Style

We use automated tools to maintain code quality:

- **Black** for code formatting (line length: 120)
- **isort** for import sorting
- **Ruff** for linting
- **mypy** for type checking

Run `make format` before committing to ensure compliance.

## Testing Guidelines

### Writing Tests

- Place tests in the `tests/` directory
- Name test files `test_*.py`
- Use descriptive test function names
- Use fixtures from `conftest.py`
- Aim for high test coverage

### Test Structure

```python
def test_feature_description():
    """Test that feature works as expected."""
    # Arrange
    input_data = create_test_data()
    
    # Act
    result = function_under_test(input_data)
    
    # Assert
    assert result == expected_output
```

### Test Markers

```python
@pytest.mark.unit
def test_unit_test():
    pass

@pytest.mark.integration
def test_integration_test():
    pass

@pytest.mark.slow
def test_slow_test():
    pass
```

## Documentation

- Add docstrings to all public functions and classes
- Use Google-style docstrings
- Update README.md for user-facing changes
- Update CHANGELOG.md for all changes

### Docstring Example

```python
def parse_timetable(raw_text: str, cells: list[OCRCell] | None = None) -> ParseResult:
    """Parse timetable from text or cells.

    Args:
        raw_text: Raw OCR text from timetable
        cells: Optional list of OCR cells with structure

    Returns:
        ParseResult containing extracted entries and metadata

    Raises:
        ParsingError: If parsing fails
    """
    pass
```

## Performance Considerations

- Use caching for expensive operations
- Profile code for performance bottlenecks
- Avoid unnecessary allocations
- Use generators for large datasets

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
