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

  const fetchThread = async (id) => {
    try {
      const res = await fetch(`/api/threads/${id}`)
      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      if (res.status === 429) {
        toast.error('Too many requests. Please wait and try again.')
        return
      }
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch thread:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // ✅ FIXED batching issue
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '', streaming: true }
    ])

    try {
      const payload = { message: userMessage }
      if (threadId) payload.threadId = threadId

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 429) {
          toast.error(data.error || 'Request limit reached')

          setMessages(prev => [
            ...prev.slice(0, -1),
            {
              role: 'assistant',
              content: data.error || 'Weekly limit reached.'
            }
          ])
          return
        }
        throw new Error(data.error)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.content) {
              accumulatedContent += data.content

              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: accumulatedContent,
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
                  content: accumulatedContent,
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

            if (data.error) {
              throw new Error(data.error)
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error)

      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col h-full w-full bg-gray-50'>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3 bg-white md:px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg border px-3 py-2 text-xs md:hidden"
          >
            ☰
          </button>
          <h1 className="text-sm font-semibold text-gray-700">
            {threadId ? 'Chat' : 'New Chat'}
          </h1>
        </div>

        {remaining !== null && (
          <div className="text-xs px-3 py-1.5 rounded-full bg-gray-100">
            {remaining} chats left
          </div>
        )}
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 pb-24'>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gray-50'>
        <div className='max-w-3xl mx-auto flex gap-2 bg-white border px-4 py-2 rounded-full'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1 outline-none text-sm'
            placeholder='Type...'
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= MESSAGE BUBBLE ================= */

const MessageBubble = ({ message }) => {
  const { role, content, streaming } = message
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
        role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'
      }`}>

        {role === 'assistant' ? (
          <div className="prose prose-sm max-w-none prose-pre:p-0 prose-pre:m-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')

                  return !inline && match ? (
                    <div className="relative group my-2">
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="absolute right-2 top-2 text-xs bg-gray-700 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>

                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        )}

        {streaming && (
          <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-1" />
        )}
      </div>
    </div>
  )
}

export default ChatWindow