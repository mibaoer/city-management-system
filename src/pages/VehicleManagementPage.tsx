import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, Eye } from 'lucide-react';

// 定义车辆类型
interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  status: 'available' | 'inUse' | 'maintenance' | 'unavailable';
  driverName: string;
  driverPhone: string;
  registrationDate: string;
  lastMaintenanceDate: string;
}

// 模拟数据
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleNumber: '沪A12345',
    vehicleType: '自卸车',
    capacity: 20,
    status: 'available',
    driverName: '张三',
    driverPhone: '13800138001',
    registrationDate: '2022-01-15',
    lastMaintenanceDate: '2023-11-10'
  },
  {
    id: '2',
    vehicleNumber: '沪B67890',
    vehicleType: '密封式垃圾车',
    capacity: 15,
    status: 'inUse',
    driverName: '李四',
    driverPhone: '13800138002',
    registrationDate: '2022-03-20',
    lastMaintenanceDate: '2023-10-25'
  },
  {
    id: '3',
    vehicleNumber: '沪C13579',
    vehicleType: '压缩式垃圾车',
    capacity: 18,
    status: 'maintenance',
    driverName: '王五',
    driverPhone: '13800138003',
    registrationDate: '2021-11-10',
    lastMaintenanceDate: '2023-09-05'
  },
  {
    id: '4',
    vehicleNumber: '沪D24680',
    vehicleType: '自卸车',
    capacity: 25,
    status: 'available',
    driverName: '赵六',
    driverPhone: '13800138004',
    registrationDate: '2022-05-05',
    lastMaintenanceDate: '2023-11-30'
  }
];

const VehicleManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // 表单状态
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    vehicleNumber: '',
    vehicleType: '',
    capacity: 0,
    status: 'available',
    driverName: '',
    driverPhone: '',
    registrationDate: '',
    lastMaintenanceDate: ''
  });

  // 过滤车辆
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.driverPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || vehicle.status === selectedStatus;
    const matchesType = selectedType === 'all' || vehicle.vehicleType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // 获取所有车辆类型
  const vehicleTypes = ['all', ...Array.from(new Set(vehicles.map(v => v.vehicleType)))];

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      // 编辑现有车辆
      handleEditVehicle({ ...editingVehicle, ...formData });
    } else {
      // 添加新车辆
      handleAddVehicle(formData);
    }
    
    // 重置表单
    resetForm();
  };

  // 处理添加车辆
  const handleAddVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    const vehicleWithId: Vehicle = {
      ...newVehicle,
      id: Date.now().toString()
    };
    setVehicles([...vehicles, vehicleWithId]);
    setShowAddModal(false);
  };

  // 处理编辑车辆
  const handleEditVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(vehicle => vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle));
    setEditingVehicle(null);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      vehicleType: '',
      capacity: 0,
      status: 'available',
      driverName: '',
      driverPhone: '',
      registrationDate: '',
      lastMaintenanceDate: ''
    });
  };

  // 打开编辑模态框
  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      status: vehicle.status,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      registrationDate: vehicle.registrationDate,
      lastMaintenanceDate: vehicle.lastMaintenanceDate
    });
  };

  // 打开添加模态框
  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // 处理查看车辆详情
  const handleViewVehicle = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle);
  };

  // 处理删除车辆
  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('确定要删除这个车辆信息吗？')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    }
  };

  // 获取状态对应的样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-r from-green-900/50 to-green-800/50 text-[#00ffb2] border border-green-700/70 shadow-sm shadow-green-700/20';
      case 'inUse':
        return 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-[#00e5ff] border border-blue-700/70 shadow-sm shadow-blue-700/20';
      case 'maintenance':
        return 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 text-yellow-300 border border-yellow-700/70 shadow-sm shadow-yellow-700/20';
      case 'unavailable':
        return 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border border-red-700/70 shadow-sm shadow-red-700/20';
      default:
        return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 text-gray-300 border border-gray-700/70';
    }
  };

  // 获取状态对应的中文名称
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '可用';
      case 'inUse':
        return '使用中';
      case 'maintenance':
        return '维护中';
      case 'unavailable':
        return '不可用';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 bg-[#0a1628]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#00e5ff] mb-2">车辆管理</h1>
        <p className="text-gray-400">管理所有清运车辆信息，包括创建、编辑、删除和查询</p>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索车牌号、司机姓名或电话"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white placeholder-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] hover:border-[#00e5ff] hover:shadow-lg hover:shadow-[#00e5ff]/20 transition-all duration-300 text-white"
            >
              <Filter size={18} className="text-[#00e5ff]" />
              <span>筛选</span>
              {isFilterOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0a1628] rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all duration-300 font-medium"
            >
              <Plus size={18} />
              <span>新增车辆</span>
            </button>
          </div>
        </div>
        
        {/* 筛选面板 */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-[#1e4976]">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-medium">状态:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                >
                  <option value="all">全部</option>
                  <option value="available">可用</option>
                  <option value="inUse">使用中</option>
                  <option value="maintenance">维护中</option>
                  <option value="unavailable">不可用</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-medium">车型:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type} className="bg-[#0a1628]">{type === 'all' ? '全部' : type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 车辆列表 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-[#1e4976]">
            <thead className="bg-[#0a1f3a]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  车牌号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  车型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  载重(吨)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  司机姓名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  联系电话
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  注册日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  最近维护日期
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#0e2a47] divide-y divide-[#1e4976]">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[#0a1f3a]/50 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.driverPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.registrationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vehicle.lastMaintenanceDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewVehicle(vehicle)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3 transition-colors duration-300"
                        aria-label="查看详情"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(vehicle)}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3 transition-colors duration-300"
                        aria-label="编辑"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-300"
                        aria-label="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                    暂无匹配的车辆
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加/编辑车辆模态框 */}
      {(showAddModal || editingVehicle) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] border border-[#1e4976] rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#00e5ff] mb-4">{editingVehicle ? '编辑车辆' : '新增车辆'}</h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                {/* 车牌号 */}
                <div>
                  <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-300 mb-1">车牌号</label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 车型 */}
                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300 mb-1">车型</label>
                  <input
                    type="text"
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 载重 */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-1">载重(吨)</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 状态 */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  >
                    <option value="available">可用</option>
                    <option value="inUse">使用中</option>
                    <option value="maintenance">维护中</option>
                    <option value="unavailable">不可用</option>
                  </select>
                </div>
                
                {/* 司机姓名 */}
                <div>
                  <label htmlFor="driverName" className="block text-sm font-medium text-gray-300 mb-1">司机姓名</label>
                  <input
                    type="text"
                    id="driverName"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 联系电话 */}
                <div>
                  <label htmlFor="driverPhone" className="block text-sm font-medium text-gray-300 mb-1">联系电话</label>
                  <input
                    type="text"
                    id="driverPhone"
                    name="driverPhone"
                    value={formData.driverPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 注册日期 */}
                <div>
                  <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-300 mb-1">注册日期</label>
                  <input
                    type="date"
                    id="registrationDate"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
                
                {/* 最近维护日期 */}
                <div>
                  <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-300 mb-1">最近维护日期</label>
                  <input
                    type="date"
                    id="lastMaintenanceDate"
                    name="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                  />
                </div>
              </div>
              
              {/* 按钮区域 */}
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 bg-[#1e4976] text-white rounded-md hover:bg-[#2a5a8a] transition-all duration-300"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0a1628] rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all duration-300 font-medium"
                >
                  {editingVehicle ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 查看车辆详情模态框 */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] border border-[#1e4976] rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#00e5ff] mb-4">车辆详情</h2>
            
            <div className="space-y-4">
              {/* 车牌号 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">车牌号:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.vehicleNumber}</span>
              </div>
              
              {/* 车型 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">车型:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.vehicleType}</span>
              </div>
              
              {/* 载重 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">载重(吨):</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.capacity}</span>
              </div>
              
              {/* 状态 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">状态:</span>
                <span className="text-white col-span-2 font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(viewingVehicle.status)}`}>
                    {getStatusText(viewingVehicle.status)}
                  </span>
                </span>
              </div>
              
              {/* 司机姓名 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">司机姓名:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.driverName}</span>
              </div>
              
              {/* 联系电话 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">联系电话:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.driverPhone}</span>
              </div>
              
              {/* 注册日期 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">注册日期:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.registrationDate}</span>
              </div>
              
              {/* 最近维护日期 */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-400 text-sm">最近维护日期:</span>
                <span className="text-white col-span-2 font-medium">{viewingVehicle.lastMaintenanceDate}</span>
              </div>
            </div>
            
            {/* 按钮区域 */}
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setViewingVehicle(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0a1628] rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all duration-300 font-medium"
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

export default VehicleManagementPage;