from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.models.map import HistoricalMap
from app.schemas.map import HistoricalMapItem

FILTER_FIELDS = ["MAP_TYPE", "SUBTYPE", "TAGS", "SERIES", "CLARITY", "IMPORTANCE", "USAGE_SUGGESTIONS", "SOURCE"]

class MapService:
    @staticmethod
    def convert_to_item(map_record: HistoricalMap) -> HistoricalMapItem:
        return HistoricalMapItem(
            id=map_record.ID, fileNumber=map_record.FILE_NUMBER, title=map_record.TITLE,
            chineseName=map_record.CHINESE_NAME, foreignName=map_record.FOREIGN_NAME,
            year=map_record.YEAR, era=map_record.ERA, pinyin=map_record.PINYIN,
            imageFilename=map_record.IMAGE_FILENAME, videoAvailable=map_record.VIDEO_AVAILABLE,
            mapType=map_record.MAP_TYPE, subtype=map_record.SUBTYPE, tags=map_record.TAGS,
            series=map_record.SERIES, clarity=map_record.CLARITY, importance=map_record.IMPORTANCE,
            usageSuggestions=map_record.USAGE_SUGGESTIONS, source=map_record.SOURCE
        )
    
    @staticmethod
    def get_all_maps(db: Session, skip: int = 0, limit: int = 1000, filters: Optional[Dict[str, str]] = None) -> tuple:
        query = db.query(HistoricalMap)
        if filters:
            for field, value in filters.items():
                if value and value.strip():
                    column = getattr(HistoricalMap, field, None)
                    if column:
                        query = query.filter(column.like(f"%{value}%"))
        total = query.count()
        maps = query.offset(skip).limit(limit).all()
        return maps, total
    
    @staticmethod
    def get_map_by_id(db: Session, map_id: int) -> Optional[HistoricalMap]:
        return db.query(HistoricalMap).filter(HistoricalMap.ID == map_id).first()
    
    @staticmethod
    def get_unique_values(db: Session) -> Dict[str, List[str]]:
        unique_values = {}
        for field in FILTER_FIELDS:
            column = getattr(HistoricalMap, field, None)
            if column:
                values = db.query(distinct(column)).filter(column.isnot(None)).all()
                unique_values[field] = [v[0] for v in values if v[0]]
        return unique_values