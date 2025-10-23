import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Server,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { dashboardApi } from '../lib/dashboard-api';
import { BusinessMetrics, PerformanceMetrics, AssistantStats, SystemHealth, RevenueAnalytics } from '../types/dashboard';
import MetricCard from '../components/dashboard/MetricCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import RevenueChart from '../components/dashboard/RevenueChart';
import IntentDistributionChart from '../components/dashboard/IntentDistributionChart';
import FunctionCallsChart from '../components/dashboard/FunctionCallsChart';

const AdminDashboard: React.FC = () => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [assistantStats, setAssistantStats] = useState<AssistantStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        businessData,
        performanceData,
        assistantData,
        healthData,
        revenueData
      ] = await Promise.all([
        dashboardApi.getBusinessMetrics(),
        dashboardApi.getPerformanceMetrics(),
        dashboardApi.getAssistantStats(),
        dashboardApi.getSystemHealth(),
        dashboardApi.getRevenueAnalytics('30d')
      ]);

      setBusinessMetrics(businessData);
      setPerformanceMetrics(performanceData);
      setAssistantStats(assistantData);
      setSystemHealth(healthData);
      setRevenueAnalytics(revenueData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading && !businessMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and analytics for your e-commerce platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="auto-refresh" className="text-sm text-gray-600">
                Auto-refresh (30s)
              </label>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Business Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={businessMetrics ? formatCurrency(businessMetrics.totalRevenue) : '$0'}
          change={businessMetrics?.revenueGrowth}
          changeLabel="vs last period"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="Total Orders"
          value={businessMetrics ? formatNumber(businessMetrics.totalOrders) : '0'}
          change={businessMetrics?.ordersGrowth}
          changeLabel="vs last period"
          icon={<ShoppingCart className="w-6 h-6 text-green-600" />}
        />
        <MetricCard
          title="Customers"
          value={businessMetrics ? formatNumber(businessMetrics.totalCustomers) : '0'}
          icon={<Users className="w-6 h-6 text-purple-600" />}
        />
        <MetricCard
          title="Low Stock Items"
          value={businessMetrics ? formatNumber(businessMetrics.lowStockProducts) : '0'}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
        />
      </div>

      {/* Performance & Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">API Latency</span>
              <span className="font-medium">{performanceMetrics?.apiLatency || '0ms'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Connections</span>
              <span className="font-medium">{performanceMetrics?.activeConnections || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Watched Orders</span>
              <span className="font-medium">{performanceMetrics?.watchedOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Successful Requests</span>
              <span className="font-medium">{performanceMetrics?.successfulRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed Requests</span>
              <span className="font-medium text-red-600">{performanceMetrics?.failedRequests || 0}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Status</span>
              <StatusBadge 
                status={systemHealth?.overallStatus as any || 'unknown'} 
                label={systemHealth?.overallStatus || 'Unknown'}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <StatusBadge 
                status={systemHealth?.components.database.status as any || 'unknown'} 
                label={systemHealth?.components.database.status || 'Unknown'}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">LLM Service</span>
              <StatusBadge 
                status={systemHealth?.components.llmService.status as any || 'unknown'} 
                label={systemHealth?.components.llmService.status || 'Unknown'}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">SSE Service</span>
              <StatusBadge 
                status={systemHealth?.components.sseService.status as any || 'unknown'} 
                label={systemHealth?.components.sseService.status || 'Unknown'}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">{performanceMetrics?.uptime || '0m'}</span>
            </div>
          </div>
        </div>

        {/* Assistant Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Assistant Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Queries</span>
              <span className="font-medium">{assistantStats?.totalQueries || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-medium">{assistantStats?.averageResponseTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Error Rate</span>
              <span className="font-medium">{assistantStats?.errorRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Queries (Last Hour)</span>
              <span className="font-medium">{assistantStats?.queriesLastHour || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Since</span>
              <span className="font-medium text-sm">
                {assistantStats?.startTime ? new Date(assistantStats.startTime).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {revenueAnalytics && (
          <RevenueChart data={revenueAnalytics} type="line" />
        )}
        {assistantStats && (
          <IntentDistributionChart data={assistantStats} />
        )}
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueAnalytics && (
          <RevenueChart data={revenueAnalytics} type="bar" />
        )}
        {assistantStats && (
          <FunctionCallsChart data={assistantStats} />
        )}
      </div>

      {/* Orders by Status */}
      {businessMetrics?.ordersByStatus && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(businessMetrics.ordersByStatus).map(([status, data]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                <div className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</div>
                <div className="text-sm text-green-600">{formatCurrency(data.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;