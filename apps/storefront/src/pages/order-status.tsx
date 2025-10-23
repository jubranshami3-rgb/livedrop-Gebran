import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Order, api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import { Button } from '../components/atoms/button'
import { Check, Package, Truck, Home } from 'lucide-react'

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return
      
      try {
        const orderData = await api.getOrderStatus(id)
        setOrder(orderData)
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  const getStatusSteps = (currentStatus: Order['status']) => {
    const steps = [
      { key: 'placed', label: 'Order Placed', icon: Check },
      { key: 'packed', label: 'Packed', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: Home }
    ] as const

    const currentIndex = steps.findIndex(step => step.key === currentStatus)
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading order status...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Return to Catalog</Button>
        </Link>
      </div>
    )
  }

  const statusSteps = getStatusSteps(order.status)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Order Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order #{order.id.slice(-8)}
        </h1>
        <p className="text-gray-600">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
        
        <div className="flex justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-green-500 -z-10 transition-all duration-500"
            style={{ 
              width: `${(statusSteps.findIndex(step => step.current || !step.completed) / (statusSteps.length - 1)) * 100}%` 
            }}
          ></div>

          {statusSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`text-sm font-medium mt-2 ${
                  step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {order.items.map((item) => (
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
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {order.carrier && (
              <div>
                <div className="font-medium text-gray-900">Carrier</div>
                <div className="text-gray-600">{order.carrier}</div>
              </div>
            )}
            
            {order.trackingNumber && (
              <div>
                <div className="font-medium text-gray-900">Tracking Number</div>
                <div className="text-gray-600">{order.trackingNumber}</div>
              </div>
            )}
            
            {order.estimatedDelivery && (
              <div>
                <div className="font-medium text-gray-900">Estimated Delivery</div>
                <div className="text-gray-600">{formatDate(order.estimatedDelivery)}</div>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Delivered</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus