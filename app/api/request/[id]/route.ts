import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { validateApiKey } from '@/lib/apiAuth'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(req, { max: 60, windowMs: 60000 })
  if (limited) return limited

  const isApiKey = await validateApiKey(req)
  const isAdmin = req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
  if (!isApiKey && !isAdmin) {
    return NextResponse.json({
      error: 'Unauthorized. Get an API key at paynote.space/docs#auth',
      code: 'UNAUTHORIZED',
      docs: 'https://paynote.space/docs#auth',
    }, { status: 401 })
  }

  const { id } = await params
  const result = await pool.query(
    `SELECT * FROM payment_requests WHERE id::text = $1 OR slug = $1`,
    [id]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const r = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'

  return NextResponse.json({
    id: r.id, slug: r.slug,
    url: `${appUrl}/r/${r.slug}`,
    amount: Number(r.amount), token: r.token || 'USDC',
    reason: r.reason, note: r.note,
    to_address: r.to_address, status: r.status,
    tx_hash: r.tx_hash, sender_address: r.sender_address,
    created_at: r.created_at, completed_at: r.completed_at, expires_at: r.expires_at,
    recurring: r.recurring, display_name: r.display_name,
  })
}
