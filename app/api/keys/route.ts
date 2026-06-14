import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateKey(): string {
  return 'pn_' + crypto.randomBytes(32).toString('hex')
}

export async function GET(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const auth = req.headers.get('x-admin-secret')
  if (auth !== adminSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await pool.query('SELECT id, name, key_prefix, active, created_at, last_used_at FROM api_keys ORDER BY created_at DESC')
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const auth = req.headers.get('x-admin-secret')
  if (auth !== adminSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const key = generateKey()
  const keyHash = hashKey(key)
  const keyPrefix = key.slice(0, 8) + '…'
  await pool.query('INSERT INTO api_keys (name, key_hash, key_prefix) VALUES ($1, $2, $3)', [name, keyHash, keyPrefix])
  return NextResponse.json({ key, prefix: keyPrefix, name })
}

export async function DELETE(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const auth = req.headers.get('x-admin-secret')
  if (auth !== adminSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await pool.query('UPDATE api_keys SET active = false WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}
