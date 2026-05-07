from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, text
from typing import Optional, List
from ..models.building import (
    HistoricPreservationBuilding,
    ShanghaiHistoryBuilding,
    ShanghaiBuildingLink,
    HistoryPhotography,
    BuildingPhotography,
    ShanghaiHistoryBuildingType,
    ShanghaiHistoryPhotographyType,
    ShanghaiHistoryPhotographyTag,
    HistoryMap
)
from ..database import get_db


# ============ Original Building/Map Functions ============

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


# ============ Historical Building Functions ============

def get_historical_buildings(
    page: int = 1,
    size: int = 50,
    name: Optional[str] = None,
    address: Optional[str] = None,
    building_type: Optional[str] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    has_photos: Optional[bool] = None,
) -> dict:
    db = next(get_db())
    try:
        query = db.query(ShanghaiHistoryBuilding)
        
        if name:
            query = query.filter(
                ShanghaiHistoryBuilding.BUILDING_NAME.ilike(f"%{name}%") |
                ShanghaiHistoryBuilding.BUILDING_CHINESE_NAME.ilike(f"%{name}%")
            )
        if address:
            query = query.filter(ShanghaiHistoryBuilding.BUILDING_ADDRESS.ilike(f"%{address}%"))
        if date_start:
            query = query.filter(ShanghaiHistoryBuilding.DATE_START >= date_start)
        if date_end:
            query = query.filter(ShanghaiHistoryBuilding.DATE_END <= date_end)
        
        if has_photos is True:
            subq = db.query(BuildingPhotography.BUILDING_ID).distinct()
            query = query.filter(ShanghaiHistoryBuilding.BUILDING_ID.in_(subq))
        elif has_photos is False:
            subq = db.query(BuildingPhotography.BUILDING_ID).distinct()
            query = query.filter(~ShanghaiHistoryBuilding.BUILDING_ID.in_(subq))
        
        if building_type:
            type_subq = db.query(ShanghaiHistoryBuildingType.BUILDING_ID).join(
                func.json_value(text("'[]'"), "x"),  # Dummy join to access code table
                text("CODE_LOOKUP.CODE_TYPE = Shanghai_history_building_type.CODE_TYPE COLLATE utf8mb4_unicode_ci AND CODE_LOOKUP.CODE_VALUE = Shanghai_history_building_type.CODE_VALUE COLLATE utf8mb4_unicode_ci")
            ).filter(
                ShanghaiHistoryBuildingType.CODE_VALUE == building_type
            ).scalar_subquery()
            # Simplified: just filter by CODE_VALUE directly
            linked_buildings = db.query(ShanghaiHistoryBuildingType.BUILDING_ID).filter(
                ShanghaiHistoryBuildingType.CODE_VALUE == building_type
            ).distinct()
            query = query.filter(ShanghaiHistoryBuilding.BUILDING_ID.in_(linked_buildings))
        
        total = query.count()
        offset = (page - 1) * size
        buildings = query.offset(offset).limit(size).all()
        
        result = []
        for b in buildings:
            # Get types
            types = db.query(ShanghaiHistoryBuildingType).filter(
                ShanghaiHistoryBuildingType.BUILDING_ID == b.BUILDING_ID
            ).all()
            types_data = []
            for t in types:
                code_lookup = db.execute(text(
                    "SELECT CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = :code_type AND CODE_VALUE = :code_value COLLATE utf8mb4_unicode_ci"
                ), {"code_type": t.CODE_TYPE, "code_value": t.CODE_VALUE}).fetchone()
                types_data.append({
                    "codeType": t.CODE_TYPE,
                    "codeValue": t.CODE_VALUE,
                    "codeNameCn": code_lookup[0] if code_lookup else t.CODE_VALUE
                })
            
            # Get photo count
            photo_count = db.query(BuildingPhotography).filter(
                BuildingPhotography.BUILDING_ID == b.BUILDING_ID
            ).count()
            
            result.append({
                "buildingId": b.BUILDING_ID,
                "buildingName": b.BUILDING_NAME or "",
                "buildingChineseName": b.BUILDING_CHINESE_NAME or "",
                "buildingAddress": b.BUILDING_ADDRESS or "",
                "dateStart": b.DATE_START or "",
                "dateEnd": b.DATE_END or "",
                "xAxis": float(b.X_AXIS) if b.X_AXIS else None,
                "yAxis": float(b.Y_AXIS) if b.Y_AXIS else None,
                "bdLng": float(b.BD_LNG) if b.BD_LNG else None,
                "bdLat": float(b.BD_LAT) if b.BD_LAT else None,
                "types": types_data,
                "photoCount": photo_count
            })
        
        return {
            "code": 200,
            "message": "success",
            "data": {
                "list": result,
                "total": total,
                "page": page,
                "size": size
            }
        }
    finally:
        db.close()


def get_historical_building_by_id(building_id: int) -> Optional[dict]:
    db = next(get_db())
    try:
        b = db.query(ShanghaiHistoryBuilding).filter(
            ShanghaiHistoryBuilding.BUILDING_ID == building_id
        ).first()
        
        if not b:
            return None
        
        # Get types
        types = db.query(ShanghaiHistoryBuildingType).filter(
            ShanghaiHistoryBuildingType.BUILDING_ID == building_id
        ).all()
        types_data = []
        for t in types:
            code_lookup = db.execute(text(
                "SELECT CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = :code_type AND CODE_VALUE = :code_value COLLATE utf8mb4_unicode_ci"
            ), {"code_type": t.CODE_TYPE, "code_value": t.CODE_VALUE}).fetchone()
            types_data.append({
                "codeType": t.CODE_TYPE,
                "codeValue": t.CODE_VALUE,
                "codeNameCn": code_lookup[0] if code_lookup else t.CODE_VALUE
            })
        
        # Get photos
        photos = db.query(BuildingPhotography).filter(
            BuildingPhotography.BUILDING_ID == building_id
        ).all()
        photo_ids = [p.PHOTOGRAPHY_ID for p in photos]
        photo_list = []
        if photo_ids:
            photo_records = db.query(HistoryPhotography).filter(
                HistoryPhotography.ID.in_(photo_ids)
            ).all()
            photo_list = [{"photographyId": p.ID, "imageFilename": p.IMAGE_FILENAME} for p in photo_records]
        
        return {
            "code": 200,
            "message": "success",
            "data": {
                "buildingId": b.BUILDING_ID,
                "buildingName": b.BUILDING_NAME or "",
                "buildingChineseName": b.BUILDING_CHINESE_NAME or "",
                "buildingAddress": b.BUILDING_ADDRESS or "",
                "dateStart": b.DATE_START or "",
                "dateEnd": b.DATE_END or "",
                "xAxis": float(b.X_AXIS) if b.X_AXIS else None,
                "yAxis": float(b.Y_AXIS) if b.Y_AXIS else None,
                "bdLng": float(b.BD_LNG) if b.BD_LNG else None,
                "bdLat": float(b.BD_LAT) if b.BD_LAT else None,
                "types": types_data,
                "photos": photo_list
            }
        }
    finally:
        db.close()


def create_historical_building(data: dict) -> int:
    db = next(get_db())
    try:
        max_id = db.query(func.max(ShanghaiHistoryBuilding.BUILDING_ID)).scalar() or 0
        
        building = ShanghaiHistoryBuilding(
            BUILDING_ID=max_id + 1,
            BUILDING_NAME=data.get("buildingName"),
            BUILDING_CHINESE_NAME=data.get("buildingChineseName"),
            BUILDING_ADDRESS=data.get("buildingAddress"),
            DATE_START=data.get("dateStart"),
            DATE_END=data.get("dateEnd"),
            X_AXIS=data.get("xAxis"),
            Y_AXIS=data.get("yAxis"),
            BD_LNG=data.get("bdLng"),
            BD_LAT=data.get("bdLat")
        )
        db.add(building)
        db.commit()
        
        building_id = building.BUILDING_ID
        
        # Add types
        for code_value in data.get("types", []):
            add_building_type(building_id, code_value)
        
        return building_id
    finally:
        db.close()


def update_historical_building(building_id: int, data: dict):
    db = next(get_db())
    try:
        building = db.query(ShanghaiHistoryBuilding).filter(
            ShanghaiHistoryBuilding.BUILDING_ID == building_id
        ).first()
        
        if not building:
            return
        
        if "buildingName" in data:
            building.BUILDING_NAME = data["buildingName"]
        if "buildingChineseName" in data:
            building.BUILDING_CHINESE_NAME = data["buildingChineseName"]
        if "buildingAddress" in data:
            building.BUILDING_ADDRESS = data["buildingAddress"]
        if "dateStart" in data:
            building.DATE_START = data["dateStart"]
        if "dateEnd" in data:
            building.DATE_END = data["dateEnd"]
        if "xAxis" in data:
            building.X_AXIS = data["xAxis"]
        if "yAxis" in data:
            building.Y_AXIS = data["yAxis"]
        if "bdLng" in data:
            building.BD_LNG = data["bdLng"]
        if "bdLat" in data:
            building.BD_LAT = data["bdLat"]
        
        if "types" in data:
            # Clear existing types
            db.query(ShanghaiHistoryBuildingType).filter(
                ShanghaiHistoryBuildingType.BUILDING_ID == building_id
            ).delete()
            
            # Add new types
            for code_value in data["types"]:
                add_building_type(building_id, code_value)
        
        db.commit()
    finally:
        db.close()


def delete_historical_building(building_id: int):
    db = next(get_db())
    try:
        # Delete type associations
        db.query(ShanghaiHistoryBuildingType).filter(
            ShanghaiHistoryBuildingType.BUILDING_ID == building_id
        ).delete()
        
        # Delete photo associations
        db.query(BuildingPhotography).filter(
            BuildingPhotography.BUILDING_ID == building_id
        ).delete()
        
        # Delete building
        db.query(ShanghaiHistoryBuilding).filter(
            ShanghaiHistoryBuilding.BUILDING_ID == building_id
        ).delete()
        
        db.commit()
    finally:
        db.close()


def add_building_type(building_id: int, code_value: str):
    db = next(get_db())
    try:
        # Get code type from CODE_LOOKUP
        result = db.execute(text(
            "SELECT CODE_TYPE FROM CODE_LOOKUP WHERE CODE_VALUE = :code_value"
        ), {"code_value": code_value}).fetchone()
        
        code_type = result[0] if result else "建筑类型"
        
        # Check if exists
        existing = db.query(ShanghaiHistoryBuildingType).filter(
            ShanghaiHistoryBuildingType.BUILDING_ID == building_id,
            ShanghaiHistoryBuildingType.CODE_VALUE == code_value
        ).first()
        
        if not existing:
            max_id = db.query(func.max(ShanghaiHistoryBuildingType.ID)).scalar() or 0
            btype = ShanghaiHistoryBuildingType(
                ID=max_id + 1,
                BUILDING_ID=building_id,
                CODE_TYPE=code_type,
                CODE_VALUE=code_value
            )
            db.add(btype)
            db.commit()
    finally:
        db.close()


def delete_building_type(building_id: int, code_value: str):
    db = next(get_db())
    try:
        db.query(ShanghaiHistoryBuildingType).filter(
            ShanghaiHistoryBuildingType.BUILDING_ID == building_id,
            ShanghaiHistoryBuildingType.CODE_VALUE == code_value
        ).delete()
        db.commit()
    finally:
        db.close()


def get_building_types() -> List[dict]:
    db = next(get_db())
    try:
        result = db.execute(text(
            "SELECT CODE_TYPE, CODE_VALUE, CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = '建筑类型' ORDER BY CODE_NAME_CN"
        )).fetchall()
        return [{"codeType": r[0], "codeValue": r[1], "codeNameCn": r[2]} for r in result]
    finally:
        db.close()


# ============ Photograph Functions ============

def get_photographs(
    page: int = 1,
    size: int = 50,
    source: Optional[str] = None,
    time_period: Optional[str] = None,
    photo_type: Optional[str] = None,
    tag: Optional[str] = None,
    building_id: Optional[int] = None,
) -> dict:
    db = next(get_db())
    try:
        query = db.query(HistoryPhotography)
        
        if source:
            query = query.filter(HistoryPhotography.SOURCE == source)
        if time_period:
            query = query.filter(HistoryPhotography.TIME_PERIOD == time_period)
        
        if building_id:
            photo_ids = db.query(BuildingPhotography.PHOTOGRAPHY_ID).filter(
                BuildingPhotography.BUILDING_ID == building_id
            ).distinct()
            query = query.filter(HistoryPhotography.ID.in_(photo_ids))
        
        total = query.count()
        offset = (page - 1) * size
        photos = query.offset(offset).limit(size).all()
        
        result = []
        for p in photos:
            # Get tags
            tags = db.query(ShanghaiHistoryPhotographyTag).filter(
                ShanghaiHistoryPhotographyTag.PHOTOGRAPHY_ID == p.ID
            ).all()
            tags_data = [t.TAG for t in tags]
            
            # Get types
            types = db.query(ShanghaiHistoryPhotographyType).filter(
                ShanghaiHistoryPhotographyType.PHOTOGRAPHY_ID == p.ID
            ).all()
            types_data = []
            for t in types:
                code_lookup = db.execute(text(
                    "SELECT CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = :code_type AND CODE_VALUE = :code_value COLLATE utf8mb4_unicode_ci"
                ), {"code_type": t.CODE_TYPE, "code_value": t.CODE_VALUE}).fetchone()
                types_data.append({
                    "codeType": t.CODE_TYPE,
                    "codeValue": t.CODE_VALUE,
                    "codeNameCn": code_lookup[0] if code_lookup else t.CODE_VALUE
                })
            
            # Filter by type if specified
            if photo_type and not any(t["codeValue"] == photo_type for t in types_data):
                continue
            
            # Filter by tag if specified
            if tag and tag not in tags_data:
                continue
            
            # Get building count
            building_count = db.query(BuildingPhotography).filter(
                BuildingPhotography.PHOTOGRAPHY_ID == p.ID
            ).count()
            
            result.append({
                "id": p.ID,
                "chineseTitle": p.CHINESE_TITLE,
                "englishTitle": p.ENGLISH_TITLE,
                "source": p.SOURCE,
                "year": p.YEAR,
                "timePeriod": p.TIME_PERIOD,
                "imageFilename": p.IMAGE_FILENAME,
                "tags": tags_data,
                "types": types_data,
                "buildingCount": building_count
            })
        
        return {
            "code": 200,
            "message": "success",
            "data": {
                "list": result,
                "total": total,
                "page": page,
                "size": size
            }
        }
    finally:
        db.close()


def get_photograph_by_id(photo_id: int) -> Optional[dict]:
    db = next(get_db())
    try:
        p = db.query(HistoryPhotography).filter(
            HistoryPhotography.ID == photo_id
        ).first()
        
        if not p:
            return None
        
        # Get tags
        tags = db.query(ShanghaiHistoryPhotographyTag).filter(
            ShanghaiHistoryPhotographyTag.PHOTOGRAPHY_ID == photo_id
        ).all()
        tags_data = [t.TAG for t in tags]
        
        # Get types
        types = db.query(ShanghaiHistoryPhotographyType).filter(
            ShanghaiHistoryPhotographyType.PHOTOGRAPHY_ID == photo_id
        ).all()
        types_data = []
        for t in types:
            code_lookup = db.execute(text(
                "SELECT CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = :code_type AND CODE_VALUE = :code_value COLLATE utf8mb4_unicode_ci"
            ), {"code_type": t.CODE_TYPE, "code_value": t.CODE_VALUE}).fetchone()
            types_data.append({
                "codeType": t.CODE_TYPE,
                "codeValue": t.CODE_VALUE,
                "codeNameCn": code_lookup[0] if code_lookup else t.CODE_VALUE
            })
        
        # Get buildings
        bp_links = db.query(BuildingPhotography).filter(
            BuildingPhotography.PHOTOGRAPHY_ID == photo_id
        ).all()
        buildings_data = []
        for bp in bp_links:
            b = db.query(ShanghaiHistoryBuilding).filter(
                ShanghaiHistoryBuilding.BUILDING_ID == bp.BUILDING_ID
            ).first()
            if b:
                buildings_data.append({
                    "buildingId": b.BUILDING_ID,
                    "buildingChineseName": b.BUILDING_CHINESE_NAME or ""
                })
        
        return {
            "code": 200,
            "message": "success",
            "data": {
                "id": p.ID,
                "chineseTitle": p.CHINESE_TITLE,
                "englishTitle": p.ENGLISH_TITLE,
                "source": p.SOURCE,
                "year": p.YEAR,
                "timePeriod": p.TIME_PERIOD,
                "description": p.DESCRIPTION,
                "imageFilename": p.IMAGE_FILENAME,
                "tags": tags_data,
                "types": types_data,
                "buildings": buildings_data
            }
        }
    finally:
        db.close()


def bind_photographs_to_building(photo_ids: List[int], building_id: int) -> int:
    db = next(get_db())
    try:
        count = 0
        for photo_id in photo_ids:
            existing = db.query(BuildingPhotography).filter(
                BuildingPhotography.BUILDING_ID == building_id,
                BuildingPhotography.PHOTOGRAPHY_ID == photo_id
            ).first()
            
            if not existing:
                max_id = db.query(func.max(BuildingPhotography.ID)).scalar() or 0
                bp = BuildingPhotography(
                    ID=max_id + 1,
                    BUILDING_ID=building_id,
                    PHOTOGRAPHY_ID=photo_id
                )
                db.add(bp)
                count += 1
        
        db.commit()
        return count
    finally:
        db.close()


def bind_photo_to_building(photo_id: int, building_id: int):
    db = next(get_db())
    try:
        existing = db.query(BuildingPhotography).filter(
            BuildingPhotography.BUILDING_ID == building_id,
            BuildingPhotography.PHOTOGRAPHY_ID == photo_id
        ).first()
        
        if not existing:
            max_id = db.query(func.max(BuildingPhotography.ID)).scalar() or 0
            bp = BuildingPhotography(
                ID=max_id + 1,
                BUILDING_ID=building_id,
                PHOTOGRAPHY_ID=photo_id
            )
            db.add(bp)
            db.commit()
    finally:
        db.close()


def unbind_photo_from_building(photo_id: int, building_id: int):
    db = next(get_db())
    try:
        db.query(BuildingPhotography).filter(
            BuildingPhotography.BUILDING_ID == building_id,
            BuildingPhotography.PHOTOGRAPHY_ID == photo_id
        ).delete()
        db.commit()
    finally:
        db.close()


def add_photo_tag(photo_id: int, tag: str):
    db = next(get_db())
    try:
        existing = db.query(ShanghaiHistoryPhotographyTag).filter(
            ShanghaiHistoryPhotographyTag.PHOTOGRAPHY_ID == photo_id,
            ShanghaiHistoryPhotographyTag.TAG == tag
        ).first()
        
        if not existing:
            max_id = db.query(func.max(ShanghaiHistoryPhotographyTag.ID)).scalar() or 0
            t = ShanghaiHistoryPhotographyTag(
                ID=max_id + 1,
                PHOTOGRAPHY_ID=photo_id,
                TAG=tag
            )
            db.add(t)
            db.commit()
    finally:
        db.close()


def delete_photo_tag(photo_id: int, tag: str):
    db = next(get_db())
    try:
        db.query(ShanghaiHistoryPhotographyTag).filter(
            ShanghaiHistoryPhotographyTag.PHOTOGRAPHY_ID == photo_id,
            ShanghaiHistoryPhotographyTag.TAG == tag
        ).delete()
        db.commit()
    finally:
        db.close()


def add_photo_type(photo_id: int, code_value: str):
    db = next(get_db())
    try:
        # Get code type
        result = db.execute(text(
            "SELECT CODE_TYPE FROM CODE_LOOKUP WHERE CODE_VALUE = :code_value"
        ), {"code_value": code_value}).fetchone()
        
        code_type = result[0] if result else "照片类型"
        
        existing = db.query(ShanghaiHistoryPhotographyType).filter(
            ShanghaiHistoryPhotographyType.PHOTOGRAPHY_ID == photo_id,
            ShanghaiHistoryPhotographyType.CODE_VALUE == code_value
        ).first()
        
        if not existing:
            max_id = db.query(func.max(ShanghaiHistoryPhotographyType.ID)).scalar() or 0
            pt = ShanghaiHistoryPhotographyType(
                ID=max_id + 1,
                PHOTOGRAPHY_ID=photo_id,
                CODE_TYPE=code_type,
                CODE_VALUE=code_value
            )
            db.add(pt)
            db.commit()
    finally:
        db.close()


def delete_photo_type(photo_id: int, code_value: str):
    db = next(get_db())
    try:
        db.query(ShanghaiHistoryPhotographyType).filter(
            ShanghaiHistoryPhotographyType.PHOTOGRAPHY_ID == photo_id,
            ShanghaiHistoryPhotographyType.CODE_VALUE == code_value
        ).delete()
        db.commit()
    finally:
        db.close()


def get_photo_tags() -> List[str]:
    db = next(get_db())
    try:
        result = db.execute(text(
            "SELECT DISTINCT TAG FROM SHANGHAI_HISTORY_PHOTOGRAPHY_tag ORDER BY TAG"
        )).fetchall()
        return [r[0] for r in result if r[0]]
    finally:
        db.close()


def get_photo_types() -> List[dict]:
    db = next(get_db())
    try:
        result = db.execute(text(
            "SELECT CODE_TYPE, CODE_VALUE, CODE_NAME_CN FROM CODE_LOOKUP WHERE CODE_TYPE = '照片类型' ORDER BY CODE_NAME_CN"
        )).fetchall()
        return [{"codeType": r[0], "codeValue": r[1], "codeNameCn": r[2]} for r in result]
    finally:
        db.close()
