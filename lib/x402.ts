import { NextRequest, NextResponse } from 'next/server'

export interface X402PaymentDetails {
  scheme: 'exact'
  network: 'arc-testnet'
  maxAmountRequired: string
  resource: string
  description: string
  mimeType: string
  payTo: string
  maxTimeoutSeconds: number
  asset: string
  extra?: {
    name: string
    version: string
  }
}

export function x402PaymentRequired(
  req: NextRequest,
  details: {
    amount: string
    toAddress: string
    description: string
    slug: string
    token?: string
  }
): NextResponse {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
  const asset = details.token === 'EURC'
    ? '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'
    : '0x3600000000000000000000000000000000000000'

  const payment: X402PaymentDetails = {
    scheme: 'exact',
    network: 'arc-testnet',
    maxAmountRequired: details.amount,
    resource: req.url,
    description: details.description,
    mimeType: 'application/json',
    payTo: details.toAddress,
    maxTimeoutSeconds: 300,
    asset,
    extra: {
      name: 'PayNote',
      version: '1.0',
    },
  }

  return new NextResponse(
    JSON.stringify({
      error: 'Payment Required',
      payment,
      pay_url: `${appUrl}/r/${details.slug}`,
      instructions: 'Send payment to the pay_url or sign an EIP-3009 authorization and retry with X-PAYMENT header',
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Payment-Scheme': 'exact',
        'X-Payment-Network': 'arc-testnet',
        'X-Payment-Amount': details.amount,
        'X-Payment-Asset': asset,
        'X-Payment-Pay-To': details.toAddress,
        'X-Payment-Pay-URL': `${appUrl}/r/${details.slug}`,
        'X-Payment-Description': details.description,
        'Access-Control-Expose-Headers': 'X-Payment-Required, X-Payment-Scheme, X-Payment-Network, X-Payment-Amount, X-Payment-Asset, X-Payment-Pay-To, X-Payment-Pay-URL',
      },
    }
  )
}

export function verifyX402Payment(req: NextRequest): boolean {
  const paymentHeader = req.headers.get('X-PAYMENT')
  if (!paymentHeader) return false
  // Basic verification — in production this would verify EIP-3009 signature
  try {
    const payment = JSON.parse(Buffer.from(paymentHeader, 'base64').toString())
    return !!(payment.signature && payment.from && payment.amount)
  } catch {
    return false
  }
}
