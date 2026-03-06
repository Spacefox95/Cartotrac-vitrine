from fastapi import APIRouter

from src.domains.auth.router import router as auth_router
from src.domains.health.router import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)