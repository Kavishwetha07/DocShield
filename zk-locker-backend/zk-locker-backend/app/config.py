from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./zk_locker_dev.db"
    secret_key: str = "dev-only-change-me"
    access_token_expire_minutes: int = 60
    allowed_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="", case_sensitive=False)

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
