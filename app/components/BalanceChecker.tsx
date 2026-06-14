'use client'

import { useState, useEffect } from 'react'

interface Props {
  walletAddress: string
  tokenSymbol: string
  requiredAmount: number
  dark?: boolean
}

export default function BalanceChecker({ walletAddress, tokenSymbol, requiredAmount, dark = false }: Props) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const ethereum = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
        if (!ethereum) { setLoading(false); return }

        const TOKEN_ADDRESSES: Record<string, string> = {
          USDC: '0x3600000000000000000000000000000000000000',
          EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
          cirBTC: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF',
        }

        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol]
        if (!tokenAddress) { setLoading(false); return }

        const selector = '0x70a08231'
        const paddedAddress = walletAddress.replace('0x', '').padStart(64, '0')
        const data = selector + paddedAddress

        const result = await ethereum.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data }, 'latest'],
        }) as string

        const decimals = tokenSymbol === 'cirBTC' ? 8 : 6
        const raw = parseInt(result, 16)
        const formatted = raw / Math.pow(10, decimals)
        setBalance(formatted)
      } catch {
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }
    if (walletAddress) fetchBalance()
  }, [walletAddress, tokenSymbol])

  if (loading) return (
    <div className="flex items-center gap-2 text-xs" style={{color: dark ? '#64748b' : '#9ca3af'}}>
      <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor: '#1A44C4', borderTopColor: 'transparent'}}></div>
      Checking balance...
    </div>
  )

  if (balance === null) return null

  const sufficient = balance >= requiredAmount
  const decimals = tokenSymbol === 'cirBTC' ? 8 : 2

  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border ${sufficient ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <span className="font-medium" style={{color: sufficient ? '#16a34a' : '#dc2626'}}>
        Your balance: {balance.toFixed(decimals)} {tokenSymbol}
      </span>
      {!sufficient && (
        <span className="text-xs font-semibold text-red-500">
          Need {(requiredAmount - balance).toFixed(decimals)} more
        </span>
      )}
      {sufficient && (
        <span className="text-xs font-semibold text-green-600">Sufficient</span>
      )}
    </div>
  )
}
