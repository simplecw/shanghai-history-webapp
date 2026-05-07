import type { BuildingItem, BuildingDetail, MapItem, MapDetail } from '../types';

const API_BASE = 'http://localhost:5205/api/v1';

// ============ Buildings API ============

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