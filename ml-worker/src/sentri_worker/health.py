from __future__ import annotations

import platform
import sys
from typing import Any

from .models import __version__ if hasattr(sys.modules[__name__].__class__, '__version__') else "0.2.0"

def get_health_status() -> dict[str, Any]:
    """
    Returns a dictionary with basic health and environment information.
    Useful for readiness probes when deployed as a service.
    """
    return {
        "status": "up",
        "worker_version": __version__,
        "python_version": sys.version.split(" ")[0],
        "platform": platform.platform(),
        "dependencies": {
            "pytesseract": _check_pytesseract(),
            "pillow": _check_pillow(),
        }
    }

def _check_pytesseract() -> str:
    try:
        import pytesseract
        return pytesseract.get_tesseract_version()
    except Exception:
        return "unavailable"

def _check_pillow() -> str:
    try:
        from PIL import __version__ as pil_version
        return pil_version
    except Exception:
        return "unavailable"
