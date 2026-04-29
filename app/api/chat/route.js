import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { rateLimit } from '@/lib/rateLimit'
import { chatBodySchema, validate } from '@/lib/validation'
import { cache } from '@/lib/redis'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 6 chats per week (7 days = 604800 seconds)
    const limit = await rateLimit(userId, 'chat', 6, 604800)
    if (!limit.success) {
      return new Response(JSON.stringify({ 
        error: 'Weekly limit reached (6 chats/week)', 
        resetIn: `${Math.ceil(limit.resetIn / 3600)}h` 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const validation = validate(chatBodySchema, body)
    if (!validation.ok) {
      return new Response(JSON.stringify({ error: validation.error }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { threadId, message } = validation.data

    await dbConnect()

    let thread
    if (threadId) {
      thread = await Thread.findOne({ _id: threadId, userId })
      if (!thread) {
        return new Response(JSON.stringify({ error: 'Thread not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else {
      thread = new Thread({ userId, title: message.substring(0, 50), messages: [] })
    }

    thread.messages.push({ role: 'user', content: message })
    
    const history = thread.messages.map(m => ({ role: m.role, content: m.content }))

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: history,
            stream: true,
          })

          let fullResponse = ''

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              // Send chunk to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          // Save complete response to DB
          thread.messages.push({ role: 'assistant', content: fullResponse })
          await thread.save()

          // Clear caches
          await cache.del(`thread:${userId}:${thread._id}`)
          await cache.del(`threads:${userId}`)

          // Send final event with metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            done: true, 
            threadId: thread._id.toString(),
            remaining: limit.remaining
          })}\n\n`))

          controller.close()

        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: 'Failed to generate response' 
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}