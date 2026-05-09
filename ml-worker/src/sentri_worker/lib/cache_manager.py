"""Advanced caching manager with TTL and size limits."""

from __future__ import annotations

import functools
import hashlib
import json
import time
from collections import OrderedDict
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])
_MISSING = object()
_USE_DEFAULT_TTL = object()


class CacheEntry:
    """Cache entry with timestamp and TTL support."""

    __slots__ = ("value", "timestamp", "ttl", "hits")

    def __init__(self, value: Any, ttl: float | None = None) -> None:
        self.value = value
        self.timestamp = time.monotonic()
        self.ttl = ttl
        self.hits = 0

    def is_expired(self) -> bool:
        """Check if the cache entry has expired."""
        if self.ttl is None:
            return False
        return (time.monotonic() - self.timestamp) > self.ttl

    def access(self) -> Any:
        """Access the cached value and increment hit counter."""
        self.hits += 1
        return self.value


class LRUCache:
    """LRU cache with TTL and size limits."""

    def __init__(self, maxsize: int = 128, ttl: float | None = None) -> None:
        """Initialize LRU cache.

        Args:
            maxsize: Maximum number of entries
            ttl: Time-to-live in seconds (None for no expiration)
        """
        if maxsize < 1:
            raise ValueError("maxsize must be at least 1")

        self.maxsize = maxsize
        self.ttl = ttl
        self.cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache.

        Args:
            key: Cache key
            default: Value returned when the key is not cached or expired

        Returns:
            Cached value or default if not found or expired
        """
        if key not in self.cache:
            self.misses += 1
            return default

        entry = self.cache[key]
        if entry.is_expired():
            del self.cache[key]
            self.misses += 1
            return default

        # Move to end (most recently used)
        self.cache.move_to_end(key)
        self.hits += 1
        return entry.access()

    def set(self, key: str, value: Any, ttl: float | None | object = _USE_DEFAULT_TTL) -> None:
        """Set value in cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Optional TTL override for this entry
        """
        if key in self.cache:
            del self.cache[key]

        entry_ttl = self.ttl if ttl is _USE_DEFAULT_TTL else ttl
        entry = CacheEntry(value, entry_ttl)  # type: ignore[arg-type]
        self.cache[key] = entry
        self.cache.move_to_end(key)

        # Evict oldest if over size limit
        if len(self.cache) > self.maxsize:
            self.cache.popitem(last=False)

    def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
        self.hits = 0
        self.misses = 0

    def get_stats(self) -> dict[str, Any]:
        """Get cache statistics.

        Returns:
            Dictionary with cache statistics
        """
        total_requests = self.hits + self.misses
        hit_rate = self.hits / total_requests if total_requests > 0 else 0.0

        return {
            "size": len(self.cache),
            "maxsize": self.maxsize,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": hit_rate,
            "total_requests": total_requests,
        }

    def cleanup_expired(self) -> int:
        """Remove expired entries.

        Returns:
            Number of entries removed
        """
        expired_keys = [key for key, entry in self.cache.items() if entry.is_expired()]
        for key in expired_keys:
            del self.cache[key]
        return len(expired_keys)


def make_cache_key(*args: Any, **kwargs: Any) -> str:
    """Generate a cache key from function arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        Hash string suitable for use as cache key
    """
    # Create a stable representation of arguments
    key_data = {
        "args": args,
        "kwargs": sorted(kwargs.items()),
    }
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.sha256(key_str.encode()).hexdigest()


def cached(maxsize: int = 128, ttl: float | None = None) -> Callable[[F], F]:
    """Decorator for caching function results with LRU and TTL.

    Args:
        maxsize: Maximum cache size
        ttl: Time-to-live in seconds

    Example:
        >>> @cached(maxsize=100, ttl=300)
        ... def expensive_function(x, y):
        ...     return x + y
    """
    cache = LRUCache(maxsize=maxsize, ttl=ttl)

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            cache_key = make_cache_key(*args, **kwargs)
            result = cache.get(cache_key, _MISSING)

            if result is _MISSING:
                result = func(*args, **kwargs)
                cache.set(cache_key, result)

            return result

        # Attach cache management methods
        wrapper.cache = cache  # type: ignore
        wrapper.cache_clear = cache.clear  # type: ignore
        wrapper.cache_stats = cache.get_stats  # type: ignore

        return wrapper  # type: ignore

    return decorator


class CacheManager:
    """Global cache manager for multiple named caches."""

    def __init__(self) -> None:
        self.caches: dict[str, LRUCache] = {}

    def get_cache(self, name: str, maxsize: int = 128, ttl: float | None = None) -> LRUCache:
        """Get or create a named cache.

        Args:
            name: Cache name
            maxsize: Maximum cache size
            ttl: Time-to-live in seconds

        Returns:
            LRUCache instance
        """
        if name not in self.caches:
            self.caches[name] = LRUCache(maxsize=maxsize, ttl=ttl)
        return self.caches[name]

    def clear_all(self) -> None:
        """Clear all managed caches."""
        for cache in self.caches.values():
            cache.clear()

    def get_all_stats(self) -> dict[str, dict[str, Any]]:
        """Get statistics for all caches.

        Returns:
            Dictionary mapping cache names to their statistics
        """
        return {name: cache.get_stats() for name, cache in self.caches.items()}


# Global cache manager instance
_cache_manager = CacheManager()


def get_cache_manager() -> CacheManager:
    """Get the global cache manager instance.

    Returns:
        Global CacheManager instance
    """
    return _cache_manager
