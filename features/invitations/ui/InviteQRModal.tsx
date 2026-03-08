"use client"

import { X, Download, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"

export default function InviteQrModal({
  open,
  onClose,
  code,
}: Readonly<{
  open: boolean
  onClose: () => void
  code: string
}>) {
  const qrRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = 1000
    canvas.height = 1000

    const img = new Image()

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = "invite-qr.png"
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const printQR = () => {
    const printContents = qrRef.current?.innerHTML
    if (!printContents) return

    const printWindow = window.open("", "", "width=800,height=800")

    printWindow?.document.write(`
      <html>
        <head>
          <title>QR Invitación</title>
          <style>
            body{
              display:flex;
              justify-content:center;
              align-items:center;
              height:100vh;
              font-family:sans-serif;
            }
            .poster{
              text-align:center;
            }
            h1{
              font-size:28px;
              margin-bottom:20px;
            }
            p{
              margin-top:20px;
              font-size:14px;
              color:#555;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            ${printContents}
          </div>
        </body>
      </html>
    `)

    printWindow?.document.close()
    printWindow?.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">

      <div className="relative bg-white text-black rounded-2xl p-10 shadow-2xl text-center max-w-lg w-full">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">
          Escanea para unirte
        </h2>

        <p className="text-gray-500 mb-6">
          Escanea este código con tu teléfono
        </p>

        <div
          ref={qrRef}
          className="flex flex-col items-center"
        >
          <QRCodeSVG
            value={code}
            size={420}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />

          <p className="mt-6 font-mono text-sm text-gray-500 break-all">
            {code}
          </p>
        </div>

        <div className="flex gap-3 justify-center mt-8">

          <button
            onClick={downloadQR}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:opacity-80"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>

          <button
            onClick={printQR}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>

        </div>

      </div>
    </div>
  )
}
