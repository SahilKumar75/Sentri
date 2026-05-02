"""Tests for custom exceptions."""

import pytest

from sentri_worker.exceptions import (
    CellParsingError,
    ConfigurationError,
    ImageProcessingError,
    InvalidPayloadError,
    MetadataExtractionError,
    OCRError,
    ParsingError,
    SentriWorkerError,
    TesseractNotFoundError,
    ValidationError,
)


def test_base_exception():
    """Test base exception."""
    error = SentriWorkerError("test error")
    assert str(error) == "test error"
    assert isinstance(error, Exception)


def test_ocr_error():
    """Test OCR error."""
    error = OCRError("OCR failed")
    assert str(error) == "OCR failed"
    assert isinstance(error, SentriWorkerError)


def test_parsing_error():
    """Test parsing error."""
    error = ParsingError("Parsing failed")
    assert str(error) == "Parsing failed"
    assert isinstance(error, SentriWorkerError)


def test_validation_error():
    """Test validation error."""
    error = ValidationError("field_name", "must be a string")
    assert error.field == "field_name"
    assert error.message == "must be a string"
    assert "field_name" in str(error)
    assert "must be a string" in str(error)
    assert isinstance(error, SentriWorkerError)


def test_configuration_error():
    """Test configuration error."""
    error = ConfigurationError("Invalid config")
    assert str(error) == "Invalid config"
    assert isinstance(error, SentriWorkerError)


def test_image_processing_error():
    """Test image processing error."""
    error = ImageProcessingError("Cannot open image")
    assert str(error) == "Cannot open image"
    assert isinstance(error, OCRError)
    assert isinstance(error, SentriWorkerError)


def test_tesseract_not_found_error():
    """Test Tesseract not found error."""
    error = TesseractNotFoundError("Tesseract not installed")
    assert str(error) == "Tesseract not installed"
    assert isinstance(error, OCRError)


def test_invalid_payload_error():
    """Test invalid payload error."""
    error = InvalidPayloadError("Missing required field")
    assert error.field == "payload"
    assert error.message == "Missing required field"
    assert isinstance(error, ValidationError)


def test_cell_parsing_error():
    """Test cell parsing error."""
    error = CellParsingError("Invalid cell format")
    assert str(error) == "Invalid cell format"
    assert isinstance(error, ParsingError)


def test_metadata_extraction_error():
    """Test metadata extraction error."""
    error = MetadataExtractionError("Cannot extract metadata")
    assert str(error) == "Cannot extract metadata"
    assert isinstance(error, ParsingError)


def test_exception_hierarchy():
    """Test exception hierarchy."""
    # All custom exceptions should inherit from SentriWorkerError
    exceptions = [
        OCRError,
        ParsingError,
        ValidationError,
        ConfigurationError,
        ImageProcessingError,
        TesseractNotFoundError,
        InvalidPayloadError,
        CellParsingError,
        MetadataExtractionError,
    ]

    for exc_class in exceptions:
        assert issubclass(exc_class, SentriWorkerError)
        assert issubclass(exc_class, Exception)


def test_exception_catching():
    """Test that exceptions can be caught properly."""
    # Specific exception
    with pytest.raises(OCRError):
        raise OCRError("test")

    # Base exception
    with pytest.raises(SentriWorkerError):
        raise OCRError("test")

    # Generic exception
    with pytest.raises(Exception):
        raise OCRError("test")
