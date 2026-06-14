import { NextRequest, NextResponse } from 'next/server'
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (/^\/0x[0-9a-fA-F]{40}$/.test(path)) {
    return NextResponse.redirect(new URL('/my' + path, req.url))
  }
  if (path === '/.well-known/payment-manifest.json') {
    return NextResponse.rewrite(new URL('/well-known/payment-manifest', req.url))
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!api|_next|favicon|icon|widget|public).*)'],
}
