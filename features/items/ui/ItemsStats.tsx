import { Package, DollarSign, Barcode } from "lucide-react"

interface ItemsStatsProps {
  totalItems: number
  averagePrice: number
  totalCategories: number
}

export default function ItemsStats({ totalItems, averagePrice, totalCategories }: Readonly<ItemsStatsProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground text-sm font-medium">Total Items</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{totalItems}</p>
      </div>
      <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 text-success" />
          <span className="text-muted-foreground text-sm font-medium">Precio Promedio</span>
        </div>
        <p className="text-3xl font-bold text-foreground">${averagePrice.toFixed(2)}</p>
      </div>
      <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-2">
          <Barcode className="w-5 h-5 text-chart-1" />
          <span className="text-muted-foreground text-sm font-medium">Categorías</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{totalCategories}</p>
      </div>
    </div>
  )
}
