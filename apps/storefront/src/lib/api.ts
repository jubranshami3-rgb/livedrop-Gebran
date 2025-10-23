import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
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

  getCustomerById: async (id: string) => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  // Product endpoints
  getProducts: async (params?: {
    search?: string;
    tag?: string;
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Order endpoints
  createOrder: async (orderData: {
    customerEmail: string;
    items: Array<{ productId: string; quantity: number }>;
    carrier?: string;
  }) => {
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
  }
};

export { api };