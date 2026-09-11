'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const MORE_LINKS = [
  { href: '/build',     label: 'Use the API',  desc: 'Integration guide and use cases' },
  { href: '/status',    label: 'Status',       desc: 'Live system and Arc RPC health' },
  { href: '/api-spec',  label: 'OpenAPI Spec', desc: 'Machine-readable API spec' },
  { href: '/history',   label: 'History',      desc: 'All payment requests' },
]

const PRIMARY_LINKS = [
  { href: '/templates', label: 'Templates' },
  { href: '/docs',      label: 'Docs' },
  { href: '/support',   label: 'Ask Penny' },
]

interface SiteHeaderProps {
  /** Small label shown next to the logo, e.g. "Status", "Docs". Hidden below sm to save space. */
  badge?: string
  /** Called instead of navigating when the CTA is clicked (used on the homepage to open the inline form). */
  onCtaClick?: () => void
  /** Extra site-wide control (self-labeling, e.g. the language selector) rendered before the theme toggle on desktop and inside the menu on mobile. Not for page-specific controls like a docs TOC toggle — those belong in the page itself, not here. */
  extra?: ReactNode
}

// Single shared nav used on every page. Two real layouts, not one layout
// with bits hidden: a full inline bar at lg+ (1024px), and a logo + compact
// CTA + single menu button below that — the "squeeze everything into one
// row and hide/wrap what doesn't fit" approach is what broke on mobile
// before (the CTA's own text wrapped into 3 lines).
export default function SiteHeader({ badge, onCtaClick, extra }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('paynote-theme')
    setDark(saved === 'dark')
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node
      const insideDesktop = desktopMenuRef.current?.contains(target)
      const insideMobile = mobileMenuRef.current?.contains(target)
      if (!insideDesktop && !insideMobile) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    localStorage.setItem('paynote-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.style.colorScheme = next
    setDark(!dark)
  }

  const ThemeIcon = () => (
    dark ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    )
  )

  return (
    <nav className="sticky top-0 z-50 h-[60px] px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 border-b backdrop-blur-xl" style={{borderColor:'var(--border)',background:'var(--nav-bg)'}}>
      {/* min-w-0 on every level here is deliberate: if anything ever makes
          this row too tight, the wordmark truncates first — the CTA and
          menu on the right must never be the thing that gets pushed
          off-screen. */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <a href="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <svg width="18" height="18" viewBox="0 0 36 36" fill="none" className="sm:w-[22px] sm:h-[22px] shrink-0">
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="#1A44C4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="font-bold text-[14px] sm:text-[17px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0" style={{color:'var(--text)'}}>PayNote</span>
        </a>
        {badge && (
          <span className="hidden sm:inline-block shrink-0 text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md whitespace-nowrap" style={{background:'var(--subtle)',color:'var(--muted)'}}>{badge}</span>
        )}
      </div>

      {/* Full inline nav — only when there's comfortably enough room */}
      <div className="hidden lg:flex items-center gap-1">
        {PRIMARY_LINKS.map(link => (
          <a key={link.href} href={link.href} className="text-sm font-medium px-3 py-2 rounded-lg hover:opacity-70 whitespace-nowrap" style={{color:'var(--muted)'}}>{link.label}</a>
        ))}
        <div ref={desktopMenuRef} className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-sm font-medium px-3 py-2 rounded-lg hover:opacity-70 flex items-center gap-1 whitespace-nowrap"
            style={{color:'var(--muted)'}}
            aria-label="More pages"
          >
            More
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[100] rounded-xl border overflow-hidden" style={{minWidth:'220px', background:'var(--card)', borderColor:'var(--border)', boxShadow:'var(--shadow)'}}>
              {MORE_LINKS.map((link, i) => (
                <a key={link.href} href={link.href} onClick={()=>setMenuOpen(false)}
                  className="flex flex-col px-4 py-3 hover:opacity-80"
                  style={{borderTop: i===0 ? 'none' : '1px solid var(--border)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{link.label}</span>
                  <span className="text-xs mt-0.5" style={{color:'var(--muted)'}}>{link.desc}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {extra}
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:opacity-70" style={{color:'var(--muted)'}} aria-label="Toggle theme">
          <ThemeIcon/>
        </button>
      </div>

      {/* Compact controls — below lg: everything lives in one menu */}
      <div className="flex lg:hidden items-center gap-1 shrink-0">
        <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:opacity-70 shrink-0" style={{color:'var(--muted)'}} aria-label="Toggle theme">
          <ThemeIcon/>
        </button>
        <div ref={mobileMenuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 rounded-lg border hover:opacity-70 flex items-center justify-center"
            style={{color:'var(--muted)', borderColor:'var(--border)', background:'var(--subtle)'}}
            aria-label="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[100] rounded-xl border" style={{width:'240px', background:'var(--card)', borderColor:'var(--border)', boxShadow:'var(--shadow)'}}>
              {/* Only the link list clips to the rounded corners — extra (e.g.
                  the language selector) sits outside this so its own popup
                  isn't cut off by overflow-hidden here. */}
              <div className="rounded-xl overflow-hidden">
                {PRIMARY_LINKS.map((link, i) => (
                  <a key={link.href} href={link.href} onClick={()=>setMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold hover:opacity-80"
                    style={{color:'var(--text)', borderTop: i===0 ? 'none' : '1px solid var(--border)'}}>
                    {link.label}
                  </a>
                ))}
                {MORE_LINKS.map(link => (
                  <a key={link.href} href={link.href} onClick={()=>setMenuOpen(false)}
                    className="flex flex-col px-4 py-3 hover:opacity-80"
                    style={{borderTop: '1px solid var(--border)'}}>
                    <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{link.label}</span>
                    <span className="text-xs mt-0.5" style={{color:'var(--muted)'}}>{link.desc}</span>
                  </a>
                ))}
              </div>
              {extra && (
                <div className="px-4 py-3" style={{borderTop:'1px solid var(--border)'}}>
                  {extra}
                </div>
              )}
            </div>
          )}
        </div>
        {onCtaClick ? (
          <button onClick={onCtaClick} className="text-[13px] font-semibold text-white px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0" style={{background:'#1A44C4'}}>
            Create
          </button>
        ) : (
          <a href="/" className="text-[13px] font-semibold text-white px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0" style={{background:'#1A44C4'}}>
            Create
          </a>
        )}
      </div>

      {/* CTA — desktop only, full label */}
      {onCtaClick ? (
        <button onClick={onCtaClick} className="hidden lg:block text-sm font-semibold text-white px-4 py-2 rounded-lg whitespace-nowrap" style={{background:'#1A44C4'}}>
          Create payment request
        </button>
      ) : (
        <a href="/" className="hidden lg:block text-sm font-semibold text-white px-4 py-2 rounded-lg whitespace-nowrap" style={{background:'#1A44C4'}}>
          Create payment request
        </a>
      )}
    </nav>
  )
}
