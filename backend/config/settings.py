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
        validation_alias=AliasChoices("DB_NAME", "MONGO_DB_NAME"),
    )

    # JWT
    jwt_secret_key: str = Field(
        default="dev_only_change_me_jwt_secret_key_please",
        min_length=32,
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 h

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.environment.lower() == "production":
            if self.debug:
                raise ValueError("DEBUG must be False in production")
            if self.jwt_secret_key == "dev_only_change_me_jwt_secret_key_please":
                raise ValueError("JWT_SECRET_KEY must be explicitly set in production")
            localhost_origins = [o for o in self.allowed_origins_list if "localhost" in o or "127.0.0.1" in o]
            if localhost_origins:
                raise ValueError("ALLOWED_ORIGINS cannot include localhost in production")
        return self

    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
