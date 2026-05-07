import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BuildingItem } from '../types';
import { fetchBuildings } from '../services/api';
import { bd09ToWgs84 } from '../utils/coordinate';
import BuildingDetailModal from './BuildingDetailModal';

// Fix Leaflet default icon
const markerIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x.png';
const markerShadow = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Filters {
  preservationCategory: string;
  batch: string;
}

export default function BuildingMap() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    preservationCategory: '',
    batch: '',
  });
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadBuildings();
  }, [filters]);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const data = await fetchBuildings(filters);
      setBuildings(data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (building: BuildingItem) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBuilding(null);
  };

  const getMarkerIcon = (buildingId: number) => {
    if (selectedBuilding?.buildingId === buildingId || hoveredMarkerId === buildingId) {
      return RedIcon;
    }
    return DefaultIcon;
  };

  const uniqueCategories = [...new Set(buildings.map(b => b.preservationCategory).filter(Boolean))];
  const uniqueBatches = [...new Set(buildings.map(b => b.batch).filter(Boolean))];

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">保护等级:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filters.preservationCategory}
            onChange={(e) => setFilters({ ...filters, preservationCategory: e.target.value })}
          >
            <option value="">全部</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat!}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">文物批次:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="">全部</option>
            {uniqueBatches.map(batch => (
              <option key={batch} value={batch!}>{batch}</option>
            ))}
          </select>
        </div>
        <button
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={() => setFilters({ preservationCategory: '', batch: '' })}
        >
          重置
        </button>
        <span className="text-sm text-gray-500 ml-auto">
          共 {buildings.length} 个建筑
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-gray-600">加载中...</div>
          </div>
        )}
        <MapContainer
          center={[31.2304, 121.4737]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {buildings.map((building) => {
            const position = building.latitude && building.longitude
              ? bd09ToWgs84(building.latitude, building.longitude)
              : null;
            
            if (!position || (position[0] === 0 && position[1] === 0)) return null;

            return (
              <Marker
                key={building.buildingId}
                position={position}
                icon={getMarkerIcon(building.buildingId)}
                eventHandlers={{
                  click: () => handleMarkerClick(building),
                  mouseover: () => setHoveredMarkerId(building.buildingId),
                  mouseout: () => setHoveredMarkerId(null),
                }}
              >
                <Popup>
                  <div className="min-w-48">
                    <h3 className="font-bold">{building.currentName || building.originalName}</h3>
                    <p className="text-sm text-gray-600">{building.address}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Detail Modal */}
      {selectedBuilding && (
        <BuildingDetailModal
          buildingId={selectedBuilding.buildingId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}