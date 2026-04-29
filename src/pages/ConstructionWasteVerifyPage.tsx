import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, CheckCircle2, X, AlertCircle, Search, Filter, SortAsc } from "lucide-react";
import { toast } from "sonner";

// 模拟核销记录数据
const mockVerifyRecords = [
  {
    id: "verify-001",
    applicationId: "app-002",
    applicantName: "王五",
    vehicleNumber: "浙B67890",
    startLocation: "西湖区建筑工地B",
    endLocation: "萧山区垃圾处理厂",
    verifyTime: "2026-04-16 14:30",
    status: "success"
  },
  {
    id: "verify-002",
    applicationId: "app-004",
    applicantName: "赵六",
    vehicleNumber: "浙C12345",
    startLocation: "余杭区建筑工地D",
    endLocation: "西湖区垃圾处理厂",
    verifyTime: "2026-04-16 13:15",
    status: "success"
  }
];

const ConstructionWasteVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan"); // 'scan' or 'records'
  const [scanResult, setScanResult] = useState("");
  const [verifyRecords, setVerifyRecords] = useState(mockVerifyRecords);
  const [isScanning, setIsScanning] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");

  // 处理扫描二维码
  const handleScanQRCode = () => {
    setIsScanning(true);
    // 模拟扫描过程
    setTimeout(() => {
      // 模拟扫描结果，实际项目中应该使用二维码扫描库
      const mockQRData = "app-002";
      setScanResult(mockQRData);
      setIsScanning(false);
      handleVerify(mockQRData);
    }, 1500);
  };

  // 处理核销
  const handleVerify = (applicationId: string) => {
    // 模拟核销过程
    toast.success(`核销成功！申请ID: ${applicationId}`);
    
    // 添加核销记录
    const newRecord = {
      id: `verify-${Date.now()}`,
      applicationId,
      applicantName: "测试用户",
      vehicleNumber: "浙A12345",
      startLocation: "测试起点",
      endLocation: "测试终点",
      verifyTime: new Date().toLocaleString(),
      status: "success"
    };
    
    setVerifyRecords([newRecord, ...verifyRecords]);
  };

  // 处理搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 处理状态筛选
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // 处理排序
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // 过滤和排序核销记录
  const filteredAndSortedRecords = verifyRecords
    .filter(record => {
      // 搜索过滤
      const matchesSearch = searchKeyword === '' || 
        record.applicationId.includes(searchKeyword) ||
        record.applicantName.includes(searchKeyword) ||
        record.vehicleNumber.includes(searchKeyword) ||
        record.startLocation.includes(searchKeyword) ||
        record.endLocation.includes(searchKeyword);
      
      // 状态过滤
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'time') {
        const dateA = new Date(a.verifyTime).getTime();
        const dateB = new Date(b.verifyTime).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部导航栏 - 小程序风格固定导航 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="h-16 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 
            onClick={() => navigate(-1)}
            className="flex-1 text-center text-lg font-bold text-gray-900 -ml-8 cursor-pointer hover:bg-gray-50 py-2 rounded-md transition-colors"
          >
            建筑垃圾核销
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回主页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-700">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 主要内容 */}
      <div className="pt-20 pb-6 px-4">
        {/* Tab 切换 */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${activeTab === 'scan' ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                扫描二维码
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${activeTab === 'records' ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                核销记录
              </button>
            </div>
          </div>
        </div>
        
        {/* 扫描二维码 Tab */}
        {activeTab === 'scan' && (
          <div>
            {/* 扫描区域 */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <h2 className="text-lg font-medium text-gray-900 mb-4">扫描二维码</h2>
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
                    {isScanning ? (
                      <div className="text-gray-500">
                        <p className="text-sm">正在扫描...</p>
                      </div>
                    ) : (
                      <>
                        <QrCode size={48} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">请将二维码对准扫描区域</p>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={handleScanQRCode}
                    disabled={isScanning}
                    className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 ${isScanning ? 'bg-gray-400 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                  >
                    {isScanning ? '扫描中...' : '开始扫描'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* 扫描结果 */}
            {scanResult && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">扫描结果</h3>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                    <span className="text-gray-500">申请ID:</span>
                    <span className="font-medium text-gray-900">{scanResult}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                    <span className="text-gray-500">状态:</span>
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={16} />
                      核销成功
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">核销时间:</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 核销记录 Tab */}
        {activeTab === 'records' && (
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">核销记录</h3>
            
            {/* 搜索、筛选和排序 */}
            <div className="mb-4 space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="搜索申请ID、申请人、车牌号等"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              
              {/* 筛选和排序 */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* 状态筛选 */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">状态</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter size={14} className="text-gray-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="all">全部状态</option>
                      <option value="success">成功</option>
                      <option value="failed">失败</option>
                    </select>
                  </div>
                </div>
                
                {/* 排序 */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">排序</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SortAsc size={14} className="text-gray-400" />
                    </div>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={handleSortChange}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="time-desc">时间 (最新优先)</option>
                      <option value="time-asc">时间 (最早优先)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredAndSortedRecords.map((record) => (
                <div 
                  key={record.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-medium text-gray-900 text-sm">核销 #{record.id}</h4>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${record.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {record.status === 'success' ? '成功' : '失败'}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">申请ID:</span>
                        <span className="font-medium text-gray-900">{record.applicationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">申请人:</span>
                        <span className="font-medium text-gray-900">{record.applicantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">车牌号:</span>
                        <span className="font-medium text-gray-900">{record.vehicleNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">起点:</span>
                        <span className="font-medium text-gray-900">{record.startLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">终点:</span>
                        <span className="font-medium text-gray-900">{record.endLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">核销时间:</span>
                        <span className="font-medium text-gray-900">{record.verifyTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionWasteVerifyPage;