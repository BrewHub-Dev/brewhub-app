"use client"

import { useRef, useState } from "react"
import { X } from "lucide-react"
import { Scanned } from "./usePOS"

export default function ScannedItem({
  s,
  onRemove,
  onChangeQty,
}: Readonly<{
  s: Scanned
  onRemove: (id: string) => void
  onChangeQty: (id: string, qty: number) => void
}>) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [translateX, setTranslateX] = useState(0)
  const startX = useRef<number | null>(null)
  const pointerId = useRef<number | null>(null)

  const threshold = 80
  const maxLeft = -160
  const maxRight = 160

  function handlePointerStart(clientX: number, id?: number) {
    startX.current = clientX
    if (typeof id === 'number') pointerId.current = id
  }

  function handlePointerMove(clientX: number) {
    if (startX.current == null) return
    const diff = clientX - startX.current
    const next = Math.max(Math.min(diff, maxRight), maxLeft)
    setTranslateX(next)
  }

  function handlePointerEnd() {
    if (translateX <= -threshold) {
      onRemove(s.item.id)
    } else {
      setTranslateX(0)
    }
    startX.current = null
    pointerId.current = null
  }

  return (
    <div className="relative overflow-hidden">
      <div
        ref={ref}
        onPointerDown={(e) => {
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
          handlePointerStart(e.clientX, e.pointerId)
        }}
        onPointerMove={(e) => {
          if (pointerId.current !== null && e.pointerId !== pointerId.current) return
          e.preventDefault()
          handlePointerMove(e.clientX)
        }}
        onPointerUp={() => handlePointerEnd()}
        onPointerCancel={() => handlePointerEnd()}
        onTouchStart={(e) => handlePointerStart(e.touches[0].clientX)}
        onTouchMove={(e) => {
          e.preventDefault()
          handlePointerMove(e.touches[0].clientX)
        }}
        onTouchEnd={() => handlePointerEnd()}
        className="flex items-center gap-3 p-3 bg-transparent"
        style={{ transform: `translateX(${translateX}px)`, transition: translateX === 0 ? 'transform 150ms ease' : 'none', touchAction: 'pan-y' }}
      >
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{s.item.name}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">${s.item.price.toFixed(2)} c/u</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onChangeQty(s.item.id, s.qty - 1)} className="w-8 h-8 rounded-lg glass hover:shadow-md flex items-center justify-center text-gray-900 dark:text-white transition-all">-</button>
          <div className="w-8 text-center text-gray-900 dark:text-white font-medium">{s.qty}</div>
          <button onClick={() => onChangeQty(s.item.id, s.qty + 1)} className="w-8 h-8 rounded-lg glass hover:shadow-md flex items-center justify-center text-gray-900 dark:text-white transition-all">+</button>
          <div className="w-20 text-right font-medium text-amber-600 dark:text-amber-400">${(s.item.price * s.qty).toFixed(2)}</div>
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center pointer-events-none">
        <X className="w-5 h-5 text-red-500 dark:text-red-400" />
      </div>
    </div>
  )
}
