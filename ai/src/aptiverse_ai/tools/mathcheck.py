"""Maths checking with SymPy: the deterministic check that runs before any model judge.

`parse_expr` evaluates its input, so input is first held to a strict grammar: digits, single-letter or
known-function identifiers, arithmetic operators, parentheses, `=` and commas, at most 300 characters,
with no underscores, quotes, brackets or attribute access. Anything outside it is "unparseable", which
callers treat as unchecked, never as correct.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from tokenize import TokenError
from typing import Any

import sympy
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

_ALLOWED = re.compile(r"^[0-9A-Za-z\s+\-*/^().,=%]+$")
_FUNCTIONS = {
    "sin": sympy.sin,
    "cos": sympy.cos,
    "tan": sympy.tan,
    "sqrt": sympy.sqrt,
    "log": sympy.log,
    "ln": sympy.log,
    "exp": sympy.exp,
    "abs": sympy.Abs,
    "pi": sympy.pi,
    "e": sympy.E,
}
_IDENT = re.compile(r"[A-Za-z]+")
_MAX_LEN = 300
_MAX_POWER = re.compile(r"\^\s*\(?\s*\d{4,}")
_TRANSFORMS = (*standard_transformations, implicit_multiplication_application, convert_xor)


class Unparseable(ValueError):
    pass


def _latex_to_plain(text: str) -> str:
    replacements = [
        (r"\left", ""),
        (r"\right", ""),
        (r"\cdot", "*"),
        (r"\times", "*"),
        (r"\div", "/"),
        (r"\pi", "pi"),
        ("$", ""),
    ]
    for a, b in replacements:
        text = text.replace(a, b)
    text = re.sub(r"\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}", r"((\1)/(\2))", text)
    text = re.sub(r"\\sqrt\s*\{([^{}]*)\}", r"sqrt(\1)", text)
    text = re.sub(r"\\(sin|cos|tan|ln|log)", r"\1", text)
    return text.replace("{", "(").replace("}", ")")


def parse(text: str) -> Any:
    plain = _latex_to_plain(text.strip())
    if not plain or len(plain) > _MAX_LEN or not _ALLOWED.match(plain) or _MAX_POWER.search(plain):
        raise Unparseable(text[:60])
    local: dict[str, Any] = {}
    for ident in _IDENT.findall(plain):
        if ident in _FUNCTIONS:
            local[ident] = _FUNCTIONS[ident]
        elif len(ident) == 1:
            local[ident] = sympy.Symbol(ident)
        elif all(len(part) == 1 for part in ident):
            # "xy" is implicit multiplication of single-letter symbols.
            for ch in ident:
                local[ch] = sympy.Symbol(ch)
        else:
            raise Unparseable(f"unknown name {ident[:20]}")
    plain = plain.replace("%", "/100")
    namespace: dict[str, Any] = {"__builtins__": {}, **_sympy_globals()}

    def one(src: str) -> Any:
        return parse_expr(src, local_dict=local, global_dict=dict(namespace), transformations=_TRANSFORMS)

    try:
        if "=" in plain:
            left, _, right = plain.partition("=")
            return sympy.Eq(one(left), one(right))
        return one(plain)
    except (SyntaxError, TypeError, ValueError, sympy.SympifyError, TokenError) as exc:
        raise Unparseable(text[:60]) from exc


def _sympy_globals() -> dict[str, Any]:
    return {"Integer": sympy.Integer, "Float": sympy.Float, "Rational": sympy.Rational, "Symbol": sympy.Symbol}


@dataclass(frozen=True, slots=True)
class Check:
    """`result` is True, False, or None when the checker could not decide (treated as unchecked)."""

    result: bool | None
    detail: str = ""


def equivalent(a: str, b: str, *, rel_tol: float = 1e-6) -> Check:
    try:
        ea, eb = parse(a), parse(b)
    except Unparseable as exc:
        return Check(None, f"unparseable: {exc}")
    try:
        if isinstance(ea, sympy.Eq) or isinstance(eb, sympy.Eq):
            return _equations_equivalent(ea, eb)
        diff = sympy.simplify(ea - eb)
        if diff == 0:
            return Check(True, "symbolically equal")
        if diff.free_symbols:
            return Check(False, "different expressions")
        value = complex(sympy.N(diff))
        scale = max(abs(complex(sympy.N(eb))), 1.0)
        return Check(abs(value) <= rel_tol * scale, f"numeric difference {abs(value):.3g}")
    except (TypeError, ValueError, AttributeError) as exc:
        return Check(None, f"could not compare: {type(exc).__name__}")


def _equations_equivalent(a: Any, b: Any) -> Check:
    if not (isinstance(a, sympy.Eq) and isinstance(b, sympy.Eq)):
        return Check(False, "equation vs expression")
    symbols = sorted(a.free_symbols | b.free_symbols, key=str)
    if len(symbols) == 1:
        sa = set(sympy.solveset(a, symbols[0], domain=sympy.S.Complexes))  # type: ignore[arg-type]
        sb = set(sympy.solveset(b, symbols[0], domain=sympy.S.Complexes))  # type: ignore[arg-type]
        return Check(sa == sb, "same solution set" if sa == sb else "different solution sets")
    ea: Any = a
    eb: Any = b
    da: Any = sympy.simplify(ea.lhs - ea.rhs)
    db: Any = sympy.simplify(eb.lhs - eb.rhs)
    if da == 0 or db == 0:
        return Check(da == db, "identity")
    ratio: Any = sympy.simplify(da / db)
    constant = not getattr(ratio, "free_symbols", set())
    return Check(constant and ratio != 0, "proportional" if constant else "not proportional")


def solve(equation: str, variable: str = "x") -> Check | list[str]:
    try:
        expr = parse(equation)
    except Unparseable as exc:
        return Check(None, f"unparseable: {exc}")
    symbol = sympy.Symbol(variable)
    target = expr if isinstance(expr, sympy.Eq) else sympy.Eq(expr, 0)
    solutions = sympy.solveset(target, symbol, domain=sympy.S.Reals)
    if isinstance(solutions, sympy.FiniteSet):
        return [sympy.sstr(s) for s in sorted(solutions, key=lambda s: complex(sympy.N(s)).real)]
    return Check(None, f"solution set is {sympy.sstr(solutions)[:80]}")


def numeric_equal(a: float, b: float, *, rel_tol: float = 0.01, abs_tol: float = 1e-9) -> bool:
    """Marking tolerance for numeric answers: 1% relative by default, matching typical memo rounding."""
    return abs(a - b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)


def to_number(text: str) -> float | None:
    try:
        value = parse(text)
    except Unparseable:
        return None
    if isinstance(value, sympy.Eq) or getattr(value, "free_symbols", None):
        return None
    try:
        return float(sympy.N(value))
    except (TypeError, ValueError):
        return None
