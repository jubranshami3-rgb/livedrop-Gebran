import React, { createContext, useContext, useState } from 'react'
import { processQuery } from './engine'

interface AssistantState {
  isOpen: boolean
  messages: Array<{
    id: string
    type: 'user' | 'assistant'
    content: string
    citation?: string
    timestamp: Date
  }>
  isLoading: boolean
}

interface AssistantContextType extends AssistantState {
  openAssistant: () => void
  closeAssistant: () => void
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AssistantState>({
    isOpen: false,
    messages: [],
    isLoading: false
  })

  const openAssistant = () => setState(prev => ({ ...prev, isOpen: true }))
  const closeAssistant = () => setState(prev => ({ ...prev, isOpen: false }))

  const sendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }))

    try {
      const response = await processQuery(message)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: response.answer,
        citation: response.citation,
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }))
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: "I'm sorry, I encountered an error. Please try again or contact support.",
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }))
    }
  }

  const clearMessages = () => setState(prev => ({ ...prev, messages: [] }))

  return (
    <AssistantContext.Provider value={{
      ...state,
      openAssistant,
      closeAssistant,
      sendMessage,
      clearMessages
    }}>
      {children}
    </AssistantContext.Provider>
  )
}

export const useAssistant = () => {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}