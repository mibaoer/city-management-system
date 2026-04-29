import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, Download, Upload, Save, X } from 'lucide-react';

// 垃圾处理厂数据接口
interface WasteTreatmentPlant {
  id: string;
  name: string;
  address: string;
  capacity: number;
  contactPerson: string;
  contactPhone: string;
  status: string;
}

// 施工点位数据接口
interface ConstructionSite {
  id: string;
  name: string;
  address: string;
  projectName: string;
  constructionCompany: string;
  contactPerson: string;
  contactPhone: string;
  estimatedWaste: number;
  startDate: string;
  endDate: string;
  status: string;
}

// 模拟垃圾处理厂数据
const mockWasteTreatmentPlants: WasteTreatmentPlant[] = [
  { id: '1', name: '杭州垃圾焚烧发电厂', address: '杭州市余杭区良渚街道', capacity: 5000, contactPerson: '张经理', contactPhone: '13800138001', status: '正常运行' },
  { id: '2', name: '杭州填埋场', address: '杭州市萧山区义桥镇', capacity: 10000, contactPerson: '李经理', contactPhone: '13900139001', status: '正常运行' },
  { id: '3', name: '杭州建筑垃圾处理厂', address: '杭州市富阳区春江街道', capacity: 3000, contactPerson: '王经理', contactPhone: '13700137001', status: '正常运行' },
  { id: '4', name: '杭州再生资源利用厂', address: '杭州市临安区锦南街道', capacity: 2000, contactPerson: '赵经理', contactPhone: '13600136001', status: '正常运行' },
  { id: '5', name: '杭州固废处理中心', address: '杭州市钱塘区白杨街道', capacity: 4000, contactPerson: '钱经理', contactPhone: '13500135001', status: '正常运行' },
];

// 模拟施工点位数据
const mockConstructionSites: ConstructionSite[] = [
  { id: '1', name: '良渚文化村三期', address: '杭州市余杭区良渚街道古墩路', projectName: '良渚文化村三期住宅项目', constructionCompany: '杭州建工集团', contactPerson: '陈工', contactPhone: '13800138002', estimatedWaste: 10000, startDate: '2024-01-01', endDate: '2024-12-31', status: '进行中' },
  { id: '2', name: '未来科技城创新中心', address: '杭州市余杭区未来科技城', projectName: '未来科技城创新中心', constructionCompany: '浙江交工集团', contactPerson: '林工', contactPhone: '13900139002', estimatedWaste: 15000, startDate: '2024-02-01', endDate: '2025-02-01', status: '进行中' },
  { id: '3', name: '西湖区商业综合体', address: '杭州市西湖区文三路', projectName: '西湖区商业综合体', constructionCompany: '中建三局', contactPerson: '黄工', contactPhone: '13700137002', estimatedWaste: 8000, startDate: '2024-03-01', endDate: '2024-12-01', status: '进行中' },
  { id: '4', name: '滨江区智慧科技园', address: '杭州市滨江区江南大道', projectName: '滨江区智慧科技园', constructionCompany: '中铁四局', contactPerson: '杨工', contactPhone: '13600136002', estimatedWaste: 12000, startDate: '2024-04-01', endDate: '2025-04-01', status: '进行中' },
  { id: '5', name: '上城区保障性住房', address: '杭州市上城区望江街道', projectName: '上城区保障性住房', constructionCompany: '浙江省建工集团', contactPerson: '吴工', contactPhone: '13500135002', estimatedWaste: 9000, startDate: '2024-05-01', endDate: '2025-05-01', status: '进行中' },
];

const ConstructionWastePointManagement: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'plants' | 'sites'>('plants');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // 数据状态
  const [wasteTreatmentPlants, setWasteTreatmentPlants] = useState<WasteTreatmentPlant[]>(mockWasteTreatmentPlants);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>(mockConstructionSites);
  
  // 表单状态
  const [formData, setFormData] = useState<any>({});
  
  // 处理标签切换
  const handleTabChange = (tab: 'plants' | 'sites') => {
    setActiveTab(tab);
    setEditingItem(null);
    setShowAddModal(false);
  };
  
  // 处理添加按钮点击
  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddModal(true);
  };
  
  // 处理编辑按钮点击
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({...item});
    setShowAddModal(true);
  };
  
  // 处理删除按钮点击
  const handleDeleteClick = (id: string) => {
    if (window.confirm('确定要删除这个数据吗？')) {
      if (activeTab === 'plants') {
        setWasteTreatmentPlants(wasteTreatmentPlants.filter(plant => plant.id !== id));
      } else {
        setConstructionSites(constructionSites.filter(site => site.id !== id));
      }
    }
  };
  
  // 处理表单提交
  const handleFormSubmit = () => {
    if (editingItem) {
      // 编辑现有项
      if (activeTab === 'plants') {
        setWasteTreatmentPlants(wasteTreatmentPlants.map(plant => plant.id === editingItem.id ? formData : plant));
      } else {
        setConstructionSites(constructionSites.map(site => site.id === editingItem.id ? formData : site));
      }
    } else {
      // 添加新项
      const newId = Date.now().toString();
      const newItem = {
        ...formData,
        id: newId
      };
      
      if (activeTab === 'plants') {
        setWasteTreatmentPlants([...wasteTreatmentPlants, newItem as WasteTreatmentPlant]);
      } else {
        setConstructionSites([...constructionSites, newItem as ConstructionSite]);
      }
    }
    setShowAddModal(false);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理导入
  const handleImport = () => {
    alert('导入功能开发中');
  };
  
  // 处理导出
  const handleExport = () => {
    alert('导出功能开发中');
  };
  
  // 过滤数据
  const filteredData = () => {
    if (activeTab === 'plants') {
      return wasteTreatmentPlants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return constructionSites.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">点位信息维护</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e4976] text-white rounded-lg hover:bg-[#2a5a8a] transition-colors"
          >
            <Upload size={16} />
            导入
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e4976] text-white rounded-lg hover:bg-[#2a5a8a] transition-colors"
          >
            <Download size={16} />
            导出
          </button>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#00e5ff] text-[#0a1628] font-bold rounded-lg hover:bg-[#00c2d9] transition-colors"
          >
            <Plus size={16} />
            添加数据
          </button>
        </div>
      </div>
      
      {/* 标签切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('plants')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'plants' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          垃圾处理厂
        </button>
        <button
          onClick={() => handleTabChange('sites')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'sites' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          施工点位
        </button>
      </div>
      
      {/* 搜索栏 */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
        />
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* 数据表格 */}
      <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {activeTab === 'plants' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">处理厂名称</th>
                  <th className="px-4 py-3 text-left">地址</th>
                  <th className="px-4 py-3 text-left">处理能力 (吨/天)</th>
                  <th className="px-4 py-3 text-left">联系人</th>
                  <th className="px-4 py-3 text-left">联系电话</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
              {activeTab === 'sites' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">点位名称</th>
                  <th className="px-4 py-3 text-left">地址</th>
                  <th className="px-4 py-3 text-left">项目名称</th>
                  <th className="px-4 py-3 text-left">施工单位</th>
                  <th className="px-4 py-3 text-left">联系人</th>
                  <th className="px-4 py-3 text-left">联系电话</th>
                  <th className="px-4 py-3 text-left">预估垃圾量 (吨)</th>
                  <th className="px-4 py-3 text-left">开始日期</th>
                  <th className="px-4 py-3 text-left">结束日期</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData().length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'plants' ? 8 : 12} className="px-4 py-8 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredData().map((item, index) => (
                  <tr key={item.id} className="border-t border-[#1e4976] hover:bg-[#16283f]">
                    {activeTab === 'plants' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.address}</td>
                        <td className="px-4 py-3">{item.capacity}</td>
                        <td className="px-4 py-3">{item.contactPerson}</td>
                        <td className="px-4 py-3">{item.contactPhone}</td>
                        <td className="px-4 py-3">{item.status}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item.id)}
                              className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'sites' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.address}</td>
                        <td className="px-4 py-3">{item.projectName}</td>
                        <td className="px-4 py-3">{item.constructionCompany}</td>
                        <td className="px-4 py-3">{item.contactPerson}</td>
                        <td className="px-4 py-3">{item.contactPhone}</td>
                        <td className="px-4 py-3">{item.estimatedWaste}</td>
                        <td className="px-4 py-3">{item.startDate}</td>
                        <td className="px-4 py-3">{item.endDate}</td>
                        <td className="px-4 py-3">{item.status}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item.id)}
                              className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 添加/编辑模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {editingItem ? '编辑数据' : '添加数据'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'plants' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">处理厂名称</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">地址</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">处理能力 (吨/天)</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">联系人</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">联系电话</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">状态</label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    >
                      <option value="">请选择状态</option>
                      <option value="正常运行">正常运行</option>
                      <option value="暂停运行">暂停运行</option>
                      <option value="维护中">维护中</option>
                      <option value="已关闭">已关闭</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'sites' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">点位名称</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">地址</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">项目名称</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">施工单位</label>
                    <input
                      type="text"
                      name="constructionCompany"
                      value={formData.constructionCompany || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">联系人</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">联系电话</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">预估垃圾量 (吨)</label>
                    <input
                      type="number"
                      name="estimatedWaste"
                      value={formData.estimatedWaste || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">开始日期</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">结束日期</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">状态</label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    >
                      <option value="">请选择状态</option>
                      <option value="进行中">进行中</option>
                      <option value="已完成">已完成</option>
                      <option value="未开始">未开始</option>
                      <option value="暂停">暂停</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#1e4976] text-white rounded-lg hover:bg-[#2a5a8a] transition-colors flex items-center gap-1"
              >
                <X size={16} />
                取消
              </button>
              <button 
                onClick={handleFormSubmit}
                className="px-4 py-2 bg-[#00e5ff] text-[#0a1628] font-bold rounded-lg hover:bg-[#00c2d9] transition-colors flex items-center gap-1"
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionWastePointManagement;