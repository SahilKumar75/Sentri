"""Tests for performance monitoring utilities."""

from __future__ import annotations

import time

import pytest

from sentri_worker.lib.performance import (
    MemoryTracker,
    PerformanceMonitor,
    get_monitor,
    measure_time,
    timed,
)


class TestPerformanceMonitor:
    """Tests for PerformanceMonitor class."""

    def test_record_metric(self):
        """Test recording a performance metric."""
        monitor = PerformanceMonitor()
        monitor.record("test_operation", 0.5)
        monitor.record("test_operation", 0.3)

        stats = monitor.get_stats("test_operation")
        assert stats is not None
        assert stats["count"] == 2
        assert stats["min"] == 0.3
        assert stats["max"] == 0.5
        assert stats["avg"] == 0.4
        assert stats["total"] == 0.8

    def test_get_stats_nonexistent(self):
        """Test getting stats for nonexistent metric."""
        monitor = PerformanceMonitor()
        stats = monitor.get_stats("nonexistent")
        assert stats is None

    def test_get_all_stats(self):
        """Test getting all statistics."""
        monitor = PerformanceMonitor()
        monitor.record("op1", 0.1)
        monitor.record("op2", 0.2)

        all_stats = monitor.get_all_stats()
        assert "op1" in all_stats
        assert "op2" in all_stats
        assert all_stats["op1"]["count"] == 1
        assert all_stats["op2"]["count"] == 1

    def test_reset(self):
        """Test resetting all metrics."""
        monitor = PerformanceMonitor()
        monitor.record("test", 0.5)
        assert monitor.get_stats("test") is not None

        monitor.reset()
        assert monitor.get_stats("test") is None
        assert len(monitor.metrics) == 0
        assert len(monitor.call_counts) == 0


class TestMeasureTime:
    """Tests for measure_time context manager."""

    def test_measure_time_records_duration(self):
        """Test that measure_time records execution duration."""
        monitor = PerformanceMonitor()

        with measure_time("test_op", monitor):
            time.sleep(0.01)

        stats = monitor.get_stats("test_op")
        assert stats is not None
        assert stats["count"] == 1
        assert stats["min"] >= 0.01
        assert stats["max"] >= 0.01

    def test_measure_time_with_exception(self):
        """Test that measure_time records duration even with exceptions."""
        monitor = PerformanceMonitor()

        with pytest.raises(ValueError):
            with measure_time("test_op", monitor):
                time.sleep(0.01)
                raise ValueError("Test error")

        stats = monitor.get_stats("test_op")
        assert stats is not None
        assert stats["count"] == 1

    def test_measure_time_uses_global_monitor(self):
        """Test that measure_time uses global monitor by default."""
        global_monitor = get_monitor()
        global_monitor.reset()

        with measure_time("global_test"):
            time.sleep(0.01)

        stats = global_monitor.get_stats("global_test")
        assert stats is not None
        assert stats["count"] == 1


class TestTimedDecorator:
    """Tests for timed decorator."""

    def test_timed_decorator_records_duration(self):
        """Test that timed decorator records function duration."""
        monitor = PerformanceMonitor()

        @timed("test_func", monitor)
        def slow_function():
            time.sleep(0.01)
            return "result"

        result = slow_function()
        assert result == "result"

        stats = monitor.get_stats("test_func")
        assert stats is not None
        assert stats["count"] == 1
        assert stats["min"] >= 0.01

    def test_timed_decorator_multiple_calls(self):
        """Test that timed decorator tracks multiple calls."""
        monitor = PerformanceMonitor()

        @timed("multi_call", monitor)
        def fast_function():
            return 42

        for _ in range(5):
            fast_function()

        stats = monitor.get_stats("multi_call")
        assert stats is not None
        assert stats["count"] == 5

    def test_timed_decorator_default_name(self):
        """Test that timed decorator uses function name by default."""
        monitor = PerformanceMonitor()

        @timed(monitor=monitor)
        def my_function():
            return "test"

        my_function()

        stats = monitor.get_stats("my_function")
        assert stats is not None
        assert stats["count"] == 1

    def test_timed_decorator_with_exception(self):
        """Test that timed decorator records duration even with exceptions."""
        monitor = PerformanceMonitor()

        @timed("error_func", monitor)
        def error_function():
            time.sleep(0.01)
            raise ValueError("Test error")

        with pytest.raises(ValueError):
            error_function()

        stats = monitor.get_stats("error_func")
        assert stats is not None
        assert stats["count"] == 1

    def test_timed_decorator_preserves_function_metadata(self):
        """Test that timed decorator preserves function metadata."""
        monitor = PerformanceMonitor()

        @timed(monitor=monitor)
        def documented_function():
            """This is a test function."""
            return "test"

        assert documented_function.__name__ == "documented_function"
        assert documented_function.__doc__ == "This is a test function."


class TestMemoryTracker:
    """Tests for MemoryTracker class."""

    def test_memory_tracker_disabled_without_profiler(self):
        """Test that memory tracker is disabled without memory_profiler."""
        tracker = MemoryTracker()

        def test_func():
            return [i for i in range(1000)]

        result, memory = tracker.measure(test_func)
        assert result == list(range(1000))
        # Memory should be None if memory_profiler is not installed
        # (it might be installed in test environment, so we just check it's a valid response)
        assert memory is None or isinstance(memory, float)

    def test_memory_tracker_with_arguments(self):
        """Test that memory tracker works with function arguments."""
        tracker = MemoryTracker()

        def add(a, b):
            return a + b

        result, memory = tracker.measure(add, 5, 10)
        assert result == 15


class TestGlobalMonitor:
    """Tests for global monitor instance."""

    def test_get_monitor_returns_same_instance(self):
        """Test that get_monitor returns the same instance."""
        monitor1 = get_monitor()
        monitor2 = get_monitor()
        assert monitor1 is monitor2

    def test_global_monitor_persistence(self):
        """Test that global monitor persists across calls."""
        monitor = get_monitor()
        monitor.reset()
        monitor.record("persistent_test", 0.5)

        # Get monitor again and check data persists
        monitor2 = get_monitor()
        stats = monitor2.get_stats("persistent_test")
        assert stats is not None
        assert stats["count"] == 1
