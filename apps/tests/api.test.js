const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server'); // Your Express app

describe('API Endpoints', () => {
  let mongoServer;
  let testCustomer;
  let testProduct;
  let testOrder;
  let authToken; // If you implement auth later

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test data
    const Customer = require('../src/models/Customer');
    const Product = require('../src/models/Product');
    const Order = require('../src/models/Order');

    testCustomer = await Customer.create({
      name: 'API Test User',
      email: 'api_test@example.com',
      phone: '+1-555-API-TEST',
      address: {
        street: '456 API Test Ave',
        city: 'Test City',
        state: 'TC',
        zipCode: '54321'
      }
    });

    testProduct = await Product.create({
      name: 'API Test Product',
      description: 'Product for API endpoint testing',
      price: 149.99,
      category: 'electronics',
      tags: ['api-test', 'electronics'],
      imageUrl: '/images/test-product.jpg',
      stock: 25
    });

    testOrder = await Order.create({
      customerId: testCustomer._id,
      customerEmail: testCustomer.email,
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        quantity: 2
      }],
      total: 299.98,
      status: 'PENDING',
      carrier: 'API Test Carrier',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBe('test');
    });
  });

  describe('Customer Endpoints', () => {
    test('GET /api/customers?email= should return customer by email', async () => {
      const response = await request(app)
        .get(`/api/customers?email=${testCustomer.email}`)
        .expect(200);

      expect(response.body.email).toBe(testCustomer.email);
      expect(response.body.name).toBe(testCustomer.name);
      expect(response.body.phone).toBe(testCustomer.phone);
    });

    test('GET /api/customers?email= should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers?email=nonexistent@example.com')
        .expect(404);

      expect(response.body.error).toMatch(/not found/);
    });

    test('GET /api/customers/:id should return customer by ID', async () => {
      const response = await request(app)
        .get(`/api/customers/${testCustomer._id}`)
        .expect(200);

      expect(response.body._id).toBe(testCustomer._id.toString());
      expect(response.body.email).toBe(testCustomer.email);
    });
  });

  describe('Product Endpoints', () => {
    test('GET /api/products should return products array', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.products[0].name).toBeDefined();
      expect(response.body.products[0].price).toBeDefined();
    });

    test('GET /api/products should support search', async () => {
      const response = await request(app)
        .get('/api/products?search=API Test')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('API Test Product');
    });

    test('GET /api/products should support category filter', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(response.body.products.length).toBeGreaterThan(0);
      expect(response.body.products.every(p => p.category === 'electronics')).toBe(true);
    });

    test('GET /api/products/:id should return specific product', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body._id).toBe(testProduct._id.toString());
      expect(response.body.name).toBe(testProduct.name);
      expect(response.body.price).toBe(testProduct.price);
    });

    test('GET /api/products/:id should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get(`/api/products/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(response.body.error).toMatch(/not found/);
    });
  });

  describe('Order Endpoints', () => {
    test('POST /api/orders should create new order', async () => {
      const newOrder = {
        customerEmail: testCustomer.email,
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1
          }
        ],
        carrier: 'Test Shipping'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body._id).toBeDefined();
      expect(response.body.customerEmail).toBe(testCustomer.email);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(testProduct.price);
      expect(response.body.status).toBe('PENDING');
    });

    test('POST /api/orders should return 404 for non-existent customer', async () => {
      const newOrder = {
        customerEmail: 'nonexistent@example.com',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(404);

      expect(response.body.error).toMatch(/Customer not found/);
    });

    test('POST /api/orders should return 404 for non-existent product', async () => {
      const newOrder = {
        customerEmail: testCustomer.email,
        items: [
          {
            productId: new mongoose.Types.ObjectId().toString(),
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(404);

      expect(response.body.error).toMatch(/Product not found/);
    });

    test('POST /api/orders should return 400 for insufficient stock', async () => {
      // Create a low-stock product
      const Product = require('../src/models/Product');
      const lowStockProduct = await Product.create({
        name: 'Low Stock Item',
        description: 'Item with very low stock',
        price: 19.99,
        category: 'electronics',
        stock: 1
      });

      const newOrder = {
        customerEmail: testCustomer.email,
        items: [
          {
            productId: lowStockProduct._id.toString(),
            quantity: 5 // More than available stock
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(400);

      expect(response.body.error).toMatch(/Insufficient stock/);
    });

    test('GET /api/orders/:id should return specific order', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .expect(200);

      expect(response.body._id).toBe(testOrder._id.toString());
      expect(response.body.customerEmail).toBe(testCustomer.email);
      expect(response.body.items).toHaveLength(1);
    });

    test('GET /api/orders?customerId= should return customer orders', async () => {
      const response = await request(app)
        .get(`/api/orders?customerId=${testCustomer._id}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].customerId).toBe(testCustomer._id.toString());
    });
  });

  describe('Analytics Endpoints', () => {
    test('GET /api/analytics/daily-revenue should return revenue data', async () => {
      const response = await request(app)
        .get('/api/analytics/daily-revenue')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      // Should use MongoDB aggregation, not JavaScript reduce
    });

    test('GET /api/analytics/daily-revenue should support date range', async () => {
      const fromDate = '2024-01-01';
      const toDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/analytics/daily-revenue?from=${fromDate}&to=${toDate}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body.error).toMatch(/not found/);
    });

    test('should return JSON error format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id-format')
        .expect(500); // Will throw CastError

      expect(response.body.error).toBeDefined();
    });
  });
});