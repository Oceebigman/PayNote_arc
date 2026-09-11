// Shared footer used on every page — same rationale as SiteHeader: one
// real footer instead of each page hand-rolling its own one-line strip.

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '/', label: 'Create a request' },
      { href: '/templates', label: 'Templates' },
      { href: '/build', label: 'Use the API' },
      { href: '/status', label: 'Status' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { href: '/docs', label: 'API Docs' },
      { href: '/api-spec', label: 'OpenAPI Spec' },
      { href: '/history', label: 'Payment History' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/support', label: 'Ask Penny' },
      { href: 'mailto:ikeocee@gmail.com', label: 'Email' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t" style={{borderColor:'var(--border)', background:'var(--nav-bg)'}}>
      <div className="max-w-5xl mx-auto px-5 sm:px-10 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="#1A44C4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="font-bold text-[15px] tracking-tight" style={{color:'var(--text)'}}>PayNote</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[220px]" style={{color:'var(--muted)'}}>
              Non-custodial payment infrastructure for people and AI agents, built on Arc.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{color:'var(--muted)'}}>{col.heading}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <a key={link.href} href={link.href} className="text-sm hover:opacity-70 w-fit" style={{color:'var(--text)'}}>{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{borderColor:'var(--border)'}}>
          <p className="text-sm" style={{color:'var(--muted)'}}>
            &copy; {new Date().getFullYear()} PayNote · Built on{' '}
            <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{color:'#1A44C4'}}>Arc</a>
          </p>
          <p className="text-xs" style={{color:'var(--muted)'}}>
            USDC · EURC · cirBTC — non-custodial, verified on-chain
          </p>
        </div>
      </div>
    </footer>
  )
}
