import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from '../components/templates/layout'
import { ProductCard } from '../components/molecules/product-card'
import { SearchBox } from '../components/molecules/search-box'
import { Button } from '../components/atoms/button'

const mockProducts = [
  {
    id: 'prod-1',
    title: 'Wireless Bluetooth Headphones',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
    tags: ['electronics', 'audio'],
    stockQty: 15
  },
  {
    id: 'prod-2',
    title: 'Organic Cotton T-Shirt',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
    tags: ['clothing', 'organic'],
    stockQty: 0
  },
  {
    id: 'prod-3',
    title: 'Stainless Steel Water Bottle',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&h=200&fit=crop',
    tags: ['kitchen', 'eco-friendly'],
    stockQty: 28
  }
]

const meta: Meta = {
  title: 'Pages/Catalog',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Catalog page displaying products with search and filtering capabilities.'
      }
    }
  }
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Layout cartItemsCount={3}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">Discover our collection of premium products</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SearchBox
            value=""
            onChange={() => {}}
            placeholder="Search products and tags..."
          />
        </div>
        
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Sort by Name</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>

        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Tags</option>
          <option>Electronics</option>
          <option>Clothing</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onAddToCart={() => console.log('Add to cart:', product.title)}
          />
        ))}
      </div>
    </Layout>
  )
}

export const EmptyState: Story = {
  render: () => (
    <Layout cartItemsCount={0}>
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No products found</div>
        <Button variant="outline">Clear filters</Button>
      </div>
    </Layout>
  )
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: () => (
    <Layout cartItemsCount={2}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Products</h1>
      </div>

      <div className="space-y-4 mb-6">
        <SearchBox value="" onChange={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Sort by</option>
          </select>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Tags</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockProducts.slice(0, 2).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Layout>
  )
}