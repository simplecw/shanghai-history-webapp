from fastapi import APIRouter, HTTPException
from app.services.building_service import (
    get_historical_buildings,
    get_historical_building_by_id,
    create_historical_building,
    update_historical_building,
    delete_historical_building,
    add_building_type,
    delete_building_type,
    get_building_types,
    get_photographs,
    get_photograph_by_id,
    bind_photographs_to_building,
    bind_photo_to_building,
    unbind_photo_from_building,
    add_photo_tag,
    delete_photo_tag,
    add_photo_type,
    delete_photo_type,
    get_photo_tags,
    get_photo_types,
)
from app.schemas.building import (
    HistoricalBuildingResponse,
    HistoricalBuildingDetailResponse,
    HistoricalBuildingCreateRequest,
    HistoricalBuildingUpdateRequest,
    BuildingTypeResponse,
    PhotographListResponse,
    PhotographDetailResponse,
    BindPhotosRequest,
    PhotoTagRequest,
    PhotoTypeRequest,
)

router = APIRouter(prefix="/historical-buildings", tags=["Historical Buildings"])

@router.get("", response_model=HistoricalBuildingResponse)
async def list_historical_buildings(
    page: int = 1,
    size: int = 50,
    name: str = None,
    address: str = None,
    buildingType: str = None,
    dateStart: str = None,
    dateEnd: str = None,
    hasPhotos: bool = None,
):
    result = get_historical_buildings(
        page=page, size=size, name=name, address=address,
        building_type=buildingType, date_start=dateStart,
        date_end=dateEnd, has_photos=hasPhotos
    )
    return result

@router.get("/{building_id}", response_model=HistoricalBuildingDetailResponse)
async def get_building(building_id: int):
    result = get_historical_building_by_id(building_id)
    if not result:
        raise HTTPException(status_code=404, detail="Building not found")
    return result

@router.post("", response_model=dict)
async def create_building(request: HistoricalBuildingCreateRequest):
    result = create_historical_building(request)
    return {"code": 200, "message": "success", "data": {"buildingId": result}}

@router.put("/{building_id}")
async def update_building(building_id: int, request: HistoricalBuildingUpdateRequest):
    update_historical_building(building_id, request)
    return {"code": 200, "message": "success"}

@router.delete("/{building_id}")
async def delete_building(building_id: int):
    delete_historical_building(building_id)
    return {"code": 200, "message": "success"}

@router.post("/{building_id}/types")
async def add_type(building_id: int, request: BuildingTypeResponse):
    add_building_type(building_id, request.codeValue)
    return {"code": 200, "message": "success"}

@router.delete("/{building_id}/types/{code_value}")
async def remove_type(building_id: int, code_value: str):
    delete_building_type(building_id, code_value)
    return {"code": 200, "message": "success"}


maps_router = APIRouter(prefix="/photographs", tags=["Photographs"])

@maps_router.get("", response_model=PhotographListResponse)
async def list_photographs(
    page: int = 1,
    size: int = 50,
    source: str = None,
    timePeriod: str = None,
    photoType: str = None,
    tag: str = None,
    buildingId: int = None,
):
    result = get_photographs(
        page=page, size=size, source=source, time_period=timePeriod,
        photo_type=photoType, tag=tag, building_id=buildingId
    )
    return result

@maps_router.get("/{photo_id}", response_model=PhotographDetailResponse)
async def get_photo(photo_id: int):
    result = get_photograph_by_id(photo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Photo not found")
    return result

@maps_router.post("/bindings")
async def bind_photos(request: BindPhotosRequest):
    result = bind_photographs_to_building(request.photographyIds, request.buildingId)
    return {"code": 200, "message": "success", "data": {"successCount": result}}

@maps_router.post("/{photo_id}/buildings")
async def bind_single_photo(photo_id: int, request: dict):
    bind_photo_to_building(photo_id, request.get("buildingId"))
    return {"code": 200, "message": "success"}

@maps_router.delete("/{photo_id}/buildings/{building_id}")
async def unbind_photo(photo_id: int, building_id: int):
    unbind_photo_from_building(photo_id, building_id)
    return {"code": 200, "message": "success"}

@maps_router.post("/tags")
async def add_tag(request: PhotoTagRequest):
    add_photo_tag(request.photographyId, request.tag)
    return {"code": 200, "message": "success"}

@maps_router.delete("/{photo_id}/tags/{tag}")
async def remove_tag(photo_id: int, tag: str):
    delete_photo_tag(photo_id, tag)
    return {"code": 200, "message": "success"}

@maps_router.post("/types")
async def add_type(request: PhotoTypeRequest):
    add_photo_type(request.photographyId, request.codeValue)
    return {"code": 200, "message": "success"}

@maps_router.delete("/{photo_id}/types/{code_value}")
async def remove_type(photo_id: int, code_value: str):
    delete_photo_type(photo_id, code_value)
    return {"code": 200, "message": "success"}


code_router = APIRouter(prefix="/code-lookup", tags=["Code Lookup"])

@code_router.get("/building-types", response_model=list)
async def list_building_types():
    result = get_building_types()
    return {"code": 200, "message": "success", "data": result}

@code_router.get("/photo-tags", response_model=list)
async def list_photo_tags():
    result = get_photo_tags()
    return {"code": 200, "message": "success", "data": result}

@code_router.get("/photo-types", response_model=list)
async def list_photo_types():
    result = get_photo_types()
    return {"code": 200, "message": "success", "data": result}