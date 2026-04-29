'use client'

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ChatWindow = ({ selectedThreadId, onThreadCreated, onOpenSidebar }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState(selectedThreadId || null)
  const [remaining, setRemaining] = useState(null)
  const bottomRef = useRef(null)

  /* ================= INIT ================= */

  useEffect(() => {
    fetchRemaining() // ✅ always get quota
  }, [])

  useEffect(() => {
    setThreadId(selectedThreadId)

    if (selectedThreadId) {
      fetchThread(selectedThreadId)
    } else {
      setMessages([])
    }
  }, [selectedThreadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ================= API ================= */

  const fetchRemaining = async () => {
    try {
      const res = await fetch('/api/usage')
      if (!res.ok) return
      const data = await res.json()
      setRemaining(data.remaining)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchThread = async (id) => {
    try {
      const res = await fetch(`/api/threads/${id}`)
      const data = await res.json()

      if (data.messages) setMessages(data.messages)
      if (data.remaining !== undefined) setRemaining(data.remaining)

    } catch (error) {
      console.error(error)
    }
  }

  /* ================= SEND ================= */

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '', streaming: true }
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, threadId })
      })

      if (!res.ok) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = JSON.parse(line.slice(6))

          if (data.content) {
            accumulated += data.content

            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: accumulated,
                streaming: true
              }
              return updated
            })
          }

          if (data.done) {
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: accumulated,
                streaming: false
              }
              return updated
            })

            if (!threadId && data.threadId) {
              setThreadId(data.threadId)
              onThreadCreated?.(data.threadId)
            }

            if (data.remaining !== undefined) {
              setRemaining(data.remaining)
            }
          }
        }
      }

    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  const getBadgeColor = () => {
    if (remaining <= 1) return 'bg-red-100 text-red-700'
    if (remaining <= 3) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className='flex flex-col h-full w-full bg-gray-50'>

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
        <h1 className="text-sm font-semibold">
          {threadId ? 'Chat' : 'New Chat'}
        </h1>

        {remaining !== null && (
          <div className={`text-xs px-3 py-1.5 rounded-full ${getBadgeColor()}`}>
            {remaining} chats left
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 pb-24'>
        {messages.length === 0 && (
          <p className="text-center text-gray-400">
            You have {remaining} chats remaining
          </p>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gray-50'>
        <div className='max-w-3xl mx-auto flex gap-2 bg-white border px-4 py-2 rounded-full'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1 outline-none text-sm'
            placeholder='Type...'
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  )
}

/* ================= MESSAGE ================= */

const MessageBubble = ({ message }) => {
  const { role, content } = message

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-white border">

        {role === 'assistant' ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p>{content}</p>
        )}

      </div>
    </div>
  )
}

export default ChatWindow