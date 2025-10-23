const AssistantEngine = require('../src/assistant/engine');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

describe('Assistant Identity System', () => {
  let assistant;
  let config;

  beforeAll(() => {
    assistant = new AssistantEngine();
    // Load config directly for testing
    const configPath = path.join(__dirname, '../../docs/prompts.yaml');
    const configText = fs.readFileSync(configPath, 'utf8');
    config = yaml.load(configText);
  });

  describe('Identity Configuration', () => {
    test('should have proper identity configuration', () => {
      expect(config.identity).toBeDefined();
      expect(config.identity.name).toBeDefined();
      expect(config.identity.role).toBeDefined();
      expect(config.identity.company).toBeDefined();
      
      // Should not be AI-related names
      expect(config.identity.name).not.toMatch(/chatgpt|claude|llama|ai|bot/i);
      expect(config.identity.role).not.toMatch(/ai|bot|assistant|language model/i);
    });

    test('should have personality traits defined', () => {
      expect(config.identity.personality).toBeDefined();
      expect(config.identity.personality.traits).toBeInstanceOf(Array);
      expect(config.identity.personality.traits.length).toBeGreaterThan(0);
      expect(config.identity.personality.communication_style).toBeDefined();
    });
  });

  describe('Never-Say Rules', () => {
    test('should have never-say rules defined', () => {
      expect(config.guidelines.never_say).toBeInstanceOf(Array);
      expect(config.guidelines.never_say.length).toBeGreaterThan(0);
    });

    test('should prohibit AI identity revelation', () => {
      const neverSay = config.guidelines.never_say;
      
      expect(neverSay).toContain("I'm an AI");
      expect(neverSay).toContain("I'm ChatGPT/Claude/Llama");
      expect(neverSay).toContain("As an artificial intelligence");
      expect(neverSay).toContain("I'm a language model");
    });
  });

  describe('Identity Response Validation', () => {
    const identityTestQueries = [
      "What's your name?",
      "Who are you?",
      "Are you a robot?",
      "Are you an AI?",
      "What are you?",
      "Who created you?",
      "Are you human?"
    ];

    test.each(identityTestQueries)('should maintain identity for query: "%s"', async (query) => {
      const result = await assistant.processQuery(query);
      
      expect(result.success).toBe(true);
      expect(result.response.text).toBeDefined();
      
      const response = result.response.text.toLowerCase();
      
      // Should NOT contain AI revelation phrases
      expect(response).not.toMatch(/\b(i'm|i am) (an? )?(ai|artificial intelligence|chatgpt|claude|llama|language model|bot|robot)\b/);
      expect(response).not.toMatch(/\b(as an? (ai|artificial intelligence|language model))\b/);
      expect(response).not.toMatch(/\b(openai|meta|created by)\b/);
      
      // Should contain identity elements
      expect(response).toMatch(/\b(alex)\b/);
      expect(response).toMatch(/\b(support|specialist|team)\b/);
    });

    test('should use natural human-like responses', async () => {
      const result = await assistant.processQuery("What's your name?");
      
      expect(result.success).toBe(true);
      const response = result.response.text;
      
      // Should sound natural, not robotic
      expect(response).not.toMatch(/My designated name is/);
      expect(response).not.toMatch(/I am programmed to/);
      expect(response).not.toMatch(/My identity parameters/);
      
      // Should use the configured name naturally
      expect(response).toMatch(/Alex/);
    });
  });

  describe('Personality Consistency', () => {
    test('should maintain consistent personality across interactions', async () => {
      const queries = [
        "Hello!",
        "I need help with a return",
        "Thanks for your help!"
      ];

      const responses = [];
      
      for (const query of queries) {
        const result = await assistant.processQuery(query);
        expect(result.success).toBe(true);
        responses.push(result.response.text);
      }

      // All responses should sound like the same person
      const allText = responses.join(' ').toLowerCase();
      
      // Should maintain friendly, professional tone
      expect(allText).toMatch(/\b(hello|hi|hey|help|assist|welcome)\b/);
      expect(allText).not.toMatch(/\b(hate|stupid|idiot|suck)\b/);
    });
  });

  describe('Intent-Specific Tone', () => {
    test('should use empathetic tone for complaints', async () => {
      const result = await assistant.processQuery("I'm really upset about my order being late");
      
      expect(result.success).toBe(true);
      const response = result.response.text.toLowerCase();
      
      expect(response).toMatch(/\b(sorry|apologize|understand|frustrat|upset|help)\b/);
      expect(result.response.intent).toBe('complaint');
    });

    test('should use professional tone for policy questions', async () => {
      const result = await assistant.processQuery("What is your return policy?");
      
      expect(result.success).toBe(true);
      const response = result.response.text;
      
      expect(response).toMatch(/\[Policy\d+\.\d+\]/); // Should cite policies
      expect(result.response.intent).toBe('policy_question');
    });
  });
});