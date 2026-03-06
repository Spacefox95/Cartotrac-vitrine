from fastapi import FastAPI

from src.api.router import api_router
from src.core.config import settings
from src.core.lifespan import lifespan

app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

app.include_router(api_router, prefix=settings.api_v1_prefix)