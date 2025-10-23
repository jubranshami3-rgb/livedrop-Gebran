export interface BusinessMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  maxOrderValue: number;
  minOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  ordersByStatus: {
    [status: string]: {
      count: number;
      revenue: number;
    };
  };
}

export interface PerformanceMetrics {
  apiLatency: string;
  averageResponseTime: number;
  failedRequests: number;
  successfulRequests: number;
  activeConnections: number;
  activeSimulations: number;
  watchedOrders: number;
  databaseStatus: string;
  uptime: string;
  uptimeSeconds: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastUpdated: string;
}

export interface AssistantStats {
  totalQueries: number;
  averageResponseTime: number;
  errorRate: number;
  errors: number;
  startTime: string;
  intentDistribution: {
    [intent: string]: number;
  };
  functionCalls: {
    [functionName: string]: number;
  };
  responseTimePercentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
  queriesLastHour: number;
  queriesLast24Hours: number;
}

export interface SystemHealth {
  overallStatus: string;
  components: {
    database: {
      status: string;
      lastChecked: string;
    };
    llmService: {
      status: string;
      endpoint: string;
      lastChecked: string;
    };
    sseService: {
      status: string;
      activeConnections: number;
      activeSimulations: number;
    };
    apiServer: {
      status: string;
      uptime: number;
      memory: NodeJS.MemoryUsage;
    };
  };
  lastUpdated: string;
}

export interface RevenueAnalytics {
  period: string;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  totalRevenue: number;
  totalOrders: number;
}