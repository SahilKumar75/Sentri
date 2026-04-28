import unittest
from sentri_worker.lib.lru_cache import LRUCache, lru_cache

class LRUCacheTests(unittest.TestCase):
    def test_lru_cache_basic(self):
        cache = LRUCache(maxsize=2)
        cache.set('a', 1)
        cache.set('b', 2)
        self.assertEqual(cache.get('a'), 1)
        cache.set('c', 3)
        self.assertIsNone(cache.get('b'))  # 'b' should be evicted
        self.assertEqual(cache.get('c'), 3)
        self.assertEqual(cache.get('a'), 1)

    def test_lru_cache_decorator(self):
        calls = []
        @lru_cache(maxsize=2)
        def f(x):
            calls.append(x)
            return x * 2
        self.assertEqual(f(2), 4)
        self.assertEqual(f(2), 4)
        self.assertEqual(len(calls), 1)  # Only called once
        self.assertEqual(f(3), 6)
        self.assertEqual(f(4), 8)
        self.assertEqual(f(2), 4)  # Cache miss, called again
        # LRU: f(2), f(3), f(4), f(2) triggers 4 actual calls
        self.assertEqual(len(calls), 4)

if __name__ == "__main__":
    unittest.main()
