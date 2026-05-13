import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  
  for (let i = 1; i <= 20; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 5));
    
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 3);
    
    const statusOptions = ['pending', 'inProgress', 'completed', 'cancelled'];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    mockTasks.push({
      id: `task-${i}`,
      taskName: `${TASK_TYPES[(i - 1) % TASK_TYPES.length].name}专项整治任务 ${i}`,
      description: `这是${TASK_TYPES[(i - 1) % TASK_TYPES.length].name}的详细描述内容，包含具体的工作要求和注意事项。`,
      taskType: TASK_TYPES[(i - 1) % TASK_TYPES.length].id.toString(),
      team: TEAMS[(i - 1) % TEAMS.length].id,
      assignees: [`user${Math.ceil(i / 3)}`],
      area: `区域${String.fromCharCode(64 + (i % 8) + 1)}`,
      address: `测试路${i}号`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: dueDate.toISOString().split('T')[0],
      status: randomStatus,
      createdAt: new Date().toISOString(),
      frequencyType: ['once', 'daily', 'weekly', 'monthly', 'quarterly'][i % 5],
      frequencyValue: (i % 3) + 1,
    });
  }
  
  return mockTasks;
};

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getAllPeople, getPersonById } = usePeople();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 执行结果状态
  const [executionResults, setExecutionResults] = useState<TaskExecutionResult[]>([]);
  const [currentExecutionResult, setCurrentExecutionResult] = useState<TaskExecutionResult>({
    taskId: taskId || '',
    resultType: 'passed',
    description: '',
    issueDetails: '',
    resolved: false,
    resolvedNote: '',
    photos: [],
    executedAt: '',
    executedBy: 'user1'
  });
  
  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 当前用户信息
  const currentUserId = 'user1'; // 模拟当前用户ID
  
  // 初始化加载任务
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    const mockData = generateMockTasks();
    setTasks(mockData);
    
    // 查找当前任务
    if (taskId) {
      const task = mockData.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setCurrentExecutionResult(prev => ({
          ...prev,
          taskId: taskId
        }));
      }
    }
  }, [taskId]);
  
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
  
  // 获取负责人名称
  const getAssigneeName = (assigneeId: string) => {
    const person = getPersonById(assigneeId);
    return person ? person.name : `未知用户(${assigneeId})`;
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
    if (!currentExecutionResult.description || !selectedTask) return;
    
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
      setSelectedTask(prev => prev ? { ...prev, status: 'completed' } : null);
      setTasks(prev => prev.map(task => 
        task.id === currentExecutionResult.taskId 
          ? { ...task, status: 'completed' }
          : task
      ));
      
      // 重置状态
      setCurrentExecutionResult({
        taskId: taskId || '',
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
      setLoading(false);
    }, 1000);
  };
  
  // 开始任务
  const startTask = (taskId: string) => {
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      setSelectedTask(prev => prev ? { ...prev, status: 'inProgress' } : null);
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
    // 如果没有照片，直接显示执行结果表单
    if (uploadedPhotos.length === 0) {
      // 执行结果表单已经在页面中显示，这里不需要额外操作
    } else {
      // 已经有照片，可以直接提交执行结果
      submitExecutionResult();
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
      // 上传完成后，执行结果表单已经在页面中显示
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

  if (!selectedTask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 font-sans">
      {/* 顶部导航栏 - 小程序风格固定导航 */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 z-10 shadow-sm">
        <div className="h-16 flex items-center px-4">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={20} className="text-blue-500" />
          </button>
          <h1 
            onClick={handleGoBack}
            className="flex-1 text-center text-lg font-bold text-gray-900 -ml-8 cursor-pointer hover:bg-gray-100 py-2 rounded-md transition-colors"
          >
            任务详情
          </h1>
          <div className="w-8">
            {/* 占位，保持标题居中 */}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="pt-20 pb-6 px-4">
        {/* 任务详情卡片 */}
        <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
          <div className="relative z-10 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTask.taskName}</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">任务描述:</p>
              <p className="text-sm text-gray-700">{selectedTask.description}</p>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">任务类型:</span>
                <span className="text-sm text-blue-500">{getTaskTypeName(selectedTask.taskType)}</span>
              </div>
              {selectedTask.frequencyType && selectedTask.frequencyType !== 'once' && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">执行频率:</span>
                  <span className="text-sm text-gray-900">{getFrequencyDisplay(selectedTask.frequencyType, selectedTask.frequencyValue)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">所属团队:</span>
                <span className="text-sm text-green-500">{getTeamName(selectedTask.team)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">负责人:</span>
                <span className="text-sm text-gray-900">{selectedTask.assignees.map(getAssigneeName).join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">任务状态:</span>
                <span 
                  className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' : selectedTask.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : selectedTask.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {getTaskStatusInfo(selectedTask.status).name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">开始日期:</span>
                <span className="text-sm text-gray-900">{selectedTask.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">截止日期:</span>
                <span className="text-sm text-gray-900">{selectedTask.endDate}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">任务位置:</span>
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin size={14} className="mr-1 text-blue-500" />
                  <span>{selectedTask.address}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">当前位置:</span>
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin size={14} className="mr-1 text-blue-500" />
                  <span>文一西路166号</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 执行结果展示 */}
        {executionResults.find(r => r.taskId === selectedTask.id) && (
          <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
            <div className="relative z-10 p-4">
              <h4 className="text-sm font-medium text-blue-500 mb-2 flex items-center">
                <FileText size={14} className="mr-1 text-blue-500" />
                执行结果
              </h4>
              {executionResults
                .filter(r => r.taskId === selectedTask.id)
                .map((result, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <div className="mb-1">
                      <span className="font-medium text-gray-900">结果类型:</span> <span className="text-green-500">{getExecutionResultName(result.resultType)}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-medium text-gray-900">执行描述:</span> {result.description}
                    </div>
                    {result.issueDetails && (
                      <div className="mb-1">
                        <span className="font-medium text-gray-900">问题详情:</span> {result.issueDetails}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      执行时间: {new Date(result.executedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* 照片上传部分 */}
        <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
          <div className="relative z-10 p-4">
            <h4 className="text-sm font-medium text-blue-500 mb-3">上传检查照片</h4>
            
            {/* 已上传照片展示 */}
            {uploadedPhotos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">已上传照片 ({uploadedPhotos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={photo} alt={`检查照片 ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <button 
                        onClick={() => removeUploadedPhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <X size={12} className="text-blue-500" />
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
                className="w-full py-3 bg-blue-50 text-blue-500 border border-blue-200 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-blue-100 transition-all duration-300"
                aria-label="选择照片上传"
              >
                <Camera size={18} className="mr-2 text-blue-500" />
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
          </div>
        </div>

        {/* 执行结果填写部分 */}
        <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
          <div className="relative z-10 p-4">
            <h4 className="text-sm font-medium text-blue-500 mb-3">填写执行结果</h4>
            
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
                        className={`block p-3 bg-white border rounded-lg transition-all text-center ${currentExecutionResult.resultType === result.id ? 
                          'border-blue-500 bg-blue-50 text-blue-500' : 
                          'border-gray-200 hover:border-blue-300'}`}
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
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
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
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
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
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded bg-white"
                  />
                  <label htmlFor="resolved" className="ml-2 block text-sm text-gray-700">
                    已现场解决
                  </label>
                </div>
              )}
              
              {/* 解决说明（仅在标记为已解决时显示） */}
              {((currentExecutionResult.resultType === 'failed') && 
                currentExecutionResult.resolved) && (
                <div>
                  <label htmlFor="resolvedNote" className="block text-sm font-medium text-gray-700 mb-2">解决说明</label>
                  <textarea
                    id="resolvedNote"
                    value={currentExecutionResult.resolvedNote || ''}
                    onChange={(e) => handleExecutionResultChange('resolvedNote', e.target.value)}
                    rows={3}
                    placeholder="请描述解决措施..."
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 任务操作按钮 */}
        <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="relative z-10 px-4 py-3">
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={confirmPhotoUpload}
                disabled={uploadedPhotos.length === 0 || loading}
                className={`px-6 py-3 bg-blue-50 text-blue-500 border border-blue-200 rounded-lg text-sm flex items-center justify-center font-medium transition-all duration-300 ${uploadedPhotos.length === 0 || loading ? 
                  'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100 hover:border-blue-300'}`}
              >
                <Camera size={16} className="mr-1 text-blue-500" />
                {loading ? '上传中...' : '确认上传'}
              </button>
              
              <button 
                onClick={() => completeTask(selectedTask.id)}
                disabled={!currentExecutionResult.description || loading}
                className={`px-6 py-3 bg-blue-500 text-white border border-blue-500 rounded-lg text-sm flex items-center justify-center font-medium transition-all duration-300 ${!currentExecutionResult.description || loading ? 
                  'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 hover:border-blue-600'}`}
              >
                <CheckCircle2 size={16} className="mr-1 text-white" />
                {loading ? '提交中...' : '完成任务'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;