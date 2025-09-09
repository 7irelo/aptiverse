import { PieChartData } from "../types";

type PieChartComponentProps = {
  data: PieChartData[];
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-8 text-center md:text-left">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (percentage / 100) * 360
          const largeArcFlag = angle > 180 ? 1 : 0

          const x1 = 50 + 50 * Math.cos(currentAngle * Math.PI / 180)
          const y1 = 50 + 50 * Math.sin(currentAngle * Math.PI / 180)
          const x2 = 50 + 50 * Math.cos((currentAngle + angle) * Math.PI / 180)
          const y2 = 50 + 50 * Math.sin((currentAngle + angle) * Math.PI / 180)

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ')

          currentAngle += angle

          return (
            <path
              key={index}
              d={pathData}
              className={`${item.color.replace('bg-', 'fill-')}`}
            />
          )
        })}
        <circle cx="50" cy="50" r="30" className="fill-white" />
      </svg>

      <div className="flex-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
            <span className="text-sm text-gray-700">
              {item.name} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChartComponent