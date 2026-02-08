import React from 'react'

const ChatSidebar = () => {
  return (
    <div className="border flex flex-col w-80 h-full bg-amber-300">
      <div className="flex border justify-between p-2">
        <h1>New chat</h1>
        <span>button</span>
      </div>

      <div className="flex justify-between p-2">
        <h1>Title</h1>
        <span>Delete</span>
      </div>
    </div>
  )
}

export default ChatSidebar
