import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BarChart3, AlertTriangle, Trash2, CheckCircle2, User, Truck, Recycle, FileText, Clock, RefreshCw, Download, Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

// 定义数据接口
interface DailySummary {
  date: string;
  taskCompletion: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
  };
  hazardDiscovery: {
    total: number;
    resolved: number;
    pending: number;
    byType: {
      type: string;
      count: number;
    }[];
  };
  garbageClassification: {
    total: number;
    passRate: number;
    excellent: number;
    good: number;
    poor: number;
  };
  constructionWaste: {
    total: number;
    reported: number;
    inTransit: number;
    completed: number;
  };
  personnelCheckIn: {
    total: number;
    checkedIn: number;
    late: number;
    absent: number;
  };
  keyInsights: string[];
  recommendations: string[];
}

// 模拟数据生成函数
const generateMockSummary = (date: string): DailySummary => {
  // 基础数据
  const baseTaskCompletion = {
    total: 120,
    completed: 95,
    pending: 15,
    inProgress: 10,
    completionRate: 79.2
  };
  
  const baseHazardDiscovery = {
    total: 25,
    resolved: 18,
    pending: 7,
    byType: [
      { type: '占道经营', count: 8 },
      { type: '垃圾分类', count: 6 },
      { type: '违停车辆', count: 5 },
      { type: '工地扩尘', count: 3 },
      { type: '其他', count: 3 }
    ]
  };
  
  const baseGarbageClassification = {
    total: 50,
    passRate: 88,
    excellent: 25,
    good: 19,
    poor: 6
  };
  
  const baseConstructionWaste = {
    total: 30,
    reported: 30,
    inTransit: 8,
    completed: 22
  };
  
  const basePersonnelCheckIn = {
    total: 45,
    checkedIn: 42,
    late: 2,
    absent: 1
  };
  
  // 生成随机波动
  const randomVariation = (base: number, range: number) => {
    return Math.round(base + (Math.random() * range * 2 - range));
  };
  
  // 生成AI洞察和建议
  const generateInsights = () => {
    const insights = [
      '今日任务完成率较昨日提升5.2%，主要得益于序化管理任务的高效执行',
      '垃圾分类检查通过率达到88%，较上周提升3个百分点',
      '建筑垃圾报备数量较昨日增加12%，可能与近期建筑工地开工增加有关',
      '人员签到率保持在93.3%，整体出勤情况良好',
      '隐患发现数量较昨日减少15%，城市环境状况有所改善'
    ];
    
    return insights.sort(() => Math.random() - 0.5).slice(0, 3);
  };
  
  const generateRecommendations = () => {
    const recommendations = [
      '建议加强对占道经营的整治力度，特别是商业街区域',
      '垃圾分类检查中发现的问题主要集中在商业区，建议增加该区域的检查频次',
      '建筑垃圾运输车辆在晚高峰时段容易造成交通拥堵，建议调整部分运输时间',
      '人员签到系统存在部分延迟问题，建议优化系统性能',
      '建议对完成率较低的区域进行专项分析，找出问题原因并制定改进措施'
    ];
    
    return recommendations.sort(() => Math.random() - 0.5).slice(0, 3);
  };
  
  return {
    date,
    taskCompletion: {
      ...baseTaskCompletion,
      total: randomVariation(baseTaskCompletion.total, 20),
      completed: randomVariation(baseTaskCompletion.completed, 15),
      pending: randomVariation(baseTaskCompletion.pending, 5),
      inProgress: randomVariation(baseTaskCompletion.inProgress, 5),
      completionRate: Math.round((randomVariation(baseTaskCompletion.completed, 15) / randomVariation(baseTaskCompletion.total, 20)) * 100 * 10) / 10
    },
    hazardDiscovery: {
      ...baseHazardDiscovery,
      total: randomVariation(baseHazardDiscovery.total, 10),
      resolved: randomVariation(baseHazardDiscovery.resolved, 8),
      pending: randomVariation(baseHazardDiscovery.pending, 5)
    },
    garbageClassification: {
      ...baseGarbageClassification,
      total: randomVariation(baseGarbageClassification.total, 15),
      passRate: Math.round((randomVariation(baseGarbageClassification.excellent + baseGarbageClassification.good, 10) / randomVariation(baseGarbageClassification.total, 15)) * 100),
      excellent: randomVariation(baseGarbageClassification.excellent, 10),
      good: randomVariation(baseGarbageClassification.good, 8),
      poor: randomVariation(baseGarbageClassification.poor, 5)
    },
    constructionWaste: {
      ...baseConstructionWaste,
      total: randomVariation(baseConstructionWaste.total, 10),
      reported: randomVariation(baseConstructionWaste.reported, 10),
      inTransit: randomVariation(baseConstructionWaste.inTransit, 5),
      completed: randomVariation(baseConstructionWaste.completed, 8)
    },
    personnelCheckIn: {
      ...basePersonnelCheckIn,
      total: randomVariation(basePersonnelCheckIn.total, 5),
      checkedIn: randomVariation(basePersonnelCheckIn.checkedIn, 4),
      late: randomVariation(basePersonnelCheckIn.late, 2),
      absent: randomVariation(basePersonnelCheckIn.absent, 1)
    },
    keyInsights: generateInsights(),
    recommendations: generateRecommendations()
  };
};

const AIDailySummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  // 加载总结数据
  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      // 模拟API调用延迟
      setTimeout(() => {
        const mockSummary = generateMockSummary(selectedDate);
        setSummary(mockSummary);
        setLoading(false);
      }, 500);
    };
    
    loadSummary();
  }, [selectedDate]);
  
  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 处理日期变更
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
  
  // 下载报告
  const handleDownloadReport = () => {
    if (!summary) return;
    
    const reportContent = `
城市管理系统每日总结报告
日期: ${summary.date}

一、任务完成情况
- 总任务数: ${summary.taskCompletion.total}
- 已完成: ${summary.taskCompletion.completed}
- 进行中: ${summary.taskCompletion.inProgress}
- 待处理: ${summary.taskCompletion.pending}
- 完成率: ${summary.taskCompletion.completionRate}%

二、隐患发现情况
- 总隐患数: ${summary.hazardDiscovery.total}
- 已解决: ${summary.hazardDiscovery.resolved}
- 待处理: ${summary.hazardDiscovery.pending}
- 隐患类型分布:
${summary.hazardDiscovery.byType.map(item => `  - ${item.type}: ${item.count}`).join('\n')}

三、垃圾分类完成情况
- 检查总数: ${summary.garbageClassification.total}
- 通过率: ${summary.garbageClassification.passRate}%
- 优秀: ${summary.garbageClassification.excellent}
- 良好: ${summary.garbageClassification.good}
- 不合格: ${summary.garbageClassification.poor}

四、建筑垃圾报备情况
- 总报备数: ${summary.constructionWaste.total}
- 已报备: ${summary.constructionWaste.reported}
- 运输中: ${summary.constructionWaste.inTransit}
- 已完成: ${summary.constructionWaste.completed}

五、人员签到情况
- 总人数: ${summary.personnelCheckIn.total}
- 已签到: ${summary.personnelCheckIn.checkedIn}
- 迟到: ${summary.personnelCheckIn.late}
- 缺勤: ${summary.personnelCheckIn.absent}

六、AI关键洞察
${summary.keyInsights.map(insight => `- ${insight}`).join('\n')}

七、AI建议
${summary.recommendations.map(recommendation => `- ${recommendation}`).join('\n')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `城市管理系统每日总结报告_${summary.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6 overflow-x-hidden">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:bg-[#00e5ff] text-white transition-colors mr-4 shadow-lg"
            aria-label="返回"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent">AI每日总结报告</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-[#00e5ff]" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-[#0e2a47] border border-[#1e4976] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
            />
          </div>
          <button 
            onClick={handleDownloadReport}
            disabled={!summary}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] hover:bg-gradient-to-r from-[#00d4e5] to-[#00e6a5] text-[#0e2a47] hover:shadow-lg hover:shadow-[#00e5ff]/30 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            下载报告
          </button>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-6 rounded-lg border border-[#1e4976] shadow-xl shadow-[#00e5ff]/10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索报告内容"
              className="w-full pl-10 pr-4 py-2 border border-[#1e4976] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1e4976] rounded-md bg-[#0e2a47] hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
            >
              <Filter size={18} className="text-[#00e5ff]" />
              <span>筛选</span>
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        
        {/* 筛选面板 */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-[#1e4976]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">报告类型</label>
                <select className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white">
                  <option value="all">全部</option>
                  <option value="daily">每日报告</option>
                  <option value="weekly">每周报告</option>
                  <option value="monthly">月度报告</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">部门</label>
                <select className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white">
                  <option value="all">全部部门</option>
                  <option value="urban">城市管理</option>
                  <option value="sequence">序化管理</option>
                  <option value="environment">环境管理</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">状态</label>
                <select className="w-full px-3 py-2 border border-[#1e4976] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5ff] bg-[#0a1628] text-white">
                  <option value="all">全部状态</option>
                  <option value="normal">正常</option>
                  <option value="warning">警告</option>
                  <option value="critical">严重</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5ff]"></div>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* 总体概况 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 任务完成情况 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">任务完成情况</h2>
                <BarChart3 size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">总任务数</span>
                  <span className="text-white font-medium">{summary.taskCompletion.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已完成</span>
                  <span className="text-green-400 font-medium">{summary.taskCompletion.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">进行中</span>
                  <span className="text-yellow-400 font-medium">{summary.taskCompletion.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">待处理</span>
                  <span className="text-blue-400 font-medium">{summary.taskCompletion.pending}</span>
                </div>
                <div className="pt-3 border-t border-[#1e4976]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">完成率</span>
                    <span className="text-white font-bold">{summary.taskCompletion.completionRate}%</span>
                  </div>
                  <div className="w-full bg-[#1e4976] rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] h-2 rounded-full" 
                      style={{ width: `${summary.taskCompletion.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 隐患发现情况 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">隐患发现情况</h2>
                <AlertTriangle size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">总隐患数</span>
                  <span className="text-white font-medium">{summary.hazardDiscovery.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已解决</span>
                  <span className="text-green-400 font-medium">{summary.hazardDiscovery.resolved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">待处理</span>
                  <span className="text-yellow-400 font-medium">{summary.hazardDiscovery.pending}</span>
                </div>
                <div className="pt-3 border-t border-[#1e4976]">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">隐患类型分布</h3>
                  <div className="space-y-2">
                    {summary.hazardDiscovery.byType.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">{item.type}</span>
                        <span className="text-sm text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 人员签到情况 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">人员签到情况</h2>
                <User size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">总人数</span>
                  <span className="text-white font-medium">{summary.personnelCheckIn.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已签到</span>
                  <span className="text-green-400 font-medium">{summary.personnelCheckIn.checkedIn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">迟到</span>
                  <span className="text-yellow-400 font-medium">{summary.personnelCheckIn.late}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">缺勤</span>
                  <span className="text-red-400 font-medium">{summary.personnelCheckIn.absent}</span>
                </div>
                <div className="pt-3 border-t border-[#1e4976]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">签到率</span>
                    <span className="text-white font-bold">{Math.round((summary.personnelCheckIn.checkedIn / summary.personnelCheckIn.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#1e4976] rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] h-2 rounded-full" 
                      style={{ width: `${(summary.personnelCheckIn.checkedIn / summary.personnelCheckIn.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 垃圾分类和建筑垃圾 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 垃圾分类完成情况 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">垃圾分类完成情况</h2>
                <Recycle size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">检查总数</span>
                  <span className="text-white font-medium">{summary.garbageClassification.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">通过率</span>
                  <span className="text-white font-bold">{summary.garbageClassification.passRate}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#1e4976]/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">优秀</p>
                    <p className="text-xl font-bold text-green-400">{summary.garbageClassification.excellent}</p>
                  </div>
                  <div className="bg-[#1e4976]/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">良好</p>
                    <p className="text-xl font-bold text-blue-400">{summary.garbageClassification.good}</p>
                  </div>
                  <div className="bg-[#1e4976]/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">不合格</p>
                    <p className="text-xl font-bold text-red-400">{summary.garbageClassification.poor}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 建筑垃圾报备情况 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">建筑垃圾报备情况</h2>
                <Truck size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">总报备数</span>
                  <span className="text-white font-medium">{summary.constructionWaste.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已报备</span>
                  <span className="text-blue-400 font-medium">{summary.constructionWaste.reported}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">运输中</span>
                  <span className="text-yellow-400 font-medium">{summary.constructionWaste.inTransit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">已完成</span>
                  <span className="text-green-400 font-medium">{summary.constructionWaste.completed}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI洞察和建议 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI关键洞察 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">AI关键洞察</h2>
                <FileText size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                {summary.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 bg-[#00e5ff]/20 p-1 rounded-full">
                      <CheckCircle2 size={16} className="text-[#00e5ff]" />
                    </div>
                    <p className="text-gray-200">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI建议 */}
            <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-xl shadow-[#00e5ff]/10 border border-[#1e4976] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00e5ff]">AI建议</h2>
                <RefreshCw size={24} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-3">
                {summary.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 bg-[#00ffb2]/20 p-1 rounded-full">
                      <Clock size={16} className="text-[#00ffb2]" />
                    </div>
                    <p className="text-gray-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">暂无数据</p>
        </div>
      )}
    </div>
  );
};

export default AIDailySummaryPage;