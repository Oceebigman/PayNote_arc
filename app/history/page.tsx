import pool from '@/lib/db'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const result = await pool.query(
    `SELECT * FROM payment_requests
     WHERE archived = false
     ORDER BY created_at DESC
     LIMIT 100`
  )
  return <HistoryClient requests={result.rows} />
}
