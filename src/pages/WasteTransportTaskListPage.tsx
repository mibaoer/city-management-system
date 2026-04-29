import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

// 定义清运路线类型
interface TransportRoute {
  startPoint: string;
  endPoint: string;
  routePreview: string;
}

// 定义清运任务类型
interface TransportTask {
  id: string;
  taskName: string;
  vehicleNumber: string;
  driverName: string;
  wasteType: string;
  weight: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
  route: TransportRoute;
  qrCode?: string;
}

// 模拟数据
const mockTasks: TransportTask[] = [
  {
    id: '1',
    taskName: '建筑渣土清运任务1',
    vehicleNumber: '沪A12345',
    driverName: '张三',
    wasteType: '渣土',
    weight: 15.5,
    startTime: '2023-12-01 08:00',
    endTime: '2023-12-01 12:00',
    status: 'completed',
    route: {
      startPoint: '新华工地',
      endPoint: '余杭区垃圾处理厂',
      routePreview: '新华工地-莫干山路-余杭区垃圾处理厂'
    },
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('1')}`
  },
  {
    id: '2',
    taskName: '装修垃圾清运任务2',
    vehicleNumber: '沪B67890',
    driverName: '李四',
    wasteType: '装修垃圾',
    weight: 8.2,
    startTime: '2023-12-02 09:30',
    endTime: '2023-12-02 14:30',
    status: 'inProgress',
    route: {
      startPoint: '西湖区装修现场',
      endPoint: '萧山区垃圾处理厂',
      routePreview: '西湖区装修现场-文一路-萧山区垃圾处理厂'
    },
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('2')}`
  },
  {
    id: '3',
    taskName: '拆除垃圾清运任务3',
    vehicleNumber: '沪C13579',
    driverName: '王五',
    wasteType: '拆除垃圾',
    weight: 22.7,
    startTime: '2023-12-03 10:00',
    endTime: '2023-12-03 16:00',
    status: 'pending',
    route: {
      startPoint: '江干区拆除现场',
      endPoint: '临平区垃圾处理厂',
      routePreview: '江干区拆除现场-德胜快速路-临平区垃圾处理厂'
    },
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('3')}`
  }
];

const WasteTransportTaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TransportTask[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TransportTask | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 任务详情模态框状态
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TransportTask | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    taskName: '',
    vehicleNumber: '',
    driverName: '',
    wasteType: '',
    weight: 0,
    startTime: '',
    endTime: '',
    status: 'pending' as const,
    route: {
      startPoint: '',
      endPoint: '',
      routePreview: ''
    }
  });

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // 处理添加任务
  const handleAddTask = (newTask: Omit<TransportTask, 'id'>) => {
    const taskId = Date.now().toString();
    // 生成二维码
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(taskId)}`;
    
    const taskWithId: TransportTask = {
      ...newTask,
      id: taskId,
      qrCode
    };
    setTasks([...tasks, taskWithId]);
    setShowAddModal(false);
  };

  // 处理编辑任务
  const handleEditTask = (updatedTask: TransportTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
  };

  // 处理删除任务
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  // 获取状态对应的样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态对应的中文名称
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待执行';
      case 'inProgress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };
  
  // 生成路线预览
  const generateRoutePreview = (startPoint: string, endPoint: string): string => {
    // 简单的路线生成逻辑，实际应用中可能需要调用地图API
    if (!startPoint || !endPoint) {
      return '';
    }
    
    // 模拟路线生成，添加一个中间点
    const middlePoints = [
      '莫干山路',
      '文一路',
      '德胜快速路',
      '秋石高架路',
      '留石高架路'
    ];
    
    const randomMiddlePoint = middlePoints[Math.floor(Math.random() * middlePoints.length)];
    return `${startPoint}-${randomMiddlePoint}-${endPoint}`;
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 处理路线字段
    if (name.startsWith('route.')) {
      const routeField = name.split('.')[1] as keyof TransportRoute;
      setFormData(prev => {
        const updatedRoute = {
          ...prev.route,
          [routeField]: value
        };
        
        // 如果是起点或终点变化，自动生成路线预览
        let routePreview = updatedRoute.routePreview;
        if (routeField === 'startPoint' || routeField === 'endPoint') {
          routePreview = generateRoutePreview(updatedRoute.startPoint, updatedRoute.endPoint);
        }
        
        return {
          ...prev,
          route: {
            ...updatedRoute,
            routePreview
          }
        };
      });
    } else {
      // 处理普通字段
      setFormData(prev => ({
        ...prev,
        [name]: name === 'weight' ? parseFloat(value) || 0 : value
      }));
    }
  };
  
  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName || !formData.vehicleNumber || !formData.driverName || 
        !formData.wasteType || !formData.startTime || !formData.endTime ||
        !formData.route.startPoint || !formData.route.endPoint) {
      alert('请填写所有必填字段');
      return;
    }
    
    const taskId = Date.now().toString();
    // 生成二维码
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(taskId)}`;
    
    const newTask: TransportTask = {
      id: taskId,
      ...formData,
      status: 'pending',
      qrCode
    };
    
    setTasks([...tasks, newTask]);
    setShowAddModal(false);
    
    // 重置表单
    setFormData({
      taskName: '',
      vehicleNumber: '',
      driverName: '',
      wasteType: '',
      weight: 0,
      startTime: '',
      endTime: '',
      status: 'pending',
      route: {
        startPoint: '',
        endPoint: '',
        routePreview: ''
      }
    });
  };
  
  // 监听编辑任务变化，填充表单数据
  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask);
    }
  }, [editingTask]);
  
  // 处理查看任务详情
  const handleViewTaskDetail = (task: TransportTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:bg-[#00e5ff] text-white transition-colors mr-4 shadow-lg"
            aria-label="返回"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">清运任务管理</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30 px-4 py-2 rounded-lg font-medium transition-all"
        >
          <Plus size={18} className="mr-2" />
          新建任务
        </button>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-6 rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务名称、车牌号或司机姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1e4976] rounded-md bg-[#0e2a47] hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
            >
              <Filter size={18} className="text-[#00e5ff]" />
              <span>筛选</span>
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        
        {/* 筛选面板 */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-[#1e4976]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-300 font-medium">状态:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
              >
                <option value="all">全部</option>
                <option value="pending">待执行</option>
                <option value="inProgress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e4976]">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  任务名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  车牌号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  司机姓名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  垃圾类型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  重量(吨)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  开始时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  结束时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  起点
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  终点
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  路线预览
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  核销二维码
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e4976]">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#1e4976]/50 transition-colors cursor-pointer" onClick={() => handleViewTaskDetail(task)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {task.taskName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.wasteType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.weight}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.startTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.route.startPoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {task.route.endPoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white mb-2">{task.route.routePreview}</div>
                      {/* 路线预览图 */}
                      <div className="w-full h-24 bg-[#0a1628] rounded-md overflow-hidden border border-[#1e4976]">
                        <img 
                          src="/route-map.jpg" 
                          alt="路线预览图" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'pending' ? 'bg-yellow-100/20 text-yellow-300' : task.status === 'inProgress' ? 'bg-blue-100/20 text-blue-300' : task.status === 'completed' ? 'bg-green-100/20 text-green-300' : 'bg-gray-100/20 text-gray-300'}`}>
                        {task.status === 'pending' ? '待执行' : task.status === 'inProgress' ? '进行中' : task.status === 'completed' ? '已完成' : '已取消'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.qrCode ? (
                        <div className="bg-white p-1 rounded-md inline-block">
                          <img 
                            src={task.qrCode} 
                            alt="核销二维码" 
                            className="w-12 h-12 object-contain" 
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">无二维码</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                        className="text-[#00e5ff] hover:text-[#00ffb2] mr-3"
                        aria-label="编辑"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
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
                  <td colSpan={13} className="px-6 py-10 text-center">
                    <div className="text-gray-400">暂无匹配的任务</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 任务详情模态框 */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                任务详情
              </h2>
              <button
                onClick={() => {
                  setShowTaskDetail(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-[#1e4976]/50 rounded-lg p-4 border border-[#1e4976]">
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">任务名称</p>
                      <p className="text-sm font-medium text-white">{selectedTask.taskName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">车牌号</p>
                      <p className="text-sm font-medium text-white">{selectedTask.vehicleNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">司机姓名</p>
                      <p className="text-sm font-medium text-white">{selectedTask.driverName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">垃圾类型</p>
                      <p className="text-sm font-medium text-white">{selectedTask.wasteType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">重量(吨)</p>
                      <p className="text-sm font-medium text-white">{selectedTask.weight}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">状态</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedTask.status === 'pending' ? 'bg-yellow-100/20 text-yellow-300' : selectedTask.status === 'inProgress' ? 'bg-blue-100/20 text-blue-300' : selectedTask.status === 'completed' ? 'bg-green-100/20 text-green-300' : 'bg-gray-100/20 text-gray-300'}`}>
                        {selectedTask.status === 'pending' ? '待执行' : selectedTask.status === 'inProgress' ? '进行中' : selectedTask.status === 'completed' ? '已完成' : '已取消'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 时间信息 */}
                <div className="bg-[#1e4976]/50 rounded-lg p-4 border border-[#1e4976]">
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-3">时间信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">开始时间</p>
                      <p className="text-sm font-medium text-white">{selectedTask.startTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">结束时间</p>
                      <p className="text-sm font-medium text-white">{selectedTask.endTime}</p>
                    </div>
                  </div>
                </div>

                {/* 路线信息 */}
                <div className="bg-[#1e4976]/50 rounded-lg p-4 border border-[#1e4976]">
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-3">清运路线</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">起点</p>
                      <p className="text-sm font-medium text-white">{selectedTask.route.startPoint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">终点</p>
                      <p className="text-sm font-medium text-white">{selectedTask.route.endPoint}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">路线预览</p>
                    <p className="text-sm font-medium text-white mb-4">{selectedTask.route.routePreview}</p>
                    <div className="w-full h-64 bg-[#0a1628] rounded-lg overflow-hidden border border-[#1e4976]">
                      <img 
                        src="/route-map.jpg" 
                        alt="路线预览图" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* 核销二维码 */}
                {selectedTask.qrCode && (
                  <div className="bg-[#1e4976]/50 rounded-lg p-4 border border-[#1e4976]">
                    <h3 className="text-sm font-medium text-[#00e5ff] mb-3">核销二维码</h3>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400 mb-2">此二维码用于任务核销</p>
                      <div className="bg-white p-2 rounded-lg mb-2">
                        <img 
                          src={selectedTask.qrCode} 
                          alt="任务核销二维码" 
                          className="w-32 h-32 object-contain" 
                        />
                      </div>
                      <p className="text-xs text-gray-400">任务ID: {selectedTask.id}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 关闭按钮 */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowTaskDetail(false);
                    setSelectedTask(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 模态框组件 - 同时用于添加和编辑 */}
      {(showAddModal || editingTask) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {editingTask ? '编辑清运任务' : '新建清运任务'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  // 重置表单
                  setFormData({
                    taskName: '',
                    vehicleNumber: '',
                    driverName: '',
                    wasteType: '',
                    weight: 0,
                    startTime: '',
                    endTime: '',
                    status: 'pending',
                    route: {
                      startPoint: '',
                      endPoint: '',
                      routePreview: ''
                    }
                  });
                }}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTask) {
                // 处理编辑任务
                const updatedTask: TransportTask = {
                  ...editingTask,
                  ...formData
                };
                handleEditTask(updatedTask);
              } else {
                // 处理添加任务
                handleFormSubmit(e);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">任务名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="taskName"
                    value={formData.taskName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    placeholder="请输入任务名称"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">车牌号 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    placeholder="请输入车牌号"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">司机姓名 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    placeholder="请输入司机姓名"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">垃圾类型 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    placeholder="请输入垃圾类型"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">重量(吨) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    step="0.1" 
                    min="0" 
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                    placeholder="请输入重量"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">开始时间 <span className="text-red-500">*</span></label>
                    <input 
                      type="datetime-local" 
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">结束时间 <span className="text-red-500">*</span></label>
                    <input 
                      type="datetime-local" 
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* 清运路线字段 */}
                <div className="border-t pt-4 border-[#1e4976]">
                  <h3 className="text-sm font-medium text-white mb-3">清运路线</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">起点 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="route.startPoint"
                        value={formData.route.startPoint}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                        placeholder="请输入起点"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">终点 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="route.endPoint"
                        value={formData.route.endPoint}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white"
                        placeholder="请输入终点"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">路线预览</label>
                    <input 
                      type="text" 
                      name="route.routePreview"
                      value={formData.route.routePreview}
                      readOnly
                      className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#081c2f] text-white bg-opacity-50 cursor-not-allowed mb-4"
                      placeholder="自动生成路线预览"
                    />
                    
                    {/* 路线预览图 */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">路线预览图</label>
                      <div className="w-full h-64 bg-[#0a1628] rounded-lg overflow-hidden border border-[#1e4976]">
                        <img 
                          src="/route-map.jpg" 
                          alt="路线预览图" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 按钮区域 */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
                    // 重置表单
                    setFormData({
                      taskName: '',
                      vehicleNumber: '',
                      driverName: '',
                      wasteType: '',
                      weight: 0,
                      startTime: '',
                      endTime: '',
                      status: 'pending',
                      route: {
                        startPoint: '',
                        endPoint: '',
                        routePreview: ''
                      }
                    });
                  }}
                  className="px-6 py-2.5 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium"
                >
                  保存
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteTransportTaskListPage;