from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from ...database import get_db
from ...services import timeline_service

router = APIRouter()


@router.get("/events")
def get_events(
    categories: Optional[str] = Query(None, description="Category filter, comma-separated"),
    importance_levels: Optional[str] = Query(None, description="Importance level filter, comma-separated"),
    db: Session = Depends(get_db)
):
    """Get historical events list for timeline display"""
    data = timeline_service.get_events(db, categories, importance_levels)
    return {"code": 0, "message": "success", "data": data}


@router.get("/events/categories")
def get_event_categories(db: Session = Depends(get_db)):
    """Get all event categories with counts"""
    data = timeline_service.get_event_categories(db)
    return {"code": 0, "message": "success", "data": data}


@router.get("/events/importance-levels")
def get_importance_levels(db: Session = Depends(get_db)):
    """Get all importance levels with counts"""
    data = timeline_service.get_importance_levels(db)
    return {"code": 0, "message": "success", "data": data}


@router.get("/trend/population")
def get_population_data(db: Session = Depends(get_db)):
    """Get Shanghai population historical data"""
    data = timeline_service.get_population_data(db)
    return {"code": 0, "message": "success", "data": data}


@router.get("/trend/land-valuation")
def get_land_valuation_data(db: Session = Depends(get_db)):
    """Get Shanghai land valuation historical data"""
    data = timeline_service.get_land_valuation_data(db)
    return {"code": 0, "message": "success", "data": data}


@router.get("/trend/trade")
def get_trade_data(db: Session = Depends(get_db)):
    """Get Shanghai trade proportion historical data"""
    data = timeline_service.get_trade_data(db)
    return {"code": 0, "message": "success", "data": data}
