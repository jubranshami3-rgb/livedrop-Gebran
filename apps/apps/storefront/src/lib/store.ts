import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './api'

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            }
          }
          
          return {
            items: [...state.items, { product, quantity: 1 }]
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.product.price * item.quantity), 0
        )
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Context provider for compatibility
import React from 'react'

export const CartContext = React.createContext<CartState | null>(null)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cartStore = useCartStore()
  return (
    <CartContext.Provider value={cartStore}>
      {children}
    </CartContext.Provider>
  )
}