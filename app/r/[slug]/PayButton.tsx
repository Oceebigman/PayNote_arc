'use client'

import { useState } from 'react'

interface Props {
  amount: string
  toAddress: string
  token: string
  tokenAddress: string
  tokenDecimals?: number
  dark?: boolean
  slug?: string
}

const ARC_CHAIN_IDS = ['0x4ce752', '0x4cef52']

function encodeApprove(spender: string, amount: bigint): string {
  return '0x095ea7b3' + spender.replace('0x', '').padStart(64, '0') + amount.toString(16).padStart(64, '0')
}

function encodeTransfer(to: string, amount: bigint): string {
  return '0xa9059cbb' + to.replace('0x', '').padStart(64, '0') + amount.toString(16).padStart(64, '0')
}

function encodeBalanceOf(address: string): string {
  return '0x70a08231' + address.replace('0x', '').padStart(64, '0')
}

type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }

async function waitForReceipt(ethereum: EthProvider, txHash: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await ethereum.request({ method: 'eth_getTransactionReceipt', params: [txHash] })
    if (receipt) return
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error('Transaction timed out')
}

async function checkBalance(ethereum: EthProvider, tokenAddress: string, walletAddress: string, decimals: number): Promise<number> {
  try {
    const result = await ethereum.request({
      method: 'eth_call',
      params: [{ to: tokenAddress, data: encodeBalanceOf(walletAddress) }, 'latest'],
    }) as string
    return parseInt(result, 16) / Math.pow(10, decimals)
  } catch {
    return -1 // Unknown balance
  }
}

export default function PayButton({ amount, toAddress, token, tokenAddress, tokenDecimals = 6, dark = false, slug }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending_approve' | 'pending_pay' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')
  const [copied, setCopied] = useState(false)

  async function handlePay() {
    const ethereum = (window as unknown as { ethereum?: unknown }).ethereum as EthProvider | undefined

    if (!ethereum) {
      setStatus('error')
      setErrorMsg('No wallet detected. Please install Rabby or MetaMask.')
      return
    }

    try {
      setErrorMsg('')
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const from = accounts[0]

      try {
        await ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x4cef52', chainName: 'Arc Testnet', nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, rpcUrls: ['https://rpc.testnet.arc.network'], blockExplorerUrls: ['https://testnet.arcscan.app'] }] })
      } catch { /* exists */ }

      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4cef52' }] })
      } catch { /* already on it */ }

      const currentChain = await ethereum.request({ method: 'eth_chainId' }) as string
      if (!ARC_CHAIN_IDS.includes(currentChain.toLowerCase())) {
        setStatus('error')
        setErrorMsg('Please switch to Arc Testnet. Use Rabby wallet for best compatibility.')
        return
      }

      const amountNum = parseFloat(amount)
      const multiplier = Math.pow(10, tokenDecimals)
      const amountInUnits = BigInt(Math.round(amountNum * multiplier))

      // Check balance BEFORE attempting payment
      const balance = await checkBalance(ethereum, tokenAddress, from, tokenDecimals)
      if (balance >= 0 && balance < amountNum) {
        setStatus('error')
        setErrorMsg(`Insufficient ${token} balance. You have ${balance.toFixed(tokenDecimals === 8 ? 8 : 2)} ${token} but need ${amountNum.toFixed(tokenDecimals === 8 ? 8 : 2)} ${token}.`)
        return
      }

      setStatus('pending_approve')
      const approveTx = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: tokenAddress, data: encodeApprove(toAddress, amountInUnits) }],
      }) as string

      await waitForReceipt(ethereum, approveTx)

      setStatus('pending_pay')
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: tokenAddress, data: encodeTransfer(toAddress, amountInUnits) }],
      }) as string

      setTxHash(hash)
      setStatus('success')

      if (slug) {
        await new Promise(r => setTimeout(r, 2000))
        await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, tx_hash: hash }),
        }).catch(() => {})
      }

    } catch (err: unknown) {
      const e = err as { code?: number; message?: string }
      setStatus('error')
      if (e.code === 4001) setErrorMsg('Transaction cancelled.')
      else if (e.message?.toLowerCase().includes('insufficient')) setErrorMsg(`Insufficient ${token} balance. Please check your wallet and try again.`)
      else setErrorMsg(e.message?.slice(0, 150) || 'Something went wrong. Please try again.')
    }
  }

  function handleCopyTx() {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(toAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btn = 'linear-gradient(135deg, #102A83 0%, #1A44C4 100%)'

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background: btn}}>
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-black mb-1" style={{color: dark ? '#f1f5f9' : '#0f172a'}}>Payment sent!</p>
          <p className="text-base font-medium" style={{color: dark ? '#475569' : '#64748b'}}>{amount} {token} · Arc Testnet</p>
        </div>
        <div className="w-full rounded-2xl border px-4 py-4 text-left" style={{background: dark ? '#0f1117' : '#f8fafc', borderColor: dark ? '#1e2a3a' : '#e2e8f0'}}>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color: dark ? '#475569' : '#94a3b8'}}>Transaction hash</p>
          <p className="text-sm font-mono break-all leading-relaxed font-medium" style={{color: dark ? '#f1f5f9' : '#0f172a'}}>{txHash}</p>
          <button onClick={handleCopyTx} className="mt-2 text-sm font-black hover:opacity-70" style={{color: '#1A44C4'}}>
            {copied ? 'Copied!' : 'Copy hash'}
          </button>
        </div>
        <a href={'https://testnet.arcscan.app/tx/' + txHash} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-2xl border text-base font-bold py-3.5 transition-all hover:border-blue-400"
          style={{background: dark ? '#0f1117' : '#f8fafc', borderColor: dark ? '#1e2a3a' : '#e2e8f0', color: dark ? '#475569' : '#64748b'}}>
          View on ArcScan →
        </a>
      </div>
    )
  }

  const isPending = status === 'pending_approve' || status === 'pending_pay'

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handlePay} disabled={isPending}
        className="w-full text-white font-black py-4 rounded-2xl transition-all text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
        style={{background: isPending ? '#6b7280' : btn, boxShadow: isPending ? 'none' : '0 4px 15px rgba(26,68,196,0.3)'}}>
        {isPending ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {status === 'pending_approve' ? `Step 1/2: Approve ${token}…` : 'Step 2/2: Sending payment…'}
          </>
        ) : (`Pay ${amount} ${token}`)}
      </button>

      {isPending && (
        <div className="rounded-2xl border px-4 py-3" style={{background: dark ? '#0d1321' : '#f8fafc', borderColor: dark ? '#1e2a3a' : '#e2e8f0'}}>
          <p className="text-sm font-medium" style={{color: dark ? '#475569' : '#64748b'}}>
            {status === 'pending_approve' ? 'Step 1: Approve exact amount in your wallet.' : 'Step 2: Approval confirmed. Confirm payment now.'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-500 text-base font-semibold mb-3">{errorMsg}</p>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border" style={{background: dark ? '#111827' : '#fff', borderColor: dark ? '#1e2a3a' : '#e2e8f0'}}>
            <p className="font-mono text-sm break-all flex-1" style={{color: dark ? '#475569' : '#94a3b8'}}>{toAddress}</p>
            <button onClick={handleCopyAddress} className="shrink-0 text-sm font-black whitespace-nowrap hover:opacity-70" style={{color: '#1A44C4'}}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
