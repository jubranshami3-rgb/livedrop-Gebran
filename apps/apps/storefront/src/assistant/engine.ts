import groundTruth from './ground-truth.json'
import { api } from '../lib/api'

export interface AssistantResponse {
  answer: string
  citation?: string
  confidence: number
  orderStatus?: any
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function calculateScore(question: string, query: string): number {
  const questionWords = new Set(normalizeText(question).split(' '))
  const queryWords = normalizeText(query).split(' ')
  
  let matches = 0
  for (const word of queryWords) {
    if (questionWords.has(word) && word.length > 2) {
      matches++
    }
  }
  
  return matches / queryWords.length
}

function extractOrderId(text: string): string | null {
  const orderIdMatch = text.match(/[A-Z0-9]{8,}/)
  return orderIdMatch ? orderIdMatch[0] : null
}

function maskPii(text: string): string {
  return text.replace(/([A-Z0-9]{4})[A-Z0-9]+([A-Z0-9]{4})/g, '$1***$2')
}

export async function processQuery(query: string): Promise<AssistantResponse> {
  const normalizedQuery = normalizeText(query)
  const orderId = extractOrderId(query)
  
  let orderStatus = null
  if (orderId) {
    orderStatus = await api.getOrderStatus(orderId)
  }

  // Calculate scores for all Q&A pairs
  const scoredResults = groundTruth.map(qa => ({
    ...qa,
    score: calculateScore(qa.question + ' ' + qa.category, normalizedQuery)
  }))

  // Find the best match
  const bestMatch = scoredResults.reduce((best, current) => 
    current.score > best.score ? current : best
  )

  // If confidence is too low, refuse to answer
  if (bestMatch.score < 0.3) {
    return {
      answer: "I can only answer questions about returns, shipping, payments, orders, and general policies. Please contact support for other inquiries.",
      confidence: 0
    }
  }

  let answer = bestMatch.answer
  const citation = `[${bestMatch.qid}]`

  // Combine with order status if available
  if (orderStatus) {
    const maskedOrderId = maskPii(orderStatus.id)
    const statusInfo = `Order ${maskedOrderId} is ${orderStatus.status.toUpperCase()}.`
    
    if (orderStatus.carrier && orderStatus.estimatedDelivery) {
      answer = `${statusInfo} Shipped via ${orderStatus.carrier}, estimated delivery ${orderStatus.estimatedDelivery}. ${answer}`
    } else {
      answer = `${statusInfo} ${answer}`
    }
  }

  return {
    answer: maskPii(answer),
    citation,
    confidence: bestMatch.score,
    orderStatus
  }
}

// OpenAI fallback (optional)
export async function processWithOpenAI(query: string, apiKey: string): Promise<AssistantResponse> {
  if (!apiKey) {
    return processQuery(query) // Fallback to local matching
  }

  try {
    // This would be the actual OpenAI API call
    // For now, we'll just use the local matcher
    return processQuery(query)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return processQuery(query) // Fallback to local matching
  }
}