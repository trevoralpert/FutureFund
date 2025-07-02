/**
 * Simple Multi-Account Intelligence Workflow Test
 * Tests workflow structure and basic functionality without database dependencies
 */

const { createMultiAccountIntelligenceWorkflow } = require('./multi-account-intelligence');

async function testMultiAccountIntelligence() {
  console.log('🧪 Testing Multi-Account Intelligence Workflow (Simple)...\n');
  
  try {
    // Test 1: Workflow Creation
    console.log('🏗️ Test 1: Creating workflow...');
    const workflow = createMultiAccountIntelligenceWorkflow();
    if (!workflow) {
      throw new Error('Workflow creation failed');
    }
    console.log('✅ Workflow created successfully\n');
    
    // Test 2: Mock Data Test
    console.log('📊 Test 2: Testing with mock data...');
    
    // Create mock account data
    const mockAccounts = [
      {
        id: 'acc1',
        userId: 'user1',
        name: 'Checking',
        type: 'checking',
        currentBalance: 5000,
        typeInfo: { category: 'ASSETS.LIQUID', liquidityScore: 100, riskLevel: 1 }
      },
      {
        id: 'acc2',
        userId: 'user1',
        name: 'Savings',
        type: 'savings',
        currentBalance: 15000,
        interestRate: 0.02,
        typeInfo: { category: 'ASSETS.LIQUID', liquidityScore: 95, riskLevel: 1 }
      },
      {
        id: 'acc3',
        userId: 'user1',
        name: '401k',
        type: '401k',
        currentBalance: 75000,
        taxAdvantaged: true,
        typeInfo: { category: 'ASSETS.RETIREMENT', liquidityScore: 20, riskLevel: 3 }
      },
      {
        id: 'acc4',
        userId: 'user1',
        name: 'Investment',
        type: 'investment',
        currentBalance: 45000,
        typeInfo: { category: 'ASSETS.INVESTMENT', liquidityScore: 60, riskLevel: 4 }
      },
      {
        id: 'acc5',
        userId: 'user1',
        name: 'Credit Card',
        type: 'credit_card',
        currentBalance: -3500,
        creditLimit: 10000,
        interestRate: 0.18,
        typeInfo: { category: 'LIABILITIES.CREDIT', liquidityScore: 0, riskLevel: 2 }
      }
    ];
    
    // Mock the AccountDAO to return our test data
    const originalAccountDAO = require('../database/account-dao').AccountDAO;
    const mockAccountDAO = {
      getByUserId: async (userId) => mockAccounts,
      getAccountStatistics: async (userId) => ({
        byType: [],
        totals: { total_accounts: 5, total_assets: 140000, total_liabilities: 3500, net_worth: 136500 }
      })
    };
    
    // Temporarily replace AccountDAO
    require.cache[require.resolve('../database/account-dao')].exports.AccountDAO = mockAccountDAO;
    
    // Test workflow execution
    const result = await workflow.invoke({
      userId: 'test-user-123'
    });
    
    // Restore original AccountDAO
    require.cache[require.resolve('../database/account-dao')].exports.AccountDAO = originalAccountDAO;
    
    console.log('📈 Workflow execution completed!');
    console.log(`💰 Net Worth: $${result.accountPortfolio?.netWorth?.toLocaleString() || 'N/A'}`);
    console.log(`📊 Diversification Score: ${result.portfolioAnalysis?.diversificationScore || 'N/A'}%`);
    console.log(`💡 Opportunities Found: ${result.optimizationOpportunities?.length || 0}`);
    console.log(`🎯 Recommendations: ${result.actionableRecommendations?.length || 0}`);
    console.log(`🔍 Insights: ${result.crossAccountInsights?.length || 0}`);
    
    // Validate core components
    if (!result.accountPortfolio) throw new Error('Missing account portfolio');
    if (!result.portfolioAnalysis) throw new Error('Missing portfolio analysis');
    if (!result.optimizationOpportunities) throw new Error('Missing optimization opportunities');
    if (!result.actionableRecommendations) throw new Error('Missing recommendations');
    if (!result.crossAccountInsights) throw new Error('Missing insights');
    
    console.log('✅ All core components present\n');
    
    // Test 3: Performance Check
    console.log('⚡ Test 3: Performance check...');
    const startTime = Date.now();
    await workflow.invoke({ userId: 'test-user-123' });
    const executionTime = Date.now() - startTime;
    
    console.log(`⏱️ Execution time: ${executionTime}ms`);
    if (executionTime > 5000) {
      console.log('⚠️ Warning: Execution time exceeds 5 seconds');
    } else {
      console.log('✅ Performance acceptable\n');
    }
    
    console.log('🎉 ALL TESTS PASSED!');
    console.log('🚀 Multi-Account Intelligence workflow is functional!');
    
    return {
      success: true,
      executionTime,
      netWorth: result.accountPortfolio?.netWorth,
      diversificationScore: result.portfolioAnalysis?.diversificationScore,
      opportunityCount: result.optimizationOpportunities?.length,
      recommendationCount: result.actionableRecommendations?.length,
      insightCount: result.crossAccountInsights?.length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run test
if (require.main === module) {
  testMultiAccountIntelligence()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Multi-Account Intelligence workflow validation completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Multi-Account Intelligence workflow validation failed');
        process.exit(1);
      }
    });
}

module.exports = { testMultiAccountIntelligence };
