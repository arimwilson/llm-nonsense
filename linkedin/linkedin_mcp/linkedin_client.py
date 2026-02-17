from __future__ import annotations

import json
import threading
import time
from typing import Any

import httpx

from linkedin_mcp.config import LinkedInConfig


class AuthenticationError(RuntimeError):
    """Raised when LinkedIn authentication cookies are missing or expired."""


class RateLimiter:
    """Process-wide rate limiter backed by a mutex and monotonic clock."""

    def __init__(self, min_interval_seconds: float = 5.0):
        if min_interval_seconds <= 0:
            raise ValueError("min_interval_seconds must be > 0")
        self._min_interval = min_interval_seconds
        self._last_request_time = 0.0
        self._lock = threading.Lock()

    def wait(self) -> None:
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self._min_interval:
                time.sleep(self._min_interval - elapsed)
            self._last_request_time = time.monotonic()


class LinkedInClient:
    """Thin HTTP client wrapper for LinkedIn Voyager and web endpoints."""

    def __init__(
        self,
        config: LinkedInConfig,
        *,
        transport: httpx.BaseTransport | None = None,
        timeout_seconds: float = 30.0,
    ) -> None:
        self._config = config
        self._transport = transport  # stored for download_binary reuse in tests
        self._rate_limiter = RateLimiter(config.request_interval_seconds)
        self._client = httpx.Client(
            base_url=config.base_url,
            headers=self._build_default_headers(config),
            cookies=config.cookies,
            follow_redirects=True,
            timeout=timeout_seconds,
            transport=transport,
        )

    @staticmethod
    def _derive_csrf_token(jsessionid: str) -> str:
        return jsessionid.strip().strip('"')

    @classmethod
    def _build_default_headers(cls, config: LinkedInConfig) -> dict[str, str]:
        jsessionid = config.cookies.get("JSESSIONID")
        if not jsessionid:
            raise AuthenticationError("Missing JSESSIONID cookie")

        csrf_token = cls._derive_csrf_token(jsessionid)
        x_li_track = json.dumps(
            {
                "clientVersion": "1.13.0",
                "osName": "web",
                "timezoneOffset": 0,
                "deviceFormFactor": "DESKTOP",
                "mpName": "voyager-web",
            },
            separators=(",", ":"),
        )

        return {
            "accept": "application/vnd.linkedin.normalized+json+2.1",
            "content-type": "application/json; charset=UTF-8",
            "csrf-token": csrf_token,
            "x-restli-protocol-version": "2.0.0",
            "x-li-lang": "en_US",
            "x-li-track": x_li_track,
            "user-agent": config.user_agent,
        }

    def close(self) -> None:
        self._client.close()

    @property
    def config(self) -> LinkedInConfig:
        return self._config

    def __enter__(self) -> LinkedInClient:
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        self.close()

    def request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        self._rate_limiter.wait()
        response = self._client.request(
            method=method,
            url=url,
            params=params,
            json=json_body,
            headers=headers,
        )
        if response.status_code in (401, 403):
            raise AuthenticationError(
                "Authentication expired. Please export fresh cookies:\n"
                "  Option A: Set LINKEDIN_COOKIES env var with your cookie header string\n"
                "  Option B: Capture a new HAR file and set LINKEDIN_HAR_PATH"
            )
        response.raise_for_status()
        return response

    def get(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        return self.request("GET", url, params=params, headers=headers)

    def post(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        return self.request(
            "POST",
            url,
            params=params,
            json_body=json_body,
            headers=headers,
        )

    def download_binary(self, url: str) -> bytes:
        """Fetch binary content from an absolute URL (e.g., an ambry PDF download URL).

        Uses a fresh httpx.Client without a base_url so absolute external URLs
        work correctly. Still goes through the rate limiter.
        """
        self._rate_limiter.wait()
        with httpx.Client(
            transport=self._transport,
            follow_redirects=True,
            timeout=60.0,
        ) as tmp:
            response = tmp.get(url)
            response.raise_for_status()
            return response.content
