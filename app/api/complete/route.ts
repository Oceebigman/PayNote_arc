import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { slug, tx_hash, sender_address } = await req.json()
    if (!slug || !tx_hash) {
      return NextResponse.json({ error: 'slug and tx_hash are required' }, { status: 400 })
    }
    const result = await pool.query(
      `UPDATE payment_requests
       SET status = 'completed', tx_hash = $1, sender_address = $2, completed_at = now()
       WHERE slug = $3 AND status = 'pending'
       RETURNING *`,
      [tx_hash, sender_address || null, slug]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found or already completed' }, { status: 404 })
    }
    return NextResponse.json({ success: true, request: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
