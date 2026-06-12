from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])
HEALTH_OK_MESSAGE = "Cartotrac API is running"


@router.get("")
async def healthcheck() -> dict[str, str]:
    return {"message": HEALTH_OK_MESSAGE}
