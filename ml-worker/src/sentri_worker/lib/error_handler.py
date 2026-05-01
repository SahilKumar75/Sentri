"""Centralized error handling and recovery strategies."""

from __future__ import annotations

import functools
import logging
import traceback
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

logger = logging.getLogger(__name__)


class WorkerError(Exception):
    """Base exception for worker errors."""

    def __init__(self, message: str, code: str = "WORKER_ERROR", details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

    def to_dict(self) -> dict[str, Any]:
        """Convert error to dictionary."""
        return {
            "error": self.code,
            "message": self.message,
            "details": self.details,
        }


class OCRError(WorkerError):
    """OCR-specific errors."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="OCR_ERROR", details=details)


class ParsingError(WorkerError):
    """Parsing-specific errors."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="PARSING_ERROR", details=details)


class ValidationError(WorkerError):
    """Validation errors."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message, code="VALIDATION_ERROR", details=details)


def handle_errors(
    default_return: Any = None,
    log_errors: bool = True,
    raise_on_error: bool = False,
) -> Callable[[F], F]:
    """Decorator for centralized error handling.

    Args:
        default_return: Value to return on error
        log_errors: Whether to log errors
        raise_on_error: Whether to re-raise exceptions

    Example:
        >>> @handle_errors(default_return={}, log_errors=True)
        ... def risky_function():
        ...     raise ValueError("Something went wrong")
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                return func(*args, **kwargs)
            except WorkerError as e:
                if log_errors:
                    logger.error(f"Worker error in {func.__name__}: {e.message}", extra={"error_code": e.code})
                if raise_on_error:
                    raise
                return default_return
            except Exception as e:
                if log_errors:
                    logger.error(
                        f"Unexpected error in {func.__name__}: {str(e)}",
                        extra={"traceback": traceback.format_exc()},
                    )
                if raise_on_error:
                    raise
                return default_return

        return wrapper  # type: ignore

    return decorator


def retry_on_failure(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable[[F], F]:
    """Decorator to retry function on failure.

    Args:
        max_attempts: Maximum number of attempts
        delay: Initial delay between retries in seconds
        backoff: Multiplier for delay after each retry
        exceptions: Tuple of exceptions to catch

    Example:
        >>> @retry_on_failure(max_attempts=3, delay=1.0)
        ... def unstable_function():
        ...     pass
    """
    import time

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            current_delay = delay
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        logger.warning(
                            f"Attempt {attempt}/{max_attempts} failed for {func.__name__}: {str(e)}. "
                            f"Retrying in {current_delay}s..."
                        )
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"All {max_attempts} attempts failed for {func.__name__}")

            if last_exception:
                raise last_exception
            return None

        return wrapper  # type: ignore

    return decorator


class ErrorContext:
    """Context manager for error handling with cleanup."""

    def __init__(self, operation_name: str, cleanup_func: Callable[[], None] | None = None) -> None:
        self.operation_name = operation_name
        self.cleanup_func = cleanup_func

    def __enter__(self) -> ErrorContext:
        logger.debug(f"Starting operation: {self.operation_name}")
        return self

    def __exit__(self, exc_type: type[BaseException] | None, exc_val: BaseException | None, exc_tb: Any) -> bool:
        if exc_type is not None:
            logger.error(f"Error in {self.operation_name}: {exc_val}")

        if self.cleanup_func:
            try:
                self.cleanup_func()
            except Exception as e:
                logger.error(f"Cleanup failed for {self.operation_name}: {e}")

        return False  # Don't suppress exceptions
