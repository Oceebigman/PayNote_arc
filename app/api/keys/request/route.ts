import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, use_case, project_name } = await req.json()
    if (!email || !use_case) {
      return NextResponse.json({ error: 'email and use_case required' }, { status: 400 })
    }

    // Auto-generate a key
    const key = 'pn_' + crypto.randomBytes(32).toString('hex')
    const keyHash = crypto.createHash('sha256').update(key).digest('hex')
    const keyPrefix = key.slice(0, 8) + '…'
    const name = project_name || email.split('@')[0]

    await pool.query(
      'INSERT INTO api_keys (name, key_hash, key_prefix) VALUES ($1, $2, $3)',
      [name + ' (self-serve)', keyHash, keyPrefix]
    )

    return NextResponse.json({
      key,
      prefix: keyPrefix,
      message: 'Your API key has been generated. Store it securely — it will not be shown again.',
      docs: 'https://paynote.space/docs',
      note: 'This key is rate-limited. Contact us for production access.',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
