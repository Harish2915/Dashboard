# main.py - FastAPI app entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from routes.order_routes import router as order_router
from routes.dashboard_routes import router as dashboard_router

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc UI
)

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(order_router,    prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}