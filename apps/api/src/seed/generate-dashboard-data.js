require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

const generateDashboardData = async () => {
  try {
    console.log('Generating dashboard test data...');

    // Get existing customers and products
    const customers = await Customer.find().limit(5);
    const products = await Product.find().limit(10);

    if (customers.length === 0 || products.length === 0) {
      console.log('Please run the main seed script first');
      process.exit(1);
    }

    // Generate orders for the last 90 days
    const orders = [];
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    
    for (let i = 0; i < 200; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let total = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity
        });
        
        total += product.price * quantity;
      }

      // Make status distribution realistic
      let status;
      if (daysAgo < 1) status = 'PENDING';
      else if (daysAgo < 3) status = 'PROCESSING';
      else if (daysAgo < 7) status = 'SHIPPED';
      else status = 'DELIVERED';

      orders.push({
        customerId: customer._id,
        customerEmail: customer.email,
        items: orderItems,
        total: parseFloat(total.toFixed(2)),
        status: status,
        carrier: ['UPS', 'FedEx', 'USPS'][Math.floor(Math.random() * 3)],
        estimatedDelivery: new Date(orderDate.getTime() + (7 * 24 * 60 * 60 * 1000)),
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await Order.insertMany(orders);
    console.log(`Generated ${orders.length} orders for dashboard testing`);
    console.log('Dashboard data ready! Visit /admin to see the dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    process.exit(1);
  }
};

generateDashboardData();