import logging

logger = logging.getLogger(__name__)

class DataValidator:
    """Validates ML input data and features."""
    def __init__(self, strict_mode: bool = True):
        self.strict_mode = strict_mode

    def validate_numeric(self, value, field_name: str) -> bool:
        """Validates that a value is numeric."""
        if not isinstance(value, (int, float)):
            logger.warning(f"Field {field_name} is not numeric: {type(value)}")
            if self.strict_mode:
                raise ValueError(f"Expected numeric for {field_name}")
            return False
        return True

    def validate_range(self, value, min_val, max_val, field_name: str) -> bool:
        """Validates that a numeric value is within a specified range."""
        if not self.validate_numeric(value, field_name):
            return False
        if value < min_val or value > max_val:
            logger.warning(f"Field {field_name} out of bounds: {value} not in [{min_val}, {max_val}]")
            if self.strict_mode:
                raise ValueError(f"{field_name} out of bounds")
            return False
        return True
