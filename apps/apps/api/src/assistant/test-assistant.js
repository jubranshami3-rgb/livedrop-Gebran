const AssistantEngine = require('./engine');

async function runTests() {
  console.log('🤖 Testing Intelligent Assistant...\n');
  
  const assistant = new AssistantEngine();
  
  // Test 1: Intent Classification
  console.log('1. Testing Intent Classification:');
  const intentTests = assistant.intentClassifier.testClassification();
  intentTests.forEach(test => {
    console.log(`   "${test.input}" -> ${test.detected} (Expected: ${test.expected}) ${test.correct ? '✅' : '❌'}`);
  });
  
  // Test 2: Function Registry
  console.log('\n2. Testing Function Registry:');
  const functions = assistant.functionRegistry.getAllFunctions();
  console.log(`   Registered ${functions.length} functions:`, functions.map(f => f.name));
  
  // Test 3: Knowledge Base
  console.log('\n3. Testing Knowledge Base:');
  const policies = assistant.knowledgeBase.policies;
  console.log(`   Loaded ${policies.length} policies across ${assistant.knowledgeBase.getAllCategories().length} categories`);
  
  // Test 4: Citation Validation
  console.log('\n4. Testing Citation Validation:');
  const testText = "You can return items within 30 days [Policy1.1] and we offer free shipping [Policy2.1] with overnight options [Policy99.9].";
  const validation = assistant.citationValidator.validateResponse(testText);
  console.log(`   Test: "${testText}"`);
  console.log(`   Valid: ${validation.validCitations}`);
  console.log(`   Invalid: ${validation.invalidCitations}`);
  
  // Test 5: Sample Queries
  console.log('\n5. Testing Sample Queries:');
  const testQueries = [
    "What's your return policy?",
    "Where is my order?",
    "I need help finding headphones",
    "Hi there!",
    "I'm really angry about my order!"
  ];
  
  for (const query of testQueries) {
    console.log(`\n   Query: "${query}"`);
    const result = await assistant.processQuery(query, {
      customerEmail: 'demo@example.com',
      customerName: 'Demo User'
    });
    
    if (result.success) {
      console.log(`   Intent: ${result.response.intent}`);
      console.log(`   Response: ${result.response.text.substring(0, 100)}...`);
      if (result.response.functionResults.length > 0) {
        console.log(`   Functions called: ${result.response.functionResults.map(f => f.functionName)}`);
      }
    } else {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('\n🎉 Assistant testing completed!');
}

runTests().catch(console.error);