'use client'

import React, { useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'

const ChatLayout = () => {
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    setSelectedThreadId(null)
    setSidebarOpen(false)
  }

  const handleThreadCreated = (threadId) => {
    setSelectedThreadId(threadId)
    setRefreshTrigger(prev => prev + 1)
    setSidebarOpen(false)
  }

  return (
    <div className='flex w-full h-full overflow-hidden bg-gray-100'>
      <ChatSidebar
        selectedThreadId={selectedThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      <ChatWindow
        selectedThreadId={selectedThreadId}
        onThreadCreated={handleThreadCreated}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  )
}

export default ChatLayout