import pool from './db'
import crypto from 'crypto'
import { after } from 'next/server'
import type { Pool } from 'pg'

interface PaymentRequest {
  id: string; slug: string; amount: string; reason: string
  token: string; status: string; tx_hash: string
  to_address: string; sender_address: string; completed_at: string
}

export interface WebhookRow { id: string; url: string; secret: string }

const MAX_WEBHOOK_RETRIES = 5

// Attempts one delivery, records the result, and (on failure) arranges the
// next retry. `db` is passed explicitly so this can be called both from a
// Next.js request (via the default `pool`) and from the Cloudflare Queue
// consumer (via a Pool built from the Hyperdrive binding — see
// cloudflare-entry.ts), which don't share the same execution context.
export async function deliverWebhookAttempt(
  db: Pool,
  webhook: WebhookRow,
  event: string,
  payload: object,
  attempt = 0
): Promise<void> {
  const body = JSON.stringify(payload)
  const signature = 'sha256=' + crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')

  let status = 0
  let ok = false
  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PayNote-Signature': signature,
        'X-PayNote-Event': event,
        'X-PayNote-Attempt': String(attempt + 1),
        'X-PayNote-Timestamp': new Date().toISOString(),
      },
      body,
      signal: AbortSignal.timeout(10000),
    })
    status = res.status
    ok = res.ok
  } catch {
    // Network error / timeout — leave status 0 / ok false, still record + retry below.
  }

  await db.query(
    `INSERT INTO webhook_deliveries (webhook_id, event, payload, response_status, success)
     VALUES ($1, $2, $3, $4, $5)`,
    [webhook.id, event, payload, status, ok]
  ).catch(() => {})

  if (!ok && attempt < MAX_WEBHOOK_RETRIES) {
    await scheduleRetry(webhook, event, payload, attempt + 1)
  }
}

async function scheduleRetry(webhook: WebhookRow, event: string, payload: object, attempt: number) {
  const delaySeconds = Math.pow(2, attempt - 1) // 1s, 2s, 4s, 8s, 16s

  try {
    // On Cloudflare: hand the retry to a Queue so it survives past this
    // request's lifetime. Cloudflare Workers don't keep running a bare
    // setTimeout after the response is sent, unlike the old PM2 process.
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = getCloudflareContext()
    if (env?.WEBHOOK_QUEUE) {
      await env.WEBHOOK_QUEUE.send({ webhook, event, payload, attempt }, { delaySeconds })
      return
    }
  } catch {
    // Not running on Cloudflare (e.g. plain `next dev`/`next start`) — fall
    // through to the in-process timer, which is fine on a long-lived server.
  }

  setTimeout(() => {
    deliverWebhookAttempt(pool, webhook, event, payload, attempt).catch(console.error)
  }, delaySeconds * 1000)
}

export async function dispatchWebhooks(event: string, request: PaymentRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM webhooks WHERE active = true AND $1 = ANY(events)`,
      [event]
    )
    if (result.rows.length === 0) return

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      request: {
        id: request.id, slug: request.slug,
        amount: request.amount, token: request.token,
        reason: request.reason, status: request.status,
        tx_hash: request.tx_hash, to_address: request.to_address,
        sender_address: request.sender_address, completed_at: request.completed_at,
      }
    }

    // Runs after the response is sent (mapped to ctx.waitUntil on
    // Cloudflare/Vercel), so delivery isn't racing the response — and isn't
    // silently dropped once the response ships on a serverless runtime.
    // Sequential, not Promise.all: multiple concurrent pool.query() calls
    // from one request hang on Cloudflare Workers (confirmed against the
    // Hyperdrive-backed pool) rather than erroring.
    after(async () => {
      for (const webhook of result.rows as WebhookRow[]) {
        await deliverWebhookAttempt(pool, webhook, event, payload, 0).catch(console.error)
      }
    })
  } catch (err) {
    console.error('Webhook dispatch error:', err)
  }
}
