import { PieChart } from "lucide-react";
import PieChartComponent from "../components/PieChartComponent";
import { subjects } from "../constants";
import { PieChartData } from "../types";

type ProgressPieChartProps = {};

const ProgressPieChart: React.FC<ProgressPieChartProps> = () => {

    const subjectDistribution: PieChartData[] = subjects.map(subject => ({
        name: subject.name,
        value: subject.progress,
        color: subject.color
    }))

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 md:gap-0">
                <h2 className="text-xl font-semibold text-slate-800">Study Distribution</h2>
                <PieChart size={20} className="text-gray-400" />
            </div>
            <div>
                <PieChartComponent data={subjectDistribution} />
            </div>
        </div>
    )
}

export default ProgressPieChart