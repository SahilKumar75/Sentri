import logging
import time
import json
from contextlib import contextmanager

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

    def set_gauge(self, name: str, value: float):
        """Sets a gauge metric to a specific value."""
        full_name = f"{self.prefix}_{name}"
        self.metrics[full_name] = value
        logger.debug(f"Gauge {full_name} set to {value}")

    @contextmanager
    def measure_time(self, name: str):
        """Context manager to measure execution time."""
        start = time.time()
        yield
        duration = time.time() - start
        self.set_gauge(f"{name}_duration_seconds", duration)

    def export_json(self) -> str:
        """Exports all current metrics as a JSON string."""
        return json.dumps(self.metrics, indent=2)

    def reset(self):
        """Resets all metrics to empty state."""
        self.metrics.clear()
        logger.info("Metrics collector has been reset")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    collector = MetricsCollector()
    
    collector.inc_counter("requests")
    collector.set_gauge("memory_mb", 256.5)
    
    with collector.measure_time("inference"):
        time.sleep(0.1)  # Simulate work
        
    print(collector.export_json())
