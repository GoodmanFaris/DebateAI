from sqlmodel import SQLModel


class VerifyPurchaseRequest(SQLModel):
    product_id: str
    purchase_token: str
    platform: str


class VerifyPurchaseResponse(SQLModel):
    success: bool
    is_premium: bool
