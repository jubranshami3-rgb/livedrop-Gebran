import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

const ConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test: string, status: 'pass' | 'fail', message: string) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toISOString() }]);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Health Check
      try {
        const health = await apiClient.getBusinessMetrics();
        addTestResult('Backend Health', 'pass', 'Successfully connected to backend API');
      } catch (error) {
        addTestResult('Backend Health', 'fail', `Failed to connect: ${error.message}`);
      }

      // Test 2: Products API
      try {
        const products = await apiClient.getProducts({ limit: 1 });
        addTestResult('Products API', 'pass', `Found ${products.products?.length || 0} products`);
      } catch (error) {
        addTestResult('Products API', 'fail', `Failed: ${error.message}`);
      }

      // Test 3: Customer Lookup
      try {
        const customer = await apiClient.getCustomerByEmail('demo@example.com');
        addTestResult('Customer API', 'pass', `Found customer: ${customer.name}`);
      } catch (error) {
        addTestResult('Customer API', 'fail', `Failed: ${error.message}`);
      }

      // Test 4: Create Test Order
      try {
        const testOrder = {
          customerEmail: 'demo@example.com',
          items: [{ productId: 'test', quantity: 1 }],
          carrier: 'Test'
        };
        // This might fail due to invalid productId, but we're testing the connection
        await apiClient.createOrder(testOrder);
        addTestResult('Order API', 'pass', 'Order API is responsive');
      } catch (error) {
        if (error.response?.status === 404) {
          addTestResult('Order API', 'pass', 'Order API is responsive (expected product not found error)');
        } else {
          addTestResult('Order API', 'fail', `Failed: ${error.message}`);
        }
      }

    } catch (error) {
      addTestResult('Overall Test', 'fail', `Test suite failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connection Test</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Current API URL: <code className="bg-gray-200 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
            </code>
          </p>
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'pass' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{result.test}</h3>
                  <p className="text-gray-600 text-sm">{result.message}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'pass'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status === 'pass' ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-blue-800 list-disc list-inside space-y-1">
              {testResults.some(r => r.status === 'fail') ? (
                <>
                  <li>Check your backend URL in environment variables</li>
                  <li>Verify your backend is running and accessible</li>
                  <li>Check CORS configuration in your backend</li>
                  <li>Verify MongoDB connection in your backend</li>
                </>
              ) : (
                <>
                  <li>All connections working! Your frontend and backend are connected</li>
                  <li>You can now test the full application</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;