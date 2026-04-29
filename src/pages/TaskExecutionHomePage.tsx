import { Link } from "react-router-dom";
import {
    ClipboardList,
    Trash2,
    Camera,
    CheckCircle,
    AlertTriangle,
    MessageCircle,
    UserCheck,
    ArrowRight,
    Truck,
    QrCode,
} from "lucide-react";

export default function TaskExecutionHomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">任务执行端</h1>
                            <p className="text-gray-600">日常检查、垃圾分类、随手拍、事件处理</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleTimeString('zh-CN')}
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 日常检查 */}
                    <Link to="/my-tasks" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">日常检查</h2>
                                        <p className="text-sm text-gray-500">查看和执行巡查任务</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <ClipboardList size={20} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">进入移动端</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 生活垃圾分类检查 */}
                    <Link to="/garbage-inspection-list" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">垃圾分类检查</h2>
                                        <p className="text-sm text-gray-500">检查垃圾分类情况并评分</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Trash2 size={20} className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">进入检查</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 随手拍 */}
                    <Link to="/hazard-reporting" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">随手拍</h2>
                                        <p className="text-sm text-gray-500">上传事件、整改和验收</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Camera size={20} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">开始拍摄</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 随手拍清单 */}
                    <Link to="/photo-report-list" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">随手拍清单</h2>
                                        <p className="text-sm text-gray-500">查看所有随手拍记录</p>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={20} className="text-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">查看清单</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 事件整改 */}
                    <Link to="/hazard-reporting?tab=process" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">事件整改</h2>
                                        <p className="text-sm text-gray-500">处理待整改隐患</p>
                                    </div>
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={20} className="text-orange-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">开始整改</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 事件验收 */}
                    <Link to="/hazard-reporting?tab=check" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">事件验收</h2>
                                        <p className="text-sm text-gray-500">验收整改结果</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={20} className="text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">开始验收</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 建筑垃圾清运申请 */}
                    <Link to="/construction-waste-application" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">建筑垃圾清运申请</h2>
                                        <p className="text-sm text-gray-500">提交建筑垃圾清运申请</p>
                                    </div>
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Truck size={20} className="text-amber-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">开始申请</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 建筑垃圾核销 */}
                    <Link to="/construction-waste-verify" className="block">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">建筑垃圾核销</h2>
                                        <p className="text-sm text-gray-500">核销申请方的二维码</p>
                                    </div>
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <QrCode size={20} className="text-teal-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">开始核销</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
                
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">城市管理系统 © {new Date().getFullYear()}</p>
                        <Link to="/" className="text-sm text-green-600 hover:text-green-800 flex items-center justify-center">
                            <ArrowRight size={14} className="mr-1 transform rotate-180" /> 返回入口选择
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}