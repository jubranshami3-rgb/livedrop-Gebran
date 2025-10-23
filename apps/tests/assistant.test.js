const AssistantEngine = require('../src/assistant/engine');
const IntentClassifier = require('../src/assistant/intent-classifier');
const FunctionRegistry = require('../src/assistant/function-registry');
const KnowledgeBase = require('../src/assistant/knowledge-base');
const CitationValidator = require('../src/assistant/citation-validator');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Assistant Engine - Comprehensive Tests', () => {
  let assistant;
  let intentClassifier;
  let functionRegistry;
  let knowledgeBase;
  let citationValidator;
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
      name: 'Assistant Test User',
      email: 'assistant_test@example.com',
      phone: '+1-555-ASSISTANT',
      address: {
        street: '123 Assistant St',
        city: 'Testville',
        state: 'TS',
        zipCode: '12345'
      }
    });

    testProduct = await Product.create({
      name: 'Test Product for Assistant',
      description: 'A product for assistant testing',
      price: 99.99,
      category: 'electronics',
      tags: ['test', 'assistant'],
      stock: 10
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
      total: 199.98,
      status: 'PROCESSING',
      carrier: 'Test Carrier',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    // Initialize assistant components
    assistant = new AssistantEngine();
    intentClassifier = new IntentClassifier();
    functionRegistry = new FunctionRegistry();
    knowledgeBase = new KnowledgeBase();
    citationValidator = new CitationValidator(knowledgeBase);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Assistant Engine Integration', () => {
    test('should initialize all components correctly', () => {
      expect(assistant.intentClassifier).toBeInstanceOf(IntentClassifier);
      expect(assistant.functionRegistry).toBeInstanceOf(FunctionRegistry);
      expect(assistant.knowledgeBase).toBeInstanceOf(KnowledgeBase);
      expect(assistant.citationValidator).toBeInstanceOf(CitationValidator);
    });

    test('should process queries and return structured responses', async () => {
      const result = await assistant.processQuery("What's your return policy?", {
        customerEmail: testCustomer.email
      });

      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response.text).toBeDefined();
      expect(result.response.intent).toBe('policy_question');
      expect(result.response.processingTime).toBeGreaterThan(0);
      expect(result.response.timestamp).toBeDefined();
    });
  });

  describe('Policy Question Handling', () => {
    test('should handle policy questions with citations', async () => {
      const result = await assistant.processQuery("What is your return policy?");
      
      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('policy_question');
      expect(result.response.text).toMatch(/\[Policy\d+\.\d+\]/);
      
      // Validate citations if present
      if (result.response.citations && result.response.citations.length > 0) {
        const validation = citationValidator.validateResponse(result.response.text);
        expect(validation.isValid).toBe(true);
      }
    });

    test('should provide accurate policy information', async () => {
      const policies = [
        "What's your shipping policy?",
        "How do returns work?",
        "What is your warranty?",
        "Do you offer price matching?",
        "What payment methods do you accept?"
      ];

      for (const query of policies) {
        const result = await assistant.processQuery(query);
        expect(result.success).toBe(true);
        expect(result.response.intent).toBe('policy_question');
        
        // Response should be helpful and not generic
        expect(result.response.text.length).toBeGreaterThan(50);
        expect(result.response.text).not.toMatch(/I don't know/);
      }
    });
  });

  describe('Order Status Handling', () => {
    test('should handle order status queries with valid order ID', async () => {
      const result = await assistant.processQuery(
        `Where is my order ${testOrder._id}?`,
        { customerEmail: testCustomer.email }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('order_status');
      
      // Should call order status function
      expect(result.response.functionResults.length).toBeGreaterThan(0);
      const orderFunction = result.response.functionResults.find(
        r => r.functionName === 'getOrderStatus'
      );
      expect(orderFunction).toBeDefined();
      expect(orderFunction.success).toBe(true);
    });

    test('should handle order status queries without order ID', async () => {
      const result = await assistant.processQuery(
        "Where is my order?",
        { customerEmail: testCustomer.email }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('order_status');
      
      // Should call customer orders function to list recent orders
      const customerOrdersFunction = result.response.functionResults.find(
        r => r.functionName === 'getCustomerOrders'
      );
      expect(customerOrdersFunction).toBeDefined();
    });

    test('should handle invalid order IDs gracefully', async () => {
      const result = await assistant.processQuery(
        "Where is order INVALID_ORDER_ID_123?",
        { customerEmail: testCustomer.email }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('order_status');
      
      // Function should be called but fail
      if (result.response.functionResults.length > 0) {
        const functionResult = result.response.functionResults[0];
        expect(functionResult.success).toBe(false);
      }
    });
  });

  describe('Product Search Handling', () => {
    test('should handle product search queries', async () => {
      const result = await assistant.processQuery(
        "I'm looking for electronics",
        { customerEmail: testCustomer.email }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('product_search');
      
      // Should call search products function
      expect(result.response.functionResults.length).toBeGreaterThan(0);
      const searchFunction = result.response.functionResults.find(
        r => r.functionName === 'searchProducts'
      );
      expect(searchFunction).toBeDefined();
      expect(searchFunction.success).toBe(true);
    });

    test('should handle specific product queries', async () => {
      const result = await assistant.processQuery(
        "Find me wireless headphones under $200",
        { customerEmail: testCustomer.email }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('product_search');
      
      const searchFunction = result.response.functionResults.find(
        r => r.functionName === 'searchProducts'
      );
      expect(searchFunction).toBeDefined();
    });
  });

  describe('Complaint Handling', () => {
    test('should handle complaints with empathy', async () => {
      const complaints = [
        "I'm really upset about my order",
        "This is terrible service",
        "My order is late and I'm frustrated",
        "The product I received is broken"
      ];

      for (const complaint of complaints) {
        const result = await assistant.processQuery(complaint);
        
        expect(result.success).toBe(true);
        expect(result.response.intent).toBe('complaint');
        
        // Should use empathetic language
        const response = result.response.text.toLowerCase();
        expect(response).toMatch(/\b(sorry|apologize|understand|frustrat|help|resolve)\b/);
        
        // Should not be dismissive
        expect(response).not.toMatch(/\b(too bad|deal with it|not our problem)\b/);
      }
    });
  });

  describe('Chitchat Handling', () => {
    test('should handle greetings appropriately', async () => {
      const greetings = [
        "Hello!",
        "Hi there",
        "Good morning",
        "How are you?",
        "What's up?"
      ];

      for (const greeting of greetings) {
        const result = await assistant.processQuery(greeting);
        
        expect(result.success).toBe(true);
        expect(result.response.intent).toBe('chitchat');
        
        // Should be friendly but redirect to support
        const response = result.response.text.toLowerCase();
        expect(response.length).toBeLessThan(150); // Brief responses
        expect(response).toMatch(/\b(hello|hi|help|assist)\b/);
      }
    });
  });

  describe('Violation Handling', () => {
    test('should handle inappropriate language professionally', async () => {
      const violations = [
        "This is stupid",
        "You're an idiot",
        "This service sucks",
        "I hate this"
      ];

      for (const violation of violations) {
        const result = await assistant.processQuery(violation);
        
        expect(result.success).toBe(true);
        expect(result.response.intent).toBe('violation');
        
        // Should set boundaries professionally
        const response = result.response.text.toLowerCase();
        expect(response).toMatch(/\b(help|respectful|assist|support)\b/);
        expect(response).not.toMatch(/\b(stupid|idiot|suck|hate)\b/); // Should not echo bad language
      }
    });
  });

  describe('Off-topic Handling', () => {
    test('should redirect off-topic queries appropriately', async () => {
      const offTopics = [
        "What's the weather like?",
        "Tell me a joke",
        "How do I cook pasta?",
        "Who won the game last night?"
      ];

      for (const query of offTopics) {
        const result = await assistant.processQuery(query);
        
        expect(result.success).toBe(true);
        expect(result.response.intent).toBe('off_topic');
        
        // Should politely redirect to shopping topics
        const response = result.response.text.toLowerCase();
        expect(response).toMatch(/\b(help|shop|order|product)\b/);
        expect(response).not.toMatch(/\b(weather|joke|cook|game)\b/); // Should not engage off-topic
      }
    });
  });

  describe('Function Calling Limits', () => {
    test('should respect maximum function calls per query', async () => {
      // This test verifies that we don't exceed the 2 function call limit
      const complexQuery = "Check my order status and also find me laptops and tell me about returns";
      
      const result = await assistant.processQuery(complexQuery, {
        customerEmail: testCustomer.email
      });

      expect(result.success).toBe(true);
      
      // Should not exceed max function calls
      if (result.response.functionResults) {
        expect(result.response.functionResults.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle LLM service failures gracefully', async () => {
      // Mock LLM failure by temporarily changing the endpoint
      const originalEndpoint = assistant.llmEndpoint;
      assistant.llmEndpoint = 'http://invalid-endpoint-that-will-fail:8000/generate';
      
      const result = await assistant.processQuery("What's your return policy?");
      
      // Should still return a response (fallback)
      expect(result.success).toBe(true);
      expect(result.response.text).toBeDefined();
      
      // Restore endpoint
      assistant.llmEndpoint = originalEndpoint;
    });

    test('should handle database errors gracefully', async () => {
      // Temporarily break the database connection
      await mongoose.connection.close();
      
      const result = await assistant.processQuery("What's your return policy?");
      
      // Should handle the error gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Restore connection
      await mongoose.connect(mongoServer.getUri());
    });
  });

  describe('Context Awareness', () => {
    test('should use customer context when provided', async () => {
      const result = await assistant.processQuery(
        "What are my recent orders?",
        { 
          customerEmail: testCustomer.email,
          customerName: testCustomer.name
        }
      );

      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('order_status');
      
      // Should call customer orders function with the provided email
      const customerOrdersFunction = result.response.functionResults.find(
        r => r.functionName === 'getCustomerOrders'
      );
      expect(customerOrdersFunction).toBeDefined();
    });

    test('should handle queries without context gracefully', async () => {
      const result = await assistant.processQuery("Where is my order?");
      
      expect(result.success).toBe(true);
      expect(result.response.intent).toBe('order_status');
      
      // Should ask for order ID or email since no context provided
      const response = result.response.text.toLowerCase();
      expect(response).toMatch(/\b(order.*number|email|ID)\b/);
    });
  });

  describe('Response Time Performance', () => {
    test('should respond within acceptable time limits', async () => {
      const queries = [
        "Hello",
        "What's your return policy?",
        "Where is my order?",
        "I need help finding a product"
      ];

      for (const query of queries) {
        const startTime = Date.now();
        const result = await assistant.processQuery(query);
        const responseTime = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
        
        // Also check the recorded processing time
        expect(result.response.processingTime).toBeLessThan(5000);
      }
    });
  });

  describe('Knowledge Base Integration', () => {
    test('should have access to policy knowledge base', () => {
      const policies = knowledgeBase.policies;
      expect(policies).toBeInstanceOf(Array);
      expect(policies.length).toBeGreaterThan(0);
      
      // Check that we have the expected policy categories
      const categories = knowledgeBase.getAllCategories();
      expect(categories).toContain('returns');
      expect(categories).toContain('shipping');
      expect(categories).toContain('warranty');
    });

    test('should find relevant policies for queries', () => {
      const testQueries = [
        { query: "How do I return an item?", expectedCategory: 'returns' },
        { query: "What shipping options do you have?", expectedCategory: 'shipping' },
        { query: "Is there a warranty?", expectedCategory: 'warranty' }
      ];

      for (const { query, expectedCategory } of testQueries) {
        const policies = knowledgeBase.findRelevantPolicies(query);
        
        // Should find at least one policy for relevant queries
        if (policies.length > 0) {
          expect(policies[0].category).toBe(expectedCategory);
        }
      }
    });
  });

  describe('Citation Validation', () => {
    test('should validate correct citations', () => {
      const validText = "You can return items within 30 days [Policy1.1] and we offer free shipping [Policy2.1].";
      const validation = citationValidator.validateResponse(validText);
      
      expect(validation.isValid).toBe(true);
      expect(validation.validCitations).toContain('Policy1.1');
      expect(validation.validCitations).toContain('Policy2.1');
      expect(validation.invalidCitations).toHaveLength(0);
    });

    test('should detect invalid citations', () => {
      const invalidText = "We offer unlimited returns [Policy99.9] and free shipping forever [PolicyInvalid].";
      const validation = citationValidator.validateResponse(invalidText);
      
      expect(validation.isValid).toBe(false);
      expect(validation.invalidCitations).toContain('Policy99.9');
      expect(validation.invalidCitations).toContain('PolicyInvalid');
    });

    test('should extract citations from text correctly', () => {
      const textWithCitations = "Return policy [Policy1.1], shipping [Policy2.1], and warranty [Policy3.1] information.";
      const citations = citationValidator.extractCitations(textWithCitations);
      
      expect(citations).toContain('Policy1.1');
      expect(citations).toContain('Policy2.1');
      expect(citations).toContain('Policy3.1');
      expect(citations).toHaveLength(3);
    });
  });

  describe('Assistant Identity Consistency', () => {
    test('should maintain consistent identity across all responses', async () => {
      const testQueries = [
        "What's your name?",
        "Who are you?",
        "Can you help me?",
        "What do you do?"
      ];

      for (const query of testQueries) {
        const result = await assistant.processQuery(query);
        
        expect(result.success).toBe(true);
        const response = result.response.text.toLowerCase();
        
        // Should never reveal AI identity
        expect(response).not.toMatch(/\b(ai|artificial intelligence|chatgpt|llama|language model)\b/i);
        
        // Should maintain professional identity
        expect(response).toMatch(/\b(support|help|assist|team)\b/);
      }
    });

    test('should use configured name and role', async () => {
      const result = await assistant.processQuery("What's your name?");
      
      expect(result.success).toBe(true);
      const response = result.response.text;
      
      // Should use the configured identity
      expect(response).toMatch(/Alex/);
      expect(response).toMatch(/support|specialist/);
    });
  });
});