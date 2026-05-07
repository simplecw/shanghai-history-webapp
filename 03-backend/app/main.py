from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .api.v1.buildings import router as buildings_router

app = FastAPI(title="Shanghai History API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(buildings_router, prefix=config.API_V1_PREFIX, tags=["buildings"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
