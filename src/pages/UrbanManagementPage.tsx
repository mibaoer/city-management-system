import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Truck } from 'lucide-react';
import TaskListPage from './TaskListPage';
import VehicleManagementPage from './VehicleManagementPage';

const UrbanManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('task'); // 'task' or 'vehicle'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a]">
      <div className="container mx-auto px-6 py-6">
        {/* 页面标题和返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg bg-[#1e4976] hover:bg-[#00e5ff]/20 text-white transition-all duration-300"
              aria-label="返回"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
              城市管理
            </h1>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg bg-[#0e2a47] p-1">
            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'task' ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0a1628] shadow-lg shadow-[#00e5ff]/30' : 'text-gray-400 hover:text-white hover:bg-[#1e4976]'}`}
            >
              <ClipboardList size={18} className="mr-2" />
              任务管理
            </button>
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === 'vehicle' ? 'bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0a1628] shadow-lg shadow-[#00e5ff]/30' : 'text-gray-400 hover:text-white hover:bg-[#1e4976]'}`}
            >
              <Truck size={18} className="mr-2" />
              车辆管理
            </button>
          </div>
        </div>

        {/* Tab 内容区域 */}
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl border-2 border-[#1e4976] overflow-hidden">
          {/* 任务管理内容 - 直接嵌入TaskListPage组件，并默认筛选城市管理团队 */}
          {activeTab === 'task' && (
            <div className="p-4">
              <TaskListPage defaultTeam="urban" />
            </div>
          )}

          {/* 车辆管理内容 - 直接嵌入VehicleManagementPage组件 */}
          {activeTab === 'vehicle' && (
            <div className="p-4">
              <VehicleManagementPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrbanManagementPage;
