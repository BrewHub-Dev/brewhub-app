import { Order } from "../types"

interface RecentOrdersTableProps {
  orders: Order[]
}

export default function RecentOrdersTable({ orders }: Readonly<RecentOrdersTableProps>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hora</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-all">
              <td className="py-3 px-4 text-sm font-mono text-foreground">{order.id}</td>
              <td className="py-3 px-4 text-sm text-foreground">{order.customer}</td>
              <td className="py-3 px-4 text-sm text-foreground">{order.items}</td>
              <td className="py-3 px-4 text-sm font-semibold text-primary">{order.total}</td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{order.time}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success backdrop-blur-sm">
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
