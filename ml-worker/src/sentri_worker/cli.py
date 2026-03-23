from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .pipeline import SentriWorker


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sentri timetable OCR worker")
    parser.add_argument("--input", help="JSON request file")
    parser.add_argument("--image", help="Timetable screenshot path")
    parser.add_argument("--text", help="Raw OCR text input")
    parser.add_argument("--output", help="Write JSON result to file instead of stdout")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    payload: dict[str, object] = {}

    if args.input:
        payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    else:
        if args.image:
            payload["image_path"] = args.image
        if args.text:
            payload["ocr_text"] = args.text

    result = SentriWorker().process(payload)
    serialized = json.dumps(result, indent=2, ensure_ascii=True)

    if args.output:
        Path(args.output).write_text(serialized + "\n", encoding="utf-8")
    else:
        sys.stdout.write(serialized + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
