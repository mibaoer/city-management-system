import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Calendar, Scale, User, AlertCircle, CheckCircle2, X, Info } from "lucide-react";
import { toast } from "sonner";

// 建筑垃圾清运申请接口
interface ConstructionWasteApplication {
  id: string;
  applicantName: string;
  applicantPhone: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  startLocation: string;
  endLocation: string;
  wasteType: string;
  estimatedWeight: number;
  applicationTime: string;
  status: "pending" | "approved" | "rejected";
  approvalMessage?: string;
  qrCode?: string;
  statusHistory: StatusHistory[];
}

// 状态历史接口
interface StatusHistory {
  status: string;
  timestamp: string;
  message?: string;
}

// 模拟申请数据
const mockApplications: ConstructionWasteApplication[] = [
  {
    id: "app-001",
    applicantName: "张三",
    applicantPhone: "13800138001",
    vehicleNumber: "浙A12345",
    driverName: "李四",
    driverPhone: "13900139001",
    startLocation: "良渚街道建筑工地A",
    endLocation: "余杭区垃圾处理厂",
    wasteType: "建筑垃圾",
    estimatedWeight: 15.5,
    applicationTime: "2024-04-16 10:00",
    status: "pending",
    statusHistory: [
      { status: "pending", timestamp: "2024-04-16 10:00", message: "申请提交成功" }
    ]
  },
  {
    id: "app-002",
    applicantName: "王五",
    applicantPhone: "13700137001",
    vehicleNumber: "浙B67890",
    driverName: "赵六",
    driverPhone: "13600136001",
    startLocation: "西湖区建筑工地B",
    endLocation: "萧山区垃圾处理厂",
    wasteType: "装修垃圾",
    estimatedWeight: 8.2,
    applicationTime: "2024-04-15 14:30",
    status: "approved",
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('app-002')}`,
    statusHistory: [
      { status: "pending", timestamp: "2024-04-15 14:30", message: "申请提交成功" },
      { status: "approved", timestamp: "2024-04-15 16:00", message: "申请已通过" }
    ]
  },
  {
    id: "app-003",
    applicantName: "孙七",
    applicantPhone: "13500135001",
    vehicleNumber: "浙C13579",
    driverName: "周八",
    driverPhone: "13400134001",
    startLocation: "江干区建筑工地C",
    endLocation: "临平区垃圾处理厂",
    wasteType: "拆除垃圾",
    estimatedWeight: 22.7,
    applicationTime: "2024-04-14 09:15",
    status: "rejected",
    approvalMessage: "车辆信息不符合要求",
    statusHistory: [
      { status: "pending", timestamp: "2024-04-14 09:15", message: "申请提交成功" },
      { status: "rejected", timestamp: "2024-04-14 11:00", message: "车辆信息不符合要求" }
    ]
  }
];

const ConstructionWasteApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ConstructionWasteApplication[]>(mockApplications);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ConstructionWasteApplication | null>(null);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  
  // 施工点位数据（模拟数据，实际应从API获取）
  const constructionPoints = [
    { id: 'CP001', name: '良渚街道建筑工地A' },
    { id: 'CP002', name: '西湖区建筑工地B' },
    { id: 'CP003', name: '江干区建筑工地C' },
    { id: 'CP004', name: '余杭区建筑工地D' },
    { id: 'CP005', name: '萧山区建筑工地E' }
  ];

  // 垃圾处理厂数据（模拟数据，实际应从API获取）
  const wastePlants = [
    { id: 'WP001', name: '余杭区垃圾处理厂' },
    { id: 'WP002', name: '萧山区垃圾处理厂' },
    { id: 'WP003', name: '临平区垃圾处理厂' },
    { id: 'WP004', name: '西湖区垃圾处理厂' },
    { id: 'WP005', name: '江干区垃圾处理厂' }
  ];
  
  // 表单状态
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantPhone: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    startLocation: "",
    endLocation: "",
    wasteType: "建筑垃圾",
    estimatedWeight: 0
  });
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedWeight' ? parseFloat(value) || 0 : value
    }));
  };
  
  // 处理提交申请
  const handleSubmitApplication = () => {
    // 表单验证
    if (!formData.applicantName || !formData.applicantPhone || !formData.vehicleNumber || 
        !formData.driverName || !formData.driverPhone || !formData.startLocation || 
        !formData.endLocation || !formData.wasteType || formData.estimatedWeight <= 0) {
      toast.error("请填写所有必填字段");
      return;
    }
    
    // 创建新申请
    const newApplication: ConstructionWasteApplication = {
      id: `app-${Date.now().toString().slice(-6)}`,
      ...formData,
      applicationTime: new Date().toLocaleString(),
      status: "pending",
      statusHistory: [
        { status: "pending", timestamp: new Date().toLocaleString(), message: "申请提交成功" }
      ]
    };
    
    // 添加到申请列表
    setApplications([newApplication, ...applications]);
    setShowApplyModal(false);
    
    // 重置表单
    setFormData({
      applicantName: "",
      applicantPhone: "",
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
      startLocation: "",
      endLocation: "",
      wasteType: "建筑垃圾",
      estimatedWeight: 0
    });
    
    toast.success("申请提交成功");
  };
  
  // 处理查看详情
  const handleViewDetail = (application: ConstructionWasteApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };
  
  // 处理查看二维码
  const handleViewQrCode = (application: ConstructionWasteApplication) => {
    setSelectedApplication(application);
    setShowQrCodeModal(true);
  };
  
  // 处理查看路线
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  const handleViewRoute = (application: ConstructionWasteApplication) => {
    setSelectedApplication(application);
    setShowRouteModal(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部导航栏 - 小程序风格固定导航 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="h-16 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 
            onClick={() => navigate(-1)}
            className="flex-1 text-center text-lg font-bold text-gray-900 -ml-8 cursor-pointer hover:bg-gray-50 py-2 rounded-md transition-colors"
          >
            建筑垃圾清运申请
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回主页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-700">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 主要内容 */}
      <div className="pt-20 pb-6 px-4">
        {/* 申请按钮 */}
        <div className="mb-6">
          <button 
            onClick={() => setShowApplyModal(true)}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm"
          >
            提交新申请
          </button>
        </div>
        
        {/* 申请列表 */}
        <div className="space-y-3">
          {applications.map((application) => (
            <div 
              key={application.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => handleViewDetail(application)}
            >
              {/* 申请头部 */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-gray-900 text-sm">申请 #{application.id}</h2>
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : application.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {application.status === 'pending' ? '待审批' : application.status === 'approved' ? '已通过' : '已驳回'}
                  </span>
                </div>
              </div>
              
              {/* 申请内容 */}
              <div className="px-4 py-3">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请人:</span>
                    <span className="font-medium text-gray-900">{application.applicantName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">联系电话:</span>
                    <span className="font-medium text-gray-900">{application.applicantPhone}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">车牌号:</span>
                    <span className="font-medium text-gray-900">{application.vehicleNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">起点:</span>
                    <span className="font-medium flex items-center gap-1 text-gray-900">
                      <MapPin size={14} className="text-green-500" />
                      {application.startLocation}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">终点:</span>
                    <span className="font-medium flex items-center gap-1 text-gray-900">
                      <MapPin size={14} className="text-red-500" />
                      {application.endLocation}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">垃圾类型:</span>
                    <span className="font-medium text-gray-900">{application.wasteType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">预计重量:</span>
                    <span className="font-medium text-gray-900">{application.estimatedWeight} 吨</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请时间:</span>
                    <span className="font-medium text-gray-900">{application.applicationTime}</span>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              {application.status === 'approved' && application.qrCode && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRoute(application);
                    }}
                    className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-200 font-medium rounded-md hover:bg-blue-100 transition-all duration-300"
                  >
                    查看路线
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewQrCode(application);
                    }}
                    className="w-full py-2 bg-green-50 text-green-600 border border-green-200 font-medium rounded-md hover:bg-green-100 transition-all duration-300"
                  >
                    查看核销二维码
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 提交申请模态框 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h3 className="text-lg font-medium text-gray-900">提交建筑垃圾清运申请</h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">申请人姓名 *</label>
                  <input
                    type="text"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入申请人姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
                  <input
                    type="tel"
                    name="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入联系电话"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">车牌号 *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入车牌号"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">司机姓名 *</label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入司机姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">司机电话 *</label>
                  <input
                    type="tel"
                    name="driverPhone"
                    value={formData.driverPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入司机电话"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">清运起点 *</label>
                  <select
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">请选择清运起点</option>
                    {constructionPoints.map(point => (
                      <option key={point.id} value={point.name}>{point.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">清运终点 *</label>
                  <select
                    name="endLocation"
                    value={formData.endLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">请选择清运终点</option>
                    {wastePlants.map(plant => (
                      <option key={plant.id} value={plant.name}>{plant.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">垃圾类型 *</label>
                  <select
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="建筑垃圾">建筑垃圾</option>
                    <option value="装修垃圾">装修垃圾</option>
                    <option value="拆除垃圾">拆除垃圾</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预计重量(吨) *</label>
                  <input
                    type="number"
                    name="estimatedWeight"
                    value={formData.estimatedWeight}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="请输入预计重量"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleSubmitApplication}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 申请详情模态框 */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h3 className="text-lg font-medium text-gray-900">申请详情</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              {/* 基本信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">基本信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请ID:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请人:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">联系电话:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.applicantPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">车牌号:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">司机姓名:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">司机电话:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.driverPhone}</span>
                  </div>
                </div>
              </div>
              
              {/* 清运信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">清运信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">起点:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">终点:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.endLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">垃圾类型:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.wasteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">预计重量:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.estimatedWeight} 吨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请时间:</span>
                    <span className="font-medium text-gray-900">{selectedApplication.applicationTime}</span>
                  </div>
                </div>
              </div>
              
              {/* 审批信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">审批信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">状态:</span>
                    <span className={`font-medium ${selectedApplication.status === 'pending' ? 'text-yellow-600' : selectedApplication.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedApplication.status === 'pending' ? '待审批' : selectedApplication.status === 'approved' ? '已通过' : '已驳回'}
                    </span>
                  </div>
                  {selectedApplication.approvalMessage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">审批意见:</span>
                      <span className="font-medium text-gray-900">{selectedApplication.approvalMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 状态历史 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">状态历史</h4>
                <div className="space-y-3">
                  {selectedApplication.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-3 h-3 rounded-full ${history.status === 'pending' ? 'bg-yellow-500' : history.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {index < selectedApplication.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 ml-1.5"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${history.status === 'pending' ? 'text-yellow-600' : history.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                            {history.status === 'pending' ? '待审批' : history.status === 'approved' ? '已通过' : '已驳回'}
                          </span>
                          <span className="text-xs text-gray-500">{history.timestamp}</span>
                        </div>
                        {history.message && (
                          <p className="text-xs text-gray-500 mt-1">{history.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 二维码和路线 */}
              {selectedApplication.status === 'approved' && selectedApplication.qrCode && (
                <div className="mb-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">核销二维码</h4>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-3 border border-gray-200 rounded-lg shadow-sm mb-3">
                        <img 
                          src={selectedApplication.qrCode} 
                          alt="核销二维码" 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        此二维码用于任务核销
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">路线信息</h4>
                    <button 
                      onClick={() => handleViewRoute(selectedApplication)}
                      className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-200 font-medium rounded-md hover:bg-blue-100 transition-all duration-300"
                    >
                      查看路线
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 二维码模态框 */}
      {showQrCodeModal && selectedApplication && selectedApplication.qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h3 className="text-lg font-medium text-gray-900">核销二维码</h3>
              <button 
                onClick={() => setShowQrCodeModal(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <p className="text-sm text-gray-700 mb-4 text-center">请在终点扫描此二维码完成任务</p>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 w-full">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-600">请在终点向管理员出示此二维码进行核销</p>
              </div>
              
              {/* 二维码显示 */}
              <div className="mb-6 bg-gray-100 p-3 border border-gray-200 rounded-lg shadow-sm">
                <img 
                  src={selectedApplication.qrCode} 
                  alt="任务核销二维码" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <p className="text-xs text-gray-500 mb-6 text-center">
                此二维码为申请 {selectedApplication.id} 的唯一核销码<br />
                仅在申请通过后有效
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 路线查看模态框 */}
      {showRouteModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h3 className="text-lg font-medium text-gray-900">查看路线</h3>
              <button 
                onClick={() => setShowRouteModal(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">起点: {selectedApplication.startLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">终点: {selectedApplication.endLocation}</span>
                </div>
              </div>
              
              {/* 路线地图 */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 h-48 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">路线地图将显示在此处</p>
                  {/* 实际项目中，这里应该集成地图API来显示实际路线 */}
                </div>
              </div>
              
              {/* 路线信息 */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">总距离:</span>
                  <span className="font-medium text-gray-900">约 15.5 公里</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">预计时间:</span>
                  <span className="font-medium text-gray-900">约 25 分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">路线状态:</span>
                  <span className="font-medium text-green-600">可通行</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowRouteModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionWasteApplicationPage;