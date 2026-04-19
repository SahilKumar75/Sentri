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

DEFAULT_SUBJECT_NOISE_TOKENS = (
    "LECTURE",
    "THEORY",
    "SUBJECT",
    "COURSE",
    "PAPER",
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

DEFAULT_FACULTY_ALIASES = {
    "M A": "MA",
    "M.A": "MA",
    "V1": "VI",
    "S G": "SG",
}

DEFAULT_LOCATION_ALIASES = {
    "LH2O": "LH 20",
    "LH-20": "LH 20",
    "LABIII": "LAB-III",
    "LAB II": "LAB-II",
}


@dataclass(slots=True)
class TuningProfile:
    subject_vocabulary: tuple[str, ...] = DEFAULT_SUBJECT_VOCABULARY
    subject_aliases: dict[str, str] | None = None
    faculty_aliases: dict[str, str] | None = None
    location_aliases: dict[str, str] | None = None
    subject_noise_tokens: tuple[str, ...] = DEFAULT_SUBJECT_NOISE_TOKENS
    min_match_score: float = 0.83

    def normalize_subject(self, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if not cleaned:
            return cleaned

        cleaned = self._strip_subject_noise(cleaned)
        if not cleaned:
            return ""

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

    def _strip_subject_noise(self, value: str) -> str:
        noise_tokens = {token.upper() for token in self.subject_noise_tokens}
        words = [word for word in value.split() if word.upper() not in noise_tokens]
        return " ".join(words)

    def normalize_faculty_code(self, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().upper().split())
        if not cleaned:
            return None

        aliases = self.faculty_aliases or DEFAULT_FACULTY_ALIASES
        if cleaned in aliases:
            return aliases[cleaned]

        compact = cleaned.replace(" ", "")
        if compact in aliases:
            return aliases[compact]
        return compact

    def normalize_location_label(self, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().upper().split())
        if not cleaned:
            return None

        aliases = self.location_aliases or DEFAULT_LOCATION_ALIASES
        if cleaned in aliases:
            return aliases[cleaned]

        compact = cleaned.replace(" ", "")
        if compact in aliases:
            return aliases[compact]
        return cleaned

    def merge(self, other: "TuningProfile") -> "TuningProfile":
        """Return a new TuningProfile combining self (base) with other (overrides).

        - subject_vocabulary: other's entries are appended after self's (deduplicated)
        - aliases: other's entries override self's for matching keys
        - min_match_score: other's value takes precedence
        - subject_noise_tokens: merged (deduplicated, other appended)
        """
        merged_vocab = tuple(
            dict.fromkeys(list(self.subject_vocabulary) + list(other.subject_vocabulary))
        )

        base_aliases = dict(self.subject_aliases or DEFAULT_SUBJECT_ALIASES)
        base_aliases.update(other.subject_aliases or DEFAULT_SUBJECT_ALIASES)

        base_faculty = dict(self.faculty_aliases or DEFAULT_FACULTY_ALIASES)
        base_faculty.update(other.faculty_aliases or DEFAULT_FACULTY_ALIASES)

        base_location = dict(self.location_aliases or DEFAULT_LOCATION_ALIASES)
        base_location.update(other.location_aliases or DEFAULT_LOCATION_ALIASES)

        merged_noise = tuple(
            dict.fromkeys(list(self.subject_noise_tokens) + list(other.subject_noise_tokens))
        )

        return TuningProfile(
            subject_vocabulary=merged_vocab,
            subject_aliases=base_aliases,
            faculty_aliases=base_faculty,
            location_aliases=base_location,
            subject_noise_tokens=merged_noise,
            min_match_score=other.min_match_score,
        )


def load_tuning_profile(payload: dict[str, Any] | None) -> TuningProfile:
    payload = payload or {}
    tuning_payload = payload.get("tuning")
    if not isinstance(tuning_payload, dict):
        return TuningProfile()

    vocab = tuning_payload.get("subject_vocabulary")
    extend_vocab = tuning_payload.get("extend_vocabulary")
    aliases = tuning_payload.get("subject_aliases")
    faculty_aliases = tuning_payload.get("faculty_aliases")
    location_aliases = tuning_payload.get("location_aliases")
    subject_noise_tokens = tuning_payload.get("subject_noise_tokens")
    min_match_score = tuning_payload.get("min_match_score")

    resolved_vocab = DEFAULT_SUBJECT_VOCABULARY
    if isinstance(vocab, list):
        normalized_vocab = [str(item).strip().upper() for item in vocab if str(item).strip()]
        if normalized_vocab:
            resolved_vocab = tuple(dict.fromkeys(normalized_vocab))
    elif isinstance(extend_vocab, list):
        # Append to the default vocabulary without replacing it
        extra = [str(item).strip().upper() for item in extend_vocab if str(item).strip()]
        if extra:
            resolved_vocab = tuple(dict.fromkeys(list(DEFAULT_SUBJECT_VOCABULARY) + extra))

    resolved_aliases: dict[str, str] = DEFAULT_SUBJECT_ALIASES.copy()
    if isinstance(aliases, dict):
        for key, value in aliases.items():
            key_text = str(key).strip().upper()
            value_text = str(value).strip().upper()
            if key_text and value_text:
                resolved_aliases[key_text] = value_text

    resolved_faculty_aliases: dict[str, str] = DEFAULT_FACULTY_ALIASES.copy()
    if isinstance(faculty_aliases, dict):
        for key, value in faculty_aliases.items():
            key_text = str(key).strip().upper()
            value_text = str(value).strip().upper()
            if key_text and value_text:
                resolved_faculty_aliases[key_text] = value_text

    resolved_location_aliases: dict[str, str] = DEFAULT_LOCATION_ALIASES.copy()
    if isinstance(location_aliases, dict):
        for key, value in location_aliases.items():
            key_text = str(key).strip().upper()
            value_text = str(value).strip().upper()
            if key_text and value_text:
                resolved_location_aliases[key_text] = value_text

    resolved_subject_noise_tokens = DEFAULT_SUBJECT_NOISE_TOKENS
    if isinstance(subject_noise_tokens, list):
        normalized_noise_tokens = [str(token).strip().upper() for token in subject_noise_tokens if str(token).strip()]
        if normalized_noise_tokens:
            resolved_subject_noise_tokens = tuple(dict.fromkeys(normalized_noise_tokens))

    resolved_score = 0.83
    try:
        if min_match_score is not None:
            resolved_score = float(min_match_score)
    except (TypeError, ValueError):
        resolved_score = 0.83

    return TuningProfile(
        subject_vocabulary=resolved_vocab,
        subject_aliases=resolved_aliases,
        faculty_aliases=resolved_faculty_aliases,
        location_aliases=resolved_location_aliases,
        subject_noise_tokens=resolved_subject_noise_tokens,
        min_match_score=max(0.0, min(1.0, resolved_score)),
    )
