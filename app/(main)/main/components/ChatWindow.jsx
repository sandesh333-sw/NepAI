'use client'

import React, { useState, useEffect, useRef } from 'react'

const ChatWindow = ({ selectedThreadId, onThreadCreated }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState(selectedThreadId || null)
  const bottomRef = useRef(null)

  // Load thread messages when selectedThreadId changes
  useEffect(() => {
    setThreadId(selectedThreadId)
    if (selectedThreadId) {
      fetchThread(selectedThreadId)
    } else {
      setMessages([])
    }
  }, [selectedThreadId])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchThread = async (id) => {
    try {
      const res = await fetch(`/api/threads/${id}`)
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

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message: userMessage })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      // Add AI reply
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

      // If new thread was created, notify sidebar
      if (!threadId) {
        setThreadId(data.threadId)
        onThreadCreated?.(data.threadId)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col h-full w-full bg-black'>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-200">
          {threadId ? 'Chat' : 'New Chat'}
        </h1>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 && (
          <div className='flex h-full items-center justify-center'>
            <p className='text-gray-600 text-sm'>Send a message to start chatting</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar for AI */}
            {msg.role === 'assistant' && (
              <div className='mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs text-white'>
                AI
              </div>
            )}

            <div className={`max-w-lg rounded-lg px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-300 border border-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className='flex justify-start'>
            <div className='mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs text-white'>
              AI
            </div>
            <div className='rounded-lg border border-gray-800 bg-gray-900 px-4 py-2'>
              <div className='flex space-x-1'>
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]'></span>
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]'></span>
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]'></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='border-t border-gray-800 p-4'>
        <div className='flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder='Type a message...'
            disabled={loading}
            className='flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500 disabled:opacity-50'
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className='rounded-md bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed'
          >
            Send
          </button>
        </div>
        <p className='mt-1.5 text-center text-xs text-gray-600'>Press Enter to send</p>
      </div>

    </div>
  )
}

export default ChatWindow