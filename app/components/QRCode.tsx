'use client'

import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

export default function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: { dark: '#0B194F', light: '#ffffff' },
      })
    }
  }, [value, size])

  return <canvas ref={canvasRef} className="rounded-xl" />
}
