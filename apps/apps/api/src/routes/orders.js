const express = require('express');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const orderSSE = require('../sse/order-status'); // Add this import

const router = express.Router();

// ... existing routes ...

// SSE endpoint for real-time order tracking
router.get('/:id/stream', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to order tracking',
      order: order,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Add client to SSE manager
    orderSSE.addClient(orderId, res);

    // Start auto-progression simulation if not already running
    if (order.status !== 'DELIVERED') {
      orderSSE.startSimulation(orderId, order.status);
    } else {
      // If already delivered, send final status and close
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({
          type: 'ORDER_DELIVERED',
          order: order,
          timestamp: new Date().toISOString(),
          message: 'Order was already delivered'
        })}\n\n`);
      }, 1000);
    }

    // Handle client disconnect
    req.on('close', () => {
      orderSSE.removeClient(orderId, res);
      console.log(`SSE: Client disconnected from order ${orderId}`);
    });

  } catch (error) {
    console.error('SSE: Error setting up stream:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to setup order tracking stream'
      });
    }
  }
});

// ... rest of existing routes ...