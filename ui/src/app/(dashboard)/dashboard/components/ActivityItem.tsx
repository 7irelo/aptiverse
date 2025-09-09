import { BarChart3, BookOpen, Brain, Target } from "lucide-react"
import { RecentActivity } from "../types";

type ActivityItemProps = {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'test': return <BarChart3 size={14} />
      case 'quiz': return <Brain size={14} />
      case 'project': return <Target size={14} />
      default: return <BookOpen size={14} />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50 hover:rounded-lg cursor-pointer last:border-b-0">
      <div className={`p-2 rounded-lg flex-shrink-0 ${activity.type === 'assignment' ? 'bg-blue-50 text-blue-500' :
        activity.type === 'test' ? 'bg-red-50 text-red-500' :
          activity.type === 'quiz' ? 'bg-green-50 text-green-500' :
            'bg-amber-50 text-amber-500'
        }`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-700 mb-1">{activity.activity}</p>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-500 font-medium">{activity.subject}</span>
          <span className="text-slate-400">{activity.time}</span>
        </div>
      </div>
      <div className={`font-bold text-sm ${getScoreColor(activity.score)}`}>
        {activity.score}%
      </div>
    </div>
  )
}

export default ActivityItem