export interface BuildingItem {
  buildingId: number;
  currentName?: string;
  originalName?: string;
  address?: string;
  preservationCategory?: string;
  batch?: string;
  constructionYear?: string;
  imagePath?: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotographyItem {
  photographyId: number;
  imageFilename: string;
}

export interface BuildingDetail {
  buildingId: number;
  currentName?: string;
  originalName?: string;
  address?: string;
  structureType?: string;
  constructionYear?: string;
  preservationCategory?: string;
  preservationRequirements?: string;
  imagePath?: string;
  latitude?: number;
  longitude?: number;
  batch?: string;
  photos: PhotographyItem[];
}

export interface MapItem {
  mapId: number;
  title?: string;
  chineseName?: string;
  foreignName?: string;
  year?: string;
  era?: string;
  mapType?: string;
  imageFilename?: string;
}

export interface MapDetail {
  mapId: number;
  fileNumber?: string;
  title?: string;
  chineseName?: string;
  foreignName?: string;
  year?: string;
  era?: string;
  pinyin?: string;
  imageFilename?: string;
  videoAvailable?: string;
  mapType?: string;
  subtype?: string;
  tags?: string;
  series?: string;
  clarity?: string;
  importance?: string;
  usageSuggestions?: string;
  source?: string;
}

// ============ Historical Building Types ============

export interface CodeTypeItem {
  codeType: string;
  codeValue: string;
  codeNameCn: string;
}

export interface HistoricalBuildingItem {
  buildingId: number;
  buildingName: string;
  buildingChineseName: string;
  buildingAddress: string;
  dateStart: string;
  dateEnd: string;
  xAxis?: number;
  yAxis?: number;
  bdLng?: number;
  bdLat?: number;
  types: CodeTypeItem[];
  photoCount: number;
}

export interface HistoricalBuildingDetail {
  buildingId: number;
  buildingName: string;
  buildingChineseName: string;
  buildingAddress: string;
  dateStart: string;
  dateEnd: string;
  xAxis?: number;
  yAxis?: number;
  types: CodeTypeItem[];
  photos: PhotographyItem[];
}

// ============ Photo Types ============

export interface PhotoItem {
  id: number;
  chineseTitle: string;
  englishTitle: string;
  source: string;
  year: string;
  timePeriod: string;
  imageFilename: string;
  tags: string[];
  types: CodeTypeItem[];
  buildingCount: number;
}

export interface PhotoDetail {
  id: number;
  chineseTitle: string;
  englishTitle: string;
  source: string;
  year: string;
  timePeriod: string;
  description: string;
  imageFilename: string;
  tags: string[];
  types: CodeTypeItem[];
  buildings: Array<{ buildingId: number; buildingChineseName: string }>;
}

// ============ Timeline / Events Types ============

export interface TimelineEvent {
  eventId: number;
  eventName: string;
  eventYear: string;
  eventDate?: string;
  reignTitle?: string;
  eventDescription?: string;
  eventImportance: string;
  eventCategory: string;
  eventSubCategory?: string;
  showDate?: Date;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface ImportanceLevelCount {
  level: string;
  label: string;
  count: number;
}

export interface PopulationRecord {
  year: string;
  location: string;
  locationName: string;
  value: number;
}

export interface LandValuationRecord {
  year: string;
  location: string;
  locationName: string;
  statisticsGroup?: string;
  value: number;
}

export interface TradeRecord {
  year: string;
  importsTotal: number;
  importsShanghai: number;
  exportsTotal: number;
  exportsShanghai: number;
  tradeTotal: number;
  tradeShanghai: number;
  importsRatio: number;
  exportsRatio: number;
  tradeRatio: number;
}

// ============ API Response ============

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}