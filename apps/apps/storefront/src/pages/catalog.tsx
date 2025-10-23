import React, { useState, useEffect, useMemo } from 'react'
import { Product, api } from '../lib/api'
import { ProductCard } from '../components/molecules/product-card'
import { SearchBox } from '../components/molecules/search-box'
import { Button } from '../components/atoms/button'

type SortOption = 'price-asc' | 'price-desc' | 'name'

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name')
  const [selectedTag, setSelectedTag] = useState<string>('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.listProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    products.forEach(product => {
      product.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [products])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(product =>
        product.tags.includes(selectedTag)
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
        default:
          return a.title.localeCompare(b.title)
      }
    })

    return sorted
  }, [products, search, selectedTag, sort])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="text-lg text-gray-600">
          {filteredAndSortedProducts.length} products
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search products and tags..."
          />
        </div>
        
        <div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="input w-full"
          >
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input w-full"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setSelectedTag('')
            }}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalog