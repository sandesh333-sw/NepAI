import { auth } from '@clerk/nextjs/server'
import { rateLimit } from '@/lib/rateLimit'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = await rateLimit(userId, 'chat', 6, 604800)

  return Response.json({
    remaining: limit.remaining
  })
}