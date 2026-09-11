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

// Same lookup as validateApiKey, but returns the key's identity instead of
// a boolean — used by the MCP server to build an AuthInfo for the caller.
export async function getApiKeyInfo(rawKey: string): Promise<{ id: string; name: string | null } | null> {
  if (!rawKey.startsWith('pn_')) return null
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const result = await pool.query('SELECT id, name FROM api_keys WHERE key_hash = $1 AND active = true', [keyHash])
  if (result.rows.length === 0) return null
  pool.query('UPDATE api_keys SET last_used_at = now() WHERE key_hash = $1', [keyHash]).catch(() => {})
  return { id: result.rows[0].id, name: result.rows[0].name }
}
