import pool from '@/lib/db'
import MyHistoryClient from './MyHistoryClient'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ address: string }> }

export default async function MyHistoryPage({ params }: Props) {
  const { address } = await params
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) notFound()
  const result = await pool.query(
    `SELECT * FROM payment_requests WHERE LOWER(to_address) = LOWER($1) ORDER BY CASE WHEN status = 'completed' AND completed_at IS NOT NULL THEN completed_at ELSE created_at END DESC LIMIT 100`,
    [address]
  )
  return <MyHistoryClient requests={result.rows} address={address} />
}
