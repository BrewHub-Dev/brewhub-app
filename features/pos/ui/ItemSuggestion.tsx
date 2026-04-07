"use client"

import React, { useRef, useEffect } from "react"
import { useDraggable } from '@dnd-kit/core'
import type { Item } from "../types"

export default function ItemSuggestion({ item, onAdd }: Readonly<{ item: Item; onAdd: (i: Item) => void }>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `item:${item.id}` })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  // Track if a real drag occurred so we can swallow the following click event
  const wasDragging = useRef(false)
  useEffect(() => {
    if (isDragging) wasDragging.current = true
  }, [isDragging])

  function handleClick() {
    if (wasDragging.current) {
      wasDragging.current = false
      return
    }
    onAdd(item)
  }

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
      onClick={handleClick}
      style={style}
      disabled={(item as any).stock === 0}
      className={`text-left p-2 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/20 flex items-center justify-between ${(item as any).stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{item.name}</div>
        <div className="text-xs">Código: {item.code}</div>
        {(item as any).stock !== undefined && (
          <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${(item as any).stock === 0 ? "bg-red-100 text-red-600" : (item as any).stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
            {(item as any).stock === 0 ? "Sin stock" : `${(item as any).stock} disp.`}
          </span>
        )}
      </div>
      <div className="text-sm text-primary shrink-0 ml-2">${item.price.toFixed(2)}</div>
    </button>
  )
}
