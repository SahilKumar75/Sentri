"""Configuration management for Sentri Worker."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class OCRConfig:
    """OCR configuration."""

    enabled: bool = True
    language: str = "eng"
    psm_candidates: tuple[int, ...] = (6, 11, 4)
    tesseract_cmd: str | None = None
    timeout: int = 30

    @classmethod
    def from_env(cls) -> OCRConfig:
        """Load OCR config from environment variables."""
        return cls(
            enabled=os.getenv("OCR_ENABLED", "true").lower() == "true",
            language=os.getenv("OCR_LANGUAGE", "eng"),
            tesseract_cmd=os.getenv("TESSERACT_CMD"),
            timeout=int(os.getenv("OCR_TIMEOUT", "30")),
        )


@dataclass
class ParserConfig:
    """Parser configuration."""

    fallback_to_text: bool = True
    min_confidence: float = 0.5
    strict_validation: bool = False

    @classmethod
    def from_env(cls) -> ParserConfig:
        """Load parser config from environment variables."""
        return cls(
            fallback_to_text=os.getenv("PARSER_FALLBACK", "true").lower() == "true",
            min_confidence=float(os.getenv("PARSER_MIN_CONFIDENCE", "0.5")),
            strict_validation=os.getenv("PARSER_STRICT", "false").lower() == "true",
        )


@dataclass
class CacheConfig:
    """Cache configuration."""

    enabled: bool = True
    maxsize: int = 256
    ttl: float | None = 3600.0  # 1 hour default

    @classmethod
    def from_env(cls) -> CacheConfig:
        """Load cache config from environment variables."""
        ttl_str = os.getenv("CACHE_TTL")
        ttl = float(ttl_str) if ttl_str else 3600.0

        return cls(
            enabled=os.getenv("CACHE_ENABLED", "true").lower() == "true",
            maxsize=int(os.getenv("CACHE_MAXSIZE", "256")),
            ttl=ttl,
        )


@dataclass
class LoggingConfig:
    """Logging configuration."""

    level: str = "INFO"
    format_json: bool = False
    log_file: Path | None = None

    @classmethod
    def from_env(cls) -> LoggingConfig:
        """Load logging config from environment variables."""
        log_file_str = os.getenv("LOG_FILE")
        log_file = Path(log_file_str) if log_file_str else None

        return cls(
            level=os.getenv("LOG_LEVEL", "INFO").upper(),
            format_json=os.getenv("LOG_FORMAT", "text").lower() == "json",
            log_file=log_file,
        )


@dataclass
class WorkerConfig:
    """Main worker configuration."""

    ocr: OCRConfig = field(default_factory=OCRConfig)
    parser: ParserConfig = field(default_factory=ParserConfig)
    cache: CacheConfig = field(default_factory=CacheConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    max_workers: int = 4
    timeout: int = 300

    @classmethod
    def from_env(cls) -> WorkerConfig:
        """Load complete config from environment variables."""
        return cls(
            ocr=OCRConfig.from_env(),
            parser=ParserConfig.from_env(),
            cache=CacheConfig.from_env(),
            logging=LoggingConfig.from_env(),
            max_workers=int(os.getenv("MAX_WORKERS", "4")),
            timeout=int(os.getenv("WORKER_TIMEOUT", "300")),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "ocr": {
                "enabled": self.ocr.enabled,
                "language": self.ocr.language,
                "psm_candidates": self.ocr.psm_candidates,
                "timeout": self.ocr.timeout,
            },
            "parser": {
                "fallback_to_text": self.parser.fallback_to_text,
                "min_confidence": self.parser.min_confidence,
                "strict_validation": self.parser.strict_validation,
            },
            "cache": {
                "enabled": self.cache.enabled,
                "maxsize": self.cache.maxsize,
                "ttl": self.cache.ttl,
            },
            "logging": {
                "level": self.logging.level,
                "format_json": self.logging.format_json,
            },
            "max_workers": self.max_workers,
            "timeout": self.timeout,
        }


# Global config instance
_config: WorkerConfig | None = None


def get_config() -> WorkerConfig:
    """Get global configuration instance."""
    global _config
    if _config is None:
        _config = WorkerConfig.from_env()
    return _config


def set_config(config: WorkerConfig) -> None:
    """Set global configuration instance."""
    global _config
    _config = config
