/**
 * Test Suite - Phase 3.7.3: Financial Health Monitoring
 * Comprehensive testing for real-time health scoring and continuous monitoring
 */

const { FinancialHealthMonitoring } = require('./financial-health-monitoring');

console.log('🧪 Starting Financial Health Monitoring Test Suite...\n');

// Mock test data
const healthyTestData = {
    transactions: [
        { id: 1, date: '2025-01-01', description: 'Salary', category: 'Income', amount: 8000, type: 'Income' },
        { id: 2, date: '2025-01-01', description: 'Rent', category: 'Housing', amount: -2000, type: 'Expense' },
        { id: 3, date: '2025-01-01', description: 'Groceries', category: 'Food', amount: -500, type: 'Expense' },
        { id: 4, date: '2025-01-01', description: 'Savings', category: 'Savings', amount: -2000, type: 'Transfer' }
    ],
    accounts: [
        { id: 'checking', name: 'Checking', type: 'ASSETS.LIQUID.CHECKING', balance: 15000 },
        { id: 'savings', name: 'Emergency Fund', type: 'ASSETS.LIQUID.SAVINGS', balance: 25000 },
        { id: 'investment', name: '401k', type: 'ASSETS.RETIREMENT.401K', balance: 100000 }
    ]
};

const unhealthyTestData = {
    transactions: [
        { id: 1, date: '2025-01-01', description: 'Part-time job', category: 'Income', amount: 2000, type: 'Income' },
        { id: 2, date: '2025-01-01', description: 'Rent', category: 'Housing', amount: -1800, type: 'Expense' },
        { id: 3, date: '2025-01-01', description: 'Credit payment', category: 'Debt', amount: -500, type: 'Expense' }
    ],
    accounts: [
        { id: 'checking', name: 'Checking', type: 'ASSETS.LIQUID.CHECKING', balance: 200 },
        { id: 'credit', name: 'Credit Card', type: 'LIABILITIES.DEBT.CREDIT_CARD', balance: -8500 }
    ]
};

async function runTests() {
    const results = [];
    let testCount = 0;
    
    try {
        // Test 1: Pipeline Creation
        testCount++;
        console.log('🔬 Test 1: Pipeline Creation');
        try {
            const healthMonitoring = new FinancialHealthMonitoring('test-key');
            if (healthMonitoring.pipeline && healthMonitoring.alertThresholds) {
                results.push({ test: 'Pipeline Creation', passed: true });
                console.log('✅ Pipeline created successfully\n');
            } else {
                throw new Error('Pipeline or thresholds not initialized');
            }
        } catch (error) {
            results.push({ test: 'Pipeline Creation', passed: false, error: error.message });
            console.log(`❌ Pipeline creation failed: ${error.message}\n`);
        }
        
        // Test 2: Health Score Calculations
        testCount++;
        console.log('🔬 Test 2: Health Score Calculations');
        try {
            const healthMonitoring = new FinancialHealthMonitoring('test-key');
            const healthyScores = await healthMonitoring.calculateComprehensiveHealthScores(healthyTestData);
            const unhealthyScores = await healthMonitoring.calculateComprehensiveHealthScores(unhealthyTestData);
            
            if (healthyScores.overall_health_score > unhealthyScores.overall_health_score) {
                results.push({ test: 'Health Score Calculations', passed: true });
                console.log(`✅ Health calculations working: Healthy=${healthyScores.overall_health_score}, Unhealthy=${unhealthyScores.overall_health_score}\n`);
            } else {
                throw new Error('Health score logic incorrect');
            }
        } catch (error) {
            results.push({ test: 'Health Score Calculations', passed: false, error: error.message });
            console.log(`❌ Health calculations failed: ${error.message}\n`);
        }
        
        // Test 3: Complete Pipeline Execution
        testCount++;
        console.log('🔬 Test 3: Complete Pipeline Execution');
        try {
            const healthMonitoring = new FinancialHealthMonitoring('test-key');
            const result = await healthMonitoring.runHealthMonitoringPipeline(healthyTestData);
            
            if (result.success && result.overview && result.key_metrics) {
                results.push({ test: 'Complete Pipeline', passed: true });
                console.log(`✅ Pipeline executed successfully: Health Score=${result.key_metrics.health_score}\n`);
            } else {
                throw new Error('Pipeline execution incomplete');
            }
        } catch (error) {
            results.push({ test: 'Complete Pipeline', passed: false, error: error.message });
            console.log(`❌ Pipeline execution failed: ${error.message}\n`);
        }
        
    } catch (error) {
        console.error('❌ Test suite error:', error);
    }
    
    // Generate report
    const passed = results.filter(r => r.passed).length;
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(50));
    results.forEach(result => {
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status}: ${result.test}`);
        if (result.error) console.log(`   Error: ${result.error}`);
    });
    console.log('='.repeat(50));
    console.log(`📈 SUMMARY: ${passed}/${testCount} tests passed`);
    
    if (passed === testCount) {
        console.log('🎉 All tests passed! Financial Health Monitoring ready for integration.');
    } else {
        console.log(`⚠️ ${testCount - passed} test(s) failed. Review implementation.`);
    }
}

// Run the tests
runTests().catch(console.error);

module.exports = { runTests }; 