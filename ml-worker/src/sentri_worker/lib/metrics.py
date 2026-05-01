"""Metrics collection and reporting for ML operations."""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any


@dataclass
class OperationMetrics:
    """Metrics for a single operation."""

    operation_name: str
    start_time: float = field(default_factory=time.time)
    end_time: float | None = None
    success: bool = True
    error_message: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def complete(self, success: bool = True, error_message: str | None = None) -> None:
        """Mark operation as complete."""
        self.end_time = time.time()
        self.success = success
        self.error_message = error_message

    @property
    def duration(self) -> float | None:
        """Get operation duration in seconds."""
        if self.end_time is None:
            return None
        return self.end_time - self.start_time

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "operation": self.operation_name,
            "duration": self.duration,
            "success": self.success,
            "error": self.error_message,
            "metadata": self.metadata,
        }


class MetricsCollector:
    """Collect and aggregate metrics."""

    def __init__(self) -> None:
        self.operations: list[OperationMetrics] = []
        self.counters: dict[str, int] = defaultdict(int)
        self.gauges: dict[str, float] = {}

    def start_operation(self, name: str, **metadata: Any) -> OperationMetrics:
        """Start tracking an operation."""
        metric = OperationMetrics(operation_name=name, metadata=metadata)
        self.operations.append(metric)
        return metric

    def increment_counter(self, name: str, value: int = 1) -> None:
        """Increment a counter metric."""
        self.counters[name] += value

    def set_gauge(self, name: str, value: float) -> None:
        """Set a gauge metric."""
        self.gauges[name] = value

    def get_summary(self) -> dict[str, Any]:
        """Get summary of all metrics."""
        completed_ops = [op for op in self.operations if op.end_time is not None]
        successful_ops = [op for op in completed_ops if op.success]
        failed_ops = [op for op in completed_ops if not op.success]

        durations = [op.duration for op in completed_ops if op.duration is not None]
        avg_duration = sum(durations) / len(durations) if durations else 0

        return {
            "total_operations": len(completed_ops),
            "successful_operations": len(successful_ops),
            "failed_operations": len(failed_ops),
            "success_rate": len(successful_ops) / len(completed_ops) if completed_ops else 0,
            "average_duration": avg_duration,
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
        }

    def reset(self) -> None:
        """Reset all metrics."""
        self.operations.clear()
        self.counters.clear()
        self.gauges.clear()


# Global metrics collector
_metrics_collector = MetricsCollector()


def get_metrics_collector() -> MetricsCollector:
    """Get global metrics collector."""
    return _metrics_collector
