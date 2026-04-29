import React, { useState } from 'react';

// 定义清运任务接口
interface WasteTransportTask {
  id: string;
  taskId: string;
  driverName: string;
  vehicleNumber: string;
  wasteType: string;
  weight: number;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  route: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
}

// 备案车辆信息数据
const 备案车辆信息 = [
  { number: '浙A12345', driver: '张三', type: '大型货车', capacity: '10吨', phone: '13800138001' },
  { number: '浙A23456', driver: '李四', type: '中型货车', capacity: '5吨', phone: '13800138002' },
  { number: '浙A34567', driver: '王五', type: '大型货车', capacity: '12吨', phone: '13800138003' },
  { number: '浙A45678', driver: '赵六', type: '小型货车', capacity: '2吨', phone: '13800138004' },
  { number: '浙A56789', driver: '钱七', type: '中型货车', capacity: '6吨', phone: '13800138005' },
  { number: '浙A67890', driver: '孙八', type: '大型货车', capacity: '15吨', phone: '13800138006' },
  { number: '浙A78901', driver: '周九', type: '中型货车', capacity: '8吨', phone: '13800138007' }
];

// 模拟车牌号与司机姓名映射数据
const vehicleDriverMap: Record<string, string> = {
  '浙A12345': '张三',
  '浙A23456': '李四',
  '浙A34567': '王五',
  '浙A45678': '赵六',
  '浙A56789': '钱七',
  '浙A67890': '孙八',
  '浙A78901': '周九'
};

// 模拟数据
const mockTasks: WasteTransportTask[] = [
  {
    id: '1',
    taskId: 'WT20241019001',
    driverName: '张三',
    vehicleNumber: '京A12345',
    wasteType: '渣土',
    weight: 12.5,
    startTime: '2024-10-19 08:30',
    endTime: '2024-10-19 11:45',
    startLocation: '工地A',
    endLocation: '填埋场B',
    route: '工地A to 填埋场B',
    status: 'completed'
  },
  {
    id: '2',
    taskId: 'WT20241019002',
    driverName: '李四',
    vehicleNumber: '京B67890',
    wasteType: '建筑垃圾',
    weight: 8.3,
    startTime: '2024-10-19 09:15',
    endTime: '2024-10-19 12:30',
    startLocation: '工地C',
    endLocation: '资源化处理厂D',
    route: '工地C to 资源化处理厂D',
    status: 'inProgress'
  },
  {
    id: '3',
    taskId: 'WT20241019003',
    driverName: '王五',
    vehicleNumber: '京C24680',
    wasteType: '装修垃圾',
    weight: 5.7,
    startTime: '2024-10-19 14:00',
    endTime: '2024-10-19 16:20',
    startLocation: '小区E',
    endLocation: '分拣中心F',
    route: '小区E to 分拣中心F',
    status: 'pending'
  },
  {
    id: '4',
    taskId: 'WT20241019004',
    driverName: '赵六',
    vehicleNumber: '京D13579',
    wasteType: '渣土',
    weight: 15.2,
    startTime: '2024-10-19 10:00',
    endTime: '2024-10-19 13:10',
    startLocation: '工地G',
    endLocation: '填埋场B',
    route: '工地G to 填埋场B',
    status: 'completed'
  },
  {
    id: '5',
    taskId: 'WT20241019005',
    driverName: '孙七',
    vehicleNumber: '京E97531',
    wasteType: '建筑垃圾',
    weight: 9.8,
    startTime: '2024-10-19 15:30',
    endTime: '2024-10-19 18:45',
    startLocation: '工地H',
    endLocation: '资源化处理厂D',
    route: '工地H to 资源化处理厂D',
    status: 'pending'
  }
];

// 状态标签映射
const statusLabels: Record<WasteTransportTask['status'], { label: string; color: string }> = {
  pending: { label: '待开始', color: 'bg-yellow-100 text-yellow-800' },
  inProgress: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' }
};

const WasteTransportTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<WasteTransportTask[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState<WasteTransportTask | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WasteTransportTask | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Array<{number: string, driver: string}>>([]);

  // 搜索过滤功能
  const filteredTasks = tasks.filter(task => 
    task.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 根据起点和终点生成路线
  const generateRoute = (startLocation: string, endLocation: string): string => {
    return `${startLocation} to ${endLocation}`;
  };

  // 处理查看路线
  const handleViewRoute = (task: WasteTransportTask): void => {
    setSelectedTask(task);
    setShowRouteModal(true);
  };

  // 生成任务编号
  const generateTaskId = (): string => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    // 获取当天的最大序号
    const todayPrefix = `WT${today}`;
    const todayTasks = tasks.filter(task => task.taskId.startsWith(todayPrefix));
    let maxSeq = 0;
    
    todayTasks.forEach(task => {
      const seq = parseInt(task.taskId.slice(10), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    });
    
    return `${todayPrefix}${String(maxSeq + 1).padStart(3, '0')}`;
  };

  // 处理添加任务
  const handleAddTask = (): void => {
    setEditingTask({
      id: '',
      taskId: generateTaskId(),
      driverName: '',
      vehicleNumber: '',
      wasteType: '渣土',
      weight: 0,
      startTime: '',
      endTime: '',
      startLocation: '',
      endLocation: '',
      route: '',
      status: 'pending'
    });
    setShowModal(true);
    setShowVehicleDropdown(false);
  };

  // 处理编辑任务
  const handleEditTask = (task: WasteTransportTask): void => {
    setEditingTask({...task});
    setShowModal(true);
    setShowVehicleDropdown(false);
  };

  // 处理删除任务
  const handleDeleteTask = (id: string): void => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!editingTask) return false;
    
    const requiredFields = [
      'taskId', 'driverName', 'vehicleNumber', 
      'wasteType', 'startTime', 'endTime', 
      'startLocation', 'endLocation'
    ];
    
    return requiredFields.every(field => {
      const value = editingTask[field as keyof WasteTransportTask];
      return value && String(value).trim() !== '';
    }) && editingTask.weight > 0;
  };

  // 处理保存任务
  const handleSaveTask = (): void => {
    if (!validateForm()) {
      alert('请填写所有必填字段并确保重量大于0');
      return;
    }

    if (!editingTask) return;

    const updatedTask = {
      ...editingTask,
      route: generateRoute(editingTask.startLocation, editingTask.endLocation)
    };

    if (editingTask.id) {
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } else {
      const newTask = {
        ...updatedTask,
        id: Date.now().toString()
        // 任务编号已在handleAddTask中生成
      };
      setTasks([...tasks, newTask]);
    }

    setShowModal(false);
    setEditingTask(null);
    setShowVehicleDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="搜索任务编号、司机姓名或车牌号..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-3 text-gray-400" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          添加任务
        </button>
      </div>

      {/* 任务列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务编号</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">司机姓名</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">垃圾类型</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量(t)</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">清运起点</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">清运终点</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">路线</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{task.taskId}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.driverName}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.vehicleNumber}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.wasteType}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.weight}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.startTime}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.endTime}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.startLocation}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.endLocation}</td>
                <td className="py-4 px-4 text-sm">
                  <button
                    onClick={() => handleViewRoute(task)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none underline"
                  >
                    {task.route}
                  </button>
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[task.status].color}`}>
                    {statusLabels[task.status].label}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加/编辑任务模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl w-full max-w-2xl border border-[#1e4976]">
            <div className="px-6 py-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">{editingTask?.id ? '编辑任务' : '添加任务'}</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">任务编号 *</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.taskId || ''}
                    placeholder="自动生成"
                  />
                  {!editingTask?.taskId && (
                    <p className="mt-1 text-xs text-gray-400">任务编号将自动生成</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车牌号 *</label>
                  <div className="relative">
                    <div
                      className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00e5ff] flex justify-between items-center text-white"
                      onClick={() => {
                        setShowVehicleDropdown(true);
                        setVehicles(备案车辆信息);
                        setVehicleSearchTerm('');
                      }}
                    >
                      <span>{editingTask?.vehicleNumber || '点击选择车牌号'}</span>
                      <span className="text-gray-400">▼</span>
                    </div>
                    {showVehicleDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 border border-[#1e4976] rounded-md shadow-lg bg-[#0e2a47] z-50">
                        <div className="p-2 border-b border-[#1e4976]">
                          <input
                              type="text"
                              className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                              placeholder="搜索车牌号..."
                              value={vehicleSearchTerm}
                              onChange={(e) => {
                                const term = e.target.value;
                                setVehicleSearchTerm(term);
                                // 实现模糊搜索逻辑
                                if (term.trim() === '') {
                                  setVehicles(备案车辆信息);
                                } else {
                                  const filteredVehicles = 备案车辆信息.filter(vehicle => 
                                    vehicle.number.toLowerCase().includes(term.toLowerCase()) ||
                                    vehicle.driver.toLowerCase().includes(term.toLowerCase())
                                  );
                                  setVehicles(filteredVehicles);
                                }
                              }}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {vehicles.map((vehicle, index) => (
                            <div
                              key={index}
                              className="p-3 hover:bg-[#1e4976] cursor-pointer border-b border-[#1e4976] last:border-b-0 text-white"
                              onClick={() => {
                                if (editingTask) {
                                  setEditingTask({...editingTask, vehicleNumber: vehicle.number, driverName: vehicle.driver});
                                }
                                setShowVehicleDropdown(false);
                              }}
                            >
                              <div className="font-medium">{vehicle.number}</div>
                              <div className="text-sm text-gray-400">司机: {vehicle.driver}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">司机姓名 *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.driverName || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, driverName: e.target.value})}
                    placeholder="请输入司机姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">垃圾类型 *</label>
                  <select
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.wasteType || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, wasteType: e.target.value})}
                  >
                    <option value="渣土">渣土</option>
                    <option value="建筑垃圾">建筑垃圾</option>
                    <option value="装修垃圾">装修垃圾</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">重量(t) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.weight || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, weight: Number(e.target.value)})}
                    placeholder="请输入重量"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">开始时间 *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.startTime || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, startTime: e.target.value})}
                    placeholder="格式：YYYY-MM-DD HH:mm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">结束时间 *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask?.endTime || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, endTime: e.target.value})}
                    placeholder="格式：YYYY-MM-DD HH:mm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">清运起点 *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${!editingTask?.startLocation && editingTask ? 'border-red-500' : 'border-[#1e4976]'}`}
                    value={editingTask?.startLocation || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, startLocation: e.target.value})}
                    placeholder="请输入清运起点"
                  />
                  {!editingTask?.startLocation && editingTask && (
                    <p className="mt-1 text-xs text-red-400">请输入清运起点</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">清运终点 *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${!editingTask?.endLocation && editingTask ? 'border-red-500' : 'border-[#1e4976]'}`}
                    value={editingTask?.endLocation || ''}
                    onChange={(e) => editingTask && setEditingTask({...editingTask, endLocation: e.target.value})}
                    placeholder="请输入清运终点"
                  />
                  {!editingTask?.endLocation && editingTask && (
                    <p className="mt-1 text-xs text-red-400">请输入清运终点</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">路线（自动生成）</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    value={editingTask ? generateRoute(editingTask.startLocation, editingTask.endLocation) : ''}
                  />
                </div>
              </div>
              
              {/* 实时路线预览 */}
              {editingTask && (editingTask.startLocation || editingTask.endLocation) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">路线预览</label>
                  <div className="bg-[#1e4976]/50 border border-[#1e4976] rounded-lg p-3 h-24 flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      {/* 起点标记 */}
                      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center ${!editingTask.startLocation ? 'opacity-50' : ''}`}>
                        <div className="w-6 h-6 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] rounded-full flex items-center justify-center text-[#0e2a47] text-xs font-bold">S</div>
                        <div className="mt-1 text-xs font-medium text-white max-w-[80px] truncate">{editingTask.startLocation || '未设置'}</div>
                      </div>
                      
                      {/* 路线 */}
                  {(editingTask.startLocation && editingTask.endLocation) && (
                    <div className="h-0.5 bg-[#00e5ff] absolute left-8 right-8 top-1/2 transform -translate-y-1/2">
                      {/* 增加更多真实路线标记点 */}
                      <div className="absolute h-2 w-2 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '10%' }}>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1 rounded whitespace-nowrap">莫干路</div>
                      </div>
                      <div className="absolute h-2 w-2 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '25%' }}>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1 rounded whitespace-nowrap">文三路</div>
                      </div>
                      <div className="absolute h-2 w-2 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '40%' }}>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1 rounded whitespace-nowrap">德胜快速路</div>
                      </div>
                      <div className="absolute h-2 w-2 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '55%' }}>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1 rounded whitespace-nowrap">东新路</div>
                      </div>
                      <div className="absolute h-2 w-2 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '70%' }}>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1 rounded whitespace-nowrap">沪杭高速</div>
                      </div>
                    </div>
                  )}
                      
                      {/* 终点标记 */}
                      <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center ${!editingTask.endLocation ? 'opacity-50' : ''}`}>
                        <div className="w-6 h-6 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] rounded-full flex items-center justify-center text-[#0e2a47] text-xs font-bold">E</div>
                        <div className="mt-1 text-xs font-medium text-white max-w-[80px] truncate">{editingTask.endLocation || '未设置'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                <select
                  className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                  value={editingTask?.status || ''}
                  onChange={(e) => editingTask && setEditingTask({...editingTask, status: e.target.value as WasteTransportTask['status']})}
                >
                  <option value="pending">待开始</option>
                  <option value="inProgress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-[#1e4976] flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 border border-[#1e4976] rounded-md text-sm font-medium text-white hover:bg-[#1e4976] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
              >
                取消
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!validateForm()}
                className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${validateForm() ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] border-transparent text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30' : 'bg-[#1e4976] border-[#1e4976] text-gray-400 cursor-not-allowed'}`}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 路线可视化模态框 */}
      {showRouteModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl w-full max-w-2xl border border-[#1e4976]">
            <div className="px-6 py-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">路线可视化 - {selectedTask.taskId}</h3>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-white hover:text-gray-300 focus:outline-none absolute top-4 right-4"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">清运起点</label>
                  <div className="px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white">{selectedTask.startLocation}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">清运终点</label>
                  <div className="px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white">{selectedTask.endLocation}</div>
                </div>
              </div>
              
              {/* 简单的路线可视化 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">路线图</label>
                <div className="bg-[#1e4976]/50 border border-[#1e4976] rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                    {/* 起点标记 */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] rounded-full flex items-center justify-center text-[#0e2a47] font-bold">S</div>
                      <div className="mt-1 text-xs font-medium text-white">{selectedTask.startLocation}</div>
                    </div>
                    
                    {/* 路线 */}
                  <div className="h-0.5 bg-[#00e5ff] absolute left-10 right-10 top-1/2 transform -translate-y-1/2">
                    {/* 增加更多真实路线标记点 */}
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '8%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">莫干路</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '20%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">文三路</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '32%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">德胜快速路</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '45%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">东新路</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '58%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">沪杭高速</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '72%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">下沙互通</div>
                    </div>
                    <div className="absolute h-3 w-3 bg-[#00e5ff] rounded-full transform -translate-y-1/2" style={{ left: '85%' }}>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#0e2a47] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">东湖路</div>
                    </div>
                  </div>
                    
                    {/* 终点标记 */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] rounded-full flex items-center justify-center text-[#0e2a47] font-bold">E</div>
                      <div className="mt-1 text-xs font-medium text-white">{selectedTask.endLocation}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowRouteModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteTransportTaskList;