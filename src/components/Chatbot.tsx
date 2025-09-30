"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Trash2,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatRequest {
  query: string
  conversation_history: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  is_end: boolean
}

interface ChatResponse {
  response: string
  conversation_id?: string
}

const glass = "rounded-2xl bg-white/80 shadow-lg backdrop-blur-md border border-white/20 dark:border-white/10 dark:bg-white/10"

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-conversation')
    const savedConversationId = localStorage.getItem('chatbot-conversation-id')
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Error loading conversation history:', error)
      }
    }
    
    if (savedConversationId) {
      setConversationId(savedConversationId)
    }
  }, [])

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot-conversation', JSON.stringify(messages))
    }
    if (conversationId) {
      localStorage.setItem('chatbot-conversation-id', conversationId)
    }
  }, [messages, conversationId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date()
    }

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Prepare conversation history for API (all previous messages + current user message)
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))

      // Call your FastAPI RAG chatbot
      const requestBody: ChatRequest = {
        query: input.trim(),
        conversation_history: conversationHistory,
        is_end: false
      }

      console.log('Sending request to API:', requestBody)

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data: ChatResponse = await response.json()
      console.log('Received response from API:', data)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      }

      // Add bot message to the conversation
      setMessages(prev => [...prev, botMessage])
      
      // Update conversation ID if provided
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the assistant. Please make sure the FastAPI server is running on http://localhost:8000",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = async () => {
    // Send end conversation signal to FastAPI
    if (messages.length > 0) {
      try {
        const endRequest: ChatRequest = {
          query: "",
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          is_end: true
        }

        await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endRequest),
        })
      } catch (error) {
        console.error('Error sending end conversation signal:', error)
      }
    }

    // Clear local state
    setMessages([])
    setConversationId(null)
    localStorage.removeItem('chatbot-conversation')
    localStorage.removeItem('chatbot-conversation-id')
  }

  const handleCloseChat = async () => {
    // Send end conversation signal when closing chat if there are messages
    if (messages.length > 0) {
      try {
        const endRequest: ChatRequest = {
          query: "",
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          is_end: true
        }

        await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endRequest),
        })
      } catch (error) {
        console.error('Error sending end conversation signal:', error)
      }
    }
    
    setIsOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  return (
    <>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[#0F2D46] to-[#123458] hover:from-[#123458] hover:to-[#0F2D46] text-white shadow-2xl border-0"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px]"
          >
            <Card className={`h-full flex flex-col ${glass} border-0 shadow-2xl`}>
              <CardHeader className="pb-3 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-[#0F2D46] to-[#123458] rounded-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg bg-gradient-to-r from-[#0F2D46] to-[#123458] bg-clip-text text-transparent">
                      Water Assistant
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-[#123458]">
                      AI
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearConversation}
                      className="h-8 w-8 text-gray-500 hover:text-[#123458]"
                      title="Clear conversation"
                      disabled={messages.length === 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCloseChat}
                      className="h-8 w-8 text-gray-500 hover:text-[#123458]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ask me about rainwater harvesting, structures, or water conservation
                </p>
              </CardHeader>

              <CardContent className="flex-1 p-4 flex flex-col">
                {/* Messages Container with Custom Scrollbar */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 max-h-[30vh] mb-4 pr-2
                    /* Custom scrollbar styles */
                    scrollbar-thin 
                    scrollbar-track-transparent 
                    scrollbar-thumb-gray-300 
                    scrollbar-thumb-rounded-full
                    hover:scrollbar-thumb-gray-400
                    dark:scrollbar-thumb-gray-600
                    dark:hover:scrollbar-thumb-gray-500
                    /* Smooth scrolling */
                    scroll-smooth
                    /* Hide scrollbar when not hovering */
                    scrollbar-track-transparent"
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                      <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Hello! I'm your water conservation assistant.</p>
                      <p className="text-xs mt-1">Ask me about rainwater harvesting systems.</p>
                      <div className="mt-4 text-left">
                        <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• What is rainwater harvesting?</li>
                          <li>• Tell me about RCC tanks</li>
                          <li>• How much does a recharge pit cost?</li>
                          <li>• What maintenance is required?</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            message.role === "user" 
                              ? "bg-gradient-to-r from-[#0F2D46] to-[#123458] text-white" 
                              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-[#0F2D46] to-[#123458] text-white rounded-br-none"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === "user" ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about rainwater harvesting..."
                    className="flex-1 bg-white/60 dark:bg-white/10 border-gray-200 dark:border-white/10 focus:border-[#123458] dark:focus:border-blue-300"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-[#0F2D46] to-[#123458] hover:from-[#123458] hover:to-[#0F2D46] text-white border-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}