import React, { useState } from 'react';
import OrderTracking from '../components/OrderTracking';
import { apiClient } from '../lib/api';

const OrderTrackingTest: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId) {
      setCurrentOrderId(orderId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">SSE Order Tracking Test</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Order ID to track:
            </label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste order ID here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Tracking
          </button>
        </form>

        {currentOrderId && (
          <OrderTracking 
            orderId={currentOrderId}
            onClose={() => setCurrentOrderId('')}
          />
        )}
      </div>
    </div>
  );
};

export default OrderTrackingTest;