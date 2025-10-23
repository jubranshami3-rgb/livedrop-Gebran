class OrderSSE {
  constructor() {
    this.clients = new Map(); // orderId -> [response objects]
    this.simulations = new Map(); // orderId -> simulation interval
  }

  // Add client to SSE connection
  addClient(orderId, res) {
    if (!this.clients.has(orderId)) {
      this.clients.set(orderId, []);
    }
    this.clients.get(orderId).push(res);
    
    console.log(`SSE: Client connected to order ${orderId}. Total clients: ${this.clients.get(orderId).length}`);
    
    // Remove client when connection closes
    req.on('close', () => {
      this.removeClient(orderId, res);
    });
  }

  // Remove client from SSE connection
  removeClient(orderId, res) {
    const clients = this.clients.get(orderId);
    if (clients) {
      const index = clients.indexOf(res);
      if (index > -1) {
        clients.splice(index, 1);
        console.log(`SSE: Client disconnected from order ${orderId}. Remaining: ${clients.length}`);
      }
      
      if (clients.length === 0) {
        this.clients.delete(orderId);
        this.stopSimulation(orderId);
      }
    }
  }

  // Send event to all clients watching an order
  sendEvent(orderId, data) {
    const clients = this.clients.get(orderId);
    if (clients) {
      clients.forEach(client => {
        try {
          client.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          console.error('SSE: Error sending event to client:', error);
          this.removeClient(orderId, client);
        }
      });
    }
  }

  // Start auto-progression simulation for an order
  startSimulation(orderId, initialStatus) {
    if (this.simulations.has(orderId)) {
      console.log(`SSE: Simulation already running for order ${orderId}`);
      return;
    }

    console.log(`SSE: Starting auto-progression simulation for order ${orderId}`);

    const statusFlow = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(initialStatus);
    
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
      console.log(`SSE: Order ${orderId} already at final status: ${initialStatus}`);
      return;
    }

    let progressIndex = currentIndex;

    const progressOrder = async () => {
      progressIndex++;
      if (progressIndex < statusFlow.length) {
        const newStatus = statusFlow[progressIndex];
        
        try {
          // Update order in database
          const Order = require('../models/Order');
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { 
              status: newStatus,
              updatedAt: new Date()
            },
            { new: true }
          ).populate('customerId', 'name email');

          if (updatedOrder) {
            console.log(`SSE: Order ${orderId} progressed to ${newStatus}`);
            
            // Send SSE event to all connected clients
            this.sendEvent(orderId, {
              type: 'STATUS_UPDATE',
              order: updatedOrder,
              timestamp: new Date().toISOString()
            });

            // If delivered, stop simulation and close connections
            if (newStatus === 'DELIVERED') {
              console.log(`SSE: Order ${orderId} delivered. Stopping simulation.`);
              
              // Send final event and close connections
              setTimeout(() => {
                this.sendEvent(orderId, {
                  type: 'ORDER_DELIVERED',
                  order: updatedOrder,
                  timestamp: new Date().toISOString(),
                  message: 'Order has been delivered successfully!'
                });

                // Close all connections for this order
                this.closeOrderConnections(orderId);
              }, 2000);
              
              this.stopSimulation(orderId);
            }
          }
        } catch (error) {
          console.error(`SSE: Error updating order ${orderId}:`, error);
          this.stopSimulation(orderId);
        }
      } else {
        this.stopSimulation(orderId);
      }
    };

    // Calculate delays based on current status
    const getNextDelay = (currentStatus) => {
      switch (currentStatus) {
        case 'PENDING':
          return 3000 + Math.random() * 2000; // 3-5 seconds
        case 'PROCESSING':
          return 5000 + Math.random() * 2000; // 5-7 seconds  
        case 'SHIPPED':
          return 5000 + Math.random() * 2000; // 5-7 seconds
        default:
          return 5000;
      }
    };

    // Start the progression chain
    const scheduleNextProgress = () => {
      const currentStatus = statusFlow[progressIndex];
      const delay = getNextDelay(currentStatus);
      
      const timeoutId = setTimeout(() => {
        progressOrder();
        if (progressIndex < statusFlow.length - 1 && newStatus !== 'DELIVERED') {
          scheduleNextProgress();
        }
      }, delay);

      this.simulations.set(orderId, timeoutId);
    };

    // Start the progression
    scheduleNextProgress();
  }

  // Stop simulation for an order
  stopSimulation(orderId) {
    const timeoutId = this.simulations.get(orderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.simulations.delete(orderId);
      console.log(`SSE: Stopped simulation for order ${orderId}`);
    }
  }

  // Close all connections for an order
  closeOrderConnections(orderId) {
    const clients = this.clients.get(orderId);
    if (clients) {
      clients.forEach(client => {
        try {
          client.end();
        } catch (error) {
          console.error('SSE: Error closing client connection:', error);
        }
      });
      this.clients.delete(orderId);
    }
    this.stopSimulation(orderId);
  }

  // Get active connections count
  getStats() {
    return {
      activeConnections: Array.from(this.clients.values()).reduce((sum, arr) => sum + arr.length, 0),
      activeSimulations: this.simulations.size,
      watchedOrders: this.clients.size
    };
  }
}

// Create singleton instance
const orderSSE = new OrderSSE();

module.exports = orderSSE;