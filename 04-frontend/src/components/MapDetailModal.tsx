import { useState, useEffect } from 'react';
import type { MapDetail } from '../types';
import { fetchMapDetail, getImageUrl } from '../services/api';
import ImageLightbox from './ImageLightbox';

interface MapDetailModalProps {
  mapId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MapDetailModal({ mapId, isOpen, onClose }: MapDetailModalProps) {
  const [detail, setDetail] = useState<MapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (isOpen && mapId) {
      loadDetail();
    }
  }, [isOpen, mapId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchMapDetail(mapId);
      setDetail(data);
    } catch (error) {
      console.error('Failed to load map detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allImages = detail?.imageFilename
    ? [{ src: getImageUrl(detail.imageFilename), alt: detail.title || 'Map image' }]
    : [];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {detail?.title || detail?.chineseName || '地图详情'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">加载中...</div>
          ) : detail ? (
            <div className="p-6">
              {/* Image Section */}
              {detail.imageFilename && (
                <div className="mb-6">
                  <div
                    className="relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={getImageUrl(detail.imageFilename)}
                      alt={detail.title || 'Map image'}
                      className="w-full max-h-96 object-contain bg-gray-100"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                      点击放大
                    </div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">地图信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {detail.fileNumber && (
                    <div>
                      <span className="text-gray-500">档案号：</span>
                      <span className="font-medium">{detail.fileNumber}</span>
                    </div>
                  )}
                  {detail.title && (
                    <div>
                      <span className="text-gray-500">标题：</span>
                      <span className="font-medium">{detail.title}</span>
                    </div>
                  )}
                  {detail.chineseName && (
                    <div>
                      <span className="text-gray-500">中文名：</span>
                      <span className="font-medium">{detail.chineseName}</span>
                    </div>
                  )}
                  {detail.foreignName && (
                    <div>
                      <span className="text-gray-500">外文名：</span>
                      <span className="font-medium">{detail.foreignName}</span>
                    </div>
                  )}
                  {detail.year && (
                    <div>
                      <span className="text-gray-500">年份：</span>
                      <span className="font-medium">{detail.year}</span>
                    </div>
                  )}
                  {detail.era && (
                    <div>
                      <span className="text-gray-500">时代：</span>
                      <span className="font-medium">{detail.era}</span>
                    </div>
                  )}
                  {detail.pinyin && (
                    <div>
                      <span className="text-gray-500">拼音：</span>
                      <span className="font-medium">{detail.pinyin}</span>
                    </div>
                  )}
                  {detail.mapType && (
                    <div>
                      <span className="text-gray-500">地图类型：</span>
                      <span className="font-medium">{detail.mapType}</span>
                    </div>
                  )}
                  {detail.subtype && (
                    <div>
                      <span className="text-gray-500">子类型：</span>
                      <span className="font-medium">{detail.subtype}</span>
                    </div>
                  )}
                  {detail.series && (
                    <div>
                      <span className="text-gray-500">系列：</span>
                      <span className="font-medium">{detail.series}</span>
                    </div>
                  )}
                  {detail.tags && (
                    <div>
                      <span className="text-gray-500">标签：</span>
                      <span className="font-medium">{detail.tags}</span>
                    </div>
                  )}
                  {detail.clarity && (
                    <div>
                      <span className="text-gray-500">清晰程度：</span>
                      <span className="font-medium">{detail.clarity}</span>
                    </div>
                  )}
                  {detail.importance && (
                    <div>
                      <span className="text-gray-500">重要程度：</span>
                      <span className="font-medium">{detail.importance}</span>
                    </div>
                  )}
                  {detail.usageSuggestions && (
                    <div className="col-span-2">
                      <span className="text-gray-500">使用建议：</span>
                      <span className="font-medium">{detail.usageSuggestions}</span>
                    </div>
                  )}
                  {detail.source && (
                    <div>
                      <span className="text-gray-500">来源：</span>
                      <span className="font-medium">{detail.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">未找到地图详情</div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          currentIndex={0}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={() => {}}
        />
      )}
    </>
  );
}