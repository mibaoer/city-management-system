import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MoreHorizontal, CheckCircle, AlertCircle, Clock, MapPin, ChevronDown, Users, Eye, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// 定义隐患类型
interface HazardType {
  id: string;
  name: string;
}

// 定义隐患状态类型
type HazardStatus = "pending" | "processing" | "completed" | "rejected" | "refused";

// 定义图片信息接口
interface ImageInfo {
  id: string;
  type: "hazard" | "rectification";
  url: string;
  description?: string;
}

// 定义隐患接口
interface Hazard {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  images: ImageInfo[];
  status: HazardStatus;
  reportTime: string;
  reporter: string;
  hazardLevel: string;
  rectificationMethod: string;
  rectificationDeadline: string;
  assignedPerson: string;
  整改负责人?: string;
  completionTime?: string;
  验收人?: string;
  验收意见?: string;
}

const PhotoReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 隐患类型数据
  const hazardTypes: HazardType[] = [
    { id: "1", name: "广告牌" },
    { id: "2", name: "违挡" },
    { id: "3", name: "沿街店铺" },
    { id: "4", name: "城市绿化" },
    { id: "5", name: "墙体倒塌" },
    { id: "6", name: "修路开挖" },
    { id: "7", name: "流动摊贩" },
    { id: "8", name: "地铁口管理" },
    { id: "9", name: "人行道违停" },
    { id: "10", name: "出店经营" },
    { id: "11", name: "工地" },
    { id: "12", name: "市政设施安全巡查" }
  ];

  // 从localStorage加载数据
  useEffect(() => {
    const savedHazards = localStorage.getItem('hazards');
    
    if (savedHazards) {
      setHazards(JSON.parse(savedHazards));
    } else {
      // 初始化模拟数据
      const initialHazards: Hazard[] = [
        {
          id: "1",
          title: "小区垃圾桶满溢",
          description: "3号楼前的垃圾桶已经满溢，影响环境",
          location: "3号楼前",
          type: "广告牌",
          images: [{
            id: "img1-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Garbage%20bin%20overflow%20in%20residential%20area&sign=84003e5d30d11a9ce3b149311be6cdc1",
            description: "垃圾桶满溢情况"
          }],
          status: "completed",
          reportTime: "2025-10-20 10:30",
          reporter: "张三",
          hazardLevel: "一般",
          rectificationMethod: "限期整改",
          rectificationDeadline: "2025-10-25",
          assignedPerson: "李四",
          整改负责人: "李四",
          completionTime: "2025-10-22 15:40",
          验收人: "王五",
          验收意见: "已处理完毕，现场环境整洁"
        },
        {
          id: "2",
          title: "分类指示牌损坏",
          description: "垃圾分类指示牌被破坏，需要更换",
          location: "小区入口处",
          type: "市政设施安全巡查",
          images: [{
            id: "img2-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Damaged%20garbage%20classification%20signboard&sign=f9faf66aca24536b43ef25f2d940dfa1",
            description: "损坏的指示牌"
          }],
          status: "processing",
          reportTime: "2025-10-20 09:15",
          reporter: "李四",
          hazardLevel: "一般",
          rectificationMethod: "立即整改",
          rectificationDeadline: "2025-10-22",
          assignedPerson: "王五",
          整改负责人: "王五"
        },
        {
          id: "3",
          title: "路面破损严重",
          description: "主干道有多处坑洼，影响出行安全",
          location: "中心大道",
          type: "修路开挖",
          images: [{
            id: "img3-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Severe%20road%20damage%20with%20potholes&sign=8ec12ff8f58705b0343ca5572064ae4e",
            description: "路面坑洼情况"
          }, {
            id: "img3-2",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Uneven%20road%20surface%20affecting%20traffic&sign=687f8250b32f50ce1d7264b38bc2bf65",
            description: "影响交通的不平整路面"
          }],
          status: "pending",
          reportTime: "2025-10-19 15:45",
          reporter: "王五",
          hazardLevel: "特急",
          rectificationMethod: "立即整改",
          rectificationDeadline: "2025-10-24",
          assignedPerson: "赵六"
        },
        {
          id: "4",
          title: "绿化带有垃圾堆积",
          description: "东区绿化带内有大量垃圾未清理",
          location: "东区绿化带",
          type: "城市绿化",
          images: [{
            id: "img4-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Garbage%20piles%20in%20green%20belt&sign=70c038f528d3d9ac2ac02f2c55e90b0b",
            description: "绿化带内的垃圾堆积"
          }, {
            id: "img4-2",
            type: "rectification",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Clean%20green%20belt%20after%20rectification&sign=9f297c20c58bca713a0099194efc3d24",
            description: "整改后的干净绿化带"
          }],
          status: "completed",
          reportTime: "2025-10-18 11:20",
          reporter: "赵六",
          hazardLevel: "一般",
          rectificationMethod: "限期整改",
          rectificationDeadline: "2025-10-21",
          assignedPerson: "钱七",
          整改负责人: "钱七",
          completionTime: "2025-10-20 14:30",
          验收人: "孙八",
          验收意见: "验收通过"
        }
      ];
      
      setHazards(initialHazards);
      localStorage.setItem('hazards', JSON.stringify(initialHazards));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    if (hazards.length > 0) {
      localStorage.setItem('hazards', JSON.stringify(hazards));
    }
  }, [hazards]);

  // 处理筛选和搜索
  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch = !searchText || 
      hazard.title.includes(searchText) || 
      hazard.description.includes(searchText) || 
      hazard.location.includes(searchText);
    
    const matchesStatus = statusFilter === 'all' || hazard.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || hazard.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime());

  // 获取状态显示文本
  const getStatusText = (status: HazardStatus) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'rejected': return '已驳回';
      case 'refused': return '拒不整改';
      default: return '未知状态';
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: HazardStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'refused': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取事件等级样式
  const getHazardLevelStyle = (level: string) => {
    switch (level) {
      case '特急': return 'bg-red-100 text-red-800';
      case '急': return 'bg-orange-100 text-orange-800';
      case '一般': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };

  // 处理查看详情
  const handleViewDetail = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setShowDetailModal(true);
  };

  // 处理图片预览
  const openImagePreview = (images: ImageInfo[], index: number) => {
    if (images.length > 0) {
      setSelectedHazard({
        ...selectedHazard as Hazard,
        images: images
      });
      setCurrentImageIndex(index);
      setShowImagePreview(true);
    }
  };

  // 统计数据
  const getStatistics = () => {
    const totalReports = hazards.length;
    const pendingReports = hazards.filter(h => h.status === 'pending').length;
    const processingReports = hazards.filter(h => h.status === 'processing').length;
    const completedReports = hazards.filter(h => h.status === 'completed').length;
    const rejectedReports = hazards.filter(h => h.status === 'rejected').length;
    
    return {
      totalReports,
      pendingReports,
      processingReports,
      completedReports,
      rejectedReports
    };
  };

  // 图表数据
  const chartData = [
    { name: '广告牌', 数量: hazards.filter(h => h.type === '广告牌').length },
    { name: '违挡', 数量: hazards.filter(h => h.type === '违挡').length },
    { name: '沿街店铺', 数量: hazards.filter(h => h.type === '沿街店铺').length },
    { name: '城市绿化', 数量: hazards.filter(h => h.type === '城市绿化').length },
    { name: '墙体倒塌', 数量: hazards.filter(h => h.type === '墙体倒塌').length },
    { name: '修路开挖', 数量: hazards.filter(h => h.type === '修路开挖').length }
  ];

  const statistics = getStatistics();

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* 顶部导航栏 */}
      <header 
        className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white"
      >
        <button onClick={handleBack} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">随手拍清单</h1>
        <div className="flex items-center gap-3">
          <button className="p-1">
            <Filter size={20} />
          </button>
          <button className="p-1">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* 统计卡片 */}
      <div className="p-4 bg-white mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">总上报数</h3>
            <p className="text-xl font-bold text-gray-800">{statistics.totalReports}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">待处理</h3>
            <p className="text-xl font-bold text-yellow-600">{statistics.pendingReports}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">处理中</h3>
            <p className="text-xl font-bold text-blue-600">{statistics.processingReports}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">已完成</h3>
            <p className="text-xl font-bold text-green-600">{statistics.completedReports}</p>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-4 bg-white mb-4">
        <h2 className="text-base font-medium mb-3">隐患类型分布</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="数量" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="p-4 bg-white mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索标题、描述或位置..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="rejected">已驳回</option>
              <option value="refused">拒不整改</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部类型</option>
              {hazardTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 隐患列表 */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 bg-white mb-2">
          <h2 className="text-base font-medium">隐患列表</h2>
        </div>
        
        {filteredHazards.length > 0 ? (
          filteredHazards.map(hazard => (
            <div 
              key={hazard.id} 
              className="mx-4 my-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetail(hazard)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-medium">{hazard.title}</h3>
                    <p className="text-sm text-gray-500">{hazard.type} | {hazard.location}</p>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(hazard.status)}`}
                  >
                    {getStatusText(hazard.status)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">隐患描述:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{hazard.description}</p>
                </div>
                
                {hazard.images && hazard.images.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">图片 ({hazard.images.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {hazard.images.slice(0, 3).map((image, index) => (
                        <div
                          key={image.id}
                          className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            openImagePreview(hazard.images || [], index);
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1"
                          >
                            {image.type === "hazard" ? "隐患" : "整改"}
                          </div>
                        </div>
                      ))}
                      {hazard.images.length > 3 && (
                        <div
                          className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                        >
                          +{hazard.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock size={14} className="mr-1" />
                    <span>{hazard.reportTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Users size={14} className="mr-1" />
                    <span>{hazard.reporter}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getHazardLevelStyle(hazard.hazardLevel)}`}>
                    {hazard.hazardLevel}
                  </span>
                  <button
                    className="text-blue-600 text-sm flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(hazard);
                    }}
                  >
                    <Eye size={14} className="mr-1" />
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <p>暂无隐患记录</p>
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {showDetailModal && selectedHazard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">隐患详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 基本信息 */}
              <div>
                <h4 className="text-base font-medium mb-2">基本信息</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">事件标题:</span>
            <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">事件状态:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(selectedHazard.status)}`}
                    >
                      {getStatusText(selectedHazard.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">隐患类型:</span>
                    <span className="text-sm">{selectedHazard.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">隐患等级:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getHazardLevelStyle(selectedHazard.hazardLevel)}`}
                    >
                      {selectedHazard.hazardLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">报告时间:</span>
                    <span className="text-sm">{selectedHazard.reportTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">报告人:</span>
                    <span className="text-sm">{selectedHazard.reporter}</span>
                  </div>
                </div>
              </div>
              
              {/* 隐患描述 */}
              <div>
                <h4 className="text-base font-medium mb-2">事件描述</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{selectedHazard.description || "暂无描述信息"}</p>
                </div>
              </div>
              
              {/* 事件位置 */}
              <div>
                <h4 className="text-base font-medium mb-2">事件位置</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm flex items-center">
                    <MapPin size={14} className="mr-2 text-gray-500" />
                    {selectedHazard.location}
                  </p>
                </div>
              </div>
              
              {/* 整改信息 */}
              <div>
                <h4 className="text-base font-medium mb-2">整改信息</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">整改方式:</span>
                    <span className="text-sm">{selectedHazard.rectificationMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">整改时限:</span>
                    <span className="text-sm">{selectedHazard.rectificationDeadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">指派处理人:</span>
                    <span className="text-sm">{selectedHazard.assignedPerson}</span>
                  </div>
                  {selectedHazard.整改负责人 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">整改负责人:</span>
                      <span className="text-sm">{selectedHazard.整改负责人}</span>
                    </div>
                  )}
                  {selectedHazard.completionTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">完成时间:</span>
                      <span className="text-sm">{selectedHazard.completionTime}</span>
                    </div>
                  )}
                  {selectedHazard.验收人 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">验收人:</span>
                      <span className="text-sm">{selectedHazard.验收人}</span>
                    </div>
                  )}
                  {selectedHazard.验收意见 && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">验收意见:</span>
                      <span className="text-sm bg-white p-2 rounded">{selectedHazard.验收意见}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 图片 */}
              {selectedHazard.images && selectedHazard.images.length > 0 && (
                <div>
                  <h4 className="text-base font-medium mb-2">图片</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedHazard.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative rounded-md overflow-hidden border border-gray-200 cursor-pointer"
                        onClick={() => openImagePreview(selectedHazard.images || [], index)}
                      >
                        <img
                          src={image.url}
                          alt={`${image.type === "hazard" ? "隐患" : "整改"}图片 ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 flex justify-between"
                        >
                          <span>{image.type === "hazard" ? "隐患" : "整改"}</span>
                          <span>{index + 1}/{selectedHazard.images?.length}</span>
                        </div>
                        {image.description && (
                          <div
                            className="absolute top-0 left-0 right-0 bg-black/50 text-white text-xs p-1"
                          >
                            {image.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {showImagePreview && selectedHazard && selectedHazard.images && selectedHazard.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
            onClick={() => setShowImagePreview(false)}
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-4xl">
            <img
              src={selectedHazard.images[currentImageIndex]?.url}
              alt={`预览图片 ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {selectedHazard.images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === 0 ? selectedHazard.images?.length - 1 : prev - 1);
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === selectedHazard.images?.length - 1 ? 0 : prev + 1);
                  }}
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
                {selectedHazard.images[currentImageIndex]?.description || `${selectedHazard.images[currentImageIndex]?.type === "hazard" ? "隐患图片" : "整改图片"}`}
              </p>
              <p className="text-xs mt-1">
                {currentImageIndex + 1}/{selectedHazard.images?.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoReportListPage;