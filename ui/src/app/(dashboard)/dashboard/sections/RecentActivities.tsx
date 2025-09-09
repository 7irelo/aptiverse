import { BarChart3 } from "lucide-react";
import ActivityItem from "../components/ActivityItem";
import { recentActivities } from "../constants";

type RecentActivitiesProps = {};

const RecentActivities: React.FC<RecentActivitiesProps> = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 md:gap-0">
                <h2 className="text-xl font-semibold text-slate-800">Recent Activities</h2>
                <BarChart3 size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                ))}
            </div>
        </div>
    )
}

export default RecentActivities