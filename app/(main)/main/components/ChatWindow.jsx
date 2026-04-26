'use client'

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const ChatWindow = ({ selectedThreadId, onThreadCreated, onOpenSidebar }) => {
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

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

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
      if (res.status === 429) {
        toast.error('Request limit reached. Please wait before sending again.')
        return
      }

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429 && data?.error?.toLowerCase().includes('weekly limit')) {
          toast.error('Weekly chat limit reached. Please try again next week.')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'You have reached your weekly chat limit (6/week). Please try again next week.'
          }])
          return
        }
        throw new Error(data.error)
      }

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
    <div className='relative flex flex-col h-full w-full bg-gray-50'>

      {/* Header */}
      <div className="flex items-center border-b border-gray-200 px-3 py-3 bg-white md:px-4">
        <button
          onClick={onOpenSidebar}
          aria-label="Open chat list"
          className="mr-3 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors md:hidden active:scale-95"
        >
          ☰
        </button>
        <h1 className="flex-1 text-sm font-semibold text-gray-800 text-center md:text-left">
          {threadId ? 'Chat' : 'New Chat'}
        </h1>
        <div className="w-12 md:hidden" />
      </div>

      {/* Messages Container — content always sticks to bottom */}
      <div className='flex-1 overflow-y-auto bg-gray-50 pb-24 flex flex-col justify-end'>

        {/* Empty State – aligned at bottom naturally */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-end px-6 pt-8 pb-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
              <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className='text-gray-800 text-base font-semibold mb-2'>Start a conversation Test(CI-CD)</h3>
            <p className='text-gray-500 text-sm'>Ask me anything and I'll do my best to help!</p>
          </div>
        )}

        {/* Messages list */}
        {messages.length > 0 && (
          <div className="p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {msg.role === 'assistant' && (
                  <div className='mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white font-semibold'>
                    AI
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className='ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs text-white font-semibold'>
                    U
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className='flex justify-start'>
                <div className='mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white font-semibold'>
                  AI
                </div>
                <div className='rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm'>
                  <div className='flex space-x-1.5'>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]'></span>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]'></span>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]'></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Input */}
      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gray-50 md:p-4'>
        <div className='max-w-3xl mx-auto'>
          <div className='flex items-center gap-2 rounded-full bg-white border border-gray-300 px-4 py-2 shadow-lg hover:shadow-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all'>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder='Type your message...'
              disabled={loading}
              className='flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:opacity-50'
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className='shrink-0 rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95'
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ChatWindow