'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/app/components/ThemeToggle'

interface Request {
  id: string; slug: string; amount: string; reason: string
  status: string; created_at: string; completed_at: string
  tx_hash: string; to_address: string; token: string
}

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  completed: { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  failed:    { color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
  expired:   { color: '#64748b', bg: '#f1f5f9', label: 'Expired' },
}

export default function MyHistoryClient({ requests, address }: { requests: Request[]; address: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    setDark(saved === 'dark')
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const filtered = requests.filter(r => {
    const matchSearch = r.reason.toLowerCase().includes(search.toLowerCase()) || r.slug.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  const completed = requests.filter(r => r.status === 'completed')
  const volumeByToken: Record<string, number> = {}
  completed.forEach(r => {
    const t = r.token || 'USDC'
    volumeByToken[t] = (volumeByToken[t] || 0) + Number(r.amount)
  })

  return (
    <div className="min-h-screen transition-colors" style={{background: 'var(--bg)', color: 'var(--text)'}}>
      <nav className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between border-b backdrop-blur-xl" style={{borderColor: 'var(--border)', background: 'var(--nav-bg)'}}>
        <a href="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <defs><linearGradient id="pgm" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4A154B"/><stop offset="100%" stopColor="#1A44C4"/></linearGradient></defs>
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgm)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="font-black text-lg" style={{color: 'var(--text)'}}>PayNote</span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle/>
          <button onClick={() => router.push('/')} className="text-sm font-black text-white px-4 py-2 rounded-xl" style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>+ New</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{color: 'var(--muted)'}}>Payment History</p>
          <p className="text-2xl font-black mb-1" style={{color: 'var(--text)'}}>{address.slice(0, 10)}...{address.slice(-6)}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-2xl border p-4 text-center" style={{borderColor: 'var(--border)', background: 'var(--card)'}}>
            <p className="text-2xl font-black" style={{color: 'var(--text)'}}>{requests.length}</p>
            <p className="text-xs font-semibold" style={{color: 'var(--muted)'}}>Total</p>
          </div>
          <div className="rounded-2xl border p-4 text-center" style={{borderColor: 'var(--border)', background: 'var(--card)'}}>
            <p className="text-2xl font-black" style={{color: '#16a34a'}}>{completed.length}</p>
            <p className="text-xs font-semibold" style={{color: 'var(--muted)'}}>Completed</p>
          </div>
          {Object.entries(volumeByToken).map(([tok, vol]) => (
            <div key={tok} className="rounded-2xl border p-4 text-center" style={{borderColor: 'var(--border)', background: 'var(--card)'}}>
              <p className="text-xl font-black" style={{color: '#1A44C4'}}>{vol.toFixed(tok === 'cirBTC' ? 8 : 2)}</p>
              <p className="text-xs font-semibold" style={{color: 'var(--muted)'}}>{tok}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl px-4 py-3 text-base border outline-none font-medium focus:border-blue-500"
            style={{background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text)'}}/>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="rounded-xl px-3 py-3 text-sm border outline-none font-semibold"
            style={{background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--muted)'}}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-16 font-semibold" style={{color: 'var(--muted)'}}>No requests found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(r => {
              const s = STATUS[r.status] || STATUS.pending
              const displayDate = r.status === 'completed' && r.completed_at
                ? new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <div key={r.id} className="card-hover rounded-2xl border p-5 cursor-pointer" style={{borderColor: 'var(--border)', background: 'var(--card)'}} onClick={() => router.push('/r/' + r.slug)}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-black text-base truncate" style={{color: 'var(--text)'}}>{r.reason}</p>
                    <span className="font-black text-base shrink-0" style={{color: 'var(--text)'}}>{Number(r.amount) < 0.01 && r.token !== 'cirBTC' ? Number(r.amount).toPrecision(6) : Number(r.amount).toFixed(r.token === 'cirBTC' ? 8 : 2)} <span className="text-sm font-semibold" style={{color: 'var(--muted)'}}>{r.token || 'USDC'}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background: s.bg, color: s.color}}>{s.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold" style={{color: 'var(--muted)'}}>{displayDate}</span>
                      {r.status === 'completed' && (
                        <button onClick={e => { e.stopPropagation(); router.push('/receipt/' + r.id) }}
                          className="text-xs font-black hover:opacity-70" style={{color: '#1A44C4'}}>
                          Receipt →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
