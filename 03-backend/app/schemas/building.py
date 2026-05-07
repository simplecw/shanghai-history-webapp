from pydantic import BaseModel
from typing import Optional, List


# ============ Original Building/Map Schemas ============

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


# ============ Historical Building Schemas ============

class CodeTypeItem(BaseModel):
    codeType: Optional[str] = None
    codeValue: str
    codeNameCn: str

    class Config:
        from_attributes = True


class HistoricalBuildingListItem(BaseModel):
    buildingId: int
    buildingName: str
    buildingChineseName: str
    buildingAddress: str
    dateStart: str
    dateEnd: str
    xAxis: Optional[float] = None
    yAxis: Optional[float] = None
    bdLng: Optional[float] = None
    bdLat: Optional[float] = None
    types: List[CodeTypeItem] = []
    photoCount: int = 0

    class Config:
        from_attributes = True


class HistoricalBuildingResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: dict


class HistoricalBuildingDetailData(BaseModel):
    buildingId: int
    buildingName: str
    buildingChineseName: str
    buildingAddress: str
    dateStart: str
    dateEnd: str
    xAxis: Optional[float] = None
    yAxis: Optional[float] = None
    bdLng: Optional[float] = None
    bdLat: Optional[float] = None
    types: List[CodeTypeItem] = []
    photos: List[PhotographyItem] = []

    class Config:
        from_attributes = True


class HistoricalBuildingDetailResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[HistoricalBuildingDetailData] = None


class HistoricalBuildingCreateRequest(BaseModel):
    buildingName: str
    buildingChineseName: str
    buildingAddress: str
    dateStart: Optional[str] = None
    dateEnd: Optional[str] = None
    xAxis: Optional[float] = None
    yAxis: Optional[float] = None
    bdLng: Optional[float] = None
    bdLat: Optional[float] = None
    types: List[str] = []


class HistoricalBuildingUpdateRequest(BaseModel):
    buildingName: Optional[str] = None
    buildingChineseName: Optional[str] = None
    buildingAddress: Optional[str] = None
    dateStart: Optional[str] = None
    dateEnd: Optional[str] = None
    xAxis: Optional[float] = None
    yAxis: Optional[float] = None
    bdLng: Optional[float] = None
    bdLat: Optional[float] = None
    types: Optional[List[str]] = None


class BuildingTypeResponse(BaseModel):
    codeValue: str


# ============ Photograph Schemas ============

class PhotoBuildingItem(BaseModel):
    buildingId: int
    buildingChineseName: str

    class Config:
        from_attributes = True


class PhotoListItem(BaseModel):
    id: int
    chineseTitle: Optional[str] = None
    englishTitle: Optional[str] = None
    source: Optional[str] = None
    year: Optional[str] = None
    timePeriod: Optional[str] = None
    imageFilename: Optional[str] = None
    tags: List[str] = []
    types: List[CodeTypeItem] = []
    buildingCount: int = 0

    class Config:
        from_attributes = True


class PhotographListResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: dict


class PhotographDetailData(BaseModel):
    id: int
    chineseTitle: Optional[str] = None
    englishTitle: Optional[str] = None
    source: Optional[str] = None
    year: Optional[str] = None
    timePeriod: Optional[str] = None
    description: Optional[str] = None
    imageFilename: Optional[str] = None
    tags: List[str] = []
    types: List[CodeTypeItem] = []
    buildings: List[PhotoBuildingItem] = []

    class Config:
        from_attributes = True


class PhotographDetailResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[PhotographDetailData] = None


class BindPhotosRequest(BaseModel):
    photographyIds: List[int]
    buildingId: int


class PhotoTagRequest(BaseModel):
    photographyId: int
    tag: str


class PhotoTypeRequest(BaseModel):
    photographyId: int
    codeValue: str