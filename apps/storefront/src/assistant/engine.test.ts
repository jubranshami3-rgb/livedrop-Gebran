import { describe, it, expect } from 'vitest'
import { processQuery } from './engine'

describe('assistant engine', () => {
  it('answers known policy questions', async () => {
    const response = await processQuery('What is your return policy?')
    
    expect(response.answer).toContain('30 days')
    expect(response.citation).toBe('[Q01]')
    expect(response.confidence).toBeGreaterThan(0.5)
  })

  it('refuses out-of-scope questions', async () => {
    const response = await processQuery('What is the meaning of life?')
    
    expect(response.answer).toContain('only answer questions about')
    expect(response.confidence).toBeLessThan(0.3)
  })

  it('includes order status when order ID is detected', async () => {
    const response = await processQuery('What about order ORDER-123456?')
    
    expect(response.answer).toContain('ORDER***3456')
    expect(response.answer).toContain('SHIPPED')
    expect(response.orderStatus).toBeDefined()
  })

  it('masks PII in responses', async () => {
    const response = await processQuery('Tell me about ORDER-123456789')
    
    expect(response.answer).toContain('ORDER***6789')
    expect(response.answer).not.toContain('ORDER-123456789')
  })
})