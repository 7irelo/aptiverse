import re
from typing import Dict

import cv2
import numpy as np
import pytesseract
from PIL import Image


# Patterns that indicate common mathematical operations
_STEP_PATTERNS = [
    (r"[=]", "equation"),
    (r"[+\-*/÷×]", "arithmetic"),
    (r"√|sqrt", "square_root"),
    (r"\^|\*\*", "exponentiation"),
    (r"∫|integral|dx", "integration"),
    (r"d/d[a-z]|derivative|f'\(", "differentiation"),
    (r"sin|cos|tan|cot|sec|csc", "trigonometry"),
    (r"log|ln", "logarithm"),
    (r"lim|→|->", "limit"),
    (r"Σ|sigma|sum", "summation"),
]


def analyze_math_work(file) -> Dict:
    """Extract handwritten mathematics from an image and analyse the working.

    Performs OCR, detects individual steps, classifies operations used,
    and checks for common error patterns.
    """
    image = np.array(Image.open(file.file))

    # Pre-process for better OCR accuracy on handwritten content
    grey = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    denoised = cv2.fastNlMeansDenoising(grey, h=12)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    text = pytesseract.image_to_string(thresh, config="--psm 6")

    # Split into individual lines / steps
    raw_lines = [line.strip() for line in text.splitlines() if line.strip()]
    steps = _extract_steps(raw_lines)

    # Classify the operations found across all steps
    operations = _classify_operations(text)

    # Look for common mistakes
    errors = _detect_errors(raw_lines)

    return {
        "extracted_working": text,
        "steps": steps,
        "num_steps": len(steps),
        "operations_detected": operations,
        "potential_errors": errors,
        "analysis": _summarise(steps, operations, errors),
    }


def _extract_steps(lines: list[str]) -> list[dict]:
    """Parse OCR lines into numbered steps with their raw text."""
    steps = []
    for idx, line in enumerate(lines, 1):
        step_type = "expression"
        if "=" in line:
            step_type = "equation"
        elif line.lower().startswith(("therefore", "∴", "ans")):
            step_type = "conclusion"
        elif line.lower().startswith(("let", "given", "if")):
            step_type = "setup"
        steps.append({"step": idx, "text": line, "type": step_type})
    return steps


def _classify_operations(text: str) -> list[str]:
    """Identify mathematical operations present in the extracted text."""
    found = set()
    lower = text.lower()
    for pattern, label in _STEP_PATTERNS:
        if re.search(pattern, lower):
            found.add(label)
    return sorted(found)


def _detect_errors(lines: list[str]) -> list[dict]:
    """Heuristic checks for common mathematical mistakes."""
    errors = []

    for idx, line in enumerate(lines):
        # Division by zero pattern
        if re.search(r"/\s*0(?!\d)", line):
            errors.append(
                {"line": idx + 1, "type": "division_by_zero", "text": line}
            )

        # Sign error: double negatives that should simplify
        if "--" in line or "- -" in line:
            errors.append(
                {"line": idx + 1, "type": "possible_sign_error", "text": line}
            )

        # Mismatched parentheses
        if line.count("(") != line.count(")"):
            errors.append(
                {"line": idx + 1, "type": "mismatched_parentheses", "text": line}
            )

    return errors


def _summarise(steps: list, operations: list, errors: list) -> str:
    """Produce a human-readable summary of the analysis."""
    parts = [f"Detected {len(steps)} working step(s)."]

    if operations:
        parts.append(f"Operations used: {', '.join(operations)}.")

    if errors:
        parts.append(f"Found {len(errors)} potential error(s) to review.")
    else:
        parts.append("No obvious errors detected.")

    return " ".join(parts)
