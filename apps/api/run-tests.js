const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Week 5 MVP Test Suite...\n');

const tests = [
  { name: 'Intent Detection Tests', file: 'tests/intent-detection.test.js' },
  { name: 'Identity Tests', file: 'tests/identity.test.js' },
  { name: 'Function Calling Tests', file: 'tests/function-calling.test.js' },
  { name: 'Assistant Engine Tests', file: 'tests/assistant.test.js' }, 
  { name: 'API Endpoint Tests', file: 'tests/api.test.js' },
  { name: 'Integration Tests', file: 'tests/integration.test.js' }
];


async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${test.name}...`);
    
    const jestProcess = spawn('npx', ['jest', test.file, '--verbose', '--passWithNoTests'], {
      stdio: 'inherit',
      shell: true
    });

    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} PASSED\n`);
        resolve(true);
      } else {
        console.log(`❌ ${test.name} FAILED\n`);
        resolve(false);
      }
    });

    jestProcess.on('error', (error) => {
      console.error(`Error running ${test.name}:`, error);
      reject(error);
    });
  });
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const success = await runTest(test);
      if (success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Error running ${test.name}:`, error);
      failed++;
    }
  }

  console.log('\n🎯 TEST SUITE SUMMARY');
  console.log('====================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your Week 5 MVP is ready for deployment!');
    process.exit(0);
  } else {
    console.log('\n💡 Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);