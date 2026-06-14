export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const secret = process.env.ADMIN_SECRET
  if (!secret) notFound()

  const [totals, recent, webhooks, deliveries, apiKeys] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'expired') as expired,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND token = 'USDC'), 0) as volume_usdc,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND token = 'EURC'), 0) as volume_eurc,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND token = 'cirBTC'), 0) as volume_cirbtc
      FROM payment_requests
    `),
    pool.query(`
      SELECT *,
        CASE
          WHEN status = 'completed' AND completed_at IS NOT NULL THEN completed_at
          ELSE created_at
        END as display_date
      FROM payment_requests
      ORDER BY
        CASE
          WHEN status = 'completed' AND completed_at IS NOT NULL THEN completed_at
          ELSE created_at
        END DESC
      LIMIT 200
    `),
    pool.query(`SELECT id, url, events, active, created_at FROM webhooks ORDER BY created_at DESC`),
    pool.query(`
      SELECT wd.*, w.url as webhook_url
      FROM webhook_deliveries wd
      JOIN webhooks w ON wd.webhook_id = w.id
      ORDER BY wd.delivered_at DESC LIMIT 30
    `),
    pool.query(`SELECT id, name, key_prefix, active, created_at, last_used_at FROM api_keys ORDER BY created_at DESC`),
  ])

  return <AdminClient
    stats={totals.rows[0]}
    requests={recent.rows}
    webhooks={webhooks.rows}
    deliveries={deliveries.rows}
    apiKeys={apiKeys.rows}
    secret={secret}
  />
}
