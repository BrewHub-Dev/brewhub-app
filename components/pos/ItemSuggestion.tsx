"use client"

import React from "react"
import { Item } from "./usePOS"
import { useDraggable } from '@dnd-kit/core'

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
      className="text-left p-3 rounded-xl glass hover:shadow-lg border border-border flex items-center justify-between transition-all"
    >
      <div>
        <div className="text-sm font-semibold text-foreground">{item.name}</div>
        <div className="text-xs">Código: {item.id}</div>
      </div>
      <div className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</div>
    </button>
  )
}
