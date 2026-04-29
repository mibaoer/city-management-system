import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MoreHorizontal, CheckCircle, AlertCircle, Clock, MapPin, ChevronDown, ChevronRight, Users, Camera, Image, X } from 'lucide-react';

import { toast } from 'sonner';
import { usePeople } from '@/hooks/usePeople';
import { Person } from './PeopleManagementPage';

// 定义举报类型
interface ReportType {
  id: string;
  name: string;
}

// 定义举报状态类型
type ReportStatus = 'pending' | 'processing' | 'completed' | 'rejected';

// 定义举报数据接口
interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: ReportStatus;
  reportTime: string;
  reporter: string;
  processPerson?: string;
  processTime?: string;
  completionTime?: string;
  userImages?: string[];    // 用户上传的原始图片
  beforeImages?: string[];  // 处理前图片(管理员)
}

const ReportManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('reportTime');
  
  // 处理弹窗相关状态
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [processNotes, setProcessNotes] = useState('');
  const [selectedProcessPerson, setSelectedProcessPerson] = useState<string>('');
  
  // 使用人员管理Hook
  const { getPeopleByDepartment, getDepartments } = usePeople();
  
  // 当前用户信息 - 模拟数据，实际应该从登录状态或API获取
  const [currentUser] = useState<Person>({
    id: '2',
    name: '李四',
    department: '城管团队',
    position: '队长',
    personType: '管理人员',
    phone: '13800138002',
    email: 'lisi@example.com',
    isActive: true,
    functionType: ['流动摊贩', '出店经营']
  });
  
  // 获取所有人员
  const allActivePeople = usePeople().getAllPeople().filter(person => person.isActive);
  
  // 根据页面和人员类型筛选可选择的处理人员
  const getAvailableProcessPeople = () => {
    // 模拟当前页面类型，实际应该从路由或上下文获取
    const currentPageType = 'reportManagement'; // reportManagement(随手拍), rectification(整改), acceptance(验收)
    
    if (currentPageType === 'reportManagement') {
      // 随手拍页面：只能选择管理人员
      return allActivePeople.filter(person => person.personType === '管理人员');
    } else if (currentPageType === 'rectification') {
      // 事件整改页面：只能选择任务跟踪人员
      return allActivePeople.filter(person => person.personType === '任务跟踪人员');
    } else if (currentPageType === 'acceptance') {
      // 事件验收页面：可以选择所有管理人员（包括提出事件的人员）
      return allActivePeople.filter(person => person.personType === '管理人员');
    }
    
    return allActivePeople; // 默认返回所有人员
  };
  
  const availableProcessPeople = getAvailableProcessPeople();

  // 举报类型数据
  const reportTypes: ReportType[] = [
    { id: '1', name: '垃圾问题' },
    { id: '2', name: '环境卫生' },
    { id: '3', name: '公共设施' },
    { id: '4', name: '交通问题' },
    { id: '5', name: '噪音污染' },
    { id: '6', name: '其他问题' }
  ];

// 模拟举报数据
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: '小区垃圾堆积',
      description: '东区3号楼前的垃圾桶已经满溢，散发异味，影响居民生活',
      location: '东区3号楼前',
      type: '垃圾问题',
      status: 'pending',
      reportTime: '2025-10-21 09:30',
      reporter: '张先生',
      userImages: [
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Overflowing%20garbage%20bins%20in%20residential%20area&sign=5289b7f4bdd47a7b8fabe9f5faa84397",
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Trash%20scattered%20around%20garbage%20bin%20area&sign=644a6b902383a00d0c50b9c69b85b0ca"
      ]
    },
    {
      id: '2',
      title: '路灯不亮',
      description: '西湖大道与文三路交叉口的路灯不亮，存在安全隐患',
      location: '西湖大道与文三路交叉口',
      type: '公共设施',
      status: 'processing',
      reportTime: '2025-10-21 08:15',
      reporter: '李女士',
      processPerson: allActivePeople.length > 0 ? allActivePeople[0].name : '王师傅',
      userImages: [
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Street%20light%20not%20working%20at%20night&sign=d3716bb2f9a6539c8b86872237052aad"
      ]
    },
    {
      id: '3',
      title: '道路坑洼',
      description: '德胜快速路有多处坑洼，影响车辆通行',
      location: '德胜快速路',
      type: '交通问题',
      status: 'completed',
      reportTime: '2025-10-20 16:45',
      reporter: '赵先生',
      processPerson: allActivePeople.length > 1 ? allActivePeople[1].name : '刘师傅',
      processTime: '2025-10-20 17:30',
      completionTime: '2025-10-21 10:00',
      userImages: [
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Potholes%20on%20road%20surface&sign=26d32c8cf482030ed3010e7f14c72a98"
      ]
    },
    {
      id: '4',
      title: '工地噪音',
      description: '钱江新城某工地夜间施工，噪音严重影响周边居民休息',
      location: '钱江新城某工地',
      type: '噪音污染',
      status: 'rejected',
      reportTime: '2025-10-20 22:10',
      reporter: '陈女士',
      processPerson: allActivePeople.length > 2 ? allActivePeople[2].name : '张队长',
      processTime: '2025-10-21 08:00',
      userImages: [
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Construction%20site%20at%20night&sign=c492bef4a9c9ec90214f28ed86939067"
      ]
    },
    {
      id: '5',
      title: '公园环境卫生差',
      description: '西湖公园内有大量垃圾未及时清理，影响景区形象',
      location: '西湖公园',
      type: '环境卫生',
      status: 'pending',
      reportTime: '2025-10-21 11:30',
      reporter: '杨先生',
      userImages: [
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Trash%20in%20park%20area&sign=6b92c9dcc1ece5a20cbd1189e1e30f53",
        "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Dirty%20park%20environment%20littered%20with%20trash&sign=ce2cbab1ac8c4959e3708e6056ab2683"
      ]
    }
  ]);

  // 统计数据
  const getStatistics = () => {
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const processingReports = reports.filter(r => r.status === 'processing').length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const rejectedReports = reports.filter(r => r.status === 'rejected').length;
    
    return {
      totalReports,
      pendingReports,
      processingReports,
      completedReports,
      rejectedReports
    };
  };

  // 处理筛选和搜索
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchText || 
      report.title.includes(searchText) || 
      report.description.includes(searchText) || 
      report.location.includes(searchText);
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'reportTime') {
      return new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
    }
    return 0;
  });

  // 获取状态显示文本
  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'rejected': return '已驳回';
      default: return '未知状态';
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };

  // 打开开始处理弹窗
  const openProcessModal = (reportId: string) => {
    setSelectedReportId(reportId);
    setProcessNotes('');
    setSelectedProcessPerson('');
    setShowProcessModal(true);
  };

  // 关闭开始处理弹窗
  const closeProcessModal = () => {
    setShowProcessModal(false);
    setSelectedReportId(null);
  };

  // 处理开始处理按钮点击
  const handleStartProcess = (reportId: string) => {
    // 重置选择的处理人
    setSelectedProcessPerson('');
    
    // 根据页面类型和用户类型设置默认处理人
    const currentPageType = 'reportManagement'; // 模拟当前页面类型
    
    if (currentPageType === 'reportManagement' && currentUser.personType === '管理人员') {
      // 随手拍页面：管理人员可以选择其他管理人员
      // 默认不选择，让管理员自行选择
    } else if (currentPageType === 'rectification' && currentUser.personType === '任务跟踪人员') {
      // 事件整改页面：任务跟踪人员默认选择自己
      setSelectedProcessPerson(currentUser.name);
    }
    
    openProcessModal(reportId);
  };

  // 确认开始处理
  const confirmStartProcess = () => {
    if (!selectedReportId || !selectedProcessPerson) {
      toast.error('请选择处理人员');
      return;
    }
    
    setReports(prev => prev.map(report => 
      report.id === selectedReportId 
        ? { 
            ...report, 
            status: 'processing', 
            processPerson: selectedProcessPerson, 
            processTime: new Date().toLocaleString('zh-CN'),
            // 使用用户原始图片作为处理前图片
            beforeImages: report.userImages || []
          }
        : report
    ));
    
    toast.success('开始处理该举报');
    closeProcessModal();
  };

  // 处理完成处理按钮点击
  const handleCompleteProcess = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'completed', 
            completionTime: new Date().toLocaleString('zh-CN'),
            processPerson: report.processPerson || currentUser.name // 确保有处理人信息
          } 
        : report
    ));
    toast.success('处理完成');
  };

  // 处理驳回按钮点击
  const handleRejectProcess = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: 'rejected', processPerson: currentUser.name, processTime: new Date().toLocaleString('zh-CN') } 
        : report
    ));
    toast.success('已驳回该举报');
  };



  const statistics = getStatistics();

  // 获取当前选中的举报
  const getSelectedReport = () => {
    return reports.find(report => report.id === selectedReportId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:bg-[#00e5ff] text-white transition-colors mr-4 shadow-lg"
            aria-label="返回"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">举报与事件处理</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:bg-[#00e5ff] text-white transition-colors shadow-lg">
            <Filter size={20} />
          </button>
          <button className="p-2 rounded-full bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:bg-[#00e5ff] text-white transition-colors shadow-lg">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-300">总举报数</h3>
              <p className="text-3xl font-bold text-white mt-2">{statistics.totalReports}</p>
            </div>
            <div className="w-10 h-10 bg-[#00e5ff]/20 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-[#00e5ff]" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-300">待处理</h3>
              <p className="text-3xl font-bold text-white mt-2">{statistics.pendingReports}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-300">处理中</h3>
              <p className="text-3xl font-bold text-white mt-2">{statistics.processingReports}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-300">已完成</h3>
              <p className="text-3xl font-bold text-white mt-2">{statistics.completedReports}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>
      


      {/* 筛选和搜索区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-6 rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索举报标题、描述或位置..."
              className="w-full pl-10 pr-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="rejected">已驳回</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            >
              <option value="all">全部类型</option>
              {reportTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 举报列表 */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
          <h2 className="text-lg font-semibold text-white">举报列表</h2>
        </div>
        
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div 
              key={report.id} 
              className="mx-4 my-2 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg shadow-xl shadow-[#00e5ff]/10 overflow-hidden border border-[#1e4976] hover:bg-[#1e4976]/50 transition-colors"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-medium text-white">{report.title}</h3>
                    <p className="text-sm text-gray-400">{report.type} | {report.location}</p>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${report.status === 'pending' ? 'bg-yellow-100/20 text-yellow-300' : report.status === 'processing' ? 'bg-blue-100/20 text-blue-300' : report.status === 'completed' ? 'bg-green-100/20 text-green-300' : 'bg-red-100/20 text-red-300'}`}
                  >
                    {getStatusText(report.status)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-300 mb-1">举报描述:</p>
                  <p className="text-sm text-white bg-[#1e4976]/50 p-2 rounded-md">{report.description}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <Clock size={14} className="mr-1" />
                  <span>举报时间: {report.reportTime}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <MapPin size={14} className="mr-1" />
                  <span>举报位置: {report.location}</span>
                </div>
                
                {report.processPerson && (
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Users size={14} className="mr-1" />
                    <span>处理人: {report.processPerson}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {/* 仅管理人员和任务跟踪人员可以看到处理按钮 */}
                  {(currentUser.personType === '管理人员' || currentUser.personType === '任务跟踪人员') && (
                    <>
                      {report.status === 'pending' && (
                        <>
                          <button
                            className="flex-1 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all"
                            onClick={() => handleStartProcess(report.id)}
                          >
                            开始处理
                          </button>
                          {currentUser.personType === '管理人员' && (
                            <button
                              className="flex-1 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-md hover:bg-[#2d5a8a] transition-colors font-medium"
                              onClick={() => handleRejectProcess(report.id)}
                            >
                              驳回
                            </button>
                          )}
                        </>
                      )}
                      
                      {report.status === 'processing' && (
                        <button
                          className="w-full py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] font-medium rounded-md hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-all"
                          onClick={() => handleCompleteProcess(report.id)}
                        >
                          完成处理
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <p>暂无符合条件的举报</p>
          </div>
        )}
      </div>

      {/* 开始处理弹窗 */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-[#1e4976]">
             <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
               <h3 className="text-lg font-medium bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">开始处理 - {getSelectedReport()?.title || '未知举报'}</h3>
               <button onClick={closeProcessModal} className="p-1 text-gray-300 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 处理前图片 */}
              <div>
                <h4 className="text-base font-medium text-white mb-2">处理前图片</h4>
                <div className="space-y-3">
                  {getSelectedReport() && getSelectedReport()?.userImages && getSelectedReport()?.userImages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getSelectedReport()?.userImages.map((imageUrl, index) => (
                        <div key={index} className="relative w-24 h-24">
                          <img
                            src={imageUrl}
                            alt={`用户上传图片 ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-[#0e2a47]/80 text-white text-xs p-1 text-center">
                            原图 {index + 1}/{getSelectedReport()?.userImages?.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 bg-[#1e4976]/50 rounded-md text-center text-gray-400 border border-[#1e4976]">
                      <p>暂无用户上传图片</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 处理人员选择 */}
              <div>
                <h4 className="text-base font-medium text-white mb-2">处理人员 <span className="text-red-400">*</span></h4>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedProcessPerson}
                      onChange={(e) => setSelectedProcessPerson(e.target.value)}
                      className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-transparent appearance-none pr-10"
                    >
                      <option value="">请选择处理人员</option>
                      {availableProcessPeople.length > 0 ? (
                        availableProcessPeople.map(person => (
                          <option key={person.id} value={person.name}>
                            {person.name} ({person.department} - {person.personType})
                          </option>
                        ))
                      ) : (
                        <option value="">暂无可用处理人员</option>
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {/* 根据当前用户类型显示不同的提示信息 */}
                  {currentUser.personType === '管理人员' && (
                    <p className="text-xs text-gray-400">作为管理人员，您可以在此页面（随手拍）指派管理人员处理事件。</p>
                  )}
                  {currentUser.personType === '任务跟踪人员' && (
                    <p className="text-xs text-gray-400">作为任务跟踪人员，您将在事件整改页面负责处理任务。</p>
                  )}
                </div>
              </div>
              

              
              {/* 处理备注 */}
              <div>
                <h4 className="text-base font-medium text-white mb-2">处理备注（选填）</h4>
                <textarea
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="请输入处理过程的备注信息..."
                  className="w-full px-3 py-2 border border-[#1e4976] rounded-md bg-[#0a1628] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:border-transparent min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex gap-3">
              <button
                onClick={closeProcessModal}
                className="flex-1 py-3 bg-[#1e4976] text-white font-medium rounded-md hover:bg-[#2d5a8a]"
              >
                取消
              </button>
              <button
                onClick={confirmStartProcess}
                disabled={!selectedProcessPerson}
                className={`flex-1 py-3 font-medium rounded-md ${selectedProcessPerson ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30' : 'bg-[#1e4976] text-gray-400 cursor-not-allowed'}`}
              >
                确认开始处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagementPage;