/**
 * Test script for Enhanced Chat Service
 */

const { chatService } = require('./chat-service');

async function testChatService() {
    console.log('🧪 Testing Enhanced Chat Service...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health check...');
        const health = await chatService.healthCheck();
        console.log('Health:', health);
        console.log('✅ Health check passed\n');

        // Test 2: Financial Context
        console.log('2. Testing financial context injection...');
        const mockContext = {
            hasData: true,
            currentBalance: 5000,
            monthlyNetIncome: 1200,
            totalTransactions: 50,
            totalIncome: 15000,
            totalExpenses: 12000,
            recentTransactions: [
                {
                    date: '2024-12-01',
                    description: 'Salary',
                    amount: 3000,
                    category: 'Income'
                },
                {
                    date: '2024-12-02',
                    description: 'Rent',
                    amount: -1200,
                    category: 'Housing'
                }
            ],
            dateRange: {
                start: '2024-01-01',
                end: '2024-12-15'
            }
        };

        // Test 3: Send Messages
        console.log('3. Testing enhanced chat messages...');
        
        const testMessages = [
            "What's my current balance?",
            "How much will I have saved by next year?",
            "What happens if I get a 20% raise?",
            "Can I afford a $500 monthly car payment?",
            "What are my largest expenses?"
        ];

        for (const message of testMessages) {
            console.log(`\n📤 User: ${message}`);
            const response = await chatService.sendMessage(message, mockContext);
            
            if (response.success) {
                console.log(`🤖 AI: ${response.response.substring(0, 100)}...`);
                console.log(`📊 Parsed Query:`, {
                    intent: response.parsedQuery.intent,
                    amounts: response.parsedQuery.amounts,
                    categories: response.parsedQuery.categories,
                    confidence: response.confidence
                });
            } else {
                console.log(`❌ Error: ${response.error}`);
            }
        }

        // Test 4: Conversation Management
        console.log('\n4. Testing conversation management...');
        const summary = chatService.getConversationSummary();
        console.log('Conversation Summary:', summary);

        // Clear conversation
        chatService.clearConversation();
        console.log('✅ Conversation cleared');

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testChatService();
}

module.exports = { testChatService }; 