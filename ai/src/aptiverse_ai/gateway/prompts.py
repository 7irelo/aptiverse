"""Versioned prompt files.

`prompts/<id>/v<N>.yaml` holds the system blocks (with cache breakpoints after the stable parts) and a
user template. Placeholders are `{{name}}` so LaTeX braces in prompts stay literal. The registry loads and
validates every file at boot, and the active version per id comes from config.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field, model_validator

from aptiverse_ai.gateway.types import Effort, ModelRequest, SystemBlock
from aptiverse_ai.settings import Tier

_PLACEHOLDER = re.compile(r"\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}")
DEFAULT_DIR = Path(__file__).resolve().parent.parent / "prompts"


class PromptBlock(BaseModel):
    text: str
    cache: bool = False


class PromptFile(BaseModel):
    id: str
    version: int = Field(ge=1)
    use_case: str
    tier: Tier
    effort: Effort | None = None
    max_output_tokens: int = Field(default=4096, ge=1, le=128_000)
    variables: list[str] = Field(default_factory=list)
    system: list[PromptBlock]
    user: str

    @model_validator(mode="after")
    def _placeholders_declared(self) -> PromptFile:
        used = set(_PLACEHOLDER.findall(self.user))
        for block in self.system:
            used.update(_PLACEHOLDER.findall(block.text))
        undeclared = used - set(self.variables)
        unused = set(self.variables) - used
        if undeclared:
            raise ValueError(f"{self.id} v{self.version}: undeclared placeholders {sorted(undeclared)}")
        if unused:
            raise ValueError(f"{self.id} v{self.version}: declared but unused {sorted(unused)}")
        if sum(1 for b in self.system if b.cache) > 3:
            raise ValueError(f"{self.id} v{self.version}: at most 3 system cache breakpoints (4 per request)")
        return self


class MissingVariable(KeyError):
    pass


@dataclass(frozen=True, slots=True)
class RenderedPrompt:
    prompt: PromptFile
    system: list[SystemBlock]
    user: str

    def request(self, *, messages: list[dict[str, Any]] | None = None, **overrides: Any) -> ModelRequest:
        """Builds a request. `messages` (history) go before the rendered user turn."""
        history = list(messages or [])
        return ModelRequest(
            use_case=self.prompt.use_case,
            tier=overrides.pop("tier", self.prompt.tier),
            messages=[*history, {"role": "user", "content": self.user}],
            system=self.system,
            max_output_tokens=overrides.pop("max_output_tokens", self.prompt.max_output_tokens),
            effort=overrides.pop("effort", self.prompt.effort),
            prompt_id=self.prompt.id,
            prompt_version=self.prompt.version,
            **overrides,
        )


def _render(template: str, values: dict[str, str]) -> str:
    def sub(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in values:
            raise MissingVariable(name)
        return values[name]

    return _PLACEHOLDER.sub(sub, template)


class PromptRegistry:
    def __init__(self, prompts: dict[tuple[str, int], PromptFile], active: dict[str, int]):
        self._prompts = prompts
        self._active = active
        for pid, version in active.items():
            if (pid, version) not in prompts:
                raise ValueError(f"active prompt {pid} v{version} does not exist")

    @classmethod
    def load(cls, directory: Path = DEFAULT_DIR, active: dict[str, int] | None = None) -> PromptRegistry:
        prompts: dict[tuple[str, int], PromptFile] = {}
        for path in sorted(directory.glob("*/v*.yaml")):
            prompt = PromptFile.model_validate(yaml.safe_load(path.read_text(encoding="utf-8")))
            if prompt.id != path.parent.name or path.stem != f"v{prompt.version}":
                raise ValueError(f"{path}: id and version must match the folder and file name")
            key = (prompt.id, prompt.version)
            if key in prompts:
                raise ValueError(f"duplicate prompt {key}")
            prompts[key] = prompt
        chosen = dict(active or {})
        for pid in {p for p, _ in prompts}:
            chosen.setdefault(pid, max(v for p, v in prompts if p == pid))
        return cls(prompts, chosen)

    def ids(self) -> list[str]:
        return sorted(self._active)

    def get(self, prompt_id: str, version: int | None = None) -> PromptFile:
        key = (prompt_id, version or self._active[prompt_id])
        return self._prompts[key]

    def render(self, prompt_id: str, version: int | None = None, **values: str) -> RenderedPrompt:
        prompt = self.get(prompt_id, version)
        missing = set(prompt.variables) - set(values)
        if missing:
            raise MissingVariable(", ".join(sorted(missing)))
        return RenderedPrompt(
            prompt=prompt,
            system=[SystemBlock(_render(b.text, values), b.cache) for b in prompt.system],
            user=_render(prompt.user, values),
        )
