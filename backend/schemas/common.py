from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Any


# ── ObjectId helper ──────────────────────────────────────────────
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(str(v)):
            raise ValueError(f"Invalid ObjectId: {v}")
        return str(v)


# ── Generic response wrappers ─────────────────────────────────────
class MessageResponse(BaseModel):
    message: str


class DataResponse(BaseModel):
    data: Any
    message: str = "Success"
