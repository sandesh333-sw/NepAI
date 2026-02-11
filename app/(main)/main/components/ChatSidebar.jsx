import React from 'react'

const ChatSidebar = () => {
  return (
    <div className="flex h-full w-80 flex-col border-r border-gray-800 bg-black text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-sm font-semibold text-gray-200">
          New chat
        </h1>

        <button className="rounded-md bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700">
          +
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {['Project discussion', 'NepAI ideas', 'Random thoughts'].map(
          (title, i) => (
            <div
              key={i}
              className="group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-gray-800"
            >
              <p className="truncate text-sm text-gray-300 group-hover:text-white">
                {title}
              </p>

              <button className="text-xs text-red-500 opacity-0 group-hover:opacity-100">
                Delete
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ChatSidebar
