from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.billing import VerifyPurchaseRequest, VerifyPurchaseResponse
from app.services import billing_service

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/verify", response_model=VerifyPurchaseResponse)
def verify_purchase(
    data: VerifyPurchaseRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    billing_service.verify_purchase(data, user, session)
    return VerifyPurchaseResponse(success=True, is_premium=True)
