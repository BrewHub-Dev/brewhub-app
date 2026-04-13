
import { WeeklySales } from '../types'

interface WeeklySalesChartProps {
  data: WeeklySales[]
}

export default function WeeklySalesChart({
  data,
}: Readonly<WeeklySalesChartProps>) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className='space-y-4'>
      {data.map((item) => {
        const percentage = (item.value / maxValue) * 100

        const showInside = percentage > 25

        return (
          <div key={item.day} className='flex items-center gap-3'>
            <span className='w-8 text-sm font-medium text-muted-foreground'>
              {item.day}
            </span>

            <div className='relative flex-1 h-8 rounded-full bg-muted/40 overflow-hidden'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out flex items-center justify-end pr-2'
                style={{ width: `${percentage}%` }}
              >
                {showInside && (
                  <span className='text-xs font-semibold text-primary-foreground whitespace-nowrap'>
                    ${item.value}
                  </span>
                )}
              </div>

              {!showInside && (
                <span
                  className='absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground whitespace-nowrap'
                  style={{ left: `calc(${percentage}% + 8px)` }}
                >
                  ${item.value}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
