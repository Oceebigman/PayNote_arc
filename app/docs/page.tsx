'use client'

import { useEffect, useState } from 'react'

export default function DocsPage() {
  const appUrl = 'https://paynote.space'
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

  function toggleDark() {
    const next = !dark
    setDark(next)
    localStorage.setItem('paynote-theme', next ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  const bg = dark ? '#080c14' : '#f4f6fb'
  const card = dark ? '#111827' : '#ffffff'
  const border = dark ? '#1e2a3a' : '#e2e8f0'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#475569' : '#64748b'
  const inputBg = dark ? '#0d1321' : '#f8fafc'
  const navBg = dark ? 'rgba(8,12,20,0.92)' : 'rgba(255,255,255,0.92)'
  const codeBg = '#0d1117'

  return (
    <div className="min-h-screen transition-colors duration-300" style={{background: bg, color: text, fontFamily: '"Inter", system-ui, sans-serif'}}>

      <nav className="sticky top-0 z-50 px-5 sm:px-10 py-4 flex items-center justify-between border-b backdrop-blur-xl" style={{borderColor: border, background: navBg}}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
              <defs><linearGradient id="pgd" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4A154B"/><stop offset="100%" stopColor="#1A44C4"/></linearGradient></defs>
              <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgd)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="font-black text-lg group-hover:opacity-70 transition-opacity" style={{color: text}}>PayNote</span>
          </a>
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md" style={{background: dark ? '#1e2a3a' : '#f1f5f9', color: muted}}>Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/build" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{color: muted}}>API Use Cases</a>
          <button onClick={toggleDark} className="p-2.5 rounded-xl border transition-all hover:scale-105" style={{borderColor: border, background: dark ? '#1a2535' : '#f1f5f9'}}>
            {dark
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: muted}}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            }
          </button>
          <a href="/" className="text-sm font-bold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity" style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>← App</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-6 uppercase tracking-widest" style={{borderColor: border, color: muted, background: card}}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
            API Reference v1.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight tracking-tight" style={{color: text}}>
            PayNote API
          </h1>
          <p className="text-lg font-medium mb-8" style={{color: muted}}>
            Payment coordination infrastructure on Arc. Request, verify, and automate USDC payments with one API call.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Get API Key', href: '#auth' },
              { label: 'Create Request', href: '#create' },
              { label: 'Agent API', href: '#agent' },
              { label: 'x402 Protocol', href: '#x402' },
              { label: 'Webhooks', href: '#webhooks' },
              { label: 'SDK', href: '#sdk' },
              { label: 'Widget', href: '#widget' },
              { label: 'Contracts', href: '#contracts' },
            ].map(link => (
              <a key={link.label} href={link.href}
                className="text-xs font-bold px-3 py-2.5 rounded-xl border text-center transition-all hover:border-blue-500 hover:text-blue-500"
                style={{borderColor: border, color: muted, background: card}}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <Section id="auth" title="Getting Your API Key" badge="Start Here" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            You don't need to contact anyone. Generate your API key instantly using the self-serve endpoint below. No account required.
          </p>

          <div className="rounded-2xl border p-5 mb-5" style={{borderColor: '#1A44C430', background: dark ? '#0d1a3a' : '#EFF6FF'}}>
            <p className="text-sm font-black mb-2" style={{color: '#1A44C4'}}>Self-serve — generate your key in one request</p>
            <Code dark={dark}>{`curl -X POST ${appUrl}/api/keys/request \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "your@email.com",
    "project_name": "My Project",
    "use_case": "Freelance payment tool for USDC invoicing"
  }'`}</Code>
            <p className="text-xs font-bold mt-3 mb-2" style={{color: muted}}>Response — your key is returned once. Copy it immediately.</p>
            <Code dark={dark}>{`{
  "key": "pn_a1b2c3d4...",
  "prefix": "pn_a1b2c…",
  "message": "Store it securely — it will not be shown again.",
  "docs": "https://paynote.space/docs"
}`}</Code>
          </div>

          <p className="text-base mb-3 font-medium" style={{color: muted}}>Once you have your key, pass it in every request:</p>
          <Code dark={dark}>{`Authorization: Bearer pn_your_api_key`}</Code>
          <InfoBox dark={dark}>
            Keys are rate-limited by default. If you need higher limits for production, reach out via the Arc Discord. Your key is tied to your email — don't share it.
          </InfoBox>
        </Section>

        <Section id="create" title="POST /api/request" badge="Core" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Create a payment request. Returns a shareable URL. That's all your payer needs.
          </p>
          <Code dark={dark}>{`curl -X POST ${appUrl}/api/request \\
  -H "Authorization: Bearer pn_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50,
    "reason": "Freelance invoice #003",
    "to_address": "0xYourWalletAddress",
    "token": "USDC",
    "note": "Thanks!",
    "expires_in": 86400,
    "recurring": "monthly",
    "display_name": "Acme Studio"
  }'`}</Code>
          <Code dark={dark}>{`{
  "slug": "k8Xm2pQn",
  "url": "${appUrl}/r/k8Xm2pQn",
  "amount": 50,
  "token": "USDC",
  "status": "pending"
}`}</Code>
          <ParamTable dark={dark} border={border} muted={muted} params={[
            { name: 'amount', type: 'number', required: true, desc: 'Payment amount. Min 0.000001 for nanopayments.' },
            { name: 'reason', type: 'string', required: true, desc: 'Description shown to the payer.' },
            { name: 'to_address', type: 'string', required: true, desc: 'Your recipient wallet address (0x...).' },
            { name: 'token', type: 'string', required: false, desc: 'USDC (default), EURC, or cirBTC.' },
            { name: 'note', type: 'string', required: false, desc: 'Optional message shown on the pay page.' },
            { name: 'expires_in', type: 'number', required: false, desc: 'Expiry in seconds. 86400 = 24h.' },
            { name: 'recurring', type: 'string', required: false, desc: 'once · daily · weekly · monthly · yearly' },
            { name: 'display_name', type: 'string', required: false, desc: 'Your name or business shown on the pay page.' },
          ]} />
        </Section>

        <Section id="agent" title="POST /api/agent/pay" badge="Agentic" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Optimised for autonomous systems. Returns a complete instruction set. Every response includes ERC-8183 headers so any compliant agent can discover and act on the payment intent automatically — no human in the loop.
          </p>
          <Code dark={dark}>{`curl -X POST ${appUrl}/api/agent/pay \\
  -H "Authorization: Bearer pn_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "reason": "Task completed — milestone #3",
    "to_address": "0xRecipientAddress",
    "token": "USDC"
  }'`}</Code>
          <Code dark={dark}>{`{
  "slug": "abc12345",
  "url": "${appUrl}/r/abc12345",
  "amount": 100,
  "token": "USDC",
  "status": "pending",
  "erc8183": {
    "version": "1.0",
    "intent_id": "abc12345",
    "network": "arc-testnet"
  },
  "instructions": {
    "pay_url": "${appUrl}/r/abc12345",
    "poll_url": "${appUrl}/api/poll?slug=abc12345",
    "verify_url": "${appUrl}/api/verify",
    "receipt_url": "${appUrl}/receipt/abc12345",
    "x402_url": "${appUrl}/api/x402?slug=abc12345"
  }
}`}</Code>
          <InfoBox dark={dark} color="blue">
            Response headers include <code className="font-mono text-blue-400 text-xs">X-ERC8183-Pay-URL</code>, <code className="font-mono text-blue-400 text-xs">X-ERC8183-Poll-URL</code>, <code className="font-mono text-blue-400 text-xs">X-ERC8183-Amount</code>, <code className="font-mono text-blue-400 text-xs">X-ERC8183-Token</code> and more. Any ERC-8183 compliant agent reads these directly — no documentation needed.
          </InfoBox>
        </Section>

        <Section id="poll" title="GET /api/poll" badge="Status" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Lightweight status check. No auth needed. Designed for agent polling loops.
          </p>
          <Code dark={dark}>{`curl ${appUrl}/api/poll?slug=k8Xm2pQn`}</Code>
          <Code dark={dark}>{`{
  "status": "pending | completed | failed | expired",
  "tx_hash": "0x...",
  "completed_at": "2026-06-03T10:00:00.000Z"
}`}</Code>
          <InfoBox dark={dark}>
            Use <code className="font-mono text-xs" style={{color: '#1A44C4'}}>sdk.waitForPayment()</code> instead of manual polling — it handles retries and timeouts automatically.
          </InfoBox>
        </Section>

        <Section id="x402" title="x402 Protocol" badge="Agentic" dark={dark} border={border} text={text}>
          <p className="text-base mb-6 font-medium" style={{color: muted}}>
            PayNote implements x402 — the HTTP-native payment standard. An agent hits the endpoint, gets a 402 response with payment details in headers, pays via EIP-3009 signature offchain, retries, gets access. Fully autonomous. No human approval.
          </p>

          <div className="rounded-2xl border p-5 mb-5" style={{borderColor: border, background: inputBg}}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{color: muted}}>Agent-to-agent flow</p>
            <div className="flex flex-col gap-2">
              {[
                { n: '1', title: 'Agent requests endpoint', detail: 'GET /api/x402?slug=abc123' },
                { n: '2', title: 'Server returns 402', detail: 'Payment details in response headers' },
                { n: '3', title: 'Agent reads headers', detail: 'Amount, token, recipient, network' },
                { n: '4', title: 'Agent signs EIP-3009', detail: 'Offchain — no gas needed' },
                { n: '5', title: 'Agent retries with X-PAYMENT', detail: 'base64-encoded authorization' },
                { n: '6', title: 'Server returns 200', detail: 'Resource delivered. Done.' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{background: dark ? '#1e2a3a' : '#EFF6FF', color: '#1A44C4'}}>{s.n}</span>
                  <div>
                    <span className="text-sm font-bold" style={{color: text}}>{s.title} </span>
                    <span className="text-xs font-mono" style={{color: muted}}>{s.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Code dark={dark}>{`# Agent hits endpoint — gets 402
curl -v ${appUrl}/api/x402?slug=abc12345

# Response headers:
# HTTP/1.1 402 Payment Required
# X-Payment-Required: true
# X-Payment-Amount: 100
# X-Payment-Asset: 0x3600...0000
# X-Payment-Pay-To: 0xYourAddress
# X-Payment-Pay-URL: ${appUrl}/r/abc12345

# Agent retries with signed authorization
curl ${appUrl}/api/x402?slug=abc12345 \\
  -H "X-PAYMENT: <base64-EIP-3009-authorization>"
# Returns 200`}</Code>
        </Section>

        <Section id="webhooks" title="Webhooks" badge="Real-time" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Register an HTTPS endpoint to receive payment events in real time. Every payload is HMAC-SHA256 signed. Your server reacts automatically — no polling needed.
          </p>
          <Code dark={dark}>{`curl -X POST ${appUrl}/api/webhooks \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourserver.com/webhooks/paynote",
    "secret": "your_signing_secret",
    "events": ["payment.completed", "payment.created"]
  }'`}</Code>
          <Code dark={dark}>{`{
  "event": "payment.completed",
  "timestamp": "2026-06-03T10:00:00.000Z",
  "request": {
    "slug": "k8Xm2pQn",
    "amount": "50.000000",
    "token": "USDC",
    "reason": "Freelance invoice #003",
    "status": "completed",
    "tx_hash": "0x...",
    "sender_address": "0x..."
  }
}`}</Code>
          <Code dark={dark}>{`const crypto = require('crypto')

app.post('/webhooks/paynote', (req, res) => {
  const sig = req.headers['x-paynote-signature']
  const expected = 'sha256=' + crypto
    .createHmac('sha256', 'your_secret')
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (expected !== sig) return res.status(401).send('Invalid')

  const { event, request } = req.body
  if (event === 'payment.completed') {
    // Grant access, trigger next step, update records
  }
  res.sendStatus(200)
})`}</Code>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { event: 'payment.created', desc: 'New request created' },
              { event: 'payment.completed', desc: 'Payment confirmed on Arc' },
              { event: 'payment.failed', desc: 'Transaction reverted' },
              { event: 'payment.expired', desc: 'Deadline passed' },
            ].map(e => (
              <div key={e.event} className="rounded-xl border p-3" style={{borderColor: border, background: inputBg}}>
                <code className="text-xs font-mono font-bold" style={{color: '#1A44C4'}}>{e.event}</code>
                <p className="text-xs mt-1 font-medium" style={{color: muted}}>{e.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="sdk" title="JavaScript SDK" badge="npm" dark={dark} border={border} text={text}>
          <Code dark={dark}>{`npm install @egcrypt/paynote-sdk`}</Code>
          <Code dark={dark}>{`import PayNote from '@egcrypt/paynote-sdk'

const sdk = new PayNote()

const request = await sdk.createRequest({
  amount: 50,
  reason: 'Invoice #003',
  toAddress: '0xYourWallet',
  token: 'USDC',
  expiresIn: 86400,
})

console.log(request.url)
// ${appUrl}/r/abc12345

// Poll once
const status = await sdk.getStatus(request.slug)

// Block until paid (automatic polling)
const result = await sdk.waitForPayment(request.slug, {
  timeoutMs: 300000,
})
console.log(result.txHash)`}</Code>
        </Section>

        <Section id="widget" title="Embeddable Widget" badge="Embed" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Add a live payment request to any website. One script tag. Your payer never has to leave your page.
          </p>
          <Code dark={dark}>{`<script src="${appUrl}/widget.js"></script>
<paynote-request id="k8Xm2pQn"></paynote-request>

<!-- Or direct iframe -->
<iframe
  src="${appUrl}/widget/k8Xm2pQn"
  style="border:none;width:360px;height:220px;border-radius:16px"
></iframe>`}</Code>
        </Section>

        <Section id="contracts" title="Deployed Contracts" badge="On-Chain" dark={dark} border={border} text={text}>
          <div className="flex flex-col gap-3">
            {[
              { name: 'PayNoteRouter', addr: '0x829fe116E221d14Db289623028c5AC6b2F30BD82', desc: 'Native USDC transfers' },
              { name: 'PayNoteRouterV2', addr: '0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4', desc: 'ERC-20 multi-asset · Token whitelist · Split payments' },
            ].map(c => (
              <div key={c.name} className="rounded-2xl border p-5" style={{borderColor: border, background: inputBg}}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-black text-base" style={{color: text}}>{c.name}</span>
                  <a href={`https://testnet.arcscan.app/address/${c.addr}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold hover:opacity-70 transition-opacity" style={{color: '#1A44C4'}}>
                    View on ArcScan →
                  </a>
                </div>
                <code className="text-xs font-mono block mb-2" style={{color: muted}}>{c.addr}</code>
                <p className="text-xs font-medium" style={{color: muted}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>



        <Section id="signed-requests" title="Signed Payment Intents" badge="Trust" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            Anyone can technically create a PayNote request pointing to any wallet address. To prove a request was actually authorized by the wallet that will receive funds, the creator can sign the request with their wallet — no gas, no transaction, just a signature.
          </p>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            The pay page shows "Verified request — signed by 0x..." when a valid signature is included. Payers can trust the request came from the claimed recipient without trusting PayNote's database alone.
          </p>
          <Code dark={dark}>{`// 1. Build the intent message (must match exactly)
const message = \`PayNote Payment Intent
Amount: \${amount}
Reason: \${reason}
Recipient: \${to_address.toLowerCase()}
Token: \${token}\`

// 2. Sign with your wallet (EIP-191 personal_sign — free, instant)
const signature = await wallet.signMessage(message)

// 3. Include the signature when creating the request
curl -X POST /api/request \
  -H "Authorization: Bearer pn_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Invoice #003",
    "to_address": "0xYourWallet",
    "token": "USDC",
    "signature": "0x..."
  }'`}</Code>
          <InfoBox dark={dark} color="blue">
            Signature is optional. Unsigned requests work exactly as before. Signed requests get a verified badge on the pay page — useful for businesses and recurring requesters who want payers to trust the source.
          </InfoBox>
        </Section>

        <Section id="agent-wallets" title="Agent Wallets (Turnkey-compatible)" badge="Agentic" dark={dark} border={border} text={text}>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            PayNote's x402 endpoint requires an EIP-3009 signature from the payer. For AI agents, that signature should come from a wallet the agent controls programmatically — not a human-held seed phrase.
          </p>
          <p className="text-base mb-4 font-medium" style={{color: muted}}>
            We're aligning with Arc's Turnkey integration for dev-controlled wallets. An agent's wallet is provisioned via Turnkey, signing permissions are scoped (e.g. max 50 USDC per day, only to whitelisted PayNote x402 endpoints), and the agent signs EIP-3009 authorizations without ever holding raw private keys.
          </p>
          <Code dark={dark}>{`// Agent wallet flow (Turnkey + PayNote)
1. Provision agent wallet via Turnkey (scoped signing policy)
2. Agent calls POST /api/agent/pay -> gets x402_url
3. Agent requests EIP-3009 signature from Turnkey
   (Turnkey enforces: max amount, allowed recipients, allowed tokens)
4. Agent retries x402_url with X-PAYMENT header
5. PayNote verifies signature + settles on Arc`}</Code>
          <InfoBox dark={dark} color="blue">
            This is on our active roadmap. Status: aligning with Arc's Turnkey partnership announced by Tim Baker. If you're building agent wallets on Turnkey, reach out — we'd like to test this integration together.
          </InfoBox>
        </Section>

        <Section id="tokens" title="Supported Tokens" badge="Assets" dark={dark} border={border} text={text}>
          <div className="rounded-2xl border overflow-hidden" style={{borderColor: border}}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{background: inputBg}}>
                  {['Token', 'Contract', 'Decimals', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest" style={{color: muted}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { token: 'USDC', addr: '0x3600...0000', dec: '6', status: 'Live', color: '#16a34a' },
                  { token: 'EURC', addr: '0x89B5...72a', dec: '6', status: 'Live', color: '#16a34a' },
                  { token: 'cirBTC', addr: '0xf0C4...32BF', dec: '8', status: 'Live', color: '#16a34a' },
                  { token: 'USYC', addr: '0xe918...86C', dec: '6', status: 'Allowlist', color: '#d97706' },
                  { token: 'QCAD', addr: 'Pending', dec: '6', status: 'Soon', color: '#64748b' },
                ].map((row, i) => (
                  <tr key={row.token} style={{background: i % 2 === 0 ? card : inputBg}}>
                    <td className="px-4 py-3 font-black" style={{color: text}}>{row.token}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{color: muted}}>{row.addr}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{color: muted}}>{row.dec}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{color: row.color, background: row.color + '20'}}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>

      <footer className="py-6 border-t mt-12" style={{borderColor: border, background: card}}>
        <div className="max-w-4xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{color: muted}}>
            PayNote API v1.0 · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-black hover:opacity-70" style={{color: '#1A44C4'}}>Arc</a>
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.npmjs.com/package/@egcrypt/paynote-sdk" target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:opacity-70" style={{color: muted}}>npm SDK</a>
            <a href="/" className="text-xs font-bold hover:opacity-70" style={{color: muted}}>App</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Section({ id, title, badge, children, dark, border, text }: { id: string; title: string; badge: string; children: React.ReactNode; dark: boolean; border: string; text: string }) {
  const badgeColors: Record<string, { bg: string; color: string }> = {
    'Start Here': { bg: '#7c3aed20', color: '#7c3aed' },
    Core: { bg: '#1A44C420', color: '#1A44C4' },
    Agentic: { bg: '#06b6d420', color: '#06b6d4' },
    Status: { bg: '#16a34a20', color: '#16a34a' },
    'Real-time': { bg: '#d9770620', color: '#d97706' },
    npm: { bg: '#dc262620', color: '#dc2626' },
    Embed: { bg: '#47556920', color: '#64748b' },
    Assets: { bg: '#1A44C420', color: '#1A44C4' },
    'On-Chain': { bg: '#16a34a20', color: '#16a34a' },
  }
  const bc = badgeColors[badge] || { bg: '#1e2a3a', color: '#475569' }

  return (
    <div id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{borderColor: border}}>
        <h2 className="text-xl sm:text-2xl font-black" style={{color: text}}>{title}</h2>
        <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest" style={{background: bc.bg, color: bc.color}}>{badge}</span>
      </div>
      {children}
    </div>
  )
}

function Code({ children, dark }: { children: string; dark: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{background: '#0d1117', border: '1px solid #1e2a3a'}}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{borderColor: '#1e2a3a'}}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60"/>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60"/>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60"/>
        </div>
      </div>
      <pre className="text-sm font-mono leading-relaxed overflow-x-auto p-5" style={{color: '#94a3b8'}}>{children}</pre>
    </div>
  )
}

function InfoBox({ children, dark, color = 'slate' }: { children: React.ReactNode; dark: boolean; color?: string }) {
  const c = color === 'blue'
    ? { bg: '#1A44C410', border: '#1A44C430', text: '#64748b', icon: '#1A44C4' }
    : { bg: dark ? '#1e2a3a40' : '#f1f5f980', border: dark ? '#1e2a3a' : '#e2e8f0', text: '#64748b', icon: '#475569' }
  return (
    <div className="rounded-xl p-4 mb-4 flex gap-3" style={{background: c.bg, border: `1px solid ${c.border}`}}>
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color: c.icon}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p className="text-sm font-medium" style={{color: c.text}}>{children}</p>
    </div>
  )
}

function ParamTable({ params, dark, border, muted }: { params: { name: string; type: string; required: boolean; desc: string }[]; dark: boolean; border: string; muted: string }) {
  const card = dark ? '#111827' : '#ffffff'
  const inputBg = dark ? '#0d1321' : '#f8fafc'
  const text = dark ? '#f1f5f9' : '#0f172a'
  return (
    <div className="rounded-2xl border overflow-hidden mt-4" style={{borderColor: border}}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{background: inputBg}}>
            {['Parameter', 'Type', 'Required', 'Description'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest" style={{color: muted}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.name} style={{background: i % 2 === 0 ? card : inputBg}}>
              <td className="px-4 py-3 font-mono font-bold text-xs" style={{color: '#1A44C4'}}>{p.name}</td>
              <td className="px-4 py-3 font-mono text-xs" style={{color: muted}}>{p.type}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background: p.required ? '#1A44C420' : dark ? '#1e2a3a' : '#f1f5f9', color: p.required ? '#1A44C4' : muted}}>{p.required ? 'Required' : 'Optional'}</span>
              </td>
              <td className="px-4 py-3 text-xs font-medium" style={{color: muted}}>{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
