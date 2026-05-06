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

    def validate_string(self, value, field_name: str, max_length: int = 255) -> bool:
        """Validates a string field."""
        if not isinstance(value, str):
            if self.strict_mode:
                raise TypeError(f"Expected string for {field_name}")
            return False
        if len(value) > max_length:
            if self.strict_mode:
                raise ValueError(f"{field_name} exceeds max length {max_length}")
            return False
        return True

    def validate_payload(self, payload: dict, schema: dict) -> bool:
        """Validates a dictionary payload against a schema."""
        for field, rules in schema.items():
            if field not in payload and rules.get('required', False):
                if self.strict_mode:
                    raise KeyError(f"Missing required field: {field}")
                return False
            
            if field in payload:
                val = payload[field]
                v_type = rules.get('type')
                if v_type == 'numeric':
                    self.validate_numeric(val, field)
                elif v_type == 'string':
                    self.validate_string(val, field)
        return True
