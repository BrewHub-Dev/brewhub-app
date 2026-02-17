import { Item } from "../types"
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react"

interface ItemsTableProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

export default function ItemsTable({ items, onEdit, onDelete }: Readonly<ItemsTableProps>) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 backdrop-blur-sm">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Código</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Categoría</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Precio</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-6 text-center text-muted-foreground">
                  No hay items disponibles
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const itemId = item.id || item._id
                const itemCode = item.code || item.sku || item.barcode
                const itemCategory = item.category?.name
                const itemImage = item.images?.[0]
                const itemStock = item.stock || 0

                console.log(item)

                return (
                  <tr key={itemId} className="border-t border-border/50 hover:bg-muted/30 transition-all">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded text-foreground">
                        {itemCode}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center ${itemImage ? 'hidden' : ''}`}>
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{item.name}</span>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">{itemCategory}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-primary">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      {itemStock > 0 ? (
                        <span className="text-sm text-foreground">{itemStock} unidades</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin stock</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 hover:bg-accent rounded-lg transition-all text-accent-foreground"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(itemId)}
                          className="p-2 hover:bg-destructive/20 rounded-lg transition-all text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
