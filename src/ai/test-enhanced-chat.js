/**
 * Test Enhanced Chat Service Integration
 * Verifies workflow routing and execution
 */

const { enhancedChatService } = require('./enhanced-chat-service');

async function testEnhancedChatService() {
  console.log('🧪 Testing Enhanced Chat Service Integration...\n');
  
  try {
    // Test workflow routing
    console.log('1. Testing Query Routing:');
    const testQueries = [
      'How much will I have saved by December 2025?',
      'What if I get a 20% raise next year?',
      'What is my financial health score?',
      'How should I optimize my accounts?',
      'What are the market trends for my portfolio?',
      'Analyze my spending patterns'
    ];
    
    for (const query of testQueries) {
      const routing = enhancedChatService.routeQuery(query);
      console.log(`   Query: "${query}"`);
      console.log(`   → Routed to: ${routing.primaryWorkflow} (confidence: ${routing.confidence.toFixed(2)})`);
      console.log();
    }
    
    // Test health check
    console.log('2. Testing Health Check:');
    const health = await enhancedChatService.healthCheck();
    console.log('   Health Status:', health.status);
    console.log('   Session ID:', health.sessionId);
    console.log('   Conversation Length:', health.conversationLength);
    console.log();
    
    // Test conversation management
    console.log('3. Testing Conversation Management:');
    const summary = enhancedChatService.getConversationSummary();
    console.log('   Session ID:', summary.sessionId);
    console.log('   Message Count:', summary.messageCount);
    console.log('   Has Context:', summary.hasContext);
    console.log();
    
    // Test workflow name mapping
    console.log('4. Testing Workflow Display Names:');
    const workflows = ['intelligence', 'forecast', 'scenario', 'health', 'multiAccount', 'predictive'];
    workflows.forEach(workflow => {
      // Create a mock app instance for testing
      const mockApp = {
        getWorkflowDisplayName: (workflow) => {
          const workflowNames = {
            'intelligence': 'Financial Intelligence',
            'forecast': 'Financial Forecast',
            'scenario': 'Scenario Analysis',
            'health': 'Health Monitoring',
            'multiAccount': 'Multi-Account Intelligence',
            'predictive': 'Predictive Analytics'
          };
          return workflowNames[workflow] || 'General Intelligence';
        }
      };
      console.log(`   ${workflow} → ${mockApp.getWorkflowDisplayName(workflow)}`);
    });
    
    console.log('\n✅ Enhanced Chat Service Integration Tests Completed!');
    console.log('🚀 Ready to connect Chat tab to LangGraph workflows');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testEnhancedChatService().catch(console.error);
}

module.exports = { testEnhancedChatService }; 