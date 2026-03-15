# utils/filters.py - date filter helpers used by services

from datetime import datetime, timedelta, timezone


def get_date_range(filter_value: str):
    """
    Takes the filter string from the frontend and returns
    a (start_date, end_date) tuple. Returns (None, None) for 'all'.
    """
    now = datetime.now(timezone.utc)

    if filter_value == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, now

    if filter_value == "7d":
        return now - timedelta(days=7), now

    if filter_value == "30d":
        return now - timedelta(days=30), now

    if filter_value == "90d":
        return now - timedelta(days=90), now

    # "all" or anything else - no filter
    return None, None