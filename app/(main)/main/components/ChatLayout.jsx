'use client'

import React, { useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'

const ChatLayout = () => {
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId)
  }

  const handleNewChat = () => {
    setSelectedThreadId(null)
  }

  const handleThreadCreated = (threadId) => {
    setSelectedThreadId(threadId)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className='flex w-full h-full overflow-hidden bg-gray-100'>
      <ChatSidebar
        selectedThreadId={selectedThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
      />
      <ChatWindow
        selectedThreadId={selectedThreadId}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  )
}

export default ChatLayout