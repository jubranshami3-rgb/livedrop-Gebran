require('dotenv').config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(10000);

// Global test fixtures and helpers
global.testHelpers = {
  // Wait for a condition to be true
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return true;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  // Generate random test data
  generateTestOrder: (customerId, products) => ({
    customerId,
    customerEmail: 'test@example.com',
    items: products.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: 1
    })),
    total: products.reduce((sum, p) => sum + p.price, 0),
    carrier: 'Test Carrier',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
};

// Close MongoDB connection after all tests
afterAll(async () => {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
});