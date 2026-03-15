# schemas/order_schema.py

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


class OrderCreate(BaseModel):

    # Customer info
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str

    # Order info
    product: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str = "Pending"
    created_by: str

    @field_validator("quantity")
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("unit_price", "total_amount")
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("status")
    def status_must_be_valid(cls, v):
        allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class OrderUpdate(BaseModel):

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    product: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    created_by: Optional[str] = None


class OrderResponse(BaseModel):

    id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    product: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    created_by: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):

    orders: List[OrderResponse]
    total: int
    page: int
    total_pages: int