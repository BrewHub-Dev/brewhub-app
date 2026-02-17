"use client"

import { DndContext } from '@dnd-kit/core'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { usePOS } from "./usePOS"
import ItemSuggestion from "./ItemSuggestion"
import ScannedList from "./ScannedList"

export default function POSCard() {
  const {
    query,
    setQuery,
    suggestions,
    scanned,
    addItem,
    removeItem,
    changeQty,
    clear,
    customer,
    setCustomer,
    subtotal,
    tax,
    total,
  } = usePOS()

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return
    if (over.id !== 'scanned') return
    const aid: string = active.id
    if (!aid) return
    if (aid.startsWith('item:')) {
      const itemId = aid.split(':')[1]
      const item = suggestions.find((i) => i.id === itemId)
      if (item) addItem(item)
    }
  }

  return (
    <div className="rounded-2xl p-6 glass border shadow-lg w-full">
      <h3 className="text-lg font-semibold mb-3">Punto de venta (POS)</h3>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
          <label className="text-sm">Cliente</label>
          <Input placeholder="Nombre del cliente (opcional)" value={customer} onChange={(e) => setCustomer(e.target.value)} className="mb-3 mt-1 bg-muted/20 border" />

          <label className="text-sm">Escanear QR / Buscar ítem</label>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ingresa nombre o código" className="bg-muted/20 border" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" title="Simular escáner">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <Button type="button" onClick={() => { if (suggestions[0]) addItem(suggestions[0]) }} className="h-10 px-3">Add</Button>
          </div>

          <div className="mt-3 grid gap-2">
            {suggestions.slice(0, 6).map((it) => (
              <ItemSuggestion key={it.id} item={it} onAdd={addItem} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Items</span>
            <button onClick={clear} className="text-xs hover:underline flex items-center gap-1"><X className="w-4 h-4" />Limpiar</button>
          </div>

          <ScannedList scanned={scanned} onRemove={removeItem} onChangeQty={changeQty} onAdd={addItem} />

          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>IVA (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-semibold mt-2"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
            <div className="flex gap-2 mt-3">
              <Button onClick={() => alert(`Cobrar ${total.toFixed(2)} a ${customer || 'Cliente'}`)} className="flex-1 h-10 bg-primary text-primary-foreground">Cobrar</Button>
              <Button onClick={clear} variant="ghost" className="h-10">Cancelar</Button>
            </div>
          </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
