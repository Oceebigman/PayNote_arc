'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const QRCode = dynamic(() => import('@/app/components/QRCode'), { ssr: false })

interface Props {
  req: { amount: string; reason: string; note: string; to_address: string; token?: string }
  link: string
  slug: string
}

export default function ConfirmClient({ req, link, slug }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [dark, setDark] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const token = req.token || 'USDC'

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    if (saved === 'dark') setDark(true)
    setTimeout(() => setRevealed(true), 100)
  }, [])

  function toggleDark() {
    setDark(d => {
      localStorage.setItem('paynote-theme', !d ? 'dark' : 'light')
      return !d
    })
  }

  function handleCopy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  function handleShare() {
    const text = `I just created a payment request for ${Number(req.amount).toFixed(2)} ${token} — powered by @arc\n\n${link}\n\nBuilt on paynote.space`
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank')
  }

  const bg = dark ? '#0f1117' : '#F4F5F7'
  const card = dark ? '#1a1d27' : '#ffffff'
  const border = dark ? '#2a2d3a' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#111827'
  const muted = dark ? '#64748b' : '#9ca3af'
  const inputBg = dark ? '#111316' : '#f9fafb'

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200" style={{background: bg}}>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="pgc" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4A154B"/>
                    <stop offset="100%" stopColor="#1A44C4"/>
                  </linearGradient>
                </defs>
                <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgc)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="font-bold text-lg tracking-tight" style={{color: text}}>PayNote</span>
            </div>
            <button onClick={toggleDark} className="p-2 rounded-lg border transition-colors" style={{borderColor: border, background: inputBg}}>
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm mb-4" style={{background: card, borderColor: border}}>

            <div className="px-6 py-5" style={{background: 'linear-gradient(135deg, #0B194F 0%, #102A83 60%, #1A44C4 100%)'}}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-green-300 text-sm font-semibold uppercase tracking-widest">Payment link created</span>
              </div>
              <p className="text-white font-bold text-3xl">{Number(req.amount) < 0.01 ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)} <span className="text-xl text-blue-300 font-medium">{token}</span></p>
              <p className="text-blue-200 text-base mt-1">{req.reason}</p>
            </div>

            <div className="p-6">

              {/* Link */}
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{color: muted}}>Your payment link</p>
                <div className="rounded-2xl border-2 p-4 mb-3" style={{borderColor: '#1A44C4', background: dark ? '#0d1a3a' : '#EFF6FF'}}>
                  <p className="text-base font-mono font-semibold break-all leading-relaxed" style={{color: '#1A44C4'}}>{link}</p>
                </div>
                <button onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all text-white mb-3"
                  style={{background: copied ? '#16a34a' : 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Link copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Copy payment link
                    </>
                  )}
                </button>

                {/* QR Code toggle */}
                <button onClick={() => setShowQR(q => !q)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-base border transition-all mb-3"
                  style={{borderColor: border, color: muted, background: inputBg}}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                  </svg>
                  {showQR ? 'Hide QR code' : 'Show QR code for in-person payments'}
                </button>

                {showQR && (
                  <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border mb-3" style={{borderColor: border, background: '#ffffff'}}>
                    <QRCode value={link} size={180} />
                    <p className="text-sm text-center" style={{color: muted}}>Scan to open payment page</p>
                  </div>
                )}
              </div>

              {/* Share on X */}
              <button onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all border-2 mb-5"
                style={{borderColor: '#1A44C4', color: '#1A44C4', background: dark ? '#0d1a3a' : '#EFF6FF'}}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.76l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>

              {/* Summary */}
              <div className="rounded-xl border divide-y text-sm mb-5" style={{borderColor: border}}>
                {[
                  ['Amount', Number(req.amount) < 0.01 ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2) + ' ' + token],
                  ['Reason', req.reason],
                  ['Send to', req.to_address],
                  ...(req.note ? [['Note', req.note]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-sm font-semibold uppercase tracking-widest shrink-0 mt-0.5 w-16" style={{color: muted}}>{label}</span>
                    <span className="text-sm font-mono break-all" style={{color: text}}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => router.push('/r/' + slug)}
                  className="flex-1 py-3 rounded-xl border text-base font-medium transition-colors"
                  style={{borderColor: border, color: text, background: inputBg}}>
                  Preview page
                </button>
                <button onClick={() => router.push('/')}
                  className="flex-1 py-3 rounded-xl text-base font-bold text-white transition-colors"
                  style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
                  New request
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm" style={{color: muted}}>
            Share this link anywhere · Opens on any device
          </p>
        </div>
      </main>

      <footer className="py-4 border-t" style={{borderColor: border, background: card}}>
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => router.push('/my/' + req.to_address)}
            className="text-sm font-medium" style={{color: '#1A44C4'}}>
            View all my payment requests →
          </button>
          <p className="text-sm" style={{color: muted}}>
            PayNote · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-medium" style={{color: '#1A44C4'}}>Arc</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
