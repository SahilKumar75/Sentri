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
    """Benchmark OCR performance."""
    durations = []

    for _ in range(iterations):
        payload = {"image_path": str(image_path)}
        start = time.perf_counter()
        worker.process(payload)
        duration = time.perf_counter() - start
        durations.append(duration)

    return {
        "operation": "ocr",
        "iterations": iterations,
        "min": min(durations),
        "max": max(durations),
        "avg": sum(durations) / len(durations),
        "total": sum(durations),
    }


def benchmark_parsing(worker: SentriWorker, text: str, iterations: int = 100) -> dict[str, Any]:
    """Benchmark parsing performance."""
    durations = []

    for _ in range(iterations):
        payload = {"ocr_text": text}
        start = time.perf_counter()
        worker.process(payload)
        duration = time.perf_counter() - start
        durations.append(duration)

    return {
        "operation": "parsing",
        "iterations": iterations,
        "min": min(durations),
        "max": max(durations),
        "avg": sum(durations) / len(durations),
        "total": sum(durations),
    }


def main() -> int:
    """Run benchmarks."""
    parser = argparse.ArgumentParser(description="Benchmark Sentri Worker performance")
    parser.add_argument("--image", help="Image path for OCR benchmark")
    parser.add_argument("--text", help="Text for parsing benchmark")
    parser.add_argument("--iterations", type=int, default=10, help="Number of iterations")
    parser.add_argument("--output", help="Output JSON file for results")

    args = parser.parse_args()

    worker = SentriWorker()
    results = []

    if args.image:
        image_path = Path(args.image)
        if not image_path.exists():
            print(f"Error: Image not found: {image_path}")
            return 1

        print(f"Benchmarking OCR with {args.iterations} iterations...")
        ocr_results = benchmark_ocr(worker, image_path, args.iterations)
        results.append(ocr_results)
        print(f"OCR avg: {ocr_results['avg']:.4f}s")

    if args.text:
        print(f"Benchmarking parsing with {args.iterations} iterations...")
        parse_results = benchmark_parsing(worker, args.text, args.iterations)
        results.append(parse_results)
        print(f"Parsing avg: {parse_results['avg']:.4f}s")

    if not results:
        print("No benchmarks to run. Provide --image or --text")
        return 1

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(json.dumps(results, indent=2))
        print(f"Results written to {output_path}")
    else:
        print(json.dumps(results, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
