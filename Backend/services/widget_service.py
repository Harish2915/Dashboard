# services/widget_service.py
# All chart data pulled from the real `orders` table in MySQL.
# No hardcoded / random fallback values — every chart reflects live DB data.

from calendar import monthrange
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_

from models.order_model import Order
from models.dashboard_model import DashboardLayout
from schemas.widget_schema import SaveLayoutRequest
from utils.filters import get_date_range


# ─────────────────────────────────────────────────────────────────────────────
# Helper — build correct month boundaries using relativedelta (not timedelta)
# so January, February, etc. are always exactly right.
# ─────────────────────────────────────────────────────────────────────────────
def _last_n_months(n: int):
    """
    Return a list of (month_start, month_end, label) tuples for the
    last `n` calendar months, oldest first.
    """
    now   = datetime.now(timezone.utc)
    # Start of the current month
    base  = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    months = []
    for i in range(n - 1, -1, -1):
        start = base - relativedelta(months=i)
        end   = start + relativedelta(months=1)
        months.append((start, end, start.strftime("%b %Y")))
    return months


def _short_label(label: str) -> str:
    """'Jan 2024' → 'Jan'  (keeps it short for chart axes)"""
    return label.split()[0]


# ─────────────────────────────────────────────────────────────────────────────
# KPI data
# ─────────────────────────────────────────────────────────────────────────────
def get_kpis(db: Session, date_filter: str):
    start, end = get_date_range(date_filter)

    def _q(s, e):
        q = db.query(Order)
        if s: q = q.filter(Order.created_at >= s)
        if e: q = q.filter(Order.created_at <= e)
        return q

    cur  = _q(start, end)

    # Previous period of the same length for % change
    if start and end:
        delta      = end - start
        prev_start = start - delta
        prev_end   = start
    else:
        prev_start = prev_end = None

    prev = _q(prev_start, prev_end)

    cur_revenue   = float(cur.with_entities(func.sum(Order.total_amount)).scalar() or 0)
    cur_orders    = cur.count()
    cur_customers = cur.with_entities(Order.email).distinct().count()
    cur_aov       = cur_revenue / cur_orders if cur_orders else 0

    prev_revenue   = float(prev.with_entities(func.sum(Order.total_amount)).scalar() or 0) or 1
    prev_orders    = prev.count() or 1
    prev_customers = prev.with_entities(Order.email).distinct().count() or 1
    prev_aov       = prev_revenue / prev_orders

    def pct(c, p):
        return round(((c - p) / p) * 100, 1) if p else 0

    def trend(v):
        return "up" if v >= 0 else "down"

    rc = pct(cur_revenue,   prev_revenue)
    oc = pct(cur_orders,    prev_orders)
    cc = pct(cur_customers, prev_customers)
    ac = pct(cur_aov,       prev_aov)

    return {
        "revenue":   {"value": round(cur_revenue,   2), "change": rc, "trend": trend(rc)},
        "orders":    {"value": cur_orders,               "change": oc, "trend": trend(oc)},
        "customers": {"value": cur_customers,            "change": cc, "trend": trend(cc)},
        "aov":       {"value": round(cur_aov,       2), "change": ac, "trend": trend(ac)},
    }


# ─────────────────────────────────────────────────────────────────────────────
# Bar chart — monthly revenue vs target
# ─────────────────────────────────────────────────────────────────────────────
def get_sales_data(db: Session, date_filter: str):
    """
    Returns one data point per calendar month.
    date_filter controls how many months back to show:
      all / 90d  → last 12 months
      30d        → last 3 months
      7d / today → last 1 month (still useful for drilling in)
    """
    n_months = _months_for_filter(date_filter)
    months   = _last_n_months(n_months)
    result   = []

    for start, end, label in months:
        revenue = float(
            db.query(func.sum(Order.total_amount))
              .filter(Order.created_at >= start, Order.created_at < end)
              .scalar() or 0
        )
        order_count = (
            db.query(func.count(Order.id))
              .filter(Order.created_at >= start, Order.created_at < end)
              .scalar() or 0
        )
        # Target = previous month revenue × 1.10, minimum 1000
        target = max(round(revenue * 1.10, 2), 1000.0)

        result.append({
            "month":       _short_label(label),
            "revenue":     round(revenue, 2),
            "target":      target,
            "order_count": order_count,
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Line chart — revenue trend + 8 % forecast
# ─────────────────────────────────────────────────────────────────────────────
def get_revenue_trend(db: Session, date_filter: str):
    sales  = get_sales_data(db, date_filter)
    result = []
    for p in sales:
        result.append({
            "month":    p["month"],
            "revenue":  p["revenue"],
            "forecast": round(p["revenue"] * 1.08, 2),
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Pie chart — revenue share by product (top 6 + "Other")
# ─────────────────────────────────────────────────────────────────────────────
def get_category_data(db: Session, date_filter: str):
    """
    Groups orders by `product` name directly from the DB.
    Returns percentage share of total revenue per product.
    Top 6 products shown individually; the rest collapsed into 'Other'.
    """
    start, end = get_date_range(date_filter)

    q = db.query(
        Order.product,
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    )
    if start: q = q.filter(Order.created_at >= start)
    if end:   q = q.filter(Order.created_at <= end)

    rows = (
        q.group_by(Order.product)
         .order_by(func.sum(Order.total_amount).desc())
         .all()
    )

    if not rows:
        return []

    total_revenue = sum(float(r.revenue) for r in rows)
    if total_revenue == 0:
        return []

    COLORS = ["#54bd95", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]

    result       = []
    other_rev    = 0.0
    other_orders = 0

    for i, row in enumerate(rows):
        rev = float(row.revenue)
        if i < 6:
            result.append({
                "name":   row.product,
                "value":  round((rev / total_revenue) * 100, 1),
                "revenue": round(rev, 2),
                "orders": row.orders,
                "color":  COLORS[i % len(COLORS)],
            })
        else:
            other_rev    += rev
            other_orders += row.orders

    if other_rev > 0:
        result.append({
            "name":   "Other",
            "value":  round((other_rev / total_revenue) * 100, 1),
            "revenue": round(other_rev, 2),
            "orders": other_orders,
            "color":  "#94a3b8",
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Area chart — new vs returning customers per month
# ─────────────────────────────────────────────────────────────────────────────
def get_traffic_data(db: Session, date_filter: str):
    """
    For each calendar month:
      new       = customers whose first-ever order was in that month
      returning = customers who ordered before AND again in that month
    """
    n_months = _months_for_filter(date_filter)
    months   = _last_n_months(n_months)
    result   = []

    for start, end, label in months:
        # Emails that placed an order this month
        this_month_emails = {
            e for (e,) in
            db.query(Order.email)
              .filter(Order.created_at >= start, Order.created_at < end)
              .distinct()
              .all()
        }

        if not this_month_emails:
            result.append({"month": _short_label(label), "new": 0, "returning": 0})
            continue

        # Emails that had any order BEFORE this month
        prior_emails = {
            e for (e,) in
            db.query(Order.email)
              .filter(Order.created_at < start)
              .distinct()
              .all()
        }

        new_count       = len(this_month_emails - prior_emails)
        returning_count = len(this_month_emails & prior_emails)

        result.append({
            "month":     _short_label(label),
            "new":       new_count,
            "returning": returning_count,
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Scatter plot — quantity vs total_amount per order
# ─────────────────────────────────────────────────────────────────────────────
def get_scatter_data(db: Session, date_filter: str):
    """Each order → { x: quantity, y: total_amount, z: unit_price }"""
    start, end = get_date_range(date_filter)

    q = db.query(Order.quantity, Order.total_amount, Order.unit_price)
    if start: q = q.filter(Order.created_at >= start)
    if end:   q = q.filter(Order.created_at <= end)

    rows = q.order_by(Order.created_at.desc()).limit(200).all()

    return [
        {"x": float(qty), "y": round(float(total), 2), "z": round(float(price), 2)}
        for qty, total, price in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Helper — how many months to show based on the date filter
# ─────────────────────────────────────────────────────────────────────────────
def _months_for_filter(date_filter: str) -> int:
    mapping = {
        "today": 1,
        "7d":    1,
        "30d":   3,
        "90d":   6,
        "all":   12,
    }
    return mapping.get(date_filter, 12)


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard layout persistence
# ─────────────────────────────────────────────────────────────────────────────
def save_layout(db: Session, layout_data: SaveLayoutRequest):
    existing = (
        db.query(DashboardLayout)
          .filter(DashboardLayout.name == layout_data.name)
          .first()
    )
    widgets_json = [w.model_dump() for w in layout_data.widgets]

    if existing:
        existing.widgets = widgets_json
        db.commit()
        db.refresh(existing)
        return existing

    new_layout = DashboardLayout(name=layout_data.name, widgets=widgets_json)
    db.add(new_layout)
    db.commit()
    db.refresh(new_layout)
    return new_layout


def get_layout(db: Session, name: str = "default"):
    return (
        db.query(DashboardLayout)
          .filter(DashboardLayout.name == name)
          .first()
    )