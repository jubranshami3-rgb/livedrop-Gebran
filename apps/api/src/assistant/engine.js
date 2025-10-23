const axios = require('axios');
const IntentClassifier = require('./intent-classifier');
const FunctionRegistry = require('./function-registry');
const KnowledgeBase = require('./knowledge-base');
const CitationValidator = require('./citation-validator');
const { trackAssistantQuery } = require('../routes/dashboard');

class AssistantEngine {
  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.functionRegistry = new FunctionRegistry();
    this.knowledgeBase = new KnowledgeBase();
    this.citationValidator = new CitationValidator(this.knowledgeBase);
    
    this.llmEndpoint = process.env.LLM_ENDPOINT || 'http://localhost:8000/generate';
    this.config = this.intentClassifier.config;
  }

  async processQuery(userInput, context = {}) {
    const startTime = Date.now();
    
    try {
      // Step 1: Classify intent
      const intent = this.intentClassifier.classifyIntent(userInput);
      const intentBehavior = this.intentClassifier.getIntentBehavior(intent);
      
      console.log(`Assistant: Processing "${userInput}" -> Intent: ${intent}`);

      // Step 2: Handle special intents directly
      if (intent === 'violation') {
        const result = this.handleViolation(userInput, context);
        trackAssistantQuery(result);
        return result;
      }

      if (intent === 'off_topic') {
        const result = this.handleOffTopic(userInput, context);
        trackAssistantQuery(result);
        return result;
      }

      // Step 3: Prepare for function calls if needed
      let functionResults = [];
      if (intentBehavior.call_functions) {
        functionResults = await this.executeRelevantFunctions(intent, userInput, context);
      }

      // Step 4: Prepare knowledge base context if needed
      let knowledgeContext = '';
      if (intentBehavior.use_knowledge_base) {
        const relevantPolicies = this.knowledgeBase.findRelevantPolicies(userInput);
        knowledgeContext = this.knowledgeBase.generateContextFromPolicies(relevantPolicies, userInput);
      }

      // Step 5: Generate LLM response
      const llmResponse = await this.generateLLMResponse(
        userInput, 
        intent, 
        intentBehavior, 
        context, 
        functionResults, 
        knowledgeContext
      );

      // Step 6: Validate citations if required
      let citationValidation = null;
      if (intentBehavior.require_citations) {
        citationValidation = this.citationValidator.validateResponse(llmResponse.text);
      }

      const processingTime = Date.now() - startTime;

      const result = {
        success: true,
        response: {
          text: llmResponse.text,
          intent: intent,
          intentBehavior: intentBehavior,
          citations: citationValidation?.validCitations || [],
          functionResults: functionResults.filter(r => r.success),
          processingTime: processingTime,
          timestamp: new Date().toISOString()
        },
        validation: citationValidation,
        metadata: {
          model: llmResponse.model,
          usage: llmResponse.usage
        }
      };

      // Track the successful query
      trackAssistantQuery(result);
      return result;

    } catch (error) {
      console.error('Error in assistant engine:', error);
      const processingTime = Date.now() - startTime;
      
      const errorResult = {
        success: false,
        error: 'Sorry, I encountered an error while processing your request. Please try again.',
        intent: 'error',
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };

      // Track the error query
      trackAssistantQuery(errorResult);
      
      return errorResult;
    }
  }

  async executeRelevantFunctions(intent, userInput, context) {
    const functionCalls = [];
    
    switch (intent) {
      case 'order_status':
        // Extract order ID from user input
        const orderIdMatch = userInput.match(/(?:order|#)?\s*([A-Z0-9]{8,})/i);
        if (orderIdMatch) {
          functionCalls.push({
            name: 'getOrderStatus',
            arguments: {
              orderId: orderIdMatch[1],
              email: context.customerEmail
            }
          });
        } else {
          // If no order ID, get customer's recent orders
          if (context.customerEmail) {
            functionCalls.push({
              name: 'getCustomerOrders',
              arguments: {
                email: context.customerEmail,
                limit: 5
              }
            });
          }
        }
        break;

      case 'product_search':
        // Extract product search terms
        const searchTerms = this.extractSearchTerms(userInput);
        functionCalls.push({
          name: 'searchProducts',
          arguments: {
            query: searchTerms,
            limit: 5
          }
        });
        break;

      default:
        break;
    }

    if (functionCalls.length > 0) {
      return await this.functionRegistry.executeMultipleFunctions(functionCalls);
    }

    return [];
  }

  extractSearchTerms(userInput) {
    // Remove common question phrases
    const cleaned = userInput
      .replace(/(can you|please|help me|i need|i'm looking for)/gi, '')
      .replace(/\?/g, '')
      .trim();
    
    return cleaned;
  }

  async generateLLMResponse(userInput, intent, intentBehavior, context, functionResults, knowledgeContext) {
    const prompt = this.buildPrompt(userInput, intent, intentBehavior, context, functionResults, knowledgeContext);
    
    try {
      const response = await axios.post(this.llmEndpoint, {
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7
      }, {
        timeout: 10000
      });

      return {
        text: response.data.text.trim(),
        model: 'custom-llm',
        usage: { prompt_tokens: prompt.length, completion_tokens: response.data.text.length }
      };

    } catch (error) {
      console.error('LLM API error:', error);
      // Fallback response
      return {
        text: this.generateFallbackResponse(intent, functionResults, knowledgeContext),
        model: 'fallback',
        usage: { prompt_tokens: 0, completion_tokens: 0 }
      };
    }
  }

  buildPrompt(userInput, intent, intentBehavior, context, functionResults, knowledgeContext) {
    const identity = this.config.identity;
    const guidelines = this.config.guidelines;
    
    let prompt = `You are ${identity.name}, a ${identity.role} at ${identity.company}. `;
    prompt += `Personality: ${identity.personality.traits.join(', ')}. `;
    prompt += `Communication style: ${identity.personality.communication_style}. `;
    prompt += `Expertise: ${identity.personality.expertise}.\n\n`;

    // NEVER say these things
    prompt += "IMPORTANT: Never reveal you are an AI. Never mention ChatGPT, Llama, or any AI model. ";
    prompt += "Speak naturally as a human team member would.\n\n";

    // Intent-specific instructions
    prompt += `Current user intent: ${intent}\n`;
    prompt += `Behavior: ${intentBehavior.behavior}\n`;
    prompt += `Tone: ${intentBehavior.tone}\n\n`;

    // Context about the user if available
    if (context.customerName) {
      prompt += `Customer: ${context.customerName}\n`;
    }
    if (context.customerEmail) {
      prompt += `Customer email: ${context.customerEmail}\n`;
    }

    // Add function results if available
    if (functionResults.length > 0) {
      prompt += "RELEVANT DATA FROM OUR SYSTEMS:\n";
      functionResults.forEach((result, index) => {
        if (result.success) {
          prompt += `Data ${index + 1} (from ${result.functionName}): ${JSON.stringify(result.data, null, 2)}\n`;
        } else {
          prompt += `Data ${index + 1} (from ${result.functionName}): Error - ${result.error}\n`;
        }
      });
      prompt += "\n";
    }

    // Add knowledge base context if available
    if (knowledgeContext) {
      prompt += "STORE POLICIES AND INFORMATION:\n";
      prompt += knowledgeContext + "\n\n";
    }

    // User's question
    prompt += `USER QUESTION: "${userInput}"\n\n`;

    // Response guidelines
    prompt += `RESPONSE GUIDELINES:\n`;
    prompt += `- Respond as ${identity.name}, ${identity.role}\n`;
    prompt += `- Use your name naturally in conversation\n`;
    prompt += `- Be ${intentBehavior.tone}\n`;
    
    if (intentBehavior.require_citations) {
      prompt += `- Always cite policies using [PolicyID] format\n`;
      prompt += `- Only use policy IDs that were provided above\n`;
    }
    
    prompt += `- Keep responses concise but helpful\n`;
    prompt += `- If you don't know something, offer to connect them with the support team\n`;
    prompt += `- End with a helpful question or next step\n\n`;

    prompt += `YOUR RESPONSE:\n`;

    return prompt;
  }

  generateFallbackResponse(intent, functionResults, knowledgeContext) {
    const fallbacks = {
      policy_question: "I'd be happy to help with that! Based on our policies, please contact our support team for the most accurate and up-to-date information regarding your specific situation.",
      order_status: "I can help you check your order status. Do you have your order number handy, or would you like me to look up your recent orders?",
      product_search: "I'd be delighted to help you find the perfect product! Could you tell me a bit more about what you're looking for?",
      complaint: "I'm really sorry to hear you're having issues. I want to help make this right for you. Could you share more details about what happened?",
      chitchat: "Thanks for reaching out! I'm here to help with any questions about our products, orders, or store policies. What can I assist you with today?",
      default: "I'm here to help! Could you tell me a bit more about what you're looking for or what issue you're experiencing?"
    };

    return fallbacks[intent] || fallbacks.default;
  }

  handleViolation(userInput, context) {
    return {
      success: true,
      response: {
        text: "I'm here to provide helpful and respectful assistance with your shopping needs. I'd be happy to help if you have questions about our products, orders, or policies.",
        intent: 'violation',
        intentBehavior: this.intentClassifier.getIntentBehavior('violation'),
        citations: [],
        functionResults: [],
        processingTime: 0,
        timestamp: new Date().toISOString()
      },
      validation: null,
      metadata: { model: 'direct-response' }
    };
  }

  handleOffTopic(userInput, context) {
    return {
      success: true,
      response: {
        text: "I specialize in helping with TechShop orders, products, and policies. I'd be happy to assist with any questions about shopping with us, tracking orders, or our store policies!",
        intent: 'off_topic',
        intentBehavior: this.intentClassifier.getIntentBehavior('off_topic'),
        citations: [],
        functionResults: [],
        processingTime: 0,
        timestamp: new Date().toISOString()
      },
      validation: null,
      metadata: { model: 'direct-response' }
    };
  }

  // Test method with tracking
  async testAssistant() {
    const testQueries = [
      "What's your return policy?",
      "Where is my order?",
      "I'm looking for wireless headphones",
      "I'm really upset about my delayed order",
      "Hello, how are you today?",
      "This is the worst service ever!",
      "What's the weather like?"
    ];

    const results = [];
    for (const query of testQueries) {
      const result = await this.processQuery(query);
      results.push({
        query,
        result
      });
    }

    return results;
  }
}

module.exports = AssistantEngine;