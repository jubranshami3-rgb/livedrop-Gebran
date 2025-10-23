import React from 'react'
import { Product } from '../../lib/api'
import { formatCurrency } from '../../lib/format'
import { Button } from '../atoms/button'
import { LazyImage } from '../atoms/lazy-image'
import { useCartStore } from '../../lib/store'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = () => {
    addItem(product)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAddToCart()
    }
  }

  return (
    <article 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      aria-labelledby={`product-title-${product.id}`}
    >
      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
        <LazyImage
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover"
          width={300}
          height={192}
        />
      </div>
      
      <div className="p-4">
        <h3 
          id={`product-title-${product.id}`}
          className="font-semibold text-gray-900 mb-2 line-clamp-2"
        >
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900" aria-label={`Price: ${formatCurrency(product.price)}`}>
            {formatCurrency(product.price)}
          </span>
          <span 
            className={`text-sm ${
              product.stockQty > 10 ? 'text-green-600' : 
              product.stockQty > 0 ? 'text-orange-600' : 'text-red-600'
            }`}
            aria-live="polite"
          >
            {product.stockQty > 10 ? 'In Stock' : 
             product.stockQty > 0 ? `Only ${product.stockQty} left` : 'Out of Stock'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3" aria-label="Product tags">
          {product.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button
          onClick={handleAddToCart}
          onKeyPress={handleKeyPress}
          disabled={product.stockQty === 0}
          className="w-full"
          aria-label={`Add ${product.title} to cart`}
          aria-describedby={`product-stock-${product.id}`}
        >
          {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        {/* Hidden element for screen readers to announce stock status */}
        <div id={`product-stock-${product.id}`} className="sr-only">
          {product.stockQty > 10 ? 'In stock' : 
           product.stockQty > 0 ? `Low stock, only ${product.stockQty} remaining` : 'Out of stock'}
        </div>
      </div>
    </article>
  )
}