'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Stats { total: string; completed: string; pending: string; expired: string; failed: string; volume_usdc: string; volume_eurc: string; volume_cirbtc: string }
interface Request { id: string; slug: string; amount: string; reason: string; status: string; created_at: string; completed_at: string; display_date: string; tx_hash: string; to_address: string; token: string }
interface Webhook { id: string; url: string; events: string[]; active: boolean; created_at: string }
interface Delivery { id: string; webhook_url: string; event: string; success: boolean; response_status: number; delivered_at: string }
interface ApiKey { id: string; name: string; key_prefix: string; active: boolean; created_at: string; last_used_at: string }
interface Props { stats: Stats; requests: Request[]; webhooks: Webhook[]; deliveries: Delivery[]; apiKeys: ApiKey[]; secret: string }

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  completed: { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  failed:    { color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
  expired:   { color: '#64748b', bg: '#f1f5f9', label: 'Expired' },
}
const TABS = ['Overview', 'Requests', 'Webhooks', 'API Keys']

// Light mode colors for admin
const S = {
  bg: '#f4f6fb',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  inputBg: '#f8fafc',
  subtle: '#f1f5f9',
  btn: 'linear-gradient(135deg, #102A83, #1A44C4)',
}

export default function AdminClient({ stats, requests, webhooks, deliveries, apiKeys, secret }: Props) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Overview')
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookSecret, setNewWebhookSecret] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!authed) return
    const interval = setInterval(async () => {
      try {
        await fetch('/api/admin/refresh', { method: 'POST', headers: { 'x-admin-secret': secret } })
      } catch { }
      router.refresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [authed, router])

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (input === secret) setAuthed(true)
    else setError('Invalid password')
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret }, body: JSON.stringify({ name: newKeyName }) })
    const data = await res.json()
    setNewKey(data.key); setNewKeyName(''); setSaving(false)
  }

  async function handleDeleteKey(id: string) {
    await fetch('/api/keys', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: newWebhookUrl, secret: newWebhookSecret, events: ['payment.completed', 'payment.created'] }) })
    setNewWebhookUrl(''); setNewWebhookSecret(''); setSaving(false); router.refresh()
  }

  async function handleDeleteWebhook(id: string) {
    await fetch('/api/webhooks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  function formatDate(r: Request) {
    const date = r.status === 'completed' && r.completed_at ? r.completed_at : r.created_at
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: S.bg, fontFamily: '"Inter", system-ui, sans-serif'}}>
      <div className="w-full max-w-sm rounded-3xl border overflow-hidden shadow-xl" style={{background: S.card, borderColor: S.border}}>
        <div className="px-6 py-6 relative overflow-hidden" style={{background: S.btn}}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10" style={{background: 'white'}}/>
          <p className="text-white font-black text-xl relative z-10">Admin Access</p>
          <p className="text-blue-200 text-sm font-medium relative z-10">PayNote dashboard</p>
        </div>
        <form onSubmit={handleAuth} className="p-6 flex flex-col gap-4">
          <input type="password" placeholder="Admin password" value={input} onChange={e => setInput(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-base border outline-none font-medium focus:border-blue-500"
            style={{background: S.inputBg, borderColor: S.border, color: S.text}}/>
          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          <button type="submit" className="w-full py-3.5 rounded-2xl text-white font-black text-base" style={{background: S.btn}}>Enter</button>
        </form>
      </div>
    </div>
  )

  const statCards = [
    { label: 'Total Requests', value: stats.total, color: '#1A44C4', sub: '' },
    { label: 'Completed', value: stats.completed, color: '#16a34a', sub: '' },
    { label: 'Pending', value: stats.pending, color: '#d97706', sub: '' },
    { label: 'Expired', value: stats.expired, color: '#64748b', sub: '' },
    { label: 'Failed', value: stats.failed, color: '#dc2626', sub: '' },
    { label: 'USDC Volume', value: Number(stats.volume_usdc).toFixed(2), color: '#102A83', sub: 'USDC' },
    { label: 'EURC Volume', value: Number(stats.volume_eurc).toFixed(2), color: '#059669', sub: 'EURC' },
    { label: 'cirBTC Volume', value: Number(stats.volume_cirbtc).toFixed(8), color: '#d97706', sub: 'cirBTC' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{background: S.bg, fontFamily: '"Inter", system-ui, sans-serif', color: S.text}}>
      <main className="flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full">

        <div className="flex items-center gap-4 mb-8">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <defs><linearGradient id="pga" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4A154B"/><stop offset="100%" stopColor="#1A44C4"/></linearGradient></defs>
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pga)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div>
            <span className="font-black text-xl" style={{color: S.text}}>Admin Dashboard</span>
            <p className="text-sm font-semibold" style={{color: S.muted}}>PayNote · Private · Auto-refreshes every 30s</p>
          </div>
          <button onClick={async () => { try { await fetch('/api/admin/refresh', { method: 'POST', headers: { 'x-admin-secret': secret } }) } catch {} router.refresh() }} className="ml-auto text-sm font-bold px-4 py-2 rounded-xl border hover:opacity-70 transition-opacity" style={{borderColor: S.border, color: S.muted}}>↻ Refresh</button>
          <button onClick={() => router.push('/')} className="text-sm font-bold hover:opacity-70" style={{color: S.muted}}>← Back</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 rounded-2xl p-1 w-fit border" style={{background: S.card, borderColor: S.border}}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-black transition-all"
              style={{background: tab === t ? S.btn : 'transparent', color: tab === t ? '#fff' : S.muted}}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {statCards.map(s => (
                <div key={s.label} className="rounded-2xl border p-5 hover-lift" style={{background: S.card, borderColor: S.border}}>
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color: S.muted}}>{s.label}</p>
                  <p className="text-2xl font-black" style={{color: s.color}}>{s.value}</p>
                  {s.sub && <p className="text-xs font-bold mt-0.5" style={{color: S.muted}}>{s.sub}</p>}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{borderColor: S.border}}>
                <p className="font-black text-base" style={{color: S.text}}>Recent Activity</p>
                <p className="text-xs font-semibold" style={{color: S.muted}}>{requests.length} total</p>
              </div>
              {requests.slice(0, 15).map(r => {
                const s = STATUS[r.status] || STATUS.pending
                return (
                  <div key={r.id} className="px-6 py-4 flex items-start gap-4 border-b cursor-pointer transition-colors hover:opacity-80" style={{borderColor: S.border}} onClick={() => router.push('/r/' + r.slug)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate" style={{color: S.text}}>{r.reason}</p>
                      <p className="text-sm font-mono truncate mt-0.5" style={{color: S.muted}}>{r.to_address.slice(0, 16)}...</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-base" style={{color: S.text}}>{Number(r.amount) < 0.01 && r.token !== 'cirBTC' ? Number(r.amount).toPrecision(6) : Number(r.amount).toFixed(r.token === 'cirBTC' ? 8 : 2)} <span className="text-sm font-semibold" style={{color: S.muted}}>{r.token || 'USDC'}</span></p>
                      <p className="text-xs font-semibold mt-1" style={{color: S.muted}}>
                        {r.status === 'completed' && r.completed_at ? 'Paid ' : 'Created '}{formatDate(r)}
                      </p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full mt-1 inline-block" style={{background: s.bg, color: s.color}}>{s.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Requests */}
        {tab === 'Requests' && (
          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{borderColor: S.border}}>
              <p className="font-black text-base" style={{color: S.text}}>All Requests</p>
              <p className="text-xs font-semibold" style={{color: S.muted}}>{requests.length} total</p>
            </div>
            {requests.map(r => {
              const s = STATUS[r.status] || STATUS.pending
              return (
                <div key={r.id} className="px-6 py-4 flex items-start gap-4 border-b cursor-pointer hover:opacity-80 transition-opacity" style={{borderColor: S.border}} onClick={() => router.push('/r/' + r.slug)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate" style={{color: S.text}}>{r.reason}</p>
                    <p className="text-sm font-mono truncate mt-0.5" style={{color: S.muted}}>{r.to_address}</p>
                    {r.tx_hash && <p className="text-xs font-mono truncate mt-0.5" style={{color: '#1A44C4'}}>{r.tx_hash.slice(0, 24)}…</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-base" style={{color: S.text}}>{Number(r.amount) < 0.01 && r.token !== 'cirBTC' ? Number(r.amount).toPrecision(6) : Number(r.amount).toFixed(r.token === 'cirBTC' ? 8 : 2)} <span className="text-sm font-semibold" style={{color: S.muted}}>{r.token || 'USDC'}</span></p>
                    <p className="text-xs font-semibold mt-1" style={{color: S.muted}}>
                      {r.status === 'completed' && r.completed_at ? `Paid ${new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : `Created ${new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full mt-1 inline-block" style={{background: s.bg, color: s.color}}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Webhooks */}
        {tab === 'Webhooks' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-6 shadow-sm" style={{background: S.card, borderColor: S.border}}>
              <p className="font-black text-base mb-4" style={{color: S.text}}>Register Webhook</p>
              <form onSubmit={handleCreateWebhook} className="flex flex-col gap-3">
                <input type="url" placeholder="https://yourserver.com/webhooks/paynote" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} required
                  className="w-full rounded-2xl px-4 py-3.5 text-base border outline-none font-medium focus:border-blue-500"
                  style={{background: S.inputBg, borderColor: S.border, color: S.text}}/>
                <input type="text" placeholder="Signing secret" value={newWebhookSecret} onChange={e => setNewWebhookSecret(e.target.value)} required
                  className="w-full rounded-2xl px-4 py-3.5 text-base border outline-none font-medium focus:border-blue-500"
                  style={{background: S.inputBg, borderColor: S.border, color: S.text}}/>
                <button type="submit" disabled={saving} className="w-full py-3.5 rounded-2xl text-white font-black text-base disabled:opacity-50" style={{background: S.btn}}>
                  {saving ? 'Saving…' : 'Register'}
                </button>
              </form>
            </div>
            {webhooks.length > 0 && (
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
                <div className="px-6 py-4 border-b" style={{borderColor: S.border}}><p className="font-black text-base" style={{color: S.text}}>Active Webhooks</p></div>
                {webhooks.map(w => (
                  <div key={w.id} className="px-6 py-4 flex items-center gap-4 border-b" style={{borderColor: S.border}}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium truncate" style={{color: S.text}}>{w.url}</p>
                      <p className="text-xs font-semibold mt-1" style={{color: S.muted}}>{w.events.join(', ')}</p>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background: w.active ? '#dcfce7' : '#f1f5f9', color: w.active ? '#16a34a' : '#64748b'}}>{w.active ? 'Active' : 'Inactive'}</span>
                    <button onClick={() => handleDeleteWebhook(w.id)} className="text-sm font-black text-red-500 hover:text-red-700 transition-colors">Remove</button>
                  </div>
                ))}
              </div>
            )}
            {deliveries.length > 0 && (
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
                <div className="px-6 py-4 border-b" style={{borderColor: S.border}}><p className="font-black text-base" style={{color: S.text}}>Recent Deliveries</p></div>
                {deliveries.map(d => (
                  <div key={d.id} className="px-6 py-3 flex items-center gap-4 border-b" style={{borderColor: S.border}}>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0" style={{background: d.success ? '#dcfce7' : '#fee2e2', color: d.success ? '#16a34a' : '#dc2626'}}>
                      {d.success ? '✓' : '✗'} {d.response_status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{color: S.text}}>{d.event}</p>
                      <p className="text-xs font-mono truncate" style={{color: S.muted}}>{d.webhook_url}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0" style={{color: S.muted}}>{new Date(d.delivered_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Keys */}
        {tab === 'API Keys' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-6 shadow-sm" style={{background: S.card, borderColor: S.border}}>
              <p className="font-black text-base mb-1" style={{color: S.text}}>Generate API Key</p>
              <p className="text-sm font-semibold mb-4" style={{color: S.muted}}>Keys are shown once. Store them securely.</p>
              <form onSubmit={handleCreateKey} className="flex gap-2">
                <input type="text" placeholder="Key name (e.g. production)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} required
                  className="flex-1 rounded-2xl px-4 py-3.5 text-base border outline-none font-medium focus:border-blue-500"
                  style={{background: S.inputBg, borderColor: S.border, color: S.text}}/>
                <button type="submit" disabled={saving} className="px-5 py-3.5 rounded-2xl text-white font-black text-base disabled:opacity-50 shrink-0" style={{background: S.btn}}>
                  {saving ? '…' : 'Generate'}
                </button>
              </form>
              {newKey && (
                <div className="mt-4 rounded-2xl p-4 border border-green-200 bg-green-50">
                  <p className="text-sm font-black mb-1 text-green-700">✓ Generated — copy it now, won't show again</p>
                  <p className="text-sm font-mono break-all select-all text-green-800">{newKey}</p>
                </div>
              )}
            </div>
            {apiKeys.length > 0 && (
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
                <div className="px-6 py-4 border-b" style={{borderColor: S.border}}><p className="font-black text-base" style={{color: S.text}}>API Keys</p></div>
                {apiKeys.map(k => (
                  <div key={k.id} className="px-6 py-4 flex items-center gap-4 border-b" style={{borderColor: S.border}}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base" style={{color: S.text}}>{k.name}</p>
                      <p className="text-sm font-mono" style={{color: S.muted}}>{k.key_prefix}</p>
                      {k.last_used_at && <p className="text-xs font-semibold mt-0.5" style={{color: S.muted}}>Last used: {new Date(k.last_used_at).toLocaleDateString()}</p>}
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background: k.active ? '#dcfce7' : '#f1f5f9', color: k.active ? '#16a34a' : '#64748b'}}>{k.active ? 'Active' : 'Revoked'}</span>
                    <button onClick={() => handleDeleteKey(k.id)} className="text-sm font-black text-red-500 hover:text-red-700 transition-colors">Revoke</button>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{background: S.card, borderColor: S.border}}>
              <div className="px-6 py-4 border-b" style={{borderColor: S.border}}><p className="font-black text-base" style={{color: S.text}}>Usage</p></div>
              <div className="p-6 bg-slate-900 rounded-b-2xl">
                <pre className="text-sm font-mono leading-relaxed overflow-x-auto" style={{color: '#94a3b8'}}>{`# Create a payment request
curl -X POST https://paynote.space/api/request \\
  -H "Authorization: Bearer pn_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":50,"reason":"Invoice","to_address":"0x..."}'

# Agent endpoint (ERC-8183 + x402)
curl -X POST https://paynote.space/api/agent/pay \\
  -H "Authorization: Bearer pn_your_key" \\
  -d '{"amount":50,"reason":"Task","to_address":"0x..."}'

# Poll status (no auth needed)
curl https://paynote.space/api/poll?slug=YOUR_SLUG`}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 border-t" style={{borderColor: S.border, background: S.card}}>
        <p className="text-center text-sm font-semibold" style={{color: S.muted}}>PayNote Admin · Private · Auto-refreshes every 30s</p>
      </footer>
    </div>
  )
}
