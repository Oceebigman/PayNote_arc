import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { deliverWebhookAttempt, type WebhookRow } from '@/lib/webhooks'

// Called only by the paynote-jobs Cloudflare Worker (cloudflare/jobs-worker/)
// consuming the WEBHOOK_QUEUE — this is where retried webhook deliveries
// actually run, reusing this app's own Hyperdrive-aware `pool` instead of
// duplicating DB connection logic inside the jobs worker.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_JOBS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { webhook, event, payload, attempt } = (await req.json()) as {
    webhook: WebhookRow
    event: string
    payload: object
    attempt: number
  }

  if (!webhook?.url || !event || !payload) {
    return NextResponse.json({ error: 'webhook, event and payload are required' }, { status: 400 })
  }

  await deliverWebhookAttempt(pool, webhook, event, payload, attempt ?? 0)
  return NextResponse.json({ ok: true })
}
