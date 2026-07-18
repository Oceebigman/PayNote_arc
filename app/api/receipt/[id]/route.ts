import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

function escapeHtml(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await pool.query(
    `SELECT * FROM payment_requests WHERE id::text = $1 OR slug = $1`,
    [id]
  )
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const r = result.rows[0]
  if (r.status !== 'completed') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
  }

  const token = r.token || 'USDC'
  const date = new Date(r.completed_at).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  })
  const sender = r.sender_address || 'Direct wallet transfer'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>PayNote Receipt</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 600px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #4A154B, #1A44C4); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .logo-text { font-size: 20px; font-weight: 700; color: #111; }
  .badge { background: #ecfdf5; color: #16a34a; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; border: 1px solid #bbf7d0; }
  .banner { background: linear-gradient(135deg, #0B194F, #1A44C4); border-radius: 16px; padding: 32px; margin-bottom: 32px; color: white; }
  .banner-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #93c5fd; margin-bottom: 12px; }
  .banner-amount { font-size: 48px; font-weight: 700; margin-bottom: 4px; }
  .banner-token { font-size: 22px; font-weight: 400; color: #93c5fd; margin-left: 8px; }
  .banner-reason { font-size: 16px; color: #bfdbfe; margin-top: 8px; }
  .banner-date { font-size: 13px; color: #60a5fa; margin-top: 4px; }
  .trust-badges { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
  .trust-badge { background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid #bfdbfe; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
  .detail-row { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .detail-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; width: 100px; flex-shrink: 0; padding-top: 1px; }
  .detail-value { font-size: 13px; font-family: 'Courier New', monospace; color: #1e293b; word-break: break-all; line-height: 1.5; }
  .tx-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
  .tx-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
  .tx-hash { font-size: 12px; font-family: 'Courier New', monospace; color: #1d4ed8; word-break: break-all; line-height: 1.6; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center; }
  .footer-text { font-size: 12px; color: #94a3b8; line-height: 1.8; }
  .footer-url { color: #1d4ed8; text-decoration: none; }
  @media print {
    body { padding: 24px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
          <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="logo-text">PayNote</span>
    </div>
    <span class="badge">Verified Receipt</span>
  </div>

  <div class="banner">
    <div class="banner-label">Payment Confirmed</div>
    <div>
      <span class="banner-amount">${Number(r.amount).toFixed(token === 'cirBTC' ? 8 : 2)}</span>
      <span class="banner-token">${token}</span>
    </div>
    <div class="banner-reason">${escapeHtml(r.reason)}</div>
    <div class="banner-date">${date}</div>
  </div>

  <div class="trust-badges">
    <span class="trust-badge">Non-Custodial</span>
    <span class="trust-badge">Wallet-Native</span>
    <span class="trust-badge">Verified On-Chain</span>
    <span class="trust-badge">Arc Testnet</span>
  </div>

  <div class="section">
    <div class="section-title">Payment Details</div>
    ${[
      ['Receipt ID', r.id.slice(0, 8) + '...' + r.id.slice(-4)],
      ['Amount', Number(r.amount).toFixed(token === 'cirBTC' ? 8 : 2) + ' ' + token],
      ['Network', 'Arc Testnet'],
      ['Recipient', r.to_address],
      ['Sender', sender],
      ...(r.note ? [['Note', r.note]] : []),
    ].map(([label, value]) => `
      <div class="detail-row">
        <span class="detail-label">${label}</span>
        <span class="detail-value">${value}</span>
      </div>
    `).join('')}
  </div>

  <div class="tx-box">
    <div class="tx-label">Transaction Hash</div>
    <div class="tx-hash">${escapeHtml(r.tx_hash)}</div>
  </div>

  <div class="footer">
    <div class="footer-text">
      This receipt is an immutable proof-of-settlement object.<br>
      Verify on ArcScan: <a class="footer-url" href="https://testnet.arcscan.app/tx/${escapeHtml(r.tx_hash)}">testnet.arcscan.app</a><br>
      Receipt URL: <a class="footer-url" href="${appUrl}/receipt/${escapeHtml(r.id)}">${appUrl}/receipt/${escapeHtml(r.id)}</a><br><br>
      Generated by PayNote &mdash; Powered by Arc Network
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="paynote-receipt-${r.id.slice(0, 8)}.html"`,
    },
  })
}
