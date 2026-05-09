import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Plus, Users, User, ChevronDown, MoreHorizontal, Save, X, FileText } from 'lucide-react';
import { usePeople } from 'src/hooks/usePeople';

// 任务类型定义
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

// 团队选择
const TEAMS = [
  { id: 'urban', name: '城市管理团队' },
  { id: 'sequence', name: '序化管理团队' },
];

// 任务状态
const TASK_STATUS = [
  { id: 'pending', name: '待处理', color: '#f59e0b' },
  { id: 'inProgress', name: '进行中', color: '#3b82f6' },
  { id: 'completed', name: '已完成', color: '#10b981' },
  { id: 'cancelled', name: '已取消', color: '#6b7280' },
];

// 职能分类定义
const FUNCTION_CATEGORIES = {
  urban: [
    { id: '1', name: '市政保洁' },
    { id: '2', name: '市政绿化' },
    { id: '3', name: '垃圾分类' },
    { id: '4', name: '渣土管理' }
  ],
  sequence: [
    { id: '5', name: '流动摊贩' },
    { id: '6', name: '违章建筑' },
    { id: '7', name: '地铁口管理' },
    { id: '8', name: '车辆违停' },
    { id: '9', name: '其它' }
  ]
};

// 重点区域定义
const KEY_AREAS = [
  { id: '1', name: '永旺梦乐城' },
  { id: '2', name: '未来之光' },
  { id: '3', name: '洲际酒店' },
  { id: '4', name: '玉鸟集' },
  { id: '5', name: '医院' },
  { id: '6', name: '地铁口' },
  { id: '7', name: '学校' }
];

// 主要道路定义
const MAIN_ROADS = [
  { id: '1', name: '古墩路' },
  { id: '2', name: '玉鸟路' },
  { id: '3', name: '良渚大道' },
  { id: '4', name: '莫干山路' },
  { id: '5', name: '设计路' },
  { id: '6', name: '大陆路' },
  { id: '7', name: '荀甫路' },
  { id: '8', name: '运溪路' },
  { id: '9', name: '美学街' }
];

// 任务接口定义
export interface Task {
  id: string;
  taskName: string;
  taskType: string;
  functionCategory: string; // 职能分类
  keyArea: string; // 重点区域
  mainRoad: string; // 主要道路
  description: string;
  team: string;
  assignees: string[];
  area: string;
  address: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

// 模拟任务数据
const generateMockTasks = (): Task[] => {
  const tasks: Task[] = [];
  const persons = ['张三', '李四', '王五', '赵六', '陈七', '林八', '周九', '吴十']; // 更真实的姓名列表

  for (let i = 1; i <= 20; i++) {
    const taskTypeIndex = (i - 1) % TASK_TYPES.length;
    const teamIndex = (i - 1) % TEAMS.length;
    const statusIndex = (i - 1) % TASK_STATUS.length;
    const assigneeGroup = Math.ceil(i / 3);
    const assigneeIndex = (assigneeGroup - 1) % persons.length;
    const assigneeId = `user${assigneeGroup}`;
    const teamId = TEAMS[teamIndex].id;
    
    // 根据团队选择对应的职能分类
    const functionCategories = FUNCTION_CATEGORIES[teamId as keyof typeof FUNCTION_CATEGORIES];
    const functionCategoryIndex = i % functionCategories.length;
    
    // 随机选择重点区域和主要道路
    const keyAreaIndex = i % KEY_AREAS.length;
    const mainRoadIndex = i % MAIN_ROADS.length;
    
    // 生成日期
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (i % 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (i % 14) + 3);
    
    tasks.push({
      id: `task-${i}`,
      taskName: `${TASK_TYPES[taskTypeIndex].name}专项整治任务 ${i}`,
      taskType: TASK_TYPES[taskTypeIndex].id.toString(),
      functionCategory: functionCategories[functionCategoryIndex].id,
      keyArea: KEY_AREAS[keyAreaIndex].id,
      mainRoad: MAIN_ROADS[mainRoadIndex].id,
      description: `这是${TASK_TYPES[taskTypeIndex].name}的详细描述内容，包含具体的工作要求和注意事项。`,
      team: teamId,
      assignees: [assigneeId], // 使用数组格式
      area: `区域${String.fromCharCode(64 + (i % 8) + 1)}`,
      address: `测试路${i}号`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: TASK_STATUS[statusIndex].id,
      createdAt: new Date().toISOString()
    });
  }
  return tasks;
};

interface TaskListPageProps {
  defaultTeam?: string;
}

const TaskListPage: React.FC<TaskListPageProps> = ({ defaultTeam = 'all' }) => {
  const navigate = useNavigate();
  const { getAllPeople, getPersonById, getDepartments } = usePeople();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // 筛选条件状态
  const [searchTerm, setSearchTerm] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>(defaultTeam);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [functionCategoryFilter, setFunctionCategoryFilter] = useState<string>('all'); // 职能分类筛选
  const [keyAreaFilter, setKeyAreaFilter] = useState<string>('all'); // 重点区域筛选
  const [mainRoadFilter, setMainRoadFilter] = useState<string>('all'); // 主要道路筛选
  
  // tab切换状态
  const [activeTab, setActiveTab] = useState<string>(defaultTeam === 'urban' ? 'urban' : defaultTeam === 'sequence' ? 'sequence' : 'all'); // 'all', 'urban', 'sequence'
  
  // 新建任务弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    taskName: '',
    taskType: '',
    functionCategory: '', // 职能分类
    keyArea: '', // 重点区域
    mainRoad: '', // 主要道路
    description: '',
    team: '',
    assignees: [] as string[], // 改为数组支持多选
    address: '',
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 附件上传状态
  const [uploadedAttachments, setUploadedAttachments] = useState<{name: string, url: string, type: string}[]>([]);
  
  // 展开收起状态
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  
  // 人员选择相关状态
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [personnelFilterType, setPersonnelFilterType] = useState<'department' | 'function'>('department');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedFunctionCategories, setSelectedFunctionCategories] = useState<number[]>([]);
  
  // 获取所有人员和部门
  const allPeople = getAllPeople();
  const allDepartments = getDepartments();
  const [availablePersonnel, setAvailablePersonnel] = useState<typeof allPeople>([]);
  
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
    
    // 从URL参数中读取team值
    const teamParam = searchParams.get('team');
    if (teamParam && (teamParam === 'urban' || teamParam === 'sequence')) {
      setActiveTab(teamParam);
    }
  }, [searchParams]);

  // 加载模拟任务数据
  useEffect(() => {
    const mockTasks = generateMockTasks();
    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
  }, []);
  
  // 执行筛选
  useEffect(() => {
    let result = [...tasks];
    
    // 按tab切换筛选
    if (activeTab !== 'all') {
      result = result.filter(task => task.team === activeTab);
    }
    
    // 按任务名称搜索
    if (searchTerm) {
      result = result.filter(task => 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 按任务类型筛选
    if (taskTypeFilter !== 'all') {
      result = result.filter(task => task.taskType === taskTypeFilter);
    }
    
    // 按状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // 按执行人员筛选
    if (assigneeFilter !== 'all') {
      result = result.filter(task => task.assignees.includes(assigneeFilter));
    }
    
    // 按职能分类筛选
    if (functionCategoryFilter !== 'all') {
      result = result.filter(task => task.functionCategory === functionCategoryFilter);
    }
    
    // 按重点区域筛选
    if (keyAreaFilter !== 'all') {
      result = result.filter(task => task.keyArea === keyAreaFilter);
    }
    
    // 按主要道路筛选
    if (mainRoadFilter !== 'all') {
      result = result.filter(task => task.mainRoad === mainRoadFilter);
    }
    
    setFilteredTasks(result);
  }, [searchTerm, taskTypeFilter, activeTab, statusFilter, assigneeFilter, functionCategoryFilter, keyAreaFilter, mainRoadFilter, tasks]);
  
  // 根据筛选条件获取可用人员
  useEffect(() => {
    let filtered = allPeople.filter(p => p.isActive);
    
    if (personnelFilterType === 'department' && selectedDepartments.length > 0) {
      filtered = filtered.filter(p => selectedDepartments.includes(p.department));
    } else if (personnelFilterType === 'function' && selectedFunctionCategories.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.functionType || p.functionType.length === 0) return false;
        const selectedFunctionNames = selectedFunctionCategories.map(
          id => TASK_TYPES.find(cat => cat.id === id)?.name
        ).filter(Boolean);
        return p.functionType.some(ft => selectedFunctionNames.includes(ft));
      });
    }
    
    setAvailablePersonnel(filtered);
  }, [personnelFilterType, selectedDepartments, selectedFunctionCategories, allPeople]);
  
  // 处理创建新任务
  const handleCreateTask = () => {
    setShowCreateModal(true);
  };
  
  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 获取人员姓名
  const getPersonName = (personId: string) => {
    const person = getPersonById(personId);
    return person ? person.name : `未知用户(${personId})`;
  };
  
  // 获取任务类型名称
  const getTaskTypeName = (taskTypeId: string) => {
    const taskType = TASK_TYPES.find(type => type.id.toString() === taskTypeId);
    return taskType ? taskType.name : '未知类型';
  };
  
  // 获取任务状态信息
  const getTaskStatusInfo = (status: string) => {
    return TASK_STATUS.find(s => s.id === status) || { id: status, name: status, color: '#6b7280' };
  };
  
  // 获取团队名称
  const getTeamName = (teamId: string) => {
    const team = TEAMS.find(t => t.id === teamId);
    return team ? team.name : '未知团队';
  };
  
  // 获取职能分类名称
  const getFunctionCategoryName = (categoryId: string) => {
    // 遍历所有职能分类，查找匹配的名称
    for (const teamId in FUNCTION_CATEGORIES) {
      const categories = FUNCTION_CATEGORIES[teamId as keyof typeof FUNCTION_CATEGORIES];
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        return category.name;
      }
    }
    return '未知分类';
  };
  
  // 获取重点区域名称
  const getKeyAreaName = (areaId: string) => {
    const area = KEY_AREAS.find(area => area.id === areaId);
    return area ? area.name : '未知区域';
  };
  
  // 获取主要道路名称
  const getMainRoadName = (roadId: string) => {
    const road = MAIN_ROADS.find(road => road.id === roadId);
    return road ? road.name : '未知道路';
  };
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 关闭新建任务弹窗
  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };
  
  // 重置表单
  const resetForm = () => {
    setFormData({
      taskName: '',
      taskType: '',
      functionCategory: '', // 职能分类
      keyArea: '', // 重点区域
      mainRoad: '', // 主要道路
      description: '',
      team: '',
      assignees: [],
      area: '',
      address: '',
      startDate: '',
      endDate: '',
    });
    setSelectedDepartments([]);
    setSelectedFunctionCategories([]);
    setErrors({});
    setUploadedAttachments([]);
  };
  
  // 处理附件上传
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setUploadedAttachments([...uploadedAttachments, ...newAttachments]);
    }
  };
  
  // 移除附件
  const removeAttachment = (index: number) => {
    setUploadedAttachments(uploadedAttachments.filter((_, i) => i !== index));
  };
  
  // 切换部门选择
  const toggleDepartment = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };
  
  // 切换职能分类选择（用于人员筛选）
  const togglePersonnelFunctionCategory = (categoryId: number) => {
    setSelectedFunctionCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // 切换人员选择
  const togglePersonnel = (personId: string) => {
    setFormData(prev => {
      const newAssignees = prev.assignees.includes(personId)
        ? prev.assignees.filter(id => id !== personId)
        : [...prev.assignees, personId];
      
      // 如果只有一个人员被选择，自动填充执行团队和职能分类
      if (newAssignees.length === 1) {
        const person = allPeople.find(p => p.id === newAssignees[0]);
        if (person) {
          // 根据人员的department或functionType推断执行团队
          // 这里假设城市管理相关的部门属于urban团队，序化管理相关的属于sequence团队
          const team = person.department.includes('城市') || person.department.includes('市政') ? 'urban' : 'sequence';
          
          // 从functionType中获取第一个职能分类，匹配对应的FUNCTION_CATEGORIES
          let functionCategory = '';
          if (person.functionType && person.functionType.length > 0) {
            const firstFunctionType = person.functionType[0];
            // 查找匹配的职能分类ID
            const categories = FUNCTION_CATEGORIES[team as keyof typeof FUNCTION_CATEGORIES];
            const matchedCategory = categories.find(cat => cat.name === firstFunctionType);
            if (matchedCategory) {
              functionCategory = matchedCategory.id;
            }
          }
          
          return {
            ...prev,
            assignees: newAssignees,
            team,
            functionCategory
          };
        }
      }
      
      return {
        ...prev,
        assignees: newAssignees
      };
    });
  };
  
  // 全选当前筛选的人员
  const selectAllPersonnel = () => {
    const allIds = availablePersonnel.map(p => p.id);
    setFormData(prev => ({
      ...prev,
      assignees: [...new Set([...prev.assignees, ...allIds])]
    }));
  };
  
  // 取消全选当前筛选的人员
  const deselectAllPersonnel = () => {
    const allIds = availablePersonnel.map(p => p.id);
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(id => !allIds.includes(id))
    }));
  };
  
  // 打开人员选择弹窗
  const openPersonnelModal = () => {
    // 根据任务类型自动设置职能分类筛选
    if (formData.taskType) {
      setPersonnelFilterType('function');
      setSelectedFunctionCategories([Number(formData.taskType)]);
      setSelectedDepartments([]);
    }
    setShowPersonnelModal(true);
  };
  
  // 关闭人员选择弹窗
  const closePersonnelModal = () => {
    // 如果选择了多个人员，使用第一个人员的信息填充执行团队和职能分类
    if (formData.assignees.length > 0) {
      const firstPerson = allPeople.find(p => p.id === formData.assignees[0]);
      if (firstPerson) {
        // 根据人员的department或functionType推断执行团队
        const team = firstPerson.department.includes('城市') || firstPerson.department.includes('市政') ? 'urban' : 'sequence';
        
        // 从functionType中获取第一个职能分类，匹配对应的FUNCTION_CATEGORIES
        let functionCategory = '';
        if (firstPerson.functionType && firstPerson.functionType.length > 0) {
          const firstFunctionType = firstPerson.functionType[0];
          // 查找匹配的职能分类ID
          const categories = FUNCTION_CATEGORIES[team as keyof typeof FUNCTION_CATEGORIES];
          const matchedCategory = categories.find(cat => cat.name === firstFunctionType);
          if (matchedCategory) {
            functionCategory = matchedCategory.id;
          }
        }
        
        setFormData(prev => ({
          ...prev,
          team,
          functionCategory
        }));
      }
    }
    
    setShowPersonnelModal(false);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = '请输入任务名称';
    }
    if (!formData.taskType) {
      newErrors.taskType = '请选择任务类型';
    }
    if (!formData.functionCategory) {
      newErrors.functionCategory = '请选择职能分类';
    }

    if (!formData.team) {
      newErrors.team = '请选择执行团队';
    }
    if (formData.assignees.length === 0) {
      newErrors.assignees = '请至少选择一位执行人员';
    }

    if (!formData.startDate) {
      newErrors.startDate = '请选择开始日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 这里应该调用API保存任务
      console.log('创建任务:', formData);
      console.log('上传的附件:', uploadedAttachments);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建新任务对象
      const newTask: Task = {
        id: `task-${tasks.length + 1}`,
        taskName: formData.taskName,
        taskType: formData.taskType,
        functionCategory: formData.functionCategory,
        keyArea: formData.keyArea,
        mainRoad: formData.mainRoad,
        description: formData.description,
        team: formData.team,
        assignees: formData.assignees,
        area: KEY_AREAS.find(area => area.id === formData.keyArea)?.name || '',
        address: formData.address,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // 更新任务列表
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      
      // 关闭弹窗并重置表单
      setShowCreateModal(false);
      resetForm();
      
      // 显示成功提示
      alert('任务创建成功！');
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 数据统计区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsStatsExpanded(!isStatsExpanded)}>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="w-1 h-6 bg-[#00e5ff] rounded-full mr-3"></div>
            数据统计
          </h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`transform transition-transform text-[#00e5ff] hover:text-[#00ffb2] ${isStatsExpanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        
        {isStatsExpanded && activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 城市管理统计 */}
            <div className="bg-[#0a1628]/50 p-4 rounded-lg border border-[#1e4976]">
              <h4 className="text-md font-semibold text-[#00ffb2] mb-3">城市管理</h4>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {FUNCTION_CATEGORIES.urban.map(category => {
                  const count = filteredTasks.filter(task => task.team === 'urban' && task.functionCategory === category.id).length;
                  return (
                    <div key={category.id} className="bg-[#0a1628] p-4 rounded-lg border border-[#1e4976]">
                      <p className="text-sm text-gray-400 mb-1">{category.name}</p>
                      <p className="text-2xl font-bold text-[#00ffb2]">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 序化管理统计 */}
            <div className="bg-[#0a1628]/50 p-4 rounded-lg border border-[#1e4976]">
              <h4 className="text-md font-semibold text-[#00e5ff] mb-3">序化管理</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FUNCTION_CATEGORIES.sequence.map(category => {
                  const count = filteredTasks.filter(task => task.team === 'sequence' && task.functionCategory === category.id).length;
                  return (
                    <div key={category.id} className="bg-[#0a1628] p-4 rounded-lg border border-[#1e4976]">
                      <p className="text-sm text-gray-400 mb-1">{category.name}</p>
                      <p className="text-2xl font-bold text-[#00e5ff]">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'urban' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FUNCTION_CATEGORIES.urban.map(category => {
              const count = filteredTasks.filter(task => task.functionCategory === category.id).length;
              return (
                <div key={category.id} className="bg-[#0a1628] p-4 rounded-lg border border-[#1e4976]">
                  <p className="text-sm text-gray-400 mb-1">{category.name}</p>
                  <p className="text-2xl font-bold text-[#00e5ff]">{count}</p>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'sequence' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {FUNCTION_CATEGORIES.sequence.map(category => {
              const count = filteredTasks.filter(task => task.functionCategory === category.id).length;
              return (
                <div key={category.id} className="bg-[#0a1628] p-4 rounded-lg border border-[#1e4976]">
                  <p className="text-sm text-gray-400 mb-1">{category.name}</p>
                  <p className="text-2xl font-bold text-[#00e5ff]">{count}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="w-1 h-6 bg-[#00e5ff] rounded-full mr-3"></div>
            筛选条件
          </h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`transform transition-transform text-[#00e5ff] hover:text-[#00ffb2] ${isFiltersExpanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        
        {isFiltersExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索任务名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
                />
              </div>

              {/* 任务类型筛选 */}
              <div className="relative">
                <select
                  value={taskTypeFilter}
                  onChange={(e) => setTaskTypeFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有任务类型</option>
                  {TASK_TYPES.map((type) => (
                    <option key={type.id} value={type.id.toString()}>{type.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 状态筛选 */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有状态</option>
                  {TASK_STATUS.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 执行人员筛选 */}
              <div className="relative">
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有人员</option>
                  {getAllPeople().filter(p => p.isActive).map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 新建任务按钮 */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreateTask}
                  className="flex items-center bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                >
                  <Plus size={18} className="mr-2" />
                  新建任务
                </button>
              </div>

              {/* 职能分类筛选 */}
              <div className="relative">
                <select
                  value={functionCategoryFilter}
                  onChange={(e) => setFunctionCategoryFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有职能分类</option>
                  {activeTab === 'all' ? (
                    Object.values(FUNCTION_CATEGORIES).flat().map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  ) : (
                    FUNCTION_CATEGORIES[activeTab as keyof typeof FUNCTION_CATEGORIES].map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 重点区域筛选 */}
              <div className="relative">
                <select
                  value={keyAreaFilter}
                  onChange={(e) => setKeyAreaFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有重点区域</option>
                  {KEY_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* 主要道路筛选 */}
              <div className="relative">
                <select
                  value={mainRoadFilter}
                  onChange={(e) => setMainRoadFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white appearance-none"
                >
                  <option value="all">所有主要道路</option>
                  {MAIN_ROADS.map((road) => (
                    <option key={road.id} value={road.id}>{road.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">任务名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">任务类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">职能分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">重点区域</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">主要道路</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">执行团队</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">执行人员</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">区域</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">开始日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">结束日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e4976]">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-[#1e4976]/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/task/${task.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white hover:text-[#00e5ff] transition-colors">
                        {task.taskName}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: `${TASK_TYPES.find(t => t.id.toString() === task.taskType)?.color || '#6b7280'}20`,
                          color: TASK_TYPES.find(t => t.id.toString() === task.taskType)?.color || '#6b7280'
                        }}
                      >
                        {getTaskTypeName(task.taskType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getFunctionCategoryName(task.functionCategory)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getKeyAreaName(task.keyArea)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getMainRoadName(task.mainRoad)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{getTeamName(task.team)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.map((assigneeId) => (
                          <span key={assigneeId} className="px-2 py-0.5 text-xs rounded-full bg-[#1e4976] text-white">
                            {getPersonName(assigneeId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{task.area}</div>
                      <div className="text-xs text-gray-400">{task.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{task.startDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{task.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{ backgroundColor: `${getTaskStatusInfo(task.status).color}20`, color: getTaskStatusInfo(task.status).color }}
                      >
                        {getTaskStatusInfo(task.status).name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-[#00e5ff] hover:text-[#00ffb2] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center">
                    <div className="text-gray-400">暂无符合条件的任务</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页信息 */}
        <div className="px-6 py-4 border-t border-[#1e4976] bg-[#0a1628] flex items-center justify-between">
          <div className="text-sm text-gray-400">
            共 {tasks.length} 条记录，当前显示 {filteredTasks.length} 条
          </div>
          <div className="flex space-x-2">
            {/* 简单的分页控件占位 */}
            <button disabled className="px-3 py-1 rounded border border-[#1e4976] bg-[#0e2a47] text-gray-500 cursor-not-allowed">
              上一页
            </button>
            <button disabled className="px-3 py-1 rounded border border-[#00e5ff] bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium">
              1
            </button>
            <button disabled className="px-3 py-1 rounded border border-[#1e4976] bg-[#0e2a47] text-gray-500 cursor-not-allowed">
              下一页
            </button>
          </div>
        </div>
      </div>
      
      {/* 新建任务弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#1e4976]">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">创建日常检查任务</h3>
                <p className="text-sm text-gray-300 mt-1">填写日常检查任务信息并关联职能分类</p>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            
            {/* 表单内容 */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* 基本信息 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-[#00e5ff] rounded-full mr-3"></div>
                  基本信息
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 任务名称 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      任务名称 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="taskName"
                      value={formData.taskName}
                      onChange={handleChange}
                      placeholder="请输入任务名称"
                      className={`w-full px-4 py-2 border rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${errors.taskName ? 'border-red-500' : 'border-[#1e4976]'}`}
                    />
                    {errors.taskName && (
                      <p className="mt-1 text-sm text-red-400">{errors.taskName}</p>
                    )}
                  </div>
                  
                  {/* 任务描述 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      任务描述
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="请详细描述任务内容、要求和注意事项..."
                      className="w-full px-4 py-2 border border-[#1e4976] rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>
                  
                  {/* 执行人员 - 多选 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      执行人员 <span className="text-red-400">*</span>
                    </label>
                    <div
                      onClick={openPersonnelModal}
                      className={`w-full min-h-[42px] px-4 py-2 border rounded-lg bg-[#0a1628] cursor-pointer transition-colors ${errors.assignees ? 'border-red-500' : 'border-[#1e4976] hover:border-[#00e5ff]'}`}
                    >
                      {formData.assignees.length === 0 ? (
                        <span className="text-gray-500">点击选择执行人员（支持按部门或职能分类筛选）</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.assignees.map(id => {
                            const person = allPeople.find(p => p.id === id);
                            if (!person) return null;
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center px-3 py-1 bg-[#1e4976] text-white rounded-full text-sm"
                              >
                                <User size={14} className="mr-1" />
                                {person.name}
                                <span className="ml-1 text-[#00e5ff]">({person.department})</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePersonnel(id);
                                  }}
                                  className="ml-1 text-gray-400 hover:text-white"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {errors.assignees && (
                      <p className="mt-1 text-sm text-red-400">{errors.assignees}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      已选择 {formData.assignees.length} 位人员
                    </p>
                  </div>
                  
                  {/* 执行团队 - 根据选择的执行人员自动填充 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      执行团队 <span className="text-red-400">*</span>
                    </label>
                    <div className="w-full px-4 py-3 border rounded-lg bg-[#1e4976] text-white border-[#1e4976]">
                      {formData.team ? TEAMS.find(team => team.id === formData.team)?.name : '请先选择执行人员'}
                    </div>
                    {errors.team && (
                      <p className="mt-1 text-sm text-red-400">{errors.team}</p>
                    )}
                  </div>
                  
                  {/* 职能分类 - 根据选择的执行人员自动填充 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      职能分类 <span className="text-red-400">*</span>
                    </label>
                    <div className="w-full px-4 py-3 border rounded-lg bg-[#1e4976] text-white border-[#1e4976]">
                      {formData.functionCategory ? (
                        formData.team && FUNCTION_CATEGORIES[formData.team as keyof typeof FUNCTION_CATEGORIES] ? (
                          FUNCTION_CATEGORIES[formData.team as keyof typeof FUNCTION_CATEGORIES].find(category => category.id === formData.functionCategory)?.name || '未知分类'
                        ) : '未知分类'
                      ) : '请先选择执行人员'}
                    </div>
                    {errors.functionCategory && (
                      <p className="mt-1 text-sm text-red-400">{errors.functionCategory}</p>
                    )}
                  </div>
                  
                  {/* 任务类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      任务类型 <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="taskType"
                      value={formData.taskType}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${errors.taskType ? 'border-red-500' : 'border-[#1e4976]'}`}
                    >
                      <option value="">请选择任务类型</option>
                      {TASK_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    {errors.taskType && (
                      <p className="mt-1 text-sm text-red-400">{errors.taskType}</p>
                    )}
                  </div>
                  
                  {/* 重点区域 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      重点区域
                    </label>
                    <select
                      name="keyArea"
                      value={formData.keyArea}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${errors.keyArea ? 'border-red-500' : 'border-[#1e4976]'}`}
                    >
                      <option value="">请选择重点区域</option>
                      {KEY_AREAS.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                    {errors.keyArea && (
                      <p className="mt-1 text-sm text-red-400">{errors.keyArea}</p>
                    )}
                  </div>
                  
                  {/* 主要道路 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      主要道路
                    </label>
                    <select
                      name="mainRoad"
                      value={formData.mainRoad}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${errors.mainRoad ? 'border-red-500' : 'border-[#1e4976]'}`}
                    >
                      <option value="">请选择主要道路</option>
                      {MAIN_ROADS.map(road => (
                        <option key={road.id} value={road.id}>{road.name}</option>
                      ))}
                    </select>
                    {errors.mainRoad && (
                      <p className="mt-1 text-sm text-red-400">{errors.mainRoad}</p>
                    )}
                  </div>
                  
                  {/* 详细地址 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      详细地址
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="请输入详细地址（可选）"
                      className="w-full px-4 py-2 border border-[#1e4976] rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>
                  
                  {/* 开始日期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      开始日期 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] ${errors.startDate ? 'border-red-500' : 'border-[#1e4976]'}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
                    )}
                  </div>
                  
                  {/* 结束日期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      结束日期
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#1e4976] rounded-lg bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>
                </div>
              </div>
              
              {/* 附件上传 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-[#00e5ff] rounded-full mr-3"></div>
                  附件上传
                </h2>
                
                {/* 附件预览 */}
                {uploadedAttachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {uploadedAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#1e4976]/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#00e5ff]/20 rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-[#00e5ff]" />
                          </div>
                          <div>
                            <p className="text-xs text-white truncate max-w-xs">{attachment.name}</p>
                            <p className="text-xs text-gray-400">{attachment.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeAttachment(index)}
                          className="p-1 rounded-full hover:bg-[#ef4444]/30 transition-colors"
                        >
                          <X size={16} className="text-gray-400 hover:text-[#ef4444]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 附件上传按钮 */}
                <label 
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-[#1e4976] rounded-md cursor-pointer bg-[#1e4976]/80 hover:bg-[#1e4976] transition-all duration-300"
                >
                  <input 
                    type="file" 
                    accept="*"
                    multiple 
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                  <FileText size={32} className="text-[#00e5ff]" />
                  <span className="mt-2 text-xs text-gray-300">上传附件</span>
                  <span className="mt-1 text-xs text-gray-400">支持视频、文档等</span>
                </label>
              </div>
          
          {/* 底部提示 */}
          <div className="bg-[#1e4976]/50 border border-[#1e4976] rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-[#00e5ff]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-300">
                  <strong className="text-[#00e5ff]">提示：</strong>请确保填写完整的任务信息。任务创建后，相关人员将收到通知。
                </p>
              </div>
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-6 py-2.5 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isSubmitting ? 'bg-[#00e5ff]/70 cursor-not-allowed' : 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-[#0e2a47] border-t-transparent rounded-full"></div>
                  创建中...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={16} className="mr-2" />
                  创建日常检查任务
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
      
      {/* 人员选择弹窗 */}
      {showPersonnelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[#1e4976]">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">选择执行人员</h3>
                <p className="text-sm text-gray-300 mt-1">支持按部门或职能分类筛选后多选人员</p>
              </div>
              <button
                onClick={closePersonnelModal}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            
            {/* 筛选方式切换 */}
            <div className="px-6 pt-4 pb-2 border-b border-[#1e4976]">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setPersonnelFilterType('department');
                    setSelectedFunctionCategories([]);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${personnelFilterType === 'department' ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] shadow-md' : 'bg-[#1e4976] text-gray-300 hover:bg-[#2d5a8a]'}`}
                >
                  <Users size={18} className="inline mr-2" />
                  按部门筛选
                </button>
                <button
                  onClick={() => {
                    setPersonnelFilterType('function');
                    setSelectedDepartments([]);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${personnelFilterType === 'function' ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] shadow-md' : 'bg-[#1e4976] text-gray-300 hover:bg-[#2d5a8a]'}`}
                >
                  <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  按职能分类筛选
                </button>
              </div>
            </div>
            
            {/* 筛选条件区域 */}
            <div className="px-6 py-4 bg-[#0a1628] border-b border-[#1e4976]">
              {personnelFilterType === 'department' ? (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-3">选择部门：</p>
                  {allDepartments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">暂无部门数据</p>
                      <p className="text-sm text-gray-400">请先前往"人员管理"页面添加人员</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allDepartments.map(dept => {
                        const isSelected = selectedDepartments.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => toggleDepartment(dept)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${isSelected ? 'border-[#00e5ff] bg-[#1e4976] text-white' : 'border-[#1e4976] bg-[#0a1628] text-gray-300 hover:border-[#00e5ff]'}`}
                          >
                            {dept}
                            {isSelected && (
                              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-[#00e5ff] text-[#0e2a47] rounded-full text-xs">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {allDepartments.length > 0 && selectedDepartments.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">请选择至少一个部门来筛选人员</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">选择职能分类：</p>
                    {formData.taskType && selectedFunctionCategories.includes(Number(formData.taskType)) && (
                      <span className="text-xs px-2 py-1 bg-[#00ffb2]/20 text-[#00ffb2] rounded-full">
                        ✓ 已自动匹配任务类型
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {TASK_TYPES.map(type => {
                      const isSelected = selectedFunctionCategories.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => togglePersonnelFunctionCategory(type.id)}
                          className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${isSelected ? 'border-[#00e5ff] bg-[#1e4976] text-white' : 'border-[#1e4976] bg-[#0a1628] text-gray-300 hover:border-[#00e5ff]'}`}
                        >
                          <div
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                          {isSelected && (
                            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-[#00e5ff] text-[#0e2a47] rounded-full text-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedFunctionCategories.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">请选择至少一个职能分类来筛选人员</p>
                  )}
                </div>
              )}
            </div>
            
            {/* 人员列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-300">
                  可选人员（{availablePersonnel.length} 人）
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllPersonnel}
                    className="px-3 py-1.5 text-sm bg-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors"
                  >
                    全选
                  </button>
                  <button
                    onClick={deselectAllPersonnel}
                    className="px-3 py-1.5 text-sm bg-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors"
                  >
                    取消全选
                  </button>
                </div>
              </div>
              
              {availablePersonnel.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-500">
                    {personnelFilterType === 'department' && selectedDepartments.length === 0
                      ? '请先选择部门'
                      : personnelFilterType === 'function' && selectedFunctionCategories.length === 0
                      ? '请先选择职能分类'
                      : '暂无符合条件的人员'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePersonnel.map(person => {
                    const isSelected = formData.assignees.includes(person.id);
                    return (
                      <div
                        key={person.id}
                        onClick={() => togglePersonnel(person.id)}
                        className={`p-4 rounded-lg border-2 bg-[#0a1628] cursor-pointer transition-all ${isSelected ? 'border-[#00e5ff] bg-[#1e4976]/50' : 'border-[#1e4976] hover:border-[#00e5ff] hover:shadow-sm hover:shadow-[#00e5ff]/10'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2]' : 'bg-[#1e4976]'}`}>
                              <User size={20} className={isSelected ? 'text-[#0e2a47]' : 'text-white'} />
                            </div>
                            <div>
                              <p className={`font-medium ${isSelected ? 'text-[#00e5ff]' : 'text-white'}`}>
                                {person.name}
                              </p>
                              <p className="text-sm text-gray-400">{person.position}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-[#0e2a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs px-2 py-1 bg-[#1e4976] text-gray-300 rounded">
                            {person.department}
                          </span>
                          {person.functionType && person.functionType.map((ft, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-[#0a1628] text-[#00e5ff] rounded border border-[#1e4976]"
                            >
                              {ft}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* 弹窗底部 */}
            <div className="px-6 py-4 border-t border-[#1e4976] bg-[#0a1628]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  已选择 <span className="font-semibold text-[#00e5ff]">{formData.assignees.length}</span> 位人员
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closePersonnelModal}
                    className="px-6 py-2.5 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={closePersonnelModal}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30 rounded-lg font-medium transition-colors"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskListPage;