from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...database import get_db
from ...schemas.building import BuildingListResponse, BuildingDetailResponse, MapListResponse, MapDetailResponse
from ...services import building_service

router = APIRouter()


@router.get("/buildings", response_model=BuildingListResponse)
async def get_buildings(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
    preservationCategory: Optional[str] = None,
    batch: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取建筑列表"""
    buildings, total = building_service.get_building_list(
        db, page, size, preservationCategory, batch
    )
    return {
        "code": 0,
        "message": "success",
        "data": {
            "list": buildings,
            "total": total
        }
    }


@router.get("/buildings/{building_id}", response_model=BuildingDetailResponse)
async def get_building(
    building_id: int,
    db: Session = Depends(get_db)
):
    """获取建筑详情"""
    detail = building_service.get_building_detail(db, building_id)
    if not detail:
        return {
            "code": 1002,
            "message": "建筑不存在",
            "data": None
        }
    return {
        "code": 0,
        "message": "success",
        "data": detail
    }


@router.get("/maps", response_model=MapListResponse)
async def get_maps(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
    mapType: Optional[str] = None,
    subtype: Optional[str] = None,
    tags: Optional[str] = None,
    series: Optional[str] = None,
    clarity: Optional[str] = None,
    importance: Optional[str] = None,
    usageSuggestions: Optional[str] = None,
    source: Optional[str] = None,
    year: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取历史地图列表"""
    maps, total, unique_values = building_service.get_map_list(
        db, page, size, mapType, subtype, tags, series,
        clarity, importance, usageSuggestions, source, year
    )
    return {
        "code": 0,
        "message": "success",
        "data": {
            "list": maps,
            "total": total,
            "uniqueValues": unique_values
        }
    }


@router.get("/maps/{map_id}", response_model=MapDetailResponse)
async def get_map(
    map_id: int,
    db: Session = Depends(get_db)
):
    """获取地图详情"""
    detail = building_service.get_map_detail(db, map_id)
    if not detail:
        return {
            "code": 1002,
            "message": "地图不存在",
            "data": None
        }
    return {
        "code": 0,
        "message": "success",
        "data": detail
    }