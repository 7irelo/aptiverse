import { Calendar } from "lucide-react";
import DeadlineItem from "../components/DeadlineItem";
import { upcomingDeadlines } from "../constants";

type UpcomingDeadlinesProps = {};

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 md:gap-0">
                <h2 className="text-xl font-semibold text-slate-800">Upcoming Deadlines</h2>
                <Calendar size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                    <DeadlineItem key={index} deadline={deadline} />
                ))}
            </div>
        </div>
    )
}

export default UpcomingDeadlines