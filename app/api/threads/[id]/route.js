import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { rateLimit } from '@/lib/rateLimit'
import { objectIdSchema, validate } from '@/lib/validation'
import { cache } from '@/lib/redis'

export async function GET(req, context) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const validation = validate(objectIdSchema, params.id)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const id = validation.data

    const limit = await rateLimit(userId, 'thread_get', 60, 60)
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const cacheKey = `thread:${userId}:${id}`
    const cached = await cache.get(cacheKey)
    if (cached) return NextResponse.json(cached)

    await dbConnect()

    const thread = await Thread.findOne({ _id: id, userId }).lean()
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    await cache.set(cacheKey, thread, 120) // 2min TTL

    return NextResponse.json(thread)

  } catch (error) {
    console.error('Get thread error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req, context) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const validation = validate(objectIdSchema, params.id)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const id = validation.data

    const limit = await rateLimit(userId, 'thread_delete', 20, 60)
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    await dbConnect()

    const deleted = await Thread.findOneAndDelete({ _id: id, userId })
    if (!deleted) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    await cache.del(`thread:${userId}:${id}`)
    await cache.del(`threads:${userId}`)

    return NextResponse.json({ message: 'Deleted' })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}