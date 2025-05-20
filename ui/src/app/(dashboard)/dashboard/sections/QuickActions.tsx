import { ArrowUp } from "lucide-react";
import { quickActions } from "../constants";

type QuickActionsProps = {};

const QuickActions: React.FC<QuickActionsProps> = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => (
                <button key={index} className="flex items-center gap-4 p-5 bg-white rounded-xl transition-all duration-300 cursor-pointer text-left w-full hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-xl">
                    <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <action.icon size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <span className="block font-semibold text-slate-800 text-sm">{action.label}</span>
                        <span className="text-xs text-slate-500 leading-tight">{action.description}</span>
                    </div>
                    <ArrowUp size={16} className="text-gray-400 transform rotate-45" />
                </button>
            ))}
        </div>
    )
}

export default QuickActions