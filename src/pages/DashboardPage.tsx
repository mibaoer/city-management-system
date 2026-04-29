import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, Filter, RefreshCw, AlertTriangle, CheckCircle, MapPin, User, Clock, ChevronRight, AlertCircle, CheckSquare, Bot } from 'lucide-react';
import AIConversationModal from '../components/AIConversationModal';

// 下钻数据接口定义
interface DrillDownData {
  type: string;
  title: string;
  details: any[];
}

// 关键指标接口定义
interface KeyMetric {
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
  icon: React.ReactNode;
}

// 数据卡片接口定义
interface DataCard {
  title: string;
  description: string;
  data: any;
  onClick: () => void;
  type: string;
}

// 职能分类数据接口
interface FunctionCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

// 地图点位接口
interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'urban' | 'sequence'; // 城管团队 | 序化团队
  name: string;
  status: 'online' | 'offline' | 'busy';
  taskCount: number;
}

// 轨迹点接口
interface TrackPoint {
  time: string;
  lat: number; // 相对于图片的百分比位置
  lng: number;
  action: string;
}

const DashboardPage: React.FC = () => {
  // 状态管理
  const [isDrillDown, setIsDrillDown] = useState<boolean>(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData>({
    type: '',
    title: '',
    details: []
  });
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  // 地图缩放和拖动状态
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 轨迹回放状态
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [trackHistory, setTrackHistory] = useState<TrackPoint[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);
  
  // 时间段选择状态
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('today'); // today, yesterday, thisWeek, custom
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  
  // 控制面板拖拽状态
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 }); // 初始化为0，点击时计算居中位置
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const [panelDragStart, setPanelDragStart] = useState({ x: 0, y: 0 });
  
  // 筛选功能状态
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [filterConditions, setFilterConditions] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // Tab切换状态
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'urban', 'sequence'
  
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 详情弹窗状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  
  // 添加导航钩子
  const navigate = useNavigate();
  
  // 选择菜单状态管理
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  
  // 初始化筛选数据
  useEffect(() => {
    if (drillDownData.details.length > 0) {
      setFilteredData(drillDownData.details);
    }
  }, [drillDownData.details]);
  
  // 处理点击菜单外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuButton = document.querySelector('.selection-menu-button');
      const menuContent = document.querySelector('.selection-menu-content');
      
      if (menuButton && menuContent && !menuButton.contains(event.target as Node) && !menuContent.contains(event.target as Node)) {
        setIsSelectionMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 处理返回主页
  const handleGoHome = () => {
    navigate('/');
  };
  
  // 处理全屏切换
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // 进入全屏
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`进入全屏失败: ${err.message}`);
      });
    } else {
      // 退出全屏
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error(`退出全屏失败: ${err.message}`);
      });
    }
  };
  
  // 处理表格行点击，显示详情弹窗
  const handleRowClick = (rowData: any) => {
    setSelectedRowData(rowData);
    setIsDetailModalOpen(true);
  };
  
  // 关闭详情弹窗
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRowData(null);
  };
  
  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-CN'));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // 轨迹回放动画 - 优化速度
  useEffect(() => {
    if (isPlayingTrack && currentTrackIndex < trackHistory.length - 1) {
      const timer = setTimeout(() => {
        setCurrentTrackIndex(prev => prev + 1);
      }, 600); // 加快到600ms
      return () => clearTimeout(timer);
    } else if (currentTrackIndex >= trackHistory.length - 1) {
      setIsPlayingTrack(false);
    }
  }, [isPlayingTrack, currentTrackIndex, trackHistory]);
  
  // 模拟轨迹数据生成 - 不规则路线（根据时间段）
  const generateMockTrack = (memberName: string, timeRange: string): TrackPoint[] => {
    // 根据时间范围生成不同的轨迹数据
    const getTodayTracks = (name: string): TrackPoint[] => {
      const tracks: Record<string, TrackPoint[]> = {
        '张队员': [
          { time: '08:00', lat: 25, lng: 20, action: '开始巡查' },
          { time: '08:08', lat: 27, lng: 23, action: '路过商业街' },
          { time: '08:15', lat: 28, lng: 26, action: '检查广告牌' },
          { time: '08:22', lat: 31, lng: 24, action: '巡查中' },
          { time: '08:30', lat: 33, lng: 28, action: '处理占道经营' },
          { time: '08:38', lat: 31, lng: 31, action: '继续巡查' },
          { time: '08:45', lat: 34, lng: 33, action: '检查店铺' },
          { time: '08:52', lat: 36, lng: 30, action: '巡查中' },
          { time: '09:00', lat: 32, lng: 27, action: '返回路线' },
          { time: '09:10', lat: 30, lng: 25, action: '当前位置' }
        ],
        '李队员': [
          { time: '08:00', lat: 45, lng: 45, action: '开始巡查' },
          { time: '08:12', lat: 46, lng: 47, action: '检查垃圾桶' },
          { time: '08:20', lat: 48, lng: 49, action: '检查垃圾分类' },
          { time: '08:28', lat: 51, lng: 47, action: '巡查中' },
          { time: '08:40', lat: 53, lng: 50, action: '处理市民投诉' },
          { time: '08:50', lat: 52, lng: 52, action: '核实情况' },
          { time: '09:00', lat: 49, lng: 50, action: '填写记录' },
          { time: '09:15', lat: 50, lng: 48, action: '巡查中' },
          { time: '09:20', lat: 50, lng: 50, action: '当前位置' }
        ],
        '陈队员': [
          { time: '08:00', lat: 65, lng: 70, action: '开始巡查' },
          { time: '08:10', lat: 67, lng: 72, action: '巡查工地周边' },
          { time: '08:15', lat: 68, lng: 74, action: '检查工地' },
          { time: '08:25', lat: 71, lng: 76, action: '巡查中' },
          { time: '08:30', lat: 73, lng: 78, action: '检查绿化' },
          { time: '08:40', lat: 72, lng: 80, action: '拍照记录' },
          { time: '08:45', lat: 69, lng: 77, action: '继续巡查' },
          { time: '08:55', lat: 71, lng: 75, action: '返回路线' },
          { time: '09:00', lat: 70, lng: 75, action: '当前位置' }
        ],
        '孙队员': [
          { time: '08:00', lat: 65, lng: 15, action: '开始巡查' },
          { time: '08:10', lat: 67, lng: 17, action: '检查人行道' },
          { time: '08:15', lat: 69, lng: 19, action: '检查市政设施' },
          { time: '08:25', lat: 71, lng: 18, action: '巡查中' },
          { time: '08:30', lat: 73, lng: 21, action: '处理违停' },
          { time: '08:40', lat: 74, lng: 23, action: '开具通知单' },
          { time: '08:45', lat: 72, lng: 25, action: '继续巡查' },
          { time: '08:55', lat: 69, lng: 22, action: '返回路线' },
          { time: '09:00', lat: 70, lng: 20, action: '当前位置' }
        ],
        '王队员': [
          { time: '08:00', lat: 55, lng: 40, action: '开始序化巡查' },
          { time: '08:12', lat: 57, lng: 42, action: '检查街道' },
          { time: '08:20', lat: 59, lng: 44, action: '检查序化情况' },
          { time: '08:30', lat: 61, lng: 43, action: '巡查中' },
          { time: '08:40', lat: 63, lng: 46, action: '整理摊位' },
          { time: '08:52', lat: 64, lng: 48, action: '沟通商户' },
          { time: '09:00', lat: 62, lng: 47, action: '继续巡查' },
          { time: '09:12', lat: 61, lng: 45, action: '填写记录' },
          { time: '09:20', lat: 60, lng: 45, action: '当前位置' }
        ],
        '刘队员': [
          { time: '08:00', lat: 30, lng: 55, action: '开始序化巡查' },
          { time: '08:15', lat: 32, lng: 57, action: '检查沿街商铺' },
          { time: '08:20', lat: 33, lng: 59, action: '检查商铺' },
          { time: '08:32', lat: 36, lng: 58, action: '巡查中' },
          { time: '08:40', lat: 37, lng: 61, action: '整顿环境' },
          { time: '08:50', lat: 36, lng: 63, action: '沟通整改' },
          { time: '09:00', lat: 35, lng: 60, action: '当前位置（离线）' }
        ],
        '赵队员': [
          { time: '08:00', lat: 45, lng: 75, action: '开始序化巡查' },
          { time: '08:08', lat: 46, lng: 77, action: '巡查街道' },
          { time: '08:15', lat: 48, lng: 78, action: '检查流动摊贩' },
          { time: '08:25', lat: 51, lng: 80, action: '劝导整改' },
          { time: '08:30', lat: 53, lng: 82, action: '处理违规经营' },
          { time: '08:40', lat: 54, lng: 84, action: '开具通知' },
          { time: '08:45', lat: 52, lng: 83, action: '继续巡查' },
          { time: '08:55', lat: 51, lng: 81, action: '返回路线' },
          { time: '09:00', lat: 50, lng: 80, action: '当前位置' }
        ]
      };
      return tracks[name] || [];
    };
    
    const getYesterdayTracks = (name: string): TrackPoint[] => {
      const tracks: Record<string, TrackPoint[]> = {
        '张队员': [
          { time: '昨日 08:00', lat: 22, lng: 18, action: '开始巡查' },
          { time: '昨日 08:15', lat: 24, lng: 21, action: '检查违停' },
          { time: '昨日 08:30', lat: 26, lng: 24, action: '处理投诉' },
          { time: '昨日 08:45', lat: 28, lng: 22, action: '巡查中' },
          { time: '昨日 09:00', lat: 30, lng: 25, action: '检查完成' },
          { time: '昨日 09:15', lat: 32, lng: 27, action: '返回路线' },
          { time: '昨日 09:30', lat: 30, lng: 25, action: '完成巡查' }
        ],
        '李队员': [
          { time: '昨日 08:00', lat: 42, lng: 42, action: '开始巡查' },
          { time: '昨日 08:20', lat: 45, lng: 45, action: '检查环境' },
          { time: '昨日 08:40', lat: 48, lng: 47, action: '处理问题' },
          { time: '昨日 09:00', lat: 50, lng: 50, action: '巡查中' },
          { time: '昨日 09:20', lat: 47, lng: 48, action: '完成巡查' }
        ],
        '陈队员': [
          { time: '昨日 08:00', lat: 62, lng: 68, action: '开始巡查' },
          { time: '昨日 08:15', lat: 65, lng: 71, action: '检查工地' },
          { time: '昨日 08:30', lat: 68, lng: 74, action: '巡查绿化' },
          { time: '昨日 08:45', lat: 70, lng: 76, action: '记录情况' },
          { time: '昨日 09:00', lat: 70, lng: 75, action: '完成巡查' }
        ]
      };
      return tracks[name] || getTodayTracks(name);
    };
    
    const getThisWeekTracks = (name: string): TrackPoint[] => {
      const tracks: Record<string, TrackPoint[]> = {
        '张队员': [
          { time: '周一 08:00', lat: 20, lng: 15, action: '周初巡查' },
          { time: '周一 09:00', lat: 25, lng: 20, action: '检查区域' },
          { time: '周二 08:00', lat: 28, lng: 23, action: '继续巡查' },
          { time: '周三 08:00', lat: 30, lng: 25, action: '重点区域' },
          { time: '周四 08:00', lat: 32, lng: 28, action: '巡查中' },
          { time: '周五 08:00', lat: 30, lng: 25, action: '本周完成' }
        ]
      };
      return tracks[name] || getTodayTracks(name);
    };
    
    // 根据时间范围返回对应数据
    switch(timeRange) {
      case 'yesterday':
        return getYesterdayTracks(memberName);
      case 'thisWeek':
        return getThisWeekTracks(memberName);
      case 'custom':
        // 自定义时间段（这里简化处理，实际应根据起止时间生成）
        return getTodayTracks(memberName);
      default: // today
        return getTodayTracks(memberName);
    }
  };
  
  // 点击队员查看轨迹
  const handleMemberClick = (memberName: string) => {
    const track = generateMockTrack(memberName, selectedTimeRange);
    setSelectedMember(memberName);
    setTrackHistory(track);
    setCurrentTrackIndex(0);
    setIsPlayingTrack(true);
    
    // 计算居中位置
    const panelWidth = 350; // 面板最小宽度
    const panelHeight = 500; // 预估面板高度
    const centerX = (window.innerWidth - panelWidth) / 2;
    const centerY = (window.innerHeight - panelHeight) / 2;
    
    setPanelPosition({
      x: Math.max(0, centerX),
      y: Math.max(0, centerY)
    });
  };
  
  // 切换时间范围
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    if (selectedMember) {
      // 重新加载当前队员的轨迹
      const track = generateMockTrack(selectedMember, range);
      setTrackHistory(track);
      setCurrentTrackIndex(0);
      setIsPlayingTrack(false);
    }
  };
  
  // 控制面板拖拽开始
  const handlePanelMouseDown = (e: React.MouseEvent) => {
    // 只有点击标题栏才能拖拽
    if ((e.target as HTMLElement).closest('.panel-drag-handle')) {
      setIsPanelDragging(true);
      setPanelDragStart({
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  // 控制面板拖拽移动
  useEffect(() => {
    const handlePanelMouseMove = (e: MouseEvent) => {
      if (isPanelDragging) {
        const newX = e.clientX - panelDragStart.x;
        const newY = e.clientY - panelDragStart.y;
        
        // 限制面板不超出屏幕边界
        const maxX = window.innerWidth - 350; // 面板最小宽度
        const maxY = window.innerHeight - 100; // 预留底部空间
        
        setPanelPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };
    
    const handlePanelMouseUp = () => {
      setIsPanelDragging(false);
    };
    
    if (isPanelDragging) {
      document.addEventListener('mousemove', handlePanelMouseMove);
      document.addEventListener('mouseup', handlePanelMouseUp);
      return () => {
        document.removeEventListener('mousemove', handlePanelMouseMove);
        document.removeEventListener('mouseup', handlePanelMouseUp);
      };
    }
  }, [isPanelDragging, panelDragStart, panelPosition.x, panelPosition.y]);
  
  // 关闭轨迹回放
  const handleCloseTrack = () => {
    setSelectedMember(null);
    setTrackHistory([]);
    setCurrentTrackIndex(0);
    setIsPlayingTrack(false);
    // 重置面板位置（下次打开时重新居中）
    setPanelPosition({ x: 0, y: 0 });
  };
  
  // 控制轨迹回放
  const handlePlayPause = () => {
    setIsPlayingTrack(!isPlayingTrack);
  };
  
  const handleResetTrack = () => {
    setCurrentTrackIndex(0);
    setIsPlayingTrack(false);
  };

  // 关键指标点击下钻
  const handleMetricClick = (metricTitle: string) => {
    let mockDetails: any[] = [];
    let drillDownTitle = '';
    
    switch(metricTitle) {
      case '今日任务总数':
        // 内部路由跳转到任务列表页面，筛选条件为待处理
        navigate('/task-list?status=待处理');
        return;
        break;
      case '待处理问题':
        // 内部路由跳转到任务列表页面，筛选条件为待处理
        navigate('/task-list?status=待处理');
        return;
        break;
      case '完成率':
        // 内部路由跳转到任务列表页面，筛选条件为已完成
        navigate('/task-list?status=已完成');
        return;
        break;
      case '事件数':
        drillDownTitle = '各类事件数量统计';
        mockDetails = [
          { 事件类型: '占道经营', 数量: 45, 占比: '24.3%', 状态: '已处理' },
          { 事件类型: '流动摊贩', 数量: 38, 占比: '20.5%', 状态: '已处理' },
          { 事件类型: '垃圾分类', 数量: 52, 占比: '28.1%', 状态: '已处理' },
          { 事件类型: '违停车辆', 数量: 28, 占比: '15.1%', 状态: '处理中' },
          { 事件类型: '广告牌检查', 数量: 12, 占比: '6.5%', 状态: '待处理' },
          { 事件类型: '工地管理', 数量: 10, 占比: '5.4%', 状态: '待处理' },
        ];
        break;
      case '整改率':
        drillDownTitle = '各类事件整改率统计';
        mockDetails = [
          { 事件类型: '占道经营', 整改率: 96.8, 已整改: 43, 未整改: 2, 整改期限: '24小时' },
          { 事件类型: '流动摊贩', 整改率: 97.4, 已整改: 37, 未整改: 1, 整改期限: '12小时' },
          { 事件类型: '垃圾分类', 整改率: 92.3, 已整改: 48, 未整改: 4, 整改期限: '48小时' },
          { 事件类型: '违停车辆', 整改率: 89.3, 已整改: 25, 未整改: 3, 整改期限: '6小时' },
          { 事件类型: '广告牌检查', 整改率: 83.3, 已整改: 10, 未整改: 2, 整改期限: '72小时' },
          { 事件类型: '工地管理', 整改率: 90.0, 已整改: 9, 未整改: 1, 整改期限: '72小时' },
        ];
        break;
      case '验收率':
        drillDownTitle = '各类事件验收率统计';
        mockDetails = [
          { 事件类型: '占道经营', 验收率: 97.7, 已验收: 42, 未验收: 1, 通过率: 100 },
          { 事件类型: '流动摊贩', 验收率: 97.3, 已验收: 36, 未验收: 1, 通过率: 100 },
          { 事件类型: '垃圾分类', 验收率: 91.7, 已验收: 45, 未验收: 3, 通过率: 97.8 },
          { 事件类型: '违停车辆', 验收率: 87.5, 已验收: 21, 未验收: 3, 通过率: 100 },
          { 事件类型: '广告牌检查', 验收率: 80.0, 已验收: 8, 未验收: 2, 通过率: 100 },
          { 事件类型: '工地管理', 验收率: 90.0, 已验收: 9, 未验收: 0, 通过率: 100 },
        ];
        break;
      default:
        mockDetails = [];
    }
    
    if (mockDetails.length > 0) {
      setDrillDownData({
        type: 'metric',
        title: drillDownTitle,
        details: mockDetails
      });
      setIsDrillDown(true);
      setLastUpdate(new Date().toLocaleString('zh-CN'));
    }
  };

  // 处理数据点击事件，获取下钻数据
  const handleDataClick = (type: string, title: string) => {
    let mockDetails: any[] = [];
    
    switch(type) {
      case 'urbanManagement':
        // 城市管理 - 显示任务数量，支持查看车辆管理（保洁、市政），出车几次
        mockDetails = [
          { 任务编号: 'CM001', 任务类型: '保洁车辆', 车辆编号: '浙A-12345', 司机: '张师傅', 出车次数: 5, 状态: '在运行', 当前位置: '商业街', 今日任务: '完成路面清洁3次' },
          { 任务编号: 'CM002', 任务类型: '市政车辆', 车辆编号: '浙A-67890', 司机: '李师傅', 出车次数: 3, 状态: '待命', 当前位置: '停车场', 今日任务: '处理道路维修2次' },
          { 任务编号: 'CM003', 任务类型: '保洁车辆', 车辆编号: '浙A-24680', 司机: '王师傅', 出车次数: 4, 状态: '在运行', 当前位置: '居民区', 今日任务: '完成垃圾清运4次' },
          { 任务编号: 'CM004', 任务类型: '市政车辆', 车辆编号: '浙A-13579', 司机: '刘师傅', 出车次数: 2, 状态: '维修中', 当前位置: '维修厂', 今日任务: '待维修完成' },
          { 任务编号: 'CM005', 任务类型: '保洁车辆', 车辆编号: '浙A-97531', 司机: '赵师傅', 出车次数: 6, 状态: '在运行', 当前位置: '工业区', 今日任务: '完成路面清洁5次' },
        ];
        break;
      case 'sequenceManagement':
        // 序化管理 - 显示任务数量，任务管理
        mockDetails = [
          { 任务编号: 'SM001', 任务名称: '流动摊贩整治', 责任区域: '商业街', 责任人: '张队员', 状态: '进行中', 开始时间: '08:30', 预计完成: '10:30', 进度: 60 },
          { 任务编号: 'SM002', 任务名称: '店外经营整改', 责任区域: '解放路', 责任人: '李队员', 状态: '已完成', 开始时间: '09:00', 预计完成: '11:00', 进度: 100 },
          { 任务编号: 'SM003', 任务名称: '广告牌检查', 责任区域: '中山路', 责任人: '王队员', 状态: '待处理', 开始时间: '14:00', 预计完成: '16:00', 进度: 0 },
          { 任务编号: 'SM004', 任务名称: '街道秩序维护', 责任区域: '和平路', 责任人: '刘队员', 状态: '进行中', 开始时间: '10:00', 预计完成: '12:00', 进度: 75 },
          { 任务编号: 'SM005', 任务名称: '违停车辆处理', 责任区域: '文化路', 责任人: '赵队员', 状态: '已完成', 开始时间: '08:00', 预计完成: '09:30', 进度: 100 },
        ];
        break;
      case 'constructionWaste':
        // 建筑垃圾 - 点位数量
        mockDetails = [
          { 编号: 'W001', 来源: '建筑工地A', 目的地: '处理厂X', 方量: 120, 状态: '运输中', 开始时间: '08:30', 预计完成: '10:30', 车辆: '浙A-12345' },
          { 编号: 'W002', 来源: '建筑工地B', 目的地: '处理厂Y', 方量: 85, 状态: '已完成', 开始时间: '06:15', 预计完成: '08:00', 车辆: '浙A-67890' },
          { 编号: 'W003', 来源: '拆除现场C', 目的地: '处理厂X', 方量: 200, 状态: '待运输', 开始时间: '14:00', 预计完成: '16:00', 车辆: '浙A-24680' },
          { 编号: 'W004', 来源: '建筑工地D', 目的地: '处理厂Z', 方量: 150, 状态: '运输中', 开始时间: '10:45', 预计完成: '12:15', 车辆: '浙A-13579' },
          { 编号: 'W005', 来源: '装修工地E', 目的地: '处理厂Y', 方量: 45, 状态: '已完成', 开始时间: '16:30', 预计完成: '17:15', 车辆: '浙A-97531' },
        ];
        break;
      case 'garbageClassification':
        // 垃圾分类 - 检查数量
        mockDetails = [
          { 编号: 'G001', 地点: '小区A', 通过率: 92, 检查次数: 15, 问题数: 2, 最后检查: '09:30', 类别: '居民区' },
          { 编号: 'G002', 地点: '商场B', 通过率: 85, 检查次数: 8, 问题数: 3, 最后检查: '11:15', 类别: '商业区' },
          { 编号: 'G003', 地点: '学校C', 通过率: 96, 检查次数: 5, 问题数: 1, 最后检查: '14:45', 类别: '教育区' },
          { 编号: 'G004', 地点: '医院D', 通过率: 88, 检查次数: 6, 问题数: 2, 最后检查: '16:20', 类别: '医疗区' },
          { 编号: 'G005', 地点: '办公楼E', 通过率: 80, 检查次数: 12, 问题数: 4, 最后检查: '08:45', 类别: '办公区' },
        ];
        break;
      case 'acquiredUnused':
        // 已征未用 - n块n亩
        mockDetails = [
          { 地块编号: 'AU001', 地块名称: '东城区地块', 位置: '东城区', 面积: '5.2亩', 用途: '规划商业用地', 状态: '已征未用', 征收时间: '2023-05-15' },
          { 地块编号: 'AU002', 地块名称: '西城区地块', 位置: '西城区', 面积: '3.8亩', 用途: '规划住宅用地', 状态: '已征未用', 征收时间: '2023-08-20' },
          { 地块编号: 'AU003', 地块名称: '南城区地块', 位置: '南城区', 面积: '8.5亩', 用途: '规划公园用地', 状态: '已征未用', 征收时间: '2023-10-10' },
          { 地块编号: 'AU004', 地块名称: '北城区地块', 位置: '北城区', 面积: '4.3亩', 用途: '规划工业用地', 状态: '已征未用', 征收时间: '2023-12-05' },
          { 地块编号: 'AU005', 地块名称: '中心区地块', 位置: '中心区', 面积: '2.1亩', 用途: '规划公共设施用地', 状态: '已征未用', 征收时间: '2024-01-15' },
        ];
        break;
      case 'personnelManagement':
        // 人员管理 - 队员数量、到岗数量
        mockDetails = [
          { 队员编号: 'PM001', 姓名: '张队员', 部门: '城市管理', 职务: '队员', 状态: '已到岗', 到岗时间: '08:00', 今日任务: '商业街巡查', 联系方式: '13800138001' },
          { 队员编号: 'PM002', 姓名: '李队员', 部门: '序化管理', 职务: '队员', 状态: '已到岗', 到岗时间: '08:15', 今日任务: '解放路整治', 联系方式: '13800138002' },
          { 队员编号: 'PM003', 姓名: '王队员', 部门: '城市管理', 职务: '队员', 状态: '迟到', 到岗时间: '08:45', 今日任务: '中山路检查', 联系方式: '13800138003' },
          { 队员编号: 'PM004', 姓名: '刘队员', 部门: '序化管理', 职务: '队员', 状态: '已到岗', 到岗时间: '07:50', 今日任务: '和平路维护', 联系方式: '13800138004' },
          { 队员编号: 'PM005', 姓名: '赵队员', 部门: '城市管理', 职务: '队员', 状态: '请假', 到岗时间: '-', 今日任务: '请假', 联系方式: '13800138005' },
        ];
        break;
      case 'contractManagement':
        // 合同管理 - 总数量、到期提醒
        mockDetails = [
          { 合同编号: 'CT001', 合同名称: '保洁服务合同', 乙方: 'XX保洁公司', 金额: '50万元', 签订日期: '2023-01-01', 到期日期: '2024-06-30', 状态: '即将到期', 剩余天数: '178天' },
          { 合同编号: 'CT002', 合同名称: '市政维护合同', 乙方: 'XX市政公司', 金额: '80万元', 签订日期: '2023-03-01', 到期日期: '2024-02-28', 状态: '已到期', 剩余天数: '-30天' },
          { 合同编号: 'CT003', 合同名称: '垃圾清运合同', 乙方: 'XX清运公司', 金额: '30万元', 签订日期: '2023-05-01', 到期日期: '2024-04-30', 状态: '即将到期', 剩余天数: '-15天' },
          { 合同编号: 'CT004', 合同名称: '绿化养护合同', 乙方: 'XX绿化公司', 金额: '40万元', 签订日期: '2023-07-01', 到期日期: '2024-06-30', 状态: '正常', 剩余天数: '178天' },
          { 合同编号: 'CT005', 合同名称: '设备采购合同', 乙方: 'XX设备公司', 金额: '20万元', 签订日期: '2023-09-01', 到期日期: '2024-08-31', 状态: '正常', 剩余天数: '230天' },
        ];
        break;
      case 'photoReport':
        mockDetails = [
          { 编号: 'P001', 举报人: '市民王先生', 地点: '人民路123号', 问题类型: '占道经营', 状态: '已解决', 举报时间: '08:30', 解决时间: '10:15', 处理人: '张队员' },
          { 编号: 'P002', 举报人: '市民李女士', 地点: '解放路45号', 问题类型: '乱扔垃圾', 状态: '处理中', 举报时间: '10:20', 解决时间: '-', 处理人: '王队员' },
          { 编号: 'P003', 举报人: '市民张先生', 地点: '中山路67号', 问题类型: '违规停车', 状态: '待处理', 举报时间: '11:45', 解决时间: '-', 处理人: '-' },
          { 编号: 'P004', 举报人: '市民赵女士', 地点: '和平路89号', 问题类型: '工地扩尘', 状态: '已解决', 举报时间: '14:10', 解决时间: '15:30', 处理人: '刘队员' },
          { 编号: 'P005', 举报人: '市民陈先生', 地点: '文化路10号', 问题类型: '噪音扰民', 状态: '处理中', 举报时间: '16:40', 解决时间: '-', 处理人: '孙队员' },
        ];
        break;

      case 'eventAcceptance':
        mockDetails = [
          { 编号: 'A001', 问题类型: '违规搭建', 地点: '幸福小区12栋', 整改时间: '2024-05-15', 验收结果: '合格', 验收时间: '2024-05-16', 验收人: '李工' },
          { 编号: 'A002', 问题类型: '油烟污染', 地点: '餐饮街36号', 整改时间: '2024-05-10', 验收结果: '合格', 验收时间: '2024-05-11', 验收人: '王工' },
          { 编号: 'A003', 问题类型: '占道经营', 地点: '商业街北段', 整改时间: '2024-05-08', 验收结果: '合格', 验收时间: '2024-05-09', 验收人: '张工' },
          { 编号: 'A004', 问题类型: '工地扩尘', 地点: '开发区A地块', 整改时间: '2024-05-07', 验收结果: '不合格', 验收时间: '2024-05-08', 验收人: '刘工' },
          { 编号: 'A005', 问题类型: '噪音扰民', 地点: '居民区B区', 整改时间: '2024-05-05', 验收结果: '合格', 验收时间: '2024-05-06', 验收人: '陈工' },
        ];
        break;
      case 'petitionHandling':
        mockDetails = [
          { 编号: 'F001', 信访人: '市民刘先生', 类型: '投诉', 内容: '小区垃圾堆积', 状态: '已解决', 提交时间: '2024-05-01', 解决时间: '2024-05-03', 处理部门: '环卫部门' },
          { 编号: 'F002', 信访人: '市民周女士', 类型: '建议', 内容: '增加公共厕所', 状态: '处理中', 提交时间: '2024-05-02', 解决时间: '-', 处理部门: '规划部门' },
          { 编号: 'F003', 信访人: '市民吴先生', 类型: '投诉', 内容: '噪音扰民', 状态: '已解决', 提交时间: '2024-05-03', 解决时间: '2024-05-04', 处理部门: '城管部门' },
          { 编号: 'F004', 信访人: '市民郑女士', 类型: '咨询', 内容: '垃圾分类政策', 状态: '已解决', 提交时间: '2024-05-04', 解决时间: '2024-05-04', 处理部门: '环卫部门' },
          { 编号: 'F005', 信访人: '市民冯先生', 类型: '投诉', 内容: '占道经营', 状态: '处理中', 提交时间: '2024-05-05', 解决时间: '-', 处理部门: '城管部门' },
        ];
        break;
      case 'areaDistribution':
        mockDetails = [
          { 区域: '东城区', 总任务: 156, 已完成: 142, 待处理: 14, 完成率: 91 },
          { 区域: '西城区', 总任务: 132, 已完成: 118, 待处理: 14, 完成率: 89 },
          { 区域: '南城区', 总任务: 178, 已完成: 152, 待处理: 26, 完成率: 85 },
          { 区域: '北城区', 总任务: 124, 已完成: 115, 待处理: 9, 完成率: 93 },
          { 区域: '中心区', 总任务: 210, 已完成: 188, 待处理: 22, 完成率: 89 },
        ];
        break;
      case 'functionCategory':
        mockDetails = [
          { 类别: '市政保洁', 数量: 180, 占比: 25.0, 趋势: 'up', 变化率: 5.2 },
          { 类别: '市政绿化', 数量: 150, 占比: 20.8, 趋势: 'stable', 变化率: 0.3 },
          { 类别: '垃圾分类', 数量: 200, 占比: 27.8, 趋势: 'up', 变化率: 8.5 },
          { 类别: '渣土管理', 数量: 180, 占比: 25.0, 趋势: 'down', 变化率: -2.1 },
          { 类别: '其他', 数量: 6, 占比: 0.8, 趋势: 'stable', 变化率: 0 },
        ];
        break;
      case 'eventRectification':
        // 事件整改 - 实时状态（整改中、验收中），支持查看事件详情（随手拍、日常检查提交的事件）
        mockDetails = [
          {
            编号: 'H001',
            来源: '随手拍',
            问题类型: '违规搭建',
            地点: '幸福小区12栋',
            状态: '整改中',
            提交时间: '2024-05-10',
            责任单位: '综合执法队',
            负责人: '张队员',
            完成率: 65,
            // 详细事件信息
            事件等级: '一般事件',
            事件类型: '基础设施管理',
            事件来源: '安全管控',
            事件所属任务: '/',
            预期整改时间: '2025-12-16',
            提报人: '王一（一起安区演苏5）',
            提报时间: '2025-12-16 11:06',
            事件位置: '某某市某某区',
            事件照片: 'https://example.com/hazard1.jpg',
            事件描述: '屋顶上放置有未开启的瓶装燃料（可乐），存在存放过期风险，可能造成设备损毁或人员伤害，同时，该燃料属于易燃物品，在密闭空间内高温环境或明火存在安全事件。',
            // 整改信息
            整改完成时间: '2025-12-16 11:06',
            整改人: '王一',
            所属部门: '一起安区演苏5',
            整改图片: 'https://example.com/rectification1.jpg',
            整改描述: '好的，已整改',
            整改人签名: 'https://example.com/signature1.jpg',
            // 验收确认
            整改情况: '整改完成',
            整改完成照片: 'https://example.com/acceptance1.jpg',
            整改完成说明: '已整改',
            验收人签名: 'https://example.com/acceptance_signature1.jpg',
            // 进度跟踪
            进度跟踪: [
              { 时间: '2025-12-16 11:06', 操作: '事件提交', 人员: '王一', 描述: '创建事件' },
              { 时间: '2025-12-16 11:06', 操作: '事件确认', 人员: '王一', 描述: '确认了事件' },
              { 时间: '2025-12-16 11:09', 操作: '事件整改', 人员: '王一', 描述: '完成了事件整改', 图片: 'https://example.com/rectification1.jpg', 签名: 'https://example.com/signature1.jpg' },
              { 时间: '2025-12-16 11:09', 操作: '整改确认', 人员: '王一', 描述: '确认事件整改完成', 图片: 'https://example.com/acceptance1.jpg', 签名: 'https://example.com/acceptance_signature1.jpg' }
            ]
          },
          {
            编号: 'H002',
            来源: '日常检查',
            问题类型: '油烟污染',
            地点: '餐饮街36号',
            状态: '验收中',
            提交时间: '2024-05-08',
            责任单位: '环保中队',
            负责人: '李队员',
            完成率: 100,
            // 详细事件信息
            事件等级: '一般事件',
            事件类型: '环境保护',
            事件来源: '日常检查',
            事件所属任务: '/',
            预期整改时间: '2025-12-17',
            提报人: '李二（一起安区演苏6）',
            提报时间: '2025-12-17 10:30',
            事件位置: '某某市某某区',
            事件照片: 'https://example.com/hazard2.jpg',
            事件描述: '餐饮店铺油烟排放不符合标准，影响周边居民生活',
            // 整改信息
            整改完成时间: '2025-12-17 14:30',
            整改人: '李二',
            所属部门: '一起安区演苏6',
            整改图片: 'https://example.com/rectification2.jpg',
            整改描述: '已安装油烟净化设备',
            整改人签名: 'https://example.com/signature2.jpg',
            // 验收确认
            整改情况: '待验收',
            整改完成照片: 'https://example.com/acceptance2.jpg',
            整改完成说明: '已安装油烟净化设备，等待验收',
            验收人签名: '',
            // 进度跟踪
            进度跟踪: [
              { 时间: '2025-12-17 10:30', 操作: '事件提交', 人员: '李二', 描述: '创建事件' },
              { 时间: '2025-12-17 10:35', 操作: '事件确认', 人员: '李二', 描述: '确认了事件' },
              { 时间: '2025-12-17 14:30', 操作: '事件整改', 人员: '李二', 描述: '完成了事件整改', 图片: 'https://example.com/rectification2.jpg', 签名: 'https://example.com/signature2.jpg' }
            ]
          },
          {
            编号: 'H003',
            来源: '随手拍',
            问题类型: '道路破损',
            地点: '建设路东段',
            状态: '整改中',
            提交时间: '2024-05-12',
            责任单位: '市政部门',
            负责人: '王队员',
            完成率: 45,
            // 详细事件信息
            事件等级: '一般事件',
            事件类型: '基础设施管理',
            事件来源: '市民举报',
            事件所属任务: '/',
            预期整改时间: '2025-12-18',
            提报人: '张三（市民）',
            提报时间: '2025-12-18 09:15',
            事件位置: '某某市某某区',
            事件照片: 'https://example.com/hazard3.jpg',
            事件描述: '道路出现大面积破损，影响车辆和行人通行',
            // 整改信息
            整改完成时间: '',
            整改人: '张三',
            所属部门: '市政部门',
            整改图片: '',
            整改描述: '正在整改中',
            整改人签名: '',
            // 验收确认
            整改情况: '整改中',
            整改完成照片: '',
            整改完成说明: '',
            验收人签名: '',
            // 进度跟踪
            进度跟踪: [
              { 时间: '2025-12-18 09:15', 操作: '事件提交', 人员: '张三', 描述: '创建事件' },
              { 时间: '2025-12-18 09:20', 操作: '事件确认', 人员: '张三', 描述: '确认了事件' },
              { 时间: '2025-12-18 10:00', 操作: '整改开始', 人员: '张三', 描述: '开始整改' }
            ]
          },
          {
            编号: 'H004',
            来源: '日常检查',
            问题类型: '绿化破坏',
            地点: '中心公园',
            状态: '待整改',
            提交时间: '2024-05-11',
            责任单位: '园林部门',
            负责人: '刘队员',
            完成率: 0,
            // 详细事件信息
            事件等级: '一般事件',
            事件类型: '环境保护',
            事件来源: '日常检查',
            事件所属任务: '/',
            预期整改时间: '2025-12-19',
            提报人: '李四（园林部门）',
            提报时间: '2025-12-19 14:20',
            事件位置: '某某市某某区',
            事件照片: 'https://example.com/hazard4.jpg',
            事件描述: '中心公园内多处绿化被破坏，需要修复',
            // 整改信息
            整改完成时间: '',
            整改人: '李四',
            所属部门: '园林部门',
            整改图片: '',
            整改描述: '',
            整改人签名: '',
            // 验收确认
            整改情况: '待整改',
            整改完成照片: '',
            整改完成说明: '',
            验收人签名: '',
            // 进度跟踪
          进度跟踪: [
            { 时间: '2025-12-19 14:20', 操作: '事件提交', 人员: '李四', 描述: '创建事件' }
          ]
          },
          {
            编号: 'H005',
            来源: '随手拍',
            问题类型: '占道经营',
            地点: '商业街北段',
            状态: '已完成',
            提交时间: '2024-05-05',
            责任单位: '城管中队',
            负责人: '赵队员',
            完成率: 100,
            // 详细事件信息
            事件等级: '一般事件',
            事件类型: '城市管理',
            事件来源: '市民举报',
            事件所属任务: '/',
            预期整改时间: '2025-12-15',
            提报人: '王五（市民）',
            提报时间: '2025-12-15 16:45',
            事件位置: '某某市某某区',
            事件照片: 'https://example.com/hazard5.jpg',
            事件描述: '商业街北段多家店铺占道经营，影响行人通行',
            // 整改信息
            整改完成时间: '2025-12-15 17:30',
            整改人: '王五',
            所属部门: '城管中队',
            整改图片: 'https://example.com/rectification5.jpg',
            整改描述: '已清理占道经营',
            整改人签名: 'https://example.com/signature5.jpg',
            // 验收确认
            整改情况: '整改完成',
            整改完成照片: 'https://example.com/acceptance5.jpg',
            整改完成说明: '已清理占道经营，道路恢复畅通',
            验收人签名: 'https://example.com/acceptance_signature5.jpg',
            // 进度跟踪
            进度跟踪: [
              { 时间: '2025-12-15 16:45', 操作: '事件提交', 人员: '王五', 描述: '创建事件' },
              { 时间: '2025-12-15 16:50', 操作: '事件确认', 人员: '王五', 描述: '确认了事件' },
              { 时间: '2025-12-15 17:30', 操作: '事件整改', 人员: '王五', 描述: '完成了事件整改', 图片: 'https://example.com/rectification5.jpg', 签名: 'https://example.com/signature5.jpg' },
              { 时间: '2025-12-15 17:35', 操作: '整改确认', 人员: '王五', 描述: '确认事件整改完成', 图片: 'https://example.com/acceptance5.jpg', 签名: 'https://example.com/acceptance_signature5.jpg' }
            ]
          }
        ];
        break;
      default:
        mockDetails = [];
    }

    setDrillDownData({
      type,
      title,
      details: mockDetails
    });
    setIsDrillDown(true);
    setLastUpdate(new Date().toLocaleString('zh-CN'));
  };

  // 处理关闭下钻页面
  const handleCloseDrillDown = () => {
    setIsDrillDown(false);
    // 重置筛选条件
    setFilterConditions({});
    setSearchKeyword('');
    setIsFilterVisible(false);
  };
  
  // 切换筛选面板显示
  const handleToggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };
  
  // 处理筛选条件变化
  const handleFilterChange = (field: string, value: string) => {
    const newConditions = { ...filterConditions };
    if (value === '') {
      delete newConditions[field];
    } else {
      newConditions[field] = value;
    }
    setFilterConditions(newConditions);
  };
  
  // 应用筛选
  const applyFilters = () => {
    let filtered = [...drillDownData.details];
    
    // 应用Tab切换筛选（仅对今日任务详情页面生效）
    if (drillDownData.title === '今日任务详情') {
      if (activeTab === 'urban') {
        // 城市管理任务：商业街广告牌检查、工地扶尘巡查、垃圾分类检查、违停车辆处理
        filtered = filtered.filter(item => {
          const urbanTasks = ['商业街广告牌检查', '工地扶尘巡查', '垃圾分类检查', '违停车辆处理'];
          return urbanTasks.includes(item['任务名称']);
        });
      } else if (activeTab === 'sequence') {
        // 序化管理任务：流动摊贩整治、店外经营整改
        filtered = filtered.filter(item => {
          const sequenceTasks = ['流动摊贩整治', '店外经营整改'];
          return sequenceTasks.includes(item['任务名称']);
        });
      }
    }
    
    // 应用筛选条件
    Object.keys(filterConditions).forEach(field => {
      const value = filterConditions[field];
      filtered = filtered.filter(item => {
        const fieldValue = String(item[field] || '').toLowerCase();
        return fieldValue.includes(value.toLowerCase());
      });
    });
    
    // 应用关键词搜索（搜索所有字段）
    if (searchKeyword) {
      filtered = filtered.filter(item => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchKeyword.toLowerCase())
        );
      });
    }
    
    setFilteredData(filtered);
  };
  
  // 清空筛选
  const clearFilters = () => {
    setFilterConditions({});
    setSearchKeyword('');
    setFilteredData(drillDownData.details);
  };
  
  // 实时应用筛选
  useEffect(() => {
    applyFilters();
  }, [filterConditions, searchKeyword, drillDownData.details]);

  // 关键指标数据
  const keyMetrics: KeyMetric[] = [
    {
      title: '今日任务总数',
      value: 586,
      unit: '个',
      trend: 'up',
      percentage: 8.5,
      description: '较昨日上升8.5%',
      icon: <RefreshCw size={20} />
    },
    {
      title: '待处理问题',
      value: 89,
      unit: '个',
      trend: 'down',
      percentage: 12.3,
      description: '较昨日下降12.3%',
      icon: <AlertTriangle size={20} />
    },
    {
      title: '完成率',
      value: 92,
      unit: '%',
      trend: 'up',
      percentage: 3.8,
      description: '较昨日上升3.8%',
      icon: <CheckCircle size={20} />
    },
    {
      title: '事件数',
      value: 185,
      unit: '件',
      trend: 'up',
      percentage: 12.5,
      description: '较昨日增加20件',
      icon: <AlertCircle size={20} />
    },
    {
      title: '整改率',
      value: 94.2,
      unit: '%',
      trend: 'up',
      percentage: 2.3,
      description: '较昨日上升2.3%',
      icon: <RefreshCw size={20} />
    },
    {
      title: '验收率',
      value: 91.5,
      unit: '%',
      trend: 'up',
      percentage: 1.8,
      description: '较昨日上升1.8%',
      icon: <CheckSquare size={20} />
    }
  ];

  // 数据卡片配置
  const dataCards: DataCard[] = [
    {
      title: 'AI每日总结报告',
      description: '城市管理及序化管理的任务完成情况、隐患发现情况等',
      data: { total: 1, generated: 1, pending: 0 },
      onClick: () => navigate('/ai-daily-summary'),
      type: 'aiDailySummary'
    },
    {
      title: '基础数据维护',
      description: '维护道路、公厕、绿化等基础数据',
      data: { total: 3, roads: 66, toilets: 9, greening: 42 },
      onClick: () => navigate('/basic-data-maintenance'),
      type: 'basicDataMaintenance'
    },
    {
      title: '建筑垃圾全链路管理',
      description: '建筑垃圾运输、处理全流程监控',
      data: { total: 450, inTransit: 125, completed: 315, pending: 10 },
      onClick: () => navigate('/construction-waste'),
      type: 'constructionWaste'
    },
    {
      title: '垃圾分类检查',
      description: '各区域垃圾分类检查情况统计',
      data: { total: 280, passRate: 89, excellent: 156, good: 98, poor: 26 },
      onClick: () => handleDataClick('garbageClassification', '垃圾分类检查详情'),
      type: 'garbageClassification'
    },
    {
      title: '随手拍案件',
      description: '市民举报案件处理情况',
      data: { total: 325, solved: 289, processing: 27, pending: 9 },
      onClick: () => handleDataClick('photoReport', '随手拍案件详情'),
      type: 'photoReport'
    },
    {
      title: '事件整改',
      description: '各类问题整改进度跟踪',
      data: { total: 186, completed: 145, inProgress: 32, notStarted: 9 },
      onClick: () => handleDataClick('eventRectification', '事件整改详情'),
      type: 'eventRectification'
    },
    {
      title: '事件验收',
      description: '整改完成事件验收结果',
      data: { total: 128, qualified: 116, unqualified: 12, pending: 25 },
      onClick: () => handleDataClick('eventAcceptance', '事件验收详情'),
      type: 'eventAcceptance'
    },
    {
      title: '信访处理',
      description: '市民信访案件办理情况',
      data: { total: 95, solved: 82, processing: 10, pending: 3 },
      onClick: () => handleDataClick('petitionHandling', '信访处理详情'),
      type: 'petitionHandling'
    },
    {
      title: '区域分布',
      description: '各区域任务分布及完成情况',
      data: { east: 156, west: 132, south: 178, north: 124, center: 210 },
      onClick: () => handleDataClick('areaDistribution', '区域分布详情'),
      type: 'areaDistribution'
    },
    {
      title: '职能分类占比',
      description: '各类职能任务数量及占比',
      data: { total: 845, majorIssue: 215, minorIssue: 630 },
      onClick: () => handleDataClick('functionCategory', '职能分类详情'),
      type: 'functionCategory'
    }
  ];

  // 职能分类模拟数据（用于饼图展示）
  const functionCategories: FunctionCategory[] = [
    { name: '市政保洁', count: 180, percentage: 25.0, color: '#00e5ff' },
    { name: '市政绿化', count: 150, percentage: 20.8, color: '#00ffb2' },
    { name: '垃圾分类', count: 200, percentage: 27.8, color: '#7b61ff' },
    { name: '渣土管理', count: 180, percentage: 25.0, color: '#ffc400' },
    { name: '其他', count: 6, percentage: 0.8, color: '#4a9eff' },
  ];

  

  // AI对话状态
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00e5ff] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7b61ff] rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00ffb2] rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* AI机器人图标按钮 */}
      <button
        onClick={() => setIsAIModalOpen(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-[#7b61ff] to-[#a78bfa] text-white p-3 rounded-full shadow-2xl shadow-[#7b61ff]/50 hover:shadow-[#7b61ff]/70 transition-all duration-300 z-50 animate-pulse"
        aria-label="AI机器人"
        title="AI机器人"
      >
        <Bot size={24} className="animate-bounce" />
      </button>
      
      {/* AI对话模态框 */}
      <AIConversationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        dashboardData={{
          totalTasks: keyMetrics.find(m => m.title === '今日任务总数')?.value,
          pendingTasks: keyMetrics.find(m => m.title === '待处理问题')?.value,
          completionRate: keyMetrics.find(m => m.title === '完成率')?.value,
          eventCount: keyMetrics.find(m => m.title === '事件数')?.value,
          rectificationRate: keyMetrics.find(m => m.title === '整改率')?.value,
          acceptanceRate: keyMetrics.find(m => m.title === '验收率')?.value,
          totalPersonnel: 7,
          onlinePersonnel: 5,
          busyPersonnel: 2,
          currentTasks: 56
        }}
      />
      
      {!isDrillDown ? (
        <div className="container mx-auto px-6 py-2 relative z-10">
          {/* 大屏标题 - 参考附件设计 */}
          <div className="relative mb-6">
            {/* 顶部背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f3a] via-[#0e2a47] to-[#0a1f3a] rounded-lg"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent"></div>
            
            {/* 顶部内容 */}
            <div className="relative px-6 py-4">
              <div className="flex justify-between items-center">
                {/* 左侧：LOGO + 返回按钮 + 选择菜单 */}
                <div className="flex items-center space-x-4">
                  {/* LOGO区域 */}
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-[#1e4976]/50 to-transparent rounded-lg border-l-4 border-[#00e5ff]">
                    <div className="text-[#00e5ff] font-bold text-xl tracking-wider">
                      <span className="bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">VCA</span>
                    </div>
                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#00e5ff] to-transparent"></div>
                    <div className="text-white font-medium text-sm">
                      一起安
                    </div>
                  </div>
                  
                  {/* 返回按钮 */}
                  <button 
                    onClick={handleGoHome}
                    className="group relative p-2.5 rounded-lg bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:from-[#00e5ff]/20 hover:to-[#00b8d4]/20 text-white transition-all duration-300 border border-[#1e4976] hover:border-[#00e5ff]"
                    aria-label="返回主页"
                  >
                    <ArrowLeft size={20} className="text-gray-400 group-hover:text-[#00e5ff] transition-colors" />
                  </button>
                  
                  {/* 选择菜单按钮 */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsSelectionMenuOpen(!isSelectionMenuOpen)}
                      className="selection-menu-button group relative p-2.5 rounded-lg bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:from-[#7b61ff]/20 hover:to-[#a78bfa]/20 text-white transition-all duration-300 border border-[#1e4976] hover:border-[#7b61ff] flex items-center space-x-2"
                      aria-label="选择菜单"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#7b61ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="text-sm font-medium text-gray-400 group-hover:text-[#7b61ff] transition-colors">功能菜单</span>
                      <span className="absolute -top-1 -right-1 bg-[#7b61ff] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">4</span>
                    </button>
                    
                    {/* 选择菜单下拉内容 */}
                    {isSelectionMenuOpen && (
                      <div className="selection-menu-content absolute left-0 mt-2 w-56 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl border-2 border-[#7b61ff] shadow-2xl shadow-[#7b61ff]/30 z-50 overflow-hidden animate-fadeIn">
                        {/* 菜单项容器 */}
                        <div className="space-y-1">
                          {/* 人员管理 */}
                          <div 
                            onClick={() => {
                              navigate('/people-management');
                              setIsSelectionMenuOpen(false);
                            }}
                            className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3.5 rounded-lg border border-[#1e4976] hover:border-[#00ffb2] transition-all duration-300 hover:shadow-lg hover:shadow-[#00ffb2]/20 overflow-hidden cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00ffb2]/0 to-[#00ffb2]/0 group-hover:from-[#00ffb2]/5 group-hover:to-[#00ffb2]/10 transition-all duration-300"></div>
                            <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00ffb2] to-transparent group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-[#00ffb2] transition-colors">人员管理</h3>
                                <div className="w-8 h-8 bg-green-100/20 rounded-full flex items-center justify-center border border-green-500/30">
                                  <svg className="w-5 h-5 text-[#00ffb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">管理系统用户和工作人员</p>
                            </div>
                          </div>
                          
                          {/* 任务管理 */}
                          <div 
                            onClick={() => {
                              navigate('/task-list');
                              setIsSelectionMenuOpen(false);
                            }}
                            className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3.5 rounded-lg border border-[#1e4976] hover:border-[#4ade80] transition-all duration-300 hover:shadow-lg hover:shadow-[#4ade80]/20 overflow-hidden cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/0 to-[#4ade80]/0 group-hover:from-[#4ade80]/5 group-hover:to-[#4ade80]/10 transition-all duration-300"></div>
                            <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#4ade80] to-transparent group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-[#4ade80] transition-colors">任务管理</h3>
                                <div className="w-8 h-8 bg-green-100/20 rounded-full flex items-center justify-center border border-green-500/30">
                                  <svg className="w-5 h-5 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">任务分配与追踪</p>
                            </div>
                          </div>
                          
                          {/* 建筑垃圾管理 */}
                          <div 
                            onClick={() => {
                              navigate('/construction-waste');
                              setIsSelectionMenuOpen(false);
                            }}
                            className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3.5 rounded-lg border border-[#1e4976] hover:border-[#ffc400] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc400]/20 overflow-hidden cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400]/0 to-[#ffc400]/0 group-hover:from-[#ffc400]/5 group-hover:to-[#ffc400]/10 transition-all duration-300"></div>
                            <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#ffc400] to-transparent group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-[#ffc400] transition-colors">建筑垃圾管理</h3>
                                <div className="w-8 h-8 bg-amber-100/20 rounded-full flex items-center justify-center border border-amber-500/30">
                                  <svg className="w-5 h-5 text-[#ffc400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">全链路监控</p>
                            </div>
                          </div>
                          
                          {/* 举报与事件处理 */}
                          <div 
                            onClick={() => {
                              navigate('/report-management');
                              setIsSelectionMenuOpen(false);
                            }}
                            className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3.5 rounded-lg border border-[#1e4976] hover:border-[#ff5e5e] transition-all duration-300 hover:shadow-lg hover:shadow-[#ff5e5e]/20 overflow-hidden cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ff5e5e]/0 to-[#ff5e5e]/0 group-hover:from-[#ff5e5e]/5 group-hover:to-[#ff5e5e]/10 transition-all duration-300"></div>
                            <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#ff5e5e] to-transparent group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-[#ff5e5e] transition-colors">举报与事件处理</h3>
                                <div className="w-8 h-8 bg-red-100/20 rounded-full flex items-center justify-center border border-red-500/30">
                                  <svg className="w-5 h-5 text-[#ff5e5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">处理市民举报</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 中间：主标题 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* 左侧装饰线 */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-32 h-px">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00e5ff] to-[#00e5ff]"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* 标题文字 */}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00e5ff] via-white to-[#00ffb2] bg-clip-text text-transparent whitespace-nowrap px-4">
                      良渚街道城市管理动态管控大屏
                    </h1>
                    
                    {/* 右侧装饰线 */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-32 h-px">
                      <div className="w-full h-full bg-gradient-to-l from-transparent via-[#00e5ff] to-[#00e5ff]"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* 右侧：全屏按钮 + 日期时间 */}
                <div className="flex items-center space-x-4">
                  {/* 全屏按钮 */}
                  <button 
                    onClick={handleToggleFullscreen}
                    className="group relative p-2.5 rounded-lg bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 hover:from-[#00e5ff]/20 hover:to-[#00b8d4]/20 text-white transition-all duration-300 border border-[#1e4976] hover:border-[#00e5ff]"
                    aria-label={isFullscreen ? '退出全屏' : '全屏'}
                    title={isFullscreen ? '退出全屏' : '全屏'}
                  >
                    {isFullscreen ? (
                      // 退出全屏图标
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00e5ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L3 3m0 0v6m0-6h6m12 0l-6 6m6-6v6m0-6h-6M3 21l6-6m-6 6h6m-6 0v-6m18 6l-6-6m6 6v-6m0 6h-6" />
                      </svg>
                    ) : (
                      // 全屏图标
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00e5ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                  
                  {/* 日期时间 */}
                  <div className="px-4 py-2 bg-gradient-to-r from-[#1e4976]/50 to-transparent rounded-lg border-r-4 border-[#00e5ff]">
                    <div className="flex flex-col items-end">
                      <div className="text-[#00e5ff] text-xs font-medium mb-0.5">
                        {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/-(\d{2})$/, '月$1日')}
                      </div>
                      <div className="text-white text-lg font-bold font-mono tracking-wider">
                        {currentTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 角落装饰 */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00e5ff]"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00e5ff]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00e5ff]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00e5ff]"></div>
          </div>
          
          {/* 功能模块行 - 单行横向滚动 */}
          <div className="mb-6 overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              {/* 城市管理模块 - 点击展示任务管理和车辆管理tab页面 */}
              <div 
                onClick={() => navigate('/urban-management')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">城市管理</h3>
                  <div className="text-[10px] text-gray-400 mt-1">显示任务数量</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">586</div>
                  <div className="text-[10px] text-gray-500">支持查看车辆管理（保洁、市政），出车几次</div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 序化管理模块 - 点击展示任务管理页面（序化管理） */}
              <div 
                onClick={() => navigate('/task-list?team=sequence')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">序化管理</h3>
                  <div className="text-[10px] text-gray-400 mt-1">显示任务数量</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">258</div>
                  <div className="text-[10px] text-gray-500">—任务管理</div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 建筑垃圾模块 */}
              <div 
                onClick={() => navigate('/construction-waste')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">建筑垃圾</h3>
                  <div className="text-[10px] text-gray-400 mt-1">点位数量</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">128</div>
                  <div className="h-3"></div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 垃圾分类模块 */}
              <div 
                onClick={() => handleDataClick('garbageClassification', '垃圾分类详情')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">垃圾分类</h3>
                  <div className="text-[10px] text-gray-400 mt-1">检查数量</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">280</div>
                  <div className="h-3"></div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 已征未用模块 */}
              <div 
                onClick={() => handleDataClick('acquiredUnused', '已征未用详情')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">已征未用</h3>
                  <div className="text-[10px] text-gray-400 mt-1">n块n亩</div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-baseline text-xl font-bold text-[#00e5ff] pb-1">
                    <div>15块</div>
                    <div className="ml-1">120亩</div>
                  </div>
                  <div className="h-3"></div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 人员管理模块 */}
              <div 
                onClick={() => navigate('/people-management')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">人员管理</h3>
                  <div className="text-[10px] text-gray-400 mt-1">队员数量、到岗数量</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">32/36</div>
                  <div className="h-3"></div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 事件整改模块 */}
              <div 
                onClick={() => handleDataClick('eventRectification', '事件整改详情')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">事件整改</h3>
                  <div className="text-[10px] text-gray-400 mt-1">实时状态监控</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">186</div>
                  <div className="text-[10px] text-gray-500">支持查看事件详情</div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 合同管理模块 */}
              <div 
                onClick={() => handleDataClick('contractManagement', '合同管理详情')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">合同管理</h3>
                  <div className="text-[10px] text-gray-400 mt-1">总数量、到期提醒</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">78</div>
                  <div className="text-[10px] text-gray-500">到期提醒</div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              
              {/* 基础数据维护模块 */}
              <div 
                onClick={() => navigate('/basic-data-maintenance')}
                className="group relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 rounded-lg border border-[#1e4976] hover:border-[#00e5ff] transition-all duration-300 hover:shadow-lg hover:shadow-[#00e5ff]/20 overflow-hidden cursor-pointer w-48 h-28 shrink-0 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 group-hover:from-[#00e5ff]/5 group-hover:to-[#00e5ff]/10 transition-all duration-300"></div>
                <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white truncate">基础数据维护</h3>
                  <div className="text-[10px] text-gray-400 mt-1">维护道路、公厕、绿化等基础数据</div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-bold text-[#00e5ff] pb-1">3类</div>
                  <div className="text-[10px] text-gray-500">支持增删改查</div>
                </div>
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-[#00e5ff]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </div>
          </div>
          
          {/* 主要内容区 - 四栏布局 - 包含右侧功能菜单 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧 - 城市管理团队统计 */}
            <div className="lg:col-span-3 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-xl border-2 border-[#00e5ff]/30 hover:border-[#00e5ff] transition-all duration-300 shadow-xl shadow-[#00e5ff]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#00e5ff] to-[#00ffb2] rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">城市管理团队</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-[#00e5ff]/20 border border-green-400/40 text-green-300 text-xs font-bold shadow-lg shadow-green-500/20">
                  <span className="animate-pulse">●</span> 4人在线
                </div>
              </div>
              
              {/* 任务完成情况 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#00e5ff]">任务完成情况</h3>
                  <span className="text-xs text-[#00ffb2] font-semibold">总计 36个</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">已完成</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-[#00e5ff] via-[#00ffb2] to-green-400 rounded-full shadow-lg shadow-green-400/50" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm text-[#00ffb2] font-bold w-8 text-right">27</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">进行中</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-[#00e5ff] rounded-full shadow-lg shadow-blue-400/50" style={{ width: '19%' }}></div>
                      </div>
                      <span className="text-sm text-blue-300 font-bold w-8 text-right">7</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">待处理</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg shadow-orange-400/50" style={{ width: '6%' }}></div>
                      </div>
                      <span className="text-sm text-orange-300 font-bold w-8 text-right">2</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 整改与验收情况 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gradient-to-br from-[#081c2f] to-[#0a1628] p-2.5 rounded-lg border border-[#00e5ff]/20 hover:border-[#00e5ff]/50 transition-all">
                  <div className="text-xs text-gray-400 mb-1">整改完成</div>
                  <div className="text-xl font-bold text-[#00e5ff]">23<span className="text-sm text-gray-500">/28</span></div>
                  <div className="text-xs text-green-400 mt-1 font-semibold">▲ 82%</div>
                </div>
                <div className="bg-gradient-to-br from-[#081c2f] to-[#0a1628] p-2.5 rounded-lg border border-[#00ffb2]/20 hover:border-[#00ffb2]/50 transition-all">
                  <div className="text-xs text-gray-400 mb-1">验收合格</div>
                  <div className="text-xl font-bold text-[#00ffb2]">18<span className="text-sm text-gray-500">/20</span></div>
                  <div className="text-xs text-green-400 mt-1 font-semibold">▲ 90%</div>
                </div>
              </div>
              
              {/* 区域分布情况 */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#00e5ff] mb-2 flex items-center">
                  <span className="w-1 h-4 bg-[#00e5ff] rounded-full mr-2"></span>
                  区域分布
                </h3>
                <div className="space-y-2">
                  {[
                    { area: '商业街区', count: 12, color: '#00e5ff' },
                    { area: '工业区块', count: 8, color: '#00ffb2' },
                    { area: '生态绿地', count: 10, color: '#4ade80' },
                    { area: '居民区', count: 6, color: '#34d399' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#081c2f]/30 p-2 rounded-lg hover:bg-[#081c2f]/60 transition-all">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2 shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                        <span className="text-xs text-gray-300 font-medium">{item.area}</span>
                      </div>
                      <span className="text-xs text-white font-bold">{item.count}个</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 职能分类TOP5 */}
              <div>
                <h3 className="text-sm font-bold text-[#00e5ff] mb-2 flex items-center">
                  <span className="w-1 h-4 bg-[#00e5ff] rounded-full mr-2"></span>
                  职能分类 TOP5
                </h3>
                <div className="space-y-2">
                  {[
                    { name: '垃圾分类', count: 10, percentage: 27.8 },
                    { name: '市政保洁', count: 9, percentage: 25.0 },
                    { name: '渣土管理', count: 9, percentage: 25.0 },
                    { name: '市政绿化', count: 7, percentage: 20.8 },
                    { name: '其他', count: 1, percentage: 0.8 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#081c2f]/30 p-2 rounded-lg hover:bg-[#081c2f]/60 transition-all">
                      <span className="text-xs text-gray-300 font-medium flex-1">{item.name}</span>
                      <div className="flex items-center flex-1">
                        <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden mx-2">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00e5ff] via-[#00d4e5] to-[#00ffb2] rounded-full shadow-lg shadow-[#00e5ff]/50" 
                            style={{ width: `${item.percentage * 4}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-white font-bold w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 中间 - 地图区域 */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-3 pb-2 rounded-xl border border-[#1e4976] hover:border-[#00e5ff]/50 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">良渚街道地图 - 永旺梦乐城周边</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-xs text-white bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span>城管团队 (4)</span>
                  </div>
                  <div className="flex items-center text-xs text-white bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/30">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    <span>序化团队 (3)</span>
                  </div>
                </div>
              </div>
              
              {/* 地图容器 */}
              <div className="relative w-full h-[600px] md:h-[600px] bg-[#081c2f] rounded-lg overflow-hidden group">
                {/* 可缩放和拖拽的地图图片 */}
                <div 
                  id="mapContainer"
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-200 cursor-move"
                  style={{
                    transform: `scale(${mapZoom}) translate(${mapPosition.x / mapZoom}px, ${mapPosition.y / mapZoom}px)`,
                    transformOrigin: 'center center'
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.15 : 0.15;
                    setMapZoom(prev => Math.min(Math.max(0.5, prev + delta), 4));
                  }}
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
                  }}
                  onMouseMove={(e) => {
                    if (isDragging) {
                      setMapPosition({
                        x: e.clientX - dragStart.x,
                        y: e.clientY - dragStart.y
                      });
                    }
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {/* 地图图片和标记的容器 - 相对定位，跟随地图移动 */}
                  <div className="relative max-w-full max-h-full">
                    {/* 使用本地地图图片 - 良渚永旺梦乐城周边卫星图 - 完整显示 */}
                    <img 
                      src="/static/image.png" 
                      alt="良渚街道地图 - 永旺梦乐城周边" 
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />
                    
                    {/* 点位标记 - 城管团队 - 跟随地图移动，可点击 */}
                    <div 
                      className="absolute top-[30%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('张队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">张队员</div>
                    </div>
                    <div 
                      className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('李队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">李队员</div>
                    </div>
                    <div 
                      className="absolute top-[70%] left-[75%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('陈队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">陈队员</div>
                    </div>
                    <div 
                      className="absolute top-[70%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('孙队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">孙队员</div>
                    </div>
                    
                    {/* 点位标记 - 序化团队 - 跟随地图移动，可点击 */}
                    <div 
                      className="absolute top-[60%] left-[45%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('王队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">王队员</div>
                    </div>
                    <div 
                      className="absolute top-[35%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('刘队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">刘队员</div>
                    </div>
                    <div 
                      className="absolute top-[50%] left-[80%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberClick('赵队员');
                      }}
                    >
                      <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                      <div className="bg-[#081c2f] text-white text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">赵队员</div>
                    </div>
                    
                    {/* 轨迹线显示 - 增强动画效果 */}
                    {selectedMember && trackHistory.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                        <defs>
                          {/* 渐变定义 */}
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ff6b00" stopOpacity="1" />
                          </linearGradient>
                          
                          {/* 流动动画 */}
                          <linearGradient id="movingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2">
                              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#00e5ff" stopOpacity="1">
                              <animate attributeName="offset" values="0.5;1.5" dur="2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.2">
                              <animate attributeName="offset" values="1;2" dur="2s" repeatCount="indefinite" />
                            </stop>
                          </linearGradient>
                          
                          {/* 辉光效果 */}
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* 绘制轨迹线 - 多层效果 */}
                        {trackHistory.slice(0, currentTrackIndex + 1).map((point, index) => {
                          if (index === 0) return null;
                          const prevPoint = trackHistory[index - 1];
                          const isRecent = index >= currentTrackIndex - 2;
                          
                          return (
                            <g key={`line-${index}`}>
                              {/* 底层辉光 */}
                              <line
                                x1={`${prevPoint.lng}%`}
                                y1={`${prevPoint.lat}%`}
                                x2={`${point.lng}%`}
                                y2={`${point.lat}%`}
                                stroke="#00e5ff"
                                strokeWidth="6"
                                strokeOpacity="0.2"
                                filter="url(#glow)"
                              />
                              {/* 主线 */}
                              <line
                                x1={`${prevPoint.lng}%`}
                                y1={`${prevPoint.lat}%`}
                                x2={`${point.lng}%`}
                                y2={`${point.lat}%`}
                                stroke={isRecent ? "url(#lineGradient)" : "#00e5ff"}
                                strokeWidth="3"
                                strokeDasharray={isRecent ? "0" : "8,4"}
                                strokeLinecap="round"
                                strokeOpacity={isRecent ? "1" : "0.6"}
                                className={isRecent ? "" : ""}
                              >
                                {isRecent && (
                                  <animate
                                    attributeName="stroke-dasharray"
                                    values="0,100;100,0"
                                    dur="0.6s"
                                    fill="freeze"
                                  />
                                )}
                              </line>
                              {/* 流动点 */}
                              {index === currentTrackIndex && (
                                <circle r="2" fill="#fff" opacity="0.8">
                                  <animateMotion
                                    dur="0.6s"
                                    repeatCount="1"
                                    path={`M ${prevPoint.lng},${prevPoint.lat} L ${point.lng},${point.lat}`}
                                  />
                                </circle>
                              )}
                            </g>
                          );
                        })}
                        
                        {/* 绘制轨迹点 - 增强效果 */}
                        {trackHistory.slice(0, currentTrackIndex + 1).map((point, index) => {
                          const isCurrent = index === currentTrackIndex;
                          const isStart = index === 0;
                          const isEnd = index === trackHistory.length - 1 && currentTrackIndex === trackHistory.length - 1;
                          
                          return (
                            <g key={`point-${index}`}>
                              {/* 外圈辉光 */}
                              {isCurrent && (
                                <>
                                  <circle
                                    cx={`${point.lng}%`}
                                    cy={`${point.lat}%`}
                                    r="12"
                                    fill="none"
                                    stroke="#ff6b00"
                                    strokeWidth="2"
                                    opacity="0.6"
                                  >
                                    <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                                  </circle>
                                  <circle
                                    cx={`${point.lng}%`}
                                    cy={`${point.lat}%`}
                                    r="8"
                                    fill="none"
                                    stroke="#ff6b00"
                                    strokeWidth="2"
                                    opacity="0.4"
                                  >
                                    <animate attributeName="r" values="8;14;8" dur="1s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.4;0;0.4" dur="1s" repeatCount="indefinite" />
                                  </circle>
                                </>
                              )}
                              
                              {/* 主点 */}
                              <circle
                                cx={`${point.lng}%`}
                                cy={`${point.lat}%`}
                                r={isCurrent ? "6" : isStart || isEnd ? "5" : "3"}
                                fill={isCurrent ? '#ff6b00' : isStart ? '#00ff00' : isEnd ? '#ff0000' : '#00e5ff'}
                                stroke="white"
                                strokeWidth="2"
                                filter={isCurrent ? "url(#glow)" : ""}
                              >
                                {isCurrent && (
                                  <animate attributeName="r" values="6;7;6" dur="0.8s" repeatCount="indefinite" />
                                )}
                              </circle>
                              
                              {/* 起点/终点标识 */}
                              {isStart && (
                                <text
                                  x={`${point.lng}%`}
                                  y={`${point.lat - 3}%`}
                                  fill="#00ff00"
                                  fontSize="10"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  filter="url(#glow)"
                                >
                                  起
                                </text>
                              )}
                              {isEnd && (
                                <text
                                  x={`${point.lng}%`}
                                  y={`${point.lat - 3}%`}
                                  fill="#ff0000"
                                  fontSize="10"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  filter="url(#glow)"
                                >
                                  终
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>
                {/* 缩放控制按钮 */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-[#0e2a47]/90 rounded-lg p-2 border border-[#1e4976] z-10">
                  <button
                    onClick={() => setMapZoom(prev => Math.min(prev + 0.3, 4))}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#00e5ff]/20 rounded transition-colors"
                    title="放大"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setMapZoom(prev => Math.max(prev - 0.3, 0.5))}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#00e5ff]/20 rounded transition-colors"
                    title="缩小"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setMapZoom(1);
                      setMapPosition({ x: 0, y: 0 });
                    }}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#00e5ff]/20 rounded transition-colors"
                    title="重置视图"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="text-center text-xs text-[#00e5ff] pt-1 border-t border-[#1e4976]">
                    {Math.round(mapZoom * 100)}%
                  </div>
                </div>
                
                {/* 图例说明 */}
                <div className="absolute bottom-4 right-4 bg-[#0e2a47]/90 p-3 rounded-lg border border-[#1e4976] text-xs text-white z-10">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                    <span>在线</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <span>忙碌</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span>离线</span>
                  </div>
                </div>
                
                {/* 轨迹回放控制面板 */}
                {selectedMember && (
                  <div 
                    className="fixed bg-[#0e2a47]/95 p-4 rounded-lg border border-[#00e5ff] text-white z-20 min-w-[350px] max-w-[400px] shadow-2xl"
                    style={{
                      left: `${panelPosition.x}px`,
                      top: `${panelPosition.y}px`,
                      cursor: isPanelDragging ? 'grabbing' : 'default',
                      userSelect: isPanelDragging ? 'none' : 'auto'
                    }}
                  >
                    <div 
                      className="panel-drag-handle flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing select-none"
                      onMouseDown={handlePanelMouseDown}
                    >
                      <h3 className="font-bold text-[#00e5ff] flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <User size={16} className="mr-2" />
                        {selectedMember} - 轨迹回放
                      </h3>
                      <button
                        onClick={handleCloseTrack}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* 时间段选择 */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-2">时间范围</div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <button
                          onClick={() => handleTimeRangeChange('today')}
                          className={`px-2 py-1.5 rounded text-xs transition-all ${
                            selectedTimeRange === 'today'
                              ? 'bg-[#00e5ff] text-[#0e2a47] font-bold'
                              : 'bg-[#081c2f] hover:bg-[#1e4976] text-gray-300'
                          }`}
                        >
                          今日
                        </button>
                        <button
                          onClick={() => handleTimeRangeChange('yesterday')}
                          className={`px-2 py-1.5 rounded text-xs transition-all ${
                            selectedTimeRange === 'yesterday'
                              ? 'bg-[#00e5ff] text-[#0e2a47] font-bold'
                              : 'bg-[#081c2f] hover:bg-[#1e4976] text-gray-300'
                          }`}
                        >
                          昨日
                        </button>
                        <button
                          onClick={() => handleTimeRangeChange('thisWeek')}
                          className={`px-2 py-1.5 rounded text-xs transition-all ${
                            selectedTimeRange === 'thisWeek'
                              ? 'bg-[#00e5ff] text-[#0e2a47] font-bold'
                              : 'bg-[#081c2f] hover:bg-[#1e4976] text-gray-300'
                          }`}
                        >
                          本周
                        </button>
                      </div>
                      <button
                        onClick={() => handleTimeRangeChange('custom')}
                        className={`w-full px-2 py-1.5 rounded text-xs transition-all ${
                          selectedTimeRange === 'custom'
                            ? 'bg-[#00e5ff] text-[#0e2a47] font-bold'
                            : 'bg-[#081c2f] hover:bg-[#1e4976] text-gray-300'
                        }`}
                      >
                        自定义时间段
                      </button>
                      
                      {/* 自定义时间段输入 */}
                      {selectedTimeRange === 'custom' && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="text-xs text-gray-400">起始时间</label>
                            <input
                              type="datetime-local"
                              value={customStartTime}
                              onChange={(e) => setCustomStartTime(e.target.value)}
                              className="w-full px-2 py-1 bg-[#081c2f] border border-[#1e4976] rounded text-xs text-white focus:border-[#00e5ff] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">结束时间</label>
                            <input
                              type="datetime-local"
                              value={customEndTime}
                              onChange={(e) => setCustomEndTime(e.target.value)}
                              className="w-full px-2 py-1 bg-[#081c2f] border border-[#1e4976] rounded text-xs text-white focus:border-[#00e5ff] outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 轨迹点数量提示 */}
                    <div className="mb-2 px-2 py-1 bg-[#081c2f] rounded text-xs text-gray-400">
                      共 {trackHistory.length} 个轨迹点
                    </div>
                    
                    {/* 当前位置信息 */}
                    {trackHistory[currentTrackIndex] && (
                      <div className="mb-3 p-2 bg-[#081c2f] rounded">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">时间:</span>
                          <span className="text-[#00e5ff]">{trackHistory[currentTrackIndex].time}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">动作:</span>
                          <span>{trackHistory[currentTrackIndex].action}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>进度: {currentTrackIndex + 1} / {trackHistory.length}</span>
                        <span>{Math.round(((currentTrackIndex + 1) / trackHistory.length) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00e5ff] transition-all duration-300"
                          style={{ width: `${((currentTrackIndex + 1) / trackHistory.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* 控制按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleResetTrack}
                        className="flex-1 px-3 py-2 bg-[#081c2f] hover:bg-[#1e4976] rounded transition-colors text-xs flex items-center justify-center"
                        title="重置"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={handlePlayPause}
                        className="flex-1 px-3 py-2 bg-[#00e5ff] hover:bg-[#00b8d4] rounded transition-colors text-xs flex items-center justify-center text-[#0e2a47] font-bold"
                      >
                        {isPlayingTrack ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                            暂停
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            播放
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 地图统计信息 - 优化间距 */}
              <div className="mt-1.5 grid grid-cols-2 md:grid-cols-4 gap-1.5">
                <div className="bg-[#081c2f] p-1.5 rounded-lg text-center border border-[#1e4976]/50 hover:border-[#00e5ff]/50 transition-all">
                  <div className="text-xs text-gray-400">总人员</div>
                  <div className="text-base font-bold text-white">7</div>
                </div>
                <div className="bg-[#081c2f] p-1.5 rounded-lg text-center border border-[#1e4976]/50 hover:border-green-500/50 transition-all">
                  <div className="text-xs text-gray-400">在线人员</div>
                  <div className="text-base font-bold text-green-400">5</div>
                </div>
                <div className="bg-[#081c2f] p-1.5 rounded-lg text-center border border-[#1e4976]/50 hover:border-red-500/50 transition-all">
                  <div className="text-xs text-gray-400">忙碌人员</div>
                  <div className="text-base font-bold text-red-400">2</div>
                </div>
                <div className="bg-[#081c2f] p-1.5 rounded-lg text-center border border-[#1e4976]/50 hover:border-[#00e5ff]/50 transition-all">
                  <div className="text-xs text-gray-400">当前任务</div>
                  <div className="text-base font-bold text-[#00e5ff]">56</div>
                </div>
              </div>
            </div>
            
            {/* 右侧 - 序化管理团队统计 */}
            <div className="lg:col-span-3 bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] p-4 rounded-xl border-2 border-[#4a9eff]/30 hover:border-[#4a9eff] transition-all duration-300 shadow-xl shadow-[#4a9eff]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#4a9eff] to-[#0ea5e9] rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#4a9eff] to-[#0ea5e9] bg-clip-text text-transparent">序化管理团队</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-sky-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold shadow-lg shadow-blue-500/20">
                  <span className="animate-pulse">●</span> 3人在线
                </div>
              </div>
              
              {/* 任务完成情况 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#4a9eff]">任务完成情况</h3>
                  <span className="text-xs text-[#0ea5e9] font-semibold">总计 28个</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">已完成</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-[#4a9eff] via-[#0ea5e9] to-green-400 rounded-full shadow-lg shadow-blue-400/50" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm text-[#0ea5e9] font-bold w-8 text-right">19</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">进行中</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-[#4a9eff] rounded-full shadow-lg shadow-sky-400/50" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm text-sky-300 font-bold w-8 text-right">7</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#081c2f]/50 p-2 rounded-lg">
                    <span className="text-xs text-gray-300 font-medium">待处理</span>
                    <div className="flex items-center">
                      <div className="w-28 h-2 bg-gray-700/50 rounded-full overflow-hidden mr-2">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-lg shadow-orange-400/50" style={{ width: '7%' }}></div>
                      </div>
                      <span className="text-sm text-orange-300 font-bold w-8 text-right">2</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 整改与验收情况 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gradient-to-br from-[#081c2f] to-[#0a1628] p-2.5 rounded-lg border border-[#4a9eff]/20 hover:border-[#4a9eff]/50 transition-all">
                  <div className="text-xs text-gray-400 mb-1">整改完成</div>
                  <div className="text-xl font-bold text-[#4a9eff]">15<span className="text-sm text-gray-500">/20</span></div>
                  <div className="text-xs text-green-400 mt-1 font-semibold">▲ 75%</div>
                </div>
                <div className="bg-gradient-to-br from-[#081c2f] to-[#0a1628] p-2.5 rounded-lg border border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 transition-all">
                  <div className="text-xs text-gray-400 mb-1">验收合格</div>
                  <div className="text-xl font-bold text-[#0ea5e9]">12<span className="text-sm text-gray-500">/15</span></div>
                  <div className="text-xs text-green-400 mt-1 font-semibold">▲ 80%</div>
                </div>
              </div>
              
              {/* 路线分布情况 */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#4a9eff] mb-2 flex items-center">
                  <span className="w-1 h-4 bg-[#4a9eff] rounded-full mr-2"></span>
                  路线分布
                </h3>
                <div className="space-y-2">
                  {[
                    { route: '主要商业街', count: 10, color: '#4a9eff' },
                    { route: '综合体内环路', count: 8, color: '#0ea5e9' },
                    { route: '商业辅路', count: 6, color: '#38bdf8' },
                    { area: '其他区域', count: 4, color: '#7dd3fc' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#081c2f]/30 p-2 rounded-lg hover:bg-[#081c2f]/60 transition-all">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2 shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                        <span className="text-xs text-gray-300 font-medium">{item.route || item.area}</span>
                      </div>
                      <span className="text-xs text-white font-bold">{item.count}个</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 职能分类TOP5 */}
              <div>
                <h3 className="text-sm font-bold text-[#4a9eff] mb-2 flex items-center">
                  <span className="w-1 h-4 bg-[#4a9eff] rounded-full mr-2"></span>
                  职能分类 TOP5
                </h3>
                <div className="space-y-2">
                  {[
                    { name: '出店经营', count: 7, percentage: 25 },
                    { name: '流动摊贩', count: 6, percentage: 21 },
                    { name: '沿街店铺', count: 5, percentage: 18 },
                    { name: '广告牌', count: 4, percentage: 14 },
                    { name: '违挡', count: 3, percentage: 11 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#081c2f]/30 p-2 rounded-lg hover:bg-[#081c2f]/60 transition-all">
                      <span className="text-xs text-gray-300 font-medium flex-1">{item.name}</span>
                      <div className="flex items-center flex-1">
                        <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden mx-2">
                          <div 
                            className="h-full bg-gradient-to-r from-[#4a9eff] via-[#0ea5e9] to-[#38bdf8] rounded-full shadow-lg shadow-[#4a9eff]/50" 
                            style={{ width: `${item.percentage * 3}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-white font-bold w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            

          </div>
          
          {/* 底部状态栏 - 优化顶部间距 */}
          <div className="mt-0 border-t border-[#1e4976] px-6 py-3 bg-[#091e33] text-xs text-white opacity-80">
            <div className="flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0">
                良渚街道城市管理动态管控大屏 - 实时数据监控系统
              </div>
              <div className="flex items-center space-x-6">
                 <div>系统状态: <span className="text-green-400">正常</span></div>
                 <div>数据加密: <span className="text-green-400">已启用</span></div>
                 <div>在线人数: <span className="text-[#00e5ff]">6</span></div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        // 下钻详情页面
        <div className="fixed inset-0 bg-[#081c2f] z-50 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {/* 详情页头部 */}
            <div className="flex flex-col space-y-4 mb-6 border-b border-[#1e4976] pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    onClick={handleCloseDrillDown} 
                    className="p-3 rounded-full bg-gradient-to-br from-[#00e5ff]/20 to-[#00b8d4]/20 hover:from-[#00e5ff] hover:to-[#00b8d4] text-[#00e5ff] hover:text-white transition-all duration-300 border border-[#00e5ff]/50 hover:border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10 mr-4"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-[#00e5ff]">{drillDownData.title}</h2>
                </div>
                
                {/* 操作按钮组 */}
                <div className="flex items-center space-x-3">
                  {/* 搜索框 */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="搜索关键词..."
                      className="pl-8 pr-3 py-1.5 bg-[#1e4976] text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5ff] w-48"
                    />
                    <Search size={16} className="absolute left-2 top-2 text-gray-400" />
                  </div>
                  
                  <button 
                    onClick={handleToggleFilter}
                    className={`flex items-center px-3 py-1.5 rounded-md transition-colors text-sm ${isFilterVisible ? 'bg-[#00e5ff] text-[#0e2a47] font-bold' : 'bg-[#1e4976] hover:bg-[#00e5ff] text-white'}`}
                  >
                    <Filter size={16} className="mr-1" />
                    筛选 {Object.keys(filterConditions).length > 0 && `(${Object.keys(filterConditions).length})`}
                  </button>
                  <button className="flex items-center px-3 py-1.5 bg-[#1e4976] hover:bg-[#00e5ff] text-white rounded-md transition-colors text-sm">
                    <Download size={16} className="mr-1" />
                    导出
                  </button>
                </div>
              </div>
              
              {/* Tab切换（仅对今日任务详情页面生效） */}
              {drillDownData.title === '今日任务详情' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'all' ? 'bg-[#00e5ff] text-[#0e2a47] shadow-sm' : 'bg-[#1e4976] hover:bg-[#00e5ff] text-white'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setActiveTab('urban')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'urban' ? 'bg-[#00e5ff] text-[#0e2a47] shadow-sm' : 'bg-[#1e4976] hover:bg-[#00e5ff] text-white'}`}
                  >
                    城市管理
                  </button>
                  <button
                    onClick={() => setActiveTab('sequence')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'sequence' ? 'bg-[#00e5ff] text-[#0e2a47] shadow-sm' : 'bg-[#1e4976] hover:bg-[#00e5ff] text-white'}`}
                  >
                    序化管理
                  </button>
                </div>
              )}
            </div>
            
            {/* 筛选面板 */}
            {isFilterVisible && (
              <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976] mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#00e5ff]">筛选条件</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-[#00e5ff] transition-colors"
                  >
                    清空筛选
                  </button>
                </div>
                
                {/* 仅显示附件中指定的筛选字段 */}
                {drillDownData.details.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* 仅保留以下筛选字段 */}
                    {['编号', '来源', '问题类型', '状态', '责任单位'].map(key => {
                      // 获取该字段的所有唯一值用于下拉选择
                      const uniqueValues = Array.from(
                        new Set(
                          drillDownData.details
                            .map(item => item[key])
                            .filter(val => val !== null && val !== undefined && val !== '')
                        )
                      ).slice(0, 20); // 最多显示20个选项
                      
                      return (
                        <div key={key}>
                          <label className="block text-xs text-gray-400 mb-1">{key}</label>
                          <select
                            value={filterConditions[key] || ''}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            className="w-full px-3 py-1.5 bg-[#081c2f] text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00e5ff]"
                          >
                            <option value="">全部</option>
                            {uniqueValues.map((val, idx) => (
                              <option key={idx} value={String(val)}>{String(val)}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* 筛选结果统计 - 仅显示筛选条件标签 */}
                {Object.keys(filterConditions).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1e4976]">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {Object.keys(filterConditions).map(key => {
                        let displayKey = key;
                        switch(key) {
                          case 'status': case '状态': displayKey = '状态'; break;
                          case 'area': case '区域': displayKey = '区域'; break;
                          case 'priority': case '优先级': displayKey = '优先级'; break;
                          case 'team': case '团队': displayKey = '团队'; break;
                          case 'type': case '类型': displayKey = '类型'; break;
                          case '编号': displayKey = '编号'; break;
                          case '来源': displayKey = '来源'; break;
                          case '问题类型': displayKey = '问题类型'; break;
                          case '责任单位': displayKey = '责任单位'; break;
                        }
                        return (
                          <span key={key} className="inline-flex items-center px-2 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded text-xs">
                            {displayKey}: {filterConditions[key]}
                            <button
                              onClick={() => handleFilterChange(key, '')}
                              className="ml-1 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 详情数据表格 */}
            <div className="bg-[#0e2a47] rounded-lg p-4 border border-[#1e4976]">
              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">暂无数据</div>
                  <div className="text-gray-500 text-sm">
                    {Object.keys(filterConditions).length > 0 || searchKeyword 
                      ? '请调整筛选条件或搜索关键词' 
                      : '暂无相关数据'}
                  </div>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#1e4976]">
                  <thead>
                    <tr>
                      {drillDownData.details.length > 0 && (
                        // 先获取过滤后的字段列表
                        Object.keys(drillDownData.details[0])
                          // 跳过复杂类型字段
                          .filter(key => {
                            const complexFields = ['事件信息', '整改信息', '验收确认', '进度跟踪'];
                            return !complexFields.includes(key);
                          })
                          // 渲染表头
                          .map((key) => {
                            // 根据不同的下钻类型，显示对应的列标题（全部为中文）
                            let displayKey = key;
                            switch(key) {
                              // 通用字段
                              case 'id': case '编号': displayKey = '编号'; break;
                              case 'name': case '姓名': displayKey = '姓名'; break;
                              case 'status': case '状态': displayKey = '状态'; break;
                              case 'area': case '区域': displayKey = '区域'; break;
                              
                              // 任务相关
                              case 'taskName': case '任务名称': displayKey = '任务名称'; break;
                              case 'assignee': case '负责人': displayKey = '负责人'; break;
                              case 'priority': case '优先级': displayKey = '优先级'; break;
                              case 'createTime': case '创建时间': displayKey = '创建时间'; break;
                              case 'completeTime': case '完成时间': displayKey = '完成时间'; break;
                              case 'todayTasks': case '今日任务': displayKey = '今日任务'; break;
                              
                              // 问题相关
                              case 'problemType': case '问题类型': displayKey = '问题类型'; break;
                              case 'location': case '地点': displayKey = '地点'; break;
                              case 'reporter': case '举报人': displayKey = '举报人'; break;
                              case 'reportTime': case '举报时间': displayKey = '举报时间'; break;
                              case 'handler': case '处理人': displayKey = '处理人'; break;
                              case 'solveTime': case '解决时间': displayKey = '解决时间'; break;
                              
                              // 建筑垃圾相关
                              case 'source': case '来源': displayKey = '来源'; break;
                              case 'destination': case '目的地': displayKey = '目的地'; break;
                              case 'volume': case '方量': displayKey = '方量'; break;
                              case 'startTime': case '开始时间': displayKey = '开始时间'; break;
                              case 'estimatedEndTime': case '预计完成': displayKey = '预计完成'; break;
                              case 'vehicle': case '车辆': displayKey = '车辆'; break;
                              
                              // 垃圾分类相关
                              case 'passRate': case '通过率': displayKey = '通过率'; break;
                              case 'inspectionCount': case '检查次数': displayKey = '检查次数'; break;
                              case 'problemCount': case '问题数': displayKey = '问题数'; break;
                              case 'lastInspection': case '最后检查': displayKey = '最后检查'; break;
                              case 'category': case '类别': displayKey = '类别'; break;
                              
                              // 整改相关
                              case 'rectificationDeadline': case '整改期限': displayKey = '整改期限'; break;
                              case 'completionRate': case '完成率': displayKey = '完成率'; break;
                              case 'responsibleUnit': case '责任单位': displayKey = '责任单位'; break;
                              case 'rectificationTime': case '整改时间': displayKey = '整改时间'; break;
                              
                              // 验收相关
                              case 'acceptanceResult': case '验收结果': displayKey = '验收结果'; break;
                              case 'acceptanceTime': case '验收时间': displayKey = '验收时间'; break;
                              case 'inspector': case '验收人': displayKey = '验收人'; break;
                              
                              // 信访相关
                              case 'petitioner': case '信访人': displayKey = '信访人'; break;
                              case 'type': case '类型': displayKey = '类型'; break;
                              case 'content': case '内容': displayKey = '内容'; break;
                              case 'submitTime': case '提交时间': displayKey = '提交时间'; break;
                              case 'department': case '处理部门': displayKey = '处理部门'; break;
                              
                              // 团队统计相关
                              case 'team': case '团队': displayKey = '团队'; break;
                              case 'totalTasks': case '总任务': displayKey = '总任务'; break;
                              case 'completed': case '已完成': displayKey = '已完成'; break;
                              case 'inProgress': case '进行中': displayKey = '进行中'; break;
                              case 'pending': case '待处理': displayKey = '待处理'; break;
                              
                              // 时效相关
                              case 'avgTime': case '平均时效': displayKey = '平均时效'; break;
                              case 'fastest': case '最快': displayKey = '最快'; break;
                              case 'slowest': case '最慢': displayKey = '最慢'; break;
                              case 'standard': case '标准时效': displayKey = '标准时效'; break;
                              
                              // 人员相关
                              case 'onlineTime': case '在线时长': displayKey = '在线时长'; break;
                              
                              // 区域相关
                              // 这些case子句已在文件其他地方定义
                              
                              // 统计相关
                              case 'count': case '数量': displayKey = '数量'; break;
                              case 'percentage': case '占比': displayKey = '占比'; break;
                              case 'trend': case '趋势': displayKey = '趋势'; break;
                              case 'change': case '变化率': displayKey = '变化率'; break;
                              
                              // 事件相关
                              case '事件等级': displayKey = '事件等级'; break;
                              case '事件类型': displayKey = '事件类型'; break;
                              case '事件来源': displayKey = '事件来源'; break;
                              case '预期整改时间': displayKey = '预期整改时间'; break;
                              case '提报人': displayKey = '提报人'; break;
                              case '提报时间': displayKey = '提报时间'; break;
                              case '事件位置': displayKey = '事件位置'; break;
                              case '整改完成时间': displayKey = '整改完成时间'; break;
                              case '整改人': displayKey = '整改人'; break;
                              case '所属部门': displayKey = '所属部门'; break;
                            }
                            return (
                              <th key={key} className="px-4 py-3 bg-[#081c2f] text-left text-xs font-medium text-[#00e5ff] uppercase tracking-wider">
                                {displayKey}
                              </th>
                            );
                          })
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-[#0e2a47] divide-y divide-[#1e4976]">
                    {filteredData.map((item, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-[#1e3a5f] transition-colors cursor-pointer"
                        onClick={() => handleRowClick(item)}
                      >
                        {/* 先获取过滤后的字段列表，确保与表头字段顺序一致 */}
                        {Object.keys(drillDownData.details[0])
                          // 使用相同的过滤逻辑
                          .filter(key => {
                            const complexFields = ['事件信息', '整改信息', '验收确认', '进度跟踪'];
                            return !complexFields.includes(key);
                          })
                          // 渲染表格行
                          .map((key) => {
                            const value = item[key];
                            
                            // 特殊格式化显示
                            if (key === '完成率' || key === 'completionRate') {
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 bg-[#081c2f] rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${value >= 90 ? 'bg-[#00ffb2]' : value >= 75 ? 'bg-[#00e5ff]' : 'bg-[#ffc400]'}`}
                                        style={{ width: `${value}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-white">{value}%</span>
                                  </div>
                                </td>
                              );
                            } else if (key === '状态' || key === 'status') {
                              // 状态样式
                              let statusClass = '';
                              if (value === '已完成' || value === '已解决' || value === '合格' || value === 'online') {
                                statusClass = 'bg-green-900/30 text-green-400';
                              } else if (value === '处理中' || value === '整改中' || value === '验收中' || value === '运输中' || value === 'busy') {
                                statusClass = 'bg-blue-900/30 text-blue-400';
                              } else if (value === '待处理' || value === '待整改' || value === '待运输' || value === '未开始' || value === 'pending') {
                                statusClass = 'bg-yellow-900/30 text-yellow-400';
                              } else if (value === '不合格' || value === 'offline') {
                                statusClass = 'bg-red-900/30 text-red-400';
                              }
                              
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                    {value}
                                  </span>
                                </td>
                              );
                            } else if (key === 'acceptanceResult' || key === '验收结果') {
                              // 验收结果样式
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === '合格' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {value}
                                  </span>
                                </td>
                              );
                            } else if (key === 'trend' || key === '趋势') {
                              // 趋势样式
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'up' ? 'bg-green-900/30 text-green-400' : value === 'down' ? 'bg-red-900/30 text-red-400' : 'bg-gray-900/30 text-gray-400'}`}>
                                    {value === 'up' ? '↑ 上升' : value === 'down' ? '↓ 下降' : '→ 稳定'}
                                  </span>
                                </td>
                              );
                            } else if (key === 'percentage' || key === '占比') {
                              // 百分比显示
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-[#00e5ff]">
                                  {value}%
                                </td>
                              );
                            } else if (key === 'change' || key === '变化率') {
                              // 变化率显示
                              return (
                                <td key={key} className={`px-4 py-3 whitespace-nowrap text-sm ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {value > 0 ? '+' : ''}{value}%
                                </td>
                              );
                            } else if (key === 'passRate' || key === '通过率') {
                              // 通过率显示
                              return (
                                <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-[#00e5ff]">
                                  {value}%
                                </td>
                              );
                            }
                            
                            // 普通文本显示
                            return (
                              <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-white">
                                {value}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
              
              {/* 分页信息 */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                <div>共 {filteredData.length} 条数据 {Object.keys(filterConditions).length > 0 || searchKeyword ? `（筛选后，总计 ${drillDownData.details.length} 条）` : ''}</div>
                <div className="flex items-center space-x-2">
                  <span>第 1 页 / 共 1 页</span>
                  <button className="px-2 py-1 bg-[#1e4976] hover:bg-[#00e5ff] rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    上一页
                  </button>
                  <button className="px-2 py-1 bg-[#1e4976] hover:bg-[#00e5ff] rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    下一页
                  </button>
                </div>
              </div>
            </div>
            
            {/* 详情页底部状态栏 */}
            <div className="mt-6 border-t border-[#1e4976] px-6 py-3 bg-[#091e33] text-xs text-white opacity-80">
              <div className="flex justify-between">
                <div>良渚街道城市管理动态管控大屏 - 详情数据</div>
                <div>更新时间: {lastUpdate}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 详情弹窗 */}
      {isDetailModalOpen && selectedRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-lg border border-[#1e4976] shadow-lg shadow-[#00e5ff]/20 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center p-4 border-b border-[#1e4976]">
              <h3 className="text-xl font-bold text-[#00e5ff]">详情信息</h3>
              <button 
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 弹窗内容 */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedRowData).map(([key, value]) => {
                  // 跳过复杂类型，或者特殊处理
                  if (Array.isArray(value) || typeof value === 'object' && value !== null) {
                    return null;
                  }
                  
                  // 格式化显示键名
                  const displayKey = key === 'id' ? '编号' : 
                                   key === 'type' ? '类型' : 
                                   key === 'location' ? '地点' : 
                                   key === 'deadline' ? '整改期限' : 
                                   key === 'status' ? '状态' : 
                                   key === 'completionRate' ? '完成率' : 
                                   key === 'responsibleUnit' ? '责任单位' : 
                                   key === 'reportTime' ? '上报时间' : 
                                   key === 'reporter' ? '上报人' : 
                                   key === 'description' ? '描述' : 
                                   key === 'rectificationTime' ? '整改时间' : 
                                   key === 'rectificationPerson' ? '整改人' : 
                                   key === 'acceptanceResult' ? '验收结果' : 
                                   key;
                  
                  // 格式化显示值
                  let displayValue = value;
                  if (key === 'status') {
                    displayValue = value === '已完成' || value === '已解决' ? '已完成' : 
                                  value === '处理中' || value === '整改中' || value === '验收中' ? '处理中' : 
                                  value === '待处理' || value === '待整改' ? '待处理' : 
                                  value;
                  } else if (key === 'completionRate') {
                    displayValue = `${value}%`;
                  }
                  
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">{displayKey}</span>
                      <span className="text-white font-medium">{displayValue}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* 复杂类型特殊处理 */}
              {selectedRowData['事件信息'] && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#00e5ff] mb-3">事件信息</h4>
                  <div className="bg-[#0a1f3a] p-3 rounded border border-[#1e4976]">
                    {Object.entries(selectedRowData['事件信息']).map(([key, value]) => (
                      <div key={key} className="flex items-center mb-2 last:mb-0">
                        <span className="text-xs text-gray-400 w-24">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRowData['整改信息'] && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#00e5ff] mb-3">整改信息</h4>
                  <div className="bg-[#0a1f3a] p-3 rounded border border-[#1e4976]">
                    {Object.entries(selectedRowData['整改信息']).map(([key, value]) => (
                      <div key={key} className="flex items-center mb-2 last:mb-0">
                        <span className="text-xs text-gray-400 w-24">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRowData['验收确认'] && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#00e5ff] mb-3">验收确认</h4>
                  <div className="bg-[#0a1f3a] p-3 rounded border border-[#1e4976]">
                    {Object.entries(selectedRowData['验收确认']).map(([key, value]) => (
                      <div key={key} className="flex items-center mb-2 last:mb-0">
                        <span className="text-xs text-gray-400 w-24">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRowData['进度跟踪'] && Array.isArray(selectedRowData['进度跟踪']) && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#00e5ff] mb-3">进度跟踪</h4>
                  <div className="bg-[#0a1f3a] p-3 rounded border border-[#1e4976]">
                    {selectedRowData['进度跟踪'].map((progress: any, index: number) => (
                      <div key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0 border-[#1e4976]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#00e5ff]">{progress.阶段}</span>
                          <span className="text-xs text-gray-400">{progress.时间}</span>
                        </div>
                        <div className="text-white text-sm">{progress.描述}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 弹窗底部 */}
            <div className="flex justify-end p-4 border-t border-[#1e4976]">
              <button 
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-[#1e4976] hover:bg-[#00e5ff] text-white rounded transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;