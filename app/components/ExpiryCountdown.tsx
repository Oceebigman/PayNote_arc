'use client'

import { useState, useEffect } from 'react'

export default function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setTimeLeft('Expired')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        h > 0 ? `${h}h ${m}m ${s}s` :
        m > 0 ? `${m}m ${s}s` :
        `${s}s`
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
      expired
        ? 'bg-red-50 border-red-100 text-red-500'
        : 'bg-yellow-50 border-yellow-100 text-yellow-600'
    }`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {expired ? 'Request expired' : `Expires in ${timeLeft}`}
    </div>
  )
}
