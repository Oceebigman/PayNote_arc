'use client'

import { useEffect, useState } from 'react'
import SiteHeader from '@/app/components/SiteHeader'
import SiteFooter from '@/app/components/SiteFooter'

export default function BuildPage() {
  const appUrl = 'https://paynote.space'
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    setDark(saved === 'dark')
    setMounted(true)
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const bg = dark ? '#080c14' : '#f4f6fb'
  const card = dark ? '#111827' : '#ffffff'
  const border = dark ? '#1e2a3a' : '#e2e8f0'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#475569' : '#64748b'
  const inputBg = dark ? '#0d1321' : '#f8fafc'

  const useCases = [
    { title: 'Freelance invoicing', desc: 'Generate a payment request per invoice. Share the link. Get paid in USDC. Receipt auto-generated on settlement.', tag: 'Payments' },
    { title: 'DAO contributor payouts', desc: 'Create a unique payment link per contributor. Each clicks their link, connects wallet, gets paid. No bulk transfer risk.', tag: 'Payments' },
    { title: 'Hackathon bounties', desc: 'Post a PayNote link alongside each bounty. Winner opens it, pays themselves instantly. Verified on Arc.', tag: 'Payments' },
    { title: 'AI agent billing', desc: 'Agent calls POST /api/agent/pay, gets back a link and x402 endpoint. Payer agent pays automatically via EIP-3009. No human.', tag: 'Agentic' },
    { title: 'Agent task settlement', desc: 'Agent completes a task. Creates a PayNote request. Registers a webhook. Gets notified on settlement. Continues workflow.', tag: 'Agentic' },
    { title: 'Subscription billing', desc: 'Create recurring monthly payment intents. Webhook fires on each completion. Your system reacts automatically.', tag: 'Recurring' },
    { title: 'E-commerce checkout', desc: 'Embed the PayNote widget on any product page. One script tag. Payer connects wallet and pays — without leaving your site.', tag: 'Widget' },
    { title: 'Cross-border payroll', desc: 'Pay remote workers in USDC via API. No bank. No conversion. No delay. One API call per payment.', tag: 'Payments' },
  ]

  const TAG_COLORS: Record<string, { bg: string; color: string }> = {
    Payments:  { bg: '#1A44C420', color: '#1A44C4' },
    Agentic:   { bg: '#7c3aed20', color: '#7c3aed' },
    Recurring: { bg: '#16a34a20', color: '#16a34a' },
    Widget:    { bg: '#d9770620', color: '#d97706' },
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen transition-colors duration-300" style={{background: bg, color: text, fontFamily: '"Inter", system-ui, sans-serif'}}>
      <SiteHeader badge="Use the API" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border mb-8 uppercase tracking-widest" style={{borderColor: border, color: muted, background: card}}>
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
            Open API · No account needed
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight tracking-tight" style={{color: text}}>
            Use the<br/>
            <span style={{background: 'linear-gradient(135deg, #4A154B, #1A44C4, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>PayNote API.</span>
          </h1>
          <p className="text-xl font-medium mb-4 max-w-2xl mx-auto" style={{color: muted}}>
            PayNote is payment coordination infrastructure. You call our API — we handle the request, wallet connection, on-chain verification, receipt, and webhook. You get the result.
          </p>
          <p className="text-base font-medium mb-10 max-w-xl mx-auto" style={{color: muted}}>
            Don't build payment request infrastructure from scratch. One endpoint. Everything included.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/docs#auth" className="w-full sm:w-auto text-white font-black px-10 py-4 rounded-2xl text-base transition-all hover:opacity-90" style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)', boxShadow: '0 8px 30px rgba(26,68,196,0.35)'}}>
              Get your API key →
            </a>
            <a href="/docs" className="w-full sm:w-auto font-bold px-8 py-4 rounded-2xl text-base border-2 text-center transition-all hover:opacity-70" style={{borderColor: border, color: text}}>
              Read the docs
            </a>
          </div>
        </div>

        {/* Quick start */}
        <div className="rounded-3xl border overflow-hidden mb-16" style={{borderColor: border, background: card}}>
          <div className="px-6 py-5 border-b" style={{borderColor: border, background: 'linear-gradient(135deg, #0B194F, #1A44C4)'}}>
            <p className="text-white font-black text-xl">Three lines. Payment request live.</p>
            <p className="text-blue-200 text-base mt-1 font-medium">Install the SDK and create your first request.</p>
          </div>
          <div style={{background: '#0d1117'}}>
            <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto" style={{color: '#94a3b8'}}>{`import PayNote from '@egcrypt/paynote-sdk'

const sdk = new PayNote()

const request = await sdk.createRequest({
  amount: 50,
  reason: 'Freelance invoice #003',
  toAddress: '0xYourWalletAddress',
  token: 'USDC',
})

console.log(request.url)
// https://paynote.space/r/abc12345
// Share this. Payer clicks. Pays. Done.`}</pre>
          </div>
        </div>

        {/* Use cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-black mb-3" style={{color: text}}>What others are calling our API for</h2>
          <p className="text-lg font-medium mb-8" style={{color: muted}}>Real use cases. Each one is a few API calls.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCases.map(u => {
              const tc = TAG_COLORS[u.tag] || TAG_COLORS.Payments
              return (
                <div key={u.title} className="rounded-2xl border p-6 transition-all hover:border-blue-400 hover:-translate-y-0.5" style={{borderColor: border, background: card}}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background: tc.bg, color: tc.color}}>{u.tag}</span>
                  </div>
                  <p className="font-black text-base mb-2" style={{color: text}}>{u.title}</p>
                  <p className="text-sm font-medium leading-relaxed" style={{color: muted}}>{u.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'API Reference', desc: 'Every endpoint, parameter, and response format. Including x402 and ERC-8183.', href: '/docs', cta: 'Read docs →', internal: true },
            { title: 'npm SDK', desc: 'TypeScript SDK — createRequest, getStatus, waitForPayment, registerWebhook.', href: 'https://www.npmjs.com/package/@egcrypt/paynote-sdk', cta: 'View on npm →', internal: false },
            { title: 'Arc Network', desc: 'The stablecoin L1 PayNote runs on. Sub-second finality. USDC as gas.', href: 'https://arc.network', cta: 'Visit Arc →', internal: false },
          ].map(r => (
            <div key={r.title} className="rounded-2xl border p-5 transition-all hover:border-blue-400" style={{borderColor: border, background: card}}>
              <p className="font-black text-base mb-2" style={{color: text}}>{r.title}</p>
              <p className="text-sm font-medium mb-4 leading-relaxed" style={{color: muted}}>{r.desc}</p>
              <a href={r.href} target={r.internal ? undefined : '_blank'} rel="noopener noreferrer"
                className="text-sm font-black hover:opacity-70 transition-opacity" style={{color: '#1A44C4'}}>{r.cta}</a>
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
