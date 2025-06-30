/**
 * Simple test for the simplified workflow
 */

require('dotenv').config({ path: '../../.env' });
const { executeSimpleWorkflow } = require('./simple-workflow');

const testData = {
  transactions: [
    { id: 1, date: '2024-01-15', description: 'Salary', amount: 5000, category: 'Income' },
    { id: 2, date: '2024-01-16', description: 'Rent', amount: -2000, category: 'Housing' },
    { id: 3, date: '2024-01-20', description: 'Groceries', amount: -150, category: 'Food' }
  ],
  scenarios: [
    { type: 'salary_change', percentage: 10, description: '10% salary increase' }
  ]
};

async function runTest() {
  console.log('🧪 Testing simplified workflow...');
  
  try {
    const result = await executeSimpleWorkflow(testData);
    
    console.log('✅ Workflow completed!');
    console.log('Errors:', result.errors.length);
    console.log('Has forecast:', !!result.finalForecast);
    console.log('Processing time:', result.metadata.processingTime + 'ms');
    
    if (result.finalForecast) {
      console.log('\n📊 Forecast Results:');
      console.log('Current Balance: $' + result.finalForecast.summary.currentBalance);
      console.log('12-Month Projection: $' + result.finalForecast.summary.projectedBalance12Months);
      console.log('Monthly Net Income: $' + result.finalForecast.summary.monthlyNetIncome);
      console.log('Confidence: ' + (result.finalForecast.summary.confidence * 100).toFixed(1) + '%');
      
      console.log('\n💡 Insights:');
      result.finalForecast.insights.forEach((insight, i) => {
        console.log(`${i + 1}. ${insight}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors occurred:');
      result.errors.forEach(error => {
        console.log(`- ${error.node}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTest(); 