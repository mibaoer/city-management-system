import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Users, User, ChevronDown } from 'lucide-react';
import { usePeople } from '@/hooks/usePeople';

// 任务类型（使用职能分类）
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

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { getAllPeople, getDepartments } = usePeople();
  
  // 获取所有人员和部门
  const allPeople = getAllPeople();
  const allDepartments = getDepartments();
  
  // 表单状态
  const [formData, setFormData] = useState({
    taskName: '',
    taskType: '',
    description: '',
    team: '',
    assignees: [] as string[], // 改为数组支持多选

    address: '',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 人员选择相关状态
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [personnelFilterType, setPersonnelFilterType] = useState<'department' | 'function'>('department');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedFunctionCategories, setSelectedFunctionCategories] = useState<number[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<typeof allPeople>([]);

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
      
      // 如果只有一个人员被选择，自动填充执行团队
      if (newAssignees.length === 1) {
        const person = allPeople.find(p => p.id === newAssignees[0]);
        if (person) {
          // 根据人员的department或functionType推断执行团队
          const team = person.department.includes('城市') || person.department.includes('市政') ? 'urban' : 'sequence';
          
          return {
            ...prev,
            assignees: newAssignees,
            team
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
    // 如果选择了多个人员，使用第一个人员的信息填充执行团队
    if (formData.assignees.length > 0) {
      const firstPerson = allPeople.find(p => p.id === formData.assignees[0]);
      if (firstPerson) {
        // 根据人员的department或functionType推断执行团队
        const team = firstPerson.department.includes('城市') || firstPerson.department.includes('市政') ? 'urban' : 'sequence';
        
        setFormData(prev => ({
          ...prev,
          team
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
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功后返回任务列表页面
      alert('任务创建成功！');
      navigate('/task-list');
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      taskName: '',
      taskType: '',
      description: '',
      team: '',
      assignees: [],

      address: '',
      startDate: '',
      endDate: '',
    });
    setSelectedDepartments([]);
    setSelectedFunctionCategories([]);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">创建日常检查任务</h1>
                <p className="text-sm text-gray-500 mt-1">填写日常检查任务信息并关联职能分类</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={16} className="mr-2" />
                重置
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? '创建中...' : '创建日常检查任务'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              基本信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 任务名称 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleChange}
                  placeholder="请输入任务名称"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taskName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.taskName && (
                  <p className="mt-1 text-sm text-red-500">{errors.taskName}</p>
                )}
              </div>

              {/* 任务类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务类型 <span className="text-red-500">*</span>
                </label>
                <select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taskType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">请选择任务类型</option>
                  {TASK_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.taskType && (
                  <p className="mt-1 text-sm text-red-500">{errors.taskType}</p>
                )}
              </div>

              {/* 执行人员 - 多选 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  执行人员 <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={openPersonnelModal}
                  className={`w-full min-h-[42px] px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                    errors.assignees ? 'border-red-500' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {formData.assignees.length === 0 ? (
                    <span className="text-gray-400">点击选择执行人员（支持按部门或职能分类筛选）</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.assignees.map(id => {
                        const person = allPeople.find(p => p.id === id);
                        if (!person) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            <User size={14} className="mr-1" />
                            {person.name}
                            <span className="ml-1 text-blue-500">({person.department})</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePersonnel(id);
                              }}
                              className="ml-2 hover:text-blue-900"
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
                  <p className="mt-1 text-sm text-red-500">{errors.assignees}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  已选择 {formData.assignees.length} 位人员
                </p>
              </div>

              {/* 执行团队 - 根据选择的执行人员自动填充 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  执行团队 <span className="text-red-500">*</span>
                </label>
                <div className="w-full px-4 py-3 border rounded-lg bg-blue-50 text-blue-700 border-blue-200">
                  {formData.team ? TEAMS.find(team => team.id === formData.team)?.name : '请先选择执行人员'}
                </div>
                {errors.team && (
                  <p className="mt-1 text-sm text-red-500">{errors.team}</p>
                )}
              </div>



              {/* 详细地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细地址
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="请输入详细地址（可选）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 开始日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* 结束日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 任务描述 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="请详细描述任务内容、要求和注意事项..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>提示：</strong>请确保填写完整的任务信息。任务创建后，相关人员将收到通知。
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* 人员选择弹窗 */}
      {showPersonnelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">选择执行人员</h3>
                <p className="text-sm text-gray-500 mt-1">支持按部门或职能分类筛选后多选人员</p>
              </div>
              <button
                onClick={closePersonnelModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* 筛选方式切换 */}
            <div className="px-6 pt-4 pb-2 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setPersonnelFilterType('department');
                    setSelectedFunctionCategories([]);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    personnelFilterType === 'department'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users size={18} className="inline mr-2" />
                  按部门筛选
                </button>
                <button
                  onClick={() => {
                    setPersonnelFilterType('function');
                    setSelectedDepartments([]);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    personnelFilterType === 'function'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  按职能分类筛选
                </button>
              </div>
            </div>

            {/* 筛选条件区域 */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              {personnelFilterType === 'department' ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">选择部门：</p>
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
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            {dept}
                            {isSelected && (
                              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs">
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
                    <p className="text-sm font-medium text-gray-700">选择职能分类：</p>
                    {formData.taskType && selectedFunctionCategories.includes(Number(formData.taskType)) && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
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
                          className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <div
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                          {isSelected && (
                            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-xs">
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
                <p className="text-sm font-medium text-gray-700">
                  可选人员（{availablePersonnel.length} 人）
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllPersonnel}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    全选
                  </button>
                  <button
                    onClick={deselectAllPersonnel}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消全选
                  </button>
                </div>
              </div>

              {availablePersonnel.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
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
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              <User size={20} className={isSelected ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div>
                              <p className={`font-medium ${
                                isSelected ? 'text-blue-700' : 'text-gray-800'
                              }`}>
                                {person.name}
                              </p>
                              <p className="text-sm text-gray-500">{person.position}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {person.department}
                          </span>
                          {person.functionType && person.functionType.map((ft, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
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
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  已选择 <span className="font-semibold text-blue-600">{formData.assignees.length}</span> 位人员
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closePersonnelModal}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={closePersonnelModal}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
}
