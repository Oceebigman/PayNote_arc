'use client'

import { useEffect, useRef, useState } from 'react'
import SiteHeader from '@/app/components/SiteHeader'

interface Message {
  role: 'user' | 'penny'
  content: string
  escalated?: boolean
}

const SUGGESTED = [
  'How do I get an API key?',
  'How do I create a payment request?',
  'What tokens do you support?',
  'How do webhooks work?',
  'What is x402?',
  'How do I verify a payment?',
]

export default function SupportPage() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'penny',
      content:
        "Hi, I'm Penny — PayNote's support assistant. Ask me anything about " +
        "the API, webhooks, tokens, or how payments work. If your question " +
        "needs a real person, I'll point you to email.",
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const bg = dark ? '#080c14' : '#f4f6fb'
  const card = dark ? '#111827' : '#ffffff'
  const border = dark ? '#1e2a3a' : '#e2e8f0'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#94a3b8' : '#64748b'
  const inputBg = dark ? '#0d1321' : '#f8fafc'
  const userBubble = dark ? '#1e293b' : '#e0e7ff'
  const pennyBubble = dark ? '#0f172a' : '#f1f5f9'
  const escalateBubble = dark ? '#3f1d1d' : '#fef2f2'
  const escalateBorder = dark ? '#7f1d1d' : '#fecaca'

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setMessages(m => [...m, { role: 'user', content: trimmed }])
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = (await res.json()) as any
      if (!res.ok) throw new Error(data.error || 'Server error')
      setMessages(m => [...m, { role: 'penny', content: data.response, escalated: !!data.escalated }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(m => [...m, {
        role: 'penny',
        content: `I couldn't reach the server (${msg}). Try again, or email ikeocee@gmail.com directly.`,
      }])
    } finally {
      setSending(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SiteHeader badge="Support" />

      {/* main */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Ask Penny</h1>
          <p style={{ color: muted, fontSize: '14px', margin: 0 }}>PayNote's support assistant — API keys, payments, webhooks, tokens. If it's something serious, she'll point you to a human.</p>
        </div>

        {/* messages */}
        <div ref={scrollRef} style={{ background: card, border: '1px solid ' + border, borderRadius: '16px', padding: '20px', minHeight: '360px', maxHeight: '520px', overflowY: 'auto', marginBottom: '16px' }}>
          {messages.map(function (m, i) {
            const isUser = m.role === 'user'
            const isEscalate = m.escalated
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '14px' }}>
                <div style={{
                  maxWidth: '85%',
                  background: isEscalate ? escalateBubble : (isUser ? userBubble : pennyBubble),
                  border: isEscalate ? '1px solid ' + escalateBorder : '1px solid transparent',
                  color: text,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '14.5px',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {!isUser && (
                    <div style={{ fontSize: '11px', fontWeight: 700, color: muted, marginBottom: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {isEscalate ? 'Penny · escalated' : 'Penny'}
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            )
          })}
          {sending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ color: muted, fontSize: '13px', padding: '4px 0' }}>Penny is thinking…</div>
            </div>
          )}
        </div>

        {/* suggested chips */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {SUGGESTED.map(function (s) {
              return (
                <button
                  key={s}
                  onClick={function () { send(s) }}
                  disabled={sending}
                  style={{
                    background: card,
                    border: '1px solid ' + border,
                    color: text,
                    padding: '8px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    cursor: sending ? 'default' : 'pointer',
                    opacity: sending ? 0.5 : 1,
                  }}
                >{s}</button>
              )
            })}
          </div>
        )}

        {/* input */}
        <div style={{ display: 'flex', gap: '8px', background: card, border: '1px solid ' + border, borderRadius: '14px', padding: '8px 8px 8px 16px' }}>
          <input
            value={input}
            onChange={function (e) { setInput(e.target.value) }}
            onKeyDown={function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            disabled={sending}
            placeholder="Ask about API keys, payments, webhooks…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: text,
              fontSize: '14.5px',
              padding: '8px 4px',
            }}
          />
          <button
            onClick={function () { send(input) }}
            disabled={sending || !input.trim()}
            style={{
              background: (!input.trim() || sending) ? inputBg : 'linear-gradient(135deg, #1A44C4, #4A154B)',
              color: (!input.trim() || sending) ? muted : '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!input.trim() || sending) ? 'default' : 'pointer',
            }}
          >Send</button>
        </div>

        <p style={{ textAlign: 'center', color: muted, fontSize: '12px', marginTop: '20px' }}>
          For anything Penny can't answer, email{' '}
          <a href="mailto:ikeocee@gmail.com" style={{ color: text, textDecoration: 'underline' }}>ikeocee@gmail.com</a>
        </p>
      </main>
    </div>
  )
}
