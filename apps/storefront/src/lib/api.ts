import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Customer endpoints
  getCustomerByEmail: async (email: string) => {
    const response = await api.get(`/api/customers?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Product endpoints
  getProducts: async (params?: any) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Order endpoints
  createOrder: async (orderData: any) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  getCustomerOrders: async (customerId: string) => {
    const response = await api.get(`/api/orders?customerId=${customerId}`);
    return response.data;
  },

  // Analytics endpoints
  getDailyRevenue: async (from?: string, to?: string) => {
    const response = await api.get('/api/analytics/daily-revenue', {
      params: { from, to }
    });
    return response.data;
  },

  // Dashboard endpoints
  getBusinessMetrics: async () => {
    const response = await api.get('/api/dashboard/business-metrics');
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get('/api/dashboard/performance');
    return response.data;
  },

  getAssistantStats: async () => {
    const response = await api.get('/api/dashboard/assistant-stats');
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await api.get('/api/dashboard/system-health');
    return response.data;
  },

  getRevenueAnalytics: async (period: string = '30d') => {
    const response = await api.get(`/api/dashboard/revenue-analytics?period=${period}`);
    return response.data;
  }
};

export { api };