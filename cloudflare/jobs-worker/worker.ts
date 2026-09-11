// Small, standalone Worker that only relays two kinds of background work
// back into the main PayNote app over plain HTTP:
//   - Cron Trigger -> GET  /api/expire                  (was a crontab entry on the old VPS)
//   - Queue        -> POST /api/internal/webhook-deliver (was setTimeout-based retry)
//
// Deployed separately from the main app (see ../../wrangler.jsonc) so the
// main app's build stays the plain, unmodified `opennextjs-cloudflare`
// output — wrapping that output with custom scheduled/queue handlers in
// the same bundle broke at runtime (esbuild re-bundling dropped patches
// OpenNext applies to its own worker.js). This worker has none of that
// dependency, so it's cheap to keep it simple.

export interface Env {
  APP_URL: string
  INTERNAL_JOBS_SECRET: string
}

interface WebhookRetryMessage {
  webhook: { id: string; url: string; secret: string }
  event: string
  payload: object
  attempt: number
}

export default {
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(
      fetch(`${env.APP_URL}/api/expire`).catch((err) => console.error('expire cron failed:', err))
    )
  },

  async queue(
    batch: { messages: { body: WebhookRetryMessage; ack(): void; retry(): void }[] },
    env: Env
  ) {
    for (const message of batch.messages) {
      try {
        const res = await fetch(`${env.APP_URL}/api/internal/webhook-deliver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': env.INTERNAL_JOBS_SECRET,
          },
          body: JSON.stringify(message.body),
        })
        if (!res.ok) throw new Error(`webhook-deliver responded ${res.status}`)
        message.ack()
      } catch (err) {
        console.error('webhook retry relay failed:', err)
        message.retry()
      }
    }
  },
}
