"use client"

import React from "react"
import { useDraggable } from '@dnd-kit/core'
import type { Item } from "../types"

export default function ItemSuggestion({ item, onAdd }: Readonly<{ item: Item; onAdd: (i: Item) => void }>) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({ id: `item:${item.id}` })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
    if (!el) return
    const drop = el.closest('[data-drop="pos-scanned"]')
    if (drop) onAdd(item)
  }

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onTouchEnd={handleTouchEnd}
      onClick={() => onAdd(item)}
      style={style}
      className="text-left p-2 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/20 flex items-center justify-between"
    >
      <div>
        <div className="text-sm font-semibold">{item.name}</div>
        <div className="text-xs">Código: {item.code}</div>
      </div>
      <div className="text-sm text-primary">${item.price.toFixed(2)}</div>
    </button>
  )
}
