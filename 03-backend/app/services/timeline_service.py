from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..models.timeline import ShanghaiEvent, Population, LandValuation, ShanghaiTradeProportion


def get_events(db: Session, categories: Optional[str] = None, importance_levels: Optional[str] = None) -> dict:
    """Get events list with optional filtering by categories and importance levels"""
    query = db.query(ShanghaiEvent)
    
    if categories:
        category_list = [c.strip() for c in categories.split(',')]
        query = query.filter(ShanghaiEvent.EVENT_CATEGORY.in_(category_list))
    
    if importance_levels:
        level_list = [l.strip() for l in importance_levels.split(',')]
        query = query.filter(ShanghaiEvent.EVENT_IMPORTANCE.in_(level_list))
    
    total = query.count()
    events = query.order_by(ShanghaiEvent.EVENT_YEAR.asc()).all()
    
    years = [e.EVENT_YEAR for e in events if e.EVENT_YEAR]
    year_range = {
        "min": min(years) if years else "1842",
        "max": max(years) if years else "1949"
    }
    
    event_items = []
    for e in events:
        event_items.append({
            "eventId": e.EVENT_ID,
            "eventName": e.EVENT_NAME or "",
            "eventYear": e.EVENT_YEAR or "",
            "eventDate": e.EVENT_DATE,
            "reignTitle": e.REIGN_TITLE,
            "eventDescription": e.EVENT_DESCRIPTION,
            "eventImportance": e.EVENT_IMPORTANCE or "",
            "eventCategory": e.EVENT_CATEGORY or "",
            "eventSubCategory": e.EVENT_SUB_CATEGORY,
            "showDate": e.SHOW_DATE
        })
    
    return {
        "events": event_items,
        "total": total,
        "yearRange": year_range
    }


def get_event_categories(db: Session) -> List[dict]:
    """Get all event categories with counts"""
    results = db.query(
        ShanghaiEvent.EVENT_CATEGORY,
        func.count(ShanghaiEvent.EVENT_ID).label('count')
    ).group_by(ShanghaiEvent.EVENT_CATEGORY).order_by(ShanghaiEvent.EVENT_CATEGORY).all()
    
    return [
        {"category": r.EVENT_CATEGORY or "Unknown", "count": r.count}
        for r in results
    ]


def get_importance_levels(db: Session) -> List[dict]:
    """Get all importance levels with counts"""
    results = db.query(
        ShanghaiEvent.EVENT_IMPORTANCE,
        func.count(ShanghaiEvent.EVENT_ID).label('count')
    ).group_by(ShanghaiEvent.EVENT_IMPORTANCE).order_by(ShanghaiEvent.EVENT_IMPORTANCE.asc()).all()
    
    level_labels = {
        "1": "Level 1 (Most Important)",
        "2": "Level 2",
        "3": "Level 3",
        "4": "Level 4"
    }
    
    return [
        {"level": r.EVENT_IMPORTANCE or "4", "label": level_labels.get(r.EVENT_IMPORTANCE, "Level 4"), "count": r.count}
        for r in results
    ]


def get_population_data(db: Session) -> dict:
    """Get population historical data"""
    records = db.query(Population).order_by(Population.YEAR.asc()).all()
    
    location_names = {
        "0": "International Settlement",
        "1": "Chinese Area",
        "2": "International Settlement",
        "3": "French Concession"
    }
    
    items = []
    for r in records:
        items.append({
            "year": r.YEAR or "",
            "location": r.LOCATION or "",
            "locationName": location_names.get(r.LOCATION, "Unknown"),
            "value": r.PEOPLE_COUNT or 0
        })
    
    return {
        "unit": "people",
        "records": items
    }


def get_land_valuation_data(db: Session) -> dict:
    """Get land valuation historical data"""
    records = db.query(LandValuation).order_by(LandValuation.YEAR.asc()).all()
    
    location_names = {
        "0": "International Settlement",
        "1": "British concession",
        "2": "French Concession",
        "3": "Chinese Area",
        "4": "Hongkou/Zhabei etc"
    }
    
    items = []
    for r in records:
        items.append({
            "year": r.YEAR or "",
            "location": r.LOCATION or "",
            "locationName": location_names.get(r.LOCATION, "Other"),
            "statisticsGroup": r.STATISTICS_GROUP,
            "value": r.LAND_VALUATION or 0
        })
    
    return {
        "unit": "tael/mu",
        "records": items
    }


def get_trade_data(db: Session) -> dict:
    """Get trade proportion historical data"""
    records = db.query(ShanghaiTradeProportion).order_by(ShanghaiTradeProportion.YEAR.asc()).all()
    
    items = []
    for r in records:
        imports_ratio = 0.0
        exports_ratio = 0.0
        trade_ratio = 0.0
        
        if r.IMPORTS_OF_FOREIGN_GOODS_TOTAL and r.IMPORTS_OF_FOREIGN_GOODS_TOTAL > 0:
            imports_ratio = round(r.IMPORTS_OF_FOREIGN_GOODS_SHANGHAI / r.IMPORTS_OF_FOREIGN_GOODS_TOTAL * 100, 1)
        
        if r.NATIONAL_EXPORTS_TOTAL and r.NATIONAL_EXPORTS_TOTAL > 0:
            exports_ratio = round(r.NATIONAL_EXPORTS_SHANGHAI / r.NATIONAL_EXPORTS_TOTAL * 100, 1)
        
        if r.FOREIGN_TRADE_TOTAL and r.FOREIGN_TRADE_TOTAL > 0:
            trade_ratio = round(r.FOREIGN_TRADE_SHANGHAI / r.FOREIGN_TRADE_TOTAL * 100, 1)
        
        items.append({
            "year": r.YEAR or "",
            "importsTotal": r.IMPORTS_OF_FOREIGN_GOODS_TOTAL or 0,
            "importsShanghai": r.IMPORTS_OF_FOREIGN_GOODS_SHANGHAI or 0,
            "exportsTotal": r.NATIONAL_EXPORTS_TOTAL or 0,
            "exportsShanghai": r.NATIONAL_EXPORTS_SHANGHAI or 0,
            "tradeTotal": r.FOREIGN_TRADE_TOTAL or 0,
            "tradeShanghai": r.FOREIGN_TRADE_SHANGHAI or 0,
            "importsRatio": imports_ratio,
            "exportsRatio": exports_ratio,
            "tradeRatio": trade_ratio
        })
    
    return {
        "unit": "thousand Haiguan Taels",
        "records": items
    }
