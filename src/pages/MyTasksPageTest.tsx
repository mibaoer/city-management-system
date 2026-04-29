import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, X, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

const MyTasksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleGoBack = () => {
    console.log('Go back');
  };

  const handleAddTask = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteTask = () => {
    // 删除逻辑
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="h-16 flex items-center px-4">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 -ml-8">我的任务</h1>
          <div className="w-8">
            {/* 占位 */}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="pt-20 pb-6 px-4">
        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 text-sm"
          />
        </div>

        {/* 添加任务按钮 */}
        <div className="mb-6">
          <button 
            onClick={handleAddTask}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2" />
            添加新任务
          </button>
        </div>

        {/* 任务列表 */}
        <div className="space-y-3">
          {/* 任务项示例 */}
          <div 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedTask({ id: 1, title: '完成项目文档' });
              setShowDeleteModal(true);
            }}
          >
            <h3 className="font-medium text-gray-900 mb-1">完成项目文档</h3>
            <p className="text-sm text-gray-500">截止日期：2024-12-31</p>
          </div>
        </div>
      </div>

      {/* 添加任务模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">添加新任务</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入任务名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={handleCloseAddModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除任务确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">确认删除</h2>
            </div>
            <div className="p-5">
              <p className="text-gray-700">确定要删除任务 "{selectedTask?.title}" 吗？此操作不可撤销。</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button 
                onClick={handleDeleteTask}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;