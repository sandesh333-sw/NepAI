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
    fetchRemaining()
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
      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }
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

      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to send')
        setMessages(prev => prev.slice(0, -2))
        return
      }

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
      console.error(err)
      toast.error('Failed to send message')
      setMessages(prev => prev.slice(0, -2))
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI HELPERS ================= */

  const getBadgeColor = () => {
    if (remaining === null) return 'bg-gray-100 text-gray-600'
    if (remaining <= 1) return 'bg-red-100 text-red-700'
    if (remaining <= 3) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className='flex flex-col h-full w-full bg-gray-50'>

      {/* HEADER */}
      <div className="flex justify-between items-center px-3 py-3 bg-white border-b md:px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            aria-label="Open menu"
            className="md:hidden rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors"
          >
            ☰
          </button>
          <h1 className="text-sm font-semibold text-gray-700">
            {threadId ? 'Chat' : 'New Chat'}
          </h1>
        </div>

        {remaining !== null && (
          <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${getBadgeColor()}`}>
            {remaining} left
          </div>
        )}
      </div>

      {/* MESSAGES - Scrollable area */}
      <div className='flex-1 overflow-y-auto p-3 md:p-4 pb-28 min-h-0'>
        
        {/* Empty State */}
        {messages.length === 0 && !loading && (
          <div className='flex h-full items-center justify-center px-4'>
            <div className="text-center max-w-md">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className='text-gray-700 text-base font-semibold mb-2'>Start a conversation</h3>
              <p className='text-gray-500 text-sm mb-3'>Ask me anything and I'll help you out!</p>
              {remaining !== null && (
                <p className='text-gray-400 text-xs'>You have {remaining} chats remaining this week</p>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`space-y-3 ${messages.length > 0 && messages.length < 5 ? 'min-h-full flex flex-col justify-end' : ''}`}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* FIXED INPUT AT BOTTOM */}
      <div className='shrink-0 p-3 bg-gray-50 border-t border-gray-200 md:p-4'>
        <div className='max-w-3xl mx-auto'>
          <div className='flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-full shadow-sm hover:shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all md:px-4'>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder='Type your message...'
              disabled={loading}
              className='flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50'
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className='shrink-0 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95'
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ================= MESSAGE BUBBLE ================= */

const MessageBubble = ({ message }) => {
  const { role, content, streaming } = message
  const [copied, setCopied] = useState(false)

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      
      {/* AI Avatar */}
      {role === 'assistant' && (
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs text-white font-semibold'>
          AI
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[85%] md:max-w-2xl rounded-2xl px-3 py-2.5 md:px-4 md:py-3 ${
        role === 'user'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
      }`}>
        
        {role === 'assistant' ? (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  
                  return !inline && match ? (
                    <div className="relative group my-2">
                      <button
                        onClick={() => copyCode(codeString)}
                        className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg text-sm"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
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
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        )}

        {/* Streaming cursor */}
        {streaming && (
          <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
        )}
      </div>

      {/* User Avatar */}
      {role === 'user' && (
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs text-white font-semibold'>
          U
        </div>
      )}
    </div>
  )
}

export default ChatWindow