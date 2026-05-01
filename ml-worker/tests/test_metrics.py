"""Tests for metrics collection."""

import pytest

from sentri_worker.lib.metrics import MetricsCollector, OperationMetrics


class TestOperationMetrics:
    """Test OperationMetrics class."""

    def test_create_metric(self):
        """Test creating an operation metric."""
        metric = OperationMetrics(operation_name="test_op")
        assert metric.operation_name == "test_op"
        assert metric.success is True
        assert metric.error_message is None
        assert metric.end_time is None

    def test_complete_metric(self):
        """Test completing an operation metric."""
        metric = OperationMetrics(operation_name="test_op")
        metric.complete(success=True)
        assert metric.end_time is not None
        assert metric.duration is not None
        assert metric.duration > 0

    def test_failed_metric(self):
        """Test failed operation metric."""
        metric = OperationMetrics(operation_name="test_op")
        metric.complete(success=False, error_message="Test error")
        assert metric.success is False
        assert metric.error_message == "Test error"

    def test_to_dict(self):
        """Test converting metric to dictionary."""
        metric = OperationMetrics(operation_name="test_op", metadata={"key": "value"})
        metric.complete()
        result = metric.to_dict()
        assert result["operation"] == "test_op"
        assert result["success"] is True
        assert result["metadata"]["key"] == "value"


class TestMetricsCollector:
    """Test MetricsCollector class."""

    def test_start_operation(self):
        """Test starting an operation."""
        collector = MetricsCollector()
        metric = collector.start_operation("test_op")
        assert metric.operation_name == "test_op"
        assert len(collector.operations) == 1

    def test_increment_counter(self):
        """Test incrementing counters."""
        collector = MetricsCollector()
        collector.increment_counter("requests")
        collector.increment_counter("requests", 5)
        assert collector.counters["requests"] == 6

    def test_set_gauge(self):
        """Test setting gauge values."""
        collector = MetricsCollector()
        collector.set_gauge("memory_usage", 1024.5)
        assert collector.gauges["memory_usage"] == 1024.5

    def test_get_summary(self):
        """Test getting metrics summary."""
        collector = MetricsCollector()
        metric1 = collector.start_operation("op1")
        metric1.complete(success=True)
        metric2 = collector.start_operation("op2")
        metric2.complete(success=False)

        summary = collector.get_summary()
        assert summary["total_operations"] == 2
        assert summary["successful_operations"] == 1
        assert summary["failed_operations"] == 1
        assert summary["success_rate"] == 0.5

    def test_reset(self):
        """Test resetting metrics."""
        collector = MetricsCollector()
        collector.start_operation("test")
        collector.increment_counter("test")
        collector.set_gauge("test", 1.0)

        collector.reset()
        assert len(collector.operations) == 0
        assert len(collector.counters) == 0
        assert len(collector.gauges) == 0
