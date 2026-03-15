# database.py - SQLAlchemy setup for MySQL

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

# MySQL engine via PyMySQL driver
# pool_pre_ping=True reconnects automatically if the MySQL connection drops
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models inherit from this
Base = declarative_base()


def get_db():
    """Dependency - yields a DB session then closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()