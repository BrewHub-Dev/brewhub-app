import { WeeklySales } from "../types"

interface WeeklySalesChartProps {
  data: WeeklySales[]
}

export default function WeeklySalesChart({ data }: Readonly<WeeklySalesChartProps>) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentage = (item.value / maxValue) * 100

        return (
          <div key={item.day} className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-8 font-medium">{item.day}</span>
            <div className="flex-1 bg-muted/50 rounded-full h-8 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full flex items-center justify-end px-3 shadow-lg transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              >
                <span className="text-xs font-bold text-primary-foreground">${item.value}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
