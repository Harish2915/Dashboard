# schemas/widget_schema.py

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WidgetItem(BaseModel):

    id: str
    type: str      # kpi | bar | line | pie | area | scatter | table
    title: str

    x: int = 0
    y: int = 0
    w: int = 6
    h: int = 4


class SaveLayoutRequest(BaseModel):

    name: str = "default"
    widgets: List[WidgetItem]


class LayoutResponse(BaseModel):

    id: int
    name: str
    widgets: List[WidgetItem]
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── KPI Schemas ─────────────────────────────────────

class KPIMetric(BaseModel):
    value: float
    change: float
    trend: str


class KPIsResponse(BaseModel):
    revenue: KPIMetric
    orders: KPIMetric
    customers: KPIMetric
    aov: KPIMetric


# ── Chart Schemas ───────────────────────────────────

class SalesDataPoint(BaseModel):
    month: str
    revenue: float
    target: float


class TrendDataPoint(BaseModel):
    month: str
    revenue: float
    forecast: float


class CategoryDataPoint(BaseModel):
    name: str
    value: float
    color: str


class TrafficDataPoint(BaseModel):
    month: str
    new: int
    returning: int


class ScatterDataPoint(BaseModel):
    x: float
    y: float
    z: float