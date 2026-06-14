import { NextRequest, NextResponse } from 'next/server'

const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(
  req: NextRequest,
  opts: { max: number; windowMs: number } = { max: 60, windowMs: 60000 }
): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = ip + ':' + req.nextUrl.pathname
  const now = Date.now()

  const entry = store.get(key)
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + opts.windowMs })
    return null
  }

  entry.count++
  if (entry.count > opts.max) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please slow down.', code: 'RATE_LIMIT_EXCEEDED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.reset - now) / 1000)),
          'X-RateLimit-Limit': String(opts.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.reset),
        },
      }
    )
  }
  return null
}
