# models/dashboard_model.py - stores saved dashboard widget layouts

from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.sql import func
from database import Base


class DashboardLayout(Base):
    __tablename__ = "dashboard_layouts"

    id         = Column(Integer,      primary_key=True, autoincrement=True)
    name       = Column(String(100),  nullable=False, default="default", unique=True)

    # Stores the full widgets array as JSON
    # e.g. [{"id": "kpi-revenue", "type": "kpi", "x": 0, "y": 0, "w": 3, "h": 2}]
    widgets    = Column(JSON, nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())