'use client'

import { useState, useEffect } from 'react'

const PAGES = [
  { href: '/', label: 'Home', desc: 'Create payment requests' },
  { href: '/templates', label: 'Templates', desc: 'Pre-filled payment templates' },
  { href: '/docs', label: 'API Docs', desc: 'Full API reference' },
  { href: '/build', label: 'Use the API', desc: 'Integration guide and use cases' },
  { href: '/status', label: 'Status', desc: 'Live system and Arc RPC health' },
  { href: '/api-spec', label: 'OpenAPI Spec', desc: 'Machine-readable API spec' },
  { href: '/history', label: 'History', desc: 'All payment requests' },
  { href: '/admin', label: 'Admin', desc: 'Dashboard — private' },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [path, setPath] = useState('')

  useEffect(() => {
    setPath(window.location.pathname)
    const saved = localStorage.getItem('paynote-theme')
    setDark(saved === 'dark')
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as HTMLElement
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const bord = dark ? '#1e2a3a' : '#e2e8f0'
  const card = dark ? '#111827' : '#ffffff'
  const subtle = dark ? '#1a2535' : '#f1f5f9'
  const muted = dark ? '#475569' : '#64748b'
  const main = dark ? '#f1f5f9' : '#0f172a'

  const rows = PAGES.map(function(page) {
    const active = path === page.href
    return {
      href: page.href,
      label: page.label,
      desc: page.desc,
      active: active,
      bg: active ? (dark ? '#0d1a3a' : '#EFF6FF') : 'transparent',
      color: active ? '#1A44C4' : main,
    }
  })

  return (
    <div id="pn-sitenav" style={{ position: 'relative', zIndex: 100 }}>
      <button
        style={{ padding: '10px', borderRadius: '12px', border: '1px solid ' + bord, background: subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Menu">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: muted }}>
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: card, border: '1px solid ' + bord, borderRadius: '16px', minWidth: '240px', boxShadow: dark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(15,23,42,0.12)', overflow: 'hidden', zIndex: 1000 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + bord }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: muted }}>PayNote</p>
          </div>
          {rows.map(function(row) {
            return (
              <a key={row.href} href={row.href} onClick={() => setOpen(false)} style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', borderBottom: '1px solid ' + bord, background: row.bg, textDecoration: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: row.color }}>{row.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px', color: muted }}>{row.desc}</span>
              </a>
            )
          })}
          <div style={{ padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: muted }}>Personal history: /my/0xYourAddress</p>
          </div>
        </div>
      )}
    </div>
  )
}
