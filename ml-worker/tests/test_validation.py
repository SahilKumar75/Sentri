"""Tests for validation utilities."""

from __future__ import annotations

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
    """Tests for validate_required function."""

    def test_valid_value(self):
        """Test that valid values pass validation."""
        validate_required("test", "field")
        validate_required(0, "field")
        validate_required(False, "field")
        validate_required([], "field")

    def test_none_value_raises(self):
        """Test that None raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_required(None, "test_field")
        assert exc_info.value.field == "test_field"
        assert "required" in exc_info.value.message.lower()


class TestValidateType:
    """Tests for validate_type function."""

    def test_correct_type(self):
        """Test that correct types pass validation."""
        assert validate_type("test", str, "field") == "test"
        assert validate_type(42, int, "field") == 42
        assert validate_type([1, 2], list, "field") == [1, 2]

    def test_incorrect_type_raises(self):
        """Test that incorrect types raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_type("test", int, "test_field")
        assert exc_info.value.field == "test_field"
        assert "Expected type int" in exc_info.value.message


class TestValidateRange:
    """Tests for validate_range function."""

    def test_value_in_range(self):
        """Test that values in range pass validation."""
        validate_range(5, 0, 10, "field")
        validate_range(0, 0, 10, "field")
        validate_range(10, 0, 10, "field")
        validate_range(5.5, 0.0, 10.0, "field")

    def test_value_below_range_raises(self):
        """Test that values below range raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_range(-1, 0, 10, "test_field")
        assert exc_info.value.field == "test_field"
        assert "between 0 and 10" in exc_info.value.message

    def test_value_above_range_raises(self):
        """Test that values above range raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_range(11, 0, 10, "test_field")
        assert exc_info.value.field == "test_field"
        assert "between 0 and 10" in exc_info.value.message


class TestValidateNonEmpty:
    """Tests for validate_non_empty function."""

    def test_non_empty_string(self):
        """Test that non-empty strings pass validation."""
        validate_non_empty("test", "field")
        validate_non_empty("  test  ", "field")

    def test_empty_string_raises(self):
        """Test that empty strings raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_non_empty("", "test_field")
        assert exc_info.value.field == "test_field"
        assert "cannot be empty" in exc_info.value.message.lower()

    def test_whitespace_only_raises(self):
        """Test that whitespace-only strings raise ValidationError."""
        with pytest.raises(ValidationError):
            validate_non_empty("   ", "test_field")


class TestValidateListItems:
    """Tests for validate_list_items function."""

    def test_valid_list(self):
        """Test that valid lists pass validation."""
        result = validate_list_items([1, 2, 3], int, "field")
        assert result == [1, 2, 3]

        result = validate_list_items(["a", "b"], str, "field")
        assert result == ["a", "b"]

    def test_not_a_list_raises(self):
        """Test that non-lists raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_list_items("not a list", str, "test_field")
        assert exc_info.value.field == "test_field"
        assert "Expected list" in exc_info.value.message

    def test_wrong_item_type_raises(self):
        """Test that wrong item types raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_list_items([1, "two", 3], int, "test_field")
        assert "test_field[1]" in exc_info.value.field
        assert "Expected type int" in exc_info.value.message

    def test_min_length_validation(self):
        """Test minimum length validation."""
        validate_list_items([1, 2, 3], int, "field", min_length=2)

        with pytest.raises(ValidationError) as exc_info:
            validate_list_items([1], int, "test_field", min_length=2)
        assert "at least 2 items" in exc_info.value.message

    def test_max_length_validation(self):
        """Test maximum length validation."""
        validate_list_items([1, 2], int, "field", max_length=3)

        with pytest.raises(ValidationError) as exc_info:
            validate_list_items([1, 2, 3, 4], int, "test_field", max_length=3)
        assert "at most 3 items" in exc_info.value.message


class TestValidateDictKeys:
    """Tests for validate_dict_keys function."""

    def test_all_keys_present(self):
        """Test that dicts with all required keys pass validation."""
        data = {"key1": "value1", "key2": "value2", "key3": "value3"}
        validate_dict_keys(data, {"key1", "key2"}, "field")

    def test_not_a_dict_raises(self):
        """Test that non-dicts raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_dict_keys("not a dict", {"key1"}, "test_field")
        assert exc_info.value.field == "test_field"
        assert "Expected dict" in exc_info.value.message

    def test_missing_keys_raises(self):
        """Test that missing keys raise ValidationError."""
        data = {"key1": "value1"}
        with pytest.raises(ValidationError) as exc_info:
            validate_dict_keys(data, {"key1", "key2", "key3"}, "test_field")
        assert exc_info.value.field == "test_field"
        assert "Missing required keys" in exc_info.value.message
        assert "key2" in exc_info.value.message
        assert "key3" in exc_info.value.message


class TestValidateConfidence:
    """Tests for validate_confidence function."""

    def test_valid_confidence_values(self):
        """Test that valid confidence values pass validation."""
        assert validate_confidence(0.0) == 0.0
        assert validate_confidence(0.5) == 0.5
        assert validate_confidence(1.0) == 1.0
        assert validate_confidence(None) is None

    def test_confidence_below_zero_raises(self):
        """Test that confidence below 0 raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_confidence(-0.1)
        assert "between 0.0 and 1.0" in exc_info.value.message

    def test_confidence_above_one_raises(self):
        """Test that confidence above 1 raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_confidence(1.1)
        assert "between 0.0 and 1.0" in exc_info.value.message

    def test_non_numeric_confidence_raises(self):
        """Test that non-numeric confidence raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_confidence("not a number")
        assert "Expected numeric value" in exc_info.value.message

    def test_integer_confidence_converted_to_float(self):
        """Test that integer confidence is converted to float."""
        result = validate_confidence(1)
        assert result == 1.0
        assert isinstance(result, float)
