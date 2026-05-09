import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskListPage from './TaskListPage';

const UrbanManagementPage: React.FC = () => {
  const navigate = useNavigate();

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

        {/* 任务管理内容 */}
        <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl border-2 border-[#1e4976] overflow-hidden p-4">
          <TaskListPage defaultTeam="urban" />
        </div>
      </div>
    </div>
  );
};

export default UrbanManagementPage;
