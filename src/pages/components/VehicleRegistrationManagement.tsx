import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Eye, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalNode {
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  operator: string;
  message?: string;
  signatureImage?: string;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  registrationDate: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'expired';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
  approvalMessage?: string;
  approvalNodes: ApprovalNode[];
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleNumber: '京A12345',
    vehicleType: '重型自卸货车',
    capacity: 20,
    driverName: '张三',
    driverPhone: '13800138001',
    registrationDate: '2023-05-15',
    expiryDate: '2025-05-14',
    status: 'active',
    approvalStatus: 'approved',
    photoUrl: 'https://example.com/vehicle1.jpg',
    approvalNodes: [
      { status: 'pending', timestamp: '2023-05-10 10:00', operator: '系统', message: '提交备案审批' },
      { status: 'approved', timestamp: '2023-05-11 14:30', operator: '管理员', message: '审核通过', signatureImage: '' },
    ],
  },
  {
    id: '2',
    vehicleNumber: '京B67890',
    vehicleType: '中型自卸货车',
    capacity: 12,
    driverName: '李四',
    driverPhone: '13900139001',
    registrationDate: '2023-08-20',
    expiryDate: '2025-08-19',
    status: 'active',
    approvalStatus: 'pending',
    approvalNodes: [
      { status: 'pending', timestamp: '2023-08-18 09:00', operator: '系统', message: '提交备案审批' },
    ],
  },
  {
    id: '3',
    vehicleNumber: '京C24680',
    vehicleType: '轻型自卸货车',
    capacity: 8,
    driverName: '王五',
    driverPhone: '13700137001',
    registrationDate: '2022-03-10',
    expiryDate: '2024-03-09',
    status: 'expired',
    approvalStatus: 'rejected',
    approvalNodes: [
      { status: 'pending', timestamp: '2022-03-08 10:00', operator: '系统', message: '提交备案审批' },
      { status: 'rejected', timestamp: '2022-03-09 16:00', operator: '管理员', message: '证件信息不完整' },
    ],
  },
  {
    id: '4',
    vehicleNumber: '京D13579',
    vehicleType: '重型自卸货车',
    capacity: 22,
    driverName: '赵六',
    driverPhone: '13600136001',
    registrationDate: '2023-11-05',
    expiryDate: '2025-11-04',
    status: 'active',
    approvalStatus: 'approved',
    approvalNodes: [
      { status: 'pending', timestamp: '2023-11-01 10:00', operator: '系统', message: '提交备案审批' },
      { status: 'approved', timestamp: '2023-11-03 15:00', operator: '管理员', message: '审核通过' },
    ],
  },
  {
    id: '5',
    vehicleNumber: '京E97531',
    vehicleType: '中型自卸货车',
    capacity: 15,
    driverName: '孙七',
    driverPhone: '13500135001',
    registrationDate: '2023-01-18',
    expiryDate: '2025-01-17',
    status: 'inactive',
    approvalStatus: 'approved',
    approvalNodes: [
      { status: 'pending', timestamp: '2023-01-15 10:00', operator: '系统', message: '提交备案审批' },
      { status: 'approved', timestamp: '2023-01-16 14:00', operator: '管理员', message: '审核通过' },
    ],
  },
];

const statusLabels: Record<Vehicle['status'], { label: string; color: string }> = {
  active: { label: '在用', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  inactive: { label: '停用', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  expired: { label: '过期', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

const approvalLabels: Record<Vehicle['approvalStatus'], { label: string; color: string }> = {
  pending: { label: '待审批', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  approved: { label: '已通过', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  rejected: { label: '已驳回', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

const VehicleRegistrationManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicleRegistrations');
    return saved ? JSON.parse(saved) : mockVehicles;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [signatureImage, setSignatureImage] = useState('');

  useEffect(() => {
    localStorage.setItem('vehicleRegistrations', JSON.stringify(vehicles));
  }, [vehicles]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesApproval = filterApproval === 'all' || vehicle.approvalStatus === filterApproval;
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const handleAddVehicle = () => {
    setEditingVehicle({
      id: '',
      vehicleNumber: '',
      vehicleType: '重型自卸货车',
      capacity: 0,
      driverName: '',
      driverPhone: '',
      registrationDate: '',
      expiryDate: '',
      status: 'active',
      approvalStatus: 'pending',
      approvalNodes: [{ status: 'pending', timestamp: new Date().toLocaleString('zh-CN'), operator: '系统', message: '提交备案审批' }],
    });
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
    setShowModal(true);
  };

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('确定要删除这个车辆备案信息吗？')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  const handleSaveVehicle = () => {
    if (!editingVehicle) return;
    if (editingVehicle.id) {
      setVehicles(vehicles.map(vehicle =>
        vehicle.id === editingVehicle.id ? editingVehicle : vehicle
      ));
    } else {
      const newVehicle: Vehicle = {
        ...editingVehicle,
        id: Date.now().toString(),
        approvalStatus: 'pending',
        approvalNodes: [
          { status: 'pending', timestamp: new Date().toLocaleString('zh-CN'), operator: '系统', message: '提交备案审批' },
        ],
      };
      setVehicles([...vehicles, newVehicle]);
    }
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleViewDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  const openApprovalModal = (vehicle: Vehicle, action: 'approve' | 'reject') => {
    setSelectedVehicle(vehicle);
    setApprovalAction(action);
    setApprovalMessage('');
    setSignatureImage('');
    setShowApprovalModal(true);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSignatureImage(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const submitApproval = () => {
    if (!selectedVehicle || !approvalAction) return;
    if (!signatureImage) {
      // Allow approval without signature for convenience
    }
    if (!approvalMessage.trim()) {
      // Allow empty message
    }

    const newStatus: 'approved' | 'rejected' = approvalAction === 'approve' ? 'approved' : 'rejected';
    const newNode: ApprovalNode = {
      status: newStatus,
      timestamp: new Date().toLocaleString('zh-CN'),
      operator: '管理员',
      message: approvalMessage || (approvalAction === 'approve' ? '审批通过' : '审批驳回'),
      signatureImage,
    };

    setVehicles(prev => prev.map(v =>
      v.id === selectedVehicle.id
        ? { ...v, approvalStatus: newStatus, approvalNodes: [...v.approvalNodes, newNode] }
        : v
    ));
    setShowApprovalModal(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">车辆备案管理</h1>
        <button
          onClick={handleAddVehicle}
          className="flex items-center bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30 px-4 py-2 rounded-lg font-medium transition-all"
        >
          <Plus size={18} className="mr-2" />
          添加车辆
        </button>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-6 rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索车牌号、司机姓名或电话..."
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
              <option value="active">在用</option>
              <option value="inactive">停用</option>
              <option value="expired">过期</option>
            </select>
            <select
              className="px-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
            >
              <option value="all">全部审批</option>
              <option value="pending">待审批</option>
              <option value="approved">已通过</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-lg shadow border border-[#1e4976]">
          <h3 className="text-sm font-medium text-gray-400">在用车辆</h3>
          <p className="text-2xl font-bold text-green-400 mt-1">{vehicles.filter(v => v.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-lg shadow border border-[#1e4976]">
          <h3 className="text-sm font-medium text-gray-400">停用车辆</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{vehicles.filter(v => v.status === 'inactive').length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-lg shadow border border-[#1e4976]">
          <h3 className="text-sm font-medium text-gray-400">过期车辆</h3>
          <p className="text-2xl font-bold text-red-400 mt-1">{vehicles.filter(v => v.status === 'expired').length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-lg shadow border border-[#1e4976]">
          <h3 className="text-sm font-medium text-gray-400">待审批</h3>
          <p className="text-2xl font-bold text-[#00e5ff] mt-1">{vehicles.filter(v => v.approvalStatus === 'pending').length}</p>
        </div>
      </div>

      {/* 车辆列表 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e4976]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">车牌号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">车辆类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">载重(t)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">司机姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">联系电话</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">备案日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">到期日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">审批状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e4976]">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[#1e4976]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vehicle.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.vehicleType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.capacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.driverName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.driverPhone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.registrationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{vehicle.expiryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusLabels[vehicle.status].color}`}>
                        {statusLabels[vehicle.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${approvalLabels[vehicle.approvalStatus].color}`}>
                        {approvalLabels[vehicle.approvalStatus].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(vehicle)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3"
                        title="查看详情"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3"
                        title="编辑"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-400 hover:text-red-300 mr-3"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                      {vehicle.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => openApprovalModal(vehicle, 'approve')}
                            className="text-green-400 hover:text-green-300 mr-2"
                            title="审批通过"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => openApprovalModal(vehicle, 'reject')}
                            className="text-red-400 hover:text-red-300"
                            title="审批驳回"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center">
                    <div className="text-gray-400">暂无相关车辆信息</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详情模态框 */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">车辆备案详情</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedVehicle(null); }} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-medium text-[#00e5ff] mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">车牌号：</span><span className="text-white font-medium">{selectedVehicle.vehicleNumber}</span></div>
                  <div><span className="text-gray-400">车辆类型：</span><span className="text-white">{selectedVehicle.vehicleType}</span></div>
                  <div><span className="text-gray-400">载重：</span><span className="text-white">{selectedVehicle.capacity}t</span></div>
                  <div><span className="text-gray-400">司机：</span><span className="text-white">{selectedVehicle.driverName}</span></div>
                  <div><span className="text-gray-400">联系电话：</span><span className="text-white">{selectedVehicle.driverPhone}</span></div>
                  <div><span className="text-gray-400">状态：</span><span className={`px-2 py-0.5 rounded-full text-xs ${statusLabels[selectedVehicle.status].color}`}>{statusLabels[selectedVehicle.status].label}</span></div>
                  <div><span className="text-gray-400">备案日期：</span><span className="text-white">{selectedVehicle.registrationDate}</span></div>
                  <div><span className="text-gray-400">到期日期：</span><span className="text-white">{selectedVehicle.expiryDate}</span></div>
                </div>
              </div>

              {/* 审批状态 */}
              <div>
                <h3 className="text-sm font-medium text-[#00e5ff] mb-3">审批状态</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${approvalLabels[selectedVehicle.approvalStatus].color}`}>
                  {approvalLabels[selectedVehicle.approvalStatus].label}
                </span>
              </div>

              {/* 审批节点时间线 */}
              {selectedVehicle.approvalNodes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-3">审批节点</h3>
                  <div className="space-y-4">
                    {selectedVehicle.approvalNodes.map((node, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            node.status === 'approved' ? 'bg-green-400' :
                            node.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
                          }`} />
                          {index < selectedVehicle.approvalNodes.length - 1 && (
                            <div className="w-px h-6 bg-[#1e4976]" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {node.status === 'approved' ? '审批通过' : node.status === 'rejected' ? '审批驳回' : '待审批'}
                            </span>
                            <span className="text-xs text-gray-500">{node.timestamp}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {node.operator}{node.message ? `：${node.message}` : ''}
                          </div>
                          {node.signatureImage && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">签名：</span>
                              <img src={node.signatureImage} alt="审批签名" className="h-8 object-contain inline-block ml-1 border border-[#1e4976] rounded" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#1e4976] flex justify-end">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedVehicle(null); }}
                className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 审批模态框 */}
      {showApprovalModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {approvalAction === 'approve' ? '审批通过' : '审批驳回'}
              </h2>
              <button onClick={() => { setShowApprovalModal(false); setSelectedVehicle(null); }} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-[#0a1628] border border-[#1e4976] rounded-lg p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-400">车牌号：</span><span className="text-[#00e5ff]">{selectedVehicle.vehicleNumber}</span></div>
                  <div><span className="text-gray-400">车辆类型：</span>{selectedVehicle.vehicleType}</div>
                  <div><span className="text-gray-400">司机：</span>{selectedVehicle.driverName}</div>
                  <div><span className="text-gray-400">联系电话：</span>{selectedVehicle.driverPhone}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">审批意见</label>
                <textarea
                  value={approvalMessage}
                  onChange={e => setApprovalMessage(e.target.value)}
                  placeholder="请输入审批意见..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white placeholder-gray-500 focus:border-[#00e5ff] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">审批签名</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#1e4976] rounded-xl cursor-pointer hover:border-[#00e5ff]/50 transition-colors">
                  {signatureImage ? (
                    <img src={signatureImage} alt="签名预览" className="h-20 object-contain" />
                  ) : (
                    <>
                      <span className="text-xs text-gray-400">点击上传签名图片</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-[#1e4976] flex justify-end gap-3">
              <button
                onClick={() => { setShowApprovalModal(false); setSelectedVehicle(null); }}
                className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={submitApproval}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalAction === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-500/90'
                    : 'bg-red-500 text-white hover:bg-red-500/90'
                }`}
              >
                确认{approvalAction === 'approve' ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑车辆模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {editingVehicle?.id ? '编辑车辆信息' : '添加车辆备案'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingVehicle(null); }}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车牌号</label>
                  <input type="text" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.vehicleNumber || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, vehicleNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车辆类型</label>
                  <select className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.vehicleType || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, vehicleType: e.target.value })}
                  >
                    <option value="重型自卸货车">重型自卸货车</option>
                    <option value="中型自卸货车">中型自卸货车</option>
                    <option value="轻型自卸货车">轻型自卸货车</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">载重(t)</label>
                  <input type="number" step="0.1" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.capacity || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, capacity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">司机姓名</label>
                  <input type="text" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.driverName || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, driverName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">联系电话</label>
                  <input type="tel" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.driverPhone || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, driverPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">备案日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.registrationDate || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, registrationDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">到期日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.expiryDate || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                  <select className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.status || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({ ...editingVehicle, status: e.target.value as Vehicle['status'] })}
                  >
                    <option value="active">在用</option>
                    <option value="inactive">停用</option>
                    <option value="expired">过期</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#1e4976] flex justify-end space-x-3">
              <button
                onClick={() => { setShowModal(false); setEditingVehicle(null); }}
                className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium"
              >
                {editingVehicle?.id ? '保存' : '提交审批'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistrationManagement;
