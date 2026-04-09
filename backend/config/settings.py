from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices, model_validator
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "FitPeak API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"

    # MongoDB
    mongo_uri: str = Field(default="mongodb://localhost:27017", alias="MONGO_URI")
    mongo_db_name: str = Field(
        default="fitpeak",
        alias="MONGO_DB_NAME",
        validation_alias=AliasChoices("MONGO_DB_NAME", "DB_NAME"),
    )

    # JWT
    jwt_secret_key: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 h

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @model_validator(mode="after")
    def validate_production_security(self):
        env = (self.environment or "").strip().lower()
        if env != "production":
            return self

        origins = [origin.lower() for origin in self.allowed_origins_list if origin]
        if not origins:
            raise ValueError("ALLOWED_ORIGINS must be set when environment=production")

        if any("localhost" in origin or "127.0.0.1" in origin for origin in origins):
            raise ValueError(
                "ALLOWED_ORIGINS cannot contain localhost origins when environment=production"
            )

        mongo_uri = (self.mongo_uri or "").strip()
        if not mongo_uri or mongo_uri == "mongodb://localhost:27017":
            raise ValueError("MONGO_URI must be set to a production database URI when environment=production")

        mongo_uri_lower = mongo_uri.lower()
        if "localhost" in mongo_uri_lower or "127.0.0.1" in mongo_uri_lower:
            raise ValueError("MONGO_URI cannot point to localhost when environment=production")

        return self

    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
