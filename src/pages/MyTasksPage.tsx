import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, Play, CheckCircle2, Camera, MapPin, X, Clock, AlertCircle, FileText, Users } from 'lucide-react';
import { usePeople } from '@/hooks/usePeople';
import { Task } from './TaskListPage';

// 任务类型配置
const TASK_TYPES = [
  { id: 1, name: '沿街店铺', color: '#00e5ff' },
  { id: 2, name: '流动摊贩', color: '#00ffb2' },
  { id: 3, name: '市政设施', color: '#4ade80' },
  { id: 4, name: '人行道违停', color: '#34d399' },
  { id: 5, name: '工地管理', color: '#00d4e5' },
  { id: 6, name: '出店经营', color: '#4a9eff' },
  { id: 7, name: '广告牌', color: '#0ea5e9' },
  { id: 8, name: '违挡', color: '#38bdf8' },
  { id: 9, name: '垃圾分类', color: '#7dd3fc' },
  { id: 10, name: '环境卫生', color: '#22d3ee' },
];

// 团队配置
const TEAMS = [
  { id: 'urban', name: '城市管理团队' },
  { id: 'sequence', name: '序化管理团队' },
];

// 任务状态配置
const TASK_STATUS = [
  { id: 'pending', name: '待处理', color: '#f59e0b' },
  { id: 'inProgress', name: '进行中', color: '#3b82f6' },
  { id: 'completed', name: '已完成', color: '#10b981' },
  { id: 'cancelled', name: '已取消', color: '#6b7280' },
];

// 频率显示工具函数
const getFrequencyDisplay = (type?: string, value?: number): string => {
  if (!type || type === 'once') return '';
  const labels: Record<string, string> = {
    daily: '天', weekly: '周', monthly: '月',
    quarterly: '季度', semiannual: '半年', annual: '年',
  };
  return `每${value || 1}${labels[type] || '天'}${value || 1}次`;
};

// 执行结果配置
const EXECUTION_RESULTS = [
  { id: 'passed', name: '合格' },
  { id: 'failed', name: '不合格' },
];

// 任务执行结果接口
export interface TaskExecutionResult {
  taskId: string;
  resultType: string; // passed, failed, partial
  description: string;
  issueDetails?: string;
  resolved?: boolean;
  resolvedNote?: string;
  photos: string[];
  executedAt: string;
  executedBy: string;
}

// 生成模拟任务数据
const generateMockTasks = (): Task[] => {
  const mockTasks: Task[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 10; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 5));
    
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 3);
    
    const statusOptions = ['pending', 'inProgress', 'completed', 'cancelled'];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    mockTasks.push({
      id: `task-${i}`,
      taskName: `任务 ${i}: ${TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)].name}检查`,
      description: `这是一个关于${TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)].name}的详细检查任务，需要按照标准流程执行并记录结果。`,
      taskType: (Math.floor(Math.random() * TASK_TYPES.length) + 1).toString(),
      teamId: TEAMS[Math.floor(Math.random() * TEAMS.length)].id,
      assigneeId: `user${Math.floor(Math.random() * 3) + 1}`,
      startDate: startDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: randomStatus,
      address: `城市中心区域${Math.floor(Math.random() * 100) + 1}号`,
      priority: Math.floor(Math.random() * 3) + 1,
      createdBy: 'admin',
      createdAt: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      frequencyType: ['once', 'daily', 'weekly', 'monthly'][Math.floor(Math.random() * 4)],
      frequencyValue: Math.floor(Math.random() * 3) + 1,
    });
  }
  
  return mockTasks;
};

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllPeople, getPersonById } = usePeople();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 当前用户信息
  const currentUserId = 'user1'; // 模拟当前用户ID
  
  // 模态框状态
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showExecutionResult, setShowExecutionResult] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 执行结果状态
  const [executionResults, setExecutionResults] = useState<TaskExecutionResult[]>([]);
  const [currentExecutionResult, setCurrentExecutionResult] = useState<TaskExecutionResult>({
    taskId: '',
    resultType: 'passed',
    description: '',
    issueDetails: '',
    resolved: false,
    resolvedNote: '',
    photos: [],
    executedAt: '',
    executedBy: currentUserId
  });
  
  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 从URL参数中读取筛选条件
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      // 中文状态名到英文状态ID的映射
      const statusMapping: Record<string, string> = {
        '待处理': 'pending',
        '进行中': 'inProgress',
        '已完成': 'completed',
        '已取消': 'cancelled'
      };
      const mappedStatus = statusMapping[statusParam] || statusParam;
      setStatusFilter(mappedStatus);
    }
  }, [searchParams]);

  // 初始化加载任务
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    const mockData = generateMockTasks();
    setTasks(mockData);
    setFilteredTasks(mockData);
  }, [currentUserId]);
  
  // 应用过滤条件
  useEffect(() => {
    let filtered = tasks.filter(task => {
      // 根据搜索词过滤
      const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 根据任务类型过滤
      const matchesTaskType = taskTypeFilter === 'all' || task.taskType === taskTypeFilter;
      
      // 根据任务状态过滤
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      // 根据当前用户过滤（假设任务分配给当前用户）
      const matchesUser = task.assigneeId === currentUserId;
      
      return matchesSearch && matchesTaskType && matchesStatus && matchesUser;
    });
    
    setFilteredTasks(filtered);
  }, [searchTerm, taskTypeFilter, statusFilter, tasks, currentUserId]);
  
  // 返回上一页
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 获取人员姓名
  const getPersonName = (personId: string) => {
    const person = getPersonById(personId);
    return person ? `${person.name}` : '未知用户';
  };
  
  // 获取任务类型名称
  const getTaskTypeName = (taskTypeId: string) => {
    const type = TASK_TYPES.find(t => t.id.toString() === taskTypeId);
    return type ? type.name : '未知类型';
  };
  
  // 获取任务状态信息
  const getTaskStatusInfo = (status: string) => {
    const statusInfo = TASK_STATUS.find(s => s.id === status);
    return statusInfo || { name: '未知状态', color: '#6b7280' };
  };
  
  // 获取团队名称
  const getTeamName = (teamId: string) => {
    const team = TEAMS.find(t => t.id === teamId);
    return team ? team.name : '未知团队';
  };
  
  // 获取执行结果名称
  const getExecutionResultName = (resultId: string) => {
    const result = EXECUTION_RESULTS.find(r => r.id === resultId);
    return result ? result.name : '未知结果';
  };
  
  // 处理执行结果字段变化
  const handleExecutionResultChange = (field: string, value: string | boolean) => {
    setCurrentExecutionResult(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 提交执行结果
  const submitExecutionResult = () => {
    if (!currentExecutionResult.description) return;
    
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      const newResult: TaskExecutionResult = {
        ...currentExecutionResult,
        executedAt: new Date().toISOString(),
        photos: uploadedPhotos
      };
      
      setExecutionResults(prev => [...prev, newResult]);
      
      // 更新任务状态
      setTasks(prev => prev.map(task => 
        task.id === currentExecutionResult.taskId 
          ? { ...task, status: 'completed' }
          : task
      ));
      
      // 重置状态
      setCurrentExecutionResult({
        taskId: '',
        resultType: 'passed',
        description: '',
        issueDetails: '',
        resolved: false,
        resolvedNote: '',
        photos: [],
        executedAt: '',
        executedBy: currentUserId
      });
      
      setUploadedPhotos([]);
      setShowExecutionResult(false);
      setLoading(false);
    }, 1000);
  };
  
  // 打开执行结果模态框
  const openExecutionResultModal = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setCurrentExecutionResult(prev => ({
        ...prev,
        taskId: taskId
      }));
      setShowExecutionResult(true);
    }
  };
  
  // 开始任务
  const startTask = (taskId: string) => {
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'inProgress' }
          : task
      ));
      setLoading(false);
    }, 500);
  };
  
  // 完成任务
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // 先上传照片
      if (uploadedPhotos.length > 0) {
        setLoading(true);
        
        // 模拟上传照片
        setTimeout(() => {
          // 上传完成后打开执行结果模态框
          openExecutionResultModal(taskId);
          setLoading(false);
        }, 1000);
      } else {
        // 如果没有照片，直接打开执行结果模态框
        openExecutionResultModal(taskId);
      }
    }
  };
  
  // 查看任务详情功能已移至任务详情页面
  
  // 上传检查照片
  const uploadInspectionPhoto = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setUploadedPhotos([]); // 重置上传的照片
      setShowPhotoUpload(true);
    }
  };
  
  // 处理照片上传
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPhotos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onloadend = () => {
          if (reader.result) {
            newPhotos.push(reader.result as string);
            
            if (newPhotos.length === files.length) {
              setUploadedPhotos(prev => [...prev, ...newPhotos]);
            }
          }
        };
        
        reader.readAsDataURL(file);
      }
    }
  };
  
  // 移除上传的照片
  const removeUploadedPhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  // 确认照片上传
  const confirmPhotoUpload = () => {
    setLoading(true);
    
    // 模拟上传过程
    setTimeout(() => {
      setLoading(false);
      setShowPhotoUpload(false);
      // 上传完成后自动打开执行结果模态框
      if (selectedTask) {
        openExecutionResultModal(selectedTask.id);
      }
    }, 1000);
  };
  
  // 定位任务位置
  const locateTaskLocation = (address: string) => {
    // 模拟定位操作
    setLoading(true);
    
    setTimeout(() => {
      alert(`已在地图上标记位置：${address}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部导航栏 - 小程序风格固定导航 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="h-16 flex items-center px-4">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 
            onClick={handleGoBack}
            className="flex-1 text-center text-lg font-bold text-gray-900 -ml-8 cursor-pointer hover:bg-gray-50 py-2 rounded-md transition-colors"
          >
            我的任务
          </h1>
          <button 
            onClick={() => navigate('/construction-waste-application')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="建筑垃圾清运申请"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-700">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L13 11H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v3.85a1 1 0 0 0 .84.99l5 1V15a1 1 0 0 1-1 1z"></path>
              <path d="M9 16v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="pt-20 pb-6 px-4">
        {/* 当前位置信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">当前位置:</span>
            <span className="text-sm text-gray-700 ml-auto">文一西路166号</span>
          </div>
        </div>
        
        {/* 搜索和过滤 */}
        <div className="mb-4">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 text-sm"
            />
          </div>

          {/* 过滤选项 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* 任务类型过滤 */}
            <div className="flex-none">
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="all">任务类型</option>
                {TASK_TYPES.slice(0, 5).map((type) => (
                  <option key={type.id} value={type.id.toString()}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* 任务状态过滤 */}
            <div className="flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="all">任务状态</option>
                {TASK_STATUS.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  {/* 任务头部 */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 text-sm">{task.taskName}</h3>
                      <span 
                        className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full"
                        style={{ backgroundColor: `${getTaskStatusInfo(task.status).color}20`, color: getTaskStatusInfo(task.status).color }}
                      >
                        {getTaskStatusInfo(task.status).name}
                      </span>
                    </div>
                  </div>
                  
                  {/* 任务内容 */}
                  <div className="px-4 py-3">
                    <div className="text-gray-700 mb-3 text-sm line-clamp-2">
                      {task.description}
                    </div>
                    
                    {/* 任务信息网格 */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-xs">任务类型:</span>
                        <span className="text-gray-700 text-xs">{getTaskTypeName(task.taskType)}</span>
                      </div>
                      {(task as any).frequencyType && (task as any).frequencyType !== 'once' && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 text-xs">执行频率:</span>
                          <span className="text-gray-700 text-xs">{getFrequencyDisplay((task as any).frequencyType, (task as any).frequencyValue)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-xs">所属团队:</span>
                        <span className="text-gray-700 text-xs">{getTeamName(task.teamId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-xs">开始日期:</span>
                        <span className="text-gray-700 text-xs">{new Date(task.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-xs">截止日期:</span>
                        <span className="text-gray-700 text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* 任务位置 */}
                    <div className="flex items-center space-x-1 text-gray-600 text-xs mb-2">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="truncate">{task.address}</span>
                    </div>
                  </div>
                  
                  {/* 任务操作按钮 - 使用e.stopPropagation()防止触发整个任务项的点击事件 */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {/* 详情按钮直接导航到任务详情页面 */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/task/${task.id}`); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                        >
                          详情
                        </button>
                        
                        <div className="flex space-x-2 ml-auto">
                        {task.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); startTask(task.id); }}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center"
                          >
                            <Play size={12} className="mr-1" />
                            开始
                          </button>
                        )}
                        
                        {task.status === 'inProgress' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); uploadInspectionPhoto(task.id); }}
                            className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center mr-2"
                          >
                            <Camera size={12} className="mr-1" />
                            上传照片
                          </button>
                        )}
                        
                        {task.status === 'inProgress' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center"
                          >
                            <CheckCircle2 size={12} className="mr-1" />
                            完成
                          </button>
                        )}
                        

                      </div>
                    </div>
                  </div>
                </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">暂无符合条件的任务</p>
            </div>
          )}
        </div>
      </div>



      {/* 执行结果填写模态框 */}
      {showExecutionResult && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h2 className="text-lg font-medium text-gray-900">填写执行结果</h2>
              <button 
                onClick={() => setShowExecutionResult(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTask.taskName}</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {getTaskTypeName(selectedTask.taskType)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 执行结果选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">执行结果</label>
                  <div className="grid grid-cols-3 gap-3">
                    {EXECUTION_RESULTS.map(result => (
                      <label key={result.id} className="relative cursor-pointer">
                        <input 
                          type="radio" 
                          name="resultType"
                          value={result.id}
                          checked={currentExecutionResult.resultType === result.id}
                          onChange={(e) => handleExecutionResultChange('resultType', e.target.value)}
                          className="sr-only"
                        />
                        <span 
                          className={`block p-3 border rounded-lg transition-all text-center ${currentExecutionResult.resultType === result.id ? 
                            'border-blue-500 bg-blue-50 text-blue-700' : 
                            'border-gray-300 hover:border-gray-400'}`}
                        >
                          {result.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 执行描述 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">执行描述 *</label>
                  <textarea
                    id="description"
                    value={currentExecutionResult.description}
                    onChange={(e) => handleExecutionResultChange('description', e.target.value)}
                    rows={4}
                    placeholder="请描述任务执行的具体情况..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  />
                </div>
                
                {/* 问题详情（仅在不合格时显示） */}
                {currentExecutionResult.resultType === 'failed' && (
                  <div>
                    <label htmlFor="issueDetails" className="block text-sm font-medium text-gray-700 mb-2">问题详情</label>
                    <textarea
                      id="issueDetails"
                      value={currentExecutionResult.issueDetails || ''}
                      onChange={(e) => handleExecutionResultChange('issueDetails', e.target.value)}
                      rows={3}
                      placeholder="请详细描述发现的问题..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>
                )}
                
                {/* 已现场解决（仅在不合格时显示） */}
                {currentExecutionResult.resultType === 'failed' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="resolved"
                      checked={currentExecutionResult.resolved || false}
                      onChange={(e) => handleExecutionResultChange('resolved', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="resolved" className="ml-2 block text-sm text-gray-700">
                      已现场解决
                    </label>
                  </div>
                )}
                
                {/* 解决说明（仅在标记为已解决时显示） */}
                {(currentExecutionResult.resultType === 'failed' && 
                  currentExecutionResult.resolved) && (
                  <div>
                    <label htmlFor="resolvedNote" className="block text-sm font-medium text-gray-700 mb-2">解决说明</label>
                    <textarea
                      id="resolvedNote"
                      value={currentExecutionResult.resolvedNote || ''}
                      onChange={(e) => handleExecutionResultChange('resolvedNote', e.target.value)}
                      rows={3}
                      placeholder="请描述解决措施..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>
                )}
                
                {/* 已上传照片展示 */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">已上传照片 ({uploadedPhotos.length})</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`检查照片 ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 px-4 pb-4">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowExecutionResult(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    取消
                  </button>
                  <button 
                    onClick={submitExecutionResult}
                    disabled={!currentExecutionResult.description || loading}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${!currentExecutionResult.description || loading ? 
                      'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                  >
                    {loading ? '提交中...' : '提交结果'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 照片上传模态框 */}
      {showPhotoUpload && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-center items-center relative">
              <h2 className="text-lg font-medium text-gray-900">上传检查照片</h2>
              <button 
                onClick={() => setShowPhotoUpload(false)}
                className="absolute right-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 mb-1 text-sm">任务: {selectedTask.taskName}</p>
                <p className="text-gray-700 text-sm">位置: {selectedTask.address}</p>
              </div>
              
              {/* 已上传照片展示 */}
              {uploadedPhotos.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">已上传照片 ({uploadedPhotos.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`检查照片 ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <button 
                          onClick={() => removeUploadedPhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-gray-500 hover:bg-gray-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 上传按钮和隐藏的文件输入 */}
              <div className="mt-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-purple-100 transition-colors"
                  aria-label="选择照片上传"
                >
                  <Camera size={18} className="mr-2" />
                  选择照片上传
                </button>
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-hidden="true"
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowPhotoUpload(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  onClick={confirmPhotoUpload}
                  disabled={uploadedPhotos.length === 0 || loading}
                  className={`px-4 py-2 rounded-lg ${uploadedPhotos.length === 0 || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  {loading ? '上传中...' : '确认上传'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;