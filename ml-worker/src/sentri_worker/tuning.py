from __future__ import annotations

from dataclasses import dataclass
import difflib
from typing import Any

DEFAULT_SUBJECT_VOCABULARY = (
    "DBMS",
    "PROJECT MANAGEMENT",
    "DM & SM",
    "P & S",
    "OPERATING SYSTEMS",
    "COMPUTER NETWORKS",
    "MACHINE LEARNING",
    "ARTIFICIAL INTELLIGENCE",
    "SOFTWARE ENGINEERING",
    "CALCULUS",
)

DEFAULT_SUBJECT_ALIASES = {
    "DBM5": "DBMS",
    "D8MS": "DBMS",
    "PR0JECT MANAGEMENT": "PROJECT MANAGEMENT",
    "PR0JECT MGMT": "PROJECT MANAGEMENT",
    "PROJECT MGMT": "PROJECT MANAGEMENT",
    "PROJ MGMT": "PROJECT MANAGEMENT",
    "TUT0RIAL": "TUTORIAL",
    "P&S": "P & S",
}


@dataclass(slots=True)
class TuningProfile:
    subject_vocabulary: tuple[str, ...] = DEFAULT_SUBJECT_VOCABULARY
    subject_aliases: dict[str, str] | None = None
    min_match_score: float = 0.83

    def normalize_subject(self, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if not cleaned:
            return cleaned

        aliases = self.subject_aliases or DEFAULT_SUBJECT_ALIASES
        upper_cleaned = cleaned.upper()
        if upper_cleaned in aliases:
            return aliases[upper_cleaned]

        if upper_cleaned in self.subject_vocabulary:
            return upper_cleaned

        closest = difflib.get_close_matches(
            upper_cleaned,
            self.subject_vocabulary,
            n=1,
            cutoff=max(0.0, min(1.0, self.min_match_score)),
        )
        return closest[0] if closest else cleaned


def load_tuning_profile(payload: dict[str, Any] | None) -> TuningProfile:
    payload = payload or {}
    tuning_payload = payload.get("tuning")
    if not isinstance(tuning_payload, dict):
        return TuningProfile()

    vocab = tuning_payload.get("subject_vocabulary")
    aliases = tuning_payload.get("subject_aliases")
    min_match_score = tuning_payload.get("min_match_score")

    resolved_vocab = DEFAULT_SUBJECT_VOCABULARY
    if isinstance(vocab, list):
        normalized_vocab = [str(item).strip().upper() for item in vocab if str(item).strip()]
        if normalized_vocab:
            resolved_vocab = tuple(dict.fromkeys(normalized_vocab))

    resolved_aliases: dict[str, str] = DEFAULT_SUBJECT_ALIASES.copy()
    if isinstance(aliases, dict):
        for key, value in aliases.items():
            key_text = str(key).strip().upper()
            value_text = str(value).strip().upper()
            if key_text and value_text:
                resolved_aliases[key_text] = value_text

    resolved_score = 0.83
    try:
        if min_match_score is not None:
            resolved_score = float(min_match_score)
    except (TypeError, ValueError):
        resolved_score = 0.83

    return TuningProfile(
        subject_vocabulary=resolved_vocab,
        subject_aliases=resolved_aliases,
        min_match_score=max(0.0, min(1.0, resolved_score)),
    )
