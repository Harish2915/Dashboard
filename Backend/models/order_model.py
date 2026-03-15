# models/order_model.py - Order database table

from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.sql import func
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id          = Column(String(50),  primary_key=True, index=True)

    # Customer info
    first_name  = Column(String(100), nullable=False)
    last_name   = Column(String(100), nullable=False)
    email       = Column(String(255), nullable=False, index=True)
    phone       = Column(String(30),  nullable=False)
    street      = Column(String(255), nullable=False)
    city        = Column(String(100), nullable=False)
    state       = Column(String(100), nullable=False)
    postal_code = Column(String(20),  nullable=False)
    country     = Column(String(100), nullable=False)

    # Order info
    product      = Column(String(255), nullable=False)
    quantity     = Column(Integer,     nullable=False)
    unit_price   = Column(Float,       nullable=False)
    total_amount = Column(Float,       nullable=False)
    status       = Column(String(50),  nullable=False, default="Pending")
    created_by   = Column(String(100), nullable=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())