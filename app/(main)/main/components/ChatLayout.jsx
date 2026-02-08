import React from 'react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'

const ChatLayout = () => {
  return (
    <div className='flex w-full h-full overflow-hidden'>
      <ChatSidebar />
      <ChatWindow />
    </div>
  )
}

export default ChatLayout
