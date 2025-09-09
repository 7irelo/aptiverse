import { ArrowDown, ArrowUp } from "lucide-react"

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: number;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  trend,
  description,
}) => {
  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600'
  const trendIcon = trend >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          {trendIcon}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
        <p className="font-semibold text-gray-700 mb-1">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default MetricCard