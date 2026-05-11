import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, X, Save, X as Cancel } from 'lucide-react';
import VehicleManagementPage from './VehicleManagementPage';
import VehicleRegistrationManagement from './components/VehicleRegistrationManagement';
import ConstructionWastePointManagement from './components/ConstructionWastePointManagement';

// 道路数据接口
interface Road {
  id: string;
  roadName: string;
  roadSection: string;
  area: number;
  unit: string;
  type: string;
}

// 公厕数据接口
interface Toilet {
  id: string;
  toiletName: string;
  toiletType: string;
  address: string;
  toiletNumber: string;
  area: number;
}

// 绿化数据接口
interface Greening {
  id: string;
  roadName: string;
  roadSection: string;
  area: number;
  unit: string;
  type: string;
  notes: string;
}

// 重点区域数据接口
interface KeyArea {
  id: string;
  name: string;
  personInCharge: string;
  contact: string;
  notes: string;
}

// 模拟道路数据
const mockRoads: Road[] = [
  { id: '1', roadName: '古墩路', roadSection: '赵伍路至萍水路', area: 14000, unit: 'M2', type: '一类' },
  { id: '2', roadName: '莫干山路', roadSection: '杭行路至石祥路', area: 7925, unit: 'M2', type: '一类' },
  { id: '3', roadName: '京杭大运河', roadSection: '新开河至石祥路', area: 30725, unit: 'M2', type: '二类' },
  { id: '4', roadName: '康良街', roadSection: '杭行路至金家渡路', area: 25544, unit: 'M2', type: '二类' },
  { id: '5', roadName: '康良街', roadSection: '金家渡路至杭行路', area: 13900, unit: 'M2', type: '二类' },
  { id: '6', roadName: '亲亲路', roadSection: '金家渡路至古墩路', area: 7175, unit: 'M2', type: '二类' },
  { id: '7', roadName: '东大区道', roadSection: '杭行路至勾庄路', area: 20957, unit: 'M2', type: '二类' },
  { id: '8', roadName: '东西大道', roadSection: '莫干山路至电厂路', area: 1796.7, unit: 'M2', type: '二类' },
  { id: '9', roadName: '瓶里环路', roadSection: '东西大道至里窑街', area: 1278.6, unit: 'M2', type: '二类' },
  { id: '10', roadName: '良平路', roadSection: '东西大道至良渚文化村', area: 2068.9, unit: 'M2', type: '二类' },
  { id: '11', roadName: '长滨河街', roadSection: '莫干山路至东西大道', area: 1896.3, unit: 'M2', type: '二类' },
  { id: '12', roadName: '立新路', roadSection: '顾家路至张家埭路', area: 2296.2, unit: 'M2', type: '二类' },
  { id: '13', roadName: '张家埭路', roadSection: '立新路至良渚路', area: 1680.4, unit: 'M2', type: '二类' },
  { id: '14', roadName: '亲水路', roadSection: '新园路至古墩路', area: 1598.3, unit: 'M2', type: '二类' },
  { id: '15', roadName: '网周路', roadSection: '新园路至里街路', area: 928.0, unit: 'M2', type: '二类' },
  { id: '16', roadName: '网周路', roadSection: '古墩路至里街路', area: 1079.0, unit: 'M2', type: '二类' },
  { id: '17', roadName: '里街路', roadSection: '网周路至玉鸟路', area: 1229.0, unit: 'M2', type: '二类' },
  { id: '18', roadName: '鲍贝路', roadSection: '良渚路至玉鸟路', area: 2394.0, unit: 'M2', type: '二类' },
  { id: '19', roadName: '玉鸟路', roadSection: '鲍贝路至玉鸟街', area: 2482.0, unit: 'M2', type: '二类' },
  { id: '20', roadName: '周家里街', roadSection: '玉鸟路至东西大道', area: 1009.0, unit: 'M2', type: '二类' },
  { id: '21', roadName: '姚家路', roadSection: '104国道至东西大道', area: 459.0, unit: 'M2', type: '二类' },
  { id: '22', roadName: '金家渡路', roadSection: '莫干山路至杭行路', area: 3530.0, unit: 'M2', type: '二类' },
  { id: '23', roadName: '玉鸟街', roadSection: '良渚路至玉鸟路', area: 1025.0, unit: 'M2', type: '二类' },
  { id: '24', roadName: '玉鸟街', roadSection: '玉鸟路至莫干山路', area: 3530.0, unit: 'M2', type: '二类' },
  { id: '25', roadName: '严村里路', roadSection: '东西大道至顾家路', area: 600.0, unit: 'M2', type: '二类' },
  { id: '26', roadName: '严村里路', roadSection: '顾家路至莫干山路', area: 600.0, unit: 'M2', type: '二类' },
  { id: '27', roadName: '工人路广场', roadSection: '祥符桥至金家渡路', area: 8700, unit: 'M2', type: '二类' },
  { id: '28', roadName: '杜文路', roadSection: '104国道至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '29', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '30', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '31', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '32', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '33', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '34', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '35', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '36', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '37', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '38', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '39', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '40', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '41', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '42', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '43', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '44', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '45', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '46', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '47', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '48', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '49', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '50', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '51', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '52', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '53', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '54', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '55', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '56', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '57', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '58', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '59', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '60', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '61', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '62', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '63', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '64', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '65', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' },
  { id: '66', roadName: '杜文路', roadSection: '北起绕城高速至104国道', area: 17392, unit: 'M2', type: '二类' }
];

// 模拟公厕数据
const mockToilets: Toilet[] = [
  { id: '1', toiletName: '玉琮路公厕', toiletType: '标准公厕', address: '良渚文化村良渚医院旁', toiletNumber: '余LZ-001', area: 85 },
  { id: '2', toiletName: '十六街区广场公厕', toiletType: '标准公厕', address: '良渚东西大道西侧十六街区公园东南角', toiletNumber: '余LZ-002', area: 75 },
  { id: '3', toiletName: '施家湾1号公厕', toiletType: '标准公厕', address: '良渚路38号对面（良渚港边）', toiletNumber: '余LZ-003', area: 35 },
  { id: '4', toiletName: '施家湾2号公厕', toiletType: '标准公厕', address: '良博路东至底（东栅门1号旁）', toiletNumber: '余LZ-004', area: 30 },
  { id: '5', toiletName: '良博路公厕', toiletType: '标准公厕', address: '良博路63号', toiletNumber: '余LZ-005', area: 32 },
  { id: '6', toiletName: '良渚文化广场', toiletType: '标准公厕', address: '东西大道良渚路口东北侧', toiletNumber: '余LZ-006', area: 200 },
  { id: '7', toiletName: '邱家坞公厕', toiletType: '标准公厕', address: '古墩路停车场地铁良渚站D口南侧', toiletNumber: '余LZ-007', area: 180 },
  { id: '8', toiletName: '古墩路驿站公厕（1号）', toiletType: '标准公厕', address: '古墩路与网周路口东南角', toiletNumber: '余LZ-029', area: 190 },
  { id: '9', toiletName: '美诗公厕', toiletType: '标准公厕', address: '美院北侧公厕', toiletNumber: '', area: 123.96 },
  { id: '10', toiletName: '良祥互通公厕', toiletType: '标准公厕', address: '良祥互通公厕', toiletNumber: '', area: 85 }
];

// 模拟绿化数据
const mockGreening: Greening[] = [
  { id: '1', roadName: '古墩路', roadSection: '赵伍路至萍水路', area: 134132, unit: 'M2', type: '二类', notes: '包括绿化步道、街面花箱' },
  { id: '2', roadName: '莫干山路绿线', roadSection: '新104国道至东西大道', area: 10500, unit: 'M2', type: '二类', notes: '' },
  { id: '3', roadName: '东西大道', roadSection: '王塘家至104国道', area: 25455.4, unit: 'M2', type: '二类', notes: '' },
  { id: '4', roadName: '玉琮路、良管路', roadSection: '王塘家至104国道', area: 560, unit: 'M2', type: '二类', notes: '' },
  { id: '5', roadName: '杜甫路', roadSection: '良渚路至康良街', area: 4705, unit: 'M2', type: '二类', notes: '' },
  { id: '6', roadName: '良渚文化中心广场', roadSection: '良渚路至康良街', area: 4705, unit: 'M2', type: '二类', notes: '' },
  { id: '7', roadName: '良渚老管委会门口', roadSection: '良渚路至康良街', area: 180, unit: 'M2', type: '二类', notes: '' },
  { id: '8', roadName: '邱家坞停车场', roadSection: '良渚路至康良街', area: 1441.9, unit: 'M2', type: '二类', notes: '' },
  { id: '9', roadName: '南庄经、兰里街', roadSection: '良渚路至康良街', area: 775, unit: 'M2', type: '二类', notes: '' },
  { id: '10', roadName: '繁荣路绿化养护', roadSection: '良渚路至康良街', area: 775, unit: 'M2', type: '二类', notes: '' },
  { id: '11', roadName: '玉鸟路', roadSection: '良渚大道至东西大道', area: 6062, unit: 'M2', type: '二类', notes: '包括行道树231棵' },
  { id: '12', roadName: '玉鸟街', roadSection: '良渚大道至东西大道', area: 9135, unit: 'M2', type: '二类', notes: '' },
  { id: '13', roadName: '良渚大道', roadSection: '古墩路至东西大道', area: 1519.29, unit: 'M2', type: '二类', notes: '' },
  { id: '14', roadName: '杜文路绿道', roadSection: '古墩路至东西大道', area: 13383, unit: 'M2', type: '二类', notes: '' },
  { id: '15', roadName: '张家埭路', roadSection: '良渚路至玉鸟路', area: 1196, unit: 'M2', type: '二类', notes: '包括行道树86棵' },
  { id: '16', roadName: '良平路', roadSection: '东西大道至玉琮路', area: 574, unit: 'M2', type: '二类', notes: '包括行道树132棵，银姬小蜡绿化' },
  { id: '17', roadName: '网周路', roadSection: '良渚大道至玉琮路', area: 284, unit: 'M2', type: '二类', notes: '' },
  { id: '18', roadName: '网周路', roadSection: '古墩路至玉琮路', area: 2900, unit: 'M2', type: '二类', notes: '包括行道树79棵' },
  { id: '19', roadName: '网周路', roadSection: '良渚大道至玉琮路', area: 284, unit: 'M2', type: '二类', notes: '' },
  { id: '20', roadName: '网周路', roadSection: '古墩路至玉琮路', area: 2900, unit: 'M2', type: '二类', notes: '包括行道树79棵' },
  { id: '21', roadName: '立新路', roadSection: '顾家路至张家埭路', area: 265.09, unit: 'M2', type: '二类', notes: '' },
  { id: '22', roadName: '康良街', roadSection: '良渚路至张家埭路', area: 2878.5, unit: 'M2', type: '二类', notes: '' },
  { id: '23', roadName: '康良街', roadSection: '良渚路至张家埭路', area: 2878.5, unit: 'M2', type: '二类', notes: '' },
  { id: '24', roadName: '张家埭路', roadSection: '立新路至康良街', area: 430, unit: 'M2', type: '二类', notes: '包括行道树60棵' },
  { id: '25', roadName: '张家埭路', roadSection: '立新路至康良街', area: 1405, unit: 'M2', type: '二类', notes: '包括行道树115棵' },
  { id: '26', roadName: '杜文路绿化', roadSection: '全路段', area: 460, unit: 'M2', type: '二类', notes: '' },
  { id: '27', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '28', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '29', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '30', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '31', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '32', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '33', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '34', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '35', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '36', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '37', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '38', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '39', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '40', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '41', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' },
  { id: '42', roadName: '良渚街道办事处前', roadSection: '良渚路至康良街', area: 550, unit: 'M2', type: '二类', notes: '' }
];

// 模拟重点区域数据
const mockKeyAreas: KeyArea[] = [
  { id: '1', name: '永旺梦乐城', personInCharge: '张经理', contact: '13800138001', notes: '重点商业区' },
  { id: '2', name: '未来之光', personInCharge: '李主任', contact: '13800138002', notes: '新开发区域' },
  { id: '3', name: '洲际酒店', personInCharge: '王经理', contact: '13800138003', notes: '高端酒店区域' },
  { id: '4', name: '玉鸟集', personInCharge: '赵主管', contact: '13800138004', notes: '文化创意园区' },
  { id: '5', name: '医院', personInCharge: '刘院长', contact: '13800138005', notes: '医疗重点区域' },
  { id: '6', name: '地铁口', personInCharge: '孙队长', contact: '13800138006', notes: '交通枢纽' },
  { id: '7', name: '学校', personInCharge: '周主任', contact: '13800138007', notes: '教育区域' },
];

const BasicDataMaintenancePage: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [activeTab, setActiveTab] = useState<'roads' | 'toilets' | 'greening' | 'vehicles' | 'point' | 'vehicleReg' | 'keyArea'>('roads');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // 数据状态
  const [roads, setRoads] = useState<Road[]>(mockRoads);
  const [toilets, setToilets] = useState<Toilet[]>(mockToilets);
  const [greening, setGreening] = useState<Greening[]>(mockGreening);
  const [keyAreas, setKeyAreas] = useState<KeyArea[]>(() => {
    const saved = localStorage.getItem('keyAreas');
    return saved ? JSON.parse(saved) : mockKeyAreas;
  });

  // 表单状态
  const [formData, setFormData] = useState<any>({});

  // 保存重点区域数据到 localStorage
  useEffect(() => {
    localStorage.setItem('keyAreas', JSON.stringify(keyAreas));
  }, [keyAreas]);
  
  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 处理标签切换
  const handleTabChange = (tab: 'roads' | 'toilets' | 'greening' | 'vehicles' | 'point' | 'vehicleReg' | 'keyArea') => {
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
      switch (activeTab) {
        case 'roads':
          setRoads(roads.filter(road => road.id !== id));
          break;
        case 'toilets':
          setToilets(toilets.filter(toilet => toilet.id !== id));
          break;
        case 'greening':
          setGreening(greening.filter(item => item.id !== id));
          break;
        case 'keyArea':
          setKeyAreas(keyAreas.filter(item => item.id !== id));
          break;
      }
    }
  };
  
  // 处理表单提交
  const handleFormSubmit = () => {
    if (editingItem) {
      // 编辑现有项
      switch (activeTab) {
        case 'roads':
          setRoads(roads.map(road => road.id === editingItem.id ? formData : road));
          break;
        case 'toilets':
          setToilets(toilets.map(toilet => toilet.id === editingItem.id ? formData : toilet));
          break;
        case 'greening':
          setGreening(greening.map(item => item.id === editingItem.id ? formData : item));
          break;
        case 'keyArea':
          setKeyAreas(keyAreas.map(item => item.id === editingItem.id ? formData : item));
          break;
      }
    } else {
      // 添加新项
      const newId = Date.now().toString();
      const newItem = {
        ...formData,
        id: newId
      };
      
      switch (activeTab) {
        case 'roads':
          setRoads([...roads, newItem as Road]);
          break;
        case 'toilets':
          setToilets([...toilets, newItem as Toilet]);
          break;
        case 'greening':
          setGreening([...greening, newItem as Greening]);
          break;
        case 'keyArea':
          setKeyAreas([...keyAreas, newItem as KeyArea]);
          break;
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
  
  // 过滤数据
  const filteredData = () => {
    switch (activeTab) {
      case 'roads':
        return roads.filter(road =>
          road.roadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          road.roadSection.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'toilets':
        return toilets.filter(toilet =>
          toilet.toiletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          toilet.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'greening':
        return greening.filter(item =>
          item.roadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.roadSection.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'keyArea':
        return keyAreas.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.personInCharge.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return [];
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#081c2f] to-[#0d1b2a] text-white p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#00ffb2] bg-clip-text text-transparent">基础数据维护</h1>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#00e5ff] text-[#0a1628] font-bold rounded-lg hover:bg-[#00c2d9] transition-colors"
        >
          <Plus size={16} />
          添加数据
        </button>
      </div>
      
      {/* 标签切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('roads')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'roads' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          道路数据
        </button>
        <button
          onClick={() => handleTabChange('toilets')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'toilets' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          公厕数据
        </button>
        <button
          onClick={() => handleTabChange('greening')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'greening' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          绿化数据
        </button>
        <button
          onClick={() => handleTabChange('vehicles')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'vehicles' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          车辆管理
        </button>
        <button
          onClick={() => handleTabChange('point')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'point' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          点位信息维护
        </button>
        <button
          onClick={() => handleTabChange('vehicleReg')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'vehicleReg' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          车辆备案管理
        </button>
        <button
          onClick={() => handleTabChange('keyArea')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'keyArea' ? 'bg-[#00e5ff] text-[#0a1628]' : 'bg-[#1e4976] text-white hover:bg-[#2a5a8a]'}`}
        >
          重点区域维护
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
              {activeTab === 'roads' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">道路名称</th>
                  <th className="px-4 py-3 text-left">道路段落</th>
                  <th className="px-4 py-3 text-left">数量</th>
                  <th className="px-4 py-3 text-left">单位</th>
                  <th className="px-4 py-3 text-left">类别</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
              {activeTab === 'toilets' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">公厕名称</th>
                  <th className="px-4 py-3 text-left">公厕类别</th>
                  <th className="px-4 py-3 text-left">具体地址</th>
                  <th className="px-4 py-3 text-left">公厕编号</th>
                  <th className="px-4 py-3 text-left">建筑面积 (m²)</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
              {activeTab === 'greening' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">路段名称</th>
                  <th className="px-4 py-3 text-left">路段地点</th>
                  <th className="px-4 py-3 text-left">面积</th>
                  <th className="px-4 py-3 text-left">单位</th>
                  <th className="px-4 py-3 text-left">类别</th>
                  <th className="px-4 py-3 text-left">备注</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
              {activeTab === 'keyArea' && (
                <tr className="bg-[#1e4976]">
                  <th className="px-4 py-3 text-left">序号</th>
                  <th className="px-4 py-3 text-left">重点区域名称</th>
                  <th className="px-4 py-3 text-left">区域负责人</th>
                  <th className="px-4 py-3 text-left">联系方式</th>
                  <th className="px-4 py-3 text-left">备注</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData().length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'greening' ? 8 : activeTab === 'roads' || activeTab === 'toilets' ? 7 : 1} className="px-4 py-8 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredData().map((item, index) => (
                  <tr key={item.id} className="border-t border-[#1e4976] hover:bg-[#16283f]">
                    {activeTab === 'roads' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.roadName}</td>
                        <td className="px-4 py-3">{item.roadSection}</td>
                        <td className="px-4 py-3">{item.area}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{item.type}</td>
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
                    {activeTab === 'toilets' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.toiletName}</td>
                        <td className="px-4 py-3">{item.toiletType}</td>
                        <td className="px-4 py-3">{item.address}</td>
                        <td className="px-4 py-3">{item.toiletNumber}</td>
                        <td className="px-4 py-3">{item.area}</td>
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
                    {activeTab === 'greening' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.roadName}</td>
                        <td className="px-4 py-3">{item.roadSection}</td>
                        <td className="px-4 py-3">{item.area}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">{item.notes}</td>
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
                    {activeTab === 'keyArea' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.personInCharge}</td>
                        <td className="px-4 py-3">{item.contact}</td>
                        <td className="px-4 py-3">{item.notes}</td>
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

      {/* 车辆管理 tab 内容 */}
      {activeTab === 'vehicles' && (
        <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg">
          <VehicleManagementPage />
        </div>
      )}

      {/* 点位信息维护 tab 内容 */}
      {activeTab === 'point' && (
        <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg">
          <ConstructionWastePointManagement />
        </div>
      )}

      {/* 车辆备案管理 tab 内容 */}
      {activeTab === 'vehicleReg' && (
        <div className="bg-[#0d1b2a] border border-[#1e4976] rounded-lg">
          <VehicleRegistrationManagement />
        </div>
      )}

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
              {activeTab === 'roads' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">道路名称</label>
                    <input
                      type="text"
                      name="roadName"
                      value={formData.roadName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">道路段落</label>
                    <input
                      type="text"
                      name="roadSection"
                      value={formData.roadSection || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">数量</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">单位</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">类别</label>
                    <select
                      name="type"
                      value={formData.type || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    >
                      <option value="">请选择类别</option>
                      <option value="一类">一类</option>
                      <option value="二类">二类</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'toilets' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">公厕名称</label>
                    <input
                      type="text"
                      name="toiletName"
                      value={formData.toiletName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">公厕类别</label>
                    <input
                      type="text"
                      name="toiletType"
                      value={formData.toiletType || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">具体地址</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">公厕编号</label>
                    <input
                      type="text"
                      name="toiletNumber"
                      value={formData.toiletNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">建筑面积 (m²)</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'greening' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">路段名称</label>
                    <input
                      type="text"
                      name="roadName"
                      value={formData.roadName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">路段地点</label>
                    <input
                      type="text"
                      name="roadSection"
                      value={formData.roadSection || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">面积</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">单位</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">类别</label>
                    <select
                      name="type"
                      value={formData.type || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    >
                      <option value="">请选择类别</option>
                      <option value="一类">一类</option>
                      <option value="二类">二类</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">备注</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {activeTab === 'keyArea' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">重点区域名称</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">区域负责人</label>
                    <input
                      type="text"
                      name="personInCharge"
                      value={formData.personInCharge || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">联系方式</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">备注</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1e4976] border border-[#3a6da6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5ff] text-white"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#1e4976] text-white rounded-lg hover:bg-[#2a5a8a] transition-colors flex items-center gap-1"
              >
                <Cancel size={16} />
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

export default BasicDataMaintenancePage;