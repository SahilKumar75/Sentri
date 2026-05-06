import logging

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collects system and model metrics."""
    def __init__(self, prefix: str = "sentri_ml"):
        self.prefix = prefix
        self.metrics = {}

    def inc_counter(self, name: str, value: int = 1):
        """Increments a counter metric."""
        full_name = f"{self.prefix}_{name}"
        if full_name not in self.metrics:
            self.metrics[full_name] = 0
        self.metrics[full_name] += value
        logger.debug(f"Counter {full_name} incremented by {value}")
