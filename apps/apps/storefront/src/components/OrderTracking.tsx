import React, { useState, useEffect } from 'react';
import { SSEClient, OrderUpdateEvent } from '../lib/sse-client';

interface OrderTrackingProps {
  orderId: string;
  onClose?: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [events, setEvents] = useState<OrderUpdateEvent[]>([]);

  useEffect(() => {
    if (!orderId) return;

    const sseClient = new SSEClient(
      (event) => {
        setLastUpdate(new Date(event.timestamp).toLocaleTimeString());
        setEvents(prev => [...prev, event].slice(-10)); // Keep last 10 events

        switch (event.type) {
          case 'CONNECTED':
            setConnectionStatus('connected');
            if (event.order) setCurrentOrder(event.order);
            break;
          
          case 'STATUS_UPDATE':
            if (event.order) setCurrentOrder(event.order);
            break;
          
          case 'ORDER_DELIVERED':
            if (event.order) setCurrentOrder(event.order);
            setConnectionStatus('closed');
            break;
          
          case 'ERROR':
            setConnectionStatus('error');
            break;
        }
      },
      (error) => {
        console.error('SSE error:', error);
        setConnectionStatus('error');
      },
      () => {
        setConnectionStatus('connected');
      }
    );

    sseClient.connect(orderId);

    return () => {
      sseClient.disconnect();
    };
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusProgress = (status: string) => {
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
          <div className={`text-sm ${getConnectionStatusColor()}`}>
            {connectionStatus.toUpperCase()}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to order tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
          <p className="text-gray-600">Order #{currentOrder._id.slice(-8)}</p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {connectionStatus.toUpperCase()}
          </div>
          {lastUpdate && (
            <div className="text-xs text-gray-500">Last update: {lastUpdate}</div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Order Placed</span>
          <span>Processing</span>
          <span>Shipped</span>
          <span>Delivered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${getStatusProgress(currentOrder.status)}%` }}
          ></div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Current Status</h3>
            <p className="text-gray-600">Your order is currently</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
            {currentOrder.status}
          </span>
        </div>

        {/* Status Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Carrier:</span>
            <p className="text-gray-800">{currentOrder.carrier}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Estimated Delivery:</span>
            <p className="text-gray-800">
              {currentOrder.estimatedDelivery 
                ? new Date(currentOrder.estimatedDelivery).toLocaleDateString()
                : 'Calculating...'
              }
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Last Updated:</span>
            <p className="text-gray-800">
              {new Date(currentOrder.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
        <div className="space-y-3">
          {currentOrder.items.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t font-semibold">
          <span className="text-gray-800">Total</span>
          <span className="text-lg text-gray-800">${currentOrder.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Live Events Log */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Live Updates</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.slice().reverse().map((event, index) => (
            <div key={index} className="flex items-start text-sm">
              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                event.type === 'ERROR' ? 'bg-red-500' : 
                event.type === 'ORDER_DELIVERED' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-gray-800">
                  {event.type === 'CONNECTED' && '🔗 Connected to order tracking'}
                  {event.type === 'STATUS_UPDATE' && `🔄 Order status updated to ${event.order?.status}`}
                  {event.type === 'ORDER_DELIVERED' && '🎉 Order delivered successfully!'}
                  {event.type === 'ERROR' && '❌ Connection error'}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close Tracking
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;