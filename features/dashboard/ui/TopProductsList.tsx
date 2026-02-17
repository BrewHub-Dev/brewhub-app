import { Product } from "../types"

interface TopProductsListProps {
  products: Product[]
}

export default function TopProductsList({ products }: Readonly<TopProductsListProps>) {
  return (
    <div className="space-y-3">
      {products.map((product, idx) => (
        <div
          key={product.name}
          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover:shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-primary">#{idx + 1}</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.sales} ventas</p>
            </div>
          </div>
          <span className="text-primary font-bold">{product.revenue}</span>
        </div>
      ))}
    </div>
  )
}
