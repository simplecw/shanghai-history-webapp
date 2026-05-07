import { useState, useEffect } from 'react';
import {
  fetchPhotos,
  fetchPhotoDetail,
  fetchPhotoTags,
  fetchPhotoSources,
  fetchPhotoTypes,
  fetchHistoricalBuildings,
  addPhotoTag,
  addPhotoType,
  deletePhotoTag,
  deletePhotoType,
  unbindPhotoFromBuilding,
  bindPhotosToBuilding,
  getImageUrl,
} from '../services/api';
import type { PhotoItem, PhotoDetail, HistoricalBuildingItem } from '../types';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [source, setSource] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [photoType, setPhotoType] = useState('');
  const [tag, setTag] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);
  const [photoTypes, setPhotoTypes] = useState<Array<{ codeValue: string; codeNameCn: string }>>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState<'type' | 'tag' | 'bind' | null>(null);
  const [batchType, setBatchType] = useState('');
  const [batchTag, setBatchTag] = useState('');
  const [newTag, setNewTag] = useState('');
  const [buildings, setBuildings] = useState<HistoricalBuildingItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const result = await fetchPhotos({
        page, size: pageSize,
        source: source || undefined,
        timePeriod: timePeriod || undefined,
        photoType: photoType || undefined,
        tag: tag || undefined,
      });
      setPhotos(result.list);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [typesResult, tagsResult, sourcesResult] = await Promise.all([
        fetchPhotoTypes(), fetchPhotoTags(), fetchPhotoSources(),
      ]);
      setPhotoTypes(typesResult);
      setAllTags(tagsResult);
      setSources(sourcesResult);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadTimePeriodOptions = async () => {
    try {
      const result = await fetchPhotos({ page: 1, size: 1000 });
      const periodSet = new Set<string>();
      result.list.forEach(p => { if (p.timePeriod) periodSet.add(p.timePeriod); });
      setTimePeriods(Array.from(periodSet).sort());
    } catch (err) {
      console.error('Failed to load time period options:', err);
    }
  };

  const loadBuildings = async () => {
    try {
      const result = await fetchHistoricalBuildings({ size: 500 });
      setBuildings(result.list);
    } catch (err) {
      console.error('Failed to load buildings:', err);
    }
  };

  useEffect(() => { loadFilterOptions(); loadTimePeriodOptions(); }, []);
  useEffect(() => { loadPhotos(); }, [page, source, timePeriod, photoType, tag]);

  const loadPhotoDetail = async (photoId: number) => {
    setDetailLoading(true);
    try {
      const detail = await fetchPhotoDetail(photoId);
      setSelectedPhoto(detail);
    } catch (err) {
      console.error('Failed to load photo detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCardClick = (photo: PhotoItem) => {
    if (multiSelectMode) {
      const newSelected = new Set(selectedPhotoIds);
      if (newSelected.has(photo.id)) { newSelected.delete(photo.id); } else { newSelected.add(photo.id); }
      setSelectedPhotoIds(newSelected);
    } else {
      loadPhotoDetail(photo.id);
    }
  };

  const handleImageClick = (e: React.MouseEvent, imageFilename: string) => {
    e.stopPropagation();
    setLightboxImage(imageFilename);
  };

  const toggleMultiSelect = () => {
    if (multiSelectMode) { setSelectedPhotoIds(new Set()); }
    setMultiSelectMode(!multiSelectMode);
  };

  const resetFilters = () => { setSource(''); setTimePeriod(''); setPhotoType(''); setTag(''); setPage(1); };
  const activeFilterCount = [source, timePeriod, photoType, tag].filter(Boolean).length;

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!selectedPhoto) return;
    if (!confirm(`确定要删除标签"${tagToDelete}"吗？`)) return;
    try {
      await deletePhotoTag(selectedPhoto.id, tagToDelete);
      const detail = await fetchPhotoDetail(selectedPhoto.id);
      setSelectedPhoto(detail);
      loadPhotos();
    } catch (err) { console.error('Failed to delete tag:', err); alert('删除失败'); }
  };

  const handleDeleteType = async (codeValue: string) => {
    if (!selectedPhoto) return;
    if (!confirm(`确定要删除该类型吗？`)) return;
    try {
      await deletePhotoType(selectedPhoto.id, codeValue);
      const detail = await fetchPhotoDetail(selectedPhoto.id);
      setSelectedPhoto(detail);
      loadPhotos();
    } catch (err) { console.error('Failed to delete type:', err); alert('删除失败'); }
  };

  const handleUnbindBuilding = async (buildingId: number) => {
    if (!selectedPhoto) return;
    if (!confirm(`确定要解除与该建筑的关联吗？`)) return;
    try {
      await unbindPhotoFromBuilding(selectedPhoto.id, buildingId);
      const detail = await fetchPhotoDetail(selectedPhoto.id);
      setSelectedPhoto(detail);
      loadPhotos();
    } catch (err) { console.error('Failed to unbind building:', err); alert('解除绑定失败'); }
  };

  const openBatchModal = (type: 'type' | 'tag' | 'bind') => {
    if (type === 'bind') { loadBuildings(); }
    setShowBatchModal(type);
  };

  const handleBatchAddType = async () => {
    if (!batchType || selectedPhotoIds.size === 0) return;
    try {
      for (const photoId of selectedPhotoIds) { await addPhotoType(photoId, batchType); }
      setShowBatchModal(null); setBatchType(''); setSelectedPhotoIds(new Set()); setMultiSelectMode(false);
      loadPhotos();
      alert(`已为 ${selectedPhotoIds.size} 张照片添加类型`);
    } catch (err) { console.error('Failed to add type:', err); alert('添加失败'); }
  };

  const handleBatchAddTag = async () => {
    if (!batchTag.trim() || selectedPhotoIds.size === 0) return;
    try {
      for (const photoId of selectedPhotoIds) { await addPhotoTag(photoId, batchTag.trim()); }
      setShowBatchModal(null); setBatchTag(''); setNewTag(''); setSelectedPhotoIds(new Set()); setMultiSelectMode(false);
      loadPhotos(); loadTimePeriodOptions();
      alert(`已为 ${selectedPhotoIds.size} 张照片添加标签`);
    } catch (err) { console.error('Failed to add tag:', err); alert('添加失败'); }
  };

  const handleBindPhotos = async () => {
    if (!selectedBuildingId || selectedPhotoIds.size === 0) return;
    try {
      await bindPhotosToBuilding(Array.from(selectedPhotoIds), selectedBuildingId);
      setShowBatchModal(null); setSelectedPhotoIds(new Set()); setMultiSelectMode(false); loadPhotos();
      alert(`成功绑定 ${selectedPhotoIds.size} 张照片到建筑`);
    } catch (err) { console.error('Failed to bind photos:', err); alert('绑定失败'); }
  };

  const filteredBuildings = buildings.filter(b => {
    if (!buildingSearch) return true;
    const search = buildingSearch.toLowerCase();
    return ((b.buildingChineseName && b.buildingChineseName.toLowerCase().includes(search)) ||
      (b.buildingName && b.buildingName.toLowerCase().includes(search)) ||
      (b.buildingAddress && b.buildingAddress.toLowerCase().includes(search)));
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#222222] mb-1">📷 上海历史照片</h1>
        <p className="text-sm text-[#717171]">探索珍贵的历史照片收藏</p>
      </div>

      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#717171] whitespace-nowrap">来源</span>
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}
              className="text-sm px-3 py-1.5 bg-white border border-[#dddddd] rounded-lg text-[#222222] focus:outline-none focus:border-[#FF385C] cursor-pointer min-w-[120px]">
              <option value="">不限</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#717171] whitespace-nowrap">时期</span>
            <select value={timePeriod} onChange={(e) => { setTimePeriod(e.target.value); setPage(1); }}
              className="text-sm px-3 py-1.5 bg-white border border-[#dddddd] rounded-lg text-[#222222] focus:outline-none focus:border-[#FF385C] cursor-pointer min-w-[120px]">
              <option value="">不限</option>
              {timePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#717171] whitespace-nowrap">类型</span>
            <select value={photoType} onChange={(e) => { setPhotoType(e.target.value); setPage(1); }}
              className="text-sm px-3 py-1.5 bg-white border border-[#dddddd] rounded-lg text-[#222222] focus:outline-none focus:border-[#FF385C] cursor-pointer min-w-[120px]">
              <option value="">不限</option>
              {photoTypes.map(t => <option key={t.codeValue} value={t.codeValue}>{t.codeNameCn || t.codeValue}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#717171] whitespace-nowrap">标签</span>
            <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }}
              className="text-sm px-3 py-1.5 bg-white border border-[#dddddd] rounded-lg text-[#222222] focus:outline-none focus:border-[#FF385C] cursor-pointer min-w-[120px]">
              <option value="">不限</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-[#FF385C] hover:text-[#B22222]">清除全部</button>
          )}
        </div>
      </div>

      <div className="px-6 py-3 border-b border-[#f7f7f7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#717171]">共 <span className="font-semibold text-[#222222]">{total}</span> 张照片</span>
          <span className="text-xs text-[#717171]">第 {page} / {totalPages} 页</span>
        </div>
        <div className="flex items-center gap-2">
          {multiSelectMode ? (
            <>
              <span className="px-3 py-1.5 bg-[#FF385C] text-white text-sm rounded-full">已选 {selectedPhotoIds.size} 张</span>
              <button onClick={() => openBatchModal('type')} disabled={selectedPhotoIds.size === 0}
                className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50">添加类型</button>
              <button onClick={() => openBatchModal('tag')} disabled={selectedPhotoIds.size === 0}
                className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:opacity-50">添加标签</button>
              <button onClick={() => openBatchModal('bind')} disabled={selectedPhotoIds.size === 0}
                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50">绑定建筑</button>
              <button onClick={toggleMultiSelect} className="px-3 py-1.5 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500">退出多选</button>
            </>
          ) : (
            <button onClick={toggleMultiSelect} className="px-4 py-2 bg-[#222222] text-white text-sm rounded-lg hover:bg-[#333333]">多选模式</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-3 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[#717171]">
            <p className="text-base">未找到匹配的照片</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id}
                  className={`bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-[#FF385C]/30 group ${selectedPhotoIds.has(photo.id) ? 'ring-2 ring-[#FF385C]' : ''}`}
                  onClick={() => handleCardClick(photo)}>
                  <div className="aspect-[4/3] bg-[#f7f7f7] relative overflow-hidden">
                    {photo.imageFilename ? (
                      <img src={getImageUrl(photo.imageFilename)}
                        alt={photo.chineseTitle || photo.englishTitle || '历史照片'}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        onClick={(e) => handleImageClick(e, photo.imageFilename)} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-[#dddddd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {photo.year && (
                      <div className="absolute top-3 left-3 bg-[#222222]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-white text-xs font-semibold">{photo.year}</span>
                      </div>
                    )}
                    {multiSelectMode && (
                      <div className="absolute top-3 right-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPhotoIds.has(photo.id) ? 'bg-[#FF385C] border-[#FF385C]' : 'bg-white/80 border-white'}`}>
                          {selectedPhotoIds.has(photo.id) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#222222] mb-1 line-clamp-1">
                      {photo.chineseTitle || photo.englishTitle || '未命名照片'}
                    </h3>
                    {photo.englishTitle && photo.chineseTitle && photo.englishTitle !== photo.chineseTitle && (
                      <p className="text-xs text-[#717171] mb-2 line-clamp-1">{photo.englishTitle}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {photo.timePeriod && <span className="px-2 py-0.5 bg-[#f7f7f7] text-[#717171] text-xs rounded-md">{photo.timePeriod}</span>}
                      {photo.source && <span className="px-2 py-0.5 bg-[#FF385C]/10 text-[#FF385C] text-xs rounded-md">{photo.source}</span>}
                    </div>
                    {photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.slice(0, 3).map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">{t}</span>
                        ))}
                        {photo.tags.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{photo.tags.length - 3}</span>}
                      </div>
                    )}
                    {photo.buildingCount > 0 && (
                      <div className="mt-2 text-xs text-[#717171]">关联建筑: <span className="text-[#FF385C] font-medium">{photo.buildingCount}</span> 个</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[#f7f7f7] flex items-center justify-between">
        <div className="text-sm text-[#717171]">共 {total} 条记录</div>
        <div className="flex gap-2">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="px-3 py-1.5 border border-[#dddddd] rounded-lg text-sm text-[#222222] hover:bg-[#f7f7f7] disabled:opacity-40">首页</button>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-4 py-1.5 border border-[#dddddd] rounded-lg text-sm text-[#222222] hover:bg-[#f7f7f7] disabled:opacity-40">上一页</button>
          <span className="px-4 py-1.5 bg-[#f7f7f7] rounded-lg text-sm text-[#222222] font-medium">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-4 py-1.5 border border-[#dddddd] rounded-lg text-sm text-[#222222] hover:bg-[#f7f7f7] disabled:opacity-40">下一页</button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-3 py-1.5 border border-[#dddddd] rounded-lg text-sm text-[#222222] hover:bg-[#f7f7f7] disabled:opacity-40">末页</button>
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f7f7f7]">
              <h2 className="text-xl font-semibold text-[#222222]">照片详情</h2>
              <button onClick={() => setSelectedPhoto(null)} className="w-10 h-10 rounded-full bg-[#f7f7f7] hover:bg-[#e8e8e8] flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {detailLoading ? (
                <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-3 border-[#FF385C] border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <>
                  {selectedPhoto.imageFilename && (
                    <div className="mb-6 rounded-2xl overflow-hidden bg-[#f7f7f7]">
                      <img src={getImageUrl(selectedPhoto.imageFilename)} alt="" className="w-full max-h-96 object-contain cursor-pointer" onClick={(e) => handleImageClick(e, selectedPhoto.imageFilename)} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                    <div><label className="text-xs text-[#717171] block mb-1">中文名</label><p className="text-sm font-medium text-[#222222]">{selectedPhoto.chineseTitle || '-'}</p></div>
                    <div><label className="text-xs text-[#717171] block mb-1">外文名</label><p className="text-sm font-medium text-[#222222]">{selectedPhoto.englishTitle || '-'}</p></div>
                    <div><label className="text-xs text-[#717171] block mb-1">年份</label><p className="text-sm font-medium text-[#222222]">{selectedPhoto.year || '-'}</p></div>
                    <div><label className="text-xs text-[#717171] block mb-1">年代</label><p className="text-sm font-medium text-[#222222]">{selectedPhoto.timePeriod || '-'}</p></div>
                    <div><label className="text-xs text-[#717171] block mb-1">来源</label><p className="text-sm font-medium text-[#222222]">{selectedPhoto.source || '-'}</p></div>
                  </div>
                  {selectedPhoto.description && (
                    <div className="mb-6 p-4 bg-[#fff8f6] rounded-xl border border-[#ffddd2]">
                      <label className="text-xs text-[#717171] block mb-1">描述</label><p className="text-sm text-[#222222]">{selectedPhoto.description}</p>
                    </div>
                  )}
                  <div className="mb-6">
                    <label className="text-xs text-[#717171] block mb-2">标签</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.length > 0 ? selectedPhoto.tags.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {t}<button onClick={() => handleDeleteTag(t)} className="ml-1 text-purple-500 hover:text-purple-700 font-bold">×</button>
                        </span>
                      )) : <span className="text-[#717171] text-sm">暂无标签</span>}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-xs text-[#717171] block mb-2">类型</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.types.length > 0 ? selectedPhoto.types.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {t.codeNameCn || t.codeValue}<button onClick={() => handleDeleteType(t.codeValue)} className="ml-1 text-orange-500 hover:text-orange-700 font-bold">×</button>
                        </span>
                      )) : <span className="text-[#717171] text-sm">暂无类型</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#717171] block mb-2">关联建筑</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.buildings.length > 0 ? selectedPhoto.buildings.map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {b.buildingChineseName || `建筑 ${b.buildingId}`}<button onClick={() => handleUnbindBuilding(b.buildingId)} className="ml-1 text-amber-500 hover:text-amber-700 font-bold">×</button>
                        </span>
                      )) : <span className="text-[#717171] text-sm">暂无关联建筑</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showBatchModal === 'type' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-[#222222] mb-4">批量添加类型</h2>
            <select value={batchType} onChange={(e) => setBatchType(e.target.value)} className="w-full px-4 py-2.5 border border-[#dddddd] rounded-xl text-[#222222] focus:outline-none focus:border-[#FF385C] mb-6">
              <option value="">请选择类型</option>
              {photoTypes.map(t => <option key={t.codeValue} value={t.codeValue}>{t.codeNameCn || t.codeValue}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowBatchModal(null); setBatchType(''); }} className="px-4 py-2 bg-[#f7f7f7] text-[#222222] rounded-lg">取消</button>
              <button onClick={handleBatchAddType} disabled={!batchType} className="px-4 py-2 bg-[#FF385C] text-white rounded-lg disabled:opacity-50">确认添加</button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal === 'tag' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-[#222222] mb-4">批量添加标签</h2>
            <select value={batchTag} onChange={(e) => { setBatchTag(e.target.value); setNewTag(''); }} className="w-full px-4 py-2.5 border border-[#dddddd] rounded-xl text-[#222222] focus:outline-none focus:border-[#FF385C] mb-4">
              <option value="">选择标签...</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" value={newTag} onChange={(e) => { setNewTag(e.target.value); setBatchTag(''); }} placeholder="或输入新标签名称" className="w-full px-4 py-2.5 border border-[#dddddd] rounded-xl text-[#222222] focus:outline-none focus:border-[#FF385C] mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowBatchModal(null); setBatchTag(''); setNewTag(''); }} className="px-4 py-2 bg-[#f7f7f7] text-[#222222] rounded-lg">取消</button>
              <button onClick={handleBatchAddTag} disabled={!batchTag.trim() && !newTag.trim()} className="px-4 py-2 bg-[#FF385C] text-white rounded-lg disabled:opacity-50">确认添加</button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal === 'bind' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-semibold text-[#222222] mb-4">绑定到建筑</h2>
            <input type="text" placeholder="输入建筑名称搜索..." value={buildingSearch} onChange={(e) => setBuildingSearch(e.target.value)} className="w-full px-4 py-2.5 border border-[#dddddd] rounded-xl text-[#222222] focus:outline-none focus:border-[#FF385C] mb-3" />
            <div className="flex-1 overflow-y-auto border border-[#dddddd] rounded-xl max-h-[300px]">
              {filteredBuildings.length === 0 ? (
                <div className="p-4 text-center text-[#717171]">没有找到匹配的建筑</div>
              ) : (
                filteredBuildings.map(b => (
                  <div key={b.buildingId} onClick={() => setSelectedBuildingId(b.buildingId)} className={`px-4 py-3 cursor-pointer border-b border-[#f7f7f7] last:border-b-0 hover:bg-[#fff8f6] ${selectedBuildingId === b.buildingId ? 'bg-[#fff8f6]' : ''}`}>
                    <div className="font-medium text-[#222222]">{b.buildingChineseName || b.buildingName || `建筑 #${b.buildingId}`}</div>
                    <div className="text-sm text-[#717171]">{b.buildingAddress || '无地址'}</div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowBatchModal(null); setSelectedBuildingId(null); setBuildingSearch(''); }} className="px-4 py-2 bg-[#f7f7f7] text-[#222222] rounded-lg">取消</button>
              <button onClick={handleBindPhotos} disabled={!selectedBuildingId} className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50">确认绑定</button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[3000]" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300" onClick={() => setLightboxImage(null)}>✕</button>
          <img src={getImageUrl(lightboxImage)} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}