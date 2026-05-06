import logging

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collects system and model metrics."""
    def __init__(self, prefix: str = "sentri_ml"):
        self.prefix = prefix
        self.metrics = {}
