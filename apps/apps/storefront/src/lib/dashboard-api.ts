import { api } from './api';
import { BusinessMetrics, PerformanceMetrics, AssistantStats, SystemHealth, RevenueAnalytics } from '../types/dashboard';

export const dashboardApi = {
  // Business Metrics
  getBusinessMetrics: async (): Promise<BusinessMetrics> => {
    const response = await api.get('/api/dashboard/business-metrics');
    return response.data;
  },

  // Performance Metrics
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await api.get('/api/dashboard/performance');
    return response.data;
  },

  // Assistant Stats
  getAssistantStats: async (): Promise<AssistantStats> => {
    const response = await api.get('/api/dashboard/assistant-stats');
    return response.data;
  },

  // System Health
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await api.get('/api/dashboard/system-health');
    return response.data;
  },

  // Revenue Analytics
  getRevenueAnalytics: async (period: string = '30d'): Promise<RevenueAnalytics> => {
    const response = await api.get(`/api/dashboard/revenue-analytics?period=${period}`);
    return response.data;
  }
};