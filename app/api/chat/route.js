import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import getOpenAIResponse from '@/app/utils/openai'
import { rateLimit } from '@/lib/rateLimit'
import { chatBodySchema, validate } from '@/lib/validation'
import { cache } from '@/lib/redis'

export async function POST(req) {
  const requestId = crypto.randomUUID()

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 7 chats per week (7 days = 604800 seconds)
    const limit = await rateLimit(userId, 'chat', 7, 604800)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Weekly limit reached (7 chats/week)', resetIn: `${Math.ceil(limit.resetIn / 3600)}h` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const validation = validate(chatBodySchema, body)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { threadId, message } = validation.data

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Server config error (MONGODB_URI missing)', requestId },
        { status: 500 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Server config error (OPENAI_API_KEY missing)', requestId },
        { status: 500 }
      )
    }

    await dbConnect()

    let thread
    if (threadId) {
      thread = await Thread.findOne({ _id: threadId, userId })
      if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    } else {
      thread = new Thread({ userId, title: message.substring(0, 50), messages: [] })
    }

    thread.messages.push({ role: 'user', content: message })
    
    const history = thread.messages.map(m => ({ role: m.role, content: m.content }))
    const reply = await getOpenAIResponse(history)
    
    thread.messages.push({ role: 'assistant', content: reply })
    await thread.save()

    // Clear caches
    await cache.del(`thread:${userId}:${thread._id}`)
    await cache.del(`threads:${userId}`)

    return NextResponse.json({ reply, threadId: thread._id, remaining: limit.remaining })

  } catch (error) {
    const message = error?.message || 'Unknown error'
    console.error(`Chat error [${requestId}]:`, error)

    if (message.includes('OPENAI_API_KEY is not configured')) {
      return NextResponse.json(
        { error: 'AI provider is not configured on server', requestId },
        { status: 500 }
      )
    }

    if (
      message.includes('Incorrect API key') ||
      message.includes('No API key provided') ||
      message.includes('quota') ||
      message.includes('insufficient_quota') ||
      message.includes('model')
    ) {
      return NextResponse.json(
        { error: `OpenAI request failed: ${message}`, requestId },
        { status: 502 }
      )
    }

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