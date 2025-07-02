/**
 * Test Suite for Predictive Analytics Pipeline - Phase 3.7.2
 */

const { createPredictiveAnalyticsPipeline, AdvancedMLAlgorithms } = require('./predictive-analytics-pipeline');

class PredictiveAnalyticsPipelineTestSuite {
  constructor() {
    this.testResults = [];
    this.pipeline = null;
    this.startTime = null;
  }

  async runAllTests() {
    console.log('🧪 PREDICTIVE ANALYTICS PIPELINE TEST SUITE\n');
    this.startTime = Date.now();
    
    try {
      await this.testPipelineCreation();
      await this.testMLAlgorithms();
      await this.testCompleteWorkflow();
      this.displayResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testPipelineCreation() {
    console.log('🏗️ Testing pipeline creation...');
    
    try {
      this.pipeline = createPredictiveAnalyticsPipeline();
      
      if (!this.pipeline || typeof this.pipeline.invoke !== 'function') {
        throw new Error('Pipeline creation failed');
      }

      this.testResults.push({
        test: 'Pipeline Creation',
        status: 'PASSED',
        message: 'Pipeline created successfully'
      });

      console.log('✅ Pipeline creation test passed\n');
    } catch (error) {
      this.testResults.push({
        test: 'Pipeline Creation',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testMLAlgorithms() {
    console.log('🤖 Testing ML algorithms...');
    
    try {
      // Test Time Series Forecasting
      const timeSeriesData = this.generateTimeSeriesData(12);
      const forecastResult = AdvancedMLAlgorithms.performTimeSeriesForecasting(timeSeriesData, 6);
      
      if (!forecastResult.forecasts || !Array.isArray(forecastResult.forecasts)) {
        throw new Error('Time series forecasting failed');
      }

      // Test Anomaly Detection
      const anomalyData = this.generateAnomalyTestData(50);
      const anomalyResult = AdvancedMLAlgorithms.detectAdvancedAnomalies(
        anomalyData, 
        ['amount', 'frequency']
      );
      
      if (typeof anomalyResult.totalAnomalies !== 'number') {
        throw new Error('Anomaly detection failed');
      }

      this.testResults.push({
        test: 'ML Algorithms',
        status: 'PASSED',
        message: `ML algorithms validated: forecasts=${forecastResult.forecasts.length}, anomalies=${anomalyResult.totalAnomalies}`
      });

      console.log('✅ ML algorithms test passed\n');
    } catch (error) {
      this.testResults.push({
        test: 'ML Algorithms',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testCompleteWorkflow() {
    console.log('🎯 Testing complete workflow...');
    
    try {
      const testData = {
        inputDataStreams: {
          transactionData: { transactions: this.generateMockTransactions(20) },
          accountData: { accounts: [] },
          userContext: { userId: 'test-user', riskTolerance: 'moderate' },
          externalFactors: {},
          realTimeEvents: []
        }
      };

      const startTime = Date.now();
      const result = await this.pipeline.invoke(testData);
      const executionTime = Date.now() - startTime;
      
      if (!result) {
        throw new Error('Pipeline returned no result');
      }

      this.testResults.push({
        test: 'Complete Workflow',
        status: 'PASSED',
        message: `Pipeline executed successfully in ${executionTime}ms`
      });

      console.log('✅ Complete workflow test passed\n');
    } catch (error) {
      this.testResults.push({
        test: 'Complete Workflow',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  displayResults() {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.status === 'PASSED').length;
    const totalTests = this.testResults.length;

    console.log('📊 TEST RESULTS:');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.message) console.log(`   ${result.message}`);
      if (result.error) console.log(`   Error: ${result.error}`);
    });

    console.log(`\n📈 SUMMARY: ${passedTests}/${totalTests} tests passed (${totalTime}ms)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Pipeline ready for integration.');
    }
  }

  generateMockTransactions(count) {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `txn-${i}`,
        date: new Date(Date.now() - (i * 86400000)),
        description: `Transaction ${i}`,
        amount: (Math.random() - 0.5) * 1000,
        category: 'test'
      });
    }
    return transactions;
  }

  generateTimeSeriesData(months) {
    const data = [];
    for (let i = 0; i < months; i++) {
      data.push({
        date: new Date(Date.now() - (i * 30 * 86400000)),
        value: 1000 + (Math.random() * 500)
      });
    }
    return data;
  }

  generateAnomalyTestData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: `data-${i}`,
        date: new Date(Date.now() - (i * 86400000)),
        amount: Math.random() < 0.1 ? Math.random() * 10000 : Math.random() * 500,
        frequency: 1
      });
    }
    return data;
  }
}

module.exports = { PredictiveAnalyticsPipelineTestSuite };

if (require.main === module) {
  const testSuite = new PredictiveAnalyticsPipelineTestSuite();
  testSuite.runAllTests().catch(console.error);
} 