const IntentClassifier = require('../src/assistant/intent-classifier');

describe('Intent Detection System', () => {
  let classifier;

  beforeAll(() => {
    classifier = new IntentClassifier();
  });

  describe('Policy Question Intent', () => {
    const policyQueries = [
      "What's your return policy?",
      "How do I get a refund?",
      "What is your shipping policy?",
      "Do you have a warranty?",
      "What are your payment methods?",
      "Is my payment information secure?",
      "How long is your return window?",
      "What's your price match policy?"
    ];

    test.each(policyQueries)('should classify "%s" as policy_question', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('policy_question');
    });
  });

  describe('Order Status Intent', () => {
    const orderStatusQueries = [
      "Where is my order?",
      "What's the status of order #12345?",
      "When will my package arrive?",
      "Can you track my order?",
      "Has my order shipped yet?",
      "I want to check my order status",
      "Where's my package?"
    ];

    test.each(orderStatusQueries)('should classify "%s" as order_status', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('order_status');
    });
  });

  describe('Product Search Intent', () => {
    const productSearchQueries = [
      "I'm looking for headphones",
      "Do you have wireless earbuds?",
      "Show me laptops under $1000",
      "I need a new phone",
      "What gaming consoles do you sell?",
      "Find me a smartwatch",
      "Search for bluetooth speakers"
    ];

    test.each(productSearchQueries)('should classify "%s" as product_search', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('product_search');
    });
  });

  describe('Complaint Intent', () => {
    const complaintQueries = [
      "I'm really angry about my order",
      "This is terrible service",
      "I want to file a complaint",
      "My order never arrived",
      "The product I received is broken",
      "I'm very disappointed",
      "This is unacceptable"
    ];

    test.each(complaintQueries)('should classify "%s" as complaint', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('complaint');
    });
  });

  describe('Chitchat Intent', () => {
    const chitchatQueries = [
      "Hello there!",
      "How are you today?",
      "Good morning!",
      "What's up?",
      "How's it going?",
      "Nice to meet you",
      "Hi, how are you?"
    ];

    test.each(chitchatQueries)('should classify "%s" as chitchat', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('chitchat');
    });
  });

  describe('Violation Intent', () => {
    const violationQueries = [
      "This is stupid",
      "You're an idiot",
      "This service sucks",
      "You're useless",
      "This is garbage",
      "I hate this",
      "You're terrible"
    ];

    test.each(violationQueries)('should classify "%s" as violation', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('violation');
    });
  });

  describe('Off-topic Intent', () => {
    const offTopicQueries = [
      "What's the weather like?",
      "Tell me a joke",
      "How do I cook pasta?",
      "What's your favorite movie?",
      "Who won the game last night?",
      "What is the meaning of life?",
      "Can you help me with my homework?"
    ];

    test.each(offTopicQueries)('should classify "%s" as off_topic', (query) => {
      const intent = classifier.classifyIntent(query);
      expect(intent).toBe('off_topic');
    });
  });

  describe('Intent Behavior Configuration', () => {
    test('should load intent behaviors from YAML config', () => {
      const behaviors = classifier.config.intents;
      
      expect(behaviors).toBeDefined();
      expect(behaviors.policy_question).toBeDefined();
      expect(behaviors.policy_question.use_knowledge_base).toBe(true);
      expect(behaviors.policy_question.require_citations).toBe(true);
      
      expect(behaviors.order_status.call_functions).toContain('getOrderStatus');
      expect(behaviors.product_search.call_functions).toContain('searchProducts');
    });

    test('should return correct behavior for each intent', () => {
      const policyBehavior = classifier.getIntentBehavior('policy_question');
      expect(policyBehavior.use_knowledge_base).toBe(true);
      
      const orderBehavior = classifier.getIntentBehavior('order_status');
      expect(orderBehavior.call_functions).toContain('getOrderStatus');
      
      const chatBehavior = classifier.getIntentBehavior('chitchat');
      expect(chatBehavior.tone).toBe('friendly_but_focused');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const intent = classifier.classifyIntent('');
      expect(intent).toBe('off_topic');
    });

    test('should handle null input', () => {
      const intent = classifier.classifyIntent(null);
      expect(intent).toBe('off_topic');
    });

    test('should handle very long input', () => {
      const longText = "I need help with my order because it hasn't arrived and I'm wondering what the status is and when I can expect it to be delivered because I really need it for an important event that's coming up soon and I'm starting to get worried that it might not make it in time";
      const intent = classifier.classifyIntent(longText);
      expect(intent).toBe('order_status');
    });

    test('should handle mixed case input', () => {
      const mixedCase = "HELLO how ARE you TODAY?";
      const intent = classifier.classifyIntent(mixedCase);
      expect(intent).toBe('chitchat');
    });
  });
});