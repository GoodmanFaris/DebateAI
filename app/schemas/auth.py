from sqlmodel import SQLModel


class UserRegister(SQLModel):
    email: str
    password: str
    display_name: str
    username: str


class UserLogin(SQLModel):
    email: str
    password: str


class GoogleAuthRequest(SQLModel):
    id_token: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(SQLModel):
    id: int
    email: str
    auth_provider: str
    is_active: bool
    is_verified: bool
    is_premium: bool
