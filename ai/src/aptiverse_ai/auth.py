"""Service authentication.

The .NET API signs a short-lived ES256 token per call with the keys Identity already publishes at
/.well-known/jwks.json. That token is the only source of user identity in this service.
"""

from __future__ import annotations

import asyncio
import hashlib
import time
from dataclasses import dataclass, field
from typing import Annotated, Any

import httpx
import jwt
from fastapi import Depends, HTTPException, Request
from jwt import PyJWK

from aptiverse_ai.settings import AuthSettings

_BEARER = "bearer "


@dataclass(frozen=True, slots=True)
class Caller:
    user_id: str
    roles: frozenset[str]
    scopes: frozenset[str]
    request_id: str | None
    mcp_token: str | None = field(default=None, repr=False)

    @property
    def user_id_hash(self) -> str:
        return hashlib.sha256(self.user_id.encode()).hexdigest()[:16]

    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes


class JwksCache:
    """Caches the signing keys and refreshes on an unknown kid, at most once per cooldown."""

    def __init__(self, url: str, client: httpx.AsyncClient, *, max_age: float = 300.0, cooldown: float = 30.0):
        self._url = url
        self._client = client
        self._max_age = max_age
        self._cooldown = cooldown
        self._keys: dict[str, PyJWK] = {}
        self._fetched_at = 0.0
        self._lock = asyncio.Lock()

    def seed(self, jwks: dict[str, Any]) -> None:
        self._keys = {k["kid"]: PyJWK(k) for k in jwks.get("keys", []) if "kid" in k}
        self._fetched_at = time.monotonic()

    async def get(self, kid: str) -> PyJWK | None:
        stale = time.monotonic() - self._fetched_at > self._max_age
        if kid not in self._keys or stale:
            await self._refresh()
        return self._keys.get(kid)

    async def _refresh(self) -> None:
        async with self._lock:
            # An unknown kid from a forged token must not turn into a fetch per request.
            if self._keys and time.monotonic() - self._fetched_at < self._cooldown:
                return
            response = await self._client.get(self._url, timeout=5.0)
            response.raise_for_status()
            self.seed(response.json())


class ServiceTokenVerifier:
    def __init__(self, settings: AuthSettings, jwks: JwksCache):
        self._settings = settings
        self._jwks = jwks

    async def verify(self, token: str) -> dict[str, Any]:
        try:
            header = jwt.get_unverified_header(token)
        except jwt.PyJWTError as exc:
            raise _unauthorized() from exc
        if header.get("alg") != "ES256" or "kid" not in header:
            raise _unauthorized()
        key = await self._jwks.get(header["kid"])
        if key is None:
            raise _unauthorized()
        try:
            return jwt.decode(
                token,
                key=key.key,
                algorithms=["ES256"],
                audience=self._settings.audience,
                issuer=self._settings.issuer,
                leeway=self._settings.leeway_seconds,
                options={"require": ["exp", "iat", "sub", "aud", "iss"]},
            )
        except jwt.PyJWTError as exc:
            raise _unauthorized() from exc


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=401, headers={"WWW-Authenticate": "Bearer"})


def _as_set(value: Any) -> frozenset[str]:
    if value is None:
        return frozenset()
    if isinstance(value, str):
        return frozenset(value.split())
    return frozenset(str(v) for v in value)


async def current_caller(request: Request) -> Caller:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith(_BEARER):
        raise _unauthorized()
    verifier: ServiceTokenVerifier = request.app.state.verifier
    claims = await verifier.verify(header[len(_BEARER) :].strip())
    return Caller(
        user_id=str(claims["sub"]),
        roles=_as_set(claims.get("roles") or claims.get("role")),
        scopes=_as_set(claims.get("scope") or claims.get("scopes")),
        request_id=claims.get("rid"),
        mcp_token=request.headers.get("x-aptiverse-mcp-token"),
    )


CallerDep = Annotated[Caller, Depends(current_caller)]
