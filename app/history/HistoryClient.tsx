'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Request {
  id: string
  slug: string
  amount: string
  reason: string
  status: string
  created_at: string
  completed_at: string
  tx_hash: string
  to_address: string
  expires_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'bg-yellow-50',  text: 'text-yellow-600', label: 'Pending' },
  completed: { bg: 'bg-green-50',   text: 'text-green-600',  label: 'Completed' },
  failed:    { bg: 'bg-red-50',     text: 'text-red-600',    label: 'Failed' },
  expired:   { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Expired' },
  initiated: { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'Initiated' },
}

export default function HistoryClient({ requests }: { requests: Request[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = requests.filter(r => {
    const matchesSearch =
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.to_address.toLowerCase().includes(search.toLowerCase()) ||
      (r.tx_hash || '').toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen flex flex-col" style={{background: '#F4F5F7'}}>
      <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">

        <div className="flex items-center gap-3 mb-8">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="pgh" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A154B"/>
                <stop offset="100%" stopColor="#1A44C4"/>
              </linearGradient>
            </defs>
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgh)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900">Payment History</span>
            <p className="text-xs text-gray-400">{requests.length} total requests</p>
          </div>
          <button onClick={() => router.push('/')} className="ml-auto text-sm font-bold text-white px-4 py-2 rounded-xl" style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
            + New request
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <input type="text" placeholder="Search by reason, address, tx hash…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No requests found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(r => {
              const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending
              const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-blue-200 transition-colors"
                  onClick={() => router.push('/r/' + r.slug)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{r.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{date} · paynote.space/r/{r.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                      <span className="text-sm font-bold text-gray-900">{Number(r.amount).toFixed(2)} <span className="text-gray-400 font-normal text-xs">USDC</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400 truncate max-w-[180px]">{r.to_address}</span>
                    {r.tx_hash && (
                      <span className="text-xs font-mono text-blue-400 truncate max-w-[140px]">{r.tx_hash.slice(0, 10)}…</span>
                    )}
                    {r.status === 'completed' && (
                      <button onClick={e => { e.stopPropagation(); router.push('/receipt/' + r.id) }}
                        className="text-xs font-medium ml-auto" style={{color: '#1A44C4'}}>
                        View receipt →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="py-4 border-t border-gray-200 bg-white">
        <p className="text-center text-xs text-gray-300">
          PayNote · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-medium" style={{color: '#1A44C4'}}>Arc</a>
        </p>
      </footer>
    </div>
  )
}
