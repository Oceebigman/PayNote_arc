import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      `UPDATE payment_requests
       SET status = 'expired'
       WHERE status = 'pending'
         AND expires_at IS NOT NULL
         AND expires_at < now()
       RETURNING slug`
    )
    return NextResponse.json({ expired: result.rows.length, slugs: result.rows.map(r => r.slug) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
