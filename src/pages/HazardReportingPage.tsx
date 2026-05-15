import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    ArrowLeft,
    Camera,
    Image,
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Users,
    ChevronDown,
    X,
} from "lucide-react";

import { toast } from "sonner";
import { Person } from "./PeopleManagementPage";
import { usePeople } from "@/hooks/usePeople";

interface HazardType {
    id: string;
    name: string;
}

type HazardStatus = "pendingConfirm" | "pending" | "processing" | "completed" | "rejected" | "refused" | "cancelled";

interface ImageInfo {
    id: string;
    type: "hazard" | "rectification";
    url: string;
    description?: string;
}

interface Hazard {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    images: ImageInfo[];
    status: HazardStatus;
    reportTime: string;
    reporter: string;
    hazardLevel: string;
    rectificationMethod: string;
    rectificationDeadline: string;
    assignedPerson: string;
    整改负责人?: string;
    completionTime?: string;
    验收人?: string;
    验收意见?: string;
}

const HazardReportingPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { getAllPeople } = usePeople();
    
    // 当前用户信息 - 模拟数据，实际应该从登录状态或API获取
    const [currentUser] = useState<Person>({
        id: '2',
        name: '李四',
        department: '城管团队',
        position: '队长',
        personType: '管理人员', // 默认是管理人员
        phone: '13800138002',
        email: 'lisi@example.com',
        isActive: true,
        functionType: ['流动摊贩', '出店经营']
    });
    
    // 获取所有人员
    const allActivePeople = getAllPeople().filter(person => person.isActive);
    
    // 根据页面和人员类型筛选可选择的处理人员
    const getAvailableProcessPeople = (pageType: 'report' | 'process' | 'check') => {
        if (pageType === 'report') {
            // 随手拍页面：可以选择所有人员
            return allActivePeople;
        } else if (pageType === 'process') {
            // 事件整改页面：只能选择任务跟踪人员
            return allActivePeople.filter(person => person.personType === '任务跟踪人员');
        } else if (pageType === 'check') {
            // 事件验收页面：可以选择所有管理人员（包括提出事件的人员）
            return allActivePeople.filter(person => person.personType === '管理人员');
        }
        
        return allActivePeople; // 默认返回所有人员
    };

    const initialTab = (() => {
        const tabParam = searchParams.get("tab");

        if (tabParam === "process" || tabParam === "check") {
            return tabParam;
        }

        return "report";
    })();

    // 标签页状态管理
    const [activeTab, setActiveTab] = useState<string>(initialTab === 'report' || initialTab === 'process' || initialTab === 'check' ? 'report' : initialTab);

    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [selectedHazardForRefuse, setSelectedHazardForRefuse] = useState<string | null>(null);
    const [refuseReason, setRefuseReason] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [descriptionFilter, setDescriptionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [eventTab, setEventTab] = useState<'pendingConfirm' | 'pending' | 'all'>('pendingConfirm');

    // 整改详情状态
    const [showRectificationModal, setShowRectificationModal] = useState(false);
    const [rectificationImages, setRectificationImages] = useState<string[]>([]);
    const [rectificationDescription, setRectificationDescription] = useState("");
    const [signature, setSignature] = useState<string>("");
    
    // 验收详情状态
    const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
    const [acceptanceImages, setAcceptanceImages] = useState<string[]>([]);
    const [acceptanceDescription, setAcceptanceDescription] = useState("");
    const [acceptanceSignature, setAcceptanceSignature] = useState<string>("");
    
    // 验收驳回状态
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    
    // 转交状态
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedTransferUser, setSelectedTransferUser] = useState("");
    const [transferRemark, setTransferRemark] = useState("");

    // 无效原因弹窗
    const [showInvalidModal, setShowInvalidModal] = useState(false);
    const [invalidReason, setInvalidReason] = useState("");

     const [hazardTypes] = useState<HazardType[]>([{
        id: "1",
        name: "广告牌"
    }, {
        id: "2",
        name: "违挡"
    }, {
        id: "3",
        name: "沿街店铺"
    }, {
        id: "4",
        name: "城市绿化"
    }, {
        id: "5",
        name: "墙体倒塌"
    }, {
        id: "6",
        name: "修路开挖"
    }, {
        id: "7",
        name: "流动摊贩"
    }, {
        id: "8",
        name: "地铁口管理"
    }, {
        id: "9",
        name: "人行道违停"
    }, {
        id: "10",
        name: "出店经营"
    }, {
        id: "11",
        name: "工地"
    }, {
        id: "12",
        name: "市政设施安全巡查"
    }]);

    const [hazards, setHazards] = useState<Hazard[]>([{
        id: "1",
        title: "小区垃圾桶满溢",
        description: "3号楼前的垃圾桶已经满溢，影响环境",
        location: "3号楼前",
        type: "垃圾堆积",

        images: [{
            id: "img1-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Garbage%20bin%20overflow%20in%20residential%20area&sign=84003e5d30d11a9ce3b149311be6cdc1",
            description: "垃圾桶满溢情况"
        }],

        status: "pendingConfirm",
        reportTime: "2025-10-20 10:30",
        reporter: "张三",
        hazardLevel: "一般",
        rectificationMethod: "限期整改",
        rectificationDeadline: "2025-10-25",
        assignedPerson: "李四",
        整改负责人: "高主任、陈主任"
    }, {
        id: "2",
        title: "分类指示牌损坏",
        description: "垃圾分类指示牌被破坏，需要更换",
        location: "小区入口处",
        type: "设施损坏",

        images: [{
            id: "img2-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Damaged%20garbage%20classification%20signboard&sign=f9faf66aca24536b43ef25f2d940dfa1",
            description: "损坏的指示牌"
        }],

        status: "processing",
        reportTime: "2025-10-20 09:15",
        reporter: "李四",
        hazardLevel: "一般",
        rectificationMethod: "立即整改",
        rectificationDeadline: "2025-10-22",
        assignedPerson: "王五",
        整改负责人: "王五"
    }, {
        id: "3",
        title: "路面破损严重",
        description: "主干道有多处坑洼，影响出行安全",
        location: "中心大道",
        type: "道路问题",

        images: [{
            id: "img3-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Severe%20road%20damage%20with%20potholes&sign=8ec12ff8f58705b0343ca5572064ae4e",
            description: "路面坑洼情况"
        }, {
            id: "img3-2",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Uneven%20road%20surface%20affecting%20traffic&sign=687f8250b32f50ce1d7264b38bc2bf65",
            description: "影响交通的不平整路面"
        }],

        status: "processing",
        reportTime: "2025-10-19 15:45",
        reporter: "王五",
        hazardLevel: "特急",
        rectificationMethod: "立即整改",
        rectificationDeadline: "2025-10-24",
        assignedPerson: "赵六",
        整改负责人: "赵六"
    }, {
        id: "4",
        title: "绿化带有垃圾堆积",
        description: "东区绿化带内有大量垃圾未清理",
        location: "东区绿化带",
        type: "环境问题",

        images: [{
            id: "img4-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Garbage%20piles%20in%20green%20belt&sign=70c038f528d3d9ac2ac02f2c55e90b0b",
            description: "绿化带内的垃圾堆积"
        }, {
            id: "img4-2",
            type: "rectification",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Clean%20green%20belt%20after%20rectification&sign=9f297c20c58bca713a0099194efc3d24",
            description: "整改后的干净绿化带"
        }],

        status: "completed",
        reportTime: "2025-10-18 11:20",
        reporter: "赵六",
        hazardLevel: "一般",
        rectificationMethod: "限期整改",
        rectificationDeadline: "2025-10-21",
        assignedPerson: "钱七",
        整改负责人: "钱七",
        completionTime: "2025-10-20 14:30",
        验收人: "孙八",
        验收意见: "验收通过"
    }, {
        id: "5",
        title: "路灯不亮",
        description: "西区路灯多个不亮，存在安全事件",
        location: "西区道路",
        type: "设施问题",

        images: [{
            id: "img5-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Street%20lights%20not%20working%20at%20night&sign=b959ebd1d8c380563473aaa99d6c78a4",
            description: "夜晚不亮的路灯"
        }],

        status: "rejected",
        reportTime: "2025-10-17 19:00",
        reporter: "孙八",
        hazardLevel: "一般",
        rectificationMethod: "限期整改",
        rectificationDeadline: "2025-10-20",
        assignedPerson: "周九",
        整改负责人: "周九",
        completionTime: "2025-10-20 10:15",
        验收人: "吴十",
        验收意见: "验收驳回 - 部分路灯仍不亮"
    }, {
        id: "6",
        title: "人行道地砖松动",
        description: "商业街人行道多处地砖松动，行人容易绊倒",
        location: "商业街人行道",
        type: "设施损坏",
        images: [{
            id: "img6-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Loose%20paving%20bricks%20on%20sidewalk&sign=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
            description: "松动的人行道地砖"
        }],
        status: "pendingConfirm",
        reportTime: "2025-10-21 08:30",
        reporter: "郑十一",
        hazardLevel: "一般",
        rectificationMethod: "限期整改",
        rectificationDeadline: "2025-10-26",
        assignedPerson: "李四",
        整改负责人: "高主任、陈主任"
    }, {
        id: "7",
        title: "河道漂浮垃圾",
        description: "清河段河道内有大量漂浮垃圾，影响水质和环境",
        location: "清河段",
        type: "环境问题",
        images: [{
            id: "img7-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Floating%20garbage%20in%20river&sign=b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
            description: "河道漂浮垃圾"
        }],
        status: "pending",
        reportTime: "2025-10-20 14:00",
        reporter: "王十二",
        hazardLevel: "一般",
        rectificationMethod: "立即整改",
        rectificationDeadline: "2025-10-23",
        assignedPerson: "赵六",
        整改负责人: "赵六",
        确认人: "高主任",
        确认时间: "2025-10-21 09:00",
        确认结果: "有效事件"
    }, {
        id: "8",
        title: "违规搭建雨棚",
        description: "小区内多处违规搭建雨棚，影响消防安全",
        location: "阳光小区",
        type: "违建问题",
        images: [{
            id: "img8-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Illegal%20rain%20canopy%20in%20residential%20area&sign=c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
            description: "违规搭建的雨棚"
        }],
        status: "processing",
        reportTime: "2025-10-19 11:30",
        reporter: "刘十三",
        hazardLevel: "特急",
        rectificationMethod: "限期整改",
        rectificationDeadline: "2025-10-28",
        assignedPerson: "钱七",
        整改负责人: "钱七",
        确认人: "陈主任",
        确认时间: "2025-10-20 08:30",
        确认结果: "有效事件"
    }, {
        id: "9",
        title: "小区飞线充电",
        description: "3栋有住户从窗户拉线给电动车充电，存在安全隐患",
        location: "幸福花园3栋",
        type: "安全隐患",
        images: [{
            id: "img9-1",
            type: "hazard",
            url: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Electric%20bike%20charging%20cable%20from%20window&sign=d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
            description: "飞线充电情况"
        }],
        status: "cancelled",
        reportTime: "2025-10-18 16:45",
        reporter: "陈十四",
        hazardLevel: "一般",
        rectificationMethod: "立即整改",
        rectificationDeadline: "2025-10-19",
        assignedPerson: "孙八",
        确认人: "高主任",
        确认时间: "2025-10-19 09:00",
        确认结果: "无效事件",
        无效原因: "经核实，该住户为物业临时应急充电设备，非飞线充电行为"
    }]);

    interface Department {
        id: string;
        name: string;
        members: Person[];
    }

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        type: "",
        hazardLevel: "",
        rectificationMethod: "",
        rectificationDeadline: "",
        assignedPerson: "",
        images: [] as File[]
    });
    
    // 签到/签退状态管理
    const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
    const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
    const [checkInTime, setCheckInTime] = useState<string>("");
    const [checkOutTime, setCheckOutTime] = useState<string>("");
    const [checkInLocation, setCheckInLocation] = useState<string>("");
    const [checkOutLocation, setCheckOutLocation] = useState<string>("");
    const [checkInImage, setCheckInImage] = useState<string>("");
    const [checkOutImage, setCheckOutImage] = useState<string>("");
    const [showCheckInImageModal, setShowCheckInImageModal] = useState<boolean>(false);
    const [showCheckOutImageModal, setShowCheckOutImageModal] = useState<boolean>(false);
    const [tempCheckInImage, setTempCheckInImage] = useState<string>("");
    const [tempCheckOutImage, setTempCheckOutImage] = useState<string>("");

    const [showPersonSelector, setShowPersonSelector] = useState(false);

    const [departments] = useState<Department[]>([{
        id: "dept1",
        name: "城管团队",

        members: [{
            id: "user1",
            name: "张三",
            departmentId: "dept1"
        }, {
            id: "user2",
            name: "李四",
            departmentId: "dept1"
        }, {
            id: "user3",
            name: "王五",
            departmentId: "dept1"
        }]
    }, {
        id: "dept2",
        name: "序化管理团队",

        members: [{
            id: "user4",
            name: "赵六",
            departmentId: "dept2"
        }, {
            id: "user5",
            name: "钱七",
            departmentId: "dept2"
        }, {
            id: "user6",
            name: "孙八",
            departmentId: "dept2"
        }]
    }]);

    const handleSelectPerson = (person: Person) => {
        // 直接使用人员名称作为处理人，不再依赖departments状态
        // 显示格式为：姓名 (人员类型)
        const displayName = `${person.name} (${person.personType === '管理人员' ? '管理人员' : '任务跟踪人员'})`;

        setFormData(prev => ({
            ...prev,
            assignedPerson: displayName
        }));

        setShowPersonSelector(false);
    };

    const openPersonSelector = () => {
        setShowPersonSelector(true);
    };

    const closePersonSelector = () => {
        setShowPersonSelector(false);
    };

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // 签到功能 - 打开照片上传模态框
    const handleCheckIn = () => {
        setShowCheckInImageModal(true);
    };
    
    // 处理签到照片上传
    const handleCheckInImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // 使用默认地址作为位置信息
            const defaultAddress = "浙江省杭州市余杭区良渚路166号";
            const watermarkedImage = await addWatermarkToImage(file, defaultAddress);
            setTempCheckInImage(watermarkedImage);
        }
    };
    
    // 确认签到
    const confirmCheckIn = () => {
        if (!tempCheckInImage) {
            toast.error("请上传签到照片");
            return;
        }
        
        // 获取当前时间
        const now = new Date();
        const formattedTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 保存照片并完成签到
        setCheckInImage(tempCheckInImage);
        useDefaultAddressForCheckIn(formattedTime);
        setShowCheckInImageModal(false);
        setTempCheckInImage("");
    };
    
    // 使用默认地址进行签到
    const useDefaultAddressForCheckIn = (formattedTime: string) => {
        const defaultAddress = "浙江省杭州市余杭区良渚路166号";
        setCheckInLocation(defaultAddress);
        setCheckInTime(formattedTime);
        setHasCheckedIn(true);
        setHasCheckedOut(false);
        setCheckOutTime("");
        setCheckOutLocation("");
        toast.success(`已使用默认地址签到: ${defaultAddress}`);
    };
    
    // 分配随机地址
    const assignRandomAddress = (latitude: number, longitude: number): Promise<string> => {
        return new Promise(resolve => {
            const mockAddresses = [
                "浙江省杭州市余杭区良渚路166号",
                "浙江省杭州市余杭区文一西路969号",
                "浙江省杭州市江干区钱江新城解放东路58号",
                "浙江省杭州市滨江区江南大道3786号",
                "浙江省杭州市拱墅区湖墅南路186号",
                "浙江省杭州市上城区延安路258号"
            ];

            const pseudoRandomIndex = Math.floor((Math.abs(latitude) + Math.abs(longitude)) * 10000) % mockAddresses.length;
            resolve(mockAddresses[pseudoRandomIndex]);
        });
    };
    
    // 签退功能 - 打开照片上传模态框
    const handleCheckOut = () => {
        if (!hasCheckedIn) {
            toast.error("请先签到再签退");
            return;
        }
        
        setShowCheckOutImageModal(true);
    };
    
    // 处理签退照片上传
    const handleCheckOutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // 使用默认地址作为位置信息
            const defaultAddress = "浙江省杭州市余杭区良渚路166号";
            const watermarkedImage = await addWatermarkToImage(file, defaultAddress);
            setTempCheckOutImage(watermarkedImage);
        }
    };
    
    // 确认签退
    const confirmCheckOut = () => {
        if (!tempCheckOutImage) {
            toast.error("请上传签退照片");
            return;
        }
        
        // 获取当前时间
        const now = new Date();
        const formattedTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 保存照片并完成签退
        setCheckOutImage(tempCheckOutImage);
        useDefaultAddressForCheckOut(formattedTime);
        setShowCheckOutImageModal(false);
        setTempCheckOutImage("");
    };
    
    // 使用默认地址进行签退
    const useDefaultAddressForCheckOut = (formattedTime: string) => {
        const defaultAddress = "浙江省杭州市余杭区良渚路166号";
        setCheckOutLocation(defaultAddress);
        setCheckOutTime(formattedTime);
        setHasCheckedOut(true);
        toast.success(`已使用默认地址签退: ${defaultAddress}`);
    };

  const addWatermarkToImage = (file: File, location: string): Promise<string> => {
    return new Promise(resolve => {
      try {
        const reader = new FileReader();

        reader.onload = event => {
          try {
            // 使用 document.createElement 创建 img 元素而不是 new Image()
            const img = document.createElement('img');

            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  resolve(URL.createObjectURL(file));
                  return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // 添加半透明背景
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                
                // 设置字体样式
                ctx.font = "bold 14px Arial";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
                ctx.lineWidth = 1;
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                
                const now = new Date();
                const formattedTime = now.toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });

                const watermarkText = `${location || "未知位置"} - ${formattedTime}`;
                const textMetrics = ctx.measureText(watermarkText);
                const textWidth = textMetrics.width;
                const padding = 10;
                
                // 计算背景位置和大小
                const bgX = padding;
                const bgY = canvas.height - padding * 3;
                const bgWidth = textWidth + padding * 2;
                const bgHeight = 30;
                
                // 绘制半透明背景
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
                
                // 绘制白色文字
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillText(watermarkText, bgX + padding, canvas.height - padding);
                
                // 转换为data URL
                const dataURL = canvas.toDataURL("image/jpeg");
                resolve(dataURL);
              } catch (error) {
                console.error("Error processing image:", error);
                resolve(URL.createObjectURL(file));
              }
            };

            img.onerror = () => {
              console.error("Error loading image");
              resolve(URL.createObjectURL(file));
            };

            if (event.target && typeof event.target.result === "string") {
              img.src = event.target.result;
            } else {
              console.error("Invalid event target or result");
              resolve(URL.createObjectURL(file));
            }
          } catch (error) {
            console.error("Error in reader.onload:", error);
            resolve(URL.createObjectURL(file));
          }
        };

        reader.onerror = () => {
          console.error("Error reading file");
          resolve(URL.createObjectURL(file));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error creating FileReader:", error);
        resolve(URL.createObjectURL(file));
      }
    });
  };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...files]
            }));

            const newPreviews: string[] = [];

            for (const file of files) {
                const watermarkedImage = await addWatermarkToImage(file, formData.location);
                newPreviews.push(watermarkedImage);
            }

            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImagePreview = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);

            return {
                ...prev,
                images: newImages
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.location || !formData.type || !formData.hazardLevel || !formData.rectificationMethod || !formData.rectificationDeadline || !formData.assignedPerson) {
            toast.error("请填写必要信息");
            return;
        }

        const getPurePersonName = (displayName: string) => {
            const parts = displayName.split("-");
            return parts.length > 1 ? parts[1] : displayName;
        };

        const newHazard: Hazard = {
            id: (hazards.length + 1).toString(),
            title: formData.title,
            description: formData.description,
            location: formData.location,
            type: formData.type,
            hazardLevel: formData.hazardLevel,
            rectificationMethod: formData.rectificationMethod,
            rectificationDeadline: formData.rectificationDeadline,
            assignedPerson: getPurePersonName(formData.assignedPerson),
            images: [],
            status: "pendingConfirm",
            reportTime: new Date().toLocaleString("zh-CN"),
            reporter: "当前用户",
            整改负责人: "高主任、陈主任"
        };

        setHazards(prev => [newHazard, ...prev]);
        toast.success("事件报告已提交");

        setFormData({
            title: "",
            description: "",
            location: "",
            type: "",
            hazardLevel: "",
            rectificationMethod: "",
            rectificationDeadline: "",
            assignedPerson: "",
            images: []
        });

        setImagePreviews([]);
    };

    const handleProcess = (hazardId: string) => {
        const hazard = hazards.find(h => h.id === hazardId);
        if (hazard) {
            setSelectedHazard(hazard);
            setRectificationImages([]);
            setRectificationDescription("");
            setSignature("");
            setShowRectificationModal(true);
        }
    };

    // 处理整改图片上传
    const handleRectificationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages: string[] = [];

            for (const file of files) {
                const watermarkedImage = await addWatermarkToImage(file, selectedHazard?.location || "");
                newImages.push(watermarkedImage);
            }

            setRectificationImages(prev => [...prev, ...newImages]);
        }
    };

    // 移除整改图片
    const removeRectificationImage = (index: number) => {
        setRectificationImages(prev => prev.filter((_, i) => i !== index));
    };

    // 处理签名
    const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    setSignature(event.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // 提交整改结果
    const submitRectification = () => {
        if (!rectificationImages.length) {
            toast.error("请上传整改后的图片");
            return;
        }

        if (!signature) {
            toast.error("请上传签名");
            return;
        }

        if (selectedHazard) {
            // 模拟提交整改结果
            toast.success("整改结果已提交");
            
            // 更新事件状态
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                status: "processing",
                整改负责人: currentUser.name,
                images: [...(hazard.images || []), ...rectificationImages.map((url, index) => ({
                    id: `rect-${selectedHazard.id}-${index}`,
                    type: "rectification" as const,
                    url,
                    description: rectificationDescription
                }))]
            } : hazard));
            
            setShowRectificationModal(false);
        }
    };

    const handleRefuse = (hazardId: string) => {
        setSelectedHazardForRefuse(hazardId);
        setRefuseReason("");
        setShowRefuseModal(true);
    };

    const confirmRefuse = () => {
        if (selectedHazardForRefuse && refuseReason.trim()) {
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazardForRefuse ? {
                ...hazard,
                status: "refused",
                整改负责人: currentUser.name, // 使用当前登录用户的姓名
                验收人: currentUser.name, // 使用当前登录用户的姓名
                验收意见: `拒不整改：${refuseReason}`
            } : hazard));

            toast.success("已标记为拒不整改");
            setShowRefuseModal(false);
            setSelectedHazardForRefuse(null);
            setRefuseReason("");
        } else {
            toast.error("请填写拒不整改原因");
        }
    };

    const handleCheck = (hazardId: string, isApproved: boolean) => {
        // 验证当前用户是否有权限进行验收
        if (currentUser.personType !== '管理人员') {
            toast.error('只有管理人员可以执行验收操作');
            return;
        }
        
        if (isApproved) {
            // 验收通过，打开验收详情模态框
            const hazard = hazards.find(h => h.id === hazardId);
            if (hazard) {
                setSelectedHazard(hazard);
                setAcceptanceImages([]);
                setAcceptanceDescription("");
                setAcceptanceSignature("");
                setShowAcceptanceModal(true);
            }
        } else {
            // 验收驳回，打开驳回原因模态框
            const hazard = hazards.find(h => h.id === hazardId);
            if (hazard) {
                setSelectedHazard(hazard);
                setRejectReason("");
                setShowRejectModal(true);
            }
        }
    };

    // 确认验收驳回
    const confirmReject = () => {
        if (!rejectReason.trim()) {
            toast.error("请填写驳回原因");
            return;
        }
        
        if (selectedHazard) {
            // 模拟提交驳回结果
            toast.success("验收驳回结果已提交");
            
            // 更新事件状态，将状态设置为 pending，以便提交人可以再次整改
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                status: "pending",
                completionTime: new Date().toLocaleString("zh-CN"),
                验收人: currentUser.name,
                验收意见: `验收驳回: ${rejectReason}`
            } : hazard));
            
            setShowRejectModal(false);
        }
    };

    // 处理转交
    const handleTransfer = (hazardId: string) => {
        const hazard = hazards.find(h => h.id === hazardId);
        if (hazard) {
            setSelectedHazard(hazard);
            setSelectedTransferUser("");
            setTransferRemark("");
            setShowTransferModal(true);
        }
    };

    // 确认转交
    const confirmTransfer = () => {
        if (!selectedTransferUser) {
            toast.error("请选择接收人");
            return;
        }
        
        if (selectedHazard) {
            // 模拟提交转交结果
            toast.success("事件已成功转交");
            
            // 更新事件状态
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                转交人: currentUser.name,
                接收人: selectedTransferUser,
                转交时间: new Date().toLocaleString("zh-CN"),
                转交备注: transferRemark,
                状态: "pending" // 转交后状态重置为待处理
            } : hazard));
            
            setShowTransferModal(false);
        }
    };

    // 确认事件有效 → 进入待整改（显示开始整改、转交按钮）
    const handleConfirmValid = (hazardId: string) => {
        setHazards(prev => prev.map(hazard => hazard.id === hazardId ? {
            ...hazard,
            status: "pending",
            确认人: currentUser.name,
            确认时间: new Date().toLocaleString("zh-CN"),
            确认结果: "有效事件"
        } : hazard));
        toast.success("事件已确认为有效事件，进入待整改状态");
    };

    // 打开无效原因弹窗
    const handleConfirmInvalid = (hazardId: string) => {
        const hazard = hazards.find(h => h.id === hazardId);
        if (hazard) {
            setSelectedHazard(hazard);
            setInvalidReason("");
            setShowInvalidModal(true);
        }
    };

    // 确认无效 → 终止事件
    const confirmInvalidWithReason = () => {
        if (!invalidReason.trim()) {
            toast.error("请填写无效原因");
            return;
        }
        if (selectedHazard) {
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                status: "cancelled",
                确认人: currentUser.name,
                确认时间: new Date().toLocaleString("zh-CN"),
                确认结果: "无效事件",
                无效原因: invalidReason
            } : hazard));
            toast.success("事件已标记为无效事件，状态终止");
            setShowInvalidModal(false);
        }
    };

    // 打开整改人员分配弹窗
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState("");

    const handleAssignPerson = (hazardId: string) => {
        const hazard = hazards.find(h => h.id === hazardId);
        if (hazard) {
            setSelectedHazard(hazard);
            setSelectedAssignee(hazard.整改负责人 || "");
            setShowAssignModal(true);
        }
    };

    const confirmAssign = () => {
        if (!selectedAssignee) {
            toast.error("请选择整改负责人");
            return;
        }
        if (selectedHazard) {
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                整改负责人: selectedAssignee,
                分配人: currentUser.name,
                分配时间: new Date().toLocaleString("zh-CN")
            } : hazard));
            toast.success("整改人员已分配");
            setShowAssignModal(false);
        }
    };

    // 处理验收图片上传
    const handleAcceptanceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages: string[] = [];

            for (const file of files) {
                const watermarkedImage = await addWatermarkToImage(file, selectedHazard?.location || "");
                newImages.push(watermarkedImage);
            }

            setAcceptanceImages(prev => [...prev, ...newImages]);
        }
    };

    // 移除验收图片
    const removeAcceptanceImage = (index: number) => {
        setAcceptanceImages(prev => prev.filter((_, i) => i !== index));
    };

    // 处理验收签名
    const handleAcceptanceSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    setAcceptanceSignature(event.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // 提交验收结果
    const submitAcceptance = () => {
        if (!acceptanceImages.length) {
            toast.error("请上传验收的图片");
            return;
        }

        if (!acceptanceSignature) {
            toast.error("请上传签名");
            return;
        }

        if (selectedHazard) {
            // 模拟提交验收结果
            toast.success("验收结果已提交");
            
            // 更新事件状态
            setHazards(prev => prev.map(hazard => hazard.id === selectedHazard.id ? {
                ...hazard,
                status: "completed",
                completionTime: new Date().toLocaleString("zh-CN"),
                验收人: currentUser.name,
                验收意见: acceptanceDescription || "验收通过",
                images: [...(hazard.images || []), ...acceptanceImages.map((url, index) => ({
                    id: `accept-${selectedHazard.id}-${index}`,
                    type: "hazard" as const,
                    url,
                    description: acceptanceDescription
                }))]
            } : hazard));
            
            setShowAcceptanceModal(false);
        }
    };

    const getStatusText = (status: HazardStatus) => {
        switch (status) {
        case "pendingConfirm":
            return "待确认";
        case "pending":
            return "待处理";
        case "processing":
            return "处理中";
        case "completed":
            return "已完成";
        case "rejected":
            return "已驳回";
        case "refused":
            return "拒不整改";
        case "cancelled":
            return "已取消";
        default:
            return "未知状态";
        }
    };

    const handleHazardClick = (hazard: Hazard) => {
        setSelectedHazard(hazard);
        setShowDetailModal(true);
    };

    const openImagePreview = (images: ImageInfo[], index: number) => {
        if (images.length > 0) {
            setSelectedHazard({
                ...selectedHazard as Hazard,
                images: images
            });

            setCurrentImageIndex(index);
            setShowImagePreview(true);
        }
    };

    const getStatusStyle = (status: HazardStatus) => {
        switch (status) {
        case "pendingConfirm":
            return "bg-orange-100 text-orange-800";
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "processing":
            return "bg-blue-100 text-blue-800";
        case "completed":
            return "bg-green-100 text-green-800";
        case "rejected":
            return "bg-red-100 text-red-800";
        case "refused":
            return "bg-purple-100 text-purple-800";
        case "cancelled":
            return "bg-gray-100 text-gray-500";
        default:
            return "bg-gray-100 text-gray-800";
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    // 数据下钻功能
    const handleDataDrillDown = (e: React.MouseEvent) => {
        // 检查点击的元素是否具有特定的数据属性
        const target = e.target as HTMLElement;
        const drillDownId = target.getAttribute('data-drilldown-id');
        const drillDownType = target.getAttribute('data-drilldown-type');
        
        // 如果有下钻属性，则执行下钻操作
        if (drillDownId && drillDownType) {
            // 根据不同类型执行不同的下钻逻辑
            switch (drillDownType) {
                case 'hazard':
                    const hazard = hazards.find(h => h.id === drillDownId);
                    if (hazard) {
                        setSelectedHazard(hazard);
                        setShowDetailModal(true);
                    }
                    break;
                default:
                    console.log('未知的下钻类型:', drillDownType);
            }
        }
    };

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen">
            {/* 占位注释 */}
            <header
                className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
                <button onClick={handleBack} className="p-1">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold">随手拍</h1>
                <div className="w-8"></div> {/* 占位，保持标题居中 */}
            </header>
            <div className="flex bg-white border-b border-gray-200">
                {/* 签到签退页面 - 所有人员可访问 */}
                <button
                    className={`flex-1 py-3 text-center ${activeTab === "attendance" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("attendance")}>签到签退
                </button>
                {/* 随手拍页面 - 所有人员可访问 */}
                <button
                    className={`flex-1 py-3 text-center ${activeTab === "report" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("report")}>随手拍
                </button>
                {/* 事件整改页面 - 管理人员和任务跟踪人员可访问 */}
                {(currentUser.personType === '任务跟踪人员' || currentUser.personType === '管理人员') && (
                    <button
                        className={`flex-1 py-3 text-center ${activeTab === "process" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                        onClick={() => setActiveTab("process")}>事件整改
                    </button>
                )}
                {/* 事件验收页面 - 管理人员可访问 */}
                {(currentUser.personType === '管理人员') && (
                    <button
                        className={`flex-1 py-3 text-center ${activeTab === "check" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                        onClick={() => setActiveTab("check")}>事件验收
                    </button>
                )}
                {/* 随手拍清单页面 - 所有人员可访问 */}
                <button
                    className={`flex-1 py-3 text-center text-gray-500`}
                    onClick={() => navigate('/photo-report-list')}>随手拍清单
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                {/* 签到签退 Tab */}
                {activeTab === "attendance" && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                            <h3 className="text-base font-medium mb-3 text-blue-800">签到信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">签到状态：</span>
                                        <span className={`text-sm font-medium ${hasCheckedIn ? 'text-green-600' : 'text-gray-500'}`}>
                                            {hasCheckedIn ? '已签到' : '未签到'}
                                        </span>
                                    </div>
                                    {hasCheckedIn && (
                                        <>
                                            <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">签到时间：</span>
                                            <span className="text-sm text-gray-800">{checkInTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">签到位置：</span>
                                            <span className="text-sm text-gray-800">{checkInLocation}</span>
                                        </div>
                                        {checkInImage && (
                                            <div className="mt-2">
                                                <span className="text-sm text-gray-600 block mb-1">签到照片：</span>
                                                <div className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                                                    <img 
                                                        src={checkInImage} 
                                                        alt="签到照片" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">签退状态：</span>
                                        <span className={`text-sm font-medium ${hasCheckedOut ? 'text-purple-600' : 'text-gray-500'}`}>
                                            {hasCheckedOut ? '已签退' : '未签退'}
                                        </span>
                                    </div>
                                    {hasCheckedOut && (
                                        <>
                                            <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">签退时间：</span>
                                            <span className="text-sm text-gray-800">{checkOutTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">签退位置：</span>
                                            <span className="text-sm text-gray-800">{checkOutLocation}</span>
                                        </div>
                                        {checkOutImage && (
                                            <div className="mt-2">
                                                <span className="text-sm text-gray-600 block mb-1">签退照片：</span>
                                                <div className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                                                    <img 
                                                        src={checkOutImage} 
                                                        alt="签退照片" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={handleCheckIn}
                                    disabled={hasCheckedIn}
                                    className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${hasCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {hasCheckedIn ? (hasCheckedOut ? '已签退' : '已签到') : '签到打卡'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCheckOut}
                                    disabled={!hasCheckedIn || hasCheckedOut}
                                    className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${(!hasCheckedIn || hasCheckedOut) ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    {!hasCheckedIn ? '请先签到' : hasCheckedOut ? '已签退' : '签退打卡'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "report" && <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h2 className="text-base font-medium mb-3">事件信息</h2>
                         <div className="mb-4">
                             <label className="block text-sm text-gray-700 mb-2">事件图片 <span className="text-red-500">*</span></label>
                            <div className="space-y-3">
                                {/* 占位注释 */}
                                {imagePreviews.length > 0 && <div className="flex flex-wrap gap-2">
                                     {imagePreviews.map((preview, index) => <div key={index} className="relative w-24 h-24">
                                        <div className="relative w-full h-full">
                                            <img
                                                src={preview}
                                                alt={`预览 ${index + 1}`}
                                                className="w-full h-full object-cover rounded-md" />
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                                            onClick={() => removeImagePreview(index)}>
                                            <X size={16} className="text-gray-500" />
                                        </button>
                                    </div>)}
                                </div>}
                                {/* 占位注释 */}
                                <div className="flex gap-3">
                                    <label
                                        className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden" />
                                        <Camera size={24} className="text-gray-400" />
                                        <span className="mt-1 text-xs text-gray-500">拍照</span>
                                    </label>
                                    <label
                                        className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden" />
                                        <Image size={24} className="text-gray-400" />
                                        <span className="mt-1 text-xs text-gray-500">从相册选择</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-700 mb-1">事件描述</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="请详细描述事件情况"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]" />
                        </div>
                         <div className="mb-4">
                             <label className="block text-sm text-gray-700 mb-1">事件位置 <span className="text-red-500">*</span></label>
                            <div className="flex items-center">
                                <MapPin size={16} className="text-gray-500 mr-2" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="请输入事件位置或点击定位"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required />
                                <button
                                    type="button"
                                    onClick={() => {
                                        // 直接使用默认地址
                                        const defaultAddress = "浙江省杭州市余杭区良渚路166号";
                                        
                                        setFormData(prev => ({
                                            ...prev,
                                            location: defaultAddress
                                        }));
                                        
                                        toast.success("位置获取成功");
                                    }}
                                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap">定位
                                                                                                        </button>
                            </div>
                        </div>
                         <div className="mb-4">
                             <label className="block text-sm font-medium text-gray-700 mb-2">事件所属分类 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-10 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                                    style={{ fontSize: '16px', minHeight: '48px', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    required>
                                    <option value="" style={{ fontSize: '16px', padding: '8px' }}>事件所属分类</option>
                                    {hazardTypes.map(type => <option key={type.id} value={type.name} style={{ fontSize: '16px', padding: '8px' }}>{type.name}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                         <div className="mb-4">
                             <label className="block text-sm font-medium text-gray-700 mb-2">事件等级 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    name="hazardLevel"
                                    value={formData.hazardLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-10 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                                    style={{ fontSize: '16px', minHeight: '48px', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    required>
                                    <option value="" style={{ fontSize: '16px', padding: '8px' }}>请选择事件等级</option>
                                    <option value="特急" style={{ fontSize: '16px', padding: '8px' }}>特急</option>
                                    <option value="急" style={{ fontSize: '16px', padding: '8px' }}>急</option>
                                    <option value="一般" style={{ fontSize: '16px', padding: '8px' }}>一般</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">整改方式 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    name="rectificationMethod"
                                    value={formData.rectificationMethod}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-10 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                                    style={{ fontSize: '16px', minHeight: '48px', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    required>
                                    <option value="" style={{ fontSize: '16px', padding: '8px' }}>请选择整改方式</option>
                                    <option value="限期整改" style={{ fontSize: '16px', padding: '8px' }}>限期整改</option>
                                    <option value="立即整改" style={{ fontSize: '16px', padding: '8px' }}>立即整改</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-700 mb-1">整改时限 <span className="text-red-500">*</span></label>
                            <div className="flex items-center">
                                <Calendar size={16} className="text-gray-500 mr-2" />
                                <input
                                    type="date"
                                    name="rectificationDeadline"
                                    value={formData.rectificationDeadline}
                                    onChange={handleInputChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-700 mb-1">指派处理人 <span className="text-red-500">*</span></label>
                            <div className="flex items-center">
                                <Users size={16} className="text-gray-500 mr-2" />
                                <div
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 flex justify-between items-center focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent"
                                    onClick={openPersonSelector}>
                                    <span className={formData.assignedPerson ? "text-gray-700" : "text-gray-400"}>
                                        {formData.assignedPerson || "请选择指派处理人"}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">提交事件报告
                                                                                                                                                                     </button>
                </form>}
                {activeTab === "process" && <div className="space-y-4 pb-20">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="relative">
                            <input
                                type="text"
                                value={descriptionFilter}
                                onChange={e => setDescriptionFilter(e.target.value)}
                                placeholder="输入关键词搜索事件描述..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    {(() => {
                        const pendingConfirmCount = hazards.filter(h => h.status === "pendingConfirm").length;
                        const pendingCount = hazards.filter(h => h.status === "pending" || h.status === "processing" || h.status === "refused").length;
                        const allCount = hazards.filter(h => h.status !== "completed" && h.status !== "cancelled").length;
                        return (
                            <div className="flex bg-white rounded-lg shadow-sm overflow-hidden sticky bottom-0">
                                <button
                                    onClick={() => setEventTab('pendingConfirm')}
                                    className={`flex-1 py-3 text-center text-sm font-medium transition-colors border-b-2 ${eventTab === 'pendingConfirm' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500'}`}>
                                    待确认 <span className="ml-1 text-xs">({pendingConfirmCount})</span>
                                </button>
                                <button
                                    onClick={() => setEventTab('pending')}
                                    className={`flex-1 py-3 text-center text-sm font-medium transition-colors border-b-2 ${eventTab === 'pending' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500'}`}>
                                    待处理 <span className="ml-1 text-xs">({pendingCount})</span>
                                </button>
                                <button
                                    onClick={() => setEventTab('all')}
                                    className={`flex-1 py-3 text-center text-sm font-medium transition-colors border-b-2 ${eventTab === 'all' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500'}`}>
                                    全部 <span className="ml-1 text-xs">({allCount})</span>
                                </button>
                            </div>
                        );
                    })()}
                    {(() => {
                        const filtered = hazards.filter(hazard => {
                            const descriptionMatch = !descriptionFilter || hazard.description && hazard.description.includes(descriptionFilter) || hazard.title && hazard.title.includes(descriptionFilter);
                            if (eventTab === 'pendingConfirm') return hazard.status === "pendingConfirm" && descriptionMatch;
                            if (eventTab === 'pending') return (hazard.status === "pending" || hazard.status === "processing" || hazard.status === "refused") && descriptionMatch;
                            return descriptionMatch;
                        });
                        if (filtered.length === 0) return <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                            <CheckCircle size={48} className="mb-2 text-gray-300" />
                            <p>暂无事件</p>
                        </div>;
                        return filtered.map(hazard => <div
                        key={hazard.id}
                        className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleHazardClick(hazard)}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-medium">{hazard.title || "未命名事件"}</h3>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(hazard.status)}`}>
                                {getStatusText(hazard.status)}
                            </span>
                        </div>
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">事件描述:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{hazard.description || "暂无描述信息"}</p>
                        </div>
                        {/* 占位注释 */}
                        {hazard.images && hazard.images.length > 0 && <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">图片 ({hazard.images.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {hazard.images.slice(0, 3).map((image, index) => <div
                                    key={image.id}
                                    className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                    <img
                                        src={image.url}
                                        alt={`图片 ${index + 1}`}
                                        className="w-full h-full object-cover" />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                                        {image.type === "hazard" ? "事件" : "整改"}
                                    </div>
                                </div>)}
                                {hazard.images.length > 3 && <div
                                    className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">+{hazard.images.length - 3}
                                </div>}
                            </div>
                        </div>}
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{hazard.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1" />
                            <span>{hazard.reportTime}</span>
                        </div>
                        {hazard.hazardLevel && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <AlertTriangle size={14} className="mr-1" />
                            <span>事件等级: {hazard.hazardLevel}</span>
                        </div>}
                        {hazard.rectificationMethod && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1" />
                            <span>整改方式: {hazard.rectificationMethod}</span>
                        </div>}
                        {hazard.rectificationDeadline && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar size={14} className="mr-1" />
                            <span>整改时限: {hazard.rectificationDeadline}</span>
                        </div>}
                        {hazard.assignedPerson && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Users size={14} className="mr-1" />
                            <span>指派处理人: {hazard.assignedPerson}</span>
                        </div>}
                        {hazard.整改负责人 && <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Users size={14} className="mr-1" />
                            <span>整改负责人: {hazard.整改负责人}</span>
                        </div>}
                        {hazard.status === "cancelled" && hazard.无效原因 && <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                <X size={14} className="mr-1" />
                                <span className="font-medium text-red-600">无效原因</span>
                            </div>
                            <p className="text-sm text-gray-700">{hazard.无效原因}</p>
                            {hazard.确认人 && <p className="text-xs text-gray-400 mt-1">{hazard.确认人} · {hazard.确认时间}</p>}
                        </div>}
                        {hazard.确认结果 === "有效事件" && <div className="mb-3 p-3 bg-green-50 rounded-md border border-green-200">
                            <div className="flex items-center text-sm text-green-700 mb-1">
                                <CheckCircle size={14} className="mr-1" />
                                <span className="font-medium">{hazard.确认结果}</span>
                            </div>
                            {hazard.确认人 && <p className="text-xs text-gray-400 mt-1">{hazard.确认人} · {hazard.确认时间}</p>}
                        </div>}
                        <div className="flex gap-2">
                            {hazard.status === "pendingConfirm" && (
                                <>
                                    <button
                                        className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleConfirmValid(hazard.id);
                                        }}>有效事件
                                    </button>
                                    <button
                                        className="flex-1 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleConfirmInvalid(hazard.id);
                                        }}>无效事件
                                    </button>
                                </>
                            )}
                            {hazard.status === "pending" && (
                                <>
                                    <button
                                        className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleProcess(hazard.id);
                                        }}>开始整改
                                    </button>
                                    <button
                                        className="flex-1 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAssignPerson(hazard.id);
                                        }}>分配人员
                                    </button>
                                </>
                            )}
                            {hazard.status === "processing" && <button
                                className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleCheck(hazard.id, true);
                                }}>完成整改
                            </button>}
                            {hazard.status !== "pendingConfirm" && hazard.status !== "cancelled" && (
                                <button
                                    className="flex-1 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleTransfer(hazard.id);
                                    }}>转交
                                </button>
                            )}
                        </div>
                    </div>);
                    })()}
                </div>}
                {activeTab === "check" && <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">事件描述搜索</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={descriptionFilter}
                                        onChange={e => setDescriptionFilter(e.target.value)}
                                        placeholder="输入关键词搜索事件描述..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">状态筛选</label>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                    <option value="all">全部状态</option>
                                    <option value="processing">处理中</option>
                                    <option value="refused">拒不整改</option>
                                    <option value="completed">已完成</option>
                                    <option value="rejected">已驳回</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-base font-medium">待验收事件</h2>
                    {hazards.filter(hazard => {
                        const statusMatch = statusFilter === "all" || hazard.status === statusFilter;
                        const descriptionMatch = !descriptionFilter || hazard.description && hazard.description.includes(descriptionFilter) || hazard.title && hazard.title.includes(descriptionFilter);
                        return (hazard.status === "processing" || hazard.status === "refused") && statusMatch && descriptionMatch;
                    }).map(hazard => <div
                        key={hazard.id}
                        className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleHazardClick(hazard)}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-medium">{hazard.title || "未命名事件"}</h3>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(hazard.status)}`}>
                                {getStatusText(hazard.status)}
                            </span>
                        </div>
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">事件描述:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{hazard.description || "暂无描述信息"}</p>
                        </div>
                        {/* 占位注释 */}
                        {hazard.images && hazard.images.length > 0 && <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">图片 ({hazard.images.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {hazard.images.slice(0, 3).map((image, index) => <div
                                    key={image.id}
                                    className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                    <img
                                        src={image.url}
                                        alt={`图片 ${index + 1}`}
                                        className="w-full h-full object-cover" />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                                        {image.type === "hazard" ? "事件" : "整改"}
                                    </div>
                                </div>)}
                                {hazard.images.length > 3 && <div
                                    className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">+{hazard.images.length - 3}
                                </div>}
                            </div>
                        </div>}
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{hazard.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1" />
                            <span>{hazard.reportTime}</span>
                        </div>
                        {hazard.hazardLevel && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <AlertTriangle size={14} className="mr-1" />
                            <span>事件等级: {hazard.hazardLevel}</span>
                        </div>}
                        {hazard.rectificationMethod && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1" />
                            <span>整改方式: {hazard.rectificationMethod}</span>
                        </div>}
                        {hazard.rectificationDeadline && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar size={14} className="mr-1" />
                            <span>整改时限: {hazard.rectificationDeadline}</span>
                        </div>}
                        {hazard.assignedPerson && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Users size={14} className="mr-1" />
                            <span>指派处理人: {hazard.assignedPerson}</span>
                        </div>}
                        {hazard.整改负责人 && <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Users size={14} className="mr-1" />
                            <span>整改负责人: {hazard.整改负责人}</span>
                        </div>}
                        <div className="flex gap-3">
                            <button
                                className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleCheck(hazard.id, true);
                                }}>验收通过
                                                                                                  </button>
                            <button
                                className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleCheck(hazard.id, false);
                                }}>验收驳回
                                                                                                  </button>
                        </div>
                    </div>)}
                    {/* 占位注释 */}
                    <h2 className="text-base font-medium mt-6">已完成的事件</h2>
                    {hazards.filter(hazard => {
                        const statusMatch = statusFilter === "all" || hazard.status === statusFilter;
                        const descriptionMatch = !descriptionFilter || hazard.description && hazard.description.includes(descriptionFilter) || hazard.title && hazard.title.includes(descriptionFilter);
                        return (hazard.status === "completed" || hazard.status === "rejected" || hazard.status === "refused") && statusMatch && descriptionMatch;
                    }).map(hazard => <div
                        key={hazard.id}
                        className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleHazardClick(hazard)}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-medium">{hazard.title || "未命名事件"}</h3>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(hazard.status)}`}>
                                {getStatusText(hazard.status)}
                            </span>
                        </div>
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">事件描述:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{hazard.description || "暂无描述信息"}</p>
                        </div>
                        {/* 占位注释 */}
                        {hazard.images && hazard.images.length > 0 && <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">图片 ({hazard.images.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {hazard.images.slice(0, 3).map((image, index) => <div
                                    key={image.id}
                                    className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                    <img
                                        src={image.url}
                                        alt={`图片 ${index + 1}`}
                                        className="w-full h-full object-cover" />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                                        {image.type === "hazard" ? "事件" : "整改"}
                                    </div>
                                </div>)}
                                {hazard.images.length > 3 && <div
                                    className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">+{hazard.images.length - 3}
                                </div>}
                            </div>
                        </div>}
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{hazard.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1" />
                            <span>报告时间: {hazard.reportTime}</span>
                        </div>
                        {hazard.completionTime && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar size={14} className="mr-1" />
                            <span>完成时间: {hazard.completionTime}</span>
                        </div>}
                        {hazard.验收人 && <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Users size={14} className="mr-1" />
                            <span>验收人: {hazard.验收人}</span>
                        </div>}
                        {hazard.验收意见 && <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">验收意见: {hazard.验收意见}
                        </div>}
                    </div>)}
                    {hazards.filter(
                        hazard => hazard.status === "processing" || hazard.status === "completed" || hazard.status === "rejected" || hazard.status === "refused"
                    ).length === 0 && <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <CheckCircle size={48} className="mb-2 text-gray-300" />
                        <p>暂无验收记录</p>
                    </div>}
                </div>}
            {showRefuseModal && <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div
                        className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium">拒绝事件</h3>
                        <button
                            onClick={() => setShowRefuseModal(false)}
                            className="p-1 text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                            <h4 className="text-base font-medium mb-2">基本信息</h4>
                            <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件标题:</span>
                                    <span className="text-sm font-medium">{selectedHazard?.title || "未命名事件"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件状态:</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(selectedHazard?.status || "pending")}`}>
                                        {getStatusText(selectedHazard?.status || "pending")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件类型:</span>
                                    <span className="text-sm">{selectedHazard?.type || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件等级:</span>
                                    <span className="text-sm">{selectedHazard?.hazardLevel || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">报告时间:</span>
                                    <span className="text-sm">{selectedHazard?.reportTime || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">报告人:</span>
                                    <span className="text-sm">{selectedHazard?.reporter || ""}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-medium mb-2">拒绝原因</h4>
                            <textarea
                                value={refuseReason}
                                onChange={(e) => setRefuseReason(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入拒绝原因"
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={confirmRefuse}
                            className="w-full py-3 bg-red-500 text-white font-medium rounded-md">
                            确认拒绝
                        </button>
                    </div>
                </div>
            </div>}
            
            {/* 整改详情模态框 */}
            {showRectificationModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">整改详情</h3>
                            <button
                                onClick={() => setShowRectificationModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* 基础信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">基础信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件类型:</span>
                                        <span className="text-sm">{selectedHazard.type || "未知类型"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件等级:</span>
                                        <span className="text-sm">{selectedHazard.hazardLevel || "未知等级"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告时间:</span>
                                        <span className="text-sm">{selectedHazard.reportTime || "未知时间"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告人:</span>
                                        <span className="text-sm">{selectedHazard.reporter || "未知报告人"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">指派处理人:</span>
                                        <span className="text-sm">{selectedHazard.assignedPerson || "未指派"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 事件描述 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">事件描述</h4>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-800">{selectedHazard.description || "暂无描述信息"}</p>
                                </div>
                            </div>
                            
                            {/* 事件位置 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">事件位置</h4>
                                <div className="flex items-center">
                                    <MapPin size={16} className="text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-800">{selectedHazard.location || "未知位置"}</span>
                                </div>
                            </div>
                            
                            {/* 事件图片 */}
                            {selectedHazard.images && selectedHazard.images.length > 0 && (
                                <div>
                                    <h4 className="text-base font-medium mb-2">事件图片</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHazard.images.slice(0, 4).map((image, index) => (
                                            <div key={image.id} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                                                <img
                                                    src={image.url}
                                                    alt={`图片 ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                                                    {image.type === "hazard" ? "事件" : "整改"}
                                                </div>
                                            </div>
                                        ))}
                                        {selectedHazard.images.length > 4 && (
                                            <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                +{selectedHazard.images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* 整改信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">整改信息</h4>
                                
                                {/* 整改描述 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-1">整改描述</label>
                                    <textarea
                                        value={rectificationDescription}
                                        onChange={e => setRectificationDescription(e.target.value)}
                                        placeholder="请描述整改情况"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                                    />
                                </div>
                                
                                {/* 整改图片 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-2">整改后的图片 <span className="text-red-500">*</span></label>
                                    <div className="space-y-3">
                                        {rectificationImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {rectificationImages.map((preview, index) => (
                                                    <div key={index} className="relative w-24 h-24">
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src={preview}
                                                                alt={`整改图片 ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                                                            onClick={() => removeRectificationImage(index)}
                                                        >
                                                            <X size={16} className="text-gray-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <label
                                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleRectificationImageUpload}
                                                    className="hidden"
                                                />
                                                <Camera size={24} className="text-gray-400" />
                                                <span className="mt-1 text-xs text-gray-500">拍照</span>
                                            </label>
                                            <label
                                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleRectificationImageUpload}
                                                    className="hidden"
                                                />
                                                <Image size={24} className="text-gray-400" />
                                                <span className="mt-1 text-xs text-gray-500">从相册选择</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 签名 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-2">签名 <span className="text-red-500">*</span></label>
                                    <div className="flex gap-3">
                                        <label
                                            className="flex flex-col items-center justify-center w-40 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSignature}
                                                className="hidden"
                                            />
                                            {signature ? (
                                                <img
                                                    src={signature}
                                                    alt="签名"
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-1">
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                                    </svg>
                                                    <span className="text-xs text-gray-500">上传签名</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={submitRectification}
                                className="w-full py-3 bg-green-600 text-white font-medium rounded-md">
                                提交整改结果
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 验收详情模态框 */}
            {showAcceptanceModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">验收详情</h3>
                            <button
                                onClick={() => setShowAcceptanceModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* 基础信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">基础信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件类型:</span>
                                        <span className="text-sm">{selectedHazard.type || "未知类型"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件等级:</span>
                                        <span className="text-sm">{selectedHazard.hazardLevel || "未知等级"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告时间:</span>
                                        <span className="text-sm">{selectedHazard.reportTime || "未知时间"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告人:</span>
                                        <span className="text-sm">{selectedHazard.reporter || "未知报告人"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">指派处理人:</span>
                                        <span className="text-sm">{selectedHazard.assignedPerson || "未指派"}</span>
                                    </div>
                                    {selectedHazard.整改负责人 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">整改负责人:</span>
                                            <span className="text-sm">{selectedHazard.整改负责人}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* 事件描述 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">事件描述</h4>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-800">{selectedHazard.description || "暂无描述信息"}</p>
                                </div>
                            </div>
                            
                            {/* 事件位置 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">事件位置</h4>
                                <div className="flex items-center">
                                    <MapPin size={16} className="text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-800">{selectedHazard.location || "未知位置"}</span>
                                </div>
                            </div>
                            
                            {/* 事件图片 */}
                            {selectedHazard.images && selectedHazard.images.length > 0 && (
                                <div>
                                    <h4 className="text-base font-medium mb-2">事件图片</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHazard.images.slice(0, 4).map((image, index) => (
                                            <div key={image.id} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                                                <img
                                                    src={image.url}
                                                    alt={`图片 ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                                                    {image.type === "hazard" ? "事件" : "整改"}
                                                </div>
                                            </div>
                                        ))}
                                        {selectedHazard.images.length > 4 && (
                                            <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                +{selectedHazard.images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* 验收信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">验收信息</h4>
                                
                                {/* 验收说明 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-1">验收说明</label>
                                    <textarea
                                        value={acceptanceDescription}
                                        onChange={e => setAcceptanceDescription(e.target.value)}
                                        placeholder="请描述验收情况"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                                    />
                                </div>
                                
                                {/* 验收图片 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-2">验收的图片 <span className="text-red-500">*</span></label>
                                    <div className="space-y-3">
                                        {acceptanceImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {acceptanceImages.map((preview, index) => (
                                                    <div key={index} className="relative w-24 h-24">
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src={preview}
                                                                alt={`验收图片 ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                                                            onClick={() => removeAcceptanceImage(index)}
                                                        >
                                                            <X size={16} className="text-gray-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <label
                                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleAcceptanceImageUpload}
                                                    className="hidden"
                                                />
                                                <Camera size={24} className="text-gray-400" />
                                                <span className="mt-1 text-xs text-gray-500">拍照</span>
                                            </label>
                                            <label
                                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleAcceptanceImageUpload}
                                                    className="hidden"
                                                />
                                                <Image size={24} className="text-gray-400" />
                                                <span className="mt-1 text-xs text-gray-500">从相册选择</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 签名 */}
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-2">签名 <span className="text-red-500">*</span></label>
                                    <div className="flex gap-3">
                                        <label
                                            className="flex flex-col items-center justify-center w-40 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAcceptanceSignature}
                                                className="hidden"
                                            />
                                            {acceptanceSignature ? (
                                                <img
                                                    src={acceptanceSignature}
                                                    alt="签名"
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-1">
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                                    </svg>
                                                    <span className="text-xs text-gray-500">上传签名</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={submitAcceptance}
                                className="w-full py-3 bg-green-600 text-white font-medium rounded-md">
                                提交验收结果
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 验收驳回模态框 */}
            {showRejectModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">验收驳回</h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* 基础信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">基础信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件类型:</span>
                                        <span className="text-sm">{selectedHazard.type || "未知类型"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件等级:</span>
                                        <span className="text-sm">{selectedHazard.hazardLevel || "未知等级"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告时间:</span>
                                        <span className="text-sm">{selectedHazard.reportTime || "未知时间"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告人:</span>
                                        <span className="text-sm">{selectedHazard.reporter || "未知报告人"}</span>
                                    </div>
                                    {selectedHazard.整改负责人 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">整改负责人:</span>
                                            <span className="text-sm">{selectedHazard.整改负责人}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* 驳回原因 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">驳回原因 <span className="text-red-500">*</span></h4>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="请描述验收驳回的原因"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[150px]"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={confirmReject}
                                className="w-full py-3 bg-red-600 text-white font-medium rounded-md">
                                确认驳回
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPersonSelector && <div className="fixed inset-0 bg-black/50 flex items-end z-50">
                <div className="bg-white w-full rounded-t-xl overflow-hidden max-h-[80vh]">
                    <div
                        className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium">选择处理人</h3>
                        <button onClick={closePersonSelector} className="p-1">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                        {(() => {
                            // 根据当前标签页获取可选择的处理人
                            const availablePeople = getAvailableProcessPeople(activeTab);
                            
                            // 如果没有可选择的人员
                            if (availablePeople.length === 0) {
                                return (
                                    <div className="p-4 text-center text-gray-500">
                                        暂无可用的处理人
                                    </div>
                                );
                            }
                            
                            // 将人员按部门分组
                            const peopleByDepartment: Record<string, Person[]> = {};
                            availablePeople.forEach(person => {
                                const dept = person.department || '未分组';
                                if (!peopleByDepartment[dept]) {
                                    peopleByDepartment[dept] = [];
                                }
                                peopleByDepartment[dept].push(person);
                            });
                            
                            // 渲染按部门分组的人员列表
                            return Object.entries(peopleByDepartment).map(([deptName, people]) => (
                                <div key={deptName} className="mb-4">
                                    <div className="px-4 py-2 bg-gray-50 font-medium text-gray-700">
                                        {deptName}
                                    </div>
                                    <div>
                                        {people.map(person => (
                                            <div
                                                key={person.id}
                                                className={`px-4 py-3 border-b border-gray-100 hover:bg-green-50 transition-colors cursor-pointer`}
                                                onClick={() => handleSelectPerson(person)}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-gray-700">{person.name}</span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            {person.personType === 'admin' ? '管理人员' : '任务跟踪人员'}
                                                        </span>
                                                    </div>
                                                    {formData.assignedPerson.includes(person.name) && (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-green-500"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={closePersonSelector}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md">
                            取消
                        </button>
                    </div>
                </div>
            </div>}
            {showDetailModal && selectedHazard && <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div
                        className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium">事件详情</h3>
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="p-1 text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                            <h4 className="text-base font-medium mb-2">基本信息</h4>
                            <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件标题:</span>
                                    <span className="text-sm font-medium">{selectedHazard?.title || "未命名事件"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件状态:</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(selectedHazard?.status || "pending")}`}>
                                        {getStatusText(selectedHazard?.status || "pending")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件类型:</span>
                                    <span className="text-sm">{selectedHazard?.type || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">事件等级:</span>
                                    <span className="text-sm">{selectedHazard?.hazardLevel || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">报告时间:</span>
                                    <span className="text-sm">{selectedHazard?.reportTime || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">报告人:</span>
                                    <span className="text-sm">{selectedHazard?.reporter || ""}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-medium mb-2">事件描述</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm">{selectedHazard?.description || "暂无描述信息"}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-medium mb-2">事件位置</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm">{selectedHazard?.location || ""}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-medium mb-2">整改信息</h4>
                            <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">整改方式:</span>
                                    <span className="text-sm">{selectedHazard?.rectificationMethod || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">整改时限:</span>
                                    <span className="text-sm">{selectedHazard?.rectificationDeadline || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">指派处理人:</span>
                                    <span className="text-sm">{selectedHazard?.assignedPerson || ""}</span>
                                </div>
                                {selectedHazard?.整改负责人 && <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">整改负责人:</span>
                                    <span className="text-sm">{selectedHazard?.整改负责人 || ""}</span>
                                </div>}
                                {selectedHazard?.completionTime && <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">完成时间:</span>
                                    <span className="text-sm">{selectedHazard?.completionTime || ""}</span>
                                </div>}
                                {selectedHazard?.验收人 && <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">验收人:</span>
                                    <span className="text-sm">{selectedHazard?.验收人 || ""}</span>
                                </div>}
                                {selectedHazard?.验收意见 && <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">验收意见:</span>
                                    <span className="text-sm bg-white p-2 rounded">{selectedHazard?.验收意见 || ""}</span>
                                </div>}
                                {selectedHazard?.确认结果 && <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">确认结果:</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedHazard.确认结果 === "有效事件" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{selectedHazard.确认结果}</span>
                                </div>}
                                {selectedHazard?.确认人 && <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">确认人:</span>
                                    <span className="text-sm">{selectedHazard.确认人} · {selectedHazard.确认时间}</span>
                                </div>}
                                {selectedHazard?.无效原因 && <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">无效原因:</span>
                                    <span className="text-sm bg-red-50 p-2 rounded text-red-700 border border-red-100">{selectedHazard.无效原因}</span>
                                </div>}
                            </div>
                        </div>
                        {selectedHazard && selectedHazard.images && selectedHazard.images.length > 0 && <div>
                            <h4 className="text-base font-medium mb-2">图片</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedHazard && selectedHazard.images && selectedHazard.images.map((image, index) => <div
                                    key={image.id}
                                    className="relative rounded-md overflow-hidden border border-gray-200 cursor-pointer"
                                    onClick={() => openImagePreview(selectedHazard?.images || [], index)}>
                                    <img
                                        src={image.url}
                                        alt={`${image.type === "hazard" ? "事件" : "整改"}图片 ${index + 1}`}
                                        className="w-full h-40 object-cover" />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 flex justify-between">
                                        <span>{image.type === "hazard" ? "事件" : "整改"}</span>
                                        <span>{index + 1}/{selectedHazard?.images?.length || 0}</span>
                                    </div>
                                    {image.description && <div
                                        className="absolute top-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                        {image.description}
                                    </div>}
                                </div>)}
                            </div>
                        </div>}
                    </div>
                    {/* 当前进度 */}
                    <div>
                        <h4 className="text-base font-medium mb-3">当前进度</h4>
                        <div className="space-y-0">
                            {(() => {
                                const status = selectedHazard?.status || "pendingConfirm";
                                const nodes = [
                                    { label: "事件提交", person: selectedHazard?.reporter, time: selectedHazard?.reportTime, active: true, completed: true },
                                    { label: "事件确认", person: selectedHazard?.确认人, time: selectedHazard?.确认时间, active: status === "pendingConfirm", completed: status === "pending" || status === "processing" || status === "completed" || status === "rejected" || status === "refused" || status === "cancelled" },
                                    { label: "事件整改", person: selectedHazard?.整改负责人 || selectedHazard?.assignedPerson, time: selectedHazard?.completionTime, active: status === "pending" || status === "processing", completed: status === "completed" || status === "rejected" || status === "refused" },
                                    { label: "事件验收", person: selectedHazard?.验收人, time: selectedHazard?.验收时间 || selectedHazard?.completionTime, active: status === "processing" || status === "rejected", completed: status === "completed" || status === "rejected" },
                                ];
                                return nodes.map((node, idx) => {
                                    const isActive = node.active && !node.completed;
                                    const isCompleted = node.completed;
                                    return (
                                        <div key={idx} className="flex items-start">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                    isCompleted ? 'bg-green-500 text-white' :
                                                    isActive ? 'bg-blue-500 text-white ring-4 ring-blue-100' :
                                                    'bg-gray-200 text-gray-400'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle size={16} />
                                                    ) : (
                                                        <span>{idx + 1}</span>
                                                    )}
                                                </div>
                                                {idx < nodes.length - 1 && (
                                                    <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                                )}
                                            </div>
                                            <div className="ml-3 pb-8">
                                                <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{node.label}</p>
                                                {node.person ? (
                                                    <p className="text-xs text-gray-500 mt-0.5">{node.person}</p>
                                                ) : (
                                                    <p className="text-xs text-gray-400 mt-0.5">待处理</p>
                                                )}
                                                {node.time && <p className="text-xs text-gray-400">{node.time}</p>}
                                                {isActive && <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">进行中</span>}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md">关闭
                                                                               </button>
                    </div>
                </div>
            </div>}
            {showImagePreview && selectedHazard && selectedHazard.images && selectedHazard.images.length > 0 && <div
                className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                <button
                    className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                    onClick={() => setShowImagePreview(false)}>
                    <X size={24} />
                </button>
                <div className="relative w-full max-w-4xl">
                    <img
                        src={selectedHazard?.images?.[currentImageIndex]?.url || ""}
                        alt={`预览图片 ${currentImageIndex + 1}`}
                        className="w-full h-auto max-h-[80vh] object-contain" />
                    {selectedHazard?.images && selectedHazard.images.length > 1 && <>
                        <button
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                            onClick={e => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => prev === 0 ? (selectedHazard?.images?.length || 1) - 1 : prev - 1);
                            }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
                            onClick={e => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => prev === (selectedHazard?.images?.length || 1) - 1 ? 0 : prev + 1);
                            }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>}
                    {/* 占位注释 */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                        <p className="text-sm">
                            {selectedHazard?.images?.[currentImageIndex]?.description || `${selectedHazard?.images?.[currentImageIndex]?.type === "hazard" ? "事件图片" : "整改图片"}`}
                        </p>
                        <p className="text-xs mt-1">
                            {currentImageIndex + 1}/{selectedHazard?.images?.length || 0}
                        </p>
                    </div>
                </div>
            </div>}
            
            {/* 转交模态框 */}
            {showTransferModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">转交事件</h3>
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* 基础信息 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">事件信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件类型:</span>
                                        <span className="text-sm">{selectedHazard.type || "未知类型"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件等级:</span>
                                        <span className="text-sm">{selectedHazard.hazardLevel || "未知等级"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">报告时间:</span>
                                        <span className="text-sm">{selectedHazard.reportTime || "未知时间"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">当前状态:</span>
                                        <span className="text-sm">{getStatusText(selectedHazard.status)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 接收人选择 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">接收人 <span className="text-red-500">*</span></h4>
                                <select
                                    value={selectedTransferUser}
                                    onChange={e => setSelectedTransferUser(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">请选择接收人</option>
                                    <option value="张三">张三</option>
                                    <option value="李四">李四</option>
                                    <option value="王五">王五</option>
                                    <option value="赵六">赵六</option>
                                    <option value="孙七">孙七</option>
                                </select>
                            </div>
                            
                            {/* 转交备注 */}
                            <div>
                                <h4 className="text-base font-medium mb-2">转交备注</h4>
                                <textarea
                                    value={transferRemark}
                                    onChange={e => setTransferRemark(e.target.value)}
                                    placeholder="请输入转交备注（可选）"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[100px]"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={confirmTransfer}
                                className="w-full py-3 bg-yellow-600 text-white font-medium rounded-md">
                                确认转交
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 整改人员分配弹窗 */}
            {showAssignModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">分配整改人员</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <h4 className="text-base font-medium mb-2">事件信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">当前状态:</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(selectedHazard.status)}`}>{getStatusText(selectedHazard.status)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-base font-medium mb-2">整改负责人 <span className="text-red-500">*</span></h4>
                                <select
                                    value={selectedAssignee}
                                    onChange={e => setSelectedAssignee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">请选择整改负责人</option>
                                    <option value="自己">自己（{currentUser.name}）</option>
                                    {getAvailableProcessPeople('process').filter(p => p.name !== currentUser.name).map(person => (
                                        <option key={person.id} value={person.name}>{person.name} ({person.personType})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={confirmAssign}
                                className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">
                                确认分配
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 无效原因弹窗 */}
            {showInvalidModal && selectedHazard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">无效事件原因</h3>
                            <button
                                onClick={() => setShowInvalidModal(false)}
                                className="p-1 text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <h4 className="text-base font-medium mb-2">事件信息</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">事件标题:</span>
                                        <span className="text-sm font-medium">{selectedHazard.title || "未命名事件"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">当前状态:</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(selectedHazard.status)}`}>{getStatusText(selectedHazard.status)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-base font-medium mb-2">无效原因 <span className="text-red-500">*</span></h4>
                                <textarea
                                    value={invalidReason}
                                    onChange={e => setInvalidReason(e.target.value)}
                                    placeholder="请输入无效原因..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[100px]"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={confirmInvalidWithReason}
                                className="w-full py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600">
                                确认无效
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default HazardReportingPage;