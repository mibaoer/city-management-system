import React, { useState } from 'react';
import WasteTransportTaskListPage from './WasteTransportTaskListPage';
import VehicleRegistrationManagement from './components/VehicleRegistrationManagement';
import ConstructionWastePointManagement from './components/ConstructionWastePointManagement';
import ConstructionWasteApproval from './components/ConstructionWasteApproval';

const ConstructionWasteManagementPage: React.FC = () => {
  // 状态管理当前激活的tab
  const [activeTab, setActiveTab] = useState<'task' | 'vehicle' | 'point' | 'approval'>('task');

  // Tab切换处理函数
  const handleTabChange = (tab: 'task' | 'vehicle' | 'point' | 'approval') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent mb-2">建筑垃圾全链路管理</h1>
        <p className="text-gray-400">管理清运司机、车辆、重量、现场照片、路线等</p>
      </div>

      {/* Tab导航栏 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('task')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'task' 
            ? 'bg-[#00e5ff] text-[#0a1628]' 
            : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          清运任务管理
        </button>
        <button
          onClick={() => handleTabChange('point')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'point' 
            ? 'bg-[#00e5ff] text-[#0a1628]' 
            : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          点位信息维护
        </button>
        <button
          onClick={() => handleTabChange('vehicle')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'vehicle' 
            ? 'bg-[#00e5ff] text-[#0a1628]' 
            : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          车辆备案管理
        </button>
        <button
          onClick={() => handleTabChange('approval')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'approval' 
            ? 'bg-[#00e5ff] text-[#0a1628]' 
            : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          清运审批
        </button>
      </div>

      {/* Tab内容区域 */}
      <div className="tab-content">
        {activeTab === 'task' && (
          <WasteTransportTaskListPage />
        )}
        {activeTab === 'point' && (
          <ConstructionWastePointManagement />
        )}
        {activeTab === 'vehicle' && (
          <VehicleRegistrationManagement />
        )}
        {activeTab === 'approval' && (
          <ConstructionWasteApproval />
        )}
      </div>
    </div>
  );
};

export default ConstructionWasteManagementPage;