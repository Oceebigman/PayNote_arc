'use client'

import { useState } from 'react'

// A small, functional presence — not a decorative mascot. Fixed corner
// button that gently breathes to signal it's alive/interactive, expands to
// a one-line label on hover, and goes straight to Ask Penny. Deliberately
// restrained (icon + motion, no illustrated character) to fit the site's
// existing tone rather than pull it toward a playful consumer-brand look.
export default function PennyBubble() {
  const [hover, setHover] = useState(false)

  return (
    <a
      href="/support"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full pl-3 pr-3 py-3 transition-all duration-300 hover:pr-4"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      aria-label="Ask Penny for help"
    >
      <span className="relative flex items-center justify-center shrink-0" style={{ width: 32, height: 32 }}>
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: '#1A44C4', opacity: 0.3, animation: 'penny-pulse 2.4s ease-in-out infinite' }}
        />
        {/* Vector likeness: cap + headphones + glasses + beard — the
            recognizable features of PayNote's character, simplified to
            read clearly at small size (no source image file was available
            to use directly). */}
        <svg width="32" height="32" viewBox="0 0 32 32" className="relative" style={{ animation: 'penny-bob 3s ease-in-out infinite' }}>
          <circle cx="16" cy="16" r="16" fill="#4a3527" />
          {/* headphone band + ear cups */}
          <path d="M6 15 A10 9 0 0 1 26 15" stroke="#111" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="6" cy="17" r="2.6" fill="#111" />
          <circle cx="26" cy="17" r="2.6" fill="#111" />
          {/* cap */}
          <path d="M5 11 Q5 1 16 1 Q27 1 27 11 Q27 8 16 8 Q5 8 5 11 Z" fill="#0a0a0a" />
          <ellipse cx="16" cy="10.5" rx="11.5" ry="2" fill="#0a0a0a" />
          {/* glasses */}
          <circle cx="11.5" cy="18" r="3" fill="none" stroke="#f1f5f9" strokeWidth="1.2" />
          <circle cx="20.5" cy="18" r="3" fill="none" stroke="#f1f5f9" strokeWidth="1.2" />
          <line x1="14.5" y1="18" x2="17.5" y2="18" stroke="#f1f5f9" strokeWidth="1.2" />
          {/* beard */}
          <path d="M9.5 21 Q16 29 22.5 21 Q22.5 26 16 28 Q9.5 26 9.5 21 Z" fill="#050505" />
        </svg>
      </span>
      <span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300"
        style={{ color: 'var(--text)', maxWidth: hover ? '120px' : '0px', opacity: hover ? 1 : 0 }}
      >
        Ask Penny
      </span>
    </a>
  )
}
