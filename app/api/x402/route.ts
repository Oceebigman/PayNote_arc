import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { SUPPORTED_TOKENS, PUBLIC_TOKENS } from '@/lib/arcContracts'


export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const result = await pool.query(
    `SELECT * FROM payment_requests WHERE slug = $1`,
    [slug]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Payment request not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const req2 = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
  const token = req2.token || 'USDC'

  // Token resolution: prefer the real address from SUPPORTED_TOKENS.
  // If the token isn't in the registry at all, fall back to USDC with a warning.
  // If the token is in the registry but not in PUBLIC_TOKENS (e.g. USYC),
  // we still serve the real address but attach a warning about the allowlist.
  const registered = SUPPORTED_TOKENS[token]
  const tokenAddress = registered ? registered.address : SUPPORTED_TOKENS.USDC.address

  let tokenWarning: string | null = null
  if (!registered) {
    tokenWarning = `Token '${token}' is not in the PayNote registry. Returning USDC address as fallback. Payer should verify token_address before signing.`
  } else if (!(PUBLIC_TOKENS as readonly string[]).includes(token)) {
    tokenWarning = `Token '${token}' requires Circle allowlist approval. Payer wallet must be on the allowlist to complete the transfer.`
  }

  if (req2.status === 'completed') {
    return NextResponse.json({
      status: 'completed',
      message: 'This payment request has already been fulfilled.',
      tx_hash: req2.tx_hash,
      receipt_url: `${appUrl}/receipt/${req2.id}`,
    }, { status: 200 })
  }

  if (req2.status === 'expired') {
    return NextResponse.json({ error: 'Payment request has expired', code: 'EXPIRED' }, { status: 410 })
  }

  // The full x402 response body — everything an agent needs
  const body = {
    x402_version: '1.0',
    error: 'Payment Required',
    token_warning: tokenWarning,
    accepts: [
      {
        scheme: 'exact',
        network: 'arc-testnet',
        token: token,
        token_address: tokenAddress,
        amount: req2.amount,
        amount_display: `${req2.amount} ${token}`,
        pay_to: req2.to_address,
        pay_url: `${appUrl}/r/${slug}`,
        reason: req2.reason,
        note: req2.note || null,
        display_name: req2.display_name || null,
        expires_at: req2.expires_at || null,
        description: `Pay ${req2.amount} ${token} to ${req2.to_address} for: ${req2.reason}`,
      }
    ],
    instructions: {
      step1: `Sign an EIP-3009 transferWithAuthorization for ${req2.amount} ${token} to ${req2.to_address}`,
      step2: 'Encode the signed authorization as base64',
      step3: `Retry this request with header: X-PAYMENT: <base64-encoded-authorization>`,
      step4: 'Receive HTTP 200 with payment confirmation',
    },
    poll_url: `${appUrl}/api/poll?slug=${slug}`,
    verify_url: `${appUrl}/api/verify`,
    receipt_url: `${appUrl}/receipt/${req2.id}`,
    erc8183: {
      version: '1.0',
      intent_id: slug,
      network: 'arc-testnet',
    },
  }

  // Check if X-PAYMENT header is present (agent attempting to pay)
  const paymentHeader = req.headers.get('X-PAYMENT')
  if (paymentHeader) {
    // TODO: Full EIP-3009 signature verification goes here
    // For now return 402 still — full verification is next roadmap item
    return NextResponse.json({
      ...body,
      error: 'Payment header received but signature verification is pending implementation.',
      code: 'SIGNATURE_VERIFICATION_PENDING',
    }, {
      status: 402,
      headers: buildHeaders(req2, token, tokenAddress, appUrl, slug),
    })
  }

  return NextResponse.json(body, {
    status: 402,
    headers: buildHeaders(req2, token, tokenAddress, appUrl, slug),
  })
}

function buildHeaders(req2: Record<string, string>, token: string, tokenAddress: string, appUrl: string, slug: string) {
  return {
    'X-Payment-Required': 'true',
    'X-Payment-Scheme': 'exact',
    'X-Payment-Network': 'arc-testnet',
    'X-Payment-Amount': String(req2.amount),
    'X-Payment-Token': token,
    'X-Payment-Asset': tokenAddress,
    'X-Payment-Pay-To': req2.to_address,
    'X-Payment-Pay-URL': `${appUrl}/r/${slug}`,
    'X-Payment-Reason': req2.reason.replace(/[^\x00-\x7F]/g, '').trim(),
    'X-Payment-Poll-URL': `${appUrl}/api/poll?slug=${slug}`,
    'X-Payment-Receipt-URL': `${appUrl}/receipt/${req2.id}`,
    'X-ERC8183-Version': '1.0',
    'X-ERC8183-Intent-ID': slug,
    'X-ERC8183-Network': 'arc-testnet',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Payment-Required, X-Payment-Scheme, X-Payment-Network, X-Payment-Amount, X-Payment-Token, X-Payment-Asset, X-Payment-Pay-To, X-Payment-Pay-URL, X-Payment-Reason, X-Payment-Poll-URL, X-Payment-Receipt-URL, X-ERC8183-Version, X-ERC8183-Intent-ID, X-ERC8183-Network',
  }
}
