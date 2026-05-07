from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Optional, List
from ..models.building import (
    HistoricPreservationBuilding,
    ShanghaiHistoryBuilding,
    ShanghaiBuildingLink,
    HistoryPhotography,
    BuildingPhotography,
    HistoryMap
)


def get_building_list(
    db: Session,
    page: int = 1,
    size: int = 100,
    preservationCategory: Optional[str] = None,
    batch: Optional[str] = None
) -> tuple[List[dict], int]:
    query = db.query(HistoricPreservationBuilding)
    
    if preservationCategory:
        query = query.filter(HistoricPreservationBuilding.PRESERVATION_CATEGORY == preservationCategory)
    if batch:
        query = query.filter(HistoricPreservationBuilding.BATCH == batch)
    
    total = query.count()
    offset = (page - 1) * size
    buildings = query.offset(offset).limit(size).all()
    
    result = []
    for b in buildings:
        result.append({
            "buildingId": b.BUILDING_ID,
            "currentName": b.CURRENT_NAME,
            "originalName": b.ORIGINAL_NAME,
            "address": b.ADDRESS,
            "preservationCategory": b.PRESERVATION_CATEGORY,
            "batch": b.BATCH,
            "constructionYear": b.CONSTRUCTION_YEAR,
            "imagePath": b.IMAGE_PATH,
            "latitude": float(b.LATITUDE) if b.LATITUDE else None,
            "longitude": float(b.LONGITUDE) if b.LONGITUDE else None
        })
    
    return result, total


def get_building_photos(db: Session, preservation_id: int) -> List[dict]:
    link = db.query(ShanghaiBuildingLink).filter(
        ShanghaiBuildingLink.PRESERVATION_ID == preservation_id
    ).first()
    
    if not link:
        return []
    
    photos = db.query(HistoryPhotography).join(
        BuildingPhotography,
        HistoryPhotography.ID == BuildingPhotography.PHOTOGRAPHY_ID
    ).filter(
        BuildingPhotography.BUILDING_ID == link.BUILDING_ID
    ).all()
    
    return [
        {"photographyId": p.ID, "imageFilename": p.IMAGE_FILENAME}
        for p in photos
    ]


def get_building_detail(db: Session, building_id: int) -> Optional[dict]:
    building = db.query(HistoricPreservationBuilding).filter(
        HistoricPreservationBuilding.BUILDING_ID == building_id
    ).first()
    
    if not building:
        return None
    
    photos = get_building_photos(db, building_id)
    
    return {
        "buildingId": building.BUILDING_ID,
        "currentName": building.CURRENT_NAME,
        "originalName": building.ORIGINAL_NAME,
        "address": building.ADDRESS,
        "structureType": building.STRUCTURE_TYPE,
        "constructionYear": building.CONSTRUCTION_YEAR,
        "preservationCategory": building.PRESERVATION_CATEGORY,
        "preservationRequirements": building.PRESERVATION_REQUIREMENTS,
        "imagePath": building.IMAGE_PATH,
        "latitude": float(building.LATITUDE) if building.LATITUDE else None,
        "longitude": float(building.LONGITUDE) if building.LONGITUDE else None,
        "batch": building.BATCH,
        "photos": photos
    }


def get_map_list(
    db: Session,
    page: int = 1,
    size: int = 100,
    mapType: Optional[str] = None,
    subtype: Optional[str] = None,
    tags: Optional[str] = None,
    series: Optional[str] = None,
    clarity: Optional[str] = None,
    importance: Optional[str] = None,
    usageSuggestions: Optional[str] = None,
    source: Optional[str] = None,
    year: Optional[str] = None
) -> tuple[List[dict], int, dict]:
    query = db.query(HistoryMap)
    
    if mapType:
        query = query.filter(HistoryMap.MAP_TYPE == mapType)
    if subtype:
        query = query.filter(HistoryMap.SUBTYPE == subtype)
    if tags:
        query = query.filter(HistoryMap.TAGS == tags)
    if series:
        query = query.filter(HistoryMap.SERIES == series)
    if clarity:
        query = query.filter(HistoryMap.CLARITY == clarity)
    if importance:
        query = query.filter(HistoryMap.IMPORTANCE == importance)
    if usageSuggestions:
        query = query.filter(HistoryMap.USAGE_SUGGESTIONS == usageSuggestions)
    if source:
        query = query.filter(HistoryMap.SOURCE == source)
    if year:
        query = query.filter(HistoryMap.YEAR == year)
    
    total = query.count()
    offset = (page - 1) * size
    maps = query.offset(offset).limit(size).all()
    
    result = []
    for m in maps:
        result.append({
            "mapId": m.ID,
            "title": m.TITLE,
            "chineseName": m.CHINESE_NAME,
            "foreignName": m.FOREIGN_NAME,
            "year": m.YEAR,
            "era": m.ERA,
            "mapType": m.MAP_TYPE,
            "imageFilename": m.IMAGE_FILENAME
        })
    
    unique_values = {
        "mapType": _get_unique_values(db, HistoryMap.MAP_TYPE),
        "subtype": _get_unique_values(db, HistoryMap.SUBTYPE),
        "tags": _get_unique_values(db, HistoryMap.TAGS),
        "series": _get_unique_values(db, HistoryMap.SERIES),
        "clarity": _get_unique_values(db, HistoryMap.CLARITY),
        "importance": _get_unique_values(db, HistoryMap.IMPORTANCE),
        "usageSuggestions": _get_unique_values(db, HistoryMap.USAGE_SUGGESTIONS),
        "source": _get_unique_values(db, HistoryMap.SOURCE),
        "year": _get_unique_values(db, HistoryMap.YEAR)
    }
    
    return result, total, unique_values


def _get_unique_values(db: Session, column) -> List[str]:
    results = db.query(distinct(column)).filter(column.isnot(None)).all()
    return [r[0] for r in results if r[0]]


def get_map_detail(db: Session, map_id: int) -> Optional[dict]:
    m = db.query(HistoryMap).filter(HistoryMap.ID == map_id).first()
    
    if not m:
        return None
    
    return {
        "mapId": m.ID,
        "fileNumber": m.FILE_NUMBER,
        "title": m.TITLE,
        "chineseName": m.CHINESE_NAME,
        "foreignName": m.FOREIGN_NAME,
        "year": m.YEAR,
        "era": m.ERA,
        "pinyin": m.PINYIN,
        "imageFilename": m.IMAGE_FILENAME,
        "videoAvailable": m.VIDEO_AVAILABLE,
        "mapType": m.MAP_TYPE,
        "subtype": m.SUBTYPE,
        "tags": m.TAGS,
        "series": m.SERIES,
        "clarity": m.CLARITY,
        "importance": m.IMPORTANCE,
        "usageSuggestions": m.USAGE_SUGGESTIONS,
        "source": m.SOURCE
    }
