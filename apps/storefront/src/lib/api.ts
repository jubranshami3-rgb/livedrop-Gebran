import catalogData from '../../public/mock-catalog.json'

export interface Product {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
  description?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  status: 'placed' | 'packed' | 'shipped' | 'delivered'
  items: CartItem[]
  total: number
  createdAt: string
  estimatedDelivery?: string
  carrier?: string
  trackingNumber?: string
}

// Mock data for orders
const mockOrders: Record<string, Order> = {
  'ORDER-123456': {
    id: 'ORDER-123456',
    status: 'shipped',
    items: [{
      product: catalogData[0],
      quantity: 1
    }],
    total: 12999,
    createdAt: '2024-01-15T10:30:00Z',
    estimatedDelivery: '2024-01-20',
    carrier: 'FastShip',
    trackingNumber: 'TRK-789012'
  },
  'ORDER-789012': {
    id: 'ORDER-789012',
    status: 'delivered',
    items: [{
      product: catalogData[1],
      quantity: 2
    }],
    total: 5998,
    createdAt: '2024-01-10T14:20:00Z',
    estimatedDelivery: '2024-01-15',
    carrier: 'QuickDeliver',
    trackingNumber: 'TRK-345678'
  }
}

export const api = {
  async listProducts(): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return catalogData
  },

  async getProduct(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return catalogData.find(product => product.id === id) || null
  },

  async getOrderStatus(id: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockOrders[id] || null
  },

  async placeOrder(cart: CartItem[]): Promise<{ orderId: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate a random order ID
    const orderId = `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create a new order with 'placed' status
    mockOrders[orderId] = {
      id: orderId,
      status: 'placed',
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      createdAt: new Date().toISOString()
    }

    return { orderId }
  }
}