import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { Button } from '../atoms/button'
import { Input } from '../atoms/input'
import { useAssistant } from '../../assistant/context'

export const SupportPanel: React.FC = () => {
  const { isOpen, closeAssistant, messages, isLoading, sendMessage, clearMessages } = useAssistant()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const focusableElements = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAssistant()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscape)

    // Focus first element when opening
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeAssistant])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    await sendMessage(input)
    setInput('')
    // Return focus to input after sending
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-panel-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={closeAssistant}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="support-panel-title" className="text-lg font-semibold text-gray-900">
            Ask Support
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={closeAssistant}
            ref={closeButtonRef}
            aria-label="Close support panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>How can I help you today?</p>
              <p className="text-sm mt-2">Ask about orders, returns, shipping, or policies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    role="article"
                    aria-label={`${message.type === 'user' ? 'You said' : 'Support agent said'}: ${message.content}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.citation && (
                      <p className="text-xs opacity-75 mt-1" aria-label={`Citation: ${message.citation}`}>
                        {message.citation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div 
                    className="bg-gray-100 text-gray-900 rounded-lg p-3"
                    role="status"
                    aria-label="Loading response"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1"
              disabled={isLoading}
              aria-label="Type your support question"
              aria-required="true"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className="w-full mt-2"
              aria-label="Clear conversation"
            >
              Clear Conversation
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}