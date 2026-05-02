"""Metrics collection and reporting for ML operations."""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any


@dataclass
class OCRMetrics:
    """Metrics for OCR operations."""

    total_images: int = 0
    successful_extractions: int = 0
    failed_extractions: int = 0
    total_processing_time: float = 0.0
    avg_confidence: float = 0.0
    engine_usage: dict[str, int] = field(default_factory=lambda: defaultdict(int))

    def record_success(self, duration: float, confidence: float | None, engine: str) -> None:
        """Record a successful OCR operation."""
        self.total_images += 1
        self.successful_extractions += 1
        self.total_processing_time += duration
        if confidence is not None:
            self.avg_confidence = (
                self.avg_confidence * (self.successful_extractions - 1) + confidence
            ) / self.successful_extractions
        self.engine_usage[engine] += 1

    def record_failure(self, duration: float) -> None:
        """Record a failed OCR operation."""
        self.total_images += 1
        self.failed_extractions += 1
        self.total_processing_time += duration

    def get_success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_images == 0:
            return 0.0
        return self.successful_extractions / self.total_images

    def get_avg_processing_time(self) -> float:
        """Calculate average processing time."""
        if self.total_images == 0:
            return 0.0
        return self.total_processing_time / self.total_images

    def to_dict(self) -> dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            "total_images": self.total_images,
            "successful_extractions": self.successful_extractions,
            "failed_extractions": self.failed_extractions,
            "success_rate": round(self.get_success_rate(), 4),
            "total_processing_time": round(self.total_processing_time, 4),
            "avg_processing_time": round(self.get_avg_processing_time(), 4),
            "avg_confidence": round(self.avg_confidence, 4),
            "engine_usage": dict(self.engine_usage),
        }


@dataclass
class ParsingMetrics:
    """Metrics for parsing operations."""

    total_parses: int = 0
    successful_parses: int = 0
    failed_parses: int = 0
    total_entries_extracted: int = 0
    total_issues: int = 0
    issue_types: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    entry_types: dict[str, int] = field(default_factory=lambda: defaultdict(int))

    def record_parse(
        self,
        success: bool,
        entries_count: int,
        issues: list[str],
        entry_type_counts: dict[str, int] | None = None,
    ) -> None:
        """Record a parsing operation."""
        self.total_parses += 1
        if success:
            self.successful_parses += 1
            self.total_entries_extracted += entries_count

        if not success:
            self.failed_parses += 1

        self.total_issues += len(issues)
        for issue in issues:
            self.issue_types[issue] += 1

        if entry_type_counts:
            for entry_type, count in entry_type_counts.items():
                self.entry_types[entry_type] += count

    def get_success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_parses == 0:
            return 0.0
        return self.successful_parses / self.total_parses

    def get_avg_entries_per_parse(self) -> float:
        """Calculate average entries per parse."""
        if self.successful_parses == 0:
            return 0.0
        return self.total_entries_extracted / self.successful_parses

    def to_dict(self) -> dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            "total_parses": self.total_parses,
            "successful_parses": self.successful_parses,
            "failed_parses": self.failed_parses,
            "success_rate": round(self.get_success_rate(), 4),
            "total_entries_extracted": self.total_entries_extracted,
            "avg_entries_per_parse": round(self.get_avg_entries_per_parse(), 4),
            "total_issues": self.total_issues,
            "issue_types": dict(self.issue_types),
            "entry_types": dict(self.entry_types),
        }


class MetricsCollector:
    """Centralized metrics collection."""

    def __init__(self) -> None:
        self.ocr_metrics = OCRMetrics()
        self.parsing_metrics = ParsingMetrics()
        self.start_time = time.time()

    def get_uptime(self) -> float:
        """Get uptime in seconds."""
        return time.time() - self.start_time

    def get_all_metrics(self) -> dict[str, Any]:
        """Get all collected metrics."""
        return {
            "uptime_seconds": round(self.get_uptime(), 2),
            "ocr": self.ocr_metrics.to_dict(),
            "parsing": self.parsing_metrics.to_dict(),
        }

    def reset(self) -> None:
        """Reset all metrics."""
        self.ocr_metrics = OCRMetrics()
        self.parsing_metrics = ParsingMetrics()
        self.start_time = time.time()


# Global metrics collector
_metrics_collector = MetricsCollector()


def get_metrics_collector() -> MetricsCollector:
    """Get the global metrics collector instance."""
    return _metrics_collector
