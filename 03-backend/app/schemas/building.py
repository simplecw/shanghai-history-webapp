from pydantic import BaseModel
from typing import Optional, List


class BuildingListItem(BaseModel):
    buildingId: int
    currentName: Optional[str] = None
    originalName: Optional[str] = None
    address: Optional[str] = None
    preservationCategory: Optional[str] = None
    batch: Optional[str] = None
    constructionYear: Optional[str] = None
    imagePath: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class BuildingListResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: dict


class PhotographyItem(BaseModel):
    photographyId: int
    imageFilename: str

    class Config:
        from_attributes = True


class BuildingDetailData(BaseModel):
    buildingId: int
    currentName: Optional[str] = None
    originalName: Optional[str] = None
    address: Optional[str] = None
    structureType: Optional[str] = None
    constructionYear: Optional[str] = None
    preservationCategory: Optional[str] = None
    preservationRequirements: Optional[str] = None
    imagePath: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    batch: Optional[str] = None
    photos: List[PhotographyItem] = []

    class Config:
        from_attributes = True


class BuildingDetailResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[BuildingDetailData] = None


class MapListItem(BaseModel):
    mapId: int
    title: Optional[str] = None
    chineseName: Optional[str] = None
    foreignName: Optional[str] = None
    year: Optional[str] = None
    era: Optional[str] = None
    mapType: Optional[str] = None
    imageFilename: Optional[str] = None

    class Config:
        from_attributes = True


class MapDetailData(BaseModel):
    mapId: int
    fileNumber: Optional[str] = None
    title: Optional[str] = None
    chineseName: Optional[str] = None
    foreignName: Optional[str] = None
    year: Optional[str] = None
    era: Optional[str] = None
    pinyin: Optional[str] = None
    imageFilename: Optional[str] = None
    videoAvailable: Optional[str] = None
    mapType: Optional[str] = None
    subtype: Optional[str] = None
    tags: Optional[str] = None
    series: Optional[str] = None
    clarity: Optional[str] = None
    importance: Optional[str] = None
    usageSuggestions: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


class MapDetailResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[MapDetailData] = None


class MapListResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: dict
