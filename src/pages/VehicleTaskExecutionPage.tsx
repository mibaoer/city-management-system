import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, AlertCircle, CheckCircle2, Camera, Image, Search, X, Truck, User, Scale, Calendar, Info } from "lucide-react";
import { toast } from "sonner";

// 接口定义
interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
    accuracy?: number;
}

interface Route {
    id: string;
    taskId: string;
    waypoints: LocationPoint[];
    distance: number;
    estimatedDuration: number;
    createdAt: string;
}

interface VehicleTrajectory {
    id: string;
    taskId: string;
    vehicleId: string;
    points: LocationPoint[];
    deviations: {
        point: LocationPoint;
        distanceFromRoute: number;
        timestamp: string;
    }[];
}

interface QRCodeData {
    taskId: string;
    timestamp: string;
    token: string;
    action: string;
}

interface TransportTask {
    id: string;
    driverId: string;
    vehicleId: string;
    startTime: string;
    endTime?: string;
    startLocation: string;
    endLocation: string;
    wasteType: string;
    weight: number;
    status: "pending" | "inProgress" | "completed" | "cancelled";
    photos?: string[];
    route?: Route;
    qrCode?: string;
    trajectory?: VehicleTrajectory;
}

// 模拟获取任务数据
const getTaskData = (taskId: string): Promise<TransportTask> => {
  // 模拟API调用延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟任务数据
      const mockTask: TransportTask = {
        id: taskId,
        driverId: "driver-1",
        vehicleId: "vehicle-1",
        startTime: new Date().toISOString(),
        startLocation: "朝阳区建筑工地A",
        endLocation: "通州区垃圾处理厂B",
        wasteType: "建筑垃圾",
        weight: 15.5,
        status: "inProgress",
        // 模拟生成的路线
        route: {
          id: `route-${taskId}`,
          taskId: taskId,
          waypoints: [
            { latitude: 39.9042, longitude: 116.4074, timestamp: new Date().toISOString() },
            { latitude: 39.9142, longitude: 116.4174, timestamp: new Date().toISOString() },
            { latitude: 39.9242, longitude: 116.4274, timestamp: new Date().toISOString() },
            { latitude: 39.9342, longitude: 116.4374, timestamp: new Date().toISOString() }
          ],
          distance: 5.2,
          estimatedDuration: 18,
          createdAt: new Date().toISOString()
        },
        // 模拟二维码
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(taskId)}`,
        // 初始轨迹
        trajectory: {
          id: `trajectory-${taskId}`,
          taskId: taskId,
          vehicleId: "vehicle-1",
          points: [],
          deviations: []
        }
      };
      resolve(mockTask);
    }, 500);
  });
};

// 计算两点之间的距离（简单实现）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // 转换为米
};

// 计算点到线段的最短距离
const pointToLineDistance = (
  point: LocationPoint, 
  lineStart: LocationPoint, 
  lineEnd: LocationPoint
): number => {
  const A = point.latitude - lineStart.latitude;
  const B = point.longitude - lineStart.longitude;
  const C = lineEnd.latitude - lineStart.latitude;
  const D = lineEnd.longitude - lineStart.longitude;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lineStart.latitude;
    yy = lineStart.longitude;
  } else if (param > 1) {
    xx = lineEnd.latitude;
    yy = lineEnd.longitude;
  } else {
    xx = lineStart.latitude + param * C;
    yy = lineStart.longitude + param * D;
  }
  
  return calculateDistance(point.latitude, point.longitude, xx, yy);
};

// 检查车辆是否偏离路线（简单实现）
const checkRouteDeviation = (point: LocationPoint, route: Route, deviationThreshold: number = 100): { isDeviated: boolean; distance: number } => {
  let minDistance = Infinity;
  
  // 检查点到路线中每条线段的最短距离
  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const distance = pointToLineDistance(point, route.waypoints[i], route.waypoints[i + 1]);
    minDistance = Math.min(minDistance, distance);
  }
  
  return {
    isDeviated: minDistance > deviationThreshold,
    distance: minDistance
  };
};

const VehicleTaskExecutionPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<TransportTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [deviationAlert, setDeviationAlert] = useState<{ show: boolean; distance: number }>({ show: false, distance: 0 });
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<{name: string, url: string, type: string}[]>([]);
  
  // 轨迹定时器引用
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 加载任务数据
  useEffect(() => {
    if (!taskId) {
      toast.error("未找到任务ID");
      navigate("/");
      return;
    }
    
    const loadTaskData = async () => {
      try {
        setLoading(true);
        const taskData = await getTaskData(taskId);
        setTask(taskData);
        // 模拟初始位置为起点
        if (taskData.route?.waypoints?.length > 0) {
          const initialLocation = {
            ...taskData.route.waypoints[0],
            timestamp: new Date().toISOString()
          };
          setCurrentLocation(initialLocation);
          
          // 更新轨迹
          setTask(prev => {
            if (!prev || !prev.trajectory) return prev;
            return {
              ...prev,
              trajectory: {
                ...prev.trajectory,
                points: [initialLocation]
              }
            };
          });
        }
      } catch (error) {
        toast.error("加载任务失败");
        console.error("加载任务失败:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTaskData();
    
    // 清理函数
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [taskId, navigate]);
  
  // 模拟位置更新
  const startLocationTracking = () => {
    if (!task?.route?.waypoints || task.route.waypoints.length === 0) {
      toast.error("任务路线数据不完整");
      return;
    }
    
    setIsLocationTracking(true);
    
    // 模拟车辆移动（实际项目中应使用真实的GPS定位）
    let waypointIndex = 0;
    const totalWaypoints = task.route.waypoints.length;
    
    locationIntervalRef.current = setInterval(() => {
      if (!task) return;
      
      // 模拟位置移动 - 实际项目中应使用真实的GPS数据
      const basePoint = task.route?.waypoints?.[Math.min(waypointIndex, totalWaypoints - 1)] || task.route?.waypoints?.[0];
      
      // 模拟轻微的位置变化，添加一些随机性
      const randomFactor = Math.random() * 0.002 - 0.001;
      const isDeviated = Math.random() < 0.1; // 10%概率模拟偏离路线
      
      const newLat = basePoint.latitude + (isDeviated ? randomFactor * 5 : randomFactor);
      const newLon = basePoint.longitude + (isDeviated ? randomFactor * 5 : randomFactor);
      
      const newLocation: LocationPoint = {
        latitude: newLat,
        longitude: newLon,
        timestamp: new Date().toISOString(),
        speed: Math.random() * 30 + 10, // 模拟速度10-40 km/h
        accuracy: 5 + Math.random() * 10 // 模拟精度
      };
      
      setCurrentLocation(newLocation);
      
      // 更新轨迹
      setTask(prev => {
        if (!prev || !prev.trajectory) return prev;
        return {
          ...prev,
          trajectory: {
            ...prev.trajectory,
            points: [...prev.trajectory.points, newLocation]
          }
        };
      });
      
      // 检查是否偏离路线
      if (task.route) {
        const deviationResult = checkRouteDeviation(newLocation, task.route, 50); // 50米阈值
        
        if (deviationResult.isDeviated) {
          setDeviationAlert({ show: true, distance: deviationResult.distance });
          
          // 记录偏离
          setTask(prev => {
            if (!prev || !prev.trajectory) return prev;
            return {
              ...prev,
              trajectory: {
                ...prev.trajectory,
                deviations: [
                  ...prev.trajectory.deviations,
                  {
                    point: newLocation,
                    distanceFromRoute: deviationResult.distance,
                    timestamp: new Date().toISOString()
                  }
                ]
              }
            };
          });
          
          // 模拟报警（实际项目中应播放声音或震动）
          toast.error(`偏离路线！距离路线${Math.round(deviationResult.distance)}米`);
        } else {
          setDeviationAlert({ show: false, distance: 0 });
        }
      }
      
      // 移动到下一个途经点
      if (waypointIndex < totalWaypoints - 1) {
        waypointIndex += 0.05; // 缓慢移动到下一个点
      }
      
    }, 2000); // 每2秒更新一次位置
  };
  
  const stopLocationTracking = () => {
    setIsLocationTracking(false);
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };
  
  // 处理照片上传
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    }
  };
  
  // 移除照片
  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };
  
  // 处理附件上传
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setUploadedAttachments([...uploadedAttachments, ...newAttachments]);
    }
  };
  
  // 移除附件
  const removeAttachment = (index: number) => {
    setUploadedAttachments(uploadedAttachments.filter((_, i) => i !== index));
  };
  
  // 验证二维码数据
  const validateQrCodeData = (qrData: QRCodeData): boolean => {
    // 1. 检查数据结构是否完整
    if (!qrData.taskId || !qrData.timestamp || !qrData.token || !qrData.action) {
      return false;
    }
    
    // 2. 检查任务ID是否匹配
    if (qrData.taskId !== taskId) {
      return false;
    }
    
    // 3. 检查操作类型是否正确
    if (qrData.action !== 'complete_task') {
      return false;
    }
    
    // 4. 检查时间戳是否在有效期内（例如24小时内）
    const qrTimestamp = new Date(qrData.timestamp).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - qrTimestamp;
    const maxValidTime = 24 * 60 * 60 * 1000; // 24小时
    
    if (timeDifference > maxValidTime) {
      return false;
    }
    
    // 5. 检查令牌格式（简化验证）
    if (!qrData.token.includes('-') || qrData.token.split('-').length !== 2) {
      return false;
    }
    
    return true;
  };
  
  // 处理任务核销
  const handleTaskVerification = (qrData: QRCodeData): boolean => {
    // 验证二维码数据
    if (!validateQrCodeData(qrData)) {
      return false;
    }
    
    // 模拟发送验证请求到服务器
    // 实际项目中应调用API进行验证
    console.log('验证任务:', qrData);
    
    return true;
  };
  
  // 提交终点照片并显示二维码
  const submitEndPhotos = () => {
    if (uploadedPhotos.length === 0) {
      toast.error("请至少上传一张终点照片");
      return;
    }
    
    // 模拟将照片和附件上传到服务器
    console.log('上传的照片:', uploadedPhotos);
    console.log('上传的附件:', uploadedAttachments);
    
    // 模拟上传成功
    toast.success(`成功上传 ${uploadedPhotos.length} 张照片和 ${uploadedAttachments.length} 个附件`);
    
    setShowPhotoUpload(false);
    setShowQrCodeModal(true);
  };
  
  // 完成任务
  const completeTask = () => {
    if (!taskId) return;
    
    // 模拟生成二维码数据进行验证
    const mockQRData: QRCodeData = {
      taskId: taskId,
      timestamp: new Date().toISOString(),
      token: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      action: 'complete_task'
    };
    
    // 验证并核销任务
    const verificationSuccess = handleTaskVerification(mockQRData);
    
    if (verificationSuccess) {
      // 实际项目中应调用API完成任务
      toast.success("任务已完成！");
      setShowQrCodeModal(false);
      
      // 更新任务状态为已完成
      if (task) {
        setTask(prev => prev ? { ...prev, status: 'completed', endTime: new Date().toISOString() } : null);
      }
      
      // 停止位置追踪
      stopLocationTracking();
      
      // 返回上一页
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      toast.error("二维码验证失败，请重试");
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">任务未找到</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white">
      {/* 顶部导航 */}
      <header className="bg-gradient-to-r from-[#0a1f3a] via-[#0e2a47] to-[#0a1f3a] border-b border-[#1e4976] shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-[#1e4976]/80 transition-colors"
            title="返回上一页"
          >
            <ArrowLeft size={24} className="text-[#00e5ff]" />
          </button>
          <h1 className="text-lg font-medium text-white">任务执行中</h1>
          <button 
            onClick={() => navigate('/construction-waste-application')}
            className="p-1 rounded-full hover:bg-[#1e4976]/80 transition-colors"
            title="建筑垃圾清运申请"
          >
            <Truck size={24} className="text-[#00e5ff]" />
          </button>
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-4">
        {/* 任务信息卡片 */}
        <div className="relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-lg border border-[#1e4976] overflow-hidden mb-4 transition-all duration-300 hover:shadow-[#00e5ff]/20">
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 hover:from-[#00e5ff]/5 hover:to-[#00e5ff]/10 transition-all duration-300"></div>
          
          {/* 左侧装饰线 */}
          <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
          
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-[#00e5ff]">任务信息</h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${task.status === 'inProgress' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
                {task.status === 'inProgress' ? '执行中' : '已完成'}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">任务ID:</span>
                <span className="font-medium text-white">{task.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">起点:</span>
                <span className="font-medium flex items-center gap-1 text-white">
                  <MapPin size={14} className="text-[#10b981]" />
                  {task.startLocation}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">终点:</span>
                <span className="font-medium flex items-center gap-1 text-white">
                  <MapPin size={14} className="text-[#ef4444]" />
                  {task.endLocation}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">垃圾类型:</span>
                <span className="font-medium text-white">{task.wasteType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">预计重量:</span>
                <span className="font-medium text-white">{task.weight} 吨</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">开始时间:</span>
                <span className="font-medium text-white">{new Date(task.startTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 地图和轨迹（简化版，实际项目中应集成地图库） */}
        <div className="relative bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-lg border border-[#1e4976] overflow-hidden mb-4 transition-all duration-300 hover:shadow-[#00e5ff]/20">
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/0 to-[#00e5ff]/0 hover:from-[#00e5ff]/5 hover:to-[#00e5ff]/10 transition-all duration-300"></div>
          
          {/* 左侧装饰线 */}
          <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-[#00e5ff] to-transparent group-hover:h-full transition-all duration-500"></div>
          
          <div className="relative z-10 p-4">
            <h2 className="text-base font-medium text-[#00e5ff] mb-4">实时位置和路线</h2>
            
            {/* 模拟地图显示区域 */}
            <div className="w-full h-72 bg-[#1e4976]/80 rounded-lg relative overflow-hidden flex items-center justify-center mb-4 border border-[#1e4976]">
              {/* 实际项目中应使用百度地图、高德地图等 */}
              <div className="text-gray-400 text-sm">
                地图显示区域
                {currentLocation && (
                  <div className="mt-2 text-xs">
                    当前位置: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </div>
                )}
              </div>
              
              {/* 绘制路线和轨迹（简化） */}
              {task.route?.waypoints && (
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  {/* 绘制规划路线 */}
                  <path 
                    d={`M${task.route.waypoints.map((wp, i) => 
                      `${(wp.longitude - 116.4) * 2000 + 100},${(39.95 - wp.latitude) * 2000 + 100}`
                    ).join(' L')}`} 
                    stroke="#3B82F6" 
                    strokeWidth="2" 
                    fill="none"
                  />
                  
                  {/* 绘制已行驶轨迹 */}
                  {task.trajectory?.points && task.trajectory.points.length > 1 && (
                    <path 
                      d={`M${task.trajectory.points.map((p) => 
                        `${(p.longitude - 116.4) * 2000 + 100},${(39.95 - p.latitude) * 2000 + 100}`
                      ).join(' L')}`} 
                      stroke="#10B981" 
                      strokeWidth="3" 
                      fill="none"
                    />
                  )}
                  
                  {/* 绘制偏离点（红色） */}
                  {task.trajectory?.deviations.map((dev, i) => (
                    <circle 
                      key={i}
                      cx={(dev.point.longitude - 116.4) * 2000 + 100}
                      cy={(39.95 - dev.point.latitude) * 2000 + 100}
                      r="4" 
                      fill="#EF4444"
                    />
                  ))}
                  
                  {/* 起点标记 */}
                  <circle 
                    cx={(task.route.waypoints[0].longitude - 116.4) * 2000 + 100}
                    cy={(39.95 - task.route.waypoints[0].latitude) * 2000 + 100}
                    r="6" 
                    fill="#10B981"
                  />
                  
                  {/* 终点标记 */}
                  <circle 
                    cx={(task.route.waypoints[task.route.waypoints.length - 1].longitude - 116.4) * 2000 + 100}
                    cy={(39.95 - task.route.waypoints[task.route.waypoints.length - 1].latitude) * 2000 + 100}
                    r="6" 
                    fill="#EF4444"
                  />
                  
                  {/* 当前位置标记 */}
                  {currentLocation && (
                    <circle 
                      cx={(currentLocation.longitude - 116.4) * 2000 + 100}
                      cy={(39.95 - currentLocation.latitude) * 2000 + 100}
                      r="8" 
                      fill="#3B82F6"
                    />
                  )}
                </svg>
              )}
            </div>
            
            {/* 位置追踪控制 */}
            <div className="flex justify-center gap-4">
              {isLocationTracking ? (
                <button 
                  onClick={stopLocationTracking}
                  className="px-4 py-3 bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 text-[#ef4444] border border-[#ef4444]/50 font-medium rounded-md hover:bg-[#ef4444]/30 flex items-center gap-2 transition-all duration-300"
                >
                  <StopCircle size={18} className="text-[#ef4444]" />
                  停止定位
                </button>
              ) : (
                <button 
                  onClick={startLocationTracking}
                  className="px-4 py-3 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 text-[#10b981] border border-[#10b981]/50 font-medium rounded-md hover:bg-[#10b981]/30 flex items-center gap-2 transition-all duration-300"
                >
                  <PlayCircle size={18} className="text-[#10b981]" />
                  开始定位
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 路线偏离警告 */}
        {deviationAlert.show && (
          <div className="relative bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 rounded-xl p-4 mb-4 border border-[#ef4444]/50 flex items-start gap-3 transition-all duration-300 hover:shadow-[#ef4444]/20">
            <AlertCircle size={20} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-[#ef4444]">路线偏离警告</h3>
              <p className="text-xs text-gray-300 mt-1">
                您已偏离规划路线 {Math.round(deviationAlert.distance)} 米，请尽快回到规划路线上行驶。
              </p>
            </div>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#0a1f3a] via-[#0e2a47] to-[#0a1f3a] border-t border-[#1e4976] p-4">
          <button 
            onClick={() => setShowPhotoUpload(true)}
            disabled={isLocationTracking}
            className={`w-full py-3 bg-gradient-to-br from-[#00e5ff]/20 to-[#0ea5e9]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-medium rounded-lg transition-all duration-300 ${isLocationTracking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00e5ff]/30 hover:border-[#00e5ff]'}`}
          >
            到达终点，上传照片并核销
          </button>
        </div>
      </main>
      
      {/* 照片上传模态框 */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border border-[#1e4976] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium text-[#00e5ff]">上传终点照片</h3>
              <button 
                onClick={() => setShowPhotoUpload(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} className="text-[#00e5ff]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-300 mb-4">请上传终点现场照片，至少1张</p>
              
              {/* 照片预览 */}
              {uploadedPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#1e4976]">
                      <img 
                        src={photo} 
                        alt={`上传照片 ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-[#1e4976]/80 rounded-full p-1 hover:bg-[#1e4976] transition-colors"
                      >
                        <X size={16} className="text-[#ef4444]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 上传按钮 */}
              <div className="flex gap-3">
                <label 
                  className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[#1e4976] rounded-md cursor-pointer bg-[#1e4976]/80 hover:bg-[#1e4976] transition-all duration-300"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Camera size={24} className="text-[#00e5ff]" />
                  <span className="mt-1 text-xs text-gray-300">拍照</span>
                </label>
                
                <label 
                  className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[#1e4976] rounded-md cursor-pointer bg-[#1e4976]/80 hover:bg-[#1e4976] transition-all duration-300"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Image size={24} className="text-[#00e5ff]" />
                  <span className="mt-1 text-xs text-gray-300">从相册选择</span>
                </label>
              </div>
              
              {/* 附件上传 */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-[#00e5ff] mb-3">上传附件</h4>
                
                {/* 附件预览 */}
                {uploadedAttachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {uploadedAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#1e4976]/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#00e5ff]/20 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00e5ff]">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-white truncate max-w-xs">{attachment.name}</p>
                            <p className="text-xs text-gray-400">{attachment.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeAttachment(index)}
                          className="p-1 rounded-full hover:bg-[#ef4444]/30 transition-colors"
                        >
                          <X size={16} className="text-gray-400 hover:text-[#ef4444]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 附件上传按钮 */}
                <label 
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-[#1e4976] rounded-md cursor-pointer bg-[#1e4976]/80 hover:bg-[#1e4976] transition-all duration-300"
                >
                  <input 
                    type="file" 
                    accept="*"
                    multiple 
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00e5ff]">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="mt-2 text-xs text-gray-300">上传附件</span>
                  <span className="mt-1 text-xs text-gray-400">支持视频、文档等</span>
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#1e4976] flex gap-3">
              <button 
                onClick={() => setShowPhotoUpload(false)}
                className="flex-1 py-3 bg-gradient-to-br from-[#1e4976]/80 to-[#0e2a47]/80 text-gray-300 border border-[#1e4976] font-medium rounded-lg hover:bg-[#1e4976] hover:text-white transition-all duration-300"
              >
                取消
              </button>
              <button 
                onClick={submitEndPhotos}
                disabled={uploadedPhotos.length === 0}
                className={`flex-1 py-3 bg-gradient-to-br from-[#00e5ff]/20 to-[#0ea5e9]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-medium rounded-lg transition-all duration-300 ${uploadedPhotos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00e5ff]/30 hover:border-[#00e5ff]'}`}
              >
                提交并生成二维码
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 二维码核销模态框 */}
      {showQrCodeModal && task.qrCode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-xl shadow-2xl border border-[#1e4976] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1e4976]">
              <h3 className="text-lg font-medium text-[#00e5ff]">任务核销</h3>
              <button 
                onClick={() => setShowQrCodeModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} className="text-[#00e5ff]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
              <p className="text-sm text-gray-300 mb-4 text-center">请在终点扫描此二维码完成任务</p>
              
              <div className="mb-4 p-3 bg-[#00e5ff]/20 border border-[#00e5ff]/50 rounded-lg flex items-start gap-2">
                <Info size={18} className="text-[#00e5ff] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#00e5ff]">请在终点向管理员出示此二维码进行核销</p>
              </div>
              
              {/* 二维码显示 */}
              <div className="mb-6 bg-[#1e4976]/80 p-3 border border-[#1e4976] rounded-lg shadow-sm">
                <img 
                  src={task.qrCode} 
                  alt="任务核销二维码" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <p className="text-xs text-gray-500 mb-6 text-center">
                此二维码为任务 {task.id} 的唯一核销码<br />
                仅在任务完成时有效
              </p>
              
              {/* 模拟扫码成功 */}
              <button 
                onClick={completeTask}
                className="px-6 py-3 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 text-[#10b981] border border-[#10b981]/50 font-medium rounded-md hover:bg-[#10b981]/30 flex items-center gap-2 transition-all duration-300"
              >
                <CheckCircle2 size={18} className="text-[#10b981]" />
                模拟扫码成功，完成任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTaskExecutionPage;

// 补充缺失的组件定义 - 实际项目中应从lucide-react导入
const PlayCircle = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const StopCircle = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <rect x="8" y="8" width="8" height="8" />
  </svg>
);
