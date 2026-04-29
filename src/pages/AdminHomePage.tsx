import { Link } from "react-router-dom";
import {
    Activity,
    Users,
    ClipboardList,
    BarChart3,
    MessageCircle,
    Truck,
    Settings,
    ArrowRight,
} from "lucide-react";

export default function AdminHomePage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">后台管理端</h1>
                            <p className="text-gray-600">系统管理、数据分析、任务分配</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('zh-CN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 城市管理驾驶舱 */}
                    <Link to="/dashboard" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">城市管理驾驶舱</h2>
                                        <p className="text-sm text-gray-500">综合展示任务完成情况</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Activity size={20} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 人员管理 */}
                    <Link to="/people-management" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">人员管理</h2>
                                        <p className="text-sm text-gray-500">维护系统用户和工作人员信息</p>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Users size={20} className="text-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 任务管理 */}
                    <Link to="/task-list" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">任务管理</h2>
                                        <p className="text-sm text-gray-500">查看和管理巡查任务</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <ClipboardList size={20} className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 建筑垃圾全链路管理 */}
                    <Link to="/construction-waste" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">建筑垃圾管理</h2>
                                        <p className="text-sm text-gray-500">管理清运司机、车辆、路线等</p>
                                    </div>
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Truck size={20} className="text-amber-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 举报与事件处理 */}
                    <Link to="/report-management" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">举报与事件处理</h2>
                                        <p className="text-sm text-gray-500">查看和处理市民举报的事件</p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <MessageCircle size={20} className="text-red-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 统计分析 */}
                    <Link to="/statistics" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">统计分析</h2>
                                        <p className="text-sm text-gray-500">查看各类统计数据</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <BarChart3 size={20} className="text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看详情</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
                
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">城市管理系统 © {new Date().getFullYear()}</p>
                        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center">
                            <ArrowRight size={14} className="mr-1 transform rotate-180" /> 返回入口选择
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}