"use client"

import React from "react"
import { Scanned } from "./usePOS"
import ScannedItem from "./ScannedItem"
import { useDroppable } from '@dnd-kit/core'

export default function ScannedList({ scanned, onRemove, onChangeQty, onAdd }: Readonly<{ scanned: Scanned[]; onRemove: (id: string) => void; onChangeQty: (id: string, qty: number) => void; onAdd?: (item: any) => void }>) {
  const {isOver, setNodeRef} = useDroppable({ id: 'scanned' })

  return (
    <div data-drop="pos-scanned" ref={setNodeRef} className={`max-h-56 overflow-auto divide-y divide-border/20 rounded-lg ${isOver ? 'ring-2 ring-primary/40' : ''}`}>
      {scanned.length === 0 ? (
        <div className="p-4 text-sm">No hay items aún. Escanea un QR o selecciónalos.</div>
      ) : (
        scanned.map((s) => (
          <ScannedItem key={s.item.id} s={s} onRemove={onRemove} onChangeQty={onChangeQty} />
        ))
      )}
    </div>
  )
}
