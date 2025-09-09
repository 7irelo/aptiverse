import { AlertTriangle } from "lucide-react";
import { Subject } from "../types";

type SubjectCardProps = {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const isOnTrack = subject.progress >= subject.target
  const performanceLevel = subject.averageScore >= 80 ? 'high' : subject.averageScore >= 70 ? 'medium' : 'low'

  return (
    <div className="p-5 border border-slate-100 rounded-lg transition-all duration-300 bg-slate-50 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-2">{subject.name}</h3>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-500 font-medium">Avg: {subject.averageScore}%</span>
            {subject.nextAssessment && (
              <span className="text-xs text-purple-400 font-medium">{subject.nextAssessment}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isOnTrack ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
            {isOnTrack ? 'On Track' : 'Needs Focus'}
          </span>
          <div className={`w-2 h-2 rounded-full ${performanceLevel === 'high' ? 'bg-emerald-500' : performanceLevel === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
        </div>
      </div>

      <div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${subject.color}`}
            style={{ width: `${subject.progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="font-semibold text-slate-800">{subject.progress}%</span>
          <span className="text-slate-500">Target: {subject.target}%</span>
        </div>
      </div>

      {subject.focusArea && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-md text-xs text-amber-800 font-medium">
          <AlertTriangle size={12} />
          <span>Focus on: {subject.focusArea}</span>
        </div>
      )}
    </div>
  )
}

export default SubjectCard