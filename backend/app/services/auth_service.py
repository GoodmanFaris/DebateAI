from datetime import datetime
from fastapi import HTTPException, status
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from sqlmodel import Session, select
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.profile import Profile
from app.models.user_stats import UserStats
from app.schemas.auth import UserRegister, UserLogin, GoogleAuthRequest, TokenResponse, CurrentUserResponse


def register(data: UserRegister, session: Session) -> TokenResponse:
    if session.exec(select(User).where(User.email == data.email)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    if session.exec(select(Profile).where(Profile.username == data.username)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
    )
    session.add(user)
    session.flush()

    profile = Profile(
        user_id=user.id,
        display_name=data.display_name,
        username=data.username,
    )
    stats = UserStats(user_id=user.id)

    session.add(profile)
    session.add(stats)
    session.commit()

    return TokenResponse(access_token=create_access_token(user.id))


def login(data: UserLogin, session: Session) -> TokenResponse:
    user = session.exec(select(User).where(User.email == data.email)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google sign-in",
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user.last_login_at = datetime.utcnow()
    session.add(user)
    session.commit()

    return TokenResponse(access_token=create_access_token(user.id))


def _verify_google_token(token: str) -> dict:
    try:
        return google_id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )


def _generate_username(email: str, session: Session) -> str:
    base = email.split("@")[0]
    username = base
    counter = 1
    while session.exec(select(Profile).where(Profile.username == username)).first():
        username = f"{base}{counter}"
        counter += 1
    return username


def google_login(data: GoogleAuthRequest, session: Session) -> TokenResponse:
    token_data = _verify_google_token(data.id_token)
    google_id = token_data["sub"]
    email = token_data["email"]
    name = token_data.get("name", email.split("@")[0])
    picture = token_data.get("picture")

    user = session.exec(
        select(User).where(User.google_id == google_id)
    ).first()

    if user:
        user.last_login_at = datetime.utcnow()
        session.commit()
        return TokenResponse(access_token=create_access_token(user.id))

    user = session.exec(
        select(User).where(User.email == email)
    ).first()

    if user:
        user.google_id = google_id
        if user.auth_provider == "email":
            user.auth_provider = "email+google"
        user.last_login_at = datetime.utcnow()
        session.commit()
        return TokenResponse(access_token=create_access_token(user.id))

    user = User(
        email=email,
        auth_provider="google",
        google_id=google_id,
        is_verified=True,
        last_login_at=datetime.utcnow(),
    )
    session.add(user)
    session.flush()

    username = _generate_username(email, session)
    profile = Profile(
        user_id=user.id,
        display_name=name,
        username=username,
        avatar_url=picture,
    )
    stats = UserStats(user_id=user.id)

    session.add(profile)
    session.add(stats)
    session.commit()

    return TokenResponse(access_token=create_access_token(user.id))


def get_current_user_response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        auth_provider=user.auth_provider,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_premium=user.is_premium,
    )
