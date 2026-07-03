import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT id, url, events, active, created_at FROM webhooks ORDER BY created_at DESC')
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, events, secret } = await req.json()
    if (!url || !secret) return NextResponse.json({ error: 'url and secret required' }, { status: 400 })

    const validEvents = ['payment.created', 'payment.completed', 'payment.failed', 'payment.expired']
    const selectedEvents = Array.isArray(events)
      ? events.filter(e => validEvents.includes(e))
      : ['payment.completed']

    const result = await pool.query(
      `INSERT INTO webhooks (url, secret, events) VALUES ($1, $2, $3) RETURNING id, url, events, active, created_at`,
      [url, secret, selectedEvents]
    )
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const auth = req.headers.get('x-admin-secret')
  if (auth !== adminSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await pool.query('DELETE FROM webhooks WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
