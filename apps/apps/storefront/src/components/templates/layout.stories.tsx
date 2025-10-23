import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from './layout'
import { ProductCard } from '../molecules/product-card'

// Mock data
const mockProduct = {
  id: 'prod-1',
  title: 'Wireless Headphones',
  price: 12999,
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
  tags: ['electronics', 'audio'],
  stockQty: 15
}

const meta: Meta<typeof Layout> = {
  title: 'Design System/Templates/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main application layout template including header, main content area, and support panel overlay.'
      }
    }
  },
  argTypes: {
    cartItemsCount: {
      control: { type: 'number', min: 0, max: 99 },
      description: 'Number of items in cart'
    },
    showSupportPanel: {
      control: 'boolean',
      description: 'Whether to show support panel overlay'
    },
    onSupportClick: {
      action: 'supportClicked'
    },
    onCartClick: {
      action: 'cartClicked'
    }
  },
  args: {
    cartItemsCount: 3,
    showSupportPanel: false
  }
}

export default meta
type Story = StoryObj<typeof Layout>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Storefront</h1>
        <p className="text-gray-600 mb-8">This is the main content area of the application.</p>
      </div>
    )
  }
}

export const WithProductGrid: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard product={mockProduct} />
          <ProductCard product={{...mockProduct, id: '2', title: 'Smart Watch'}} />
          <ProductCard product={{...mockProduct, id: '3', title: 'Phone Case'}} />
        </div>
      </div>
    )
  }
}

export const WithSupportPanel: Story = {
  args: {
    showSupportPanel: true,
    children: (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Catalog Page</h1>
        <p className="text-gray-600">Support panel is currently open (dark overlay visible).</p>
      </div>
    )
  }
}

export const EmptyCart: Story = {
  args: {
    cartItemsCount: 0,
    children: (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Catalog</h1>
        <p className="text-gray-600">Cart is currently empty.</p>
      </div>
    )
  }
}