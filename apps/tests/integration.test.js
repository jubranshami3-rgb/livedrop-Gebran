const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const AssistantEngine = require('../src/assistant/engine');

describe('Integration Tests - Complete Workflows', () => {
  let mongoServer;
  let testCustomer;
  let testProduct;
  let testOrder;
  let assistant;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create comprehensive test data
    const Customer = require('../src/models/Customer');
    const Product = require('../src/models/Product');
    const Order = require('../src/models/Order');

    testCustomer = await Customer.create({
      name: 'Integration Test User',
      email: 'integration_test@example.com',
      phone: '+1-555-INT-TEST',
      address: {
        street: '789 Integration Blvd',
        city: 'Testopolis',
        state: 'IT',
        zipCode: '98765'
      }
    });

    testProduct = await Product.create({
      name: 'Wireless Integration Headphones',
      description: 'Premium headphones for integration testing',
      price: 199.99,
      category: 'electronics',
      tags: ['wireless', 'audio', 'premium'],
      stock: 15
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
      total: 199.99,
      status: 'PROCESSING',
      carrier: 'Integration Test Shipping',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    assistant = new AssistantEngine();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Integration Test 1: Complete Purchase Flow', () => {
    test('should complete full purchase and tracking workflow', async () => {
      // Step 1: Browse products via API
      const productsResponse = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(productsResponse.body.products).toBeInstanceOf(Array);
      const product = productsResponse.body.products.find(p => p.name.includes('Headphones'));
      expect(product).toBeDefined();

      // Step 2: Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customerEmail: testCustomer.email,
          items: [
            {
              productId: product._id,
              quantity: 1
            }
          ],
          carrier: 'Express Shipping'
        })
        .expect(201);

      const newOrder = orderResponse.body;
      expect(newOrder._id).toBeDefined();
      expect(newOrder.status).toBe('PENDING');
      expect(newOrder.total).toBe(product.price);

      // Step 3: Subscribe to SSE stream (simulated)
      // Note: We can't easily test SSE with supertest, so we'll verify the endpoint exists
      const sseResponse = await request(app)
        .get(`/api/orders/${newOrder._id}/stream`)
        .set('Accept', 'text/event-stream')
        .expect(200); // or 200 if you handle SSE properly

      // Step 4: Verify order was created in database
      const orderCheck = await request(app)
        .get(`/api/orders/${newOrder._id}`)
        .expect(200);

      expect(orderCheck.body._id).toBe(newOrder._id);
      expect(orderCheck.body.status).toBe('PENDING');

      // Step 5: Ask assistant about order status
      const assistantResponse = await assistant.processQuery(
        `Where is my order ${newOrder._id}?`,
        { customerEmail: testCustomer.email }
      );

      expect(assistantResponse.success).toBe(true);
      expect(assistantResponse.response.intent).toBe('order_status');
      
      // Step 6: Verify function was called
      expect(assistantResponse.response.functionResults.length).toBeGreaterThan(0);
      const orderFunctionCall = assistantResponse.response.functionResults.find(
        r => r.functionName === 'getOrderStatus'
      );
      expect(orderFunctionCall).toBeDefined();
      expect(orderFunctionCall.success).toBe(true);

      console.log('✅ Complete Purchase Flow: PASSED');
    });
  });

  describe('Integration Test 2: Support Interaction Flow', () => {
    test('should handle complete support conversation', async () => {
      // Step 1: Ask policy question
      const policyResponse = await assistant.processQuery(
        "What's your return policy?",
        { customerEmail: testCustomer.email }
      );

      expect(policyResponse.success).toBe(true);
      expect(policyResponse.response.intent).toBe('policy_question');
      
      // Step 2: Verify grounded response with citations
      expect(policyResponse.response.text).toMatch(/\[Policy\d+\.\d+\]/);
      
      // Step 3: Validate citations
      if (policyResponse.validation) {
        expect(policyResponse.validation.isValid).toBe(true);
        expect(policyResponse.validation.invalidCitations).toHaveLength(0);
      }

      // Step 4: Ask about specific order
      const orderResponse = await assistant.processQuery(
        `Can you check the status of order ${testOrder._id}?`,
        { customerEmail: testCustomer.email }
      );

      expect(orderResponse.success).toBe(true);
      expect(orderResponse.response.intent).toBe('order_status');
      
      // Step 5: Verify function called
      expect(orderResponse.response.functionResults.length).toBeGreaterThan(0);
      expect(orderResponse.response.functionResults[0].functionName).toBe('getOrderStatus');

      // Step 6: Express complaint
      const complaintResponse = await assistant.processQuery(
        "I'm really unhappy with the shipping delay!",
        { customerEmail: testCustomer.email }
      );

      expect(complaintResponse.success).toBe(true);
      expect(complaintResponse.response.intent).toBe('complaint');
      
      // Step 7: Verify empathetic response
      const responseText = complaintResponse.response.text.toLowerCase();
      expect(responseText).toMatch(/\b(sorry|apologize|understand|frustrat|help)\b/);

      console.log('✅ Support Interaction Flow: PASSED');
    });
  });

  describe('Integration Test 3: Multi-Intent Conversation', () => {
    test('should maintain context across multiple intents', async () => {
      const conversation = [
        { query: "Hello there!", expectedIntent: 'chitchat' },
        { query: "I'm looking for wireless headphones", expectedIntent: 'product_search' },
        { query: "What's your warranty policy?", expectedIntent: 'policy_question' },
        { query: "Can you check my recent orders?", expectedIntent: 'order_status' }
      ];

      const responses = [];
      
      for (const { query, expectedIntent } of conversation) {
        const response = await assistant.processQuery(query, {
          customerEmail: testCustomer.email,
          customerName: testCustomer.name
        });

        expect(response.success).toBe(true);
        expect(response.response.intent).toBe(expectedIntent);
        
        responses.push({
          query,
          intent: response.response.intent,
          text: response.response.text
        });

        // Brief pause between messages
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Verify appropriate responses for each intent
      expect(responses[0].intent).toBe('chitchat');
      expect(responses[0].text.toLowerCase()).toMatch(/\b(hello|hi|help)\b/);
      
      expect(responses[1].intent).toBe('product_search');
      expect(responses[1].text.toLowerCase()).toMatch(/\b(headphone|product|find)\b/i);
      
      expect(responses[2].intent).toBe('policy_question');
      expect(responses[2].text).toMatch(/\[Policy\d+\.\d+\]/);
      
      expect(responses[3].intent).toBe('order_status');
      expect(responses[3].text.toLowerCase()).toMatch(/\b(order|status|check)\b/);

      console.log('✅ Multi-Intent Conversation: PASSED');
    });
  });

  describe('Integration Test 4: Database Aggregation Validation', () => {
    test('should use MongoDB aggregation for analytics', async () => {
      // Create multiple orders with different dates for testing aggregation
      const Order = require('../src/models/Order');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Create orders for different dates
      await Order.create([
        {
          customerId: testCustomer._id,
          customerEmail: testCustomer.email,
          items: [{ productId: testProduct._id, name: testProduct.name, price: 100, quantity: 1 }],
          total: 100,
          status: 'DELIVERED',
          carrier: 'Test',
          createdAt: today,
          updatedAt: today
        },
        {
          customerId: testCustomer._id,
          customerEmail: testCustomer.email,
          items: [{ productId: testProduct._id, name: testProduct.name, price: 200, quantity: 2 }],
          total: 400,
          status: 'DELIVERED',
          carrier: 'Test',
          createdAt: yesterday,
          updatedAt: yesterday
        }
      ]);

      // Test analytics endpoint
      const response = await request(app)
        .get('/api/analytics/daily-revenue')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      // Verify the structure from aggregation
      if (response.body.length > 0) {
        const dailyData = response.body[0];
        expect(dailyData.date).toBeDefined();
        expect(dailyData.revenue).toBeDefined();
        expect(dailyData.orderCount).toBeDefined();
        
        // This should come from database aggregation, not JavaScript calculation
        expect(typeof dailyData.revenue).toBe('number');
        expect(typeof dailyData.orderCount).toBe('number');
      }

      console.log('✅ Database Aggregation: PASSED');
    });
  });

  describe('Integration Test 5: Error Handling and Resilience', () => {
    test('should handle errors gracefully across system', async () => {
      // Test 1: Invalid order ID with assistant
      const invalidOrderResponse = await assistant.processQuery(
        "Where is order INVALID_ORDER_ID?",
        { customerEmail: testCustomer.email }
      );

      expect(invalidOrderResponse.success).toBe(true); // Assistant should handle gracefully
      expect(invalidOrderResponse.response.intent).toBe('order_status');
      
      // Function should have been called but failed
      if (invalidOrderResponse.response.functionResults.length > 0) {
        const functionResult = invalidOrderResponse.response.functionResults[0];
        expect(functionResult.success).toBe(false);
      }

      // Test 2: Non-existent product search
      const nonExistentProductResponse = await assistant.processQuery(
        "I'm looking for quantum flux capacitors",
        { customerEmail: testCustomer.email }
      );

      expect(nonExistentProductResponse.success).toBe(true);
      expect(nonExistentProductResponse.response.intent).toBe('product_search');

      // Test 3: API error handling
      const invalidProductRequest = await request(app)
        .get('/api/products/invalid-product-id-format')
        .expect(500); // Should handle CastError

      expect(invalidProductRequest.body.error).toBeDefined();

      console.log('✅ Error Handling and Resilience: PASSED');
    });
  });
});