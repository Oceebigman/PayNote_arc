import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { max: 120, windowMs: 60000 })
  if (limited) return limited

  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug required', code: 'MISSING_SLUG' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      'SELECT status, tx_hash, completed_at, expires_at, amount, token FROM payment_requests WHERE slug = $1',
      [slug]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const r = result.rows[0]

    // Auto-expire if past deadline
    if (r.status === 'pending' && r.expires_at && new Date(r.expires_at) < new Date()) {
      await pool.query(`UPDATE payment_requests SET status = 'expired' WHERE slug = $1 AND status = 'pending'`, [slug])
      r.status = 'expired'
    }

    return NextResponse.json({
      status: r.status,
      tx_hash: r.tx_hash || null,
      completed_at: r.completed_at || null,
      amount: Number(r.amount),
      token: r.token || 'USDC',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
