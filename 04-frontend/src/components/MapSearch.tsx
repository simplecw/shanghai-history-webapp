import { useState, useEffect } from 'react';
import type { MapItem } from '../types';
import { fetchMaps } from '../services/api';
import MapDetailModal from './MapDetailModal';

const FILTER_FIELDS = [
  { key: 'mapType', label: '地图类型' },
  { key: 'subtype', label: '子类型' },
  { key: 'tags', label: '标签' },
  { key: 'series', label: '系列' },
  { key: 'clarity', label: '清晰度' },
  { key: 'importance', label: '重要性' },
  { key: 'usageSuggestions', label: '使用建议' },
  { key: 'source', label: '来源' },
  { key: 'year', label: '年份' },
];

const DISPLAY_COLUMNS = [
  { key: 'title', label: '标题' },
  { key: 'chineseName', label: '中文名' },
  { key: 'foreignName', label: '外文名' },
  { key: 'year', label: '年份' },
  { key: 'era', label: '时代' },
  { key: 'mapType', label: '地图类型' },
];

export default function MapSearch() {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState<Record<string, string[]>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadMaps();
  }, [filters]);

  const loadMaps = async () => {
    setLoading(true);
    try {
      const data = await fetchMaps(filters);
      setMaps(data.list);
      setTotal(data.total);
      setUniqueValues(data.uniqueValues);
    } catch (error) {
      console.error('Failed to load maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleRowClick = (map: MapItem) => {
    setSelectedMap(map);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMap(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filters */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex flex-wrap gap-4 items-end">
          {FILTER_FIELDS.map(field => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{field.label}</label>
              <select
                className="border rounded px-2 py-1 text-sm min-w-24"
                value={filters[field.key] || ''}
                onChange={(e) => handleFilterChange(field.key, e.target.value)}
              >
                <option value="">全部</option>
                {(uniqueValues[field.key] || []).map(val => (
                  <option key={val} value={val}>{val || '(空)'}</option>
                ))}
              </select>
            </div>
          ))}
          <button
            className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1"
            onClick={resetFilters}
          >
            重置
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">共 {total} 条记录</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center">加载中...</div>
        ) : maps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">未找到匹配的记录</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {DISPLAY_COLUMNS.map(col => (
                  <th key={col.key} className="border px-4 py-2 text-left">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maps.map(map => (
                <tr
                  key={map.mapId}
                  className="border hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(map)}
                >
                  {DISPLAY_COLUMNS.map(col => (
                    <td key={col.key} className="border px-4 py-2">
                      {String((map as unknown as Record<string, string | number | undefined>)[col.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMap && (
        <MapDetailModal
          mapId={selectedMap.mapId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}