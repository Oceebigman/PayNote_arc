'use client'

import { useState, useEffect, useRef } from 'react'
import { LANGUAGES, type Lang } from '@/lib/i18n'

export const LANG_KEY = 'paynote-lang'

interface Props {
  lang: Lang
  onChange: (lang: Lang) => void
}

export default function LangSelector({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all hover:opacity-70"
        style={{borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--card)'}}>
        <span className="uppercase">{lang}</span>
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50"
          style={{background: 'var(--card)', borderColor: 'var(--border)', minWidth: '160px', maxHeight: '320px', overflowY: 'auto'}}>
          {(Object.entries(LANGUAGES) as [Lang, string][]).map(([code, name]) => (
            <button
              key={code}
              onClick={() => { onChange(code); setOpen(false) }}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-all hover:opacity-70"
              style={{
                color: code === lang ? '#1A44C4' : 'var(--muted)',
                background: code === lang ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#0d1a3a' : '#EFF6FF') : 'transparent',
              }}>
              <span>{name}</span>
              <span className="text-xs font-black uppercase opacity-50">{code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
