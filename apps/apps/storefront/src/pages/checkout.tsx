import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../lib/store'
import { formatCurrency } from '../lib/format'
import { api } from '../lib/api'
import { Button } from '../components/atoms/button'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const handlePlaceOrder = async () => {
    try {
      const { orderId } = await api.placeOrder(items)
      clearCart()
      navigate(`/order/${orderId}`)
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No items in cart</h1>
        <Link to="/">
          <Button>Return to Catalog</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.product.title}</div>
                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Stub */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Order</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">This is a demo checkout page.</p>
              <p>In a real application, this would include:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Shipping address form</li>
                <li>• Payment information</li>
                <li>• Order review</li>
                <li>• Secure payment processing</li>
              </ul>
            </div>

            <Button onClick={handlePlaceOrder} className="w-full" size="lg">
              Place Demo Order
            </Button>

            <Link to="/cart">
              <Button variant="outline" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout