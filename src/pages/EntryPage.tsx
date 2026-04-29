import { Link } from "react-router-dom";
import { Shield, Briefcase } from "lucide-react";

export default function EntryPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">城市管理系统</h1>
                    <p className="text-gray-600">请选择登录入口</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* 后台管理端入口 */}
                    <Link to="/admin" className="block">
                        <div 
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-[1.03] hover:shadow-xl border-2 border-transparent hover:border-blue-500"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center">
                                    <div 
                                        className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <Shield size={40} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">后台管理端</h2>
                                    <p className="text-gray-500 text-center">系统管理、数据分析、任务分配</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    
                    {/* 任务执行端入口 */}
                    <Link to="/task-execution" className="block">
                        <div 
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-[1.03] hover:shadow-xl border-2 border-transparent hover:border-green-500"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center">
                                    <div 
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <Briefcase size={40} className="text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">任务执行端</h2>
                                    <p className="text-gray-500 text-center">日常检查、垃圾分类、随手拍、事件处理</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}