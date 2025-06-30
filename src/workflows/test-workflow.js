/**
 * Test file for LangGraph workflow functionality
 * Run with: node src/workflows/test-workflow.js
 */

require('dotenv').config({ path: '../../.env' });
const { orchestrator } = require('./workflow-orchestrator');

/**
 * Sample test data
 */
const sampleData = {
  transactions: [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Salary',
      amount: 5000,
      category: 'Income'
    },
    {
      id: 2,
      date: '2024-01-16',
      description: 'Rent',
      amount: -2000,
      category: 'Housing'
    },
    {
      id: 3,
      date: '2024-01-20',
      description: 'Grocery Shopping',
      amount: -150,
      category: 'Food'
    },
    {
      id: 4,
      date: '2024-01-25',
      description: 'Gas',
      amount: -60,
      category: 'Transportation'
    },
    {
      id: 5,
      date: '2024-02-15',
      description: 'Salary',
      amount: 5000,
      category: 'Income'
    }
  ],
  scenarios: [
    {
      type: 'salary_change',
      percentage: 10,
      description: '10% salary increase'
    }
  ]
};

/**
 * Test workflow execution
 */
async function testWorkflow() {
  console.log('🧪 Starting LangGraph Workflow Test\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing workflow health check...');
    const health = await orchestrator.healthCheck();
    console.log('Health status:', health);
    
    if (health.status !== 'healthy') {
      console.error('❌ Workflow system is not healthy');
      return;
    }
    
    console.log('✅ Workflow system is healthy\n');
    
    // Test 2: Input Validation
    console.log('2️⃣ Testing input validation...');
    const validationErrors = orchestrator.validateInputData(sampleData);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      return;
    }
    
    console.log('✅ Input data is valid\n');
    
    // Test 3: Workflow Execution
    console.log('3️⃣ Testing workflow execution...');
    console.log('⏱️  This may take 30-60 seconds...\n');
    
    const startTime = Date.now();
    
    const result = await orchestrator.executeForecastWorkflow(sampleData, {
      useCache: false, // Disable cache for testing
      timeout: 90000,  // 90 seconds timeout
      onProgress: (progress) => {
        console.log(`📊 Progress: ${progress.progress}% - ${progress.message}`);
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n🎯 Workflow Result:');
    console.log('Success:', result.success);
    console.log('Duration:', `${duration}ms`);
    
    if (result.success) {
      console.log('✅ Workflow completed successfully!\n');
      
      // Display key results
      const forecast = result.data;
      console.log('📈 Forecast Summary:');
      console.log(`Current Balance: $${forecast.summary.currentBalance?.toFixed(2) || 'N/A'}`);
      console.log(`12-Month Projection: $${forecast.summary.projectedBalance12Months?.toFixed(2) || 'N/A'}`);
      console.log(`Monthly Net Income: $${forecast.summary.monthlyNetIncome?.toFixed(2) || 'N/A'}`);
      console.log(`Confidence: ${(forecast.summary.confidence * 100)?.toFixed(1) || 'N/A'}%`);
      
      if (forecast.insights && forecast.insights.length > 0) {
        console.log('\n💡 Insights:');
        forecast.insights.forEach((insight, i) => {
          console.log(`${i + 1}. ${insight}`);
        });
      }
      
      console.log('\n📊 Projections:');
      Object.entries(forecast.projections || {}).forEach(([key, projection]) => {
        console.log(`${projection.timeframe}: $${projection.projectedBalance?.toFixed(2)} (${(projection.confidence * 100)?.toFixed(1)}% confidence)`);
      });
      
    } else {
      console.error('❌ Workflow failed:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
    
    // Test 4: Cache functionality
    console.log('\n4️⃣ Testing cache functionality...');
    const cacheStats = orchestrator.getCacheStats();
    console.log('Cache stats:', cacheStats);
    
    // Test another execution to test caching
    console.log('Running same workflow again to test caching...');
    const cachedStart = Date.now();
    
    const cachedResult = await orchestrator.executeForecastWorkflow(sampleData, {
      useCache: true
    });
    
    const cachedDuration = Date.now() - cachedStart;
    console.log(`Cached execution time: ${cachedDuration}ms`);
    
    if (cachedDuration < duration / 2) {
      console.log('✅ Caching appears to be working (faster execution)');
    } else {
      console.log('⚠️  Caching may not be working optimally');
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testWorkflow().then(() => {
    console.log('\n✨ Test execution finished');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testWorkflow, sampleData }; 