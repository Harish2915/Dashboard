# services/order_service.py - all database logic for orders

import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.order_model import Order
from schemas.order_schema import OrderCreate, OrderUpdate
from utils.filters import get_date_range


def generate_order_id():
    """Generate a readable order ID like ORD-17234956"""
    import time
    return f"ORD-{int(time.time() * 1000) % 100000000}"


def get_all_orders(db: Session, page: int, limit: int, status: str, date_filter: str):
    """Get paginated orders with optional status and date filters."""
    query = db.query(Order)

    # Filter by status
    if status and status != "All":
        query = query.filter(Order.status == status)

    # Filter by date range
    start_date, end_date = get_date_range(date_filter)
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    total = query.count()

    # Newest first
    orders = (
        query
        .order_by(Order.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    total_pages = max(1, -(-total // limit))  # ceiling division

    return orders, total, total_pages


def get_order_by_id(db: Session, order_id: int):
    """Get a single order by ID."""
    return db.query(Order).filter(Order.id == order_id).first()


def create_order(db: Session, order_data: OrderCreate):
    """Insert a new order into the database."""
    new_order = Order(
        id           = generate_order_id(),
        first_name   = order_data.first_name,
        last_name    = order_data.last_name,
        email        = order_data.email,
        phone        = order_data.phone,
        street       = order_data.street,
        city         = order_data.city,
        state        = order_data.state,
        postal_code  = order_data.postal_code,
        country      = order_data.country,
        product      = order_data.product,
        quantity     = order_data.quantity,
        unit_price   = order_data.unit_price,
        total_amount = order_data.total_amount,
        status       = order_data.status,
        created_by   = order_data.created_by,
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


def update_order(db: Session, order_id: int, order_data: OrderUpdate):
    """Update an existing order. Only changes fields that were provided."""
    order = get_order_by_id(db, order_id)
    if not order:
        return None

    # Only update fields that were actually sent
    update_data = order_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)

    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, order_id: int):
    """Delete an order by ID. Returns True if deleted, False if not found."""
    order = get_order_by_id(db, order_id)
    if not order:
        return False
    db.delete(order)
    db.commit()
    return True


def get_order_stats(db: Session, date_filter: str):
    """Aggregate stats used for the KPI widgets."""
    query = db.query(Order)

    start_date, end_date = get_date_range(date_filter)
    if start_date:
        query = query.filter(Order.created_at >= start_date)

    total_orders  = query.count()
    total_revenue = query.with_entities(func.sum(Order.total_amount)).scalar() or 0
    avg_order_val = query.with_entities(func.avg(Order.total_amount)).scalar() or 0

    # Unique customers by email
    unique_customers = query.with_entities(Order.email).distinct().count()

    return {
        "total_orders":       total_orders,
        "total_revenue":      round(float(total_revenue), 2),
        "avg_order_value":    round(float(avg_order_val), 2),
        "unique_customers":   unique_customers,
    }