# routes/dashboard_routes.py - endpoints for widgets and layout

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas.widget_schema import SaveLayoutRequest, LayoutResponse
from services import widget_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ── Chart data endpoints ──────────────────────────────────────────────────────

@router.get("/kpis")
def get_kpis(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """KPI cards: revenue, orders, customers, avg order value."""
    return widget_service.get_kpis(db, date_filter)


@router.get("/sales")
def get_sales(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Monthly sales data for bar chart."""
    return widget_service.get_sales_data(db, date_filter)


@router.get("/trend")
def get_trend(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Revenue trend + forecast for line chart."""
    return widget_service.get_revenue_trend(db, date_filter)


@router.get("/categories")
def get_categories(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Revenue by category for pie chart."""
    return widget_service.get_category_data(db, date_filter)


@router.get("/traffic")
def get_traffic(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """New vs returning customers for area chart."""
    return widget_service.get_traffic_data(db, date_filter)


@router.get("/scatter")
def get_scatter(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Order quantity vs revenue for scatter plot."""
    return widget_service.get_scatter_data(db, date_filter)


# ── Layout endpoints ──────────────────────────────────────────────────────────

@router.post("/layout", response_model=LayoutResponse)
def save_layout(
    layout_data: SaveLayoutRequest,
    db: Session = Depends(get_db),
):
    """Save the current dashboard widget layout."""
    return widget_service.save_layout(db, layout_data)


@router.get("/layout", response_model=LayoutResponse)
def get_layout(
    name: str = Query(default="default"),
    db: Session = Depends(get_db),
):
    """Load a saved dashboard layout."""
    layout = widget_service.get_layout(db, name)
    if not layout:
        raise HTTPException(status_code=404, detail="No saved layout found")
    return layout