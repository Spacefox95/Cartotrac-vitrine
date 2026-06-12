from fastapi import APIRouter

from src.api.routes.auth import router as auth_router
from src.api.routes.carto import router as carto_router
from src.api.routes.clients import router as clients_router
from src.api.routes.dashboard import router as dashboard_router
from src.api.routes.health import router as health_router
from src.api.routes.quote_requests import router as quote_requests_router
from src.api.routes.quotes import router as quotes_router
from src.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(carto_router)
api_router.include_router(clients_router)
api_router.include_router(quote_requests_router)
api_router.include_router(quotes_router)
api_router.include_router(users_router)
