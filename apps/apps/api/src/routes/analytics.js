const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// GET daily revenue analytics - USING MONGODB AGGREGATION
router.get('/daily-revenue', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    // MONGODB AGGREGATION PIPELINE
    const dailyRevenue = await Order.aggregate([
      // Stage 1: Match orders by date range
      { $match: dateFilter },
      
      // Stage 2: Group by date (day level)
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      
      // Stage 3: Format the date and structure
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
          orderCount: 1
        }
      },
      
      // Stage 4: Sort by date
      { $sort: { date: 1 } }
    ]);

    res.json(dailyRevenue);
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data'
    });
  }
});

module.exports = router;