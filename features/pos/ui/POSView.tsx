"use client"
import dynamic from "next/dynamic"

const POSCard = dynamic(() => import("./POSCard"), { ssr: false })

export default function POSView() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Ordenes</h1>
          <p className="text-muted-foreground">Escanea o busca productos para crear una orden</p>
        </div>

        <POSCard />
      </div>
    </div>
  )
}
