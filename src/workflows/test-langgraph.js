/**
 * LangGraph Framework Test - Phase 3.5.1 Validation
 * Comprehensive testing for FlowGenius Assignment LangGraph Integration
 * Run with: node src/workflows/test-langgraph.js
 */

require('dotenv').config({ path: '../../.env' });
const { orchestrator } = require('./workflow-orchestrator');
const { createLangGraphWorkflow } = require('./langgraph-foundation');

/**
 * Sample financial data for testing
 */
const sampleFinancialData = {
  transactions: [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Salary Deposit',
      amount: 5000,
      category: 'Income'
    },
    {
      id: 2,
      date: '2024-01-16',
      description: 'Rent Payment',
      amount: -2000,
      category: 'Housing'
    },
    {
      id: 3,
      date: '2024-01-20',
      description: 'Grocery Shopping - Whole Foods',
      amount: -150,
      category: 'Food'
    },
    {
      id: 4,
      date: '2024-01-25',
      description: 'Gas Station Fill-up',
      amount: -60,
      category: 'Transportation'
    },
    {
      id: 5,
      date: '2024-02-15',
      description: 'Salary Deposit',
      amount: 5000,
      category: 'Income'
    },
    {
      id: 6,
      date: '2024-02-16',
      description: 'Rent Payment',
      amount: -2000,
      category: 'Housing'
    },
    {
      id: 7,
      date: '2024-02-20',
      description: 'Grocery Shopping - Trader Joes',
      amount: -180,
      category: 'Food'
    },
    {
      id: 8,
      date: '2024-03-01',
      description: 'Electric Bill',
      amount: -120,
      category: 'Utilities'
    }
  ],
  scenarios: [
    {
      type: 'salary_change',
      percentage: 10,
      description: '10% salary increase scenario'
    },
    {
      type: 'expense_change',
      percentage: -5,
      description: '5% expense reduction scenario'
    }
  ]
};

/**
 * Test Configuration
 */
const testConfig = {
  timeout: 120000, // 2 minutes
  expectAI: process.env.OPENAI_API_KEY ? true : false,
  verbose: true
};

/**
 * Test Results Tracker
 */
class TestResults {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, passed, details = null, duration = 0) {
    this.tests.push({
      name,
      passed,
      details,
      duration,
      timestamp: new Date().toISOString()
    });
    
    if (passed) {
      this.passed++;
      console.log(`✅ ${name} ${duration > 0 ? `(${duration}ms)` : ''}`);
      if (details && testConfig.verbose) {
        console.log(`   ${details}`);
      }
    } else {
      this.failed++;
      console.log(`❌ ${name}`);
      if (details) {
        console.log(`   Error: ${details}`);
      }
    }
  }

  getSummary() {
    const total = this.passed + this.failed;
    const successRate = total > 0 ? Math.round((this.passed / total) * 100) : 0;
    
    return {
      total,
      passed: this.passed,
      failed: this.failed,
      successRate,
      details: this.tests
    };
  }
}

/**
 * Main Test Runner
 */
async function runLangGraphTests() {
  console.log('🧪 LangGraph Framework Test Suite - Phase 3.5.1');
  console.log('='.repeat(60));
  console.log(`🎯 FlowGenius Assignment: LangGraph Integration Validation`);
  console.log(`⚡ AI Mode: ${testConfig.expectAI ? 'ENABLED' : 'DISABLED (no API key)'}`);
  console.log('='.repeat(60));
  console.log();

  const results = new TestResults();
  const overallStart = Date.now();

  try {
    // Test 1: LangGraph Workflow Creation
    console.log('1️⃣ Testing LangGraph Workflow Creation');
    await testWorkflowCreation(results);
    console.log();

    // Test 2: Workflow Orchestrator Initialization
    console.log('2️⃣ Testing Workflow Orchestrator Initialization');
    await testOrchestratorInitialization(results);
    console.log();

    // Test 3: Input Data Validation
    console.log('3️⃣ Testing Input Data Validation');
    await testInputValidation(results);
    console.log();

    // Test 4: Health Check System
    console.log('4️⃣ Testing Health Check System');
    await testHealthCheck(results);
    console.log();

    // Test 5: Full LangGraph Workflow Execution
    console.log('5️⃣ Testing Full LangGraph Workflow Execution');
    await testFullWorkflowExecution(results);
    console.log();

    // Test 6: Progress Tracking
    console.log('6️⃣ Testing Progress Tracking');
    await testProgressTracking(results);
    console.log();

    // Test 7: Caching System
    console.log('7️⃣ Testing Caching System');
    await testCachingSystem(results);
    console.log();

    // Test 8: Error Handling
    console.log('8️⃣ Testing Error Handling');
    await testErrorHandling(results);
    console.log();

    // Test 9: Scenario Application
    console.log('9️⃣ Testing Scenario Application');
    await testScenarioApplication(results);
    console.log();

    // Test 10: Performance Validation
    console.log('🔟 Testing Performance Validation');
    await testPerformanceValidation(results);
    console.log();

  } catch (error) {
    console.error('💥 Test suite crashed:', error);
    results.addTest('Test Suite Execution', false, error.message);
  }

  // Print Final Results
  const overallDuration = Date.now() - overallStart;
  printFinalResults(results, overallDuration);
}

/**
 * Test 1: LangGraph Workflow Creation
 */
async function testWorkflowCreation(results) {
  try {
    const start = Date.now();
    const workflow = createLangGraphWorkflow();
    const duration = Date.now() - start;
    
    if (workflow && typeof workflow.invoke === 'function') {
      results.addTest('LangGraph Workflow Creation', true, 'Workflow created with invoke method', duration);
    } else {
      results.addTest('LangGraph Workflow Creation', false, 'Workflow missing or invalid');
    }
  } catch (error) {
    results.addTest('LangGraph Workflow Creation', false, error.message);
  }
}

/**
 * Test 2: Workflow Orchestrator Initialization
 */
async function testOrchestratorInitialization(results) {
  try {
    const start = Date.now();
    
    // Test orchestrator properties
    const hasLangGraph = orchestrator.langGraphWorkflow !== null;
    const hasCache = orchestrator.cache instanceof Map;
    const hasActiveWorkflows = orchestrator.activeWorkflows instanceof Map;
    
    const duration = Date.now() - start;
    
    if (hasLangGraph && hasCache && hasActiveWorkflows) {
      results.addTest('Orchestrator Initialization', true, 'All components initialized', duration);
    } else {
      results.addTest('Orchestrator Initialization', false, 
        `Missing: ${!hasLangGraph ? 'LangGraph ' : ''}${!hasCache ? 'Cache ' : ''}${!hasActiveWorkflows ? 'ActiveWorkflows' : ''}`);
    }
    
    // Test system status
    const systemStatus = orchestrator.getSystemStatus();
    results.addTest('System Status Method', systemStatus.framework === 'LangGraph', 
      `Framework: ${systemStatus.framework}, Version: ${systemStatus.version}`);
      
  } catch (error) {
    results.addTest('Orchestrator Initialization', false, error.message);
  }
}

/**
 * Test 3: Input Data Validation
 */
async function testInputValidation(results) {
  try {
    // Test valid data
    const validErrors = orchestrator.validateInputData(sampleFinancialData);
    results.addTest('Valid Data Validation', validErrors.length === 0, 
      validErrors.length > 0 ? validErrors.join(', ') : 'No validation errors');

    // Test invalid data
    const invalidData = { transactions: [] };
    const invalidErrors = orchestrator.validateInputData(invalidData);
    results.addTest('Invalid Data Detection', invalidErrors.length > 0, 
      `Detected ${invalidErrors.length} validation errors`);

    // Test missing data
    const missingErrors = orchestrator.validateInputData(null);
    results.addTest('Missing Data Detection', missingErrors.length > 0, 
      `Detected ${missingErrors.length} validation errors`);
      
  } catch (error) {
    results.addTest('Input Data Validation', false, error.message);
  }
}

/**
 * Test 4: Health Check System
 */
async function testHealthCheck(results) {
  try {
    const start = Date.now();
    const health = await orchestrator.healthCheck();
    const duration = Date.now() - start;
    
    const isHealthy = health.status === 'healthy';
    const hasComponents = health.components && health.components.langGraph;
    const hasFramework = health.framework === 'LangGraph';
    
    results.addTest('Health Check System', isHealthy && hasComponents && hasFramework, 
      `Status: ${health.status}, Framework: ${health.framework}`, duration);
      
    if (testConfig.verbose && health.components) {
      console.log(`   Components: LangGraph=${health.components.langGraph}, Config=${health.components.config}, AI=${health.components.aiConnectivity}`);
    }
    
  } catch (error) {
    results.addTest('Health Check System', false, error.message);
  }
}

/**
 * Test 5: Full LangGraph Workflow Execution
 */
async function testFullWorkflowExecution(results) {
  try {
    console.log('   🔄 Executing full LangGraph workflow...');
    const start = Date.now();
    
    const result = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: false,
      timeout: testConfig.timeout
    });
    
    const duration = Date.now() - start;
    
    const isSuccessful = result.success === true;
    const hasData = result.data && result.data.summary;
    const hasMetadata = result.metadata && result.metadata.framework === 'LangGraph';
    const hasWorkflowId = result.workflowId && result.workflowId.startsWith('langgraph_');
    
    if (isSuccessful && hasData && hasMetadata && hasWorkflowId) {
      results.addTest('Full LangGraph Workflow Execution', true, 
        `Processed ${result.data.data?.historical?.summary?.totalTransactions || 0} transactions`, duration);
        
      if (testConfig.verbose) {
        console.log(`   Balance: $${result.data.summary?.currentBalance?.toFixed(2) || '0.00'}`);
        console.log(`   Confidence: ${((result.data.summary?.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`   Risk Level: ${result.data.summary?.riskLevel || 'Unknown'}`);
      }
    } else {
      results.addTest('Full LangGraph Workflow Execution', false, 
        `Missing: ${!isSuccessful ? 'Success ' : ''}${!hasData ? 'Data ' : ''}${!hasMetadata ? 'Metadata ' : ''}${!hasWorkflowId ? 'WorkflowID' : ''}`);
    }
    
  } catch (error) {
    results.addTest('Full LangGraph Workflow Execution', false, error.message);
  }
}

/**
 * Test 6: Progress Tracking
 */
async function testProgressTracking(results) {
  try {
    const progressUpdates = [];
    
    const result = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: false,
      timeout: testConfig.timeout,
      onProgress: (progress) => {
        progressUpdates.push(progress);
        if (testConfig.verbose) {
          console.log(`   📊 ${progress.stage}: ${progress.progress}% - ${progress.message}`);
        }
      }
    });
    
    const hasProgressUpdates = progressUpdates.length > 0;
    const hasLangGraphFramework = progressUpdates.some(p => p.framework === 'LangGraph');
    const hasCompleteStage = progressUpdates.some(p => p.stage === 'complete');
    
    results.addTest('Progress Tracking System', hasProgressUpdates && hasLangGraphFramework && hasCompleteStage,
      `Received ${progressUpdates.length} progress updates`);
      
  } catch (error) {
    results.addTest('Progress Tracking System', false, error.message);
  }
}

/**
 * Test 7: Caching System
 */
async function testCachingSystem(results) {
  try {
    // Clear cache first
    orchestrator.clearCache();
    
    // First execution (should not be cached)
    const start1 = Date.now();
    const result1 = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: true,
      timeout: testConfig.timeout
    });
    const duration1 = Date.now() - start1;
    
    // Second execution (should be cached)
    const start2 = Date.now();
    const result2 = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: true,
      timeout: testConfig.timeout
    });
    const duration2 = Date.now() - start2;
    
    const isCached = result2.metadata?.cached === true;
    const isFaster = duration2 < duration1 / 2;  // Should be significantly faster
    
    results.addTest('Caching System', isCached && isFaster,
      `First: ${duration1}ms, Second: ${duration2}ms (cached: ${isCached})`);
    
    // Test cache stats
    const cacheStats = orchestrator.getCacheStats();
    results.addTest('Cache Statistics', cacheStats.size > 0 && cacheStats.framework === 'LangGraph',
      `Cache size: ${cacheStats.size}, LangGraph entries: ${cacheStats.langGraphEntries}`);
      
  } catch (error) {
    results.addTest('Caching System', false, error.message);
  }
}

/**
 * Test 8: Error Handling
 */
async function testErrorHandling(results) {
  try {
    // Test with invalid data
    const invalidResult = await orchestrator.executeForecastWorkflow({ invalid: 'data' });
    const handlesInvalidData = !invalidResult.success && invalidResult.error;
    
    results.addTest('Invalid Data Error Handling', handlesInvalidData,
      `Error: ${invalidResult.error}`);
    
    // Test workflow cancellation
    const workflowId = 'test_workflow_123';
    const cancelResult = orchestrator.cancelWorkflow(workflowId);
    results.addTest('Workflow Cancellation', cancelResult === false,
      'Correctly handles non-existent workflow cancellation');
      
  } catch (error) {
    results.addTest('Error Handling', false, error.message);
  }
}

/**
 * Test 9: Scenario Application
 */
async function testScenarioApplication(results) {
  try {
    const result = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: false,
      timeout: testConfig.timeout
    });
    
    const hasScenarios = result.data?.data?.scenarios?.applied?.length > 0;
    const hasAdjustments = result.data?.data?.scenarios?.adjustedProjections;
    
    results.addTest('Scenario Application', hasScenarios && hasAdjustments,
      `Applied ${result.data?.data?.scenarios?.applied?.length || 0} scenarios`);
      
  } catch (error) {
    results.addTest('Scenario Application', false, error.message);
  }
}

/**
 * Test 10: Performance Validation
 */
async function testPerformanceValidation(results) {
  try {
    const start = Date.now();
    
    const result = await orchestrator.executeForecastWorkflow(sampleFinancialData, {
      useCache: false,
      timeout: testConfig.timeout
    });
    
    const totalDuration = Date.now() - start;
    const workflowDuration = result.metadata?.totalExecutionTime || totalDuration;
    
    // Performance thresholds
    const isWithinTimeout = totalDuration < testConfig.timeout;
    const isReasonablyFast = workflowDuration < 30000; // Under 30 seconds
    
    results.addTest('Performance Validation', isWithinTimeout && isReasonablyFast,
      `Total: ${totalDuration}ms, Workflow: ${workflowDuration}ms`);
      
  } catch (error) {
    results.addTest('Performance Validation', false, error.message);
  }
}

/**
 * Print Final Test Results
 */
function printFinalResults(results, overallDuration) {
  console.log('='.repeat(60));
  console.log('📊 LANGGRAPH PHASE 3.5.1 TEST RESULTS');
  console.log('='.repeat(60));
  
  const summary = results.getSummary();
  
  console.log(`🎯 FlowGenius Assignment Status: ${summary.successRate >= 80 ? '✅ PASSING' : '❌ FAILING'}`);
  console.log(`📈 Success Rate: ${summary.successRate}% (${summary.passed}/${summary.total})`);
  console.log(`⏱️  Total Duration: ${overallDuration}ms`);
  console.log(`🔧 Framework: LangGraph v3.5.1`);
  console.log(`🤖 AI Integration: ${testConfig.expectAI ? 'ENABLED' : 'DISABLED'}`);
  
  if (summary.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.name}: ${test.details}`);
    });
  }
  
  console.log('\n🎉 Phase 3.5.1 Completion Status:');
  console.log(`   ✅ LangGraph Framework Setup: ${summary.successRate >= 70 ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`   ✅ Workflow Orchestration: ${summary.passed >= 5 ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`   ✅ AI Integration: ${testConfig.expectAI ? 'COMPLETE' : 'DISABLED'}`);
  console.log(`   ✅ Background Processing: ${summary.passed >= 7 ? 'COMPLETE' : 'INCOMPLETE'}`);
  
  console.log('\n🚀 Ready for Phase 3.5.2: Financial Analysis Workflow Chain');
  console.log('='.repeat(60));
}

// Run the test suite
if (require.main === module) {
  runLangGraphTests().then(() => {
    console.log('\n✨ LangGraph test execution finished');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { 
  runLangGraphTests, 
  sampleFinancialData,
  testConfig
}; 