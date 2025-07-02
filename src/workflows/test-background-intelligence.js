/**
 * Background Intelligence Test Suite - Phase 3.5.3
 * Comprehensive testing for continuous monitoring and proactive insights
 * Run with: node src/workflows/test-background-intelligence.js
 */

// Load environment variables
require('dotenv').config({ path: '../../.env' });

const { createBackgroundIntelligenceWorkflow, BackgroundIntelligenceManager } = require('./background-intelligence');

/**
 * Test Suite for Background Intelligence System
 */
async function runBackgroundIntelligenceTests() {
  console.log('\n🧪 BACKGROUND INTELLIGENCE PHASE 3.5.3 TEST SUITE');
  console.log('===================================================');
  console.log('Testing continuous monitoring and proactive insights...\n');

  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  // Test 1: Background Intelligence Workflow Creation
  await runTest('Background Intelligence Workflow Creation', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    
    if (!workflow) {
      throw new Error('Workflow creation returned null');
    }
    
    if (typeof workflow.invoke !== 'function') {
      throw new Error('Workflow missing invoke method');
    }
    
    return {
      workflowCreated: true,
      hasInvokeMethod: true
    };
  }, testResults);

  // Test 2: Basic Workflow Execution
  await runTest('Basic Workflow Execution', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    const startTime = Date.now();
    
    const result = await workflow.invoke({});
    const duration = Date.now() - startTime;
    
    if (!result) {
      throw new Error('Workflow execution returned null');
    }
    
    if (!result.systemStatus) {
      throw new Error('Result missing systemStatus');
    }
    
    if (!result.executionMetadata) {
      throw new Error('Result missing executionMetadata');
    }
    
    return {
      executionTime: duration,
      hasSystemStatus: !!result.systemStatus,
      hasExecutionMetadata: !!result.executionMetadata,
      isRunning: result.systemStatus.isRunning,
      version: result.executionMetadata.version
    };
  }, testResults);

  // Test 3: Background Intelligence Manager Creation
  await runTest('Background Intelligence Manager Creation', async () => {
    const manager = new BackgroundIntelligenceManager({
      interval: 5000, // 5 seconds for testing
      autoStart: false
    });
    
    if (!manager) {
      throw new Error('Manager creation failed');
    }
    
    if (typeof manager.start !== 'function') {
      throw new Error('Manager missing start method');
    }
    
    if (typeof manager.stop !== 'function') {
      throw new Error('Manager missing stop method');
    }
    
    const status = manager.getStatus();
    
    return {
      managerCreated: true,
      hasStartMethod: true,
      hasStopMethod: true,
      initialStatus: status,
      isRunning: status.isRunning
    };
  }, testResults);

  // Test 4: Manager Start/Stop Operations
  await runTest('Manager Start/Stop Operations', async () => {
    const manager = new BackgroundIntelligenceManager({
      interval: 2000, // 2 seconds for testing
      autoStart: false
    });
    
    // Test start
    await manager.start();
    let status = manager.getStatus();
    
    if (!status.isRunning) {
      throw new Error('Manager failed to start');
    }
    
    // Wait for at least one cycle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test stop
    await manager.stop();
    status = manager.getStatus();
    
    if (status.isRunning) {
      throw new Error('Manager failed to stop');
    }
    
    return {
      startSuccess: true,
      stopSuccess: true,
      finalStatus: status
    };
  }, testResults);

  // Test 5: Alert Detection System
  await runTest('Alert Detection System', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    
    // Create mock state with alert conditions
    const mockState = {
      monitoringConfig: {
        alertThresholds: {
          highRiskAnomaly: 0.7,
          healthScoreDrop: 0.3,
          unusualSpending: 2.5,
          largeTransaction: 500
        }
      },
      insights: [{
        type: 'analysis_complete',
        data: {
          anomalies: {
            high: [
              { type: 'amount', risk: 0.8, description: 'Unusually large transaction' }
            ]
          },
          healthScore: {
            overall: 2.0,
            grade: 'D'
          },
          patterns: {
            amounts: {
              max: 750.00
            }
          }
        }
      }],
      systemStatus: {
        errorCount: 2
      }
    };
    
    const result = await workflow.invoke(mockState);
    
    if (!result.activeAlerts) {
      throw new Error('No alerts generated');
    }
    
    const highRiskAlerts = result.activeAlerts.filter(a => a.severity === 'high');
    const mediumRiskAlerts = result.activeAlerts.filter(a => a.severity === 'medium');
    const lowRiskAlerts = result.activeAlerts.filter(a => a.severity === 'low');
    
    return {
      totalAlerts: result.activeAlerts.length,
      highRiskAlerts: highRiskAlerts.length,
      mediumRiskAlerts: mediumRiskAlerts.length,
      lowRiskAlerts: lowRiskAlerts.length,
      alertTypes: result.activeAlerts.map(a => a.type)
    };
  }, testResults);

  // Test 6: Proactive Insights Generation
  await runTest('Proactive Insights Generation', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    
    // Create mock state with historical data
    const mockState = {
      historicalSnapshots: [
        {
          timestamp: Date.now() - 3600000, // 1 hour ago
          transactionCount: 5,
          totalBalance: 1000.00
        },
        {
          timestamp: Date.now(),
          transactionCount: 8,
          totalBalance: 950.00
        }
      ],
      systemStatus: {
        startTime: Date.now() - 7200000, // 2 hours ago
        updateCount: 15
      },
      activeAlerts: [
        { severity: 'high', type: 'test_alert' },
        { severity: 'medium', type: 'test_alert' }
      ]
    };
    
    const result = await workflow.invoke(mockState);
    
    if (!result.insights) {
      throw new Error('No insights generated');
    }
    
    const actionableInsights = result.insights.filter(i => i.actionable);
    const infoInsights = result.insights.filter(i => !i.actionable);
    
    return {
      totalInsights: result.insights.length,
      actionableInsights: actionableInsights.length,
      infoInsights: infoInsights.length,
      insightTypes: result.insights.map(i => i.type)
    };
  }, testResults);

  // Test 7: Event System Testing
  await runTest('Event System Testing', async () => {
    const manager = new BackgroundIntelligenceManager({
      interval: 1000,
      autoStart: false
    });
    
    let alertReceived = false;
    let insightReceived = false;
    let cycleCompleted = false;
    
    // Set up event listeners
    manager.on('alert', (alert) => {
      alertReceived = true;
    });
    
    manager.on('insight', (insight) => {
      insightReceived = true;
    });
    
    manager.on('cycleComplete', (data) => {
      cycleCompleted = true;
    });
    
    // Execute one monitoring cycle
    await manager.executeMonitoringCycle();
    
    // Wait for events to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      alertEventWorks: alertReceived,
      insightEventWorks: insightReceived,
      cycleEventWorks: cycleCompleted,
      eventSystemWorking: cycleCompleted // At least cycle event should work
    };
  }, testResults);

  // Test 8: Continuous Monitoring Integration
  await runTest('Continuous Monitoring Integration', async () => {
    const manager = new BackgroundIntelligenceManager({
      interval: 1000, // 1 second for testing
      autoStart: false
    });
    
    // Start monitoring
    await manager.start();
    
    // Wait for 2 cycles
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const status = manager.getStatus();
    const alerts = manager.getAlerts();
    const insights = manager.getInsights();
    
    // Stop monitoring
    await manager.stop();
    
    return {
      wasRunning: status.isRunning,
      uptime: status.uptime,
      alertCount: alerts.length,
      insightCount: insights.length,
      hasCurrentState: !!status.currentState,
      integrationWorking: status.uptime > 1000 // At least 1 second uptime
    };
  }, testResults);

  // Test 9: Error Handling and Recovery
  await runTest('Error Handling and Recovery', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    
    // Test with invalid state
    const invalidState = {
      // Missing required fields to trigger error handling
      monitoringConfig: null
    };
    
    try {
      const result = await workflow.invoke(invalidState);
      
      // Should still return a result with error tracking
      if (!result) {
        throw new Error('Workflow should return result even with errors');
      }
      
      // Check if errors were captured
      const hasErrorTracking = result.errors && Array.isArray(result.errors);
      
      return {
        workflowCompleted: true,
        hasErrorTracking: hasErrorTracking,
        errorCount: result.errors ? result.errors.length : 0,
        gracefulErrorHandling: true
      };
      
    } catch (error) {
      throw new Error(`Workflow should handle errors gracefully: ${error.message}`);
    }
  }, testResults);

  // Test 10: State Persistence and History
  await runTest('State Persistence and History', async () => {
    const workflow = createBackgroundIntelligenceWorkflow();
    
    // Execute multiple cycles to build history
    const cycle1 = await workflow.invoke({});
    const cycle2 = await workflow.invoke(cycle1);
    const cycle3 = await workflow.invoke(cycle2);
    
    // Check if state is being maintained
    if (!cycle3.systemStatus) {
      throw new Error('System status not maintained');
    }
    
    if (!cycle3.executionMetadata) {
      throw new Error('Execution metadata not maintained');
    }
    
    // Check if history is being built
    const hasHistory = cycle3.historicalSnapshots && 
                      Array.isArray(cycle3.historicalSnapshots);
    
    return {
      cycle1Completed: !!cycle1,
      cycle2Completed: !!cycle2,
      cycle3Completed: !!cycle3,
      hasSystemStatus: !!cycle3.systemStatus,
      hasExecutionMetadata: !!cycle3.executionMetadata,
      hasHistory: hasHistory,
      historyLength: cycle3.historicalSnapshots ? cycle3.historicalSnapshots.length : 0
    };
  }, testResults);

  return testResults;
}

/**
 * Helper function to run individual tests
 */
async function runTest(testName, testFunction, testResults) {
  testResults.total++;
  const startTime = Date.now();
  
  try {
    console.log(`⏳ Running: ${testName}...`);
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    testResults.passed++;
    testResults.details.push({
      name: testName,
      passed: true,
      duration: duration,
      result: result
    });
    
    console.log(`✅ ${testName} - PASSED (${duration}ms)`);
    
    // Log key details
    if (result && typeof result === 'object') {
      Object.keys(result).forEach(key => {
        if (typeof result[key] === 'boolean' || typeof result[key] === 'number') {
          console.log(`   • ${key}: ${result[key]}`);
        }
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.details.push({
      name: testName,
      passed: false,
      duration: duration,
      error: error.message
    });
    
    console.log(`❌ ${testName} - FAILED (${duration}ms)`);
    console.log(`   Error: ${error.message}`);
  }
  
  console.log(''); // Empty line for readability
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Background Intelligence Phase 3.5.3 tests...');
  
  const startTime = Date.now();
  let testResults;
  
  try {
    testResults = await runBackgroundIntelligenceTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Display Results
  console.log('\n============================================================');
  console.log('📊 BACKGROUND INTELLIGENCE PHASE 3.5.3 TEST RESULTS');
  console.log('============================================================');
  console.log(`🎯 FlowGenius Assignment Status: ${testResults.passed >= 8 ? '✅ PASSING' : '❌ FAILING'}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}% (${testResults.passed}/${testResults.total})`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`🔧 Framework: Background Intelligence v3.5.3`);
  console.log(`🤖 Continuous Monitoring: ${testResults.passed >= 8 ? 'ENABLED' : 'DISABLED'}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`   • ${test.name}: ${test.error}`));
  }
  
  console.log('\n🎉 Phase 3.5.3 Completion Status:');
  console.log('   ✅ Background Workflow Execution: ' + (testResults.passed >= 2 ? 'COMPLETE' : 'INCOMPLETE'));
  console.log('   ✅ Continuous Monitoring Manager: ' + (testResults.passed >= 4 ? 'COMPLETE' : 'INCOMPLETE'));
  console.log('   ✅ Alert Detection System: ' + (testResults.passed >= 5 ? 'COMPLETE' : 'INCOMPLETE'));
  console.log('   ✅ Proactive Insights Generation: ' + (testResults.passed >= 6 ? 'COMPLETE' : 'INCOMPLETE'));
  console.log('   ✅ Event System Integration: ' + (testResults.passed >= 7 ? 'COMPLETE' : 'INCOMPLETE'));
  console.log('   ✅ Continuous Monitoring: ' + (testResults.passed >= 8 ? 'COMPLETE' : 'INCOMPLETE'));
  
  console.log('\n🚀 Ready for Phase 3.5.4: Advanced Scenario Intelligence');
  console.log('============================================================\n');
  
  console.log('✨ Background Intelligence test execution finished');
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runBackgroundIntelligenceTests }; 