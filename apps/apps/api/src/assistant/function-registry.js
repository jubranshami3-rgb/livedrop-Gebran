const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

class FunctionRegistry {
  constructor() {
    this.functions = new Map();
    this.registerCoreFunctions();
  }

  registerCoreFunctions() {
    // Function 1: Get Order Status
    this.register({
      name: 'getOrderStatus',
      description: 'Get the current status and details of an order',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID to look up'
          },
          email: {
            type: 'string',
            description: 'Customer email for verification'
          }
        },
        required: ['orderId']
      },
      execute: async (args) => {
        try {
          const { orderId, email } = args;
          
          // Find order
          const order = await Order.findById(orderId).populate('customerId', 'email');
          
          if (!order) {
            return {
              success: false,
              error: `Order ${orderId} not found`
            };
          }

          // Verify customer owns this order (if email provided)
          if (email && order.customerId.email !== email) {
            return {
              success: false,
              error: 'Order not found for this customer'
            };
          }

          return {
            success: true,
            data: {
              orderId: order._id,
              status: order.status,
              total: order.total,
              items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),
              carrier: order.carrier,
              estimatedDelivery: order.estimatedDelivery,
              createdAt: order.createdAt
            }
          };
        } catch (error) {
          console.error('Error in getOrderStatus:', error);
          return {
            success: false,
            error: 'Failed to retrieve order status'
          };
        }
      }
    });

    // Function 2: Search Products
    this.register({
      name: 'searchProducts',
      description: 'Search for products by name, category, or tags',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for product name or description'
          },
          category: {
            type: 'string',
            description: 'Filter by category (electronics, clothing, home, etc.)'
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum price filter'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 5
          }
        }
      },
      execute: async (args) => {
        try {
          const { query, category, maxPrice, limit = 5 } = args;
          
          let searchCriteria = {};
          
          if (query) {
            searchCriteria.$or = [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ];
          }
          
          if (category) {
            searchCriteria.category = category;
          }
          
          if (maxPrice) {
            searchCriteria.price = { $lte: maxPrice };
          }

          const products = await Product.find(searchCriteria)
            .limit(limit)
            .select('name description price category tags imageUrl stock');

          return {
            success: true,
            data: {
              products: products.map(p => ({
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                tags: p.tags,
                imageUrl: p.imageUrl,
                inStock: p.stock > 0
              })),
              total: products.length
            }
          };
        } catch (error) {
          console.error('Error in searchProducts:', error);
          return {
            success: false,
            error: 'Failed to search products'
          };
        }
      }
    });

    // Function 3: Get Customer Orders
    this.register({
      name: 'getCustomerOrders',
      description: 'Get all orders for a customer',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Customer email address'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of orders to return',
            default: 10
          }
        },
        required: ['email']
      },
      execute: async (args) => {
        try {
          const { email, limit = 10 } = args;
          
          // Find customer
          const customer = await Customer.findOne({ email: email.toLowerCase() });
          
          if (!customer) {
            return {
              success: false,
              error: 'Customer not found'
            };
          }

          const orders = await Order.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id status total items carrier estimatedDelivery createdAt');

          return {
            success: true,
            data: {
              customer: {
                name: customer.name,
                email: customer.email
              },
              orders: orders.map(order => ({
                id: order._id,
                status: order.status,
                total: order.total,
                itemCount: order.items.length,
                carrier: order.carrier,
                estimatedDelivery: order.estimatedDelivery,
                createdAt: order.createdAt
              })),
              totalOrders: orders.length
            }
          };
        } catch (error) {
          console.error('Error in getCustomerOrders:', error);
          return {
            success: false,
            error: 'Failed to retrieve customer orders'
          };
        }
      }
    });
  }

  register(functionDef) {
    this.functions.set(functionDef.name, functionDef);
  }

  getFunction(name) {
    return this.functions.get(name);
  }

  getAllFunctions() {
    return Array.from(this.functions.values());
  }

  getFunctionSchemas() {
    return this.getAllFunctions().map(func => ({
      name: func.name,
      description: func.description,
      parameters: func.parameters
    }));
  }

  async executeFunction(name, args) {
    const func = this.getFunction(name);
    
    if (!func) {
      return {
        success: false,
        error: `Function ${name} not found`
      };
    }

    try {
      const result = await func.execute(args);
      return {
        ...result,
        functionName: name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error executing function ${name}:`, error);
      return {
        success: false,
        error: `Execution failed: ${error.message}`,
        functionName: name,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeMultipleFunctions(functionCalls) {
    const results = [];
    
    for (const call of functionCalls.slice(0, 2)) { // Max 2 calls
      const result = await this.executeFunction(call.name, call.arguments);
      results.push(result);
    }
    
    return results;
  }
}

module.exports = FunctionRegistry;