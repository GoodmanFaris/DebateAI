from datetime import datetime
from sqlmodel import Session
from app.models.user import User
from app.schemas.billing import VerifyPurchaseRequest


def verify_purchase(request: VerifyPurchaseRequest, user: User, session: Session) -> None:
    # MVP: trust the purchase token from Google Play.
    # Full server-side verification with Google Play Developer API can be added here later.
    user.is_premium = True
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
