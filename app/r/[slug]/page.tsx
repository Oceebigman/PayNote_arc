import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import DarkModeWrapper from './DarkModeWrapper'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PayPage({ params }: Props) {
  const { slug } = await params
  const result = await pool.query('SELECT *, signed_by, signature FROM payment_requests WHERE slug = $1', [slug])
  if (result.rows.length === 0) notFound()
  const req = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'

  return (
    <DarkModeWrapper
      req={{
        amount: String(req.amount),
        reason: req.reason,
        note: req.note || '',
        to_address: req.to_address,
        status: req.status,
        id: req.id,
        token: req.token || 'USDC',
        expires_at: req.expires_at ? req.expires_at.toISOString() : null,
        display_name: req.display_name || null,
      }}
      slug={slug}
      appUrl={appUrl}
    />
  )
}
