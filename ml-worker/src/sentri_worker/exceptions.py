"""Custom exceptions for Sentri Worker."""

from __future__ import annotations


class SentriWorkerError(Exception):
    """Base exception for all Sentri Worker errors."""

    pass


class OCRError(SentriWorkerError):
    """Raised when OCR processing fails."""

    pass


class ParsingError(SentriWorkerError):
    """Raised when timetable parsing fails."""

    pass


class ValidationError(SentriWorkerError):
    """Raised when input validation fails."""

    def __init__(self, field: str, message: str) -> None:
        self.field = field
        self.message = message
        super().__init__(f"Validation error for '{field}': {message}")


class ConfigurationError(SentriWorkerError):
    """Raised when configuration is invalid."""

    pass


class ImageProcessingError(OCRError):
    """Raised when image processing fails."""

    pass


class TesseractNotFoundError(OCRError):
    """Raised when Tesseract is not installed or not found."""

    pass


class InvalidPayloadError(ValidationError):
    """Raised when the input payload is invalid."""

    def __init__(self, message: str) -> None:
        super().__init__("payload", message)


class CellParsingError(ParsingError):
    """Raised when cell parsing fails."""

    pass


class MetadataExtractionError(ParsingError):
    """Raised when metadata extraction fails."""

    pass
