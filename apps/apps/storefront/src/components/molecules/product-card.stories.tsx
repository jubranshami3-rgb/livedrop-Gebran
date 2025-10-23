import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ProductCard } from './product-card'
import { Product } from '../../lib/api'

// Mock product data
const mockProduct: Product = {
  id: 'prod-1',
  title: 'Wireless Bluetooth Headphones with Noise Cancellation',
  price: 12999,
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
  tags: ['electronics', 'audio', 'wireless', 'premium'],
  stockQty: 15,
  description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.'
}

const meta: Meta<typeof ProductCard> = {
  title: 'Design System/Molecules/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Product card component displaying product information with add to cart functionality. Used in catalog grids and related products.'
      }
    }
  },
  argTypes: {
    product: {
      control: 'object',
      description: 'Product data object'
    },
    onAddToCart: {
      action: 'addToCart',
      description: 'Callback when add to cart is clicked'
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state for add to cart button'
    }
  },
  args: {
    product: mockProduct,
    isLoading: false
  }
}

export default meta
type Story = StoryObj<typeof ProductCard>

export const Default: Story = {
  args: {
    product: mockProduct
  }
}

export const LowStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stockQty: 3,
      title: 'Limited Edition Smart Watch'
    }
  }
}

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stockQty: 0,
      title: 'Vintage Record Player'
    }
  }
}

export const LongTitle: Story = {
  args: {
    product: {
      ...mockProduct,
      title: 'Premium Wireless Bluetooth Over-Ear Headphones with Active Noise Cancellation and 40-Hour Battery Life'
    }
  }
}

export const ManyTags: Story = {
  args: {
    product: {
      ...mockProduct,
      tags: ['electronics', 'audio', 'wireless', 'noise-cancelling', 'premium', 'bluetooth']
    }
  }
}

export const LoadingState: Story = {
  args: {
    isLoading: true
  }
}

export const ProductGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard product={mockProduct} />
      <ProductCard product={{
        ...mockProduct,
        id: 'prod-2',
        title: 'Organic Cotton T-Shirt',
        price: 2999,
        stockQty: 0,
        tags: ['clothing', 'organic']
      }} />
      <ProductCard product={{
        ...mockProduct,
        id: 'prod-3',
        title: 'Smart Fitness Watch',
        price: 19999,
        stockQty: 5,
        tags: ['electronics', 'fitness']
      }} />
    </div>
  )
}