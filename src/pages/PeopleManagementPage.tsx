import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit, Trash2, X, Save, User, Users, Building, Filter, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// 定义人员接口
export interface Person {
  id: string;
  name: string;
  department: string;
  position: string;
  phone: string;
  email: string;
  isActive: boolean;
  personType: string; // 人员类型：任务跟踪人员、管理人员
  functionType?: string[]; // 职能分类 - 改为数组以支持多选
}

// 定义部门接口
export interface Department {
  id: string;
  name: string;
}

const PeopleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // 职能分类枚举值
  const functionTypes = [
    '广告牌', '违挡', '沿街店铺', '城市绿化', '墙体倒塌', 
    '修路开挖', '流动摊贩', '地铁口管理', '人行道违停', 
    '出店经营', '工地', '市政设施安全巡查'
  ];

  // 表单数据
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    department: '',
    position: '',
    personType: '任务跟踪人员', // 默认人员类型
    phone: '',
    email: '',
    isActive: true,
    functionType: []
  });

  // 从localStorage加载数据
  useEffect(() => {
    const savedPeople = localStorage.getItem('people');
    const savedDepartments = localStorage.getItem('departments');
    
    if (savedPeople) {
      setPeople(JSON.parse(savedPeople));
    } else {
      // 初始化模拟数据
      const initialPeople: Person[] = [
        {
          id: '1',
          name: '张三',
          department: '城管团队',
          position: '队员',
          personType: '任务跟踪人员',
          phone: '13800138001',
          email: 'zhangsan@example.com',
          isActive: true,
          functionType: ['广告牌', '工地']
        },
        {
          id: '2',
          name: '李四',
          department: '城管团队',
          position: '队长',
          personType: '管理人员',
          phone: '13800138002',
          email: 'lisi@example.com',
          isActive: true,
          functionType: ['流动摊贩', '出店经营']
        },
        {
          id: '3',
          name: '王五',
          department: '序化管理团队',
          position: '队员',
          personType: '任务跟踪人员',
          phone: '13800138003',
          email: 'wangwu@example.com',
          isActive: true,
          functionType: ['城市绿化', '市政设施安全巡查']
        },
        {
          id: '4',
          name: '赵六',
          department: '序化管理团队',
          position: '队长',
          personType: '管理人员',
          phone: '13800138004',
          email: 'zhaoliu@example.com',
          isActive: true,
          functionType: ['人行道违停', '地铁口管理']
        }
      ];
      setPeople(initialPeople);
      localStorage.setItem('people', JSON.stringify(initialPeople));
    }
    
    if (savedDepartments) {
      setDepartments(JSON.parse(savedDepartments));
    } else {
      // 初始化部门数据
      const initialDepartments: Department[] = [
        { id: '1', name: '城管团队' },
        { id: '2', name: '序化管理团队' }
      ];
      setDepartments(initialDepartments);
      localStorage.setItem('departments', JSON.stringify(initialDepartments));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    if (people.length > 0) {
      localStorage.setItem('people', JSON.stringify(people));
    }
  }, [people]);

  useEffect(() => {
    if (departments.length > 0) {
      localStorage.setItem('departments', JSON.stringify(departments));
    }
  }, [departments]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 打开添加人员弹窗
  const openAddModal = () => {
    setFormData({
      name: '',
      department: '',
      position: '',
      personType: '任务跟踪人员',
      phone: '',
      email: '',
      isActive: true,
      functionType: []
    });
    setShowAddModal(true);
  };

  // 打开编辑人员弹窗
  const openEditModal = (person: Person) => {
    setSelectedPerson(person);
    setFormData(person);
    setShowEditModal(true);
  };

  // 添加人员
  const handleAddPerson = () => {
    if (!formData.name || !formData.department || !formData.position || !formData.personType) {
      toast.error('请填写必要信息');
      return;
    }

     const newPerson: Person = {
      id: Date.now().toString(),
      name: formData.name,
      department: formData.department,
      position: formData.position,
      personType: formData.personType || '任务跟踪人员',
      phone: formData.phone || '',
      email: formData.email || '',
      isActive: formData.isActive || true,
      functionType: formData.functionType || []
    };

    setPeople(prev => [...prev, newPerson]);
    setShowAddModal(false);
    toast.success('人员添加成功');
  };

  // 更新人员
  const handleUpdatePerson = () => {
    if (!selectedPerson || !formData.name || !formData.department || !formData.position || !formData.personType) {
      toast.error('请填写必要信息');
      return;
    }

     setPeople(prev => prev.map(person => 
      person.id === selectedPerson.id 
        ? {
            ...person,
            name: formData.name,
            department: formData.department,
            position: formData.position,
            personType: formData.personType || '任务跟踪人员',
            phone: formData.phone || '',
            email: formData.email || '',
            isActive: formData.isActive || true,
            functionType: formData.functionType || []
          }
        : person
    ));

    setShowEditModal(false);
    setSelectedPerson(null);
    toast.success('人员信息更新成功');
  };

  // 删除人员
  const handleDeletePerson = (personId: string) => {
    if (window.confirm('确定要删除这个人员吗？')) {
      setPeople(prev => prev.filter(person => person.id !== personId));
      toast.success('人员删除成功');
    }
  };

  // 筛选人员
  const filteredPeople = people.filter(person => {
     const matchesSearch = !searchText || 
      person.name.includes(searchText) || 
      person.phone.includes(searchText) ||
      person.email.includes(searchText) ||
      (person.functionType && person.functionType.some(type => type.includes(searchText)));
    
    const matchesDepartment = departmentFilter === 'all' || person.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] min-h-screen text-white overflow-x-hidden">
      {/* 顶部导航栏 */}
      <header 
        className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0a1f3a] via-[#0e2a47] to-[#0a1f3a] border-b border-[#1e4976]"
      >
        <button onClick={handleBack} className="p-2 rounded-full bg-[#1e4976]/80 hover:bg-[#00e5ff] text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">人员管理</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-[#1e4976]/80 hover:bg-[#00e5ff] text-white transition-colors">
            <Filter size={20} />
          </button>
          <button className="p-2 rounded-full bg-[#1e4976]/80 hover:bg-[#00e5ff] text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* 筛选和搜索区域 */}
      <div className="p-6 bg-[#0e2a47] mb-6 rounded-xl border border-[#1e4976]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索人员姓名、电话或邮箱..."
              className="w-full pl-10 pr-4 py-3 bg-[#081c2f] border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white placeholder-gray-400"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-[#081c2f] border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white appearance-none"
          >
            <option value="all">全部部门</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 人员列表 */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#00e5ff]">人员列表</h2>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/20 transition-all"
          >
            <Plus size={16} className="mr-2" />
            添加人员
          </button>
        </div>
        
        {filteredPeople.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map(person => (
              <div 
                key={person.id} 
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-5 rounded-xl border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden"
              >
                {/* 背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                
                {/* 左侧装饰线 */}
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mr-4 border border-blue-500/30">
                        <User size={24} className="text-[#00e5ff]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#00e5ff] transition-colors">{person.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{person.position} | {person.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {person.isActive ? (
                        <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-medium border border-green-500/30">
                          在职
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-900/30 text-gray-400 text-xs font-medium border border-gray-500/30">
                          离职
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{person.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{person.email}</span>
                    </div>
                     <div className="flex items-center text-sm text-gray-400">
                        <Building size={18} className="mr-3 text-[#00ffb2]" />
                        <span>{person.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <Users size={18} className="mr-3 text-[#00ffb2]" />
                        <span>{person.position}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#00ffb2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>{person.personType}</span>
                    </div>
                    {person.functionType && person.functionType.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-sm text-gray-400 mr-2">职能分类:</span>
                        {person.functionType.map((type, index) => (
                          <span key={index} className="bg-blue-900/30 text-[#00e5ff] px-3 py-1 rounded-full text-xs border border-blue-500/30">{type}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex space-x-2 mt-5 pt-4 border-t border-[#1e4976]">
                    <button
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-[#1e4976] to-[#0e2a47] text-white text-sm font-medium rounded-lg hover:bg-gradient-to-r from-[#00e5ff] to-[#00d4e5] hover:text-[#0e2a47] transition-all"
                      onClick={() => openEditModal(person)}
                    >
                      <Edit size={14} className="inline mr-1" />
                      编辑
                    </button>
                    <button
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-[#1e4976] to-[#0e2a47] text-white text-sm font-medium rounded-lg hover:bg-gradient-to-r from-[#ff5e5e] to-[#ff3b30] hover:text-white transition-all"
                      onClick={() => handleDeletePerson(person.id)}
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <User size={48} className="mb-4 opacity-50" />
            <p className="text-lg">暂无符合条件的人员</p>
          </div>
        )}
      </div>

      {/* 添加人员弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">添加人员</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-[#00e5ff] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="请输入人员姓名"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">所属部门 <span className="text-red-500">*</span></label>
                <select
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                >
                  <option value="">请选择部门</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">职位 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleInputChange}
                  placeholder="请输入职位"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">人员类型 <span className="text-red-500">*</span></label>
                <select
                  name="personType"
                  value={formData.personType || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                >
                  <option value="">请选择人员类型</option>
                  <option value="任务跟踪人员">任务跟踪人员</option>
                  <option value="管理人员">管理人员</option>
                </select>
              </div>
               
               <div>
                 <label className="block text-sm text-gray-300 mb-1">联系电话</label>
                 <input
                   type="tel"
                   name="phone"
                   value={formData.phone || ''}
                   onChange={handleInputChange}
                   placeholder="请输入联系电话"
                   className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                 />
               </div>
               
               <div>
                 <label className="block text-sm text-gray-300 mb-1">电子邮箱</label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email || ''}
                   onChange={handleInputChange}
                   placeholder="请输入电子邮箱"
                   className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                 />
               </div>
               
               <div>
                 <label className="block text-sm text-gray-300 mb-1">职能分类 (可多选)</label>
                 <div className="flex flex-wrap gap-2 mt-2">
                   {functionTypes.map(type => {
                     const isSelected = formData.functionType && formData.functionType.includes(type);
                     return (
                       <label key={type} className="flex items-center">
                         <input
                           type="checkbox"
                           value={type}
                           checked={isSelected}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setFormData(prev => ({
                                 ...prev,
                                 functionType: prev.functionType ? [...prev.functionType, type] : [type]
                               }));
                             } else {
                               setFormData(prev => ({
                                 ...prev,
                                 functionType: prev.functionType?.filter(t => t !== type)
                               }));
                             }
                           }}
                           className="h-4 w-4 text-[#00e5ff] border-[#1e4976] rounded focus:ring-[#00e5ff] focus:ring-offset-2 focus:ring-offset-[#0e2a47]"
                         />
                         <span className="ml-1 text-sm text-gray-300">{type}</span>
                       </label>
                     );
                   })}
                 </div>
               </div>
               
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00e5ff] border-[#1e4976] rounded focus:ring-[#00e5ff] focus:ring-offset-2 focus:ring-offset-[#0e2a47]"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                  在职状态
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-[#1e4976] to-[#0e2a47] text-gray-300 font-medium rounded-md hover:bg-gradient-to-r from-[#2d5a8a] to-[#1a365d] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleAddPerson}
                className="flex-1 py-3 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium rounded-md hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑人员弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">编辑人员</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-[#00e5ff] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="请输入人员姓名"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">所属部门 <span className="text-red-500">*</span></label>
                <select
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                >
                  <option value="">请选择部门</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">职位 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleInputChange}
                  placeholder="请输入职位"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">人员类型 <span className="text-red-500">*</span></label>
                <select
                  name="personType"
                  value={formData.personType || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                >
                  <option value="">请选择人员类型</option>
                  <option value="任务跟踪人员">任务跟踪人员</option>
                  <option value="管理人员">管理人员</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">联系电话</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="请输入联系电话"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">电子邮箱</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="请输入电子邮箱"
                  className="w-full px-3 py-2 bg-[#081c2f] text-white border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">职能分类 (可多选)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {functionTypes.map(type => {
                    const isSelected = formData.functionType && formData.functionType.includes(type);
                    return (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                functionType: prev.functionType ? [...prev.functionType, type] : [type]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                functionType: prev.functionType?.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="h-4 w-4 text-[#00e5ff] border-[#1e4976] rounded focus:ring-[#00e5ff] focus:ring-offset-2 focus:ring-offset-[#0e2a47]"
                        />
                        <span className="ml-1 text-sm text-gray-300">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00e5ff] border-[#1e4976] rounded focus:ring-[#00e5ff] focus:ring-offset-2 focus:ring-offset-[#0e2a47]"
                />
                <label htmlFor="isActiveEdit" className="ml-2 block text-sm text-gray-300">
                  在职状态
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-[#1e4976] to-[#0e2a47] text-gray-300 font-medium rounded-md hover:bg-gradient-to-r from-[#2d5a8a] to-[#1a365d] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleUpdatePerson}
                className="flex-1 py-3 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium rounded-md hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManagementPage;