import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { rateLimiter } from './lib/redis'

const isProtected = createRouteMatcher(['/main(.*)'])

function securityHeaders(response) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000')
  return response
}

async function checkIpLimit(ip) {
  const result = await rateLimiter.check(ip, 'ip', 50, 3600) // 50/hour
  return result.success
}

export default clerkMiddleware(async (auth, req) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

  // Rate limit API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!(await checkIpLimit(ip))) {
      return securityHeaders(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      )
    }
  }

  if (isProtected(req)) await auth.protect()

  return securityHeaders(NextResponse.next())
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

