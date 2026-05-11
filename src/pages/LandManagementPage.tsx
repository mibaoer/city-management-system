import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Upload, Download, RefreshCw, X } from 'lucide-react';

interface LandPlot {
  id: string;
  plotNumber: string;
  plotName: string;
  location: string;
  area: number;
  unit: string;
  usage: string;
  status: string;
  acquisitionDate: string;
  notes: string;
}

const mockData: LandPlot[] = [
  { id: '1', plotNumber: 'AU001', plotName: '东城区地块', location: '东城区', area: 5.2, unit: '亩', usage: '规划商业用地', status: '已征未用', acquisitionDate: '2023-05-15', notes: '' },
  { id: '2', plotNumber: 'AU002', plotName: '西城区地块', location: '西城区', area: 3.8, unit: '亩', usage: '规划住宅用地', status: '已征未用', acquisitionDate: '2023-08-20', notes: '' },
  { id: '3', plotNumber: 'AU003', plotName: '南城区地块', location: '南城区', area: 8.5, unit: '亩', usage: '规划公园用地', status: '已征未用', acquisitionDate: '2023-10-10', notes: '' },
  { id: '4', plotNumber: 'AU004', plotName: '北城区地块', location: '北城区', area: 4.3, unit: '亩', usage: '规划工业用地', status: '已征未用', acquisitionDate: '2023-12-05', notes: '' },
  { id: '5', plotNumber: 'AU005', plotName: '中心区地块', location: '中心区', area: 2.1, unit: '亩', usage: '规划公共设施用地', status: '已征未用', acquisitionDate: '2024-01-15', notes: '' },
];

const STORAGE_KEY = 'landPlots';

function loadData(): LandPlot[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : mockData;
}

const LandManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<LandPlot[]>(loadData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState<LandPlot | null>(null);
  const [formData, setFormData] = useState<Partial<LandPlot>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  }, [plots]);

  const filteredData = plots.filter(p => {
    const matchSearch = !searchTerm ||
      p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plotName.includes(searchTerm) ||
      p.location.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalArea = plots.reduce((sum, p) => sum + p.area, 0);

  const handleAdd = () => {
    setEditingPlot(null);
    setFormData({ area: 0, unit: '亩', status: '已征未用' });
    setShowModal(true);
  };

  const handleEdit = (plot: LandPlot) => {
    setEditingPlot(plot);
    setFormData({ ...plot });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该地块信息吗？')) {
      setPlots(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.plotNumber || !formData.plotName || !formData.location || !formData.usage) {
      alert('请填写必填字段');
      return;
    }
    if (editingPlot) {
      setPlots(prev => prev.map(p => p.id === editingPlot.id ? { ...p, ...formData } as LandPlot : p));
    } else {
      const newPlot: LandPlot = {
        id: Date.now().toString(),
        plotNumber: formData.plotNumber || '',
        plotName: formData.plotName || '',
        location: formData.location || '',
        area: formData.area || 0,
        unit: formData.unit || '亩',
        usage: formData.usage || '',
        status: formData.status || '已征未用',
        acquisitionDate: formData.acquisitionDate || '',
        notes: formData.notes || '',
      };
      setPlots(prev => [...prev, newPlot]);
    }
    setShowModal(false);
    setEditingPlot(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' ? Number(value) : value,
    }));
  };

  const handleExport = () => {
    const data = filteredData;
    if (data.length === 0) { alert('暂无数据可导出'); return; }
    const headers = ['地块编号', '地块名称', '位置', '面积(亩)', '用途', '状态', '征收时间', '备注'];
    const rows = data.map(p => [p.plotNumber, p.plotName, p.location, p.area, p.usage, p.status, p.acquisitionDate, p.notes]);
    const BOM = '﻿';
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `已征未用_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleImport = () => { fileInputRef.current?.click(); };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) { alert('文件格式不正确'); return; }
        const newData: LandPlot[] = lines.slice(1).map((line, i) => {
          const vals = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const clean = (v: string) => (v || '').replace(/"/g, '').trim();
          return {
            id: (Date.now() + i).toString(),
            plotNumber: clean(vals[0]) || '',
            plotName: clean(vals[1]) || '',
            location: clean(vals[2]) || '',
            area: Number(clean(vals[3])) || 0,
            unit: '亩',
            usage: clean(vals[4]) || '',
            status: clean(vals[5]) || '已征未用',
            acquisitionDate: clean(vals[6]) || '',
            notes: clean(vals[7]) || '',
          };
        });
        if (newData.length === 0) { alert('未解析到数据'); return; }
        setPlots(prev => [...prev, ...newData]);
        alert(`成功导入 ${newData.length} 条数据`);
      } catch {
        alert('文件解析失败，请检查CSV格式');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const resetFilter = () => { setSearchTerm(''); setFilterStatus('all'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">已征未用管理</h1>
            <p className="text-gray-400 text-sm">管理已征未用地块信息</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">合计</div>
            <div className="text-xl font-bold text-[#00e5ff]">{plots.length}块 {totalArea.toFixed(1)}亩</div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="mb-3 flex justify-end">
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium text-sm">
          <Plus size={16} />
          新建
        </button>
      </div>

      {/* 筛选 + 导入导出 */}
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">地块状态</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white text-sm"
            >
              <option value="all">全部</option>
              <option value="已征未用">已征未用</option>
              <option value="已征已用">已征已用</option>
              <option value="未征">未征</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">关键词搜索</label>
            <div className="relative">
              <input
                type="text"
                placeholder="地块编号、名称、位置"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white text-sm"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            onClick={resetFilter}
            className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium text-sm flex items-center gap-1.5 justify-center"
          >
            <RefreshCw size={14} />
            重置
          </button>
          <div className="flex gap-2 justify-end">
            <button onClick={handleImport} className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium text-sm flex items-center gap-1.5">
              <Upload size={14} />
              导入
            </button>
            <button onClick={handleExport} className="px-4 py-2 bg-[#00e5ff] text-[#0a1628] rounded-lg hover:bg-[#00e5ff]/90 transition-colors font-medium text-sm flex items-center gap-1.5">
              <Download size={14} />
              导出
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileImport} className="hidden" />
      </div>

      {/* 表格 */}
      <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e4976]">
              <th className="px-4 py-3 text-left">序号</th>
              <th className="px-4 py-3 text-left">地块编号</th>
              <th className="px-4 py-3 text-left">地块名称</th>
              <th className="px-4 py-3 text-left">位置</th>
              <th className="px-4 py-3 text-left">面积(亩)</th>
              <th className="px-4 py-3 text-left">用途</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">征收时间</th>
              <th className="px-4 py-3 text-left">备注</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
              </tr>
            ) : (
              filteredData.map((plot, index) => (
                <tr key={plot.id} className="border-t border-[#1e4976] hover:bg-[#16283f]">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-[#00e5ff]">{plot.plotNumber}</td>
                  <td className="px-4 py-3">{plot.plotName}</td>
                  <td className="px-4 py-3">{plot.location}</td>
                  <td className="px-4 py-3">{plot.area}</td>
                  <td className="px-4 py-3">{plot.usage}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      plot.status === '已征未用' ? 'bg-yellow-500/20 text-yellow-400' :
                      plot.status === '已征已用' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {plot.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{plot.acquisitionDate}</td>
                  <td className="px-4 py-3 text-gray-400">{plot.notes}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(plot)} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(plot.id)} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl shadow-[#00e5ff]/20 border-2 border-[#1e4976] max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e4976]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">
                {editingPlot ? '编辑地块信息' : '新增地块信息'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingPlot(null); }} className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">地块编号</label>
                  <input name="plotNumber" value={formData.plotNumber || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">地块名称</label>
                  <input name="plotName" value={formData.plotName || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">位置</label>
                  <input name="location" value={formData.location || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">面积(亩)</label>
                  <input type="number" step="0.1" name="area" value={formData.area || 0} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">用途</label>
                  <input name="usage" value={formData.usage || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                  <select name="status" value={formData.status || '已征未用'} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white">
                    <option value="已征未用">已征未用</option>
                    <option value="已征已用">已征已用</option>
                    <option value="未征">未征</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">征收时间</label>
                  <input type="date" name="acquisitionDate" value={formData.acquisitionDate || ''} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">备注</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={2}
                  className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#081c2f] text-white resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-[#1e4976] flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); setEditingPlot(null); }}
                className="px-4 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors font-medium">
                取消
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] text-[#0e2a47] rounded-lg hover:shadow-lg hover:shadow-[#00e5ff]/30 transition-colors font-medium">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandManagementPage;
