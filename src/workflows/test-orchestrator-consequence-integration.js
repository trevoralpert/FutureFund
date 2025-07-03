/**
 * Test: Financial Consequence Engine Integration with Workflow Orchestrator
 * Phase 4.1 - Integration Testing
 * 
 * Comprehensive test suite to verify Financial Consequence Engine integration
 * with Workflow Orchestrator including progress tracking, caching, and error handling
 */

const { orchestrator } = require('./workflow-orchestrator');

/**
 * Comprehensive Integration Test Suite
 */
async function runIntegrationTests() {
  console.log('\n🚀 STARTING FINANCIAL CONSEQUENCE ENGINE INTEGRATION TESTS');
  console.log('=' .repeat(80));
  
  const testResults = [];
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Orchestrator Initialization
  console.log('\n📋 Test 1: Orchestrator Initialization Check');
  totalTests++;
  try {
    const status = orchestrator.getConsequenceEngineStatus();
    if (status.initialized && status.workflow_nodes === 6) {
      console.log('✅ PASSED: Financial Consequence Engine properly initialized');
      console.log(`   - Workflow nodes: ${status.workflow_nodes}`);
      console.log(`   - Capabilities: ${status.capabilities.length} available`);
      passedTests++;
      testResults.push({ test: 'Initialization', passed: true, details: status });
    } else {
      console.log('❌ FAILED: Financial Consequence Engine not properly initialized');
      testResults.push({ test: 'Initialization', passed: false, error: 'Not initialized' });
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.push({ test: 'Initialization', passed: false, error: error.message });
  }
  
  // Test 2: End-to-End Execution with Progress Tracking
  console.log('\n📋 Test 2: End-to-End Execution with Progress Tracking');
  totalTests++;
  try {
    // Test scenario data
    const testScenario = {
      id: 'test-home-theater',
      name: 'Home Theater System Purchase',
      type: 'purchase',
      amount: 5000,
      description: 'Premium home theater system upgrade',
      category: 'Entertainment',
      priority: 'medium'
    };
    
    const testFinancialContext = {
      monthlyIncome: 8500,
      monthlyExpenses: 6200,
      emergencyFund: 12000,
      paymentPreferences: {
        preferredAccount: 'checking',
        riskTolerance: 'moderate'
      }
    };
    
    const testAccounts = [
      {
        id: 'acc-checking',
        name: 'Primary Checking',
        type: 'checking',
        currentBalance: 3200,
        availableBalance: 3200,
        institution: 'Chase Bank',
        isActive: true
      },
      {
        id: 'acc-savings',
        name: 'High-Yield Savings',
        type: 'savings',
        currentBalance: 15000,
        availableBalance: 15000,
        institution: 'Ally Bank',
        isActive: true
      },
      {
        id: 'acc-credit',
        name: 'Premium Rewards Card',
        type: 'credit_card',
        currentBalance: 1200,
        creditLimit: 15000,
        availableCredit: 13800,
        interestRate: 18.99,
        institution: 'Chase Bank',
        isActive: true
      }
    ];
    
    // Track progress updates
    const progressUpdates = [];
    
    const result = await orchestrator.executeFinancialConsequenceAnalysis(
      testScenario,
      testFinancialContext,
      testAccounts,
      {
        onProgress: (progress) => {
          progressUpdates.push(progress);
          console.log(`   📊 Progress: ${progress.progress}% - ${progress.message}`);
        },
        useCache: false // Force fresh execution
      }
    );
    
    // Validate results
    if (result.success && 
        result.data && 
        typeof result.data.executionFeasible === 'boolean' &&
        typeof result.data.totalCost === 'number' &&
        result.data.riskLevel &&
        result.metadata.framework === 'FinancialConsequenceEngine') {
      
      console.log('✅ PASSED: End-to-end execution successful');
      console.log(`   - Execution Time: ${result.metadata.totalExecutionTime}ms`);
      console.log(`   - Execution Feasible: ${result.data.executionFeasible}`);
      console.log(`   - Total Cost: $${result.data.totalCost}`);
      console.log(`   - Risk Level: ${result.data.riskLevel}`);
      console.log(`   - Progress Updates: ${progressUpdates.length}`);
      console.log(`   - Warnings: ${result.data.warnings?.length || 0}`);
      
      passedTests++;
      testResults.push({ 
        test: 'End-to-End Execution', 
        passed: true, 
        details: {
          executionTime: result.metadata.totalExecutionTime,
          progressUpdates: progressUpdates.length,
          feasible: result.data.executionFeasible,
          cost: result.data.totalCost,
          risk: result.data.riskLevel
        }
      });
    } else {
      console.log('❌ FAILED: Invalid result structure or missing data');
      console.log('Result:', JSON.stringify(result, null, 2));
      testResults.push({ test: 'End-to-End Execution', passed: false, error: 'Invalid result structure' });
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.push({ test: 'End-to-End Execution', passed: false, error: error.message });
  }
  
  // Test 3: Caching Functionality
  console.log('\n📋 Test 3: Caching Functionality');
  totalTests++;
  try {
    // Clear cache first to ensure clean test
    orchestrator.clearCache();
    
    const testScenario = {
      id: 'test-cache',
      name: 'Cache Test Scenario',
      type: 'purchase',
      amount: 2500,
      description: 'Caching test',
      category: 'Test'
    };
    
    const testFinancialContext = { monthlyIncome: 5000, monthlyExpenses: 3500 };
    const testAccounts = [{
      id: 'acc-test',
      name: 'Test Account',
      type: 'checking',
      currentBalance: 5000,
      isActive: true
    }];
    
    // First execution (should cache)
    const startTime1 = Date.now();
    const result1 = await orchestrator.executeFinancialConsequenceAnalysis(
      testScenario, testFinancialContext, testAccounts, { useCache: true }
    );
    const executionTime1 = Date.now() - startTime1;
    
    // Second execution (should use cache)
    const startTime2 = Date.now();
    const result2 = await orchestrator.executeFinancialConsequenceAnalysis(
      testScenario, testFinancialContext, testAccounts, { useCache: true }
    );
    const executionTime2 = Date.now() - startTime2;
    
    if (result1.success && result2.success && 
        result2.metadata.cached === true &&
        executionTime2 < executionTime1) {
      
      console.log('✅ PASSED: Caching functionality working');
      console.log(`   - First execution: ${executionTime1}ms`);
      console.log(`   - Cached execution: ${executionTime2}ms`);
      console.log(`   - Cache hit confirmed: ${result2.metadata.cached}`);
      
      passedTests++;
      testResults.push({ 
        test: 'Caching', 
        passed: true, 
        details: {
          firstExecution: executionTime1,
          cachedExecution: executionTime2,
          cacheHit: result2.metadata.cached
        }
      });
    } else {
      console.log('❌ FAILED: Caching not working properly');
      testResults.push({ test: 'Caching', passed: false, error: 'Cache miss or invalid behavior' });
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.push({ test: 'Caching', passed: false, error: error.message });
  }
  
  // Test 4: Input Validation
  console.log('\n📋 Test 4: Input Validation');
  totalTests++;
  try {
    // Clear cache to ensure fresh test
    orchestrator.clearCache();
    
    // Test with invalid input
    const result = await orchestrator.executeFinancialConsequenceAnalysis(
      null, // Invalid scenario
      {},
      []
    );
    
    if (!result.success && 
        result.error === 'Invalid consequence analysis data' &&
        Array.isArray(result.details) &&
        result.details.length > 0) {
      
      console.log('✅ PASSED: Input validation working');
      console.log(`   - Validation errors detected: ${result.details.length}`);
      console.log(`   - Error details: ${result.details.join(', ')}`);
      
      passedTests++;
      testResults.push({ 
        test: 'Input Validation', 
        passed: true, 
        details: {
          errorsDetected: result.details.length,
          validationErrors: result.details
        }
      });
    } else {
      console.log('❌ FAILED: Input validation not working');
      testResults.push({ test: 'Input Validation', passed: false, error: 'Validation failed' });
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.push({ test: 'Input Validation', passed: false, error: error.message });
  }
  
  // Test 5: Error Handling
  console.log('\n📋 Test 5: Error Handling');
  totalTests++;
  try {
    // Clear cache to ensure fresh test
    orchestrator.clearCache();
    
    // Force an error condition by providing malformed but valid-looking data
    const malformedScenario = {
      id: 'test-error',
      name: 'Error Test',
      type: 'purchase',
      amount: -1000 // Negative amount should cause validation error
    };
    
    const result = await orchestrator.executeFinancialConsequenceAnalysis(
      malformedScenario,
      { monthlyIncome: 5000 },
      [{ id: 'test', name: 'Test', type: 'checking', currentBalance: 1000, isActive: true }]
    );
    
    if (!result.success && result.error) {
      console.log('✅ PASSED: Error handling working');
      console.log(`   - Error detected: ${result.error}`);
      console.log(`   - Error code: ${result.code || 'GENERIC'}`);
      
      passedTests++;
      testResults.push({ 
        test: 'Error Handling', 
        passed: true, 
        details: {
          errorDetected: true,
          errorMessage: result.error,
          errorCode: result.code
        }
      });
    } else {
      console.log('❌ FAILED: Error handling not working');
      testResults.push({ test: 'Error Handling', passed: false, error: 'Error not properly handled' });
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.push({ test: 'Error Handling', passed: false, error: error.message });
  }
  
  // Test Results Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINANCIAL CONSEQUENCE ENGINE INTEGRATION TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n🎯 OVERALL RESULTS:`);
  console.log(`✅ PASSED: ${passedTests}/${totalTests} tests`);
  console.log(`❌ FAILED: ${totalTests - passedTests}/${totalTests} tests`);
  console.log(`📈 SUCCESS RATE: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Financial Consequence Engine integration is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the results above for details.');
  }
  
  console.log('\n📋 Detailed Test Results:');
  testResults.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`   ${index + 1}. ${result.test}: ${status}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
    if (result.details && typeof result.details === 'object') {
      console.log(`      Details: ${JSON.stringify(result.details, null, 6)}`);
    }
  });
  
  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    results: testResults
  };
}

// Export test functions
module.exports = {
  runIntegrationTests
};

// Run tests if called directly
if (require.main === module) {
  runIntegrationTests()
    .then(results => {
      process.exit(results.successRate === 100 ? 0 : 1);
    })
    .catch(error => {
      console.error('Integration test suite failed:', error);
      process.exit(1);
    });
} 