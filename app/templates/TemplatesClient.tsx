'use client'

import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen flex flex-col" style={{background: '#F4F5F7'}}>
      <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">

        <div className="flex items-center gap-3 mb-8">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="pgt" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A154B"/>
                <stop offset="100%" stopColor="#1A44C4"/>
              </linearGradient>
            </defs>
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgt)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900">Payment Templates</span>
            <p className="text-xs text-gray-400">Start fast with a pre-filled request</p>
          </div>
          <button onClick={() => router.push('/')}
            className="ml-auto text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{background: 'linear-gradient(135deg, #102A83, #1A44C4)'}}>
            + Custom
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {templates.map(t => {
            const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.invoice
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => useTemplate(t)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{t.title}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{t.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{t.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{Number(t.default_amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">USDC</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="py-4 border-t border-gray-200 bg-white">
        <p className="text-center text-xs text-gray-300">
          PayNote · Powered by <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-medium" style={{color: '#1A44C4'}}>Arc</a>
        </p>
      </footer>
    </div>
  )
}
