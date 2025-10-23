const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
  constructor() {
    this.config = this.loadConfig();
    this.keywordPatterns = this.buildKeywordPatterns();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../../docs/prompts.yaml');
      const configText = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configText);
    } catch (error) {
      console.error('Error loading assistant config:', error);
      return {};
    }
  }

  buildKeywordPatterns() {
    return {
      policy_question: [
        'policy', 'return', 'refund', 'exchange', 'warranty', 'guarantee',
        'shipping', 'delivery', 'payment', 'privacy', 'secure', 'price match',
        'how do i return', 'can i return', 'what is your', 'do you have',
        'terms', 'conditions', 'policy'
      ],
      order_status: [
        'order', 'track', 'tracking', 'status', 'where is my', 'when will',
        'delivery', 'shipped', 'delivered', 'order number', 'track my',
        'check order', 'order status'
      ],
      product_search: [
        'find', 'search', 'looking for', 'product', 'buy', 'purchase',
        'do you have', 'sell', 'item', 'catalog', 'looking to buy',
        'recommend', 'suggestion'
      ],
      complaint: [
        'complaint', 'issue', 'problem', 'bad', 'terrible', 'angry',
        'frustrated', 'disappointed', 'not happy', 'upset', 'broken',
        'damaged', 'wrong item', 'missing', 'never received',
        'horrible', 'awful', 'disaster'
      ],
      chitchat: [
        'hello', 'hi', 'hey', 'how are you', 'good morning', 'good afternoon',
        'good evening', 'how\'s it going', 'what\'s up', 'how do you do',
        'nice to meet you', 'how is your day'
      ],
      violation: [
        'hate', 'stupid', 'idiot', 'suck', 'damn', 'hell', 'crap',
        'bullshit', 'fuck', 'shit', 'asshole', 'bitch', 'moron',
        'you\'re useless', 'this is garbage'
      ],
      off_topic: [
        'weather', 'sports', 'politics', 'music', 'movie', 'celebrity',
        'joke', 'tell me a story', 'what is life', 'philosophy',
        'how to cook', 'relationship advice', 'medical advice'
      ]
    };
  }

  classifyIntent(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return 'off_topic';
    }

    const input = userInput.toLowerCase().trim();
    
    // Check for violation first
    if (this.matchesPattern(input, this.keywordPatterns.violation)) {
      return 'violation';
    }

    // Check other intents
    for (const [intent, patterns] of Object.entries(this.keywordPatterns)) {
      if (intent === 'violation') continue;
      
      if (this.matchesPattern(input, patterns)) {
        return intent;
      }
    }

    return 'off_topic';
  }

  matchesPattern(input, patterns) {
    return patterns.some(pattern => {
      if (pattern.includes(' ')) {
        // For multi-word patterns, check exact phrase
        return input.includes(pattern);
      } else {
        // For single words, check word boundaries
        const words = input.split(/\s+/);
        return words.includes(pattern) || input.includes(pattern);
      }
    });
  }

  getIntentBehavior(intent) {
    return this.config.intents?.[intent] || {
      behavior: 'default',
      tone: 'professional',
      use_knowledge_base: false,
      require_citations: false
    };
  }

  // Test method for validation
  testClassification() {
    const testCases = [
      { input: "What's your return policy?", expected: "policy_question" },
      { input: "Where is my order?", expected: "order_status" },
      { input: "I'm looking for headphones", expected: "product_search" },
      { input: "I'm really angry about my order", expected: "complaint" },
      { input: "Hello how are you?", expected: "chitchat" },
      { input: "This is stupid", expected: "violation" },
      { input: "What's the weather like?", expected: "off_topic" }
    ];

    const results = testCases.map(testCase => {
      const detected = this.classifyIntent(testCase.input);
      return {
        input: testCase.input,
        expected: testCase.expected,
        detected: detected,
        correct: detected === testCase.expected
      };
    });

    return results;
  }
}

module.exports = IntentClassifier;