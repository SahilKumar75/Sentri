from collections import OrderedDict
from typing import Any, Callable, Optional

class LRUCache:
    def __init__(self, maxsize: int = 128):
        if maxsize < 1:
            raise ValueError("maxsize must be at least 1")
        self.maxsize = maxsize
        self.cache = OrderedDict()

    def get(self, key: Any) -> Any:
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        return None

    def set(self, key: Any, value: Any) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.maxsize:
            self.cache.popitem(last=False)

    def __contains__(self, key: Any) -> bool:
        return key in self.cache

    def clear(self) -> None:
        self.cache.clear()

def lru_cache(maxsize: int = 128):
    """Simple LRU cache decorator."""
    def decorator(func: Callable):
        cache = LRUCache(maxsize)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            if key in cache:
                return cache.get(key)
            result = func(*args, **kwargs)
            cache.set(key, result)
            return result
        wrapper.cache_clear = cache.clear
        return wrapper
    return decorator
