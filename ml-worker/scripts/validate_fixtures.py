#!/usr/bin/env python3
"""Validate test fixtures for correctness."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def validate_fixture(fixture_path: Path) -> tuple[bool, list[str]]:
    """Validate a single fixture file.

    Args:
        fixture_path: Path to fixture file

    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []

    try:
        data = json.loads(fixture_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]

    # Check required top-level keys
    if "payload" not in data:
        errors.append("Missing required key: 'payload'")
    if "expected_entries" not in data:
        errors.append("Missing required key: 'expected_entries'")

    # Validate payload
    if "payload" in data:
        payload = data["payload"]
        if not isinstance(payload, dict):
            errors.append("'payload' must be a dictionary")
        else:
            # Check for at least one input source
            has_input = any(
                key in payload for key in ["ocr_text", "image_path", "cells"]
            )
            if not has_input:
                errors.append("payload must contain at least one of: ocr_text, image_path, cells")

    # Validate expected_entries
    if "expected_entries" in data:
        entries = data["expected_entries"]
        if not isinstance(entries, list):
            errors.append("'expected_entries' must be a list")
        else:
            for i, entry in enumerate(entries):
                if not isinstance(entry, dict):
                    errors.append(f"expected_entries[{i}] must be a dictionary")
                    continue

                # Check required entry fields
                required_fields = ["dayOfWeek", "subjectName"]
                for field in required_fields:
                    if field not in entry:
                        errors.append(f"expected_entries[{i}] missing required field: '{field}'")

    return len(errors) == 0, errors


def main() -> int:
    """Validate all fixtures."""
    parser = argparse.ArgumentParser(description="Validate test fixtures")
    parser.add_argument(
        "directory",
        type=Path,
        help="Directory containing fixture files",
    )
    parser.add_argument(
        "--pattern",
        default="*.json",
        help="Glob pattern for fixture files",
    )

    args = parser.parse_args()

    if not args.directory.is_dir():
        print(f"Error: {args.directory} is not a directory", file=sys.stderr)
        return 1

    fixture_files = sorted(args.directory.glob(args.pattern))

    if not fixture_files:
        print(f"No fixture files found matching {args.pattern}", file=sys.stderr)
        return 1

    print(f"Validating {len(fixture_files)} fixture files...\n")

    all_valid = True
    for fixture_path in fixture_files:
        is_valid, errors = validate_fixture(fixture_path)

        if is_valid:
            print(f"✓ {fixture_path.name}")
        else:
            print(f"✗ {fixture_path.name}")
            for error in errors:
                print(f"  - {error}")
            all_valid = False

    print()
    if all_valid:
        print("All fixtures are valid!")
        return 0
    else:
        print("Some fixtures have errors.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
