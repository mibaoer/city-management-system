import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Check, X, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

const ConstructionWasteApproval: React.FC = () => {
  const [applications, setApplications] = useState<ConstructionWasteApplication[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ConstructionWasteApplication | null>(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  
  // 过滤申请
  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.id.includes(searchTerm) || 
                          application.applicantName.includes(searchTerm) ||
                          application.vehicleNumber.includes(searchTerm) ||
                          application.startLocation.includes(searchTerm) ||
                          application.endLocation.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  // 处理查看详情
  const handleViewDetail = (application: ConstructionWasteApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };
  
  // 处理审批
  const handleApprove = (application: ConstructionWasteApplication) => {
    setSelectedApplication(application);
    setApprovalMessage('');
    setShowApprovalModal(true);
  };
  
  // 处理提交审批
  const handleSubmitApproval = (approved: boolean) => {
    if (!selectedApplication) return;
    
    const updatedApplication: ConstructionWasteApplication = {
      ...selectedApplication,
      status: approved ? 'approved' : 'rejected',
      approvalMessage: approved ? '申请已通过' : approvalMessage,
      qrCode: approved ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedApplication.id)}` : undefined,
      statusHistory: [
        ...selectedApplication.statusHistory,
        {
          status: approved ? 'approved' : 'rejected',
          timestamp: new Date().toLocaleString(),
          message: approved ? '申请已通过' : approvalMessage
        }
      ]
    };
    
    setApplications(applications.map(app => 
      app.id === selectedApplication.id ? updatedApplication : app
    ));
    
    setShowApprovalModal(false);
    setSelectedApplication(null);
    setApprovalMessage('');
    
    toast.success(approved ? '申请已通过' : '申请已驳回');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">清运审批</h1>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-6 rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索申请ID、申请人、车牌号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="pending">待审批</option>
              <option value="approved">已通过</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
        </div>
      </div>

      {/* 申请列表 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e4976]">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  申请ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  申请人
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  车牌号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  起点
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  终点
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  垃圾类型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  预计重量
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  申请时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e4976]">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-[#1e4976]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {application.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.applicantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.startLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.endLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.wasteType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.estimatedWeight} 吨
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.applicationTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${application.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : application.status === 'approved' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                        {application.status === 'pending' ? '待审批' : application.status === 'approved' ? '已通过' : '已驳回'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(application)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3"
                        aria-label="查看详情"
                      >
                        <Info size={18} />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(application)}
                            className="text-[#10b981] hover:text-green-300 mr-3"
                            aria-label="通过"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleApprove(application)}
                            className="text-[#ef4444] hover:text-red-300"
                            aria-label="驳回"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center">
                    <div className="text-gray-400">暂无相关申请信息</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 申请详情模态框 */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border border-[#1e4976] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium text-[#00e5ff]">申请详情</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} className="text-[#00e5ff]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* 基本信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">基本信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请ID:</span>
                    <span className="font-medium text-white">{selectedApplication.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请人:</span>
                    <span className="font-medium text-white">{selectedApplication.applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">联系电话:</span>
                    <span className="font-medium text-white">{selectedApplication.applicantPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">车牌号:</span>
                    <span className="font-medium text-white">{selectedApplication.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">司机姓名:</span>
                    <span className="font-medium text-white">{selectedApplication.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">司机电话:</span>
                    <span className="font-medium text-white">{selectedApplication.driverPhone}</span>
                  </div>
                </div>
              </div>
              
              {/* 清运信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">清运信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">起点:</span>
                    <span className="font-medium text-white">{selectedApplication.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">终点:</span>
                    <span className="font-medium text-white">{selectedApplication.endLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">垃圾类型:</span>
                    <span className="font-medium text-white">{selectedApplication.wasteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">预计重量:</span>
                    <span className="font-medium text-white">{selectedApplication.estimatedWeight} 吨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请时间:</span>
                    <span className="font-medium text-white">{selectedApplication.applicationTime}</span>
                  </div>
                </div>
              </div>
              
              {/* 审批信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">审批信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">状态:</span>
                    <span className={`font-medium ${selectedApplication.status === 'pending' ? 'text-[#f59e0b]' : selectedApplication.status === 'approved' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {selectedApplication.status === 'pending' ? '待审批' : selectedApplication.status === 'approved' ? '已通过' : '已驳回'}
                    </span>
                  </div>
                  {selectedApplication.approvalMessage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">审批意见:</span>
                      <span className="font-medium text-white">{selectedApplication.approvalMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 状态历史 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">状态历史</h4>
                <div className="space-y-3">
                  {selectedApplication.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-3 h-3 rounded-full ${history.status === 'pending' ? 'bg-[#f59e0b]' : history.status === 'approved' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></div>
                        {index < selectedApplication.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-[#1e4976] ml-1.5"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${history.status === 'pending' ? 'text-[#f59e0b]' : history.status === 'approved' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {history.status === 'pending' ? '待审批' : history.status === 'approved' ? '已通过' : '已驳回'}
                          </span>
                          <span className="text-xs text-gray-500">{history.timestamp}</span>
                        </div>
                        {history.message && (
                          <p className="text-xs text-gray-400 mt-1">{history.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 二维码 */}
              {selectedApplication.status === 'approved' && selectedApplication.qrCode && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#00e5ff] mb-3">核销二维码</h4>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1e4976]/80 p-3 border border-[#1e4976] rounded-lg shadow-sm mb-3">
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
              )}
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gradient-to-br from-[#00e5ff]/20 to-[#0ea5e9]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-medium rounded-lg hover:bg-[#00e5ff]/30 transition-all duration-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 审批模态框 */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border border-[#1e4976] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium text-[#00e5ff]">审批申请</h3>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} className="text-[#00e5ff]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">申请信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请ID:</span>
                    <span className="font-medium text-white">{selectedApplication.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">申请人:</span>
                    <span className="font-medium text-white">{selectedApplication.applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">车牌号:</span>
                    <span className="font-medium text-white">{selectedApplication.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">起点:</span>
                    <span className="font-medium text-white">{selectedApplication.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">终点:</span>
                    <span className="font-medium text-white">{selectedApplication.endLocation}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">审批意见</label>
                <textarea
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                  placeholder="请输入审批意见（驳回时必须填写）"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex gap-3">
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 text-gray-300 border border-[#1e4976] font-medium rounded-lg hover:bg-[#1e4976] hover:text-white transition-all duration-300"
              >
                取消
              </button>
              <button 
                onClick={() => handleSubmitApproval(true)}
                className="flex-1 py-3 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 text-[#10b981] border border-[#10b981]/50 font-medium rounded-lg hover:bg-[#10b981]/30 transition-all duration-300"
              >
                通过
              </button>
              <button 
                onClick={() => {
                  if (!approvalMessage) {
                    toast.error("驳回时必须填写审批意见");
                    return;
                  }
                  handleSubmitApproval(false);
                }}
                className="flex-1 py-3 bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 text-[#ef4444] border border-[#ef4444]/50 font-medium rounded-lg hover:bg-[#ef4444]/30 transition-all duration-300"
              >
                驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionWasteApproval;