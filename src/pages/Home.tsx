import { Link } from "react-router-dom";

import {
    Camera,
    Trash2,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    MessageCircle,
    UserCheck,
    Users,
    Activity,
    Plus,
    ClipboardList,
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎使用城市管理系统</h1>
                <p className="text-gray-500">请选择您需要的功能</p>
            </div>
            {}
            <div className="grid grid-cols-1 gap-6">
                {/* 任务创建 - 新增 */}
                <Link to="/task-list" className="block">
                    <div
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4">
                                    <ClipboardList size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">日常检查</h2>
                                    <p className="text-sm text-blue-100">查看和管理巡查任务</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/80">点击查看任务列表</span>
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <ArrowRight size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/dashboard" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <Activity size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">城市管理驾驶舱</h2>
                                    <p className="text-sm text-gray-500">综合展示序化管理与城市管理任务完成情况</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                
                <Link to="/construction-waste" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                        <path d="M3 19h18v2H3z"></path>
                                        <path d="M7 16v-2a5 5 0 0 1 10 0v2"></path>
                                        <path d="M15 16h-2a5 5 0 0 1-5-5v-2H5v10"></path>
                                        <path d="M16 7v-2a2 2 0 0 1 2-2h2"></path>
                                        <path d="M12 7v-2a2 2 0 0 1 2-2h2"></path>
                                        <path d="M8 7v-2a2 2 0 0 1 2-2h2"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">建筑垃圾全链路管理</h2>
                                    <p className="text-sm text-gray-500">管理清运司机、车辆、重量、现场照片、路线等</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                <Link to="/garbage-inspection-list" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                    <Trash2 size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">生活垃圾分类检查</h2>
                                    <p className="text-sm text-gray-500">检查垃圾分类情况并进行评分</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                 <Link to="/hazard-reporting" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <Camera size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">随手拍</h2>
                                    <p className="text-sm text-gray-500">上传事件、整改和验收</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                <Link to="/photo-report-list" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                                    <CheckCircle size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">随手拍清单</h2>
                                    <p className="text-sm text-gray-500">查看所有随手拍处理记录</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                <Link to="/hazard-reporting?tab=process" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                                    <AlertTriangle size={24} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">事件整改</h2>
                                    <p className="text-sm text-gray-500">查看待整改隐患并进行处理</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                <Link to="/hazard-reporting?tab=check" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                    <CheckCircle size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">事件验收</h2>
                                    <p className="text-sm text-gray-500">查看待验收隐患并进行验收</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}
                <Link to="/report-management" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                    <MessageCircle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">举报与事件处理</h2>
                                    <p className="text-sm text-gray-500">查看和处理市民举报的事件</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
                {}

                {}
                 <Link to="/people-management" className="block">
                    <div
                        className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                                    <Users size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">人员管理</h2>
                                    <p className="text-sm text-gray-500">维护系统用户和工作人员信息</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">点击进入</span>
                                <ArrowRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="mt-auto pt-8 text-center text-sm text-gray-400">
                <p>城市管理系统 © {new Date().getFullYear()}</p>
            </div>
        </div>
    );
}