import React, { useState } from 'react';
import { apiClient } from '../lib/api'; // ✅ updated import

interface UserLoginProps {
  onLogin: (customer: any) => void;
  currentCustomer?: any;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin, currentCustomer }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Updated to use apiClient
      const customer = await apiClient.getCustomerByEmail(email);
      onLogin(customer);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find customer');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogin(null);
  };

  if (currentCustomer) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 font-medium">Welcome back, {currentCustomer.name}!</p>
            <p className="text-green-600 text-sm">{currentCustomer.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Switch User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Identify Yourself</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Use "demo@example.com" for testing
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Continue Shopping'}
        </button>
      </form>
    </div>
  );
};

export default UserLogin;
