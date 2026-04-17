from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .evaluate import evaluate_fixture_directory, evaluate_fixture_file
from .pipeline import SentriWorker


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sentri timetable OCR worker")
    parser.add_argument("--input", help="JSON request file")
    parser.add_argument("--image", help="Timetable screenshot path")
    parser.add_argument("--text", help="Raw OCR text input")
    parser.add_argument("--output", help="Write JSON result to file instead of stdout")
    parser.add_argument("--evaluate-fixture", help="Run parser evaluation from a fixture JSON file")
    parser.add_argument("--evaluate-fixture-dir", help="Run parser evaluation for all fixtures in a directory")
    parser.add_argument("--evaluate-pattern", default="*.json", help="Glob pattern for fixture discovery")
    parser.add_argument("--tuning-file", help="JSON file with tuning profile overrides")
    parser.add_argument("--parsing-options-file", help="JSON file with parser options")
    parser.add_argument("--confidence-weights-file", help="JSON file with confidence blending weights")
    return parser


def main() -> int:
    args = build_parser().parse_args()

    if args.evaluate_fixture_dir:
        evaluation = evaluate_fixture_directory(args.evaluate_fixture_dir, pattern=args.evaluate_pattern)
        serialized = json.dumps(evaluation, indent=2, ensure_ascii=True)
        if args.output:
            Path(args.output).write_text(serialized + "\n", encoding="utf-8")
        else:
            sys.stdout.write(serialized + "\n")
        return 0

    if args.evaluate_fixture:
        evaluation = evaluate_fixture_file(args.evaluate_fixture)
        serialized = json.dumps(evaluation, indent=2, ensure_ascii=True)
        if args.output:
            Path(args.output).write_text(serialized + "\n", encoding="utf-8")
        else:
            sys.stdout.write(serialized + "\n")
        return 0

    payload: dict[str, object] = {}

    if args.input:
        payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    else:
        if args.image:
            payload["image_path"] = args.image
        if args.text:
            payload["ocr_text"] = args.text

    if args.tuning_file:
        payload["tuning"] = _load_json_object(args.tuning_file)
    if args.parsing_options_file:
        payload["parsing_options"] = _load_json_object(args.parsing_options_file)
    if args.confidence_weights_file:
        payload["confidence_weights"] = _load_json_object(args.confidence_weights_file)

    result = SentriWorker().process(payload)
    serialized = json.dumps(result, indent=2, ensure_ascii=True)

    if args.output:
        Path(args.output).write_text(serialized + "\n", encoding="utf-8")
    else:
        sys.stdout.write(serialized + "\n")
def _load_json_object(path: str) -> dict[str, object]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Expected JSON object in {path}")
    return payload


if __name__ == "__main__":
    raise SystemExit(main())
