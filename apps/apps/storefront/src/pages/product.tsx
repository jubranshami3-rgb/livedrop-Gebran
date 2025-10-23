import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Product, api } from '../lib/api'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/atoms/button'
import { useCartStore } from '../lib/store'
import { ProductCard } from '../components/molecules/product-card'

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      
      try {
        const productData = await api.getProduct(id)
        setProduct(productData)

        if (productData) {
          // Load related products (same tag)
          const allProducts = await api.listProducts()
          const related = allProducts
            .filter(p => 
              p.id !== productData.id && 
              p.tags.some(tag => productData.tags.includes(tag))
            )
            .slice(0, 3)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addItem(product)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back to catalog */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        ← Back to Catalog
      </Link>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatCurrency(product.price)}
            </div>
            <div className={`text-lg font-medium ${
              product.stockQty > 10 ? 'text-green-600' : 
              product.stockQty > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {product.stockQty > 10 ? 'In Stock' : 
               product.stockQty > 0 ? `Only ${product.stockQty} left` : 'Out of Stock'}
            </div>
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stockQty === 0}
            size="lg"
            className="w-full md:w-auto"
          >
            {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPage