from fastapi import APIRouter
from app.api.v1 import buildings, maps
api_router = APIRouter()
api_router.include_router(buildings.router)
api_router.include_router(maps.router)