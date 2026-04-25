import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { rateLimit } from '@/lib/rateLimit'
import { cache } from '@/lib/redis'

export async function GET() {
  const requestId = crypto.randomUUID()

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = await rateLimit(userId, 'threads_get', 60, 60)
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const cacheKey = `threads:${userId}`
    const cached = await cache.get(cacheKey)
    if (cached) return NextResponse.json(cached)

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Server config error (MONGODB_URI missing)', requestId },
        { status: 500 }
      )
    }

    await dbConnect()

    const threads = await Thread.find({ userId })
      .sort({ updatedAt: -1 })
      .select('-messages')
      .lean()

    await cache.set(cacheKey, threads, 60) // 60s TTL

    return NextResponse.json(threads)

  } catch (error) {
    const message = error?.message || 'Unknown error'
    console.error(`Get threads error [${requestId}]:`, error)

    if (
      message.includes('MONGODB_URI') ||
      message.includes('Mongo') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ENOTFOUND')
    ) {
      return NextResponse.json(
        { error: `Database request failed: ${message}`, requestId },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: `Internal error: ${message}`, requestId }, { status: 500 })
  }
}