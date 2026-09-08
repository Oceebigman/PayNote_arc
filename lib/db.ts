import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// On Cloudflare, the DB connection comes from the Hyperdrive binding (rotates
// periodically), so we can't build one Pool at module load time like a normal
// Node server. Locally (npm run dev/build, no Workers runtime) there's no
// Hyperdrive binding and getCloudflareContext() throws — we fall back to
// DATABASE_URL from the environment in that case.
let cachedPool: Pool | undefined
let cachedConnectionString: string | undefined

function resolvePool(): Pool {
  let connectionString = process.env.DATABASE_URL

  try {
    const { env } = getCloudflareContext()
    if (env?.HYPERDRIVE?.connectionString) {
      connectionString = env.HYPERDRIVE.connectionString
    }
  } catch {
    // Not running inside the Cloudflare Workers runtime — use DATABASE_URL.
  }

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set (and no Hyperdrive binding was found)')
  }

  if (!cachedPool || cachedConnectionString !== connectionString) {
    cachedPool = new Pool({ connectionString })
    cachedConnectionString = connectionString
  }

  return cachedPool
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
