import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, MoreHorizontal, ChevronRight, Plus, X, AlertTriangle, Camera } from "lucide-react";
import { motion } from 'framer-motion';
import { toast } from "sonner";

interface RatingItem {
    id: string;
    text: string;
    score: number;
    isChecked: boolean;
    imageUrl?: string;
}

interface RatingSection {
    id: string;
    title: string;
    totalScore: number;
    items: RatingItem[];
    isExpanded: boolean;
}

type RegionType = "district" | "community" | "village";

const GarbageClassificationInspectionPage: React.FC = () => {
    const navigate = useNavigate();

    const [selectedRegion, setSelectedRegion] = useState({
        district: "浙江省杭州市余杭区南苑街道",
        community: "新社区",
        village: "大陆村"
    });

    const [selectorVisible, setSelectorVisible] = useState(false);
    const [currentRegionType, setCurrentRegionType] = useState<RegionType>("district");

    const districtData = [
        "浙江省杭州市余杭区南苑街道",
        "浙江省杭州市余杭区临平街道",
        "浙江省杭州市余杭区星桥街道",
        "浙江省杭州市西湖区文新街道",
        "浙江省杭州市西湖区古荡街道"
    ];

    const communityData = ["新社区", "老社区", "幸福小区", "和谐家园", "阳光花园"];
    const villageData = ["大陆村", "七贤桥村", "南村", "北村", "中村"];

    const [ratingSections, setRatingSections] = useState<RatingSection[]>([{
        id: "quality",
        title: "1.分类质量",
        totalScore: 40,
        isExpanded: true,

        items: [{
            id: "quality-1",
            text: "分类质量不合格",
            score: 40,
            isChecked: false
        }, {
            id: "quality-2",
            text: "存在轻微混投",
            score: 5,
            isChecked: false
        }, {
            id: "quality-3",
            text: "存在混投现象",
            score: 10,
            isChecked: false
        }, {
            id: "quality-4",
            text: "未开展或虚设定时定点",
            score: 20,
            isChecked: false
        }]
    }, {
        id: "facility",
        title: "2.分类设施",
        totalScore: 30,
        isExpanded: true,

        items: [{
            id: "facility-1",
            text: "分类投放点未配齐四类垃圾投放设施",
            score: 5,
            isChecked: false
        }, {
            id: "facility-2",
            text: "发现染色桶",
            score: 5,
            isChecked: false
        }, {
            id: "facility-3",
            text: "未对误时投放方式进行说明",
            score: 5,
            isChecked: false
        }, {
            id: "facility-4",
            text: "分类设施过于陈旧、褪色、破损、脏污",
            score: 5,
            isChecked: false
        }, {
            id: "facility-5",
            text: "分类设施地面油污、污水横流",
            score: 10,
            isChecked: false
        }, {
            id: "facility-6",
            text: "再生资源站点未设置的或作用他用",
            score: 10,
            isChecked: false
        }, {
            id: "facility-7",
            text: "共用的再生资源站点未设置在公共区域，覆盖距离、户数不达标",
            score: 10,
            isChecked: false
        }, {
            id: "facility-8",
            text: "站点面积未达要求",
            score: 10,
            isChecked: false
        }, {
            id: "facility-9",
            text: "站点内管理制度、兑换价目表、回收单位及人员等信息公示不全",
            score: 5,
            isChecked: false
        }, {
            id: "facility-10",
            text: "再生资源站点位指引不准确、过期与实际位置不符",
            score: 5,
            isChecked: false
        }, {
            id: "facility-11",
            text: "站点运营时间未达标",
            score: 5,
            isChecked: false
        }, {
            id: "facility-12",
            text: "站点台账记录不全",
            score: 5,
            isChecked: false
        }, {
            id: "facility-13",
            text: "站点环境卫生情况差",
            score: 5,
            isChecked: false
        }, {
            id: "facility-14",
            text: "特殊垃圾临时投放点未设置，未公示收运方式",
            score: 10,
            isChecked: false
        }, {
            id: "facility-15",
            text: "临时堆放点未规范设置围档",
            score: 5,
            isChecked: false
        }, {
            id: "facility-16",
            text: "临时堆放点地面未硬化",
            score: 5,
            isChecked: false
        }, {
            id: "facility-17",
            text: "特殊垃圾临时堆放点未分区或混投",
            score: 10,
            isChecked: false
        }, {
            id: "facility-18",
            text: "临时堆放点杂乱，环境卫生差",
            score: 5,
            isChecked: false
        }, {
            id: "facility-19",
            text: "临时堆放点挪作他用",
            score: 10,
            isChecked: false
        }, {
            id: "facility-20",
            text: "临时堆放点未设置告示牌",
            score: 5,
            isChecked: false
        }, {
            id: "facility-21",
            text: "告示牌信息不全",
            score: 5,
            isChecked: false
        }]
    }, {
        id: "guidance",
        title: "3.分类辅导",
        totalScore: 20,
        isExpanded: true,

        items: [{
            id: "guidance-1",
            text: "未设置或设置分类指示员",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-2",
            text: "指示牌公示信息不到位",
            score: 1,
            isChecked: false
        }, {
            id: "guidance-3",
            text: "指示牌存在破损、脏污",
            score: 1,
            isChecked: false
        }, {
            id: "guidance-4",
            text: "分类宣传标识样式、颜色错误",
            score: 2,
            isChecked: false
        }, {
            id: "guidance-5",
            text: "未按要求设置管理员",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-6",
            text: "专管员不具备开展分类工作能力",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-7",
            text: "发现现场二次分拣",
            score: 10,
            isChecked: false
        }, {
            id: "guidance-8",
            text: "投放时段无人值守",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-9",
            text: "非投放时段未及时撤桶",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-10",
            text: "非投放时段存在垃圾包",
            score: 5,
            isChecked: false
        }, {
            id: "guidance-11",
            text: "小区内存在垃圾散管",
            score: 20,
            isChecked: false
        }]
    }, {
        id: "transport",
        title: "4.分类清运",
        totalScore: 10,
        isExpanded: true,

        items: [{
            id: "transport-1",
            text: "集置点垃圾清运后摆放杂乱",
            score: 4,
            isChecked: false
        }, {
            id: "transport-2",
            text: "垃圾超过桶身，无合适",
            score: 4,
            isChecked: false
        }, {
            id: "transport-3",
            text: "垃圾未及时清运，堆积",
            score: 4,
            isChecked: false
        }, {
            id: "transport-4",
            text: "特殊垃圾未及时清运，堆积",
            score: 5,
            isChecked: false
        }, {
            id: "transport-5",
            text: "堆放高度超过边框",
            score: 4,
            isChecked: false
        }, {
            id: "transport-6",
            text: "集置点环境卫生情况差",
            score: 5,
            isChecked: false
        }]
    }]);

    const toggleItemCheck = (sectionId: string, itemId: string) => {
        setRatingSections(prevSections => prevSections.map(section => {
            if (section.id === sectionId) {
                const currentItem = section.items.find(item => item.id === itemId);

                if (!currentItem)
                    return section;

                if (!currentItem.isChecked) {
                    const currentScore = section.items.filter(item => item.isChecked).reduce((sum, item) => sum + item.score, 0);

                    if (currentScore + currentItem.score > section.totalScore) {
                        toast.error(`该类别扣分不能超过${section.totalScore}分`);
                        return section;
                    }
                }

                return {
                    ...section,

                    items: section.items.map(item => item.id === itemId ? {
                        ...item,
                        isChecked: !item.isChecked
                    } : item)
                };
            }

            return section;
        }));
    };

    const toggleSectionExpansion = (sectionId: string) => {
        setRatingSections(prevSections => prevSections.map(section => section.id === sectionId ? {
            ...section,
            isExpanded: !section.isExpanded
        } : section));
    };

    const calculateSectionScore = (section: RatingSection): number => {
        return section.items.filter(item => item.isChecked).reduce((sum, item) => sum + item.score, 0);
    };

    const calculateTotalScore = (): number => {
        return 100 - ratingSections.reduce((sum, section) => sum + calculateSectionScore(section), 0);
    };

    const handleSelectImage = (sectionId: string, itemId: string) => {
        console.log(`Select image for section ${sectionId}, item ${itemId}`);
    };

    const handleSave = () => {
        toast.success("已暂存");
        console.log("Save inspection data");
    };

    const handleConfirm = () => {
        toast.success("已确认提交");

        console.log("Confirm inspection data", {
            sections: ratingSections,
            totalScore: calculateTotalScore()
        });
    };

  const handleBack = () => {
    navigate(-1);
  };

    const openSelector = (type: RegionType) => {
        setCurrentRegionType(type);
        setSelectorVisible(true);
    };

    const closeSelector = () => {
        setSelectorVisible(false);
    };

    const selectRegion = (value: string) => {
        setSelectedRegion(prev => ({
            ...prev,
            [currentRegionType]: value
        }));

        closeSelector();
    };

    const getSelectorTitle = (): string => {
        switch (currentRegionType) {
        case "district":
            return "选择检查地区";
        case "community":
            return "选择小区/村";
        case "village":
            return "选择自然村";
        default:
            return "选择地区";
        }
    };

    const getSelectorData = (): string[] => {
        switch (currentRegionType) {
        case "district":
            return districtData;
        case "community":
            return communityData;
        case "village":
            return villageData;
        default:
            return [];
        }
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
                case 'section':
                    const section = ratingSections.find(s => s.id === drillDownId);
                    if (section) {
                        // 可以在这里添加具体的下钻逻辑
                        console.log('下钻到评分类别:', section.title);
                    }
                    break;
                case 'item':
                    // 查找具体的评分项
                    let foundItem = null;
                    for (const section of ratingSections) {
                        foundItem = section.items.find(item => item.id === drillDownId);
                        if (foundItem) break;
                    }
                    if (foundItem) {
                        // 可以在这里添加具体的下钻逻辑
                        console.log('下钻到评分项:', foundItem.text);
                    }
                    break;
                default:
                    console.log('未知的下钻类型:', drillDownType);
            }
        }
    };

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen">
            {}
            <header
                className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
                <button onClick={handleBack} className="p-1">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold">生活垃圾分类检查</h1>
                <div className="flex items-center gap-3">
                    <button className="p-1">
                        <MoreHorizontal size={20} />
                    </button>
                    <button className="p-1">
                        <Settings size={20} />
                    </button>
                </div>
            </header>
            {}
            <div className="bg-white p-4">
                <div
                    className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer"
                    onClick={() => openSelector("district")}>
                    <span className="text-sm text-gray-700">检查地区</span>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">{selectedRegion.district}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>
                <div
                    className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer"
                    onClick={() => openSelector("community")}>
                    <span className="text-sm text-gray-700">选择小区/村</span>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">{selectedRegion.community}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>
                <div
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => openSelector("village")}>
                    <span className="text-sm text-gray-700">选择自然村</span>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">{selectedRegion.village}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>
            </div>
            {}
            <div className="flex-1 overflow-auto p-4" onClick={(e) => handleDataDrillDown(e)}>
                {ratingSections.map(section => (
                    <div
                        key={section.id}
                        className="mb-4 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                        {}
                        <div
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 cursor-pointer"
                            onClick={() => toggleSectionExpansion(section.id)}>
                            <h2 className="text-base font-semibold text-gray-800">{section.title}</h2>
                            <div className="flex items-center">
                                <span className="px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700 mr-3">
                                    {section.title.split(".")[1]}评分({section.totalScore}分)
                                </span>
                                <button
                                    className="px-3 py-1 bg-white text-green-600 text-sm font-medium rounded-full shadow-sm hover:bg-green-50 transition-colors mr-3"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleSave();
                                    }}>
                                    暂存
                                </button>
                                <ChevronRight
                                    size={18}
                                    className={`text-green-600 transition-transform duration-300 ${section.isExpanded ? "rotate-90" : ""}`} />
                            </div>
                        </div>
                        {}
                        {section.isExpanded && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {section.items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        className={`flex items-center p-4 ${index < section.items.length - 1 ? "border-b border-gray-50" : ""} hover:bg-green-50/50 transition-colors`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="mr-4">
                                            <input
                                                type="checkbox"
                                                checked={item.isChecked}
                                                onChange={() => toggleItemCheck(section.id, item.id)}
                                                className="h-5 w-5 text-green-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 transition-all" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-800">{item.text}</span>
                                            <span className="ml-2 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                                                -{item.score}分
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                className="flex items-center justify-center px-3 py-1.5 bg-white border border-green-200 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition-colors mr-3"
                                                onClick={() => handleSelectImage(section.id, item.id)}
                                            >
                                                <Camera size={14} className="mr-1" />
                                                上传图片
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {}
                                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-t border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            该类别扣分上限: <span className="font-medium">{section.totalScore}分</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-600">已扣分: </span>
                                            <span className="text-lg font-bold text-red-600">{calculateSectionScore(section)}分</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
             {}
            {/* 提示信息 */}
            <div className="p-4 bg-amber-50 mx-4 my-3 rounded-lg border border-amber-200">
                <div className="flex items-start">
                    <AlertTriangle size={18} className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                        检查提示: 请根据实际情况勾选相应的扣分项目，每个类别的扣分不能超过其总分值。
                        您可以随时点击"暂存"按钮保存当前进度。
                    </p>
                </div>
            </div>
            {}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-green-200 shadow-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="bg-green-100 px-4 py-2 rounded-lg">
                        <span className="text-green-800 text-sm font-medium">合计得分:</span>
                        <span className="text-green-800 text-2xl font-bold ml-1">{calculateTotalScore()}</span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        确认提交
                    </button>
                </div>
            </div>
            {}
            {selectorVisible && <div className="fixed inset-0 bg-black/50 flex items-end z-50">
                <div className="bg-white w-full rounded-t-xl overflow-hidden">
                    <div
                        className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium">{getSelectorTitle()}</h3>
                        <button onClick={closeSelector} className="p-1">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {getSelectorData().map((item, index) => <div
                            key={index}
                            className={`p-4 border-b border-gray-100 ${selectedRegion[currentRegionType] === item ? "bg-green-50" : "bg-white"}`}
                            onClick={() => selectRegion(item)}>
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-sm ${selectedRegion[currentRegionType] === item ? "text-green-600 font-medium" : "text-gray-700"}`}>
                                    {item}
                                </span>
                                {selectedRegion[currentRegionType] === item && <ChevronRight size={16} className="text-green-600" />}
                            </div>
                        </div>)}
                    </div>
                    <div className="p-4">
                        <button
                            onClick={closeSelector}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-md">取消
                                          </button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default GarbageClassificationInspectionPage;