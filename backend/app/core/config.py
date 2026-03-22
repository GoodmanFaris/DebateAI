from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str = ""
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    GOOGLE_CLIENT_ID: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
