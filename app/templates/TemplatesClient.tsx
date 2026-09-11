'use client'

import { useRouter } from 'next/navigation'
import SiteHeader from '@/app/components/SiteHeader'
import PennyBubble from '@/app/components/PennyBubble'
import SiteFooter from '@/app/components/SiteFooter'

interface Template {
  id: string
  title: string
  category: string
  default_amount: string
  note: string
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  freelance: { bg: 'bg-blue-50', text: 'text-blue-600' },
  retainer:  { bg: 'bg-purple-50', text: 'text-purple-600' },
  bounty:    { bg: 'bg-green-50', text: 'text-green-600' },
  expense:   { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  invoice:   { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export default function TemplatesClient({ templates }: { templates: Template[] }) {
  const router = useRouter()

  function useTemplate(t: Template) {
    const params = new URLSearchParams({
      amount: t.default_amount || '',
      note: t.note || '',
      reason: t.title,
    })
    router.push('/?' + params.toString())
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg)'}}>
      <SiteHeader badge="Templates" />
      <main className="flex-1 px-4 lg:px-8 py-12 max-w-2xl lg:max-w-4xl mx-auto w-full">

        <div className="fade-up flex items-center gap-3 mb-8">
          <div>
            <span className="font-semibold text-lg tracking-tight" style={{color:'var(--text)'}}>Payment Templates</span>
            <p className="text-xs" style={{color:'var(--muted)'}}>Start fast with a pre-filled request</p>
          </div>
          <button onClick={() => router.push('/')}
            className="ml-auto text-sm font-semibold text-white px-4 py-2 rounded-lg"
            style={{background: '#1A44C4'}}>
            + Custom
          </button>
        </div>

        <div className="fade-up-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {templates.map(t => {
            const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.invoice
            return (
              <div key={t.id} className="rounded-xl border p-5 flex items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer"
                style={{background:'var(--card)', borderColor:'var(--border)'}}
                onClick={() => useTemplate(t)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{color:'var(--text)'}}>{t.title}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{t.category}</span>
                  </div>
                  <p className="text-xs truncate" style={{color:'var(--muted)'}}>{t.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm" style={{color:'var(--text)'}}>{Number(t.default_amount).toFixed(2)}</p>
                  <p className="text-xs" style={{color:'var(--muted)'}}>USDC</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <SiteFooter />
      <PennyBubble />
    </div>
  )
}
