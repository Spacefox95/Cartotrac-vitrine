from fastapi import APIRouter

from src.domains.auth.router import router as auth_router
from src.domains.clients.router import router as clients_router
from src.domains.health.router import router as health_router
from src.domains.quotes.router import router as quotes_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(clients_router)
api_router.include_router(quotes_router)
