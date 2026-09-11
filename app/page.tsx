'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/app/components/SiteHeader'
import NetworkBackground from '@/app/components/NetworkBackground'
import LangSelector, { LANG_KEY } from '@/app/components/LangSelector'
import { t, type Lang } from '@/lib/i18n'

const ASSETS: Record<string, { address: string; decimals: number; symbol: string; available: boolean }> = {
  USDC:   { address: '0x3600000000000000000000000000000000000000', decimals: 6,  symbol: 'USDC',   available: true  },
  EURC:   { address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6,  symbol: 'EURC',   available: true  },
  cirBTC: { address: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF', decimals: 8,  symbol: 'cirBTC', available: true  },
  USYC:   { address: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C', decimals: 6,  symbol: 'USYC',   available: false },
  QCAD:   { address: '',                                             decimals: 6,  symbol: 'QCAD',   available: false },
}

function isValidAddress(a: string) { return /^0x[0-9a-fA-F]{40}$/.test(a) }
interface FieldError { amount?: string; reason?: string; to_address?: string }

export default function Home() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [values, setValues] = useState({ amount: '', reason: '', note: '', to_address: '', expires_in: '', recurring: 'once', display_name: '' })
  const [token, setToken] = useState<'USDC'|'EURC'|'cirBTC'|'USYC'|'QCAD'>('USDC')
  const [showForm, setShowForm] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('paynote-theme')
    setDark(savedTheme === 'dark')
    const savedLang = localStorage.getItem(LANG_KEY) as Lang
    if (savedLang && ['en','fr','es','pt'].includes(savedLang)) setLang(savedLang)

    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const params = new URLSearchParams(window.location.search)
    if (params.get('amount') || params.get('reason')) {
      setValues(v => ({ ...v, amount: params.get('amount') || v.amount, reason: params.get('reason') || v.reason, note: params.get('note') || v.note }))
      setShowForm(true)
    }
    return () => observer.disconnect()
  }, [])

  function handleLangChange(l: Lang) {
    setLang(l)
    localStorage.setItem(LANG_KEY, l)
  }

  function scrollToForm() {
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  function validate(): FieldError {
    const errs: FieldError = {}
    const n = parseFloat(values.amount)
    if (isNaN(n) || n <= 0) errs.amount = t(lang, 'err_amount')
    if (values.reason.trim().length < 3) errs.reason = t(lang, 'err_reason')
    if (!isValidAddress(values.to_address)) errs.to_address = t(lang, 'err_address')
    return errs
  }
  const errors = validate()

  function handleBlur(f: string) { setTouched(p => ({ ...p, [f]: true })) }
  function handleChange(f: string, v: string) { setValues(p => ({ ...p, [f]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ amount: true, reason: true, to_address: true })
    if (Object.keys(errors).length > 0) return
    setServerError(''); setLoading(true)
    try {
      const res = await fetch('/api/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, token, expires_in: values.expires_in ? Number(values.expires_in) : undefined, recurring: values.recurring !== 'once' ? values.recurring : undefined }),
      })
      const data = (await res.json()) as any
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      router.push('/confirm/' + data.slug)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error')
      setLoading(false)
    }
  }

  function fieldState(f: keyof FieldError) {
    if (touched[f] && errors[f]) return 'error'
    if (touched[f] && !errors[f] && values[f as keyof typeof values]) return 'ok'
    return 'idle'
  }

  function inputClass(field: keyof FieldError, extra = '') {
    const state = fieldState(field)
    const base = `w-full rounded-2xl px-5 py-4 text-base border outline-none transition-all font-medium ${extra}`
    if (state === 'error') return base + ' border-red-500 ring-2 ring-red-500/20'
    if (state === 'ok')    return base + ' border-green-500 ring-2 ring-green-500/20'
    return base + ' border-[var(--border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300" style={{background: 'var(--bg)', color: 'var(--text)'}}>

      <SiteHeader onCtaClick={scrollToForm} extra={<LangSelector lang={lang} onChange={handleLangChange}/>} />

      {!showForm ? (
        <main className="flex-1 flex flex-col px-5 sm:px-10 py-20 sm:py-28 max-w-3xl mx-auto w-full relative z-10">
          <div className="mb-24 relative overflow-hidden -mx-5 sm:-mx-10 px-5 sm:px-10">
            <NetworkBackground />
            <div className="fade-up-1 relative inline-flex items-center gap-2 text-xs font-semibold mb-8" style={{color:'var(--muted)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              <span className="uppercase tracking-wide">Live on Arc Testnet</span>
            </div>

            <h1 className="fade-up-2 mb-6 leading-[1.08] tracking-tight" style={{fontSize:'clamp(2.1rem,4.6vw,3.1rem)',fontWeight:700,color:'var(--text)'}}>
              {t(lang,'hero_title')} {t(lang,'hero_sub1')}{' '}
              <span style={{color:'#1A44C4'}}>{t(lang,'hero_sub2')}</span>
            </h1>

            <p className="fade-up-3 mb-10 max-w-xl" style={{fontSize:'1.0625rem',lineHeight:'1.65',fontWeight:450,color:'var(--muted)'}}>
              {t(lang,'hero_desc')}
            </p>

            <div className="fade-up-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <button onClick={scrollToForm} className="btn-glow text-white font-semibold px-7 py-3.5 rounded-lg text-[15px]" style={{background:'#1A44C4'}}>
                {t(lang,'create_btn')}
              </button>
              <p className="text-sm font-medium" style={{color:'var(--muted)'}}>
                USDC · EURC · cirBTC · x402 · ERC-8183
              </p>
            </div>
          </div>

          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-wide mb-6" style={{color:'var(--muted)'}}>How it works</p>
            <div className="flex flex-col">
              {[
                {step:'01',title:t(lang,'step01'),desc:t(lang,'step01_desc')},
                {step:'02',title:t(lang,'step02'),desc:t(lang,'step02_desc')},
                {step:'03',title:t(lang,'step03'),desc:t(lang,'step03_desc')},
              ].map((item,i)=>(
                <div key={item.step} className="flex gap-5 py-5" style={{borderTop: i===0 ? 'none' : '1px solid var(--border)'}}>
                  <span className="shrink-0 pt-0.5 text-sm font-semibold" style={{color:'#1A44C4', fontFamily:'var(--font-mono)'}}>{item.step}</span>
                  <div>
                    <p className="font-semibold text-[15px] mb-1" style={{color:'var(--text)'}}>{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{color:'var(--muted)'}}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{background:'var(--card)',borderColor:'var(--border)'}}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                {label:t(lang,'trust1'),desc:t(lang,'trust1_desc')},
                {label:t(lang,'trust2'),desc:t(lang,'trust2_desc')},
                {label:t(lang,'trust3'),desc:t(lang,'trust3_desc')},
                {label:t(lang,'trust4'),desc:t(lang,'trust4_desc')},
              ].map(b=>(
                <div key={b.label}>
                  <p className="text-sm font-semibold mb-1" style={{color:'var(--text)'}}>{b.label}</p>
                  <p className="text-xs leading-snug" style={{color:'var(--muted)'}}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

      ) : (
        <main ref={formRef} className="flex-1 flex items-center justify-center px-5 py-10 relative z-10">
          <div className="w-full max-w-md">
            <div className="rounded-xl border overflow-hidden" style={{background:'var(--card)',borderColor:'var(--border)',boxShadow:'var(--shadow)'}}>
              <div className="px-6 py-5 border-b" style={{borderColor:'var(--border)'}}>
                <p className="font-semibold text-lg" style={{color:'var(--text)'}}>{t(lang,'form_title')}</p>
                <p className="text-sm mt-0.5" style={{color:'var(--muted)'}}>{t(lang,'form_sub')}</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2.5" style={{color:'var(--muted)'}}>{t(lang,'token_label')}</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Object.entries(ASSETS).map(([sym,asset])=>{
                        const disabled=!asset.available; const selected=token===sym
                        return (
                          <button key={sym} type="button" onClick={()=>{if(!disabled)setToken(sym as typeof token)}}
                            className="flex items-center justify-center py-2.5 rounded-lg border font-semibold text-xs transition-colors"
                            style={{borderColor:selected?'#1A44C4':'var(--border)',background:selected?(dark?'#0d1a3a':'#EFF6FF'):'var(--input-bg)',color:disabled?'var(--muted)':selected?'#1A44C4':'var(--muted)',opacity:disabled?0.4:1,cursor:disabled?'not-allowed':'pointer'}}>
                            {asset.symbol}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{t(lang,'amount_label')}</label>
                    <div className="relative">
                      <input type="number" step="0.000001" min="0.000001" placeholder="0.00"
                        value={values.amount} onChange={e=>handleChange('amount',e.target.value)} onBlur={()=>handleBlur('amount')}
                        className={inputClass('amount','pr-20')} style={{background:'var(--input-bg)',color:'var(--text)',fontFamily:'var(--font-mono)'}}/>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{color:'#1A44C4'}}>{token}</span>
                    </div>
                    {touched.amount&&errors.amount&&<p className="text-red-500 text-sm mt-1.5 font-medium">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{t(lang,'reason_label')}</label>
                    <input type="text" placeholder="e.g. Freelance invoice #003"
                      value={values.reason} onChange={e=>handleChange('reason',e.target.value)} onBlur={()=>handleBlur('reason')}
                      className={inputClass('reason')} style={{background:'var(--input-bg)',color:'var(--text)'}}/>
                    {touched.reason&&errors.reason&&<p className="text-red-500 text-sm mt-1.5 font-medium">{errors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{t(lang,'wallet_label')}</label>
                    <input type="text" placeholder="0x0000000000000000000000000000000000000000"
                      value={values.to_address} onChange={e=>handleChange('to_address',e.target.value)} onBlur={()=>handleBlur('to_address')}
                      className={inputClass('to_address','text-sm')} style={{background:'var(--input-bg)',color:'var(--text)',fontFamily:'var(--font-mono)'}}/>
                    {touched.to_address&&errors.to_address&&<p className="text-red-500 text-sm mt-1.5 font-medium">{errors.to_address}</p>}
                    {touched.to_address&&!errors.to_address&&values.to_address&&<p className="text-green-600 text-sm mt-1.5 font-medium">{t(lang,'valid_address')}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{t(lang,'type_label')}</label>
                    <select value={values.recurring} onChange={e=>handleChange('recurring',e.target.value)}
                      className="w-full rounded-lg px-4 py-3 text-[15px] border outline-none transition-colors font-medium"
                      style={{background:'var(--input-bg)',borderColor:'var(--border)',color:'var(--text)'}}>
                      {['once','daily','weekly','monthly','yearly'].map(v=>(
                        <option key={v} value={v}>{t(lang,v)}</option>
                      ))}
                    </select>
                  </div>

                  <button type="button" onClick={()=>setShowAdvanced(a=>!a)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide hover:opacity-70 self-start" style={{color:'var(--muted)'}}>
                    <svg className={`w-3 h-3 transition-transform ${showAdvanced?'rotate-90':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    {t(lang,showAdvanced?'hide':'show')} {t(lang,'advanced')}
                  </button>

                  {showAdvanced&&(
                    <div className="flex flex-col gap-4 p-4 rounded-lg border" style={{borderColor:'var(--border)',background:'var(--input-bg)'}}>
                      {[
                        {field:'display_name',label:t(lang,'name_label'),ph:'e.g. Acme Studio'},
                        {field:'note',label:t(lang,'note_label'),ph:'Add a message...'},
                      ].map(({field,label,ph})=>(
                        <div key={field}>
                          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{label}</label>
                          <input type="text" placeholder={ph} value={values[field as keyof typeof values]} onChange={e=>handleChange(field,e.target.value)}
                            className="w-full rounded-md px-3.5 py-2.5 text-sm border outline-none font-medium focus:border-blue-500"
                            style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--text)'}}/>
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{color:'var(--muted)'}}>{t(lang,'expires_label')}</label>
                        <select value={values.expires_in} onChange={e=>handleChange('expires_in',e.target.value)}
                          className="w-full rounded-md px-3.5 py-2.5 text-sm border outline-none font-medium"
                          style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--text)'}}>
                          <option value="">{t(lang,'no_expiry')}</option>
                          <option value="86400">24 hours</option>
                          <option value="172800">48 hours</option>
                          <option value="604800">7 days</option>
                          <option value="2592000">30 days</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {serverError&&<div className="rounded-lg px-4 py-3 border border-red-500/30 bg-red-500/10"><p className="text-red-500 text-sm font-medium">{serverError}</p></div>}

                  <button type="submit" disabled={loading} className="btn-glow w-full text-white font-semibold rounded-lg text-[15px] disabled:opacity-50"
                    style={{background:loading?'#6b7280':'#1A44C4',padding:'0.85rem',boxShadow:loading?'none':undefined}}>
                    {loading?t(lang,'creating'):t(lang,'generate_btn')}
                  </button>

                  <p className="text-center text-sm" style={{color:'var(--muted)'}}>
                    {t(lang,'no_account')}{' '}
                    <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{color:'#1A44C4'}}>faucet.circle.com</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="py-5 border-t relative z-10" style={{borderColor:'var(--border)',background:'var(--nav-bg)',backdropFilter:'blur(12px)'}}>
        <div className="max-w-3xl mx-auto px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm" style={{color:'var(--muted)'}}>
            PayNote · Built on <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{color:'#1A44C4'}}>Arc</a>
          </p>
          <div className="flex items-center gap-5">
            <a href="/templates" className="text-sm hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_templates')}</a>
            <a href="/docs"      className="text-sm hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_docs')}</a>
            <a href="/build"     className="text-sm hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_build')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
