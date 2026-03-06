from src.core.security import create_access_token


class AuthService:
    @staticmethod
    def login(email: str, password: str) -> str:
        if not email or not password:
            raise ValueError("Invalid credentials")
        return create_access_token(subject=email)