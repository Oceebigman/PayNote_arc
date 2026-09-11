export const dynamic = 'force-dynamic'
export const revalidate = 0

import pool from '@/lib/db'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

async function checkArcRpc(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now()
  try {
    const res = await fetch('https://rpc.testnet.arc.network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: AbortSignal.timeout(5000),
    })
    const data = (await res.json()) as any
    return { ok: !!data.result, latency: Date.now() - start }
  } catch {
    return { ok: false, latency: Date.now() - start }
  }
}

async function checkDb(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now()
  try {
    await pool.query('SELECT 1')
    return { ok: true, latency: Date.now() - start }
  } catch {
    return { ok: false, latency: Date.now() - start }
  }
}

export default async function StatusPage() {
  const [rpc, db] = await Promise.all([checkArcRpc(), checkDb()])
  const allOk = rpc.ok && db.ok

  const services = [
    { name: 'PayNote API', ok: true, latency: null, desc: 'Payment request creation and management' },
    { name: 'Arc Testnet RPC', ok: rpc.ok, latency: rpc.latency, desc: 'On-chain verification and settlement' },
    { name: 'Database', ok: db.ok, latency: db.latency, desc: 'Payment request storage' },
    { name: 'Webhook Delivery', ok: true, latency: null, desc: 'Real-time payment event notifications' },
  ]

  return (
    <div className="min-h-screen transition-colors" style={{background: 'var(--bg)', color: 'var(--text)', fontFamily: '"Inter", system-ui, sans-serif'}}>
      <SiteHeader badge="Status" />

      <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 text-sm font-black px-5 py-3 rounded-2xl mb-4 ${allOk ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${allOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}/>
            {allOk ? 'All systems operational' : 'Partial outage'}
          </div>
          <p className="text-sm font-semibold" style={{color: 'var(--muted)'}}>Last checked: {new Date().toUTCString()}</p>
        </div>

        <div className="flex flex-col gap-3">
          {services.map(s => (
            <div key={s.name} className="rounded-2xl border p-5 flex items-center justify-between" style={{background: 'var(--card)', borderColor: 'var(--border)'}}>
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.ok ? 'bg-green-500' : 'bg-red-500'}`}/>
                <div>
                  <p className="font-black text-base" style={{color: 'var(--text)'}}>{s.name}</p>
                  <p className="text-sm font-medium" style={{color: 'var(--muted)'}}>{s.desc}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${s.ok ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {s.ok ? 'Operational' : 'Down'}
                </span>
                {s.latency !== null && (
                  <p className="text-xs font-semibold mt-1" style={{color: 'var(--muted)'}}>{s.latency}ms</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border p-5" style={{background: 'var(--card)', borderColor: 'var(--border)'}}>
          <p className="font-black text-base mb-1" style={{color: 'var(--text)'}}>Arc Testnet RPC</p>
          <p className="text-sm font-medium mb-3" style={{color: 'var(--muted)'}}>
            Arc Testnet RPC occasionally experiences timeouts under high load. If a payment verification times out, it will automatically retry up to 5 times. If the issue persists, check{' '}
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="font-black" style={{color: '#1A44C4'}}>ArcScan</a> directly.
          </p>
          <p className="text-sm font-semibold" style={{color: 'var(--muted)'}}>
            RPC endpoint: <code className="font-mono text-xs" style={{color: '#1A44C4'}}>https://rpc.testnet.arc.network</code>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
