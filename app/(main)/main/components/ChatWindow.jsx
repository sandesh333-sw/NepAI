'use client'

import React, { useState } from 'react'

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! How can I help you today?', sender: 'ai' },
    { id: 2, text: 'I need help with my React project', sender: 'user' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: input, sender: 'user' }])
      setInput('')
    }
  }

  return (
    <div className='flex flex-col h-full w-full bg-black border-l border-gray-800'>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-200">
          Chat
        </h1>
        <button className="rounded-md bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700">
          •••
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-900 text-gray-300 border border-gray-800'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='border-t border-gray-800 p-4'>
        <div className='flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Type a message...'
            className='flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500'
          />
          <button
            onClick={handleSend}
            className='rounded-md bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-700'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow