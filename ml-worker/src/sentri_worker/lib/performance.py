"""Performance monitoring and profiling utilities."""

from __future__ import annotations

import functools
import time
from collections import defaultdict
from contextlib import contextmanager
from typing import Any, Callable, Generator, TypeVar

F = TypeVar("F", bound=Callable[..., Any])


class PerformanceMonitor:
    """Monitor and track performance metrics."""

    def __init__(self) -> None:
        self.metrics: dict[str, list[float]] = defaultdict(list)
        self.call_counts: dict[str, int] = defaultdict(int)

    def record(self, name: str, duration: float) -> None:
        """Record a performance metric.

        Args:
            name: Metric name
            duration: Duration in seconds
        """
        self.metrics[name].append(duration)
        self.call_counts[name] += 1

    def get_stats(self, name: str) -> dict[str, float] | None:
        """Get statistics for a metric.

        Args:
            name: Metric name

        Returns:
            Dictionary with min, max, avg, total, count or None if no data
        """
        if name not in self.metrics or not self.metrics[name]:
            return None

        durations = self.metrics[name]
        return {
            "min": min(durations),
            "max": max(durations),
            "avg": sum(durations) / len(durations),
            "total": sum(durations),
            "count": self.call_counts[name],
        }

    def get_all_stats(self) -> dict[str, dict[str, float]]:
        """Get statistics for all metrics.

        Returns:
            Dictionary mapping metric names to their statistics
        """
        return {name: stats for name in self.metrics if (stats := self.get_stats(name)) is not None}

    def reset(self) -> None:
        """Reset all metrics."""
        self.metrics.clear()
        self.call_counts.clear()


# Global performance monitor instance
_monitor = PerformanceMonitor()


def get_monitor() -> PerformanceMonitor:
    """Get the global performance monitor instance.

    Returns:
        Global PerformanceMonitor instance
    """
    return _monitor


@contextmanager
def measure_time(name: str, monitor: PerformanceMonitor | None = None) -> Generator[None, None, None]:
    """Context manager to measure execution time.

    Args:
        name: Metric name
        monitor: Optional PerformanceMonitor instance (uses global if None)

    Example:
        >>> with measure_time("my_operation"):
        ...     # code to measure
        ...     pass
    """
    monitor = monitor or _monitor
    start = time.perf_counter()
    try:
        yield
    finally:
        duration = time.perf_counter() - start
        monitor.record(name, duration)


def timed(name: str | None = None, monitor: PerformanceMonitor | None = None) -> Callable[[F], F]:
    """Decorator to measure function execution time.

    Args:
        name: Metric name (defaults to function name)
        monitor: Optional PerformanceMonitor instance (uses global if None)

    Example:
        >>> @timed("my_function")
        ... def my_function():
        ...     pass
    """

    def decorator(func: F) -> F:
        metric_name = name or func.__name__
        perf_monitor = monitor or _monitor

        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start
                perf_monitor.record(metric_name, duration)

        return wrapper  # type: ignore

    return decorator


class MemoryTracker:
    """Track memory usage (requires memory_profiler)."""

    def __init__(self) -> None:
        self.enabled = False
        try:
            from memory_profiler import memory_usage  # type: ignore

            self.memory_usage = memory_usage
            self.enabled = True
        except ImportError:
            pass

    def measure(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> tuple[Any, float | None]:
        """Measure memory usage of a function call.

        Args:
            func: Function to measure
            *args: Positional arguments for func
            **kwargs: Keyword arguments for func

        Returns:
            Tuple of (function result, peak memory in MB or None if disabled)
        """
        if not self.enabled:
            return func(*args, **kwargs), None

        result = None

        def wrapper() -> None:
            nonlocal result
            result = func(*args, **kwargs)

        mem_usage = self.memory_usage(wrapper, interval=0.1, max_usage=True)
        peak_memory = max(mem_usage) if mem_usage else None

        return result, peak_memory
