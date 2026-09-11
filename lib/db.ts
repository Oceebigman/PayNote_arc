import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// On Cloudflare, a Pool's TCP socket is tied to the request that opened it —
// the Workers runtime tears sockets down at the end of each request, so
// reusing one cached Pool across DIFFERENT requests (the first version of
// this file) makes later requests hang forever on a dead connection
// (confirmed in production: "the Workers runtime canceled this request
// because it detected that your Worker's code had hung").
//
// `ctx` (ExecutionContext) is guaranteed fresh per request, so we key the
// cache off it: multiple queries within the same request share one Pool
// (and its connection), a new request gets a new Pool. No explicit
// pool.end() — Workers reclaims the socket when the request ends regardless,
// and the WeakMap entry drops once `ctx` is garbage collected.
const cloudflarePools = new WeakMap<object, Pool>()

// Locally (plain `next dev`/`next build`, no Workers runtime) there's no
// per-request object like that and no such restriction — one Pool for the
// life of the process, same as a normal Node server.
let localPool: Pool | undefined

function resolvePool(): Pool {
  try {
    const { env, ctx } = getCloudflareContext()
    if (env?.HYPERDRIVE?.connectionString) {
      let pool = cloudflarePools.get(ctx)
      if (!pool) {
        pool = new Pool({ connectionString: env.HYPERDRIVE.connectionString })
        cloudflarePools.set(ctx, pool)
      }
      return pool
    }
  } catch {
    // Not running inside the Cloudflare Workers runtime — fall through to
    // the local DATABASE_URL path below.
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set (and no Hyperdrive binding was found)')
  }
  if (!localPool) {
    localPool = new Pool({ connectionString })
  }
  return localPool
}

// Proxy so every existing `pool.query(...)` call site keeps working
// unchanged, while the underlying Pool is actually resolved per-request.
const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = resolvePool()
    const value = Reflect.get(real, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
})

export default pool
export { resolvePool as getPool }
