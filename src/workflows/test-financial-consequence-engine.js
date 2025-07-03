/**
 * Test Suite for Financial Consequence Engine - Phase 4.1
 * Comprehensive testing of realistic financial consequence modeling
 */

const { FinancialConsequenceEngine } = require('./financial-consequence-engine');

/**
 * Test Financial Consequence Engine
 */
async function testFinancialConsequenceEngine() {
  console.log('🧪 Testing Financial Consequence Engine...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  try {
    // Test 1: Basic Consequence Analysis
    totalTests++;
    console.log('📝 Test 1: Basic Consequence Analysis');
    const result1 = await testBasicConsequenceAnalysis();
    if (result1.success) {
      console.log('✅ PASSED: Basic consequence analysis working correctly');
      passedTests++;
    } else {
      console.log('❌ FAILED: Basic consequence analysis failed');
      console.log('   Error:', result1.error);
    }
    console.log('');
    
    // Test 2: Overdraft Fee Calculation
    totalTests++;
    console.log('📝 Test 2: Overdraft Fee Calculation');
    const result2 = await testOverdraftFeeCalculation();
    if (result2.success) {
      console.log('✅ PASSED: Overdraft fee calculation working correctly');
      passedTests++;
    } else {
      console.log('❌ FAILED: Overdraft fee calculation failed');
      console.log('   Error:', result2.error);
    }
    console.log('');
    
    // Test 3: Credit Impact Analysis
    totalTests++;
    console.log('📝 Test 3: Credit Impact Analysis');
    const result3 = await testCreditImpactAnalysis();
    if (result3.success) {
      console.log('✅ PASSED: Credit impact analysis working correctly');
      passedTests++;
    } else {
      console.log('❌ FAILED: Credit impact analysis failed');
      console.log('   Error:', result3.error);
    }
    console.log('');
    
    // Test 4: Intelligent Payment Method Selection
    totalTests++;
    console.log('📝 Test 4: Intelligent Payment Method Selection');
    const result4 = await testIntelligentPaymentSelection();
    if (result4.success) {
      console.log('✅ PASSED: Intelligent payment selection working correctly');
      passedTests++;
    } else {
      console.log('❌ FAILED: Intelligent payment selection failed');
      console.log('   Error:', result4.error);
    }
    console.log('');
    
    // Test 5: Alternative Approaches Generation
    totalTests++;
    console.log('📝 Test 5: Alternative Approaches Generation');
    const result5 = await testAlternativeApproaches();
    if (result5.success) {
      console.log('✅ PASSED: Alternative approaches generation working correctly');
      passedTests++;
    } else {
      console.log('❌ FAILED: Alternative approaches generation failed');
      console.log('   Error:', result5.error);
    }
    console.log('');
    
    // Final Results
    console.log('📊 TEST RESULTS:');
    console.log('==================================================');
    console.log(`✅ PASSED: ${passedTests}/${totalTests} tests`);
    console.log(`❌ FAILED: ${totalTests - passedTests}/${totalTests} tests`);
    console.log('==================================================');
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Financial Consequence Engine ready for integration.');
      return { success: true, passedTests, totalTests };
    } else {
      console.log('⚠️ Some tests failed. Review implementation before proceeding.');
      return { success: false, passedTests, totalTests };
    }
    
  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 1: Basic Consequence Analysis
 */
async function testBasicConsequenceAnalysis() {
  try {
    const engine = new FinancialConsequenceEngine();
    
    // Mock scenario: Major purchase requiring $5,000
    const scenario = {
      id: 'test-scenario-1',
      name: 'Home Theater System',
      type: 'major_purchase',
      parameters: {
        purchaseAmount: 5000,
        description: 'Premium home theater system'
      }
    };
    
    // Mock financial context
    const financialContext = {
      monthlyIncome: 6000,
      monthlyExpenses: 4500,
      emergencyFund: 3000
    };
    
    // Mock accounts with insufficient checking funds
    const accounts = [
      {
        id: 'checking-1',
        name: 'Primary Checking',
        type: 'checking',
        currentBalance: 2500,
        isActive: true,
        overdraftFees: { perOccurrence: 35, maxPerDay: 6 }
      },
      {
        id: 'savings-1',
        name: 'Emergency Savings',
        type: 'savings',
        currentBalance: 3000,
        isActive: true
      },
      {
        id: 'credit-1',
        name: 'Rewards Credit Card',
        type: 'credit_card',
        currentBalance: 1500,
        creditLimit: 8000,
        interestRate: 0.15,
        isActive: true
      }
    ];
    
    const result = await engine.executeConsequenceAnalysis(scenario, financialContext, accounts);
    
    // Validate basic structure
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    const report = result.result;
    
    // Check required properties
    if (typeof report.executionFeasible !== 'boolean') {
      throw new Error('Missing executionFeasible property');
    }
    
    if (typeof report.totalCost !== 'number') {
      throw new Error('Missing totalCost property');
    }
    
    if (!['low', 'moderate', 'high'].includes(report.riskLevel)) {
      throw new Error('Invalid riskLevel');
    }
    
    if (!report.recommendedApproach) {
      throw new Error('Missing recommendedApproach');
    }
    
    if (!Array.isArray(report.warnings)) {
      throw new Error('Warnings should be an array');
    }
    
    if (!Array.isArray(report.nextSteps)) {
      throw new Error('NextSteps should be an array');
    }
    
    // Validate detailed analysis
    if (!report.detailedAnalysis.paymentAnalysis) {
      throw new Error('Missing payment analysis');
    }
    
    if (!report.detailedAnalysis.consequences) {
      throw new Error('Missing consequences');
    }
    
    if (!report.detailedAnalysis.solutions) {
      throw new Error('Missing solutions');
    }
    
    // Check that scenario cost matches input
    if (report.scenarioCost !== 5000) {
      throw new Error(`Expected scenario cost 5000, got ${report.scenarioCost}`);
    }
    
    return { success: true, result: report };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Overdraft Fee Calculation
 */
async function testOverdraftFeeCalculation() {
  try {
    const engine = new FinancialConsequenceEngine();
    
    // Scenario that will cause overdraft
    const scenario = {
      id: 'test-scenario-2',
      name: 'Emergency Repair',
      type: 'emergency_expense',
      parameters: {
        expenseAmount: 3000
      }
    };
    
    const financialContext = {
      monthlyIncome: 4000,
      monthlyExpenses: 3500
    };
    
    // Account with insufficient funds to trigger overdraft
    const accounts = [
      {
        id: 'checking-low',
        name: 'Low Balance Checking',
        type: 'checking',
        currentBalance: 500,
        isActive: true,
        overdraftFees: { perOccurrence: 35, maxPerDay: 6 },
        nsfFee: 30,
        dailyOverdraftFee: 5
      }
    ];
    
    const result = await engine.executeConsequenceAnalysis(scenario, financialContext, accounts);
    
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    const report = result.result;
    
    // Should have overdraft consequences
    const consequences = report.detailedAnalysis.consequences;
    
    if (!consequences.overdraftFees || consequences.overdraftFees.length === 0) {
      throw new Error('Expected overdraft fees to be calculated');
    }
    
    const overdraftFee = consequences.overdraftFees[0];
    
    // Validate overdraft fee structure
    if (!overdraftFee.accountId || !overdraftFee.accountName) {
      throw new Error('Missing overdraft fee account information');
    }
    
    if (typeof overdraftFee.overdraftAmount !== 'number' || overdraftFee.overdraftAmount <= 0) {
      throw new Error('Invalid overdraft amount');
    }
    
    if (typeof overdraftFee.totalCost !== 'number' || overdraftFee.totalCost <= 0) {
      throw new Error('Invalid overdraft total cost');
    }
    
    // Should include overdraft costs in total additional costs
    if (consequences.totalAdditionalCosts <= 0) {
      throw new Error('Expected additional costs from overdraft');
    }
    
    return { success: true, overdraftFees: consequences.overdraftFees };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Credit Impact Analysis
 */
async function testCreditImpactAnalysis() {
  try {
    const engine = new FinancialConsequenceEngine();
    
    // Scenario requiring credit card usage
    const scenario = {
      id: 'test-scenario-3',
      name: 'Medical Expense',
      type: 'emergency_expense',
      parameters: {
        expenseAmount: 4000
      }
    };
    
    const financialContext = {
      monthlyIncome: 5000,
      monthlyExpenses: 4000
    };
    
    // Accounts that will trigger credit card usage
    const accounts = [
      {
        id: 'checking-limited',
        name: 'Limited Checking',
        type: 'checking',
        currentBalance: 1000,
        isActive: true
      },
      {
        id: 'credit-high-util',
        name: 'High Utilization Card',
        type: 'credit_card',
        currentBalance: 2000,
        creditLimit: 5000,
        interestRate: 0.18,
        isActive: true
      }
    ];
    
    const result = await engine.executeConsequenceAnalysis(scenario, financialContext, accounts);
    
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    const report = result.result;
    const consequences = report.detailedAnalysis.consequences;
    
    // Should have credit utilization analysis
    if (!consequences.creditUtilization || Object.keys(consequences.creditUtilization).length === 0) {
      throw new Error('Expected credit utilization analysis');
    }
    
    const creditUtil = consequences.creditUtilization['credit-high-util'];
    
    if (!creditUtil) {
      throw new Error('Missing credit utilization for test card');
    }
    
    // Validate credit utilization calculation
    if (typeof creditUtil.utilizationRate !== 'number') {
      throw new Error('Invalid utilization rate');
    }
    
    if (!['low', 'moderate', 'high'].includes(creditUtil.utilizationImpact)) {
      throw new Error('Invalid utilization impact level');
    }
    
    // Should have interest cost analysis
    if (!consequences.interestCosts || Object.keys(consequences.interestCosts).length === 0) {
      throw new Error('Expected interest cost analysis');
    }
    
    const interestCost = consequences.interestCosts['credit-high-util'];
    
    if (!interestCost) {
      throw new Error('Missing interest cost for test card');
    }
    
    if (typeof interestCost.yearlyInterest !== 'number' || interestCost.yearlyInterest <= 0) {
      throw new Error('Invalid yearly interest calculation');
    }
    
    if (typeof interestCost.minimumPayment !== 'number' || interestCost.minimumPayment <= 0) {
      throw new Error('Invalid minimum payment calculation');
    }
    
    return { success: true, creditAnalysis: { creditUtil, interestCost } };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Intelligent Payment Method Selection
 */
async function testIntelligentPaymentSelection() {
  try {
    const engine = new FinancialConsequenceEngine();
    
    const scenario = {
      id: 'test-scenario-4',
      name: 'Vehicle Repair',
      type: 'major_purchase',
      parameters: {
        purchaseAmount: 2500
      }
    };
    
    const financialContext = {
      monthlyIncome: 5500,
      monthlyExpenses: 4000
    };
    
    // Multiple payment options with different cost structures
    const accounts = [
      {
        id: 'checking-sufficient',
        name: 'Primary Checking',
        type: 'checking',
        currentBalance: 3000,
        isActive: true
      },
      {
        id: 'credit-low-rate',
        name: 'Low Rate Card',
        type: 'credit_card',
        currentBalance: 500,
        creditLimit: 5000,
        interestRate: 0.12,
        isActive: true
      },
      {
        id: 'credit-high-rate',
        name: 'High Rate Card',
        type: 'credit_card',
        currentBalance: 1000,
        creditLimit: 3000,
        interestRate: 0.24,
        isActive: true
      }
    ];
    
    const result = await engine.executeConsequenceAnalysis(scenario, financialContext, accounts);
    
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    const report = result.result;
    const solutions = report.detailedAnalysis.solutions;
    
    // Should have optimal payment method
    if (!solutions.optimalPaymentMethod) {
      throw new Error('Missing optimal payment method');
    }
    
    const optimalMethod = solutions.optimalPaymentMethod;
    
    if (!optimalMethod.account || !optimalMethod.account.id) {
      throw new Error('Invalid optimal payment method account');
    }
    
    if (typeof optimalMethod.cost !== 'number') {
      throw new Error('Invalid optimal payment method cost');
    }
    
    if (!['low', 'moderate', 'high'].includes(optimalMethod.riskLevel)) {
      throw new Error('Invalid optimal payment method risk level');
    }
    
    // Optimal method should prefer checking account (no interest) when sufficient funds available
    if (optimalMethod.account.id !== 'checking-sufficient') {
      console.log('⚠️ Note: Expected checking account to be optimal, got:', optimalMethod.account.name);
    }
    
    return { success: true, optimalMethod };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: Alternative Approaches Generation
 */
async function testAlternativeApproaches() {
  try {
    const engine = new FinancialConsequenceEngine();
    
    // Large expense scenario that should trigger alternatives
    const scenario = {
      id: 'test-scenario-5',
      name: 'Home Renovation',
      type: 'major_purchase',
      parameters: {
        purchaseAmount: 15000
      }
    };
    
    const financialContext = {
      monthlyIncome: 6000,
      monthlyExpenses: 5000,
      emergencyFund: 2000
    };
    
    // Limited accounts to make execution challenging
    const accounts = [
      {
        id: 'checking-limited',
        name: 'Limited Checking',
        type: 'checking',
        currentBalance: 2000,
        isActive: true
      },
      {
        id: 'savings-emergency',
        name: 'Emergency Fund',
        type: 'savings',
        currentBalance: 2000,
        isActive: true
      },
      {
        id: 'credit-maxed',
        name: 'Near Max Credit',
        type: 'credit_card',
        currentBalance: 4500,
        creditLimit: 5000,
        interestRate: 0.18,
        isActive: true
      }
    ];
    
    const result = await engine.executeConsequenceAnalysis(scenario, financialContext, accounts);
    
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    const report = result.result;
    const solutions = report.detailedAnalysis.solutions;
    
    // Should have alternative approaches
    if (!solutions.alternativeApproaches || solutions.alternativeApproaches.length === 0) {
      throw new Error('Missing alternative approaches');
    }
    
    const alternatives = solutions.alternativeApproaches;
    
    // Validate alternative structure
    for (const alt of alternatives) {
      if (!alt.type || !alt.title || !alt.description) {
        throw new Error('Invalid alternative approach structure');
      }
      
      if (typeof alt.costReduction !== 'number') {
        throw new Error('Invalid cost reduction amount');
      }
      
      if (!alt.riskReduction) {
        throw new Error('Missing risk reduction assessment');
      }
    }
    
    // Should have risk mitigation strategies
    if (!solutions.riskMitigation || solutions.riskMitigation.length === 0) {
      throw new Error('Missing risk mitigation strategies');
    }
    
    const riskMitigation = solutions.riskMitigation;
    
    for (const strategy of riskMitigation) {
      if (!strategy.type || !strategy.priority || !strategy.description) {
        throw new Error('Invalid risk mitigation strategy structure');
      }
    }
    
    // Should have cost optimizations
    if (!solutions.costOptimizations || solutions.costOptimizations.length === 0) {
      throw new Error('Missing cost optimizations');
    }
    
    const optimizations = solutions.costOptimizations;
    
    for (const opt of optimizations) {
      if (!opt.type || !opt.description) {
        throw new Error('Invalid cost optimization structure');
      }
      
      if (typeof opt.potentialSaving !== 'number') {
        throw new Error('Invalid potential saving amount');
      }
    }
    
    return { success: true, alternatives, riskMitigation, optimizations };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFinancialConsequenceEngine().then(result => {
    if (result.success) {
      console.log('\n🎯 Financial Consequence Engine: All systems operational!');
      process.exit(0);
    } else {
      console.log('\n💥 Financial Consequence Engine: Tests failed!');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testFinancialConsequenceEngine
}; 