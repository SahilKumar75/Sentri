#!/usr/bin/env python3
"""Benchmark script for performance testing."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

from sentri_worker.pipeline import SentriWorker


def benchmark_ocr(worker: SentriWorker, image_path: Path, iterations: int = 10) -> dict[str, Any]:
    """Benchmark OCR performance.

    Args:
        worker: SentriWorker instance
        image_path: Path to test image
        iterations: Number of iterations

    Returns:
        Benchmark results
    """
    durations = []
    payload = {"image_path": str(image_path)}

    for _ in range(iterations):
        start = time.perf_counter()
        result = worker.process(payload)
        duration = time.perf_counter() - start
        durations.append(duration)

    return {
        "operation": "ocr",
        "iterations": iterations,
        "min_time": min(durations),
        "max_time": max(durations),
        "avg_time": sum(durations) / len(durations),
        "total_time": sum(durations),
    }


def benchmark_parsing(worker: SentriWorker, payload: dict[str, Any], iterations: int = 100) -> dict[str, Any]:
    """Benchmark parsing performance.

    Args:
        worker: SentriWorker instance
        payload: Test payload
        iterations: Number of iterations

    Returns:
        Benchmark results
    """
    durations = []

    for _ in range(iterations):
        start = time.perf_counter()
        result = worker.process(payload)
        duration = time.perf_counter() - start
        durations.append(duration)

    return {
        "operation": "parsing",
        "iterations": iterations,
        "min_time": min(durations),
        "max_time": max(durations),
        "avg_time": sum(durations) / len(durations),
        "total_time": sum(durations),
    }


def main() -> int:
    """Run benchmarks."""
    parser = argparse.ArgumentParser(description="Benchmark Sentri Worker performance")
    parser.add_argument("--image", help="Path to test image for OCR benchmark")
    parser.add_argument("--payload", help="Path to test payload JSON for parsing benchmark")
    parser.add_argument("--iterations", type=int, default=10, help="Number of iterations")
    parser.add_argument("--output", help="Output file for results")

    args = parser.parse_args()

    worker = SentriWorker()
    results = []

    if args.image:
        print(f"Benchmarking OCR with {args.iterations} iterations...")
        ocr_results = benchmark_ocr(worker, Path(args.image), args.iterations)
        results.append(ocr_results)
        print(f"  Avg time: {ocr_results['avg_time']:.4f}s")
        print(f"  Min time: {ocr_results['min_time']:.4f}s")
        print(f"  Max time: {ocr_results['max_time']:.4f}s")

    if args.payload:
        print(f"Benchmarking parsing with {args.iterations} iterations...")
        payload = json.loads(Path(args.payload).read_text())
        parse_results = benchmark_parsing(worker, payload, args.iterations)
        results.append(parse_results)
        print(f"  Avg time: {parse_results['avg_time']:.4f}s")
        print(f"  Min time: {parse_results['min_time']:.4f}s")
        print(f"  Max time: {parse_results['max_time']:.4f}s")

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(json.dumps(results, indent=2))
        print(f"\nResults written to {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
