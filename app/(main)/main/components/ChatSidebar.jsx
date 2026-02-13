'use client'

import React, { useState, useEffect } from 'react'

const ChatSidebar = ({ selectedThreadId, onSelectThread, onNewChat, refreshTrigger }) => {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch threads on mount and when refreshTrigger changes (new thread created)
  useEffect(() => {
    fetchThreads()
  }, [refreshTrigger])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/threads')
      const data = await res.json()
      if (Array.isArray(data)) setThreads(data)
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, threadId) => {
    // Stop click from also selecting the thread
    e.stopPropagation()

    try {
      const res = await fetch(`/api/threads/${threadId}`, { method: 'DELETE' })
      if (res.ok) {
        setThreads(prev => prev.filter(t => t._id !== threadId))
        // If deleted thread was selected, clear the window
        if (selectedThreadId === threadId) onNewChat()
      }
    } catch (error) {
      console.error('Failed to delete thread:', error)
    }
  }

  return (
    <div className="flex h-full w-80 flex-col border-r border-gray-800 bg-black text-white shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-200">Chats</h1>
        <button
          onClick={onNewChat}
          className="rounded-md bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
        >
          + New
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {loading && (
          <p className="px-3 py-2 text-xs text-gray-500">Loading...</p>
        )}

        {!loading && threads.length === 0 && (
          <p className="px-3 py-2 text-xs text-gray-500">No chats yet. Start a new one!</p>
        )}

        {threads.map((thread) => (
          <div
            key={thread._id}
            onClick={() => onSelectThread(thread._id)}
            className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-gray-800 ${
              selectedThreadId === thread._id ? 'bg-gray-800' : ''
            }`}
          >
            <p className="truncate text-sm text-gray-300 group-hover:text-white">
              {thread.title || 'Untitled'}
            </p>

            <button
              onClick={(e) => handleDelete(e, thread._id)}
              className="shrink-0 text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 ml-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatSidebar