from fastapi import APIRouter

from src.common.responses.messages import HEALTH_OK_MESSAGE

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def healthcheck() -> dict[str, str]:
    return {"message": HEALTH_OK_MESSAGE}