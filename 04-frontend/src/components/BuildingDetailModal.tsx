import { useState, useEffect } from 'react';
import type { BuildingDetail } from '../types';
import { fetchBuildingDetail, getImageUrl } from '../services/api';
import ImageLightbox from './ImageLightbox';

interface BuildingDetailModalProps {
  buildingId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function BuildingDetailModal({ buildingId, isOpen, onClose }: BuildingDetailModalProps) {
  const [detail, setDetail] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (isOpen && buildingId) {
      loadDetail();
    }
  }, [isOpen, buildingId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchBuildingDetail(buildingId);
      setDetail(data);
    } catch (error) {
      console.error('Failed to load building detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Build all images array: [main image, photo1, photo2, ...]
  const allImages: { src: string; alt: string }[] = [];
  
  if (detail?.imagePath) {
    allImages.push({
      src: getImageUrl(detail.imagePath),
      alt: detail.currentName || detail.originalName || 'Building main image'
    });
  }
  
  if (detail?.photos) {
    detail.photos.forEach((photo, index) => {
      allImages.push({
        src: getImageUrl(photo.imageFilename),
        alt: `Historical photo ${index + 1}`
      });
    });
  }

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
              {detail?.currentName || detail?.originalName || '建筑详情'}
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
              {/* Images Section - Order: Main image first, then photos, then info */}
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 8).map((img, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg cursor-pointer ${
                        index === 0 ? 'col-span-2 row-span-2' : ''
                      }`}
                      onClick={() => {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className={`w-full object-cover hover:opacity-90 transition-opacity ${
                          index === 0 ? 'h-64' : 'h-32'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                {allImages.length > 8 && (
                  <p className="text-sm text-gray-500 mt-2">+ 还有 {allImages.length - 8} 张照片</p>
                )}
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">建筑信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {detail.originalName && (
                    <div>
                      <span className="text-gray-500">原名称：</span>
                      <span className="font-medium">{detail.originalName}</span>
                    </div>
                  )}
                  {detail.address && (
                    <div>
                      <span className="text-gray-500">地址：</span>
                      <span className="font-medium">{detail.address}</span>
                    </div>
                  )}
                  {detail.preservationCategory && (
                    <div>
                      <span className="text-gray-500">保护等级：</span>
                      <span className="font-medium">{detail.preservationCategory}</span>
                    </div>
                  )}
                  {detail.batch && (
                    <div>
                      <span className="text-gray-500">批次：</span>
                      <span className="font-medium">{detail.batch}</span>
                    </div>
                  )}
                  {detail.structureType && (
                    <div>
                      <span className="text-gray-500">结构类型：</span>
                      <span className="font-medium">{detail.structureType}</span>
                    </div>
                  )}
                  {detail.constructionYear && (
                    <div>
                      <span className="text-gray-500">建造年代：</span>
                      <span className="font-medium">{detail.constructionYear}</span>
                    </div>
                  )}
                  {detail.preservationRequirements && (
                    <div className="col-span-2">
                      <span className="text-gray-500">保护要求：</span>
                      <p className="mt-1 text-gray-700">{detail.preservationRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">未找到建筑详情</div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}