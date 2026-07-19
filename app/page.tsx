'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/app/components/ThemeToggle'
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
      const data = await res.json()
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

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div style={{position:'absolute',width:'700px',height:'700px',top:'-200px',left:'-150px',background: dark?'radial-gradient(circle,rgba(26,68,196,0.15) 0%,transparent 70%)':'radial-gradient(circle,rgba(26,68,196,0.06) 0%,transparent 70%)',animation:'pulse-glow 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',width:'600px',height:'600px',bottom:'-150px',right:'-100px',background: dark?'radial-gradient(circle,rgba(74,21,75,0.12) 0%,transparent 70%)':'radial-gradient(circle,rgba(74,21,75,0.05) 0%,transparent 70%)',animation:'pulse-glow 10s ease-in-out infinite 3s'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:`radial-gradient(circle at 1px 1px, ${dark?'rgba(255,255,255,0.025)':'rgba(0,0,0,0.02)'} 1px, transparent 0)`,backgroundSize:'44px 44px'}}/>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-5 sm:px-12 py-4 flex items-center justify-between border-b backdrop-blur-xl" style={{borderColor:'var(--border)',background:'var(--nav-bg)'}}>
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <defs><linearGradient id="pgnav" x1="0" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4A154B"/><stop offset="100%" stopColor="#1A44C4"/></linearGradient></defs>
            <path d="M9 4 L9 32 M9 4 L21 4 C26 4 29 7 29 12 C29 17 26 20 21 20 L9 20" stroke="url(#pgnav)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="font-black text-xl tracking-tight" style={{color:'var(--text)'}}>PayNote</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/templates" className="text-sm font-semibold hidden sm:block px-3 py-2 rounded-xl hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_templates')}</a>
          <a href="/docs"      className="text-sm font-semibold hidden sm:block px-3 py-2 rounded-xl hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_docs')}</a>
          <a href="/build"     className="text-sm font-semibold hidden sm:block px-3 py-2 rounded-xl hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_build')}</a>
          <LangSelector lang={lang} onChange={handleLangChange}/>
          <ThemeToggle/>
          <button onClick={scrollToForm} className="btn-glow text-sm font-black text-white px-5 py-2.5 rounded-xl" style={{background:'linear-gradient(135deg,#102A83,#1A44C4)'}}>
            {t(lang,'create_btn').replace(' →','')}
          </button>
        </div>
      </nav>

      {!showForm ? (
        <main className="flex-1 flex flex-col justify-center px-5 sm:px-12 py-16 max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-20">
            <div className="fade-up-1 inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full border mb-8 uppercase tracking-widest" style={{borderColor:'var(--border)',color:'var(--muted)',background:'var(--card)'}}>
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Live on Arc Testnet
            </div>

            <h1 className="fade-up-2 font-black mb-6 leading-[0.92] tracking-tight" style={{fontSize:'clamp(2rem,5vw,3.8rem)',color:'var(--text)'}}>
              {t(lang,'hero_title')}<br/>
              <span style={{background:'linear-gradient(135deg,#4A154B 0%,#1A44C4 50%,#06b6d4 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {t(lang,'hero_sub1')}<br/>{t(lang,'hero_sub2')}
              </span>
            </h1>

            <p className="fade-up-3 mb-6 font-medium max-w-2xl mx-auto" style={{fontSize:'1.15rem',lineHeight:'1.7',color:'var(--muted)'}}>
              {t(lang,'hero_desc')}
            </p>

            <div className="fade-up-4 flex items-center justify-center gap-2 mb-10 flex-wrap">
              {['USDC · EURC · cirBTC','Circle Agent Stack','x402 Protocol','ERC-8183'].map(b=>(
                <span key={b} className="text-xs font-black px-3 py-1.5 rounded-full border uppercase tracking-wider" style={{borderColor:'var(--border)',color:'var(--muted)',background:'var(--card)'}}>{b}</span>
              ))}
            </div>

            <div className="fade-up-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={scrollToForm} className="btn-glow w-full sm:w-auto text-white font-black px-10 py-4 rounded-2xl text-lg" style={{background:'linear-gradient(135deg,#102A83,#1A44C4)'}}>
                {t(lang,'create_btn')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {step:'01',title:t(lang,'step01'),desc:t(lang,'step01_desc')},
              {step:'02',title:t(lang,'step02'),desc:t(lang,'step02_desc')},
              {step:'03',title:t(lang,'step03'),desc:t(lang,'step03_desc')},
            ].map(item=>(
              <div key={item.step} className="card-hover rounded-3xl border p-7" style={{background:'var(--card)',borderColor:'var(--border)'}}>
                <p className="text-5xl font-black mb-5 opacity-10" style={{color:'#1A44C4'}}>{item.step}</p>
                <p className="font-black text-xl mb-2" style={{color:'var(--text)'}}>{item.title}</p>
                <p className="text-base leading-relaxed font-medium" style={{color:'var(--muted)'}}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border p-7 sm:p-8" style={{background:'var(--card)',borderColor:'var(--border)'}}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                {label:t(lang,'trust1'),desc:t(lang,'trust1_desc')},
                {label:t(lang,'trust2'),desc:t(lang,'trust2_desc')},
                {label:t(lang,'trust3'),desc:t(lang,'trust3_desc')},
                {label:t(lang,'trust4'),desc:t(lang,'trust4_desc')},
              ].map(b=>(
                <div key={b.label}>
                  <p className="text-base font-black mb-1.5" style={{color:'var(--text)'}}>{b.label}</p>
                  <p className="text-sm font-medium" style={{color:'var(--muted)'}}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

      ) : (
        <main ref={formRef} className="flex-1 flex items-center justify-center px-5 py-10 relative z-10">
          <div className="w-full max-w-lg">
            <div className="rounded-3xl border overflow-hidden" style={{background:'var(--card)',borderColor:'var(--border)',boxShadow:'var(--shadow)'}}>
              <div className="px-6 py-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0B194F 0%,#102A83 60%,#1A44C4 100%)'}}>
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{background:'white'}}/>
                <p className="text-white font-black text-2xl relative z-10">{t(lang,'form_title')}</p>
                <p className="text-blue-200 text-base mt-1 font-medium relative z-10">{t(lang,'form_sub')}</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{color:'var(--muted)'}}>{t(lang,'token_label')}</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(ASSETS).map(([sym,asset])=>{
                        const disabled=!asset.available; const selected=token===sym
                        return (
                          <button key={sym} type="button" onClick={()=>{if(!disabled)setToken(sym as typeof token)}}
                            className="flex items-center justify-center py-3.5 rounded-2xl border font-black text-sm transition-all"
                            style={{borderColor:selected?'#1A44C4':'var(--border)',background:selected?(dark?'#0d1a3a':'#EFF6FF'):'var(--input-bg)',color:disabled?'var(--muted)':selected?'#1A44C4':'var(--muted)',opacity:disabled?0.4:1,cursor:disabled?'not-allowed':'pointer',transform:selected?'scale(1.03)':'scale(1)',boxShadow:selected?'0 0 0 2px rgba(26,68,196,0.25)':'none'}}>
                            {asset.symbol}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{t(lang,'amount_label')}</label>
                    <div className="relative">
                      <input type="number" step="0.000001" min="0.000001" placeholder="0.00"
                        value={values.amount} onChange={e=>handleChange('amount',e.target.value)} onBlur={()=>handleBlur('amount')}
                        className={inputClass('amount','pr-24')} style={{background:'var(--input-bg)',color:'var(--text)'}}/>
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black" style={{color:'#1A44C4'}}>{token}</span>
                    </div>
                    {touched.amount&&errors.amount&&<p className="text-red-500 text-sm mt-1.5 font-semibold">⚠ {errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{t(lang,'reason_label')}</label>
                    <input type="text" placeholder="e.g. Freelance invoice #003"
                      value={values.reason} onChange={e=>handleChange('reason',e.target.value)} onBlur={()=>handleBlur('reason')}
                      className={inputClass('reason')} style={{background:'var(--input-bg)',color:'var(--text)'}}/>
                    {touched.reason&&errors.reason&&<p className="text-red-500 text-sm mt-1.5 font-semibold">⚠ {errors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{t(lang,'wallet_label')}</label>
                    <input type="text" placeholder="0x0000000000000000000000000000000000000000"
                      value={values.to_address} onChange={e=>handleChange('to_address',e.target.value)} onBlur={()=>handleBlur('to_address')}
                      className={inputClass('to_address','font-mono text-sm')} style={{background:'var(--input-bg)',color:'var(--text)'}}/>
                    {touched.to_address&&errors.to_address&&<p className="text-red-500 text-sm mt-1.5 font-semibold">⚠ {errors.to_address}</p>}
                    {touched.to_address&&!errors.to_address&&values.to_address&&<p className="text-green-500 text-sm mt-1.5 font-semibold">{t(lang,'valid_address')}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{t(lang,'type_label')}</label>
                    <select value={values.recurring} onChange={e=>handleChange('recurring',e.target.value)}
                      className="w-full rounded-2xl px-5 py-4 text-base border outline-none transition-all font-semibold"
                      style={{background:'var(--input-bg)',borderColor:'var(--border)',color:'var(--text)'}}>
                      {['once','daily','weekly','monthly','yearly'].map(v=>(
                        <option key={v} value={v}>{t(lang,v)}</option>
                      ))}
                    </select>
                  </div>

                  <button type="button" onClick={()=>setShowAdvanced(a=>!a)}
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:opacity-70" style={{color:'var(--muted)'}}>
                    <svg className={`w-3.5 h-3.5 transition-transform ${showAdvanced?'rotate-90':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    {t(lang,showAdvanced?'hide':'show')} {t(lang,'advanced')}
                  </button>

                  {showAdvanced&&(
                    <div className="flex flex-col gap-4 p-5 rounded-2xl border" style={{borderColor:'var(--border)',background:'var(--input-bg)'}}>
                      {[
                        {field:'display_name',label:t(lang,'name_label'),ph:'e.g. Acme Studio'},
                        {field:'note',label:t(lang,'note_label'),ph:'Add a message...'},
                      ].map(({field,label,ph})=>(
                        <div key={field}>
                          <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{label}</label>
                          <input type="text" placeholder={ph} value={values[field as keyof typeof values]} onChange={e=>handleChange(field,e.target.value)}
                            className="w-full rounded-xl px-4 py-3.5 text-base border outline-none font-medium focus:border-blue-500"
                            style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--text)'}}/>
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>{t(lang,'expires_label')}</label>
                        <select value={values.expires_in} onChange={e=>handleChange('expires_in',e.target.value)}
                          className="w-full rounded-xl px-4 py-3.5 text-base border outline-none font-semibold"
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

                  {serverError&&<div className="rounded-2xl px-5 py-4 border border-red-500/30 bg-red-500/10"><p className="text-red-500 text-base font-semibold">{serverError}</p></div>}

                  <button type="submit" disabled={loading} className="btn-glow w-full text-white font-black rounded-2xl text-lg tracking-wide disabled:opacity-50"
                    style={{background:loading?'#6b7280':'linear-gradient(135deg,#102A83 0%,#1A44C4 100%)',padding:'1.1rem',boxShadow:loading?'none':undefined}}>
                    {loading?t(lang,'creating'):t(lang,'generate_btn')}
                  </button>

                  <p className="text-center text-sm font-semibold" style={{color:'var(--muted)'}}>
                    {t(lang,'no_account')}{' '}
                    <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="font-black hover:opacity-70" style={{color:'#1A44C4'}}>faucet.circle.com</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="py-5 border-t relative z-10" style={{borderColor:'var(--border)',background:'var(--nav-bg)',backdropFilter:'blur(12px)'}}>
        <div className="max-w-6xl mx-auto px-5 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{color:'var(--muted)'}}>
            PayNote · Built on <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="font-black hover:opacity-70" style={{color:'#1A44C4'}}>Arc</a>
          </p>
          <div className="flex items-center gap-5">
            <a href="/templates" className="text-sm font-semibold hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_templates')}</a>
            <a href="/docs"      className="text-sm font-semibold hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_docs')}</a>
            <a href="/build"     className="text-sm font-semibold hover:opacity-70" style={{color:'var(--muted)'}}>{t(lang,'nav_build')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
