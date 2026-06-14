import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { nanoid } from 'nanoid'
import { validateApiKey } from '@/lib/apiAuth'
import { dispatchWebhooks } from '@/lib/webhooks'
import { verifyIntentSignature } from '@/lib/signature'

export async function POST(req: NextRequest) {
  const valid = await validateApiKey(req)
  if (!valid) return NextResponse.json({
    error: 'Unauthorized. Get an API key at paynote.space/docs#auth',
    code: 'UNAUTHORIZED',
  }, { status: 401 })

  try {
    const { amount, reason, to_address, token, note, expires_in, metadata, signature, notify_url } = await req.json()

    if (!amount || !reason || !to_address) {
      return NextResponse.json({
        error: 'amount, reason, and to_address are required',
        code: 'MISSING_FIELDS',
        docs: 'https://paynote.space/docs',
      }, { status: 400 })
    }

    const validTokens = ['USDC', 'EURC', 'cirBTC', 'USYC']
    const selectedToken = validTokens.includes(token) ? token : 'USDC'
    const slug = nanoid(8)
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null

    // Verify ownership signature if provided
    let verified = false
    let signedBy: string | null = null
    if (signature) {
      const isValid = verifyIntentSignature({
        amount, reason, to_address, token: selectedToken, signature
      })
      if (isValid) {
        verified = true
        signedBy = to_address
      } else {
        return NextResponse.json({
          error: 'Signature verification failed.',
          code: 'INVALID_SIGNATURE',
          docs: 'https://paynote.space/docs#signed-requests',
        }, { status: 400 })
      }
    }

    await pool.query(
      `INSERT INTO payment_requests (slug, amount, reason, note, to_address, status, expires_at, token, signature, signed_by)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9)`,
      [slug, amount, reason, note || null, to_address, expiresAt, selectedToken, signature || null, signedBy]
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
    const url = `${appUrl}/r/${slug}`

    // If Agent A provided Agent B's URL, notify Agent B immediately
    if (notify_url) {
      const notifyPayload = {
        event: 'payment.requested',
        message: `Payment requested: ${amount} ${selectedToken} for: ${reason}`,
        slug,
        amount,
        token: selectedToken,
        reason,
        pay_url: url,
        x402_url: `${appUrl}/api/x402?slug=${slug}`,
        poll_url: `${appUrl}/api/poll?slug=${slug}`,
        receipt_url: `${appUrl}/receipt/${slug}`,
        from_address: to_address,
        instructions: {
          step1: `Hit GET ${appUrl}/api/x402?slug=${slug}`,
          step2: 'Read the 402 response body for full payment details',
          step3: 'Sign EIP-3009 authorization and retry with X-PAYMENT header',
        }
      }
      fetch(notify_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-PayNote-Event': 'payment.requested' },
        body: JSON.stringify(notifyPayload),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {})
    }

    dispatchWebhooks('payment.created', {
      id: slug, slug, amount: String(amount), reason, token: selectedToken,
      status: 'pending', tx_hash: '', to_address, sender_address: '', completed_at: '',
    }).catch(() => {})

    const response = NextResponse.json({
      slug,
      url,
      amount,
      token: selectedToken,
      reason,
      status: 'pending',
      expires_at: expiresAt,
      verified,
      signed_by: signedBy,
      metadata: metadata || null,
      erc8183: {
        version: '1.0',
        intent_id: slug,
        network: 'arc-testnet',
        signed: verified,
      },
      instructions: {
        pay_url: url,
        poll_url: `${appUrl}/api/poll?slug=${slug}`,
        verify_url: `${appUrl}/api/verify`,
        receipt_url: `${appUrl}/receipt/${slug}`,
        x402_url: `${appUrl}/api/x402?slug=${slug}`,
      },
    })

    // ERC-8183 response headers
    response.headers.set('X-ERC8183-Version', '1.0')
    response.headers.set('X-ERC8183-Intent-ID', slug)
    response.headers.set('X-ERC8183-Pay-URL', url)
    response.headers.set('X-ERC8183-Poll-URL', `${appUrl}/api/poll?slug=${slug}`)
    response.headers.set('X-ERC8183-Amount', String(amount))
    response.headers.set('X-ERC8183-Token', selectedToken)
    response.headers.set('X-ERC8183-Network', 'arc-testnet')
    response.headers.set('X-ERC8183-Signed', String(verified))
    response.headers.set('X-Payment-Required', 'true')
    response.headers.set('X-Payment-Pay-URL', url)

    return response

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
