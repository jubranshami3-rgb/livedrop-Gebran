const express = require('express');
const AssistantEngine = require('../assistant/engine');

const router = express.Router();
const assistant = new AssistantEngine();

// POST /api/assistant/chat - Main assistant endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    const result = await assistant.processQuery(message, context);

    res.json(result);
  } catch (error) {
    console.error('Error in assistant chat:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in assistant'
    });
  }
});

// GET /api/assistant/intents - List all available intents
router.get('/intents', async (req, res) => {
  try {
    const intents = Object.keys(assistant.intentClassifier.config.intents || {});
    
    res.json({
      intents,
      behaviors: assistant.intentClassifier.config.intents
    });
  } catch (error) {
    console.error('Error fetching intents:', error);
    res.status(500).json({
      error: 'Failed to fetch intents'
    });
  }
});

// GET /api/assistant/functions - List available functions
router.get('/functions', async (req, res) => {
  try {
    const functions = assistant.functionRegistry.getFunctionSchemas();
    
    res.json({
      functions,
      total: functions.length
    });
  } catch (error) {
    console.error('Error fetching functions:', error);
    res.status(500).json({
      error: 'Failed to fetch functions'
    });
  }
});

// GET /api/assistant/policies - List knowledge base policies
router.get('/policies', async (req, res) => {
  try {
    const policies = assistant.knowledgeBase.policies;
    const categories = assistant.knowledgeBase.getAllCategories();
    
    res.json({
      policies,
      categories,
      total: policies.length
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      error: 'Failed to fetch policies'
    });
  }
});

// POST /api/assistant/test - Test endpoint
router.post('/test', async (req, res) => {
  try {
    const testResults = await assistant.testAssistant();
    
    res.json({
      success: true,
      tests: testResults,
      total: testResults.length
    });
  } catch (error) {
    console.error('Error in assistant test:', error);
    res.status(500).json({
      error: 'Failed to run tests'
    });
  }
});

// POST /api/assistant/validate-citations - Validate citations in text
router.post('/validate-citations', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    const validation = assistant.citationValidator.validateResponse(text);
    const report = assistant.citationValidator.generateValidationReport(validation);

    res.json({
      text,
      validation,
      report
    });
  } catch (error) {
    console.error('Error validating citations:', error);
    res.status(500).json({
      error: 'Failed to validate citations'
    });
  }
});

module.exports = router;