from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

DegreeFilter = Literal["1st", "2nd", "3rd", "all"]
ConnectionDegree = Literal["1st", "2nd", "3rd"]


class SearchConnectionsInput(BaseModel):
    degree: DegreeFilter
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=49)
    keywords: str = Field(default="", max_length=200)


class ConnectionResult(BaseModel):
    name: str = ""
    title: str = ""
    location: str = ""
    profile_url: str
    degree: ConnectionDegree
    profile_urn: str | None = None


class SearchConnectionsOutput(BaseModel):
    degree_filter: DegreeFilter
    page: int
    page_size: int
    total_available: int | None = None
    connections: list[ConnectionResult] = Field(default_factory=list)


class GetProfilePdfInput(BaseModel):
    profile_url: str


class GetProfilePdfOutput(BaseModel):
    profile_url: str
    pdf_path: str
    bytes_written: int = Field(ge=0)
    month_downloads_used: int = Field(ge=0)
    month_downloads_remaining: int = Field(ge=0)
