import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, Clock, BarChart2, PieChart as PieChartIcon, 
  MapPin, Activity, Filter, Download, Building, Calendar, Shield,
  AlertTriangle, Target, ArrowUpRight, Info, ArrowLeft
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

// 定义数据接口
interface TaskData {
  type: string;
  completed: number;
  processing: number;
  pending: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface AreaData {
  name: string;
  tasks: number;
  issues: number;
  completionRate: number;
}

interface TrendData {
  date: string;
  sequence: number;
  city: number;
}

interface DrillDownData {
  type: string;
  title: string;
  details: any[];
}



const DashboardPage: React.FC = () => {
  // 状态管理
  const [isDrillDown, setIsDrillDown] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData>({
    type: '',
    title: '',
    details: []
  });
  
  // 处理数据点击下钻 - 在函数内部直接生成数据
  const handleDataClick = useCallback((type: string, title: string) => {
    let details = [];
    
    // 直接在函数内部定义所需的数据
    const areas = ['良渚社区', '荀山村', '石桥村', '新港村', '安溪村'];
    const categories = ['广告牌', '违挡', '沿街店铺', '占道经营', '环境卫生'];
    const priorities = ['一般', '紧急', '一般', '紧急', '一般'];
    const statuses = ['待处理', '处理中', '已处理', '已验收'];
    const types = ['紧急问题', '待处理问题', '一般问题', '已处理'];
    const descriptions = ['广告牌破损', '占道经营', '乱堆乱放', '绿化损坏', '路灯故障'];
    const streets = ['良渚路', '东西大道', '古墩路', '莫干山路', '文一西路'];
    const trends = ['上升', '下降', '持平'];
    
    switch (type) {
      case 'monthCompleted':
        details = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          area: areas[i],
          count: Math.floor(Math.random() * 20) + 10,
          date: `2024-01-${String(i + 10).padStart(2, '0')}`,
          status: '已处理'
        }));
        break;
      case 'issuesFound':
        details = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          area: areas[i],
          count: Math.floor(Math.random() * 30) + 20,
          category: categories[i],
          priority: priorities[i]
        }));
        break;
      case 'pendingIssues':
        details = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          area: areas[i],
          count: Math.floor(Math.random() * 15) + 5,
          category: categories[i],
          daysPending: Math.floor(Math.random() * 7) + 1
        }));
        break;
      case 'processingRate':
        details = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          area: areas[i],
          rate: Math.floor(Math.random() * 30) + 70,
          completed: Math.floor(Math.random() * 50) + 30,
          total: Math.floor(Math.random() * 20) + 80
        }));
        break;
      case 'managementDimensions':
        details = [
          { id: 1, type: '序化管理', count: 200, rate: 85 },
          { id: 2, type: '城市管理', count: 308, rate: 78 }
        ];
        break;
      case 'functionCategory':
        details = [
          { id: 1, name: '广告牌', count: 89, rate: 85, trend: trends[0] },
          { id: 2, name: '违挡', count: 67, rate: 72, trend: trends[1] },
          { id: 3, name: '沿街店铺', count: 54, rate: 68, trend: trends[2] },
          { id: 4, name: '占道经营', count: 42, rate: 75, trend: trends[0] },
          { id: 5, name: '环境卫生', count: 88, rate: 90, trend: trends[1] },
          { id: 6, name: '市政设施', count: 76, rate: 82, trend: trends[0] },
          { id: 7, name: '绿化管理', count: 59, rate: 70, trend: trends[2] },
          { id: 8, name: '交通秩序', count: 63, rate: 78, trend: trends[1] },
          { id: 9, name: '噪音污染', count: 38, rate: 65, trend: trends[0] },
          { id: 10, name: '违规搭建', count: 27, rate: 60, trend: trends[2] },
          { id: 11, name: '垃圾分类', count: 71, rate: 85, trend: trends[1] },
          { id: 12, name: '其他问题', count: 45, rate: 70, trend: trends[0] }
        ];
        break;
      case 'mapPoints':
        details = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          area: streets[i % 5],
          type: types[Math.floor(Math.random() * 4)],
          description: descriptions[i % 5],
          reportedTime: `2024-01-${String(i + 5).padStart(2, '0')} 1${String(i % 2)}:${String(i * 6).padStart(2, '0')}`,
          status: statuses[Math.floor(Math.random() * 4)]
        }));
        break;
      case 'inspectionStats':
        details = [
          { id: 1, date: '周一', tasks: 120, completed: 108, rate: 90, inspectors: 4 },
          { id: 2, date: '周二', tasks: 145, completed: 137, rate: 95, inspectors: 5 },
          { id: 3, date: '周三', tasks: 167, completed: 159, rate: 95, inspectors: 6 },
          { id: 4, date: '周四', tasks: 132, completed: 112, rate: 85, inspectors: 4 },
          { id: 5, date: '周五', tasks: 148, completed: 142, rate: 96, inspectors: 5 },
          { id: 6, date: '周六', tasks: 89, completed: 89, rate: 100, inspectors: 3 },
          { id: 7, date: '周日', tasks: 67, completed: 60, rate: 90, inspectors: 2 }
        ];
        break;
      case 'currentStatus':
        details = [
          { id: 1, date: '01-01', emergency: 8, pending: 15, total: 25 },
          { id: 2, date: '01-02', emergency: 6, pending: 18, total: 30 },
          { id: 3, date: '01-03', emergency: 5, pending: 12, total: 22 },
          { id: 4, date: '01-04', emergency: 9, pending: 20, total: 35 },
          { id: 5, date: '01-05', emergency: 7, pending: 15, total: 28 },
          { id: 6, date: '01-06', emergency: 4, pending: 10, total: 20 },
          { id: 7, date: '01-07', emergency: 6, pending: 12, total: 25 }
        ];
        break;
      case 'inspectionResult':
        details = [
          { id: 1, name: '已处理', value: 392, rate: 48, color: '#00e5ff' },
          { id: 2, name: '待处理', value: 30, rate: 4, color: '#ffc400' },
          { id: 3, name: '已验收', value: 378, rate: 47, color: '#00ffb2' }
        ];
        break;
      case 'areas':
        details = [
          { id: 1, name: '良渚社区', tasks: 125, issues: 89, completionRate: 92, status: '优秀' },
          { id: 2, name: '荀山村', tasks: 98, issues: 67, completionRate: 87, status: '良好' },
          { id: 3, name: '石桥村', tasks: 112, issues: 78, completionRate: 90, status: '优秀' },
          { id: 4, name: '新港村', tasks: 87, issues: 56, completionRate: 85, status: '良好' },
          { id: 5, name: '安溪村', tasks: 103, issues: 72, completionRate: 89, status: '良好' }
        ];
        break;
      default:
        details = [];
    }
    
    setDrillDownData({ type, title, details });
    setIsDrillDown(true);
  }, []);
  
  // 关闭下钻详情
  const handleCloseDrillDown = useCallback(() => {
    setIsDrillDown(false);
    setDrillDownData({ type: '', title: '', details: [] });
  }, []);

  // 模拟数据 - 任务完成情况
  const taskData: TaskData[] = [
    { type: '序化管理', completed: 128, processing: 36, pending: 15 },
    { type: '城市管理', completed: 215, processing: 52, pending: 28 }
  ];

  // 模拟数据 - 分类占比
  const categoryData: CategoryData[] = [
    { name: '垃圾分类', value: 35, color: '#00b0ff' },
    { name: '道路清洁', value: 25, color: '#00ffb2' },
    { name: '市政绿化', value: 20, color: '#ffc400' },
    { name: '工地监管', value: 15, color: '#ff009d' },
    { name: '其他', value: 5, color: '#76ff03' }
  ];

  // 模拟数据 - 整改率
  const rectificationData: CategoryData[] = [
    { name: '已完成', value: 85, color: '#00ffb2' },
    { name: '进行中', value: 12, color: '#ffc400' },
    { name: '待处理', value: 3, color: '#ff0055' }
  ];

  // 模拟数据 - 验收情况
  const inspectionData: CategoryData[] = [
    { name: '验收通过', value: 88, color: '#00ffb2' },
    { name: '验收不通过', value: 12, color: '#ff0055' }
  ];

  // 模拟区域数据
  const areaData: AreaData[] = [
    { name: '良渚社区', tasks: 86, issues: 12, completionRate: 94 },
    { name: '安溪社区', tasks: 75, issues: 8, completionRate: 91 },
    { name: '运河村', tasks: 65, issues: 15, completionRate: 85 },
    { name: '荀山村', tasks: 58, issues: 10, completionRate: 89 },
    { name: '良渚村', tasks: 72, issues: 14, completionRate: 86 }
  ];

  // 模拟趋势数据
  const trendData: TrendData[] = [
    { date: '1月', sequence: 85, city: 120 },
    { date: '2月', sequence: 92, city: 135 },
    { date: '3月', sequence: 105, city: 150 },
    { date: '4月', sequence: 115, city: 170 },
    { date: '5月', sequence: 128, city: 215 },
    { date: '6月', sequence: 135, city: 230 }
  ];

  // 数据来源说明
  const dataSourceNote = '数据来源于城市管理系统执行端';

  // 场所类型数据
  const placeTypeData: CategoryData[] = [
    { name: '公园广场', value: 415, color: '#00b0ff' },
    { name: '学校', value: 182, color: '#00ffb2' },
    { name: '医院', value: 37, color: '#ffc400' },
    { name: '商超', value: 673, color: '#ff009d' },
    { name: '社区', value: 704, color: '#76ff03' }
  ];

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // 总计计算
  const totalTasks = taskData.reduce((sum, item) => sum + item.completed + item.processing + item.pending, 0);
  const completedTasks = taskData.reduce((sum, item) => sum + item.completed, 0);
  const processingTasks = 25;
  const pendingTasks = taskData.reduce((sum, item) => sum + item.pending, 0);
  const completionRate = 98.7;
  const totalSafetyEntities = 456;
  const thisMonthDiscovered = 36318;
  const criticalIssues = 56;
  const pendingRectification = 124;
  const rectificationRate = 95.8;
  const acceptanceRate = 92.3;
  const checkTasksTotal = 2541;
  const rectificationIssues = 489;
  const totalIssues = 36374;

  return (
    <div className="bg-[#081c2f] min-h-screen text-white font-sans">
      {/* 顶部标题栏 */}
      <div className="border-b border-[#1e4976] px-6 py-3 bg-[#091e33] bg-opacity-80">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-[#00e5ff] hover:text-white transition-colors">
              <span className="inline-flex items-center">
                <ArrowLeft size={18} className="mr-1" /> 返回主页
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[#00e5ff] tracking-wider">良渚街道城市管理动态管控大屏</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-[#00e5ff]">
                {new Date().toLocaleDateString('zh-CN')} {new Date().toLocaleTimeString('zh-CN')}
                <span className="text-sm text-white opacity-60 ml-2">{dataSourceNote}</span>
              </div>
            <div className="relative">
              <select 
                className="pl-3 pr-8 py-1.5 rounded-md bg-[#1e3a5f] border border-[#1e4976] text-white focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
              >
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="quarter">本季度</option>
              </select>
              <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#00e5ff] pointer-events-none" />
            </div>
            <button className="flex items-center text-[#00e5ff] hover:text-[#00ffff] text-sm border border-[#1e4976] px-3 py-1.5 rounded-md hover:bg-[#1e3a5f]">
              <Download size={16} className="mr-1" /> 导出报表
            </button>
          </div>
        </div>
      </div>

      {/* 关键指标行 */}
      <div className="grid grid-cols-4 px-6 py-4 bg-[#081c2f] border-b border-[#1e4976]">
        <div 
          className="flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e3a5f] p-3 rounded-lg transition-colors"
          onClick={() => handleDataClick('monthCompleted', '本月已处理详情')}
        >
          <div className="text-2xl font-bold text-[#00e5ff] mb-1">{thisMonthDiscovered}</div>
          <div className="text-sm text-white opacity-80">本月已处理</div>
        </div>
        <div 
          className="flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e3a5f] p-3 rounded-lg transition-colors"
          onClick={() => handleDataClick('issuesFound', '发现问题详情')}
        >
          <div className="text-2xl font-bold text-[#ff0055] mb-1">{criticalIssues}</div>
          <div className="text-sm text-white opacity-80">发现问题数</div>
        </div>
        <div 
          className="flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e3a5f] p-3 rounded-lg transition-colors"
          onClick={() => handleDataClick('pendingIssues', '待处理问题详情')}
        >
          <div className="text-2xl font-bold text-[#ffc400] mb-1">{pendingRectification}</div>
          <div className="text-sm text-white opacity-80">待处理问题数</div>
        </div>
        <div 
          className="flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e3a5f] p-3 rounded-lg transition-colors"
          onClick={() => handleDataClick('processingRate', '总处理率详情')}
        >
          <div className="text-2xl font-bold text-[#00ffb2] mb-1">{completionRate}%</div>
          <div className="text-sm text-white opacity-80">总处理率</div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-6">
        {/* 统计概览卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute transform rotate-45 bg-gradient-to-r from-[#00e5ff] to-[#00b0ff] text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[170px] text-center">
                总数
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">管理区域总数</h3>
            <div className="text-3xl font-bold text-[#00e5ff]">{totalSafetyEntities}</div>
          </div>

          <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute transform rotate-45 bg-gradient-to-r from-[#00ffb2] to-[#00e5ff] text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[170px] text-center">
                处理率
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">问题处理率</h3>
            <div className="text-3xl font-bold text-[#00ffb2]">{completionRate}%</div>
          </div>

          <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute transform rotate-45 bg-gradient-to-r from-[#ffc400] to-[#ff6600] text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[170px] text-center">
                检查中
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">检查中任务</h3>
            <div className="text-3xl font-bold text-[#ffc400]">{processingTasks}</div>
          </div>

          <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute transform rotate-45 bg-gradient-to-r from-[#ff0055] to-[#ff009d] text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[170px] text-center">
                紧急
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">紧急问题数</h3>
            <div className="text-3xl font-bold text-[#ff0055]">{criticalIssues}</div>
          </div>
        </div>

        {/* 中间地图区域和两侧统计卡片 */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {/* 左侧统计卡片 */}
          <div className="col-span-1 space-y-4">
            {/* 管理维度统计 */}
            <div 
              className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] cursor-pointer hover:border-[#00e5ff] transition-all"
              onClick={() => handleDataClick('managementDimensions', '管理维度统计详情')}
            >
              <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
                <Building size={16} className="mr-2" /> 管理维度统计
              </h3>
              <div className="h-[250px] flex flex-col">
                <div className="flex-1 flex justify-center items-center">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={[
                        { name: '序化管理', value: 45 },
                        { name: '城市管理', value: 55 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00b0ff', '#00ffb2'][index % 2]} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="border-t border-[#1e4976] pt-3 mt-2">
                  <div className="text-center text-white font-bold">总覆盖率 88%</div>
                </div>
              </div>
            </div>
            
            {/* 数据来源说明卡片 */}
            <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976]">
              <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
                <Info size={16} className="mr-2" /> 数据来源
              </h3>
              <div className="text-center py-8 text-white">
                <div className="text-lg font-semibold">{dataSourceNote}</div>
                <div className="text-sm opacity-70 mt-2">实时同步更新</div>
              </div>
            </div>
          </div>
          
          {/* 地图区域 */}
          <div 
            className="col-span-3 bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] relative cursor-pointer hover:border-[#00e5ff] transition-all"
            onClick={() => handleDataClick('mapPoints', '问题点位详情')}
          >
            <h2 className="text-lg font-semibold text-[#00e5ff] mb-4 flex items-center">
              <MapPin size={18} className="mr-2" /> 良渚街道地图
              <span className="ml-2 text-white text-sm">管理区域总数: <span className="text-[#00e5ff]">{totalSafetyEntities}</span>处</span>
            </h2>
            {/* 地图占位符 - 使用SVG地图 */}
            <div className="relative aspect-[16/9] bg-[#081c2f] rounded-lg overflow-hidden border border-[#1e4976]">
              <svg width="100%" height="100%" viewBox="0 0 1000 550" className="relative z-10">
                {/* 地图网格背景 */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e4976" strokeWidth="0.5" opacity="0.2"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* 地图轮廓 - 良渚街道地图 */}
                <path d="M150,100 Q300,50 450,80 T700,70 Q850,60 900,150 T950,250 Q920,350 850,400 T700,450 Q550,480 400,460 T200,430 Q100,400 80,300 T100,180 Z" 
                  fill="#0a345c" stroke="#00e5ff" strokeWidth="2" opacity="0.8" />
                
                {/* 区域划分 */}
                <path d="M150,150 L350,120 L400,220 L250,280 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M350,120 L550,100 L600,200 L400,220 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M550,100 L750,80 L800,180 L600,200 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M250,280 L400,220 L450,320 L300,380 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M400,220 L600,200 L650,300 L450,320 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M600,200 L800,180 L850,280 L650,300 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M300,380 L450,320 L500,420 L350,440 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                <path d="M450,320 L650,300 L700,400 L500,420 Z" fill="#0c4a85" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                
                {/* 区域名称 */}
                <text x="275" y="190" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">良渚社区</text>
                <text x="475" y="155" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">安溪社区</text>
                <text x="675" y="140" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">运河村</text>
                <text x="325" y="320" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">荀山村</text>
                <text x="525" y="270" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">良渚村</text>
                <text x="725" y="240" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">大陆村</text>
                <text x="400" y="390" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">石桥村</text>
                <text x="575" y="365" textAnchor="middle" fill="#00e5ff" fontSize="14" fontWeight="bold">杜城村</text>
                
                {/* 问题点位标记 */}
                <g>
                  <circle cx="250" cy="170" r="10" fill="#ff0055" opacity="0.8">
                    <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="250" y="174" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">12</text>
                </g>
                
                <g>
                  <circle cx="450" cy="250" r="8" fill="#ff6600" opacity="0.8">
                    <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x="450" y="254" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">8</text>
                </g>
                
                <g>
                  <circle cx="650" cy="190" r="6" fill="#ffc400" opacity="0.8">
                    <animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="650" y="204" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">5</text>
                </g>
                
                <g>
                  <circle cx="320" cy="320" r="9" fill="#ff0055" opacity="0.8">
                    <animate attributeName="r" values="9;11;9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="320" y="324" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">15</text>
                </g>
                
                <g>
                  <circle cx="550" cy="350" r="7" fill="#ff6600" opacity="0.8">
                    <animate attributeName="r" values="7;9;7" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x="550" y="354" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">7</text>
                </g>
                
                {/* 发光效果 */}
                <circle cx="250" cy="170" r="20" fill="#ff0055" opacity="0.2" blur="5">
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="320" r="20" fill="#ff0055" opacity="0.2">
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
              
              {/* 图例 */}
              <div className="absolute bottom-4 right-4 bg-[#0e2a47] bg-opacity-90 p-3 rounded shadow-md z-20 border border-[#1e4976]">
                <div className="text-xs text-[#00e5ff] font-medium mb-2">问题点位图例</div>
                <div className="flex items-center mb-1 text-xs">
                  <div className="w-3 h-3 bg-[#ff0055] rounded-full mr-2"></div>
                  <span>紧急问题</span>
                </div>
                <div className="flex items-center mb-1 text-xs">
                  <div className="w-3 h-3 bg-[#ff6600] rounded-full mr-2"></div>
                  <span>重要问题</span>
                </div>
                <div className="flex items-center mb-1 text-xs">
                  <div className="w-3 h-3 bg-[#ffc400] rounded-full mr-2"></div>
                  <span>一般问题</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-[#00ffb2] rounded-full mr-2"></div>
                  <span>已处理</span>
                </div>
              </div>
              
              {/* 悬浮信息卡 - 示例 */}
              <div className="absolute top-4 left-4 bg-[#0e2a47] bg-opacity-90 p-3 rounded shadow-md z-20 border border-[#1e4976] max-w-xs">
                <div className="text-sm text-[#00e5ff] font-medium mb-2 flex items-center">
                  <Target size={14} className="mr-1" /> 实时监控
                </div>
                <div className="text-xs text-white space-y-1">
                  <div className="flex justify-between">
                    <span>今日新增隐患:</span>
                    <span className="text-[#ff0055] font-bold">48</span>
                  </div>
                  <div className="flex justify-between">
                    <span>今日整改完成:</span>
                    <span className="text-[#00ffb2] font-bold">63</span>
                  </div>
                  <div className="flex justify-between">
                    <span>出动检查人员:</span>
                    <span className="text-[#00e5ff] font-bold">128</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧统计卡片 */}
          <div className="col-span-1 space-y-4">
            {/* 右侧职能分类统计 */}
              <div 
                className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] h-full cursor-pointer hover:border-[#00e5ff] transition-all"
                onClick={() => handleDataClick('functionCategory', '职能分类统计详情')}
              >
                <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
                  <Filter size={16} className="mr-2" /> 职能分类统计
                </h3>
            <div className="h-[250px] overflow-y-auto pr-1">
              <div className="space-y-2">
                {[
                  { name: '广告牌', value: 258, color: '#00e5ff' },
                  { name: '违挡', value: 125, color: '#00ffb2' },
                  { name: '沿街店铺', value: 426, color: '#ffc400' },
                  { name: '城市绿化', value: 187, color: '#ff009d' },
                  { name: '墙体倒塌', value: 32, color: '#76ff03' },
                  { name: '修路开挖', value: 89, color: '#ff6600' },
                  { name: '流动摊贩', value: 378, color: '#9c27b0' },
                  { name: '地铁口管理', value: 142, color: '#3f51b5' },
                  { name: '人行道违停', value: 512, color: '#e91e63' },
                  { name: '出店经营', value: 385, color: '#4caf50' },
                  { name: '工地', value: 167, color: '#ff9800' },
                  { name: '市政设施管理巡查', value: 293, color: '#607d8b' }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="w-full bg-[#081c2f] rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ backgroundColor: item.color, width: `${(item.value / 512) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                </div>
                <div className="border-t border-[#1e4976] pt-3 mt-4">
                  <div className="text-center text-white font-bold">总问题数: 4257</div>
                </div>
              </div>
            </div>
            
            {/* 管理现状分析 */}
            <div 
              className="col-span-2 bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] cursor-pointer hover:border-[#00e5ff] transition-all"
              onClick={() => handleDataClick('currentStatus', '管理现状分析详情')}
            >
              <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
                <BarChart2 size={16} className="mr-2" /> 管理现状分析
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mt-2 mr-2"></div>
                  <div className="text-xs">
                    <div className="font-medium text-white">环境综合整治行动</div>
                    <div className="text-white opacity-70 mt-1">重点区域卫生清理、河道整治</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mt-2 mr-2"></div>
                  <div className="text-xs">
                    <div className="font-medium text-white">设施设备维护检查</div>
                    <div className="text-white opacity-70 mt-1">公共设施完好率检查与修复</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mt-2 mr-2"></div>
                  <div className="text-xs">
                    <div className="font-medium text-white">城市管理综合检查</div>
                    <div className="text-white opacity-70 mt-1">重点区域问题排查</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mt-2 mr-2"></div>
                  <div className="text-xs">
                    <div className="font-medium text-white">数字化管理系统升级</div>
                    <div className="text-white opacity-70 mt-1">提升执行端数据采集能力</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部图表区域 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 管理检查统计 */}
          <div 
            className="col-span-3 bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] cursor-pointer hover:border-[#00e5ff] transition-all"
            onClick={() => handleDataClick('inspectionStats', '管理检查统计详情')}
          >
            <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
              <Activity size={16} className="mr-2" /> 管理检查统计
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { title: '紧急问题', value: 56, icon: <AlertTriangle size={18} className="text-[#ff0055]" />, color: '#ff0055' },
                { title: '已处理问题', value: 36318, icon: <CheckCircle size={18} className="text-[#00ffb2]" />, color: '#00ffb2' },
                { title: '问题总数', value: 36374, icon: <BarChart2 size={18} className="text-[#00e5ff]" />, color: '#00e5ff' }
              ].map((item, index) => (
                <div key={index} className="bg-[#081c2f] rounded-lg p-3 border border-[#1e4976] text-center">
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <div className="text-xs text-white opacity-80 mb-1">{item.title}</div>
                  <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0e2a47', borderColor: '#1e4976', color: 'white' }}
                    itemStyle={{ color: '#00e5ff' }}
                  />
                  <Line type="monotone" dataKey="sequence" name="序化管理" stroke="#00b0ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="city" name="城市管理" stroke="#00ffb2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 处理与验收情况 */}
            <div 
              className="col-span-1 bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] cursor-pointer hover:border-[#00e5ff] transition-all"
              onClick={() => handleDataClick('inspectionResult', '处理与验收情况详情')}
            >
              <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
                <CheckCircle size={16} className="mr-2" /> 处理与验收情况
              </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-white opacity-80 mb-3 text-center">整改率</h4>
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rectificationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {rectificationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-center text-[#00ffb2] font-bold">85%</div>
              </div>
              <div>
                <h4 className="text-xs text-white opacity-80 mb-3 text-center">验收通过率</h4>
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inspectionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {inspectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-center text-[#00e5ff] font-bold">88%</div>
              </div>
            </div>
            <div className="mt-4 bg-[#081c2f] rounded-lg p-3 border border-[#1e4976]">
              <div className="text-xs text-white mb-2 flex justify-between items-center">
                <span>本周重点工作</span>
                <ArrowUpRight size={12} className="text-[#00e5ff]" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-white">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mr-2"></div>
                  <span>开展辖区城市管理综合检查</span>
                </div>
                <div className="flex items-center text-xs text-white">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mr-2"></div>
                  <span>完成56处紧急问题整改验收</span>
                </div>
                <div className="flex items-center text-xs text-white">
                  <div className="w-2 h-2 bg-[#00e5ff] rounded-full mr-2"></div>
                  <span>组织城市管理人员培训会议</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 区域数据表格 */}
        <div 
          className="mt-4 bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] cursor-pointer hover:border-[#00e5ff] transition-all"
          onClick={() => handleDataClick('areas', '各区域完成情况详情')}
        >
          <h3 className="text-base font-semibold text-[#00e5ff] mb-4 flex items-center">
            <Building size={16} className="mr-2" /> 各区域完成情况
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#1e4976]">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">区域名称</th>
                  <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">任务总数</th>
                  <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">隐患数</th>
                  <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">完成率</th>
                  <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="bg-[#0e2a47] divide-y divide-[#1e4976]">
                {areaData.map((area, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{area.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{area.tasks}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{area.issues}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-[#081c2f] rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${area.completionRate >= 90 ? 'bg-[#00ffb2]' : area.completionRate >= 85 ? 'bg-[#00e5ff]' : 'bg-[#ffc400]'}`}
                            style={{ width: `${area.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-white">{area.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${area.completionRate >= 90 ? 'bg-[#00ffb2] bg-opacity-20 text-[#00ffb2]' : area.completionRate >= 85 ? 'bg-[#00e5ff] bg-opacity-20 text-[#00e5ff]' : 'bg-[#ffc400] bg-opacity-20 text-[#ffc400]'}`}>
                        {area.completionRate >= 90 ? '优秀' : area.completionRate >= 85 ? '良好' : '待改进'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <div className="border-t border-[#1e4976] px-6 py-2 bg-[#091e33] text-xs text-white opacity-80 flex justify-between items-center">
        <div>
          <span className="text-[#00e5ff]">良渚街道城市管理动态管控大屏</span> - {dataSourceNote} - 数据更新时间: {new Date().toLocaleString('zh-CN')}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Info size={12} className="mr-1 text-[#00e5ff]" />
            <span>系统状态: 正常</span>
          </div>
          <div className="flex items-center">
            <Shield size={12} className="mr-1 text-[#00e5ff]" />
            <span>数据加密传输</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* 下钻详情页面 */}
    {isDrillDown && (
      <div className="fixed inset-0 bg-[#081c2f] z-50 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {/* 详情页头部 */}
          <div className="flex justify-between items-center mb-6 border-b border-[#1e4976] pb-4">
            <div className="flex items-center">
              <button 
                onClick={handleCloseDrillDown} 
                className="p-2 rounded-full bg-[#1e4976] hover:bg-[#00e5ff] text-white transition-colors mr-4"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-[#00e5ff]">{drillDownData.title}</h2>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-[#1e4976] hover:bg-[#00e5ff] text-white rounded-md transition-colors text-sm">
                <Download size={16} className="inline mr-1" /> 导出数据
              </button>
              <button className="px-4 py-2 bg-[#1e4976] hover:bg-[#00e5ff] text-white rounded-md transition-colors text-sm">
                <Filter size={16} className="inline mr-1" /> 筛选
              </button>
            </div>
          </div>
          
          {/* 详情数据表格 */}
          <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#1e4976]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">序号</th>
                    {drillDownData.details.length > 0 && Object.keys(drillDownData.details[0]).map((key) => {
                      if (key === 'id' || key === 'color') return null;
                      return (
                        <th key={key} className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                          {key === 'name' ? '名称' : 
                           key === 'count' ? '数量' : 
                           key === 'rate' ? '比例' : 
                           key === 'date' ? '日期' : 
                           key === 'area' ? '区域' : 
                           key === 'tasks' ? '任务数' : 
                           key === 'completed' ? '已完成' : 
                           key === 'total' ? '总数' : 
                           key === 'type' ? '类型' : 
                           key === 'category' ? '分类' : 
                           key === 'priority' ? '优先级' : 
                           key === 'daysPending' ? '待处理天数' : 
                           key === 'trend' ? '趋势' : 
                           key === 'description' ? '描述' : 
                           key === 'reportedTime' ? '上报时间' : 
                           key === 'status' ? '状态' : 
                           key === 'emergency' ? '紧急问题' : 
                           key === 'pending' ? '待处理问题' : 
                           key === 'completionRate' ? '完成率' : 
                           key === 'inspectors' ? '检查人数' : 
                           key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-[#0e2a47] divide-y divide-[#1e4976]">
                  {drillDownData.details.map((item, index) => (
                    <tr key={index} className="hover:bg-[#1e3a5f] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{index + 1}</td>
                      {Object.keys(item).map((key) => {
                        if (key === 'id') return null;
                        if (key === 'color') return null;
                        if (key === 'rate' || key === 'completionRate') {
                          return (
                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-[#081c2f] rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${item[key] >= 90 ? 'bg-[#00ffb2]' : item[key] >= 75 ? 'bg-[#00e5ff]' : 'bg-[#ffc400]'}`}
                                    style={{ width: `${item[key]}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium text-white">{item[key]}%</span>
                              </div>
                            </td>
                          );
                        }
                        if (key === 'trend') {
                          const trendStyle = 
                            item[key] === '上升' ? 'text-[#00ffb2]' : 
                            item[key] === '下降' ? 'text-[#ff0055]' : 'text-[#00e5ff]';
                          return (
                            <td key={key} className={`px-4 py-3 whitespace-nowrap text-sm ${trendStyle}`}>
                              {item[key]}
                            </td>
                          );
                        }
                        if (key === 'status') {
                          let statusStyle = '';
                          if (item[key] === '优秀' || item[key] === '已处理' || item[key] === '已验收') {
                            statusStyle = 'bg-[#00ffb2] bg-opacity-20 text-[#00ffb2]';
                          } else if (item[key] === '良好' || item[key] === '处理中') {
                            statusStyle = 'bg-[#00e5ff] bg-opacity-20 text-[#00e5ff]';
                          } else if (item[key] === '待改进' || item[key] === '待处理') {
                            statusStyle = 'bg-[#ffc400] bg-opacity-20 text-[#ffc400]';
                          }
                          return (
                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusStyle}`}>
                                {item[key]}
                              </span>
                            </td>
                          );
                        }
                        if (key === 'priority') {
                          const priorityStyle = 
                            item[key] === '紧急' ? 'text-[#ff0055]' : 'text-[#ffc400]';
                          return (
                            <td key={key} className={`px-4 py-3 whitespace-nowrap text-sm ${priorityStyle}`}>
                              {item[key]}
                            </td>
                          );
                        }
                        return (
                          <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {item[key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页信息 */}
            <div className="mt-4 flex justify-between items-center text-xs text-white/70">
              <div>显示 1-{drillDownData.details.length} 条，共 {drillDownData.details.length} 条</div>
              <div className="flex space-x-2">
                <button className="px-2 py-1 bg-[#1e4976] rounded hover:bg-[#00e5ff] text-white transition-colors" disabled>
                  上一页
                </button>
                <button className="px-2 py-1 bg-[#00e5ff] rounded text-white">1</button>
                <button className="px-2 py-1 bg-[#1e4976] rounded hover:bg-[#00e5ff] text-white transition-colors" disabled>
                  下一页
                </button>
              </div>
            </div>
          </div>
          
          {/* 详情页底部 */}
          <div className="mt-6 text-center text-xs text-white/50">
            数据来源于良渚街道城市管理系统 • 更新时间: {new Date().toLocaleString('zh-CN')}
          </div>
        </div>
      </div>
    )}
  );
};

export default DashboardPage;