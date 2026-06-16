'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'auth', label: 'Authentication' },
  { id: 'create', label: 'Create Request' },
  { id: 'agent', label: 'Agent API' },
  { id: 'x402', label: 'x402 Protocol' },
  { id: 'poll', label: 'Poll Status' },
  { id: 'verify', label: 'Verify Payment' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'signed', label: 'Signed Intents' },
  { id: 'sdk', label: 'SDKs' },
  { id: 'widget', label: 'Widget' },
  { id: 'agent-wallets', label: 'Agent Wallets' },
  { id: 'arc-v072', label: 'Arc v0.7.2' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'tokens', label: 'Tokens' },
]

export default function DocsPage() {
  const appUrl = 'https://paynote.space'
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState('quickstart')
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    setDark(saved === 'dark')
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // Track active section on scroll
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id))
      const scrollY = window.scrollY + 120
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (el && el.offsetTop <= scrollY) {
          setActive(SECTIONS[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => { observer.disconnect(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    localStorage.setItem('paynote-theme', next ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  function scrollTo(id: string) {
    setActive(id)
    setMobileNav(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const bg = dark ? '#080c14' : '#f4f6fb'
  const card = dark ? '#111827' : '#ffffff'
  const border = dark ? '#1e2a3a' : '#e2e8f0'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#475569' : '#64748b'
  const inputBg = dark ? '#0d1321' : '#f8fafc'
  const sidebarBg = dark ? '#0d1321' : '#ffffff'
  const navBg = dark ? 'rgba(8,12,20,0.95)' : 'rgba(255,255,255,0.95)'

  return (
    <div style={{ background: bg, color: text, fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileNav(o => !o)} style={{ display: 'none', padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer' }} className="mobile-menu-btn">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: muted }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                <defs><linearGradient id="pgd" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4A154B"/><stop offset="100%" stopColor="#1A44C4"/></linearGradient></defs>
                <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgd)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span style={{ fontWeight: 900, fontSize: '18px', color: text }}>PayNote</span>
            </a>
            <span style={{ fontSize: '12px', fontWeight: 700, color: muted, background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', padding: '2px 8px' }}>Docs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/build" style={{ fontSize: '14px', fontWeight: 600, color: muted, textDecoration: 'none' }}>Use the API</a>
            <button onClick={toggleDark} style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, cursor: 'pointer' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: muted }}>
                {dark
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                }
              </svg>
            </button>
            <a href="/" style={{ fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#102A83,#1A44C4)', borderRadius: '10px', padding: '8px 16px', textDecoration: 'none' }}>← App</a>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0' }}>

        {/* Sidebar */}
        <aside style={{
          width: '240px', flexShrink: 0, position: 'sticky', top: '60px', height: 'calc(100vh - 60px)',
          overflowY: 'auto', borderRight: `1px solid ${border}`, background: sidebarBg,
          padding: '24px 0',
        }}>
          <div style={{ padding: '0 16px 12px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: muted }}>API Reference</div>

          {[
            { group: 'Getting Started', items: ['quickstart', 'auth'] },
            { group: 'Core API', items: ['create', 'poll', 'verify'] },
            { group: 'Agent & Automation', items: ['agent', 'x402', 'webhooks', 'signed'] },
            { group: 'Developer Tools', items: ['sdk', 'widget', 'agent-wallets'] },
            { group: 'Network', items: ['arc-v072', 'contracts', 'tokens'] },
          ].map(group => (
            <div key={group.group} style={{ marginBottom: '8px' }}>
              <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{group.group}</div>
              {group.items.map(id => {
                const section = SECTIONS.find(s => s.id === id)
                if (!section) return null
                const isActive = active === id
                return (
                  <button key={id} onClick={() => scrollTo(id)} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 16px', fontSize: '14px', fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#1A44C4' : muted,
                    background: isActive ? (dark ? '#0d1a3a' : '#EFF6FF') : 'transparent',
                    border: 'none', borderLeft: isActive ? '2px solid #1A44C4' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {section.label}
                  </button>
                )
              })}
            </div>
          ))}

          <div style={{ margin: '16px', padding: '12px', borderRadius: '12px', background: dark ? '#0d1a3a' : '#EFF6FF', border: `1px solid ${dark ? '#1e3a6e' : '#bfdbfe'}` }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A44C4', marginBottom: '6px' }}>Get API Key</p>
            <p style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>Self-serve. No signup.</p>
            <button onClick={() => scrollTo('auth')} style={{ fontSize: '11px', fontWeight: 700, color: '#1A44C4', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Get started →</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, padding: '40px 48px', maxWidth: '800px' }}>

          {/* Hero */}
          <div style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#16a34a', background: dark ? '#0a2a0a' : '#f0fdf4', border: `1px solid ${dark ? '#166534' : '#86efac'}`, borderRadius: '20px', padding: '4px 12px', marginBottom: '16px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              Live on Arc Testnet
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, color: text, marginBottom: '12px', lineHeight: 1.1 }}>PayNote API</h1>
            <p style={{ fontSize: '18px', color: muted, lineHeight: 1.6, marginBottom: '24px' }}>Payment coordination infrastructure on Arc. Non-custodial. Agent-ready. One API call.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Quick Start', id: 'quickstart' },
                { label: 'Agent API', id: 'agent' },
                { label: 'x402 Protocol', id: 'x402' },
                { label: 'OpenAPI Spec', href: '/api-spec' },
              ].map(card => (
                <button key={card.label} onClick={() => card.id ? scrollTo(card.id) : window.open(card.href, '_blank')}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${border}`, background: 'transparent', fontSize: '14px', fontWeight: 700, color: text, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {card.label} →
                </button>
              ))}
            </div>
          </div>

          {/* QUICK START */}
          <Section id="quickstart" title="Quick Start" badge="Start Here" badgeColor="#7c3aed" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Get from zero to a live payment request in under 2 minutes. No account, no approval, no waiting.</p>
            <Step n="1" title="Get your API key" muted={muted} text={text}>
              <Code dark={dark}>{"curl -X POST https://paynote.space/api/keys/request \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"email\":\"you@email.com\",\"use_case\":\"My project\",\"project_name\":\"My App\"}'"}</Code>
              <p style={{ fontSize: '13px', color: muted, marginTop: '8px' }}>Returns your key immediately. Store it — it won't show again.</p>
            </Step>
            <Step n="2" title="Create a payment request" muted={muted} text={text}>
              <Code dark={dark}>{"curl -X POST https://paynote.space/api/request \\\n  -H \"Authorization: Bearer pn_your_key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"amount\":50,\"reason\":\"Invoice #003\",\"to_address\":\"0xYourWallet\",\"token\":\"USDC\"}'"}</Code>
            </Step>
            <Step n="3" title="Share the URL and get paid" muted={muted} text={text}>
              <Code dark={dark}>{"// Response includes:\n{\n  \"slug\": \"k8Xm2pQn\",\n  \"url\": \"https://paynote.space/r/k8Xm2pQn\",\n  \"status\": \"pending\"\n}\n// Share the URL. Payer connects wallet, pays. Done."}</Code>
            </Step>
          </Section>

          {/* AUTH */}
          <Section id="auth" title="Authentication" badge="Required" badgeColor="#1A44C4" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>All API endpoints except <Mono>/api/poll</Mono> require a bearer token. Generate one instantly — no signup, no admin contact needed.</p>
            <Code dark={dark}>{"# Generate your key\ncurl -X POST https://paynote.space/api/keys/request \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"email\": \"you@email.com\",\n    \"project_name\": \"My Project\",\n    \"use_case\": \"Describe what you are building\"\n  }'"}</Code>
            <Code dark={dark}>{"# Use your key on every request\nAuthorization: Bearer pn_your_api_key"}</Code>
            <InfoBox dark={dark} color="blue">Keys are rate-limited by default. Each key starts with <strong>pn_</strong>. Contact us via Arc Discord for higher limits on production integrations.</InfoBox>
          </Section>

          {/* CREATE */}
          <Section id="create" title="POST /api/request" badge="Core" badgeColor="#1A44C4" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Create a payment request. Returns a shareable URL. That is all your payer needs.</p>
            <Code dark={dark}>{"curl -X POST https://paynote.space/api/request \\\n  -H \"Authorization: Bearer pn_your_key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"amount\": 50,\n    \"reason\": \"Freelance invoice #003\",\n    \"to_address\": \"0xYourWalletAddress\",\n    \"token\": \"USDC\",\n    \"note\": \"Thanks for the work!\",\n    \"expires_in\": 86400,\n    \"recurring\": \"monthly\",\n    \"display_name\": \"Acme Studio\"\n  }'"}</Code>
            <Code dark={dark}>{"{\n  \"slug\": \"k8Xm2pQn\",\n  \"url\": \"https://paynote.space/r/k8Xm2pQn\",\n  \"amount\": 50,\n  \"token\": \"USDC\",\n  \"status\": \"pending\",\n  \"verified\": false,\n  \"signed_by\": null\n}"}</Code>
            <ParamTable dark={dark} border={border} muted={muted} text={text} params={[
              { name: 'amount', type: 'number', required: true, desc: 'Payment amount. Min 0.000001 for nanopayments.' },
              { name: 'reason', type: 'string', required: true, desc: 'Description shown to the payer.' },
              { name: 'to_address', type: 'string', required: true, desc: 'Your recipient wallet address (0x...).' },
              { name: 'token', type: 'string', required: false, desc: 'USDC (default), EURC, or cirBTC.' },
              { name: 'note', type: 'string', required: false, desc: 'Optional message shown on the pay page.' },
              { name: 'expires_in', type: 'number', required: false, desc: 'Expiry in seconds. 86400 = 24h.' },
              { name: 'recurring', type: 'string', required: false, desc: 'once · daily · weekly · monthly · yearly' },
              { name: 'display_name', type: 'string', required: false, desc: 'Your name or business shown on the pay page.' },
              { name: 'signature', type: 'string', required: false, desc: 'EIP-191 wallet signature for verified requests.' },
            ]} />
          </Section>

          {/* AGENT */}
          <Section id="agent" title="POST /api/agent/pay" badge="Agentic" badgeColor="#06b6d4" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Optimised for autonomous systems. Returns a complete instruction set with all URLs an agent needs plus ERC-8183 headers on every response.</p>
            <Code dark={dark}>{"curl -X POST https://paynote.space/api/agent/pay \\\n  -H \"Authorization: Bearer pn_your_key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"amount\": 10,\n    \"reason\": \"Task completed - milestone 3\",\n    \"to_address\": \"0xYourWallet\",\n    \"token\": \"USDC\",\n    \"notify_url\": \"https://agentb.server/incoming-payments\"\n  }'"}</Code>
            <Code dark={dark}>{"{\n  \"slug\": \"abc12345\",\n  \"url\": \"https://paynote.space/r/abc12345\",\n  \"erc8183\": {\n    \"version\": \"1.0\",\n    \"intent_id\": \"abc12345\",\n    \"network\": \"arc-testnet\"\n  },\n  \"instructions\": {\n    \"pay_url\": \"https://paynote.space/r/abc12345\",\n    \"poll_url\": \"https://paynote.space/api/poll?slug=abc12345\",\n    \"verify_url\": \"https://paynote.space/api/verify\",\n    \"receipt_url\": \"https://paynote.space/receipt/abc12345\",\n    \"x402_url\": \"https://paynote.space/api/x402?slug=abc12345\"\n  }\n}"}</Code>
            <InfoBox dark={dark} color="blue">Include <strong>notify_url</strong> to have PayNote notify Agent B immediately when the request is created. Agent B receives the full payment details and x402 URL directly — no polling needed.</InfoBox>
            <p style={{ fontSize: '13px', fontWeight: 700, color: text, marginTop: '16px', marginBottom: '8px' }}>ERC-8183 Response Headers</p>
            <Code dark={dark}>{"X-ERC8183-Version: 1.0\nX-ERC8183-Intent-ID: abc12345\nX-ERC8183-Pay-URL: https://paynote.space/r/abc12345\nX-ERC8183-Poll-URL: https://paynote.space/api/poll?slug=abc12345\nX-ERC8183-Amount: 10\nX-ERC8183-Token: USDC\nX-ERC8183-Network: arc-testnet"}</Code>
          </Section>

          {/* X402 */}
          <Section id="x402" title="GET /api/x402" badge="Agentic" badgeColor="#06b6d4" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>The x402 protocol enables agent-to-agent payment with zero human involvement. Agent B hits this endpoint, gets HTTP 402 with full payment details, signs EIP-3009 offchain, retries, gets 200.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { n: '1', t: 'Agent B hits endpoint', d: 'GET /api/x402?slug=abc12345' },
                { n: '2', t: 'Gets HTTP 402', d: 'Full payment details in response body and headers' },
                { n: '3', t: 'Reads payment details', d: 'Amount, token address, recipient, network' },
                { n: '4', t: 'Signs EIP-3009 offchain', d: 'Cryptographic authorization — zero gas needed' },
                { n: '5', t: 'Retries with X-PAYMENT header', d: 'base64-encoded authorization' },
                { n: '6', t: 'Gets HTTP 200', d: 'Payment confirmed. Access granted.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: dark ? '#1e2a3a' : '#EFF6FF', color: '#1A44C4', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{s.n}</span>
                  <div><span style={{ fontSize: '14px', fontWeight: 700, color: text }}>{s.t} </span><span style={{ fontSize: '12px', color: muted, fontFamily: 'monospace' }}>{s.d}</span></div>
                </div>
              ))}
            </div>
            <Code dark={dark}>{"# Agent B hits endpoint — gets 402 with full body\ncurl -s https://paynote.space/api/x402?slug=abc12345\n\n# Response body:\n{\n  \"x402_version\": \"1.0\",\n  \"error\": \"Payment Required\",\n  \"accepts\": [{\n    \"token\": \"USDC\",\n    \"amount\": 10,\n    \"pay_to\": \"0xYourWallet\",\n    \"network\": \"arc-testnet\"\n  }],\n  \"instructions\": {\n    \"step1\": \"Sign EIP-3009 transferWithAuthorization\",\n    \"step2\": \"Encode as base64\",\n    \"step3\": \"Retry with X-PAYMENT header\",\n    \"step4\": \"Receive HTTP 200\"\n  }\n}"}</Code>
          </Section>

          {/* POLL */}
          <Section id="poll" title="GET /api/poll" badge="Status" badgeColor="#16a34a" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Lightweight status check. No auth required. Designed for agent polling loops.</p>
            <Code dark={dark}>{"curl https://paynote.space/api/poll?slug=k8Xm2pQn"}</Code>
            <Code dark={dark}>{"{\n  \"status\": \"pending | completed | failed | expired\",\n  \"tx_hash\": \"0x...\",\n  \"completed_at\": \"2026-06-18T10:00:00.000Z\",\n  \"amount\": 50,\n  \"token\": \"USDC\"\n}"}</Code>
            <InfoBox dark={dark}>Rate limited to 120 requests per minute per IP. Use <strong>sdk.waitForPayment()</strong> instead of manual polling — it handles retries and timeouts automatically.</InfoBox>
          </Section>

          {/* VERIFY */}
          <Section id="verify" title="POST /api/verify" badge="On-Chain" badgeColor="#16a34a" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Verifies a transaction directly on Arc RPC. Updates payment status. Fires webhooks. Retries automatically up to 5 times with exponential backoff on RPC timeouts.</p>
            <Code dark={dark}>{"curl -X POST https://paynote.space/api/verify \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"slug\":\"k8Xm2pQn\",\"tx_hash\":\"0x...\"}'"}</Code>
            <Code dark={dark}>{"{\n  \"verified\": true,\n  \"updated\": true,\n  \"block\": 46934416,\n  \"onchain_memo\": \"PayNote:k8Xm2pQn - 50 USDC\"\n}"}</Code>
            <InfoBox dark={dark}>Idempotent — calling verify twice with the same slug and tx_hash returns <strong>idempotent: true</strong> without creating duplicate receipts.</InfoBox>
          </Section>

          {/* WEBHOOKS */}
          <Section id="webhooks" title="Webhooks" badge="Real-time" badgeColor="#d97706" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Register an HTTPS endpoint to receive payment events in real time. Every payload is HMAC-SHA256 signed. Retries automatically 5 times with exponential backoff on failure.</p>
            <Code dark={dark}>{"# Register a webhook\ncurl -X POST https://paynote.space/api/webhooks \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"url\": \"https://yourserver.com/webhooks/paynote\",\n    \"secret\": \"your_signing_secret\",\n    \"events\": [\"payment.completed\", \"payment.created\"]\n  }'"}</Code>
            <Code dark={dark}>{"// Payload sent to your server\n{\n  \"event\": \"payment.completed\",\n  \"timestamp\": \"2026-06-18T10:00:00.000Z\",\n  \"request\": {\n    \"slug\": \"k8Xm2pQn\",\n    \"amount\": \"50.000000\",\n    \"token\": \"USDC\",\n    \"reason\": \"Freelance invoice #003\",\n    \"status\": \"completed\",\n    \"tx_hash\": \"0x...\"\n  }\n}"}</Code>
            <Code dark={dark}>{"// Verify the signature\nconst crypto = require('crypto')\nconst sig = req.headers['x-paynote-signature']\nconst expected = 'sha256=' + crypto\n  .createHmac('sha256', 'your_secret')\n  .update(JSON.stringify(req.body))\n  .digest('hex')\nif (expected !== sig) return res.status(401).send('Invalid')"}</Code>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              {[
                { event: 'payment.created', desc: 'New request created' },
                { event: 'payment.completed', desc: 'Confirmed on Arc' },
                { event: 'payment.failed', desc: 'Transaction reverted' },
                { event: 'payment.expired', desc: 'Deadline passed' },
              ].map(e => (
                <div key={e.event} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg }}>
                  <code style={{ fontSize: '12px', color: '#1A44C4', fontWeight: 700 }}>{e.event}</code>
                  <p style={{ fontSize: '12px', color: muted, marginTop: '4px' }}>{e.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* SIGNED INTENTS */}
          <Section id="signed" title="Signed Payment Intents" badge="Trust" badgeColor="#7c3aed" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Prove a request was created by the wallet that will receive funds. The creator signs the request with their wallet — no gas, no transaction. The pay page shows a verified badge.</p>
            <Code dark={dark}>{"// Build the message (must match exactly)\nconst message = `PayNote Payment Intent\nAmount: ${amount}\nReason: ${reason}\nRecipient: ${to_address.toLowerCase()}\nToken: ${token}`\n\n// Sign with wallet (EIP-191 personal_sign)\nconst signature = await wallet.signMessage(message)\n\n// Include in your API request\n{ ...params, signature }"}</Code>
            <InfoBox dark={dark}>Signature is optional. Unsigned requests work exactly as before. Signed requests display a green verified badge showing the signer's address.</InfoBox>
          </Section>

          {/* SDK */}
          <Section id="sdk" title="SDKs" badge="npm" badgeColor="#dc2626" text={text} border={border}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: text, marginBottom: '8px' }}>JavaScript / TypeScript</p>
            <Code dark={dark}>{"npm install @egcrypt/paynote-sdk"}</Code>
            <Code dark={dark}>{"import PayNote from '@egcrypt/paynote-sdk'\n\nconst sdk = new PayNote()\n\nconst request = await sdk.createRequest({\n  amount: 50,\n  reason: 'Invoice #003',\n  toAddress: '0xYourWallet',\n  token: 'USDC',\n})\nconsole.log(request.url)\n// https://paynote.space/r/abc12345\n\n// Block until paid\nconst result = await sdk.waitForPayment(request.slug)\nconsole.log(result.txHash)"}</Code>
            <p style={{ fontSize: '15px', fontWeight: 700, color: text, marginBottom: '8px', marginTop: '20px' }}>Python</p>
            <Code dark={dark}>{"pip install requests"}</Code>
            <Code dark={dark}>{"from paynote import PayNote\n\nsdk = PayNote()\n\n# Get API key\nkey_data = sdk.get_api_key('you@email.com', 'My project')\napi_key = key_data['key']\n\n# Create request\nrequest = sdk.create_request(\n    api_key=api_key,\n    amount=50.0,\n    reason='Invoice #003',\n    to_address='0xYourWallet',\n    token='USDC',\n)\nprint(request['url'])\n\n# Wait for payment\nresult = sdk.wait_for_payment(request['slug'])\nprint(result['tx_hash'])"}</Code>
          </Section>

          {/* WIDGET */}
          <Section id="widget" title="Embeddable Widget" badge="Embed" badgeColor="#64748b" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Add a live payment request to any website. One script tag. The payer never leaves your page.</p>
            <Code dark={dark}>{"<script src=\"https://paynote.space/widget.js\"></script>\n<paynote-request id=\"k8Xm2pQn\"></paynote-request>\n\n<!-- Or direct iframe -->\n<iframe\n  src=\"https://paynote.space/widget/k8Xm2pQn\"\n  style=\"border:none;width:360px;height:220px;border-radius:16px\"\n></iframe>"}</Code>
          </Section>

          {/* AGENT WALLETS */}
          <Section id="agent-wallets" title="Agent Wallets (Turnkey)" badge="Agentic" badgeColor="#06b6d4" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>PayNote's x402 endpoint requires an EIP-3009 signature from the payer. For AI agents, that signature should come from a programmatically controlled wallet — not a human-held seed phrase.</p>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>We're aligning with Arc's Turnkey integration for dev-controlled wallets. An agent's wallet is provisioned via Turnkey with scoped signing permissions.</p>
            <Code dark={dark}>{"// Agent wallet flow (Turnkey + PayNote)\n1. Provision agent wallet via Turnkey\n   (scoped policy: max 50 USDC/day, only to PayNote x402 endpoints)\n\n2. Agent calls POST /api/agent/pay\n   Gets back: { x402_url, poll_url, receipt_url }\n\n3. Agent requests EIP-3009 signature from Turnkey\n   (Turnkey enforces spend limits before signing)\n\n4. Agent hits x402_url with X-PAYMENT header\n\n5. PayNote verifies signature + settles on Arc"}</Code>
            <InfoBox dark={dark}>Turnkey integration is on our active roadmap. If you are building agent wallets on Arc with Turnkey, reach out — we want to test this together.</InfoBox>
          </Section>

          {/* ARC V0.7.2 */}
          <Section id="arc-v072" title="Arc v0.7.2 — Transaction Extensions" badge="New" badgeColor="#7c3aed" text={text} border={border}>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '16px' }}>Arc Testnet upgraded to v0.7.2 on June 18, 2026. PayNote ships day-one support for both new features.</p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: text, marginBottom: '8px' }}>Transaction Memos</p>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '12px' }}>Payment reasons now attach directly to the transaction onchain. Receipts are fully verifiable on ArcScan without trusting PayNote's database — the blockchain records not just the amount and addresses, but why the money moved.</p>
            <Code dark={dark}>{"// Memo contract (Arc v0.7.2)\n0x9702000000000000000000000000000000000000\n\n// PayNote attaches memo automatically on every payment\n// Format: \"PayNote:{slug} - {amount} {token}\""}</Code>
            <p style={{ fontSize: '15px', fontWeight: 700, color: text, marginBottom: '8px', marginTop: '20px' }}>Batch Transactions (Multicall3From)</p>
            <p style={{ color: muted, lineHeight: 1.7, marginBottom: '12px' }}>Multiple calls execute in one transaction. Approve + transfer now happens in a single confirmation instead of two. Dramatically simpler payer UX.</p>
            <Code dark={dark}>{"// Multicall3From contract (Arc v0.7.2)\n0xEb7c000000000000000000000000000000000000\n\n// Batches subcalls while retaining original msg.sender\n// Enables approve + transfer in one transaction"}</Code>
          </Section>

          {/* CONTRACTS */}
          <Section id="contracts" title="Deployed Contracts" badge="On-Chain" badgeColor="#16a34a" text={text} border={border}>
            {[
              { name: 'PayNoteRouter', addr: '0x829fe116E221d14Db289623028c5AC6b2F30BD82', desc: 'Native USDC transfers' },
              { name: 'PayNoteRouterV2', addr: '0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4', desc: 'ERC-20 multi-asset, split payments, token whitelist' },
            ].map(c => (
              <div key={c.name} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 900, fontSize: '15px', color: text }}>{c.name}</span>
                  <a href={`https://testnet.arcscan.app/address/${c.addr}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#1A44C4', textDecoration: 'none' }}>View on ArcScan →</a>
                </div>
                <code style={{ fontSize: '12px', color: muted, display: 'block', marginBottom: '4px' }}>{c.addr}</code>
                <p style={{ fontSize: '12px', color: muted }}>{c.desc}</p>
              </div>
            ))}
            <p style={{ fontSize: '13px', fontWeight: 700, color: text, marginTop: '16px', marginBottom: '8px' }}>Arc v0.7.2 Extensions</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { name: 'Memo', addr: '0x9702...0000' },
                { name: 'Multicall3From', addr: '0xEb7c...0000' },
                { name: 'Multicall3', addr: '0xcA11...CA11' },
                { name: 'Permit2', addr: '0x0000...BA3' },
              ].map(c => (
                <div key={c.name} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: text }}>{c.name}</p>
                  <code style={{ fontSize: '11px', color: muted }}>{c.addr}</code>
                </div>
              ))}
            </div>
          </Section>

          {/* TOKENS */}
          <Section id="tokens" title="Supported Tokens" badge="Assets" badgeColor="#1A44C4" text={text} border={border}>
            <div style={{ borderRadius: '12px', border: `1px solid ${border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: dark ? '#1e2a3a' : '#f1f5f9' }}>
                    {['Token', 'Contract', 'Decimals', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: muted }}>{h}</th>
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
                    <tr key={row.token} style={{ background: i % 2 === 0 ? card : inputBg }}>
                      <td style={{ padding: '10px 14px', fontWeight: 900, color: text }}>{row.token}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px', color: muted }}>{row.addr}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: muted }}>{row.dec}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: row.color, background: row.color + '20', padding: '2px 8px', borderRadius: '20px' }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div style={{ height: '80px' }} />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          aside { display: ${mobileNav ? 'block' : 'none'}; position: fixed; top: 60px; left: 0; right: 0; height: auto; z-index: 40; border-right: none; border-bottom: 1px solid ${border}; }
          main { padding: 24px 20px !important; }
        }
        button:hover { opacity: 0.8; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        pre { white-space: pre-wrap; word-break: break-all; }
      `}</style>
    </div>
  )
}

function Section({ id, title, badge, badgeColor, children, text, border }: { id: string; title: string; badge: string; badgeColor: string; children: React.ReactNode; text: string; border: string }) {
  return (
    <div id={id} style={{ marginBottom: '64px', scrollMarginTop: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${border}` }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: text }}>{title}</h2>
        <span style={{ fontSize: '11px', fontWeight: 900, color: badgeColor, background: badgeColor + '18', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{badge}</span>
      </div>
      {children}
    </div>
  )
}

function Step({ n, title, children, muted, text }: { n: string; title: string; children: React.ReactNode; muted: string; text: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1A44C4', color: '#fff', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: text }}>{title}</span>
      </div>
      <div style={{ marginLeft: '34px' }}>{children}</div>
    </div>
  )
}

function Code({ children, dark }: { children: string; dark: boolean }) {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #1e2a3a' }}>
      <div style={{ display: 'flex', gap: '6px', padding: '10px 16px', borderBottom: '1px solid #1e2a3a', background: '#0d1117' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.6 }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', opacity: 0.6 }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', opacity: 0.6 }} />
      </div>
      <pre style={{ background: '#0d1117', color: '#94a3b8', padding: '16px', fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto' }}>{children}</pre>
    </div>
  )
}

function InfoBox({ children, dark, color = 'slate' }: { children: React.ReactNode; dark: boolean; color?: string }) {
  const isBlue = color === 'blue'
  return (
    <div style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: isBlue ? '#1A44C418' : (dark ? '#1e2a3a40' : '#f1f5f980'), border: `1px solid ${isBlue ? '#1A44C430' : (dark ? '#1e2a3a' : '#e2e8f0')}`, marginBottom: '12px', marginTop: '4px' }}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: isBlue ? '#1A44C4' : '#64748b', flexShrink: 0, marginTop: '1px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

function Mono({ children }: { children: string }) {
  return <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#1A44C4', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px' }}>{children}</code>
}

function ParamTable({ params, dark, border, muted, text }: { params: { name: string; type: string; required: boolean; desc: string }[]; dark: boolean; border: string; muted: string; text: string }) {
  return (
    <div style={{ borderRadius: '12px', border: `1px solid ${border}`, overflow: 'hidden', marginTop: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: dark ? '#1e2a3a' : '#f1f5f9' }}>
            {['Parameter', 'Type', 'Required', 'Description'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: muted }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.name} style={{ background: i % 2 === 0 ? (dark ? '#111827' : '#ffffff') : (dark ? '#0d1321' : '#f8fafc') }}>
              <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#1A44C4', fontSize: '12px' }}>{p.name}</td>
              <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: muted, fontSize: '12px' }}>{p.type}</td>
              <td style={{ padding: '9px 12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: p.required ? '#1A44C4' : muted, background: p.required ? '#1A44C420' : (dark ? '#1e2a3a' : '#f1f5f9'), padding: '2px 8px', borderRadius: '20px' }}>{p.required ? 'Required' : 'Optional'}</span>
              </td>
              <td style={{ padding: '9px 12px', color: muted }}>{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
