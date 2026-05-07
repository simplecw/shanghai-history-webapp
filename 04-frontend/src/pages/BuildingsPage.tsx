import { useState, useEffect } from 'react';
import {
  fetchHistoricalBuildings,
  createHistoricalBuilding,
  updateHistoricalBuilding,
  deleteHistoricalBuilding,
  deleteBuildingType,
  getImageUrl,
  fetchHistoricalBuildingDetail,
} from '../services/api';
import type { HistoricalBuildingItem } from '../types';

// Image Lightbox Component
function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: { src: string; alt: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]?.src}
          alt={images[currentIndex]?.alt}
          className="max-w-full max-h-[85vh] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl"
        >
          ✕
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-3xl"
            >
              ←
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-3xl"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 px-4 py-2 rounded-full text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Building Detail Modal
function BuildingDetailModal({
  building,
  allPhotos,
  onClose,
  onEdit,
  onDelete,
  onDeleteType,
}: {
  building: HistoricalBuildingItem;
  allPhotos: any[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteType: (typeValue: string) => void;
}) {
  const [detailImages, setDetailImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    const imgs = allPhotos
      .filter((p) => p.imageFilename)
      .map((p) => ({ src: getImageUrl(p.imageFilename), alt: p.chineseTitle || p.englishTitle || '照片' }));
    setDetailImages(imgs);
  }, [allPhotos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50" onClick={onClose} />
      <div className="fixed inset-4 z-[1000] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{building.buildingChineseName || building.buildingName || '建筑详情'}</h2>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              删除
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e0315c] transition-colors"
            >
              修改
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              关闭
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">基本信息</h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-24 text-gray-500">建筑名称：</span>
                  <span className="font-medium">{building.buildingChineseName || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-500">英文名称：</span>
                  <span>{building.buildingName || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-500">地址：</span>
                  <span>{building.buildingAddress || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-500">年代：</span>
                  <span>{building.dateStart || '-'} ~ {building.dateEnd || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-500">类型：</span>
                  <div className="flex flex-wrap gap-1">
                    {building.types && building.types.length > 0 ? (
                      building.types.map((type: any, idx: number) => {
                        // Handle both string types (from list API) and object types (from detail API)
                        const typeValue = typeof type === 'string' ? type : type.codeValue;
                        const typeName = typeof type === 'string' ? type : (type.codeNameCn || type.codeValue);
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-sm flex items-center gap-1"
                          >
                            {typeName}
                            <button
                              onClick={() => onDeleteType(typeValue)}
                              className="ml-1 text-purple-500 hover:text-purple-800 font-bold"
                              title="删除类型"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-500">照片数量：</span>
                  <span className="text-[#ff385c] font-medium">{building.photoCount} 张</span>
                </div>
              </div>
            </div>

            {/* Photos Gallery */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                关联照片 ({allPhotos.length} 张)
              </h3>
              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                  {allPhotos.map((photo, idx) => (
                    <div
                      key={photo.photographyId}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setLightboxIndex(idx)}
                    >
                      <img
                        src={getImageUrl(photo.imageFilename)}
                        alt={photo.chineseTitle || photo.englishTitle || '照片'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
                  暂无关联照片
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex >= 0 && (
        <ImageLightbox
          images={detailImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + detailImages.length) % detailImages.length)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % detailImages.length)}
        />
      )}
    </>
  );
}

// Building Form Modal
function BuildingFormModal({
  building,
  buildingTypes,
  onClose,
  onSubmit,
  isEdit,
}: {
  building?: HistoricalBuildingItem;
  buildingTypes: {codeValue: string; codeNameCn: string | null}[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isEdit: boolean;
}) {
  const [formData, setFormData] = useState({
    buildingChineseName: building?.buildingChineseName || '',
    buildingName: building?.buildingName || '',
    buildingAddress: building?.buildingAddress || '',
    dateStart: building?.dateStart || '',
    dateEnd: building?.dateEnd || '',
    xAxis: building?.xAxis?.toString() || '',
    yAxis: building?.yAxis?.toString() || '',
    bdLng: building?.bdLng?.toString() || '',
    bdLat: building?.bdLat?.toString() || '',
    // Extract codeValue from types (may be object array or string array)
    types: (building?.types || []).map((t: string | {codeValue: string}) => 
      typeof t === 'string' ? t : t.codeValue
    ),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      xAxis: formData.xAxis ? parseFloat(formData.xAxis) : undefined,
      yAxis: formData.yAxis ? parseFloat(formData.yAxis) : undefined,
      bdLng: formData.bdLng ? parseFloat(formData.bdLng) : undefined,
      bdLat: formData.bdLat ? parseFloat(formData.bdLat) : undefined,
    });
  };

  const toggleType = (codeValue: string) => {
    setFormData((prev) => ({
      ...prev,
      types: prev.types.includes(codeValue)
        ? prev.types.filter((t) => t !== codeValue)
        : [...prev.types, codeValue],
    }));
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50" onClick={onClose} />
      <div className="fixed inset-4 z-[1000] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{isEdit ? '修改建筑' : '添加建筑'}</h2>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            取消
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">中文名称 *</label>
              <input
                type="text"
                value={formData.buildingChineseName}
                onChange={(e) => setFormData((p) => ({ ...p, buildingChineseName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">英文名称</label>
              <input
                type="text"
                value={formData.buildingName}
                onChange={(e) => setFormData((p) => ({ ...p, buildingName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
              <input
                type="text"
                value={formData.buildingAddress}
                onChange={(e) => setFormData((p) => ({ ...p, buildingAddress: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始年代</label>
                <input
                  type="text"
                  value={formData.dateStart}
                  onChange={(e) => setFormData((p) => ({ ...p, dateStart: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                  placeholder="1900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束年代</label>
                <input
                  type="text"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData((p) => ({ ...p, dateEnd: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                  placeholder="1920"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X坐标</label>
                <input
                  type="text"
                  value={formData.xAxis}
                  onChange={(e) => setFormData((p) => ({ ...p, xAxis: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y坐标</label>
                <input
                  type="text"
                  value={formData.yAxis}
                  onChange={(e) => setFormData((p) => ({ ...p, yAxis: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BD_LNG (百度经度)</label>
                <input
                  type="text"
                  value={formData.bdLng}
                  onChange={(e) => setFormData((p) => ({ ...p, bdLng: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BD_LAT (百度纬度)</label>
                <input
                  type="text"
                  value={formData.bdLat}
                  onChange={(e) => setFormData((p) => ({ ...p, bdLat: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">建筑类型</label>
              <div className="flex flex-wrap gap-2">
                {buildingTypes.map((type) => (
                  <button
                    key={type.codeValue}
                    type="button"
                    onClick={() => toggleType(type.codeValue)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.types.includes(type.codeValue)
                        ? 'bg-[#ff385c] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.codeNameCn || type.codeValue}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              取消
            </button>
            <button type="submit" className="px-6 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e0315c]">
              {isEdit ? '保存修改' : '添加建筑'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<HistoricalBuildingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  
  // Filters
  const [chineseName, setChineseName] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [hasPhotos, setHasPhotos] = useState<'' | 'true' | 'false'>('');
  const [buildingTypes, setBuildingTypes] = useState<{codeValue: string; codeNameCn: string | null}[]>([]);
  
  // Modals
  const [selectedBuilding, setSelectedBuilding] = useState<HistoricalBuildingItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<HistoricalBuildingItem | undefined>();
  const [buildingPhotos, setBuildingPhotos] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadBuildingTypes();
  }, []);

  useEffect(() => {
    loadBuildings();
  }, [page, chineseName, buildingType, hasPhotos]);

  const loadBuildingTypes = async () => {
    try {
      const response = await fetch('http://localhost:5205/api/v1/building-types');
      const data = await response.json();
      setBuildingTypes(data.data || []);
    } catch (err) {
      console.error('Failed to load building types:', err);
    }
  };

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const result = await fetchHistoricalBuildings({
        chineseName: chineseName || undefined,
        buildingType: buildingType || undefined,
        hasPhotos: hasPhotos === 'true' ? true : hasPhotos === 'false' ? false : undefined,
        page,
        size: pageSize,
      });
      setBuildings(result.list);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadBuildings();
  };

  const handleReset = () => {
    setChineseName('');
    setBuildingType('');
    setHasPhotos('');
    setPage(1);
  };

  const handleViewDetail = async (building: HistoricalBuildingItem) => {
    setSelectedBuilding(building);
    setDetailLoading(true);
    setBuildingPhotos([]);
    try {
      const detail = await fetchHistoricalBuildingDetail(building.buildingId);
      if (detail) {
        setBuildingPhotos(detail.photos || []);
        // Update selected building with photos from detail
        setSelectedBuilding(prev => prev ? { ...prev, photos: detail.photos } : prev);
      }
    } catch (err) {
      console.error('Failed to load building detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBuilding(undefined);
    setShowFormModal(true);
  };

  const handleEdit = (building: HistoricalBuildingItem) => {
    setEditingBuilding(building);
    setSelectedBuilding(null);
    setShowFormModal(true);
  };

  const handleDeleteBuilding = async (buildingId: number) => {
    if (!confirm('确定要删除这个建筑吗？')) return;
    try {
      await deleteHistoricalBuilding(buildingId);
      setSelectedBuilding(null);
      loadBuildings();
    } catch (err) {
      console.error('Failed to delete building:', err);
      alert('删除失败');
    }
  };

  const handleDeleteType = async (buildingId: number, typeValue: string) => {
    try {
      await deleteBuildingType(buildingId, typeValue);
      // Update selectedBuilding types - handle both string and object arrays
      setSelectedBuilding(prev => prev ? {
        ...prev,
        types: (prev.types || []).filter((t: string | {codeValue: string}) => {
          const val = typeof t === 'string' ? t : (t as any).codeValue;
          return val !== typeValue;
        })
      } : prev);
      loadBuildings();
    } catch (err) {
      console.error('Failed to delete type:', err);
      alert('删除类型失败');
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      if (editingBuilding) {
        await updateHistoricalBuilding(editingBuilding.buildingId, data);
      } else {
        await createHistoricalBuilding(data);
      }
      setShowFormModal(false);
      setEditingBuilding(undefined);
      loadBuildings();
    } catch (err) {
      console.error('Failed to submit form:', err);
      alert('操作失败，请重试');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">历史建筑</h1>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e0315c] transition-colors font-medium"
          >
            + 添加建筑
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">中文名称</label>
            <input
              type="text"
              value={chineseName}
              onChange={(e) => setChineseName(e.target.value)}
              placeholder="搜索建筑名称..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">建筑类型</label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
            >
              <option value="">全部类型</option>
              {buildingTypes.map((type) => (
                <option key={type.codeValue} value={type.codeNameCn || type.codeValue}>
                  {type.codeNameCn || type.codeValue}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">是否有图片</label>
            <select
              value={hasPhotos}
              onChange={(e) => setHasPhotos(e.target.value as '' | 'true' | 'false')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff385c] focus:border-transparent"
            >
              <option value="">全部</option>
              <option value="true">有图片</option>
              <option value="false">无图片</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e0315c] transition-colors"
            >
              搜索
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">加载中...</div>
          ) : buildings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无数据</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">中文名称</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">地址</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">年代</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">类型</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">照片</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buildings.map((building) => (
                  <tr key={building.buildingId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{building.buildingId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{building.buildingChineseName || '-'}</div>
                      <div className="text-sm text-gray-500">{building.buildingName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {building.buildingAddress || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {building.dateStart || '-'} ~ {building.dateEnd || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {building.types.slice(0, 2).map((type, idx) => {
                          const typeObj = typeof type === 'string' ? { codeValue: type, codeNameCn: type } : type;
                          return (
                            <span key={typeObj.codeValue + idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {typeObj.codeNameCn || typeObj.codeValue}
                            </span>
                          );
                        })}
                        {building.types.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{building.types.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${building.photoCount > 0 ? 'text-[#ff385c]' : 'text-gray-400'}`}>
                        {building.photoCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetail(building)}
                        className="px-3 py-1 text-sm text-[#ff385c] hover:bg-[#fff5f7] rounded transition-colors"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {total} 条记录，第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                首页
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                上一页
              </button>
              <span className="px-4 py-1 bg-gray-100 rounded">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                下一页
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                末页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBuilding && !detailLoading && (
        <BuildingDetailModal
          building={selectedBuilding}
          allPhotos={buildingPhotos}
          onClose={() => {
            setSelectedBuilding(null);
            setBuildingPhotos([]);
          }}
          onEdit={() => handleEdit(selectedBuilding)}
          onDelete={() => handleDeleteBuilding(selectedBuilding.buildingId)}
          onDeleteType={(typeValue) => handleDeleteType(selectedBuilding.buildingId, typeValue)}
        />
      )}

      {/* Form Modal */}
      {showFormModal && (
        <BuildingFormModal
          building={editingBuilding}
          buildingTypes={buildingTypes}
          onClose={() => {
            setShowFormModal(false);
            setEditingBuilding(undefined);
          }}
          onSubmit={handleSubmitForm}
          isEdit={!!editingBuilding}
        />
      )}
    </div>
  );
}
