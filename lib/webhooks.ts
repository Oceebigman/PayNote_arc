import pool from './db'
import crypto from 'crypto'

interface PaymentRequest {
  id: string; slug: string; amount: string; reason: string
  token: string; status: string; tx_hash: string
  to_address: string; sender_address: string; completed_at: string
}

const MAX_WEBHOOK_RETRIES = 5

async function deliverWebhook(
  webhook: { id: string; url: string; secret: string },
  event: string,
  payload: object,
  attempt = 0
): Promise<void> {
  const body = JSON.stringify(payload)
  const signature = 'sha256=' + crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')

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

    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event, payload, response_status, success)
       VALUES ($1, $2, $3, $4, $5)`,
      [webhook.id, event, payload, res.status, res.ok]
    )

    if (!res.ok && attempt < MAX_WEBHOOK_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000
      setTimeout(() => deliverWebhook(webhook, event, payload, attempt + 1), delay)
    }
  } catch (err) {
    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event, payload, response_status, success)
       VALUES ($1, $2, $3, $4, $5)`,
      [webhook.id, event, payload, 0, false]
    ).catch(() => {})

    if (attempt < MAX_WEBHOOK_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000
      setTimeout(() => deliverWebhook(webhook, event, payload, attempt + 1), delay)
    }
  }
}

export async function dispatchWebhooks(event: string, request: PaymentRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM webhooks WHERE active = true AND $1 = ANY(events)`,
      [event]
    )
    for (const webhook of result.rows) {
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
      deliverWebhook(webhook, event, payload).catch(console.error)
    }
  } catch (err) {
    console.error('Webhook dispatch error:', err)
  }
}
