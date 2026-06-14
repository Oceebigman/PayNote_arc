import { NextRequest } from 'next/server'
import pool from './db'
import crypto from 'crypto'

export async function validateApiKey(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer pn_')) return false
  const key = authHeader.replace('Bearer ', '')
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const result = await pool.query('SELECT id FROM api_keys WHERE key_hash = $1 AND active = true', [keyHash])
  if (result.rows.length === 0) return false
  pool.query('UPDATE api_keys SET last_used_at = now() WHERE key_hash = $1', [keyHash]).catch(() => {})
  return true
}
