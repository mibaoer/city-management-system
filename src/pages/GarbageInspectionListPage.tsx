import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, BarChart2, X, ChevronDown, ChevronUp, Image as ImageIcon, ZoomIn, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// 定义扣分项目接口
interface DeductionItem {
  id: string;
  category: string;
  item: string;
  score: number;
  images?: string[]; // 扣分对应的图片
}

// 定义检查记录接口
interface InspectionRecord {
  id: string;
  community: string;
  village: string;
  score: number;
  date: string;
  inspector: string;
  district: string;
  deductions: DeductionItem[];
}

const GarbageInspectionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // 筛选状态
  const [selectedVillage, setSelectedVillage] = useState<string>(''); // 选中的村社
  const [selectedGrid, setSelectedGrid] = useState<string>(''); // 选中的网格
  const [selectedCommunity, setSelectedCommunity] = useState<string>(''); // 选中的小区
  // 弹窗选择器状态
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [currentSelectorType, setCurrentSelectorType] = useState<'village' | 'grid' | 'community'>('village');
  const [selectorData, setSelectorData] = useState<string[]>([]);
  const [selectorTitle, setSelectorTitle] = useState<string>('');
  
  // 时间筛选状态
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // 模拟检查记录数据
  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[]>([
    {      id: "1",
      community: "新社区",
      village: "七贤桥村",
      score: 85,
      date: "2025-10-20",
      inspector: "张三",
      district: "浙江省杭州市余杭区南苑街道",
      deductions: [
        { 
          id: "d1-1", 
          category: "分类质量", 
          item: "存在轻微混投", 
          score: 5,
          images: [
            "https://picsum.photos/id/1/400/400",
            "https://picsum.photos/id/2/400/400"
          ]
        },
        { 
          id: "d1-2", 
          category: "分类设施", 
          item: "分类设施过于陈旧、褪色、破损、脏污", 
          score: 5,
          images: [
            "https://picsum.photos/id/10/400/400",
            "https://picsum.photos/id/11/400/400"
          ]
        },
        { 
          id: "d1-3", 
          category: "分类辅导", 
          item: "投放时段无人值守", 
          score: 5,
          images: [
            "https://picsum.photos/id/20/400/400"
          ]
        }
      ]
    },
    {      id: "2",
      community: "老社区",
      village: "大陆村",
      score: 92,
      date: "2025-10-19",
      inspector: "李四",
      district: "浙江省杭州市余杭区临平街道",
      deductions: [
        { 
          id: "d2-1", 
          category: "分类清运", 
          item: "垃圾超过桶身，无合适", 
          score: 4,
          images: [
            "https://picsum.photos/id/30/400/400",
            "https://picsum.photos/id/31/400/400"
          ]
        },
        { 
          id: "d2-2", 
          category: "分类清运", 
          item: "集置点环境卫生情况差", 
          score: 5,
          images: [
            "https://picsum.photos/id/40/400/400",
            "https://picsum.photos/id/41/400/400"
          ]
        }
      ]
    },
    {      id: "3",
      community: "幸福小区",
      village: "勾庄村",
      score: 78,
      date: "2025-10-18",
      inspector: "王五",
      district: "浙江省杭州市西湖区文新街道",
      deductions: [
        { 
          id: "d3-1", 
          category: "分类质量", 
          item: "存在混投现象", 
          score: 10,
          images: [
            "https://picsum.photos/id/50/400/400",
            "https://picsum.photos/id/51/400/400",
            "https://picsum.photos/id/52/400/400"
          ]
        },
        { 
          id: "d3-2", 
          category: "分类质量", 
          item: "未开展或虚设定时定点", 
          score: 5,
          images: [
            "https://picsum.photos/id/60/400/400"
          ]
        },
        { 
          id: "d3-3", 
          category: "分类设施", 
          item: "分类投放点未配齐四类垃圾投放设施", 
          score: 5,
          images: [
            "https://picsum.photos/id/70/400/400",
            "https://picsum.photos/id/71/400/400"
          ]
        },
        { 
          id: "d3-4", 
          category: "分类辅导", 
          item: "小区内存在垃圾散管", 
          score: 2,
          images: [
            "https://picsum.photos/id/80/400/400"
          ]
        }
      ]
    },
    {      id: "4",
      community: "和谐家园",
      village: "杜甫村",
      score: 88,
      date: "2025-10-17",
      inspector: "赵六",
      district: "浙江省杭州市西湖区古荡街道",
      deductions: [
        { 
          id: "d4-1", 
          category: "分类设施", 
          item: "分类设施地面油污、污水横流", 
          score: 5,
          images: [
            "https://picsum.photos/id/90/400/400",
            "https://picsum.photos/id/91/400/400"
          ]
        },
        { 
          id: "d4-2", 
          category: "分类辅导", 
          item: "指示牌公示信息不到位", 
          score: 1,
          images: [
            "https://picsum.photos/id/100/400/400"
          ]
        },
        { 
          id: "d4-3", 
          category: "分类辅导", 
          item: "指示牌存在破损、脏污", 
          score: 1,
          images: [
            "https://picsum.photos/id/110/400/400"
          ]
        },
        { 
          id: "d4-4", 
          category: "分类辅导", 
          item: "非投放时段未及时撤桶", 
          score: 5,
          images: [
            "https://picsum.photos/id/120/400/400",
            "https://picsum.photos/id/121/400/400"
          ]
        }
      ]
    },
    // 新增小区数据
    {      id: "5",
      community: "阳光花园",
      village: "七贤桥村",
      score: 95,
      date: "2025-10-16",
      inspector: "张三",
      district: "浙江省杭州市余杭区南苑街道",
      deductions: [
        { 
          id: "d5-1", 
          category: "分类辅导", 
          item: "投放引导人员着装不规范", 
          score: 2,
          images: [
            "https://picsum.photos/id/130/400/400"
          ]
        },
        { 
          id: "d5-2", 
          category: "分类辅导", 
          item: "宣传海报轻微褪色", 
          score: 3,
          images: [
            "https://picsum.photos/id/140/400/400"
          ]
        }
      ]
    },

    {      id: "6",
      community: "绿城小区",
      village: "大陆村",
      score: 83,
      date: "2025-10-15",
      inspector: "李四",
      district: "浙江省杭州市余杭区临平街道",
      deductions: [
        { 
          id: "d6-1", 
          category: "分类质量", 
          item: "少量垃圾未正确分类", 
          score: 7,
          images: [
            "https://picsum.photos/id/150/400/400",
            "https://picsum.photos/id/160/400/400"
          ]
        },
        { 
          id: "d6-2", 
          category: "分类设施", 
          item: "部分垃圾桶标识不清", 
          score: 10,
          images: [
            "https://picsum.photos/id/170/400/400"
          ]
        }
      ]
    },
    {      id: "7",
      community: "滨江苑",
      village: "勾庄村",
      score: 89,
      date: "2025-10-14",
      inspector: "王五",
      district: "浙江省杭州市西湖区文新街道",
      deductions: [
        { 
          id: "d7-1", 
          category: "分类清运", 
          item: "清运车辆未按时到达", 
          score: 5,
          images: [
            "https://picsum.photos/id/180/400/400"
          ]
        },
        { 
          id: "d7-2", 
          category: "分类辅导", 
          item: "未及时更新分类知识宣传", 
          score: 6,
          images: [
            "https://picsum.photos/id/190/400/400"
          ]
        }
      ]
    },
    {      id: "8",
      community: "桂花苑",
      village: "杜甫村",
      score: 91,
      date: "2025-10-13",
      inspector: "赵六",
      district: "浙江省杭州市西湖区古荡街道",
      deductions: [
        { 
          id: "d8-1", 
          category: "分类设施", 
          item: "部分垃圾桶需要清洗", 
          score: 4,
          images: [
            "https://picsum.photos/id/200/400/400",
            "https://picsum.photos/id/210/400/400"
          ]
        },
        { 
          id: "d8-2", 
          category: "分类质量", 
          item: "个别居民未按规定分类", 
          score: 5,
          images: [
            "https://picsum.photos/id/220/400/400"
          ]
        }
      ]
    },
    {      id: "9",
      community: "湖景花园",
      village: "七贤桥村",
      score: 87,
      date: "2025-10-12",
      inspector: "张三",
      district: "浙江省杭州市余杭区南苑街道",
      deductions: [
        { 
          id: "d9-1", 
          category: "分类质量", 
          item: "可回收物与其他垃圾混放", 
          score: 8,
          images: [
            "https://picsum.photos/id/230/400/400",
            "https://picsum.photos/id/240/400/400"
          ]
        },
        { 
          id: "d9-2", 
          category: "分类清运", 
          item: "清运记录不完整", 
          score: 5,
          images: [
            "https://picsum.photos/id/250/400/400"
          ]
        }
      ]
    },
    {      id: "10",
      community: "竹林小区",
      village: "大陆村",
      score: 82,
      date: "2025-10-11",
      inspector: "李四",
      district: "浙江省杭州市余杭区临平街道",
      deductions: [
        { 
          id: "d10-1", 
          category: "分类质量", 
          item: "厨余垃圾与其他垃圾混放", 
          score: 12,
          images: [
            "https://picsum.photos/id/260/400/400",
            "https://picsum.photos/id/270/400/400",
            "https://picsum.photos/id/280/400/400"
          ]
        },
        { 
          id: "d10-2", 
          category: "分类设施", 
          item: "部分垃圾桶损坏未及时更换", 
          score: 6,
          images: [
            "https://picsum.photos/id/290/400/400"
          ]
        }
      ]
    }
  ]);
  
  // 处理返回按钮点击
  const handleBack = () => {
    navigate(-1);
  };
  
  // 处理新建检查按钮点击
  const handleNewInspection = () => {
    navigate("/garbage-inspection");
  };
  
  // 处理检查记录点击，显示详细扣分内容
  const handleRecordClick = (record: InspectionRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
    // 默认展开所有分类
    const categories = Array.from(new Set(record.deductions.map(d => d.category)));
    setExpandedCategories(categories);
  };
  
  // 关闭详情模态框
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };
  
  // 切换分类展开/收起状态
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // 打开图片预览
  const handleImagePreview = (images: string[], index: number) => {
    setPreviewImage(images[index]);
    setCurrentImageIndex(index);
  };

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setPreviewImage(null);
    setCurrentImageIndex(0);
  };

  // 切换预览图片
  const handlePrevImage = (images: string[]) => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    setCurrentImageIndex(newIndex);
    setPreviewImage(images[newIndex]);
  };

  const handleNextImage = (images: string[]) => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
    setPreviewImage(images[newIndex]);
  };
  
  // 从检查记录中提取唯一的村社列表
  const villages = Array.from(new Set(inspectionRecords.map(record => record.village)));
  
  // 根据选中的村社获取对应的网格列表（这里用community作为网格）
  const grids = selectedVillage 
    ? Array.from(new Set(inspectionRecords.filter(record => record.village === selectedVillage).map(record => record.community)))
    : [];
  
  // 获取所有唯一的小区列表
  const communities = Array.from(new Set(inspectionRecords.map(record => record.community)));
  
  // 筛选后的检查记录
  const filteredRecords = inspectionRecords.filter(record => {
    const matchesVillage = !selectedVillage || record.village === selectedVillage;
    const matchesGrid = !selectedGrid || record.community === selectedGrid;
    const matchesCommunity = !selectedCommunity || record.community === selectedCommunity;
    
    // 时间筛选逻辑
    const recordDate = new Date(record.date);
    const matchesStartDate = !startDate || recordDate >= new Date(startDate);
    const matchesEndDate = !endDate || recordDate <= new Date(endDate);
    
    return matchesVillage && matchesGrid && matchesCommunity && matchesStartDate && matchesEndDate;
  });
  

  
  // 处理村社选择变化
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const village = e.target.value;
    setSelectedVillage(village);
    setSelectedGrid(''); // 重置网格选择
  };
  
  // 处理网格选择变化
  const handleGridChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrid(e.target.value);
  };
  
  // 处理小区选择变化
  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommunity(e.target.value);
  };

  // 打开选择器弹窗
  const openSelector = (type: 'village' | 'grid' | 'community') => {
    setCurrentSelectorType(type);
    let title = '';
    let data: string[] = [];

    switch (type) {
      case 'village':
        title = '选择村社';
        data = villages;
        break;
      case 'grid':
        title = '选择网格';
        data = grids;
        break;
      case 'community':
        title = '选择小区';
        data = communities;
        break;
    }

    setSelectorTitle(title);
    setSelectorData(data);
    setSelectorVisible(true);
  };

  // 关闭选择器弹窗
  const closeSelector = () => {
    setSelectorVisible(false);
  };

  // 选择项处理
  const selectItem = (value: string) => {
    switch (currentSelectorType) {
      case 'village':
        setSelectedVillage(value);
        setSelectedGrid(''); // 重置网格选择
        break;
      case 'grid':
        setSelectedGrid(value);
        break;
      case 'community':
        setSelectedCommunity(value);
        // 当选择全部小区时，恢复显示统计信息和图表
        if (value === '') {
          setShowStats(true);
        }
        break;
    }
    closeSelector();
  };

  // 获取当前选中的值
  const getCurrentSelectedValue = () => {
    switch (currentSelectorType) {
      case 'village':
        return selectedVillage || '全部村社';
      case 'grid':
        return selectedGrid || '全部网格';
      case 'community':
        return selectedCommunity || '全部小区';
      default:
        return '';
    }
  };
  
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* 顶部导航栏 */}
      <header
        className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">垃圾分类检查列表</h1>
        <div className="w-8"></div> {/* 占位，保持标题居中 */}
      </header>
      
      {/* 筛选器区域 */}
      <div className="p-4 bg-white mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">所属村社</label>
            <div
              onClick={() => openSelector('village')}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 cursor-pointer flex items-center justify-between"
            >
              <span>{selectedVillage || '全部村社'}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">所属网格</label>
            <div
              onClick={() => selectedVillage && openSelector('grid')}
              className={`w-full p-2 border rounded-md bg-white text-gray-800 cursor-pointer flex items-center justify-between ${!selectedVillage ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300'}`}
            >
              <span>{selectedGrid || '全部网格'}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>


      
      {/* 检查记录列表 */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 bg-white mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-medium">检查记录</h2>
              <div className="flex gap-4 items-center flex-col sm:flex-row w-full sm:w-auto">
                {/* 时间筛选 */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-36 p-2 border border-gray-300 rounded-md bg-white text-gray-800 text-sm"
                    placeholder="开始日期"
                  />
                  <span className="text-gray-500 flex items-center">至</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-36 p-2 border border-gray-300 rounded-md bg-white text-gray-800 text-sm"
                    placeholder="结束日期"
                    min={startDate}
                  />
                </div>
                
                {/* 小区筛选 */}
                <div className="w-full sm:w-64 mt-2 sm:mt-0">
                  <div
                    onClick={() => openSelector('community')}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 cursor-pointer flex items-center justify-between"
                  >
                    <span>{selectedCommunity || '全部小区'}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <div 
              key={record.id} 
              className="mx-4 my-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRecordClick(record)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-medium">{record.community}</h3>
                    <p className="text-sm text-gray-500">{record.village} | {record.district}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${
                      record.score >= 90 ? 'text-green-600' :
                      record.score >= 80 ? 'text-blue-600' :
                      record.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {record.score}
                    </span>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">检查人: {record.inspector}</span>
                  <span className="text-xs text-gray-500">检查时间: {record.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <p>暂无检查记录</p>
          </div>
        )}
      </div>
      
      {/* 底部新建检查按钮 - 固定在底部 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40">
        <button 
          onClick={handleNewInspection}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-md flex items-center justify-center"
        >
          <Plus size={18} className="mr-2" />
          新建检查
        </button>
      </div>
      
      {/* 扣分详情模态框 */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-xl overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">检查详情 - {selectedRecord.community}</h3>
              <button onClick={handleCloseModal} className="p-1">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">总分</p>
                  <p className="text-2xl font-bold text-green-600">{selectedRecord.score}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">扣分</p>
                  <p className="text-2xl font-bold text-red-600">
                    {100 - selectedRecord.score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">检查人</p>
                  <p className="text-2xl font-medium text-gray-700">{selectedRecord.inspector}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="p-4">
                <h4 className="text-base font-medium mb-3">扣分明细</h4>
                
                {selectedRecord.deductions.length > 0 ? (
                  // 按分类分组显示扣分项目
                  Array.from(new Set(selectedRecord.deductions.map(d => d.category))).map(category => {
                    const categoryDeductions = selectedRecord.deductions.filter(d => d.category === category);
                    const categoryTotal = categoryDeductions.reduce((sum, d) => sum + d.score, 0);
                    
                    return (
                      <div key={category} className="mb-4">
                        <div 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(category);
                          }}
                        >
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center">
                            <span className="text-sm text-red-600 mr-2">{categoryTotal}分</span>
                            {expandedCategories.includes(category) ? (
                              <ChevronUp size={16} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {expandedCategories.includes(category) && (
                          <div className="ml-4 mt-2 space-y-2">
                            {categoryDeductions.map(item => (
                              <div 
                                key={item.id} 
                                className="p-3 border-l-2 border-red-500 bg-red-50 rounded-r-md"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm flex-1">{item.item}</span>
                                  <span className="text-sm font-medium text-red-600 ml-2">-{item.score}分</span>
                                </div>
                                {item.images && item.images.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                      {item.images.map((image, imgIndex) => (
                                        <div
                                          key={imgIndex}
                                          className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors bg-gray-100"
                                          onClick={() => handleImagePreview(item.images!, imgIndex)}
                                        >
                                          <img
                                            src={image}
                                            alt={`${item.item} - 图片 ${imgIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onClick={() => handleImagePreview(item.images!, imgIndex)}
                                            onLoad={(e) => {
                                              // 图片加载成功，移除背景色
                                              const container = (e.target as HTMLImageElement).parentElement;
                                              if (container) {
                                                container.classList.remove('bg-gray-100');
                                              }
                                            }}
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              const container = target.parentElement;
                                              // 使用base64占位图（垃圾相关）
                                              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Cg%3E%3Crect x='80' y='120' width='120' height='140' rx='8' fill='%239ca3af'/%3E%3Crect x='200' y='120' width='120' height='140' rx='8' fill='%239ca3af'/%3E%3Crect x='140' y='280' width='120' height='60' rx='8' fill='%236b7280'/%3E%3C/g%3E%3Ctext x='50%25' y='380' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3E图片加载失败%3C/text%3E%3C/svg%3E";
                                              target.onerror = null; // 防止无限循环
                                              if (container) {
                                                container.classList.add('bg-gray-100');
                                              }
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                            <ZoomIn size={16} className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <ImageIcon size={12} className="mr-1" />
                                      {item.images.length}张照片 - 点击查看大图
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-center items-center p-8 text-gray-500">
                    <p>暂无扣分记录</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 固定在底部的查看该小区所有检查记录按钮 */}
            <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 p-4 z-50">
              <button
                onClick={() => {
                  // 关闭当前模态框
                  handleCloseModal();
                  // 筛选该小区的所有检查记录
                  setSelectedCommunity(selectedRecord.community);
                  // 隐藏统计信息和图表
                  setShowStats(false);
                }}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-md flex items-center justify-center"
              >
                查看该小区所有检查记录
              </button>
            </div>
            
            <div className="p-4 border-t border-gray-200 pb-24">
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗选择器 */}
      {selectorVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">{selectorTitle}</h3>
              <button onClick={closeSelector} className="p-1">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {/* 全部选项 */}
              <div
                key="all"
                className={`p-4 border-b border-gray-100 ${getCurrentSelectedValue() === '' ? 'bg-green-50' : 'bg-white'}`}
                onClick={() => selectItem('')}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${getCurrentSelectedValue() === '' ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                  >
                    {currentSelectorType === 'village' ? '全部村社' : currentSelectorType === 'grid' ? '全部网格' : '全部小区'}
                  </span>
                  {getCurrentSelectedValue() === '' && <ChevronRight size={16} className="text-green-600" />}
                </div>
              </div>
              {/* 其他选项 */}
              {selectorData.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 border-b border-gray-100 ${getCurrentSelectedValue() === item ? 'bg-green-50' : 'bg-white'}`}
                  onClick={() => selectItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${getCurrentSelectedValue() === item ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                    >
                      {item}
                    </span>
                    {getCurrentSelectedValue() === item && <ChevronRight size={16} className="text-green-600" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <button
                onClick={closeSelector}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {previewImage && selectedRecord && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={handleCloseImagePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* 关闭按钮 */}
            <button
              onClick={handleCloseImagePreview}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>

            {/* 图片 */}
            <img
              src={previewImage}
              alt="预览"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // 使用base64占位图（垃圾相关）
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%231f2937'/%3E%3Cg%3E%3Crect x='200' y='150' width='200' height='250' rx='12' fill='%236b7280'/%3E%3Crect x='400' y='150' width='200' height='250' rx='12' fill='%236b7280'/%3E%3Crect x='280' y='420' width='240' height='80' rx='12' fill='%234b5563'/%3E%3C/g%3E%3Ctext x='50%25' y='560' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23ffffff'%3E图片加载失败%3C/text%3E%3C/svg%3E";
                target.onerror = null; // 防止无限循环
              }}
            />

            {/* 导航按钮（如果有多张图片） */}
            {(() => {
              // 找到当前图片所属的扣分项
              const currentDeduction = selectedRecord.deductions.find(d => 
                d.images && d.images.includes(previewImage)
              );
              
              if (currentDeduction && currentDeduction.images && currentDeduction.images.length > 1) {
                return (
                  <>
                    {currentImageIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage(currentDeduction.images!);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                      >
                        <ChevronDown size={24} className="rotate-90" />
                      </button>
                    )}
                    {currentImageIndex < currentDeduction.images.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage(currentDeduction.images!);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                      >
                        <ChevronDown size={24} className="-rotate-90" />
                      </button>
                    )}
                    {/* 图片计数器 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} / {currentDeduction.images.length}
                    </div>
                  </>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarbageInspectionListPage;