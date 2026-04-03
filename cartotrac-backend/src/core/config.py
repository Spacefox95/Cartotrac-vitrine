from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'Cartotrac API'
    app_env: str = 'development'
    app_debug: bool = True

    api_v1_prefix: str = '/api/v1'
    cors_origins: list[str] = [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ]

    db_host: str = '127.0.0.1'
    db_port: int = 5432
    db_name: str = 'cartotrac'
    db_user: str = 'cartotrac'
    db_password: str = 'cartotrac'

    secret_key: str = 'change-me'
    access_token_expire_minutes: int = 60
    quote_validity_days: int = 30
    quote_pdf_company_name: str = 'Cartotrac'
    quote_pdf_company_address: str = 'Cartotrac, France'
    quote_pdf_company_email: str = 'contact@cartotrac.fr'
    quote_pdf_company_phone: str = '+33 1 00 00 00 00'

    model_config = SettingsConfigDict(
        env_file='.env',
        case_sensitive=False,
        extra='ignore',
    )

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(',') if origin.strip()]
        return value

    @property
    def database_url(self) -> str:
        return (
            f'postgresql+psycopg://{self.db_user}:{self.db_password}'
            f'@{self.db_host}:{self.db_port}/{self.db_name}'
        )


settings = Settings()
