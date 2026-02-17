import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: string | LucideIcon
  trend?: "up" | "down" | { value: number; isPositive: boolean }
  color?: string
}

const iconMap = {
  dollar: DollarSign,
  bag: ShoppingBag,
  users: Users,
  clock: Clock,
}

const colorMap = {
  blue: "from-chart-1/30 to-chart-1/20 text-chart-1",
  green: "from-success/30 to-success/20 text-success",
  purple: "from-chart-3/30 to-chart-3/20 text-chart-3",
  amber: "from-primary/30 to-primary/20 text-primary",
  red: "from-destructive/30 to-destructive/20 text-destructive",
}

export default function StatCard({ title, value, change, icon, trend, color = "amber" }: Readonly<StatCardProps>) {
  // Determinar el ícono
  const Icon = typeof icon === "string"
    ? (iconMap[icon as keyof typeof iconMap] || DollarSign)
    : icon

  // Determinar el cambio y tendencia
  const trendValue = typeof trend === "object" ? trend.value : change
  const isPositive = typeof trend === "object" ? trend.isPositive : trend === "up"

  // Obtener colores
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.amber

  return (
    <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-1 font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}
