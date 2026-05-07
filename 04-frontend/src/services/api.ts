import type { BuildingItem, BuildingDetail, MapItem, MapDetail, HistoricalBuildingItem, HistoricalBuildingDetail, PhotoItem, PhotoDetail } from '../types';

const API_BASE = 'http://localhost:5205/api/v1';

// ============ Buildings API (Map) ============

export async function fetchBuildings(filters: {
  preservationCategory?: string;
  batch?: string;
}): Promise<BuildingItem[]> {
  const params = new URLSearchParams({ page: '1', size: '1000' });
  if (filters.preservationCategory) params.append('preservationCategory', filters.preservationCategory);
  if (filters.batch) params.append('batch', filters.batch);
  
  const res = await fetch(`${API_BASE}/buildings?${params}`);
  const json = await res.json();
  return json.data?.list || [];
}

export async function fetchBuildingDetail(id: number): Promise<BuildingDetail | null> {
  const res = await fetch(`${API_BASE}/buildings/${id}`);
  const json = await res.json();
  return json.data || null;
}

// ============ Historical Buildings API (CRUD) ============

export async function fetchHistoricalBuildings(filters: {
  page?: number;
  size?: number;
  name?: string;
  address?: string;
  buildingType?: string;
  dateStart?: string;
  dateEnd?: string;
  hasPhotos?: boolean;
} = {}): Promise<{ list: HistoricalBuildingItem[]; total: number }> {
  const params = new URLSearchParams();
  params.append('page', String(filters.page || 1));
  params.append('size', String(filters.size || 50));
  if (filters.name) params.append('name', filters.name);
  if (filters.address) params.append('address', filters.address);
  if (filters.buildingType) params.append('buildingType', filters.buildingType);
  if (filters.dateStart) params.append('dateStart', filters.dateStart);
  if (filters.dateEnd) params.append('dateEnd', filters.dateEnd);
  if (filters.hasPhotos) params.append('hasPhotos', 'true');
  
  const res = await fetch(`${API_BASE}/historical-buildings?${params}`);
  const json = await res.json();
  return {
    list: json.data?.list || [],
    total: json.data?.total || 0
  };
}

export async function fetchHistoricalBuildingDetail(id: number): Promise<HistoricalBuildingDetail | null> {
  const res = await fetch(`${API_BASE}/historical-buildings/${id}`);
  const json = await res.json();
  return json.data || null;
}

export async function createHistoricalBuilding(data: {
  buildingName: string;
  buildingChineseName: string;
  buildingAddress: string;
  dateStart?: string;
  dateEnd?: string;
  types?: string[];
}): Promise<number> {
  const res = await fetch(`${API_BASE}/historical-buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json.data?.buildingId || 0;
}

export async function updateHistoricalBuilding(id: number, data: {
  buildingName?: string;
  buildingChineseName?: string;
  buildingAddress?: string;
  dateStart?: string;
  dateEnd?: string;
  types?: string[];
}): Promise<void> {
  await fetch(`${API_BASE}/historical-buildings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteHistoricalBuilding(id: number): Promise<void> {
  await fetch(`${API_BASE}/historical-buildings/${id}`, {
    method: 'DELETE'
  });
}

export async function addBuildingType(buildingId: number, codeValue: string): Promise<void> {
  await fetch(`${API_BASE}/historical-buildings/${buildingId}/types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codeValue })
  });
}

export async function deleteBuildingType(buildingId: number, codeValue: string): Promise<void> {
  await fetch(`${API_BASE}/historical-buildings/${buildingId}/types/${encodeURIComponent(codeValue)}`, {
    method: 'DELETE'
  });
}

export async function fetchBuildingTypes(): Promise<Array<{ codeType: string; codeValue: string; codeNameCn: string }>> {
  const res = await fetch(`${API_BASE}/building-types`);
  const json = await res.json();
  return json.data || [];
}

// ============ Photos API ============

export async function fetchPhotos(filters: {
  page?: number;
  size?: number;
  source?: string;
  timePeriod?: string;
  photoType?: string;
  tag?: string;
  buildingId?: number;
} = {}): Promise<{ list: PhotoItem[]; total: number }> {
  const params = new URLSearchParams();
  params.append('page', String(filters.page || 1));
  params.append('size', String(filters.size || 50));
  if (filters.source) params.append('source', filters.source);
  if (filters.timePeriod) params.append('timePeriod', filters.timePeriod);
  if (filters.photoType) params.append('photoType', filters.photoType);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.buildingId) params.append('buildingId', String(filters.buildingId));
  
  const res = await fetch(`${API_BASE}/photographs?${params}`);
  const json = await res.json();
  return {
    list: json.data?.list || [],
    total: json.data?.total || 0
  };
}

export async function fetchPhotoDetail(id: number): Promise<PhotoDetail | null> {
  const res = await fetch(`${API_BASE}/photographs/${id}`);
  const json = await res.json();
  return json.data || null;
}

export async function bindPhotosToBuilding(photoIds: number[], buildingId: number): Promise<number> {
  const res = await fetch(`${API_BASE}/photographs/bindings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photographyIds: photoIds, buildingId })
  });
  const json = await res.json();
  return json.data?.successCount || 0;
}

export async function bindPhotoToBuilding(photoId: number, buildingId: number): Promise<void> {
  await fetch(`${API_BASE}/photographs/${photoId}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buildingId })
  });
}

export async function unbindPhotoFromBuilding(photoId: number, buildingId: number): Promise<void> {
  await fetch(`${API_BASE}/photographs/${photoId}/buildings/${buildingId}`, {
    method: 'DELETE'
  });
}

export async function addPhotoTag(photoId: number, tag: string): Promise<void> {
  await fetch(`${API_BASE}/photographs/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photographyId: photoId, tag })
  });
}

export async function deletePhotoTag(photoId: number, tag: string): Promise<void> {
  await fetch(`${API_BASE}/photographs/${photoId}/tags/${encodeURIComponent(tag)}`, {
    method: 'DELETE'
  });
}

export async function addPhotoType(photoId: number, codeValue: string): Promise<void> {
  await fetch(`${API_BASE}/photographs/types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photographyId: photoId, codeValue })
  });
}

export async function deletePhotoType(photoId: number, codeValue: string): Promise<void> {
  await fetch(`${API_BASE}/photographs/${photoId}/types/${encodeURIComponent(codeValue)}`, {
    method: 'DELETE'
  });
}

export async function fetchPhotoTags(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/photo-tags`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchPhotoTypes(): Promise<Array<{ codeType: string; codeValue: string; codeNameCn: string }>> {
  const res = await fetch(`${API_BASE}/photo-types`);
  const json = await res.json();
  return json.data || [];
}

// ============ Maps API ============

export async function fetchMaps(filters: Record<string, string> = {}): Promise<{
  list: MapItem[];
  total: number;
  uniqueValues: Record<string, string[]>;
}> {
  const params = new URLSearchParams({ page: '1', size: '100', ...filters });
  const res = await fetch(`${API_BASE}/maps?${params}`);
  const json = await res.json();
  return {
    list: json.data?.list || [],
    total: json.data?.total || 0,
    uniqueValues: json.data?.uniqueValues || {}
  };
}

export async function fetchMapDetail(id: number): Promise<MapDetail | null> {
  const res = await fetch(`${API_BASE}/maps/${id}`);
  const json = await res.json();
  return json.data || null;
}

// ============ Image URL ============

export function getImageUrl(filename: string | undefined): string {
  if (!filename) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (filename.startsWith('http')) return filename;
  return `http://localhost:5205/data/${filename}`;
}