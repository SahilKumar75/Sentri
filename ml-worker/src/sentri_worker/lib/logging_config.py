"""Logging configuration for Sentri Worker."""

from __future__ import annotations

import logging
import sys
from typing import Any


def setup_logging(level: str = "INFO", format_json: bool = False) -> None:
    """Configure logging for the application.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        format_json: If True, output logs in JSON format for structured logging
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    if format_json:
        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Suppress noisy third-party loggers
    logging.getLogger("PIL").setLevel(logging.WARNING)
    logging.getLogger("pytesseract").setLevel(logging.WARNING)


class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        import json

        log_data: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "extra"):
            log_data.update(record.extra)

        return json.dumps(log_data)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)
