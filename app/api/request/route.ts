import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { nanoid } from 'nanoid'
import { ERRORS } from '@/lib/errors'
import { rateLimit } from '@/lib/rateLimit'
import { verifyIntentSignature } from '@/lib/signature'

const VALID_TOKENS = ['USDC', 'EURC', 'cirBTC', 'USYC', 'QCAD']
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { max: 30, windowMs: 60000 })
  if (limited) return limited

  try {
    const body = await req.json()
    const { amount, reason, note, to_address, token, expires_in, recurring, display_name, signature } = body

    if (!amount || !reason || !to_address) {
      return NextResponse.json({
        error: ERRORS.MISSING_FIELDS.message,
        code: ERRORS.MISSING_FIELDS.code,
        detail: `Missing: ${[!amount&&'amount',!reason&&'reason',!to_address&&'to_address'].filter(Boolean).join(', ')}`,
        docs: 'https://paynote.space/docs#create',
      }, { status: 400 })
    }

    const n = parseFloat(amount)
    if (isNaN(n) || n <= 0) {
      return NextResponse.json({ error: ERRORS.INVALID_AMOUNT.message, code: ERRORS.INVALID_AMOUNT.code, docs: 'https://paynote.space/docs#create' }, { status: 400 })
    }

    if (!ADDRESS_RE.test(to_address)) {
      return NextResponse.json({ error: ERRORS.INVALID_ADDRESS.message, code: ERRORS.INVALID_ADDRESS.code, docs: 'https://paynote.space/docs#create' }, { status: 400 })
    }

    const selectedToken = VALID_TOKENS.includes(token) ? token : 'USDC'
    const validRecurring = ['once','daily','weekly','monthly','yearly']
    const selectedRecurring = validRecurring.includes(recurring) ? recurring : null
    const slug = nanoid(8)
    const expiresAt = expires_in ? new Date(Date.now() + Number(expires_in) * 1000).toISOString() : null

    // Verify ownership signature if provided
    let verified = false
    let signedBy: string | null = null
    if (signature) {
      const isValid = verifyIntentSignature({ amount: n, reason, to_address, token: selectedToken, signature })
      if (isValid) {
        verified = true
        signedBy = to_address
      } else {
        return NextResponse.json({
          error: 'Signature verification failed. The signature does not match to_address for this exact amount, reason, and token.',
          code: 'INVALID_SIGNATURE',
          docs: 'https://paynote.space/docs#signed-requests',
        }, { status: 400 })
      }
    }

    await pool.query(
      `INSERT INTO payment_requests (slug, amount, reason, note, to_address, status, expires_at, token, recurring, display_name, signature, signed_by)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, $11)`,
      [slug, n, reason, note || null, to_address, expiresAt, selectedToken, selectedRecurring, display_name || null, signature || null, signedBy]
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
    return NextResponse.json({
      slug,
      url: `${appUrl}/r/${slug}`,
      amount: n,
      token: selectedToken,
      status: 'pending',
      expires_at: expiresAt,
      verified,
      signed_by: signedBy,
    }, { status: 201 })

  } catch (err) {
    console.error('Request creation error:', err)
    return NextResponse.json({ error: ERRORS.SERVER_ERROR.message, code: ERRORS.SERVER_ERROR.code }, { status: 500 })
  }
}
