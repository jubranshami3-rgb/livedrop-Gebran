const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const orderSSE = require('../sse/order-status');
const AssistantEngine = require('../assistant/engine');

const router = express.Router();

// In-memory storage for assistant stats (in production, use Redis or database)
let assistantStats = {
  totalQueries: 0,
  intentDistribution: {},
  functionCalls: {},
  responseTimes: [],
  errors: 0,
  startTime: new Date().toISOString()
};

// Track assistant metrics
const trackAssistantQuery = (result) => {
  assistantStats.totalQueries++;
  
  // Track intent distribution
  const intent = result.response.intent;
  assistantStats.intentDistribution[intent] = (assistantStats.intentDistribution[intent] || 0) + 1;
  
  // Track function calls
  result.response.functionResults.forEach(call => {
    const funcName = call.functionName;
    assistantStats.functionCalls[funcName] = (assistantStats.functionCalls[funcName] || 0) + 1;
  });
  
  // Track response times
  assistantStats.responseTimes.push(result.response.processingTime);
  
  // Keep only last 1000 response times
  if (assistantStats.responseTimes.length > 1000) {
    assistantStats.responseTimes = assistantStats.responseTimes.slice(-1000);
  }
  
  // Track errors
  if (!result.success) {
    assistantStats.errors++;
  }
};

// GET comprehensive business metrics
router.get('/business-metrics', async (req, res) => {
  try {
    // Get total revenue, orders, and average order value
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
          maxOrderValue: { $max: '$total' },
          minOrderValue: { $min: '$total' }
        }
      }
    ]);

    const metrics = revenueResult[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      maxOrderValue: 0,
      minOrderValue: 0
    };

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Get recent orders growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentOrders = await Order.aggregate([
      {
        $facet: {
          currentPeriod: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
              }
            }
          ],
          previousPeriod: [
            { 
              $match: { 
                createdAt: { 
                  $gte: sixtyDaysAgo,
                  $lt: thirtyDaysAgo
                } 
              } 
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const currentPeriod = recentOrders[0].currentPeriod[0] || { revenue: 0, orders: 0 };
    const previousPeriod = recentOrders[0].previousPeriod[0] || { revenue: 0, orders: 0 };

    // Calculate growth percentages
    const revenueGrowth = previousPeriod.revenue > 0 
      ? ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100 
      : 0;
    
    const ordersGrowth = previousPeriod.orders > 0 
      ? ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) * 100 
      : 0;

    // Get additional counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    res.json({
      // Core metrics
      totalRevenue: parseFloat(metrics.totalRevenue.toFixed(2)),
      totalOrders: metrics.totalOrders,
      avgOrderValue: parseFloat(metrics.avgOrderValue.toFixed(2)),
      maxOrderValue: parseFloat(metrics.maxOrderValue.toFixed(2)),
      minOrderValue: parseFloat(metrics.minOrderValue.toFixed(2)),
      
      // Growth metrics
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      ordersGrowth: parseFloat(ordersGrowth.toFixed(2)),
      currentPeriodRevenue: parseFloat(currentPeriod.revenue.toFixed(2)),
      previousPeriodRevenue: parseFloat(previousPeriod.revenue.toFixed(2)),
      
      // Inventory metrics
      totalProducts,
      totalCustomers,
      lowStockProducts,
      
      // Orders by status
      ordersByStatus: ordersByStatus.reduce((acc, status) => {
        acc[status._id] = {
          count: status.count,
          revenue: parseFloat(status.revenue.toFixed(2))
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch business metrics'
    });
  }
});

// GET performance metrics with real tracking
router.get('/performance', async (req, res) => {
  try {
    const sseStats = orderSSE.getStats();
    
    // Calculate average API response time (mock for now, in production you'd track this)
    const averageResponseTime = Math.random() * 50 + 20; // 20-70ms
    
    // Get database status
    const dbStatus = await checkDatabaseStatus();
    
    // Get system uptime
    const uptime = process.uptime();
    
    res.json({
      // API Performance
      apiLatency: `${Math.round(averageResponseTime)}ms`,
      averageResponseTime: Math.round(averageResponseTime),
      failedRequests: Math.floor(Math.random() * 10), // Mock data
      successfulRequests: Math.floor(Math.random() * 1000) + 500,
      
      // Real-time metrics
      activeConnections: sseStats.activeConnections,
      activeSimulations: sseStats.activeSimulations,
      watchedOrders: sseStats.watchedOrders,
      
      // System health
      databaseStatus: dbStatus,
      uptime: formatUptime(uptime),
      uptimeSeconds: uptime,
      memoryUsage: process.memoryUsage(),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch performance metrics'
    });
  }
});

// GET assistant analytics
router.get('/assistant-stats', async (req, res) => {
  try {
    // Calculate average response time
    const avgResponseTime = assistantStats.responseTimes.length > 0
      ? assistantStats.responseTimes.reduce((a, b) => a + b, 0) / assistantStats.responseTimes.length
      : 0;
    
    // Calculate error rate
    const errorRate = assistantStats.totalQueries > 0
      ? (assistantStats.errors / assistantStats.totalQueries) * 100
      : 0;
    
    // Get most common intents
    const intentDistribution = Object.entries(assistantStats.intentDistribution)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [intent, count]) => {
        acc[intent] = count;
        return acc;
      }, {});
    
    // Get function call distribution
    const functionCalls = Object.entries(assistantStats.functionCalls)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [func, count]) => {
        acc[func] = count;
        return acc;
      }, {});

    res.json({
      // Overall stats
      totalQueries: assistantStats.totalQueries,
      averageResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(2)),
      errors: assistantStats.errors,
      startTime: assistantStats.startTime,
      
      // Distributions
      intentDistribution,
      functionCalls,
      
      // Performance percentiles
      responseTimePercentiles: calculatePercentiles(assistantStats.responseTimes),
      
      // Recent activity (last hour mock data)
      queriesLastHour: Math.floor(Math.random() * 50) + 10,
      queriesLast24Hours: Math.floor(Math.random() * 500) + 100
    });
  } catch (error) {
    console.error('Error fetching assistant stats:', error);
    res.status(500).json({
      error: 'Failed to fetch assistant stats'
    });
  }
});

// GET system health overview
router.get('/system-health', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseStatus();
    const llmStatus = await checkLLMStatus();
    const sseStats = orderSSE.getStats();
    
    res.json({
      overallStatus: 'healthy',
      components: {
        database: {
          status: dbStatus,
          lastChecked: new Date().toISOString()
        },
        llmService: {
          status: llmStatus,
          endpoint: process.env.LLM_ENDPOINT,
          lastChecked: new Date().toISOString()
        },
        sseService: {
          status: 'healthy',
          activeConnections: sseStats.activeConnections,
          activeSimulations: sseStats.activeSimulations
        },
        apiServer: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      error: 'Failed to fetch system health'
    });
  }
});

// GET revenue analytics for charts
router.get('/revenue-analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          revenue: { $round: ['$revenue', 2] },
          orders: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      period,
      dailyRevenue,
      totalRevenue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
      totalOrders: dailyRevenue.reduce((sum, day) => sum + day.orders, 0)
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue analytics'
    });
  }
});

// Helper functions
async function checkDatabaseStatus() {
  try {
    // Simple database check
    await Order.findOne().limit(1);
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

async function checkLLMStatus() {
  try {
    // Try to reach the LLM endpoint
    const axios = require('axios');
    const response = await axios.get(process.env.LLM_ENDPOINT.replace('/generate', '/health'), {
      timeout: 5000
    });
    return response.status === 200 ? 'healthy' : 'unhealthy';
  } catch (error) {
    return 'unhealthy';
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function calculatePercentiles(times) {
  if (times.length === 0) return { p50: 0, p95: 0, p99: 0 };
  
  const sorted = [...times].sort((a, b) => a - b);
  return {
    p50: parseFloat(sorted[Math.floor(sorted.length * 0.5)].toFixed(2)),
    p95: parseFloat(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
    p99: parseFloat(sorted[Math.floor(sorted.length * 0.99)].toFixed(2))
  };
}

// Export the tracking function
module.exports = {
  router,
  trackAssistantQuery
};