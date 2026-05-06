import logging

logger = logging.getLogger(__name__)

class DataValidator:
    """Validates ML input data and features."""
    def __init__(self, strict_mode: bool = True):
        self.strict_mode = strict_mode
