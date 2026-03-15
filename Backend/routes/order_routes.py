# routes/order_routes.py - REST endpoints for orders

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas.order_schema import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
from services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


# NOTE: /stats/summary must be declared BEFORE /{order_id}
# otherwise FastAPI will match the string "stats" as an order_id

@router.get("/stats/summary")
def get_order_stats(
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Aggregate KPI stats calculated from real orders."""
    return order_service.get_order_stats(db, date_filter)


@router.get("", response_model=OrderListResponse)
def list_orders(
    page:        int = Query(default=1,  ge=1),
    limit:       int = Query(default=10, ge=1, le=100),
    status:      str = Query(default=""),
    date_filter: str = Query(default="all"),
    db: Session = Depends(get_db),
):
    """Get paginated list of orders with optional filters."""
    orders, total, total_pages = order_service.get_all_orders(
        db, page, limit, status, date_filter
    )
    return {
        "orders":      orders,
        "total":       total,
        "page":        page,
        "total_pages": total_pages,
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a single order by ID."""
    order = order_service.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order."""
    return order_service.create_order(db, order_data)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id:   str,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing order."""
    updated = order_service.update_order(db, order_id, order_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    """Delete an order by ID."""
    deleted = order_service.delete_order(db, order_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Order not found")