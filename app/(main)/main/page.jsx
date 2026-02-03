"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import toast, { Toaster } from 'react-hot-toast';

// Lucide icons (you'll need to install: npm install lucide-react)
import { 
  SendIcon, 
  Loader2Icon, 
  PlusIcon, 
  MessageSquareIcon, 
  TrashIcon, 
  MenuIcon, 
  XIcon, 
  SparklesIcon 
} from "lucide-react";

export default function Main() {
  const { user, isLoaded } = useUser();
  
  // State management
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch threads when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      fetchThreads();
    }
  }, [isLoaded, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  // API calls
  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      } else {
        toast.error("Failed to load conversations");
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
      toast.error("Failed to load conversations");
    }
  };

  const loadThread = async (threadId) => {
    try {
      setCurrentThreadId(threadId);
      const response = await fetch(`/api/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setError(null);
        toast.success("Conversation loaded");
      } else {
        setError("Failed to load conversation");
        toast.error("Failed to load conversation");
      }
    } catch (error) {
      console.error("Failed to load thread:", error);
      setError("Failed to load conversation");
      toast.error("Failed to load conversation");
    }
  };

  const deleteThread = async (threadId, e) => {
    e.stopPropagation();
    
    const toastId = toast.loading("Deleting conversation...");
    
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setThreads(threads.filter((t) => t._id !== threadId));
        if (currentThreadId === threadId) {
          startNewChat();
        }
        toast.success("Conversation deleted", { id: toastId });
      } else {
        toast.error("Failed to delete", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      toast.error("Failed to delete", { id: toastId });
    }
  };

  const startNewChat = () => {
    setCurrentThreadId(null);
    setMessages([]);
    setInput("");
    setError(null);
    toast.success("New chat started");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Optimistically add user message to UI
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    const toastId = toast.loading("Sending message...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: currentThreadId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add assistant reply to messages
      const assistantMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If this was a new thread, update threadId and refresh sidebar
      if (!currentThreadId && data.threadId) {
        setCurrentThreadId(data.threadId);
        fetchThreads();
      }

      toast.success("Response received", { id: toastId });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      toast.error("Failed to send message", { id: toastId });
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-50">
      {/* Toast Container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* ========== SIDEBAR ========== */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5" />
              Chat History
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all font-medium shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <MessageSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-xs mt-1 opacity-75">Start chatting to create one!</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {threads.map((thread) => (
                <div
                  key={thread._id}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                    currentThreadId === thread._id
                      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => loadThread(thread._id)}
                >
                  <MessageSquareIcon className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{thread.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {new Date(thread.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteThread(thread._id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${
                      currentThreadId === thread._id
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-200"
                    }`}
                    aria-label="Delete thread"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <SparklesIcon className="w-4 h-4" />
            <span>Powered by GPT-4o-mini</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========== MAIN CHAT AREA ========== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentThreadId ? "Chat" : "New Conversation"}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome, {user?.firstName || "there"}!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md text-lg">
                Start a conversation with AI. Ask me anything, and I'll do my best to help!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Explain quantum computing",
                  "Write a poem about coding",
                  "Help me debug my code",
                  "Suggest a project idea",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-5 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all text-left text-sm text-gray-700 font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages List
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold shadow-sm">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ maxHeight: "200px" }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                ) : (
                  <SendIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to send, 
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono ml-1">Shift + Enter</kbd> for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}