import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image, MapPin, AlertCircle, MessageCircle, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// 定义举报类型
interface ReportType {
  id: string;
  name: string;
  iconName: string;
}

const UserReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    contactMethod: '',
    contactInfo: '',
    images: [] as File[]
  });
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  
  // 举报类型数据
  const reportTypes: ReportType[] = [
    { id: '1', name: '垃圾问题', iconName: 'trash' },
    { id: '2', name: '环境卫生', iconName: 'broom' },
    { id: '3', name: '公共设施', iconName: 'wrench' },
    { id: '4', name: '交通问题', iconName: 'car' },
    { id: '5', name: '噪音污染', iconName: 'volume-high' },
    { id: '6', name: '其他问题', iconName: 'circle-exclamation' }
  ];

  // 模拟位置数据
  const mockLocations = [
    '西湖公园',
    '钱江新城',
    '文三路科技园区',
    '西湖大道',
    '德胜快速路',
    '杭州东站',
    '西溪湿地公园'
  ];

  // 处理输入变化
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理类型选择
  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  // 处理图片上传
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
      
      // 创建图片预览
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // 移除图片预览
  const removeImagePreview = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  // 处理定位
  const handleLocation = () => {
    // 直接使用默认地址
    const defaultAddress = "浙江省杭州市余杭区良渚路166号";
    
    setFormData(prev => ({
      ...prev,
      location: defaultAddress
    }));
    toast.success("位置获取成功");
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.type) {
      toast.error("请填写必要信息");
      return;
    }
    
    // 在实际应用中，这里应该发送API请求
    console.log("提交举报数据:", formData);
    
    // 显示提交成功弹窗
    setShowSuccessModal(true);
  };

  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };

  // 关闭成功弹窗并重置表单
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      location: '',
      type: '',
      contactMethod: '',
      contactInfo: '',
      images: []
    });
    
    setImagePreviews([]);
  };

  // 添加水印到图片
  const addWatermarkToImage = (file: File, location: string): Promise<string> => {
    return new Promise(resolve => {
      try {
        const reader = new FileReader();

        reader.onload = event => {
          try {
            // 使用 document.createElement 创建 img 元素而不是 new Image()
            const img = document.createElement('img');

            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  resolve(URL.createObjectURL(file));
                  return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
                ctx.lineWidth = 0.5;
                ctx.font = "14px Arial";
                const now = new Date();

                const formattedTime = now.toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });

                const watermarkText = `${location || "未知位置"} - ${formattedTime}`;
                const textMetrics = ctx.measureText(watermarkText);
                const textWidth = textMetrics.width;
                const textHeight = 20;
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(10, canvas.height - textHeight - 20, textWidth + 20, textHeight + 10);
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillText(watermarkText, 20, canvas.height - 20);
                const dataURL = canvas.toDataURL("image/jpeg");
                resolve(dataURL);
              } catch (error) {
                console.error("Error processing image:", error);
                resolve(URL.createObjectURL(file));
              }
            };

            img.onerror = () => {
              console.error("Error loading image");
              resolve(URL.createObjectURL(file));
            };

            if (event.target && typeof event.target.result === "string") {
              img.src = event.target.result;
            } else {
              console.error("Invalid event target or result");
              resolve(URL.createObjectURL(file));
            }
          } catch (error) {
            console.error("Error in reader.onload:", error);
            resolve(URL.createObjectURL(file));
          }
        };

        reader.onerror = () => {
          console.error("Error reading file");
          resolve(URL.createObjectURL(file));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error creating FileReader:", error);
        resolve(URL.createObjectURL(file));
      }
    });
  };

  // 渲染FontAwesome图标
  const renderIcon = (iconName: string) => {
    return <i className={`fa-solid fa-${iconName} text-lg`}></i>;
  };

  // 数据下钻功能
  const handleDataDrillDown = (e: React.MouseEvent) => {
    // 检查点击的元素是否具有特定的数据属性
    const target = e.target as HTMLElement;
    const drillDownId = target.getAttribute('data-drilldown-id');
    const drillDownType = target.getAttribute('data-drilldown-type');
    
    // 如果有下钻属性，则执行下钻操作
    if (drillDownId && drillDownType) {
      // 根据不同类型执行不同的下钻逻辑
      switch (drillDownType) {
        case 'reportType':
          const reportType = reportTypes.find(t => t.id === drillDownId);
          if (reportType) {
            // 可以在这里添加具体的下钻逻辑
            console.log('下钻到举报类型:', reportType.name);
          }
          break;
        default:
          console.log('未知的下钻类型:', drillDownType);
      }
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* 顶部导航栏 */}
      <header 
        className="flex items-center justify-between px-4 py-3 bg-teal-600 text-white"
      >
        <button onClick={handleBack} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">用户上报</h1>
        <div className="w-8"></div> {/* 占位，保持标题居中 */}
      </header>

      {/* 表单区域 */}
      <div className="flex-1 overflow-auto p-4" onClick={(e) => handleDataDrillDown(e)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-base font-medium mb-3">上报信息</h2>
            
            {/* 举报标题 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">问题标题 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请简要描述您遇到的问题"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* 问题描述 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">详细描述 <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请详细描述问题的具体情况、发生时间等信息"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px]"
                required
              />
            </div>

            {/* 举报类型 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">问题类型 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      formData.type === type.name 
                        ? 'border-teal-500 bg-teal-50 text-teal-600' 
                        : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50'
                    }`}
                    onClick={() => handleTypeSelect(type.name)}
                  >
                    <div className="mb-2">
                      {renderIcon(type.iconName)}
                    </div>
                    <span className="text-xs">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 问题位置 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">问题位置 <span className="text-red-500">*</span></label>
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="请输入问题发生的具体位置"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  ref={locationInputRef}
                  required
                />
                <button 
                  type="button"
                  onClick={handleLocation}
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                >
                  定位
                </button>
              </div>
            </div>

            {/* 联系方式 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">联系方式（选填）</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">请选择联系方式</option>
                  <option value="phone">电话</option>
                  <option value="email">邮箱</option>
                  <option value="wechat">微信</option>
                </select>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="请输入联系信息"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 问题图片 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">问题图片（选填）</label>
              <div className="space-y-3">
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={preview}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                          onClick={() => removeImagePreview(index)}
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3">
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
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            提交举报
          </button>
          
          {/* 温馨提示 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            <div className="flex items-start">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <p>
                温馨提示：请确保您提供的信息真实准确，虚假举报可能会影响您的信用记录。我们会尽快处理您的举报，并保护您的隐私信息。
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* 成功弹窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">提交成功</h3>
            <p className="text-gray-600 mb-6">感谢您的举报，我们会尽快处理并给您反馈</p>
            <button
              onClick={handleCloseSuccessModal}
              className="w-full py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReportPage;