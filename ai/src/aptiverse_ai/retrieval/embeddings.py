"""Embedding providers behind one interface, so the retrieval eval (not preference) picks the winner."""

from __future__ import annotations

import hashlib
import itertools
import math
import re
from typing import Any, Protocol

from aptiverse_ai.settings import EmbeddingSettings

_TOKEN = re.compile(r"[a-z0-9]+")


class Embedder(Protocol):
    model: str
    dimensions: int

    async def embed(self, texts: list[str], *, kind: str = "document") -> list[list[float]]: ...

    async def aclose(self) -> None: ...


class HashEmbedder:
    """Deterministic feature hashing of words and word pairs. Offline and free: for tests and local runs,
    never for production retrieval. Shared words give positive similarity, which is enough to test ranking."""

    def __init__(self, dimensions: int = 384):
        self.dimensions = dimensions
        self.model = f"hash-{dimensions}"

    def _vector(self, text: str) -> list[float]:
        vec = [0.0] * self.dimensions
        words = _TOKEN.findall(text.lower())
        features = words + [f"{a}_{b}" for a, b in itertools.pairwise(words)]
        for feature in features:
            digest = hashlib.blake2b(feature.encode(), digest_size=8).digest()
            index = int.from_bytes(digest[:4], "little") % self.dimensions
            sign = 1.0 if digest[4] & 1 else -1.0
            vec[index] += sign
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    async def embed(self, texts: list[str], *, kind: str = "document") -> list[list[float]]:
        return [self._vector(t) for t in texts]

    async def aclose(self) -> None:
        return None


class OpenAIEmbedder:
    """OpenAI text-embedding-3 models, shortened with the `dimensions` parameter."""

    def __init__(self, api_key: str, model: str, dimensions: int, batch_size: int = 128):
        import openai

        self._client = openai.AsyncOpenAI(api_key=api_key, max_retries=3)
        self.model = model
        self.dimensions = dimensions
        self._batch = batch_size

    async def embed(self, texts: list[str], *, kind: str = "document") -> list[list[float]]:
        vectors: list[list[float]] = []
        for start in range(0, len(texts), self._batch):
            batch = texts[start : start + self._batch]
            response = await self._client.embeddings.create(model=self.model, input=batch, dimensions=self.dimensions)
            vectors.extend(item.embedding for item in sorted(response.data, key=lambda d: d.index))
        return vectors

    async def aclose(self) -> None:
        await self._client.close()


class SentenceTransformerEmbedder:
    """A local open model (bge-m3 by default) on CPU. Needs the `local-models` extra."""

    def __init__(self, model: str, dimensions: int):
        from sentence_transformers import SentenceTransformer  # pyright: ignore[reportMissingImports]

        self._model: Any = SentenceTransformer(model, device="cpu")
        self.model = model
        self.dimensions = dimensions

    async def embed(self, texts: list[str], *, kind: str = "document") -> list[list[float]]:
        import asyncio

        result = await asyncio.to_thread(self._model.encode, texts, normalize_embeddings=True)
        return [list(map(float, row)) for row in result]

    async def aclose(self) -> None:
        return None


def build_embedder(settings: EmbeddingSettings) -> Embedder:
    if settings.provider == "openai":
        if settings.openai_api_key is None:
            raise ValueError("embeddings.openai_api_key is required for the openai embedder")
        return OpenAIEmbedder(settings.openai_api_key.get_secret_value(), settings.model, settings.dimensions)
    if settings.provider == "sentence-transformers":
        return SentenceTransformerEmbedder(settings.model, settings.dimensions)
    return HashEmbedder(settings.dimensions)
