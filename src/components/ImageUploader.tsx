import React, { useState, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  maxImages?: number;
  label?: string;
  showWatermark?: boolean;
  locationText?: string;
  description?: string;
  required?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  setImages,
  maxImages = 9,
  label = '上传图片',
  showWatermark = true,
  locationText = '当前位置',
  description,
  required = false,
}) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const remainingSlots = maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (filesToAdd.length === 0) {
        alert(`最多只能上传${maxImages}张图片`);
        return;
      }

      // 更新文件数组
      setImages(prev => [...prev, ...filesToAdd]);
      
      // 创建图片预览
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // 移除图片
  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // 释放被移除图片的ObjectURL
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
    
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // 打开图片预览
  const openImagePreviewModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImagePreview(true);
  };

  // 关闭图片预览
  const closeImagePreviewModal = () => {
    setShowImagePreview(false);
  };

  // 导航到上一张图片
  const navigatePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? imagePreviews.length - 1 : prev - 1
    );
  };

  // 导航到下一张图片
  const navigateNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === imagePreviews.length - 1 ? 0 : prev + 1
    );
  };

  // 清理ObjectURL，避免内存泄漏
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, []);

  return (
    <div className="space-y-3">
      {label && (
        <h4 className="text-base font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </h4>
      )}
      
      {/* 图片预览区域 */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((preview, index) => (
            <div 
              key={index} 
              className="relative w-24 h-24 cursor-pointer"
              onClick={() => openImagePreviewModal(index)}
            >
              <div className="relative w-full h-full rounded-md overflow-hidden border border-gray-200">
                <img
                  src={preview}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {showWatermark && (
                  <div
                    className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs pointer-events-none flex flex-col items-center"
                  >
                    <div className="text-center">{locationText}</div>
                    <div className="text-center">{new Date().toLocaleString()}</div>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 上传按钮 */}
      {imagePreviews.length < maxImages && (
        <div className="flex gap-3">
          <label
            className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Camera size={24} className="text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">拍照</span>
          </label>
          <label
            className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Image size={24} className="text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">从相册选择</span>
          </label>
        </div>
      )}
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {showWatermark && imagePreviews.length < maxImages && (
        <p className="text-xs text-gray-500">提示：上传的照片将自动添加位置和时间水印</p>
      )}
      
      {/* 图片放大预览模态框 */}
      {showImagePreview && imagePreviews.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
            onClick={closeImagePreviewModal}
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-4xl">
            <div className="relative inline-block">
              <img
                src={imagePreviews[currentImageIndex]}
                alt={`预览图片 ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {showWatermark && (
                <div
                  className="absolute bottom-4 right-4 p-2 bg-black/50 text-white text-sm pointer-events-none rounded flex flex-col items-center"
                  style={{ maxWidth: '40%' }}
                >
                  <div className="text-center">{locationText}</div>
                  <div className="text-center">{new Date().toLocaleString()}</div>
                </div>
              )}
            </div>
            {imagePreviews.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                  onClick={navigatePrevImage}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                  onClick={navigateNextImage}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white"
            >
              <p className="text-sm">
                {locationText}
              </p>
              <p className="text-xs mt-1">
                {currentImageIndex + 1}/{imagePreviews.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;