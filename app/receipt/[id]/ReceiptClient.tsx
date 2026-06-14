'use client'

import { useState } from 'react'

interface Req {
  id: string
  slug: string
  amount: string
  reason: string
  note: string
  to_address: string
  sender_address: string
  tx_hash: string
  created_at: string
  completed_at: string
  status: string
  token: string
}

export default function ReceiptClient({ req }: { req: Req }) {
  const [copiedTx, setCopiedTx] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const token = req.token || 'USDC'
  const sender = req.sender_address
    ? req.sender_address.slice(0, 6) + '...' + req.sender_address.slice(-4)
    : 'Direct wallet transfer'
  const senderFull = req.sender_address || 'Direct wallet transfer'

  const date = new Date(req.completed_at).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  })

  const receiptUrl = typeof window !== 'undefined'
    ? window.location.href
    : 'https://paynote.space/receipt/' + req.id

  function handleCopyTx() {
    navigator.clipboard.writeText(req.tx_hash)
    setCopiedTx(true)
    setTimeout(() => setCopiedTx(false), 2000)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(receiptUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleDownload() {
    const printUrl = `/api/receipt/${req.id}`
    const win = window.open(printUrl, '_blank')
    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => {
          win.print()
        }, 500)
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: '#F4F5F7'}}>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="pgr" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4A154B"/>
                    <stop offset="100%" stopColor="#1A44C4"/>
                  </linearGradient>
                </defs>
                <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgr)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="font-bold text-lg tracking-tight text-gray-900">PayNote</span>
            </div>
            <span className="text-sm bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              Verified Receipt
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="px-6 py-5" style={{background: 'linear-gradient(135deg, #0B194F 0%, #102A83 60%, #1A44C4 100%)'}}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-green-300 text-sm font-semibold uppercase tracking-widest">Payment Confirmed</span>
              </div>
              <p className="text-white font-bold text-4xl">{Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)} <span className="text-xl text-blue-300 font-medium">{token}</span></p>
              <p className="text-blue-200 text-base mt-1">{req.reason}</p>
              <p className="text-blue-300 text-sm mt-1">{date}</p>
            </div>

            <div className="p-6">
              <div className="flex gap-2 flex-wrap mb-5">
                {['Non-Custodial', 'Wallet-Native', 'Verified On-Chain'].map(badge => (
                  <span key={badge} className="text-sm bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium">{badge}</span>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 mb-5">
                {[
                  ['Receipt ID', req.id.slice(0, 8) + '…' + req.id.slice(-4)],
                  ['Amount', Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2) + ' ' + token],
                  ['Network', 'Arc Testnet'],
                  ['Recipient', req.to_address],
                  ['Sender', senderFull],
                  ...(req.note ? [['Note', req.note]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-sm font-semibold uppercase tracking-widest shrink-0 mt-0.5 w-20 text-gray-400">{label}</span>
                    <span className="text-sm font-mono break-all text-gray-700 leading-relaxed">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Transaction Hash</p>
                  <button onClick={handleCopyTx} className="text-sm font-medium" style={{color: '#1A44C4'}}>
                    {copiedTx ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-mono break-all text-gray-600 leading-relaxed">{req.tx_hash}</p>
              </div>

              <div className="flex flex-col gap-2">
                <a href={'https://testnet.arcscan.app/tx/' + req.tx_hash} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl text-base font-bold text-white text-center transition-all"
                  style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
                  {"View on ArcScan →"}
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleCopyLink}
                    className="py-3 rounded-xl text-base font-medium border border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors bg-white">
                    {copiedLink ? '✓ Copied!' : 'Copy receipt link'}
                  </button>
                  <button onClick={handleDownload}
                    className="py-3 rounded-xl text-base font-medium border border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors bg-white flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            Immutable proof-of-settlement · Powered by Arc
          </p>
        </div>
      </main>

      <footer className="py-4 border-t border-gray-200 bg-white">
        <p className="text-center text-sm text-gray-300">
          PayNote · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-medium" style={{color: '#1A44C4'}}>Arc</a>
        </p>
      </footer>
    </div>
  )
}
