import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { rateLimit } from '@/lib/rateLimit'
import { cache } from '@/lib/redis'

export async function GET() {
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

    await dbConnect()

    const threads = await Thread.find({ userId })
      .sort({ updatedAt: -1 })
      .select('-messages')
      .lean()

    await cache.set(cacheKey, threads, 60) // 60s TTL

    return NextResponse.json(threads)

  } catch (error) {
    console.error('Get threads error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}