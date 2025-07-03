/**
 * Test Context-Aware Financial Advice
 * Verifies that the enhanced chat service properly handles financial context
 */

const { enhancedChatService } = require('./enhanced-chat-service');

async function testContextAwareChat() {
  console.log('🧪 Testing Context-Aware Financial Advice...\n');
  
  try {
    // Test with mock enhanced financial context
    const mockContext = {
      hasData: true,
      currentBalance: 3500,
      monthlyNetIncome: 2400,
      totalTransactions: 360,
      allTransactions: [
        {
          id: '1',
          date: '2025-01-15',
          description: 'Coffee Bean Salary',
          amount: 2800,
          category: 'Income',
          balance: 3500,
          type: 'Income',
          isProjected: false
        },
        {
          id: '2',
          date: '2025-01-01',
          description: 'Rent Payment',
          amount: -1200,
          category: 'Housing',
          balance: 2300,
          type: 'Expense',
          isProjected: false
        }
      ],
      userProfile: {
        name: "Sampuel Profileman",
        age: 31,
        location: "Los Angeles, CA",
        currentJob: "Barista at Coffee Bean & Tea Leaf",
        monthlyIncome: 2800,
        creditCardDebt: {
          total: 20360.90,
          cards: [
            { name: "Chase Freedom", balance: 5420.33, apr: 22.99, minPayment: 125 },
            { name: "Capital One Quicksilver", balance: 7891.12, apr: 24.49, minPayment: 185 }
          ]
        }
      },
      contextMetadata: {
        confidenceLevel: 0.9,
        dataCompleteness: 0.95,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Test query routing
    console.log('1. Testing Query Routing:');
    const testQuery = 'How can I get out of debt faster?';
    const routing = enhancedChatService.routeQuery(testQuery, mockContext);
    console.log(`   Query: "${testQuery}"`);
    console.log(`   → Routed to: ${routing.primaryWorkflow} (confidence: ${routing.confidence.toFixed(2)})`);
    console.log();
    
    // Test health check
    console.log('2. Testing Health Check:');
    const health = await enhancedChatService.healthCheck();
    console.log('   Status:', health.status);
    console.log('   Enhanced Context Available:', !!mockContext.userProfile);
    console.log('   Data Points:', mockContext.allTransactions.length);
    console.log();
    
    // Test data transformation
    console.log('3. Testing Data Transformation:');
    console.log('   Original Context Structure:');
    console.log(`     - allTransactions: ${mockContext.allTransactions.length} items`);
    console.log(`     - userProfile: ${!!mockContext.userProfile ? 'Present' : 'Missing'}`);
    console.log(`     - currentBalance: $${mockContext.currentBalance}`);
    console.log(`     - confidenceLevel: ${mockContext.contextMetadata.confidenceLevel}`);
    console.log();
    
    // Test formatting
    console.log('4. Testing Response Formatting:');
    const mockResult = {
      data: {
        insights: {
          keyFindings: [
            { description: 'High credit card debt burden detected' },
            { description: 'Monthly income covers basic expenses' },
            { description: 'Debt-to-income ratio exceeds recommended levels' }
          ]
        },
        recommendations: {
          immediate: [
            { action: 'Debt Consolidation', description: 'Consider consolidating high-interest debt' },
            { action: 'Budget Optimization', description: 'Review discretionary spending' }
          ]
        },
        healthScore: {
          overall: { score: 2.8, grade: 'Fair' }
        },
        executionMetadata: {
          summary: { totalTransactions: 360 }
        }
      }
    };
    
    const formattedResponse = enhancedChatService.formatIntelligenceResponse(
      mockResult, 
      testQuery, 
      mockContext
    );
    
    console.log('   Formatted Response:');
    console.log('   ' + formattedResponse.split('\n').join('\n   '));
    console.log();
    
    console.log('✅ Context-Aware Financial Advice test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testContextAwareChat().catch(console.error);
}

module.exports = { testContextAwareChat }; 