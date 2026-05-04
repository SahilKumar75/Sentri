from __future__ import annotations

import logging
import time
from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar, cast

from .exceptions import SentriWorkerError

T = TypeVar("T")
logger = logging.getLogger(__name__)


def retry_on_exception(
    exceptions: tuple[type[Exception], ...] = (SentriWorkerError,),
    max_retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Decorator to retry a function if specific exceptions are raised.

    Args:
        exceptions: Tuple of exception types that should trigger a retry.
        max_retries: Maximum number of times to retry before giving up.
        delay: Initial delay in seconds before the first retry.
        backoff: Multiplier applied to the delay after each retry.
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            current_delay = delay
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_retries:
                        logger.error(
                            "Failed after %d retries: %s",
                            max_retries,
                            str(e),
                            exc_info=True,
                        )
                        raise
                    
                    logger.warning(
                        "Attempt %d/%d failed: %s. Retrying in %.2fs...",
                        attempt + 1,
                        max_retries,
                        str(e),
                        current_delay,
                    )
                    time.sleep(current_delay)
                    current_delay *= backoff
                    
            # This should never be reached due to the raise above
            raise RuntimeError("Unexpected retry loop exit")
        return cast(Callable[..., T], wrapper)
    return decorator
