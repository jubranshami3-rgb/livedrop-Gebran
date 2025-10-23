const FunctionRegistry = require('../src/assistant/function-registry');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Function Calling System', () => {
  let functionRegistry;
  let mongoServer;
  let testCustomer;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    // Start in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // Create test data
    const Customer = require('../src/models/Customer');
    const Product = require('../src/models/Product');
    const Order = require('../src/models/Order');
    
    testCustomer = await Customer.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Test St',
        city: 'Testville',
        state: 'TS',
        zipCode: '12345'
      }
    });

    testProduct = await Product.create({
      name: 'Test Product',
      description: 'A test product for unit testing',
      price: 99.99,
      category: 'electronics',
      tags: ['test', 'electronic'],
      stock: 10
    });

    testOrder = await Order.create({
      customerId: testCustomer._id,
      customerEmail: testCustomer.email,
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        quantity: 1
      }],
      total: 99.99,
      status: 'PROCESSING',
      carrier: 'Test Carrier',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    functionRegistry = new FunctionRegistry();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Function Registration', () => {
    test('should register all core functions', () => {
      const functions = functionRegistry.getAllFunctions();
      const functionNames = functions.map(f => f.name);
      
      expect(functionNames).toContain('getOrderStatus');
      expect(functionNames).toContain('searchProducts');
      expect(functionNames).toContain('getCustomerOrders');
      expect(functions.length).toBeGreaterThanOrEqual(3);
    });

    test('should return function schemas', () => {
      const schemas = functionRegistry.getFunctionSchemas();
      
      expect(schemas).toBeInstanceOf(Array);
      expect(schemas.length).toBeGreaterThan(0);
      
      const orderStatusSchema = schemas.find(s => s.name === 'getOrderStatus');
      expect(orderStatusSchema).toBeDefined();
      expect(orderStatusSchema.parameters).toBeDefined();
      expect(orderStatusSchema.parameters.required).toContain('orderId');
    });
  });

  describe('getOrderStatus Function', () => {
    test('should retrieve valid order status', async () => {
      const result = await functionRegistry.executeFunction('getOrderStatus', {
        orderId: testOrder._id.toString(),
        email: testCustomer.email
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.orderId).toBe(testOrder._id.toString());
      expect(result.data.status).toBe('PROCESSING');
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].name).toBe(testProduct.name);
    });

    test('should fail for non-existent order', async () => {
      const result = await functionRegistry.executeFunction('getOrderStatus', {
        orderId: new mongoose.Types.ObjectId().toString(),
        email: testCustomer.email
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not found/);
    });

    test('should fail for order belonging to different customer', async () => {
      const result = await functionRegistry.executeFunction('getOrderStatus', {
        orderId: testOrder._id.toString(),
        email: 'wrong@example.com'
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not found for this customer/);
    });
  });

  describe('searchProducts Function', () => {
    test('should search products by query', async () => {
      const result = await functionRegistry.executeFunction('searchProducts', {
        query: 'test product',
        limit: 5
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].name).toBe(testProduct.name);
      expect(result.data.products[0].price).toBe(testProduct.price);
    });

    test('should search products by category', async () => {
      const result = await functionRegistry.executeFunction('searchProducts', {
        category: 'electronics',
        limit: 5
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].category).toBe('electronics');
    });

    test('should respect price filters', async () => {
      const result = await functionRegistry.executeFunction('searchProducts', {
        maxPrice: 50,
        limit: 5
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(0); // Our test product is $99.99
    });

    test('should return empty array for no matches', async () => {
      const result = await functionRegistry.executeFunction('searchProducts', {
        query: 'nonexistent product name that wont match anything',
        limit: 5
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(0);
    });
  });

  describe('getCustomerOrders Function', () => {
    test('should retrieve customer orders', async () => {
      const result = await functionRegistry.executeFunction('getCustomerOrders', {
        email: testCustomer.email,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data.customer.name).toBe(testCustomer.name);
      expect(result.data.customer.email).toBe(testCustomer.email);
      expect(result.data.orders).toHaveLength(1);
      expect(result.data.orders[0].id).toBe(testOrder._id.toString());
      expect(result.data.orders[0].status).toBe('PROCESSING');
    });

    test('should fail for non-existent customer', async () => {
      const result = await functionRegistry.executeFunction('getCustomerOrders', {
        email: 'nonexistent@example.com',
        limit: 10
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Customer not found/);
    });

    test('should respect limit parameter', async () => {
      // Create additional test orders
      const Order = require('../src/models/Order');
      for (let i = 0; i < 3; i++) {
        await Order.create({
          customerId: testCustomer._id,
          customerEmail: testCustomer.email,
          items: [{
            productId: testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 1
          }],
          total: 99.99,
          status: 'PENDING',
          carrier: 'Test Carrier'
        });
      }

      const result = await functionRegistry.executeFunction('getCustomerOrders', {
        email: testCustomer.email,
        limit: 2
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(2);
    });
  });

  describe('Multiple Function Execution', () => {
    test('should execute multiple functions with limit', async () => {
      const functionCalls = [
        { name: 'getOrderStatus', arguments: { orderId: testOrder._id.toString() } },
        { name: 'searchProducts', arguments: { query: 'test', limit: 3 } },
        { name: 'getCustomerOrders', arguments: { email: testCustomer.email } } // This should be skipped due to limit
      ];

      const results = await functionRegistry.executeMultipleFunctions(functionCalls);

      expect(results).toHaveLength(2); // Max 2 calls
      expect(results[0].functionName).toBe('getOrderStatus');
      expect(results[1].functionName).toBe('searchProducts');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent function', async () => {
      const result = await functionRegistry.executeFunction('nonExistentFunction', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not found/);
    });

    test('should handle function execution errors', async () => {
      // This will cause a database error due to invalid ObjectId
      const result = await functionRegistry.executeFunction('getOrderStatus', {
        orderId: 'invalid-object-id'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});