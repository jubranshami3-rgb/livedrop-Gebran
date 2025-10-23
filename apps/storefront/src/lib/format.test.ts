import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from './format'

describe('format', () => {
  describe('formatCurrency', () => {
    it('formats cents as dollars', () => {
      expect(formatCurrency(12999)).toBe('$129.99')
      expect(formatCurrency(100)).toBe('$1.00')
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date strings', () => {
      const date = '2024-01-15T10:30:00Z'
      expect(formatDate(date)).toMatch(/January 15, 2024/)
    })
  })
})