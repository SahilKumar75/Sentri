"""Tests for validation utilities."""

import pytest

from sentri_worker.lib.validation import (
    ValidationError,
    validate_confidence,
    validate_dict_keys,
    validate_list_items,
    validate_non_empty,
    validate_range,
    validate_required,
    validate_type,
)


class TestValidateRequired:
    """Test validate_required function."""

    def test_valid_value(self):
        """Test with valid value."""
        validate_required("test", "field")  # Should not raise

    def test_none_value(self):
        """Test with None value."""
        with pytest.raises(ValidationError) as exc_info:
            validate_required(None, "field")
        assert "required" in str(exc_info.value).lower()


class TestValidateType:
    """Test validate_type function."""

    def test_correct_type(self):
        """Test with correct type."""
        result = validate_type("test", str, "field")
        assert result == "test"

    def test_incorrect_type(self):
        """Test with incorrect type."""
        with pytest.raises(ValidationError) as exc_info:
            validate_type(123, str, "field")
        assert "Expected type str" in str(exc_info.value)


class TestValidateRange:
    """Test validate_range function."""

    def test_value_in_range(self):
        """Test value within range."""
        validate_range(5, 0, 10, "field")  # Should not raise

    def test_value_below_range(self):
        """Test value below range."""
        with pytest.raises(ValidationError):
            validate_range(-1, 0, 10, "field")

    def test_value_above_range(self):
        """Test value above range."""
        with pytest.raises(ValidationError):
            validate_range(11, 0, 10, "field")

    def test_bool_value(self):
        """Test bool is not accepted as numeric input."""
        with pytest.raises(ValidationError):
            validate_range(True, 0, 10, "field")  # type: ignore[arg-type]


class TestValidateNonEmpty:
    """Test validate_non_empty function."""

    def test_non_empty_string(self):
        """Test with non-empty string."""
        validate_non_empty("test", "field")  # Should not raise

    def test_empty_string(self):
        """Test with empty string."""
        with pytest.raises(ValidationError):
            validate_non_empty("", "field")

    def test_whitespace_string(self):
        """Test with whitespace-only string."""
        with pytest.raises(ValidationError):
            validate_non_empty("   ", "field")


class TestValidateListItems:
    """Test validate_list_items function."""

    def test_valid_list(self):
        """Test with valid list."""
        result = validate_list_items([1, 2, 3], int, "field")
        assert result == [1, 2, 3]

    def test_invalid_item_type(self):
        """Test with invalid item type."""
        with pytest.raises(ValidationError):
            validate_list_items([1, "2", 3], int, "field")

    def test_min_length(self):
        """Test minimum length validation."""
        with pytest.raises(ValidationError):
            validate_list_items([1], int, "field", min_length=2)

    def test_max_length(self):
        """Test maximum length validation."""
        with pytest.raises(ValidationError):
            validate_list_items([1, 2, 3], int, "field", max_length=2)


class TestValidateDictKeys:
    """Test validate_dict_keys function."""

    def test_all_keys_present(self):
        """Test with all required keys present."""
        data = {"key1": "value1", "key2": "value2"}
        validate_dict_keys(data, {"key1", "key2"}, "field")  # Should not raise

    def test_missing_keys(self):
        """Test with missing keys."""
        data = {"key1": "value1"}
        with pytest.raises(ValidationError) as exc_info:
            validate_dict_keys(data, {"key1", "key2"}, "field")
        assert "key2" in str(exc_info.value)


class TestValidateConfidence:
    """Test validate_confidence function."""

    def test_valid_confidence(self):
        """Test with valid confidence value."""
        result = validate_confidence(0.75)
        assert result == 0.75

    def test_none_confidence(self):
        """Test with None confidence."""
        result = validate_confidence(None)
        assert result is None

    def test_confidence_below_zero(self):
        """Test with confidence below 0."""
        with pytest.raises(ValidationError):
            validate_confidence(-0.1)

    def test_confidence_above_one(self):
        """Test with confidence above 1."""
        with pytest.raises(ValidationError):
            validate_confidence(1.5)

    def test_invalid_type(self):
        """Test with invalid type."""
        with pytest.raises(ValidationError):
            validate_confidence("0.5")  # type: ignore

    def test_bool_confidence(self):
        """Test bool is not accepted as confidence input."""
        with pytest.raises(ValidationError):
            validate_confidence(True)  # type: ignore[arg-type]
