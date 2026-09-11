'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

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
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg)'}}>
      <SiteHeader badge="History" />
      <main className="flex-1 px-4 lg:px-8 py-12 max-w-2xl lg:max-w-3xl mx-auto w-full">

        <div className="flex items-center gap-3 mb-8">
          <div>
            <span className="font-semibold text-lg tracking-tight" style={{color:'var(--text)'}}>Payment History</span>
            <p className="text-xs" style={{color:'var(--muted)'}}>{requests.length} total requests</p>
          </div>
          <button onClick={() => router.push('/')} className="ml-auto text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{background: '#1A44C4'}}>
            + New request
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <input type="text" placeholder="Search by reason, address, tx hash…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            style={{background:'var(--input-bg)', borderColor:'var(--border)', color:'var(--text)'}}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-blue-400"
            style={{background:'var(--input-bg)', borderColor:'var(--border)', color:'var(--text)'}}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{color:'var(--muted)'}}>No requests found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(r => {
              const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending
              const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <div key={r.id} className="rounded-xl border p-5 cursor-pointer hover:border-blue-300 transition-colors"
                  style={{background:'var(--card)', borderColor:'var(--border)'}}
                  onClick={() => router.push('/r/' + r.slug)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{r.reason}</p>
                      <p className="text-xs mt-0.5" style={{color:'var(--muted)'}}>{date} · paynote.space/r/{r.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                      <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{Number(r.amount).toFixed(2)} <span className="font-normal text-xs" style={{color:'var(--muted)'}}>USDC</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs truncate max-w-[180px]" style={{color:'var(--muted)', fontFamily:'var(--font-mono)'}}>{r.to_address}</span>
                    {r.tx_hash && (
                      <span className="text-xs truncate max-w-[140px]" style={{color:'#1A44C4', fontFamily:'var(--font-mono)'}}>{r.tx_hash.slice(0, 10)}…</span>
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

      <SiteFooter />
    </div>
  )
}
