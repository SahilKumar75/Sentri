"""Input validation utilities for robust error handling."""

from __future__ import annotations

from typing import Any, TypeVar

T = TypeVar("T")


class ValidationError(ValueError):
    """Raised when input validation fails."""

    def __init__(self, field: str, message: str) -> None:
        self.field = field
        self.message = message
        super().__init__(f"Validation error for '{field}': {message}")


def validate_required(value: Any, field_name: str) -> None:
    """Validate that a required field is present and not None.

    Args:
        value: Value to validate
        field_name: Name of the field for error messages

    Raises:
        ValidationError: If value is None
    """
    if value is None:
        raise ValidationError(field_name, "Field is required")


def validate_type(value: Any, expected_type: type[T], field_name: str) -> T:
    """Validate that a value is of the expected type.

    Args:
        value: Value to validate
        expected_type: Expected type
        field_name: Name of the field for error messages

    Returns:
        The value cast to the expected type

    Raises:
        ValidationError: If value is not of expected type
    """
    if not isinstance(value, expected_type):
        raise ValidationError(
            field_name,
            f"Expected type {expected_type.__name__}, got {type(value).__name__}",
        )
    return value


def validate_range(value: float | int, min_val: float | int, max_val: float | int, field_name: str) -> None:
    """Validate that a numeric value is within a range.

    Args:
        value: Value to validate
        min_val: Minimum allowed value (inclusive)
        max_val: Maximum allowed value (inclusive)
        field_name: Name of the field for error messages

    Raises:
        ValidationError: If value is outside the range
    """
    if not (min_val <= value <= max_val):
        raise ValidationError(field_name, f"Value must be between {min_val} and {max_val}, got {value}")


def validate_non_empty(value: str, field_name: str) -> None:
    """Validate that a string is not empty.

    Args:
        value: String to validate
        field_name: Name of the field for error messages

    Raises:
        ValidationError: If string is empty or only whitespace
    """
    if not value or not value.strip():
        raise ValidationError(field_name, "String cannot be empty")


def validate_list_items(
    items: list[Any],
    item_type: type[T],
    field_name: str,
    min_length: int | None = None,
    max_length: int | None = None,
) -> list[T]:
    """Validate a list and its items.

    Args:
        items: List to validate
        item_type: Expected type of list items
        field_name: Name of the field for error messages
        min_length: Minimum list length (optional)
        max_length: Maximum list length (optional)

    Returns:
        The validated list

    Raises:
        ValidationError: If validation fails
    """
    if not isinstance(items, list):
        raise ValidationError(field_name, f"Expected list, got {type(items).__name__}")

    if min_length is not None and len(items) < min_length:
        raise ValidationError(field_name, f"List must have at least {min_length} items, got {len(items)}")

    if max_length is not None and len(items) > max_length:
        raise ValidationError(field_name, f"List must have at most {max_length} items, got {len(items)}")

    for i, item in enumerate(items):
        if not isinstance(item, item_type):
            raise ValidationError(
                f"{field_name}[{i}]",
                f"Expected type {item_type.__name__}, got {type(item).__name__}",
            )

    return items


def validate_dict_keys(value: dict[str, Any], required_keys: set[str], field_name: str) -> None:
    """Validate that a dictionary contains required keys.

    Args:
        value: Dictionary to validate
        required_keys: Set of required key names
        field_name: Name of the field for error messages

    Raises:
        ValidationError: If required keys are missing
    """
    if not isinstance(value, dict):
        raise ValidationError(field_name, f"Expected dict, got {type(value).__name__}")

    missing_keys = required_keys - set(value.keys())
    if missing_keys:
        raise ValidationError(field_name, f"Missing required keys: {', '.join(sorted(missing_keys))}")


def validate_confidence(value: float | None, field_name: str = "confidence") -> float | None:
    """Validate a confidence score (0.0 to 1.0).

    Args:
        value: Confidence value to validate
        field_name: Name of the field for error messages

    Returns:
        The validated confidence value or None

    Raises:
        ValidationError: If confidence is outside valid range
    """
    if value is None:
        return None

    if not isinstance(value, (int, float)):
        raise ValidationError(field_name, f"Expected numeric value, got {type(value).__name__}")

    if not (0.0 <= value <= 1.0):
        raise ValidationError(field_name, f"Confidence must be between 0.0 and 1.0, got {value}")

    return float(value)
