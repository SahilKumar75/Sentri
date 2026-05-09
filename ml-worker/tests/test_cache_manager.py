"""Tests for cache manager utilities."""

from __future__ import annotations

import time

import pytest

from sentri_worker.lib.cache_manager import (
    CacheEntry,
    CacheManager,
    LRUCache,
    cached,
    get_cache_manager,
    make_cache_key,
)


class TestCacheEntry:
    """Tests for CacheEntry class."""

    def test_cache_entry_creation(self):
        """Test creating a cache entry."""
        entry = CacheEntry("test_value", ttl=60.0)
        assert entry.value == "test_value"
        assert entry.ttl == 60.0
        assert entry.hits == 0
        assert not entry.is_expired()

    def test_cache_entry_no_ttl(self):
        """Test cache entry without TTL never expires."""
        entry = CacheEntry("test_value", ttl=None)
        assert not entry.is_expired()

    def test_cache_entry_expiration(self):
        """Test cache entry expiration."""
        entry = CacheEntry("test_value", ttl=0.01)
        assert not entry.is_expired()
        time.sleep(0.02)
        assert entry.is_expired()

    def test_cache_entry_access(self):
        """Test accessing cache entry increments hit counter."""
        entry = CacheEntry("test_value")
        assert entry.hits == 0

        value = entry.access()
        assert value == "test_value"
        assert entry.hits == 1

        entry.access()
        assert entry.hits == 2


class TestLRUCache:
    """Tests for LRUCache class."""

    def test_cache_set_and_get(self):
        """Test setting and getting cache values."""
        cache = LRUCache(maxsize=10)
        cache.set("key1", "value1")

        value = cache.get("key1")
        assert value == "value1"
        assert cache.hits == 1
        assert cache.misses == 0

    def test_cache_miss(self):
        """Test cache miss returns None."""
        cache = LRUCache(maxsize=10)
        value = cache.get("nonexistent")
        assert value is None
        assert cache.hits == 0
        assert cache.misses == 1

    def test_cache_eviction(self):
        """Test LRU eviction when cache is full."""
        cache = LRUCache(maxsize=3)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        cache.set("key4", "value4")  # Should evict key1

        assert cache.get("key1") is None  # Evicted
        assert cache.get("key2") == "value2"
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"

    def test_cache_lru_ordering(self):
        """Test that least recently used items are evicted first."""
        cache = LRUCache(maxsize=3)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")

        # Access key1 to make it recently used
        cache.get("key1")

        # Add key4, should evict key2 (least recently used)
        cache.set("key4", "value4")

        assert cache.get("key1") == "value1"
        assert cache.get("key2") is None  # Evicted
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"

    def test_cache_ttl_expiration(self):
        """Test cache entries expire based on TTL."""
        cache = LRUCache(maxsize=10, ttl=0.01)
        cache.set("key1", "value1")

        assert cache.get("key1") == "value1"
        time.sleep(0.02)
        assert cache.get("key1") is None  # Expired

    def test_cache_entry_specific_ttl(self):
        """Test cache entry with specific TTL overrides default."""
        cache = LRUCache(maxsize=10, ttl=60.0)
        cache.set("key1", "value1", ttl=0.01)

        assert cache.get("key1") == "value1"
        time.sleep(0.02)
        assert cache.get("key1") is None  # Expired

    def test_cache_clear(self):
        """Test clearing cache."""
        cache = LRUCache(maxsize=10)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.get("key1")

        cache.clear()

        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.hits == 0
        assert cache.misses == 2

    def test_cache_stats(self):
        """Test cache statistics."""
        cache = LRUCache(maxsize=10)
        cache.set("key1", "value1")
        cache.set("key2", "value2")

        cache.get("key1")  # Hit
        cache.get("key1")  # Hit
        cache.get("key3")  # Miss

        stats = cache.get_stats()
        assert stats["size"] == 2
        assert stats["maxsize"] == 10
        assert stats["hits"] == 2
        assert stats["misses"] == 1
        assert stats["total_requests"] == 3
        assert stats["hit_rate"] == 2 / 3

    def test_cache_cleanup_expired(self):
        """Test cleaning up expired entries."""
        cache = LRUCache(maxsize=10, ttl=0.01)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3", ttl=None)  # Never expires

        time.sleep(0.02)
        removed = cache.cleanup_expired()

        assert removed == 2
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.get("key3") == "value3"

    def test_cache_rejects_invalid_maxsize(self):
        """Test cache requires a positive max size."""
        with pytest.raises(ValueError, match="maxsize"):
            LRUCache(maxsize=0)


class TestMakeCacheKey:
    """Tests for make_cache_key function."""

    def test_cache_key_from_args(self):
        """Test generating cache key from arguments."""
        key1 = make_cache_key(1, 2, 3)
        key2 = make_cache_key(1, 2, 3)
        key3 = make_cache_key(1, 2, 4)

        assert key1 == key2
        assert key1 != key3

    def test_cache_key_from_kwargs(self):
        """Test generating cache key from keyword arguments."""
        key1 = make_cache_key(a=1, b=2)
        key2 = make_cache_key(b=2, a=1)  # Order shouldn't matter
        key3 = make_cache_key(a=1, b=3)

        assert key1 == key2
        assert key1 != key3

    def test_cache_key_mixed_args(self):
        """Test generating cache key from mixed arguments."""
        key1 = make_cache_key(1, 2, c=3, d=4)
        key2 = make_cache_key(1, 2, d=4, c=3)
        key3 = make_cache_key(1, 2, c=3, d=5)

        assert key1 == key2
        assert key1 != key3


class TestCachedDecorator:
    """Tests for cached decorator."""

    def test_cached_decorator_caches_results(self):
        """Test that cached decorator caches function results."""
        call_count = 0

        @cached(maxsize=10)
        def expensive_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        result1 = expensive_function(5)
        result2 = expensive_function(5)

        assert result1 == 10
        assert result2 == 10
        assert call_count == 1  # Function called only once

    def test_cached_decorator_different_args(self):
        """Test that cached decorator handles different arguments."""
        call_count = 0

        @cached(maxsize=10)
        def add(a, b):
            nonlocal call_count
            call_count += 1
            return a + b

        result1 = add(1, 2)
        result2 = add(1, 2)
        result3 = add(2, 3)

        assert result1 == 3
        assert result2 == 3
        assert result3 == 5
        assert call_count == 2  # Called twice for different args

    def test_cached_decorator_with_ttl(self):
        """Test that cached decorator respects TTL."""
        call_count = 0

        @cached(maxsize=10, ttl=0.01)
        def timed_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        result1 = timed_function(5)
        assert result1 == 10
        assert call_count == 1

        time.sleep(0.02)

        result2 = timed_function(5)
        assert result2 == 10
        assert call_count == 2  # Called again after expiration

    def test_cached_decorator_cache_clear(self):
        """Test clearing cache via decorator."""
        call_count = 0

        @cached(maxsize=10)
        def clearable_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        clearable_function(5)
        clearable_function(5)
        assert call_count == 1

        clearable_function.cache_clear()

        clearable_function(5)
        assert call_count == 2  # Called again after clear

    def test_cached_decorator_cache_stats(self):
        """Test getting cache stats via decorator."""

        @cached(maxsize=10)
        def stats_function(x):
            return x * 2

        stats_function(5)
        stats_function(5)
        stats_function(10)

        stats = stats_function.cache_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 2

    def test_cached_decorator_caches_none_results(self):
        """Test that cached decorator caches None as a valid value."""
        call_count = 0

        @cached(maxsize=10)
        def none_function(x):
            nonlocal call_count
            call_count += 1
            return None

        assert none_function("missing") is None
        assert none_function("missing") is None
        assert call_count == 1


class TestCacheManager:
    """Tests for CacheManager class."""

    def test_get_cache_creates_new(self):
        """Test that get_cache creates new cache if not exists."""
        manager = CacheManager()
        cache = manager.get_cache("test_cache", maxsize=5)

        assert isinstance(cache, LRUCache)
        assert cache.maxsize == 5

    def test_get_cache_returns_existing(self):
        """Test that get_cache returns existing cache."""
        manager = CacheManager()
        cache1 = manager.get_cache("test_cache")
        cache1.set("key1", "value1")

        cache2 = manager.get_cache("test_cache")
        assert cache2.get("key1") == "value1"
        assert cache1 is cache2

    def test_clear_all_caches(self):
        """Test clearing all managed caches."""
        manager = CacheManager()
        cache1 = manager.get_cache("cache1")
        cache2 = manager.get_cache("cache2")

        cache1.set("key1", "value1")
        cache2.set("key2", "value2")

        manager.clear_all()

        assert cache1.get("key1") is None
        assert cache2.get("key2") is None

    def test_get_all_stats(self):
        """Test getting statistics for all caches."""
        manager = CacheManager()
        cache1 = manager.get_cache("cache1")
        cache2 = manager.get_cache("cache2")

        cache1.set("key1", "value1")
        cache2.set("key2", "value2")
        cache1.get("key1")
        cache2.get("key2")

        all_stats = manager.get_all_stats()
        assert "cache1" in all_stats
        assert "cache2" in all_stats
        assert all_stats["cache1"]["hits"] == 1
        assert all_stats["cache2"]["hits"] == 1


class TestGlobalCacheManager:
    """Tests for global cache manager instance."""

    def test_get_cache_manager_returns_same_instance(self):
        """Test that get_cache_manager returns the same instance."""
        manager1 = get_cache_manager()
        manager2 = get_cache_manager()
        assert manager1 is manager2
