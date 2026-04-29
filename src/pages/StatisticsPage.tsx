// 导入必要的React和图标库
import React, { useState } from 'react';
import { Download, Users, MapPin, Building, Calendar, Filter, BarChart, PieChart, Activity, CheckCircle, AlertCircle } from 'lucide-react';

// 定义TypeScript接口
export interface ComparisonItem {
  sequence: number;
  city: number;
}

export interface ComparisonData {
  totalChecks: ComparisonItem;
  issuesFound: ComparisonItem;
  rectificationRate: ComparisonItem;
  coverageRate: ComparisonItem;
}

export interface TrendItem {
  week: string;
  [key: string]: number | string;
}

export interface IssueDistributionItem {
  type: string;
  percentage: number;
  color: string;
}

export interface RectificationStatus {
  completed: number;
  pending: number;
}

export interface DimensionData {
  totalChecks: number;
  issuesFound: number;
  rectificationRate: number;
  coverageRate: number;
  comparisonData: ComparisonData;
  trendData: TrendItem[];
  issueDistribution: IssueDistributionItem[];
  rectificationStatus: RectificationStatus;
}

export interface StatisticsData {
  personal: DimensionData;
  team: DimensionData;
  area: DimensionData;
}

export interface BarChartProps {
  data: ComparisonItem[];
  labels: string[];
  title: string;
}

export interface TrendChartProps {
  data: TrendItem[];
  title: string;
}

export interface PieChartProps {
  data: IssueDistributionItem[];
  title: string;
}

export interface CoverageProgressBarProps {
  coverageRate: number;
}

// 模拟数据 - 多维度统计
const statisticsData: StatisticsData = {
  personal: {
    totalChecks: 78,
    issuesFound: 18,
    rectificationRate: 92,
    coverageRate: 88,
    comparisonData: {
      totalChecks: { sequence: 68, city: 90 },
      issuesFound: { sequence: 15, city: 22 },
      rectificationRate: { sequence: 90, city: 95 },
      coverageRate: { sequence: 85, city: 92 }
    },
    trendData: [
      { week: '第1周', userA: 5, userB: 3, userC: 2 },
      { week: '第2周', userA: 8, userB: 7, userC: 6 },
      { week: '第3周', userA: 7, userB: 9, userC: 8 },
      { week: '第4周', userA: 12, userB: 11, userC: 10 },
      { week: '本月', userA: 21, userB: 25, userC: 28 }
    ],
    issueDistribution: [
      { type: '垃圾分类', percentage: 30, color: '#3b82f6' },
      { type: '道路清洁', percentage: 25, color: '#f59e0b' },
      { type: '市政绿化', percentage: 25, color: '#10b981' },
      { type: '工地监管', percentage: 15, color: '#8b5cf6' },
      { type: '球磨处理', percentage: 5, color: '#ec4899' }
    ],
    rectificationStatus: {
      completed: 92,
      pending: 8
    }
  },
  team: {
    totalChecks: 245,
    issuesFound: 52,
    rectificationRate: 89,
    coverageRate: 92,
    comparisonData: {
      totalChecks: { sequence: 210, city: 260 },
      issuesFound: { sequence: 45, city: 58 },
      rectificationRate: { sequence: 87, city: 92 },
      coverageRate: { sequence: 90, city: 95 }
    },
    trendData: [
      { week: '第1周', teamA: 18, teamB: 22, teamC: 15 },
      { week: '第2周', teamA: 25, teamB: 28, teamC: 20 },
      { week: '第3周', teamA: 22, teamB: 30, teamC: 23 },
      { week: '第4周', teamA: 30, teamB: 35, teamC: 28 },
      { week: '本月', teamA: 68, teamB: 80, teamC: 70 }
    ],
    issueDistribution: [
      { type: '垃圾分类', percentage: 35, color: '#3b82f6' },
      { type: '道路清洁', percentage: 20, color: '#f59e0b' },
      { type: '市政绿化', percentage: 20, color: '#10b981' },
      { type: '工地监管', percentage: 15, color: '#8b5cf6' },
      { type: '球磨处理', percentage: 10, color: '#ec4899' }
    ],
    rectificationStatus: {
      completed: 89,
      pending: 11
    }
  },
  area: {
    totalChecks: 156,
    issuesFound: 34,
    rectificationRate: 91,
    coverageRate: 85,
    comparisonData: {
      totalChecks: { sequence: 135, city: 170 },
      issuesFound: { sequence: 30, city: 38 },
      rectificationRate: { sequence: 89, city: 94 },
      coverageRate: { sequence: 82, city: 88 }
    },
    trendData: [
      { week: '第1周', areaA: 12, areaB: 15, areaC: 10 },
      { week: '第2周', areaA: 18, areaB: 20, areaC: 15 },
      { week: '第3周', areaA: 16, areaB: 22, areaC: 17 },
      { week: '第4周', areaA: 22, areaB: 25, areaC: 20 },
      { week: '本月', areaA: 48, areaB: 55, areaC: 45 }
    ],
    issueDistribution: [
      { type: '垃圾分类', percentage: 25, color: '#3b82f6' },
      { type: '道路清洁', percentage: 30, color: '#f59e0b' },
      { type: '市政绿化', percentage: 20, color: '#10b981' },
      { type: '工地监管', percentage: 15, color: '#8b5cf6' },
      { type: '球磨处理', percentage: 10, color: '#ec4899' }
    ],
    rectificationStatus: {
      completed: 91,
      pending: 9
    }
  }
};

// 简化的柱状图组件
const BarChartComponent: React.FC<BarChartProps> = ({ data, labels, title }) => {
  return (
    <div className="h-[250px] relative">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <div className="h-[200px] border-l border-b border-gray-200 p-2 relative">
        {/* 水平网格线 */}
        {[25, 50, 75, 100].map((value) => (
          <div 
            key={value} 
            className="absolute left-0 right-0 h-px border-t border-gray-100" 
            style={{ bottom: `${value}%` }}
          >
            <span className="absolute -left-8 text-xs text-gray-400">{value}</span>
          </div>
        ))}
        
        {/* 柱状图 */}
        <div className="flex items-end justify-around h-full">
          {data.map((item: ComparisonItem, index: number) => (
            <div key={index} className="flex flex-col items-center w-1/4 relative">
              <div className="flex items-end h-full space-x-2">
                {item.sequence && (
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-orange-600 font-medium mb-1">
                      {item.sequence}
                    </div>
                    <div 
                      className="bg-orange-400 rounded-t" 
                      style={{ height: `${item.sequence}%`, width: '6px' }}
                    />
                  </div>
                )}
                {item.city && (
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      {item.city}
                    </div>
                    <div 
                      className="bg-blue-500 rounded-t" 
                      style={{ height: `${item.city}%`, width: '6px' }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-500">{labels[index]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-orange-400 mr-1 rounded-sm"></div>
          <span>序化管理</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
          <span>城市管理</span>
        </div>
      </div>
    </div>
  );
};

// 简化的趋势图组件
const TrendChartComponent: React.FC<TrendChartProps> = ({ data, title }) => {
  const datasets = Object.keys(data[0]).filter(key => key !== 'week');
  const colors = ['#10b981', '#f59e0b', '#f43f5e'];
  
  return (
    <div className="h-[250px] relative">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <div className="h-[200px] border-l border-b border-gray-200 p-2 relative">
        {/* 水平网格线 */}
        {[7, 14, 21, 28].map((value) => (
          <div 
            key={value} 
            className="absolute left-0 right-0 h-px border-t border-gray-100" 
            style={{ bottom: `${(value / 28) * 100}%` }}
          >
            <span className="absolute -left-8 text-xs text-gray-400">{value}</span>
          </div>
        ))}
        
        {/* 趋势线 */}
        {datasets.map((dataset, datasetIndex) => (
          <div key={dataset} className="absolute top-0 left-0 right-0 bottom-0">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={data.map((item: TrendItem, index: number) => {
                  const x = (index / (data.length - 1)) * 100;
                  const value = typeof item[dataset] === 'number' ? item[dataset] : 0;
                  const y = 100 - Math.max(0, Math.min(100, (value / 28) * 100));
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={colors[datasetIndex % colors.length]}
                strokeWidth="2"
              />
              {/* 数据点 */}
              {data.map((item: TrendItem, index: number) => {
                const x = (index / (data.length - 1)) * 100;
                const value = typeof item[dataset] === 'number' ? item[dataset] : 0;
                const y = 100 - Math.max(0, Math.min(100, (value / 28) * 100));
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={colors[datasetIndex % colors.length]}
                  />
                );
              })}
            </svg>
          </div>
        ))}
        
        {/* X轴标签 */}
        <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-4">
          {data.map((item: TrendItem, index: number) => (
            <span key={index} className="text-xs text-gray-400">{item.week}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
        {datasets.map((dataset, index) => (
          <div key={dataset} className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors[index % colors.length] }}></div>
            <span>{dataset}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 简化的饼图组件
const PieChartComponent: React.FC<PieChartProps> = ({ data, title }) => {
  // 计算饼图扇区
  let cumulativeAngle = 0;
  const segments = data.map((item: IssueDistributionItem) => {
    const angle = (item.percentage / 100) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      startAngle,
      endAngle: cumulativeAngle
    };
  });
  
  return (
    <div className="h-[250px] flex flex-col items-center">
      <h4 className="text-sm font-medium text-gray-500 mb-2 self-start">{title}</h4>
      <div className="relative w-[200px] h-[200px] flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 100 100">
          {segments.map((segment: IssueDistributionItem & { startAngle: number; endAngle: number }, index: number) => {
            const startX = 50 + 40 * Math.cos(segment.startAngle - Math.PI / 2);
            const startY = 50 + 40 * Math.sin(segment.startAngle - Math.PI / 2);
            const endX = 50 + 40 * Math.cos(segment.endAngle - Math.PI / 2);
            const endY = 50 + 40 * Math.sin(segment.endAngle - Math.PI / 2);
            const largeArcFlag = segment.percentage > 50 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                fill={segment.color}
              />
            );
          })}
        </svg>
        {/* 中心文本 */}
        {title === '整改率' && (
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{data[0].percentage}%</span>
            <span className="text-xs text-gray-500">已完成</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2 w-full">
        {data.map((item: IssueDistributionItem, index: number) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }}></div>
            <span>{item.type}: {item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 点位覆盖进度条组件
const CoverageProgressBar: React.FC<CoverageProgressBarProps> = ({ coverageRate }) => {
  return (
    <div className="h-[100px] relative">
      <h4 className="text-sm font-medium text-gray-500 mb-4">点位覆盖情况</h4>
      <div className="relative h-8 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 transition-all" 
          style={{ width: `${coverageRate}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-xs">
            已检查点位
          </div>
        </div>
        <div 
          className="absolute top-0 right-0 h-full bg-gray-300 transition-all" 
          style={{ width: `${100 - coverageRate}%` }}
        >
          {100 - coverageRate > 5 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-medium text-xs">
              未检查点位
            </div>
          )}
        </div>
        {/* 调整百分比数值的位置，避免与其他文本重叠 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg px-3 py-1 rounded-full bg-gray-700/70">
            {coverageRate}%
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

// 统计分析页面组件
export default function StatisticsPage() {
  const [dimension, setDimension] = useState<'personal' | 'team' | 'area'>('personal');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [filterType, setFilterType] = useState<'all' | 'sequence' | 'city'>('all');
  
  // 获取当前维度的数据
  const currentData = statisticsData[dimension as keyof StatisticsData];
  
  // 生成报表
  const generateReport = () => {
    alert(`正在生成${dimension === 'personal' ? '个人' : dimension === 'team' ? '团队' : '区域'}的${timeRange === 'week' ? '周' : '月'}度统计报表...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">统计分析</h1>
        <p className="text-gray-500">查看多维度检查数据统计</p>
      </div>

      {/* 维度切换标签页 */}
      <div className="mb-6 flex bg-white rounded-lg p-1 shadow-sm">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${dimension === 'personal' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setDimension('personal')}
        >
          <Users size={16} className="inline mr-1" />
          个人维度
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${dimension === 'team' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setDimension('team')}
        >
          <Building size={16} className="inline mr-1" />
          团队维度
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${dimension === 'area' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setDimension('area')}
        >
          <MapPin size={16} className="inline mr-1" />
          区域维度
        </button>
      </div>

      {/* 筛选工具栏 */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* 时间筛选 */}
          <div className="flex items-center gap-1">
            <Calendar size={16} className="text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="week">周</option>
              <option value="month">月</option>
            </select>
          </div>
          
          {/* 筛选类型 */}
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as 'all' | 'sequence' | 'city')}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="sequence">序化管理</option>
              <option value="city">城市管理</option>
            </select>
          </div>
        </div>
        
        {/* 生成报表按钮 */}
        <button 
          onClick={generateReport}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          <Download size={14} />
          生成报表
        </button>
      </div>

      {/* 筛选信息显示 */}
      <div className="bg-white rounded-lg p-3 shadow-sm mb-6">
        <div className="text-sm text-gray-500">
          当前查看: {dimension === 'personal' ? '个人' : dimension === 'team' ? '团队' : '区域'}维度 - 
          {filterType === 'all' ? '全部' : filterType === 'sequence' ? '序化管理' : '城市管理'}
        </div>
      </div>

      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <BarChart size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-500">检查总数</h3>
            <p className="text-2xl font-bold text-gray-800">{currentData.totalChecks}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-500">发现问题数</h3>
            <p className="text-2xl font-bold text-gray-800">{currentData.issuesFound}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-500">整改率</h3>
            <p className="text-2xl font-bold text-gray-800">{currentData.rectificationRate}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <MapPin size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-500">点位覆盖率</h3>
            <p className="text-2xl font-bold text-gray-800">{currentData.coverageRate}%</p>
          </div>
        </div>
      </div>

      {/* 序化管理 vs 城市管理对比图表 */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">序化管理 vs 城市管理对比</h3>
        <BarChartComponent 
          title="" 
          labels={['检查总数', '发现问题数', '整改率', '点位覆盖率']}
          data={[
            { sequence: currentData.comparisonData.totalChecks.sequence, city: currentData.comparisonData.totalChecks.city },
            { sequence: currentData.comparisonData.issuesFound.sequence, city: currentData.comparisonData.issuesFound.city },
            { sequence: currentData.comparisonData.rectificationRate.sequence, city: currentData.comparisonData.rectificationRate.city },
            { sequence: currentData.comparisonData.coverageRate.sequence, city: currentData.comparisonData.coverageRate.city }
          ]}
        />
      </div>

      {/* 趋势分析和问题分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{dimension === 'personal' ? '个人' : dimension === 'team' ? '团队' : '区域'}检查效果趋势</h3>
          <TrendChartComponent 
            title="" 
            data={currentData.trendData}
          />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">问题分布</h3>
          <PieChartComponent 
            title="问题分布" 
            data={currentData.issueDistribution}
          />
        </div>
      </div>

      {/* 整改率和点位覆盖情况 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">整改率</h3>
          <PieChartComponent 
            title="整改率" 
            data={[
              { type: '已完成', percentage: currentData.rectificationStatus.completed, color: '#10b981' },
              { type: '待处理', percentage: currentData.rectificationStatus.pending, color: '#f59e0b' }
            ]}
          />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <CoverageProgressBar coverageRate={currentData.coverageRate} />
        </div>
      </div>
    </div>
  );
}