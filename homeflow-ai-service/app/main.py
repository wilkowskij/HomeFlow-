from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.routers import recommendations, search, insights
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("HomeFlow AI Service starting up...")
    yield
    logger.info("HomeFlow AI Service shutting down...")


app = FastAPI(
    title="HomeFlow AI Service",
    description="AI-powered recommendations, search NLP, and property insights for HomeFlow",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "homeflow-ai-service", "version": "1.0.0"}
