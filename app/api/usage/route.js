import { auth } from '@clerk/nextjs/server'
import redis from '@/lib/redis'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Just READ the count, don't increment it
  const key = `rate_limit:chat:${userId}`
  const now = Date.now()
  const windowMs = 604800 * 1000 // 7 days

  try {
    // Remove old timestamps
    await redis.zremrangebyscore(key, 0, now - windowMs)
    
    // Count current requests
    const count = await redis.zcard(key)
    
    // Calculate remaining
    const remaining = Math.max(0, 6 - count)

    return Response.json({ remaining })
  } catch (error) {
    console.error('Usage check error:', error)
    // Return safe default if Redis fails
    return Response.json({ remaining: 6 })
  }
}