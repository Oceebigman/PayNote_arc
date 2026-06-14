import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import ConfirmClient from './ConfirmClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ConfirmPage({ params }: Props) {
  const { slug } = await params
  const result = await pool.query('SELECT * FROM payment_requests WHERE slug = $1', [slug])
  if (result.rows.length === 0) notFound()
  const req = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
  const link = `${appUrl}/r/${slug}`

  return <ConfirmClient req={{
    amount: String(req.amount),
    reason: req.reason,
    note: req.note || '',
    to_address: req.to_address,
    token: req.token || 'USDC',
  }} link={link} slug={slug} />
}
