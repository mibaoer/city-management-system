import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, X } from 'lucide-react';

// 定义车辆接口
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
  photoUrl?: string;
}

// 模拟数据
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
    photoUrl: 'https://example.com/vehicle1.jpg'
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
    status: 'active'
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
    status: 'expired'
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
    status: 'active'
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
    status: 'inactive'
  }
];

// 状态标签映射
const statusLabels: Record<Vehicle['status'], { label: string; color: string }> = {
  active: { label: '在用', color: 'bg-green-100/20 text-green-300' },
  inactive: { label: '停用', color: 'bg-yellow-100/20 text-yellow-300' },
  expired: { label: '过期', color: 'bg-red-100/20 text-red-300' }
};

const VehicleRegistrationManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 过滤功能
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverPhone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // 处理添加车辆
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
      status: 'active'
    });
    setShowModal(true);
  };

  // 处理编辑车辆
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  // 处理删除车辆
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('确定要删除这个车辆备案信息吗？')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  // 处理保存车辆信息
  const handleSaveVehicle = () => {
    if (!editingVehicle) return;

    if (editingVehicle.id) {
      // 更新现有车辆
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === editingVehicle.id ? editingVehicle : vehicle
      ));
    } else {
      // 添加新车辆
      const newVehicle = {
        ...editingVehicle,
        id: Date.now().toString()
      };
      setVehicles([...vehicles, newVehicle]);
    }

    setShowModal(false);
    setEditingVehicle(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 页面头部 */}
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
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>

      {/* 车辆列表 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e4976]">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  车牌号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  车辆类型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  载重(t)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  司机姓名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  联系电话
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  备案日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  到期日期
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
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[#1e4976]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.driverPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.registrationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {vehicle.expiryDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusLabels[vehicle.status].color}`}>
                        {statusLabels[vehicle.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3"
                        aria-label="编辑"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-400 hover:text-red-300"
                        aria-label="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center">
                    <div className="text-gray-400">暂无相关车辆信息</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加/编辑车辆模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {editingVehicle?.id ? '编辑车辆信息' : '添加车辆备案'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVehicle(null);
                }}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车牌号</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.vehicleNumber || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, vehicleNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车辆类型</label>
                  <select
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.vehicleType || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, vehicleType: e.target.value})}
                  >
                    <option value="重型自卸货车">重型自卸货车</option>
                    <option value="中型自卸货车">中型自卸货车</option>
                    <option value="轻型自卸货车">轻型自卸货车</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">载重(t)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.capacity || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, capacity: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">司机姓名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.driverName || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, driverName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">联系电话</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.driverPhone || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, driverPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">备案日期</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.registrationDate || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, registrationDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">到期日期</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.expiryDate || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, expiryDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                  <select
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    value={editingVehicle?.status || ''}
                    onChange={(e) => editingVehicle && setEditingVehicle({...editingVehicle, status: e.target.value as Vehicle['status']})}
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
                onClick={() => {
                  setShowModal(false);
                  setEditingVehicle(null);
                }}
                className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistrationManagement;