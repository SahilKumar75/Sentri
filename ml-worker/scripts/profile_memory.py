#!/usr/bin/env python3
"""Memory profiling script for identifying memory bottlenecks."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from sentri_worker.pipeline import SentriWorker


def profile_worker(payload: dict) -> None:
    """Profile worker memory usage."""
    try:
        from memory_profiler import profile  # type: ignore

        @profile
        def run_worker():
            worker = SentriWorker()
            return worker.process(payload)

        print("Running memory profiler...")
        result = run_worker()
        print("\nProcessing completed successfully")
        print(f"Entries found: {len(result.get('entries', []))}")

    except ImportError:
        print("Error: memory_profiler not installed")
        print("Install with: pip install memory-profiler")
        return


def main() -> int:
    """Run memory profiling."""
    parser = argparse.ArgumentParser(description="Profile Sentri Worker memory usage")
    parser.add_argument("--input", required=True, help="Input JSON payload file")

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return 1

    payload = json.loads(input_path.read_text(encoding="utf-8"))
    profile_worker(payload)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
