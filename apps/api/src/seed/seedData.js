require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('..modelsCustomer');
const Product = require('..modelsProduct');
const Order = require('..modelsOrder');

 Connect to database
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () = {
  try {
     Clear existing data
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data...');

     Create customers
    const customers = [
      {
        name 'Sarah Johnson',
        email 'sarah.johnson@example.com',
        phone '+1-555-0101',
        address {
          street '123 Main St',
          city 'New York',
          state 'NY',
          zipCode '10001'
        }
      },
      {
        name 'Mike Chen',
        email 'mike.chen@example.com',
        phone '+1-555-0102',
        address {
          street '456 Oak Ave',
          city 'San Francisco',
          state 'CA',
          zipCode '94102'
        }
      },
      {
        name 'Emily Davis',
        email 'emily.davis@example.com',
        phone '+1-555-0103',
        address {
          street '789 Pine St',
          city 'Chicago',
          state 'IL',
          zipCode '60601'
        }
      },
       Add more customers...
      {
        name 'Demo User',   ⭐ TEST USER FOR EVALUATION
        email 'demo@example.com',
        phone '+1-555-DEMO',
        address {
          street '123 Demo Street',
          city 'Demo City',
          state 'DC',
          zipCode '12345'
        }
      }
    ];

    const createdCustomers = await Customer.insertMany(customers);
    console.log(`Created ${createdCustomers.length} customers`);

     Create products
    const products = [
      {
        name 'Wireless Bluetooth Headphones',
        description 'Premium noise-cancelling headphones with 30-hour battery life',
        price 149.99,
        category 'electronics',
        tags ['audio', 'wireless', 'bluetooth'],
        imageUrl 'imagesheadphones.jpg',
        stock 25
      },
      {
        name 'Organic Cotton T-Shirt',
        description 'Comfortable and sustainable cotton t-shirt in various colors',
        price 24.99,
        category 'clothing',
        tags ['clothing', 'organic', 'casual'],
        imageUrl 'imagestshirt.jpg',
        stock 100
      },
      {
        name 'Stainless Steel Water Bottle',
        description '1L insulated water bottle that keeps drinks cold for 24 hours',
        price 34.99,
        category 'home',
        tags ['kitchen', 'eco-friendly', 'hydration'],
        imageUrl 'imageswater-bottle.jpg',
        stock 50
      },
      {
        name 'Programming Fundamentals Book',
        description 'Comprehensive guide to programming basics and best practices',
        price 39.99,
        category 'books',
        tags ['education', 'programming', 'learning'],
        imageUrl 'imagesprogramming-book.jpg',
        stock 30
      },
      {
        name 'Yoga Mat Premium',
        description 'Non-slip yoga mat with carrying strap and alignment markers',
        price 59.99,
        category 'sports',
        tags ['fitness', 'yoga', 'exercise'],
        imageUrl 'imagesyoga-mat.jpg',
        stock 40
      },
       Add more products to reach 20-30...
      {
        name 'Smart Fitness Watch',
        description 'Track your heart rate, steps, and sleep with this advanced smartwatch',
        price 199.99,
        category 'electronics',
        tags ['fitness', 'smartwatch', 'health'],
        imageUrl 'imagessmartwatch.jpg',
        stock 15
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

     Create orders
    const orders = [];
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    
     Create orders for demo user (⭐ has 2-3 orders as required)
    const demoUser = createdCustomers.find(c = c.email === 'demo@example.com');
    
     Demo user orders
    orders.push({
      customerId demoUser._id,
      customerEmail demoUser.email,
      items [
        {
          productId createdProducts[0]._id,
          name createdProducts[0].name,
          price createdProducts[0].price,
          quantity 1
        },
        {
          productId createdProducts[1]._id,
          name createdProducts[1].name,
          price createdProducts[1].price,
          quantity 2
        }
      ],
      total createdProducts[0].price + (createdProducts[1].price  2),
      status 'DELIVERED',
      carrier 'FedEx',
      estimatedDelivery new Date(Date.now() - 2  24  60  60  1000),  2 days ago
      createdAt new Date(Date.now() - 7  24  60  60  1000)  1 week ago
    });

    orders.push({
      customerId demoUser._id,
      customerEmail demoUser.email,
      items [
        {
          productId createdProducts[4]._id,
          name createdProducts[4].name,
          price createdProducts[4].price,
          quantity 1
        }
      ],
      total createdProducts[4].price,
      status 'SHIPPED',
      carrier 'UPS',
      estimatedDelivery new Date(Date.now() + 3  24  60  60  1000),  3 days from now
      createdAt new Date(Date.now() - 2  24  60  60  1000)  2 days ago
    });

     Create more orders for other customers...
    for (let i = 0; i  15; i++) {
      const randomCustomer = createdCustomers[Math.floor(Math.random()  createdCustomers.length)];
      const randomStatus = statuses[Math.floor(Math.random()  statuses.length)];
      const itemCount = Math.floor(Math.random()  3) + 1;  1-3 items
      
      const orderItems = [];
      let orderTotal = 0;
      
      for (let j = 0; j  itemCount; j++) {
        const randomProduct = createdProducts[Math.floor(Math.random()  createdProducts.length)];
        const quantity = Math.floor(Math.random()  2) + 1;  1-2 quantity
        
        orderItems.push({
          productId randomProduct._id,
          name randomProduct.name,
          price randomProduct.price,
          quantity quantity
        });
        
        orderTotal += randomProduct.price  quantity;
      }

      orders.push({
        customerId randomCustomer._id,
        customerEmail randomCustomer.email,
        items orderItems,
        total parseFloat(orderTotal.toFixed(2)),
        status randomStatus,
        carrier ['UPS', 'FedEx', 'USPS'][Math.floor(Math.random()  3)],
        estimatedDelivery new Date(Date.now() + Math.floor(Math.random()  10)  24  60  60  1000),
        createdAt new Date(Date.now() - Math.floor(Math.random()  30)  24  60  60  1000)
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`Created ${createdOrders.length} orders`);

    console.log('🎉 Database seeded successfully!');
    console.log('⭐ Test user demo@example.com');
    console.log('📊 Sample data ready for development');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database', error);
    process.exit(1);
  }
};

seedData();