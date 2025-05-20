import { UpcomingDeadline } from "../types";

type DeadlineItemProps = {
  deadline: UpcomingDeadline;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ deadline }) => (
  <div className="flex flex-col md:flex-row md:justify-between md:items-start p-4 border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50 hover:rounded-lg cursor-pointer last:border-b-0 gap-4 md:gap-0">
    <div>
      <h4 className="font-semibold text-slate-800 mb-2">{deadline.task}</h4>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-slate-500 font-medium">{deadline.subject}</span>
        <span className="text-xs text-purple-400 font-medium">{deadline.type}</span>
        <span className="text-xs text-amber-500 font-medium">{deadline.preparationTime}</span>
      </div>
    </div>
    <div className="flex flex-col items-start sm:items-end gap-2">
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${deadline.priority === 'high' ? 'bg-red-50 text-red-600' :
          deadline.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
            'bg-green-50 text-green-600'
        }`}>
        {deadline.priority}
      </span>
      <span className="text-xs text-slate-500 font-medium">{deadline.due}</span>
    </div>
  </div>
)

export default DeadlineItem
