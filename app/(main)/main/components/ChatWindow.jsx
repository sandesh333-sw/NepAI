'use client'

import React, { useState, useEffect, useRef } from 'react'

const ChatWindow = ({ selectedThreadId, onThreadCreated }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState(selectedThreadId || null)
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

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message: userMessage })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

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
    <div className='flex flex-col h-full w-full bg-white'>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
        <h1 className="text-sm font-semibold text-gray-700">
          {threadId ? 'Chat' : 'New Chat'}
        </h1>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>

        {messages.length === 0 && (
          <div className='flex h-full items-center justify-center'>
            <p className='text-gray-400 text-sm'>Send a message to start chatting</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {msg.role === 'assistant' && (
              <div className='mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 font-medium'>
                AI
              </div>
            )}

            <div className={`max-w-lg rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>

          </div>
        ))}

        {loading && (
          <div className='flex justify-start'>
            <div className='mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 font-medium'>
              AI
            </div>
            <div className='rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm'>
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
      <div className='border-t border-gray-200 p-4 bg-white'>
        <div className='flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-3 py-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder='Type a message...'
            disabled={loading}
            className='flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:opacity-50'
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className='rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
          >
            Send
          </button>
        </div>
        <p className='mt-1.5 text-center text-xs text-gray-400'>Press Enter to send</p>
      </div>

    </div>
  )
}

export default ChatWindow