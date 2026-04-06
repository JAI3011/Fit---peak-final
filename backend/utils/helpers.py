from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException


def doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-serialisable dict."""
    if doc is None:
        return {}
    result = {}
    for k, v in doc.items():
        if k == "_id":
            result["id"] = str(v)
        elif isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, dict):
            result[k] = doc_to_dict(v)
        elif isinstance(v, list):
            result[k] = [
                doc_to_dict(i) if isinstance(i, dict) else
                str(i) if isinstance(i, ObjectId) else i
                for i in v
            ]
        else:
            result[k] = v
    return result


def utc_now_str() -> str:
    return datetime.now(timezone.utc).isoformat()


def today_date_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def validate_object_id(id_str: str, field_name: str = "id") -> ObjectId:
    """Validate and return ObjectId, raise HTTPException if invalid."""
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}: {id_str}"
        )
