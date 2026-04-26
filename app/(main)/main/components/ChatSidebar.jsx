'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ChatSidebar = ({
  selectedThreadId,
  onSelectThread,
  onNewChat,
  refreshTrigger,
  sidebarOpen,
  onCloseSidebar,
}) => {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [refreshTrigger])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/threads')
      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      if (res.status === 429) {
        toast.error('Too many requests. Please wait and try again.')
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) setThreads(data)
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, threadId) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/threads/${threadId}`, { method: 'DELETE' })
      if (res.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      if (res.status === 429) {
        toast.error('Request limit reached. Try deleting again later.')
        return
      }
      if (res.ok) {
        setThreads(prev => prev.filter(t => t._id !== threadId))
        if (selectedThreadId === threadId) onNewChat()
      }
    } catch (error) {
      console.error('Failed to delete thread:', error)
    }
  }

  return (
    <>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={onCloseSidebar}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-72 flex-col border-r border-gray-200 bg-gray-50 text-gray-800 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h1 className="text-sm font-semibold text-gray-700">Chats</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 transition-colors"
            >
              + New
            </button>
            <button
              onClick={onCloseSidebar}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 md:hidden"
            >
              Close
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">

          {loading && (
            <p className="px-3 py-2 text-xs text-gray-400">Loading...</p>
          )}

          {!loading && threads.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">No chats yet. Start a new one!</p>
          )}

          {threads.map((thread) => (
            <div
              key={thread._id}
              onClick={() => onSelectThread(thread._id)}
              className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors ${
                selectedThreadId === thread._id
                  ? 'bg-gray-200 text-gray-900'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <p className="truncate text-sm">
                {thread.title || 'Untitled'}
              </p>

              <button
                onClick={(e) => handleDelete(e, thread._id)}
                className="shrink-0 text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 ml-2 transition-opacity"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ChatSidebar