'use client'

import { useState, useEffect } from 'react'
import PayButton from './PayButton'
import ExpiryCountdown from '@/app/components/ExpiryCountdown'
import dynamic from 'next/dynamic'

const BalanceChecker = dynamic(() => import('@/app/components/BalanceChecker'), { ssr: false })

const ASSETS: Record<string, { address: string; symbol: string; decimals: number }> = {
  USDC:   { address: '0x3600000000000000000000000000000000000000', symbol: 'USDC', decimals: 6 },
  EURC:   { address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', symbol: 'EURC', decimals: 6 },
  cirBTC: { address: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF', symbol: 'cirBTC', decimals: 8 },
  USYC:   { address: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C', symbol: 'USYC', decimals: 6 },
  QCAD:   { address: '', symbol: 'QCAD', decimals: 6 },
}

interface Props {
  req: {
    amount: string
    reason: string
    note: string
    to_address: string
    status: string
    id: string
    token: string
    expires_at: string | null
    display_name: string | null
    signed_by?: string | null
    signature?: string | null
  }
  slug: string
  appUrl: string
}

function CopyLinkBar({ url, dark, border, card, muted }: { url: string; dark: boolean; border: string; card: string; muted: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all" style={{background: card, borderColor: border}}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
      </svg>
      <p className="text-sm font-mono truncate flex-1" style={{color: muted}}>{url}</p>
      <button onClick={handleCopy}
        className="shrink-0 text-sm font-bold px-4 py-1.5 rounded-lg transition-all text-white"
        style={{background: copied ? '#16a34a' : 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function DarkModeWrapper({ req, slug, appUrl }: Props) {
  const [dark, setDark] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    if (saved === 'dark') setDark(true)

    // Get connected wallet for balance check
    const ethereum = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (ethereum) {
      ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        const accs = accounts as string[]
        if (accs.length > 0) setConnectedAddress(accs[0])
      }).catch(() => {})
    }
  }, [])

  function toggleDark() {
    setDark(d => {
      localStorage.setItem('paynote-theme', !d ? 'dark' : 'light')
      return !d
    })
  }

  const token = req.token || 'USDC'
  const asset = ASSETS[token] || ASSETS.USDC
  const isCompleted = req.status === 'completed'
  const isExpired = req.status === 'expired'

  const bg = dark ? '#080c14' : '#f0f2f7'
  const card = dark ? '#111827' : '#ffffff'
  const border = dark ? '#1e2a3a' : '#e5e7eb'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#475569' : '#94a3b8'
  const inputBg = dark ? '#0d1321' : '#f8fafc'
  const subtle = dark ? '#1a2535' : '#f1f5f9'

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300" style={{background: bg}}>

      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: dark
          ? 'radial-gradient(ellipse at 20% 50%, rgba(26,68,196,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(74,21,75,0.06) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 20% 50%, rgba(26,68,196,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(74,21,75,0.03) 0%, transparent 50%)',
        zIndex: 0,
      }}/>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="pg2" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4A154B"/>
                    <stop offset="100%" stopColor="#1A44C4"/>
                  </linearGradient>
                </defs>
                <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pg2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="font-bold text-lg tracking-tight transition-opacity group-hover:opacity-70" style={{color: text}}>PayNote</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1.5" style={{color: muted, borderColor: border, background: subtle}}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                Arc Testnet
              </span>
              {req.expires_at && <ExpiryCountdown expiresAt={req.expires_at} />}
              <button onClick={toggleDark}
                className="p-2 rounded-xl border transition-all hover:scale-105"
                style={{borderColor: border, background: subtle}}>
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
          </div>

          {/* Main card */}
          <div className="rounded-3xl border overflow-hidden shadow-2xl mb-4" style={{
            background: card,
            borderColor: border,
            boxShadow: dark
              ? '0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(26,68,196,0.1)'
              : '0 25px 50px rgba(15,23,42,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          }}>

            {/* Banner */}
            <div className="px-6 py-6 relative overflow-hidden" style={{
              background: isCompleted
                ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
                : isExpired
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #0B194F 0%, #102A83 50%, #1A44C4 100%)',
            }}>
              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{background: 'white'}}/>
              <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-5" style={{background: 'white'}}/>

              {req.display_name && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-70 text-white">{req.display_name}</p>
              )}

              {isCompleted && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span className="text-green-300 text-xs font-bold uppercase tracking-widest">Payment Completed</span>
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60 text-white">Payment Request</p>
              <p className="text-white font-black text-5xl leading-none mb-2">
                {Number(req.amount) < 0.01 ? Number(req.amount).toFixed(8).replace(/\.?0+$/, '') : (Number(req.amount) < 0.01 && token !== 'cirBTC') ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)}
                <span className="text-xl font-semibold ml-2 opacity-70">{token}</span>
              </p>
              <p className="text-base font-medium opacity-80 text-white mt-2">{req.reason}</p>
            </div>

            <div className="p-6">
              {req.note && (
                <div className="rounded-2xl border px-4 py-3 text-sm mb-5 italic" style={{background: inputBg, borderColor: border, color: muted}}>
                  "{req.note}"
                </div>
              )}

              {/* Recipient */}
              <div className="rounded-2xl px-4 py-3.5 mb-5 border" style={{background: inputBg, borderColor: border}}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{color: muted}}>Recipient</p>
                <p className="text-sm font-mono break-all leading-relaxed font-medium" style={{color: text}}>{req.to_address}</p>
              </div>

              {/* Balance checker */}
              {!isCompleted && !isExpired && connectedAddress && (
                <div className="mb-5">
                  <BalanceChecker
                    walletAddress={connectedAddress}
                    tokenSymbol={token}
                    requiredAmount={Number(req.amount)}
                    dark={dark}
                  />
                </div>
              )}

              {isExpired ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{background: subtle}}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p className="font-bold text-base mb-1" style={{color: text}}>Request expired</p>
                  <p className="text-sm" style={{color: muted}}>This payment link is no longer valid.</p>
                </div>
              ) : isCompleted ? (
                <div className="text-center py-4">
                  <p className="font-bold text-base mb-1" style={{color: text}}>Payment completed</p>
                  <p className="text-sm mb-4" style={{color: muted}}>This request is no longer accepting payments.</p>
                  <a href={'/receipt/' + req.id}
                    className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90"
                    style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
                    View Receipt →
                  </a>
                </div>
              ) : (
                <PayButton
                  amount={Number(req.amount) < 0.01 ? Number(req.amount).toFixed(8).replace(/\.?0+$/, '') : (Number(req.amount) < 0.01 && token !== 'cirBTC') ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)}
                  toAddress={req.to_address}
                  token={token}
                  tokenAddress={asset.address}
                  tokenDecimals={asset.decimals}
                  dark={dark}
                  slug={slug}
                />
              )}
            </div>
          </div>

          {/* Trust badges */}
          {req.signed_by && (
            <div className="flex items-center justify-center gap-2 mb-3 px-4 py-2.5 rounded-2xl" style={{background: dark ? '#0a2a0a' : '#f0fdf4', border: '1px solid', borderColor: dark ? '#166534' : '#86efac'}}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{color: '#16a34a'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span className="text-sm font-black" style={{color: '#16a34a'}}>Verified request</span>
              <span className="text-xs font-mono" style={{color: dark ? '#4ade80' : '#166534'}}>{req.signed_by.slice(0,10)}...{req.signed_by.slice(-6)}</span>
            </div>
          )}
          {!isCompleted && !isExpired && (
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              {['Non-Custodial', 'Verified On-Chain', 'Arc Network'].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all" style={{borderColor: border, color: muted, background: card}}>
                  <span className="w-1 h-1 rounded-full bg-green-400 inline-block"></span>
                  {b}
                </span>
              ))}
            </div>
          )}

          <CopyLinkBar url={appUrl + '/r/' + slug} dark={dark} border={border} card={card} muted={muted} />
        </div>
      </main>

      <footer className="py-4 border-t relative z-10" style={{borderColor: border, background: card}}>
        <p className="text-center text-xs font-medium" style={{color: muted}}>
          PayNote · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-70 transition-opacity" style={{color: '#1A44C4'}}>Arc</a>
        </p>
      </footer>
    </div>
  )
}
