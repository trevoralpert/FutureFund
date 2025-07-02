/**
 * Test Suite for Multi-Account Intelligence Workflows - Phase 3.7.1
 * Validates portfolio analysis, optimization opportunities, and cross-account recommendations
 */

const { createMultiAccountIntelligenceWorkflow } = require('./multi-account-intelligence');
const { AccountDAO } = require('../database/account-dao');

class MultiAccountIntelligenceTestSuite {
  constructor() {
    this.testResults = [];
    this.workflow = null;
    this.testUserId = null;
    this.testAccounts = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Multi-Account Intelligence Test Suite...\n');
    
    try {
      await this.initializeWorkflow();
      await this.setupTestData();
      await this.testWorkflowCreation();
      await this.testPortfolioAggregation();
      await this.testCompleteWorkflow();
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.push({
        test: 'Test Suite Execution',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await this.cleanup();
    }
  }

  async initializeWorkflow() {
    console.log('🔧 Initializing Multi-Account Intelligence workflow...');
    
    try {
      this.workflow = createMultiAccountIntelligenceWorkflow();
      
      this.testResults.push({
        test: 'Workflow Initialization',
        status: 'PASSED',
        message: 'Multi-Account Intelligence workflow created successfully',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Workflow initialized\n');
      
    } catch (error) {
      console.error('❌ Workflow initialization failed:', error);
      this.testResults.push({
        test: 'Workflow Initialization',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async setupTestData() {
    console.log('📊 Setting up test data...');
    
    try {
      this.testUserId = `test-user-${Date.now()}`;
      this.testAccounts = await this.createTestAccounts();
      
      console.log(`✅ Created ${this.testAccounts.length} test accounts\n`);
      
    } catch (error) {
      console.error('❌ Test data setup failed:', error);
      throw error;
    }
  }

  async createTestAccounts() {
    const accounts = [];
    
    // Create diverse portfolio
    accounts.push(await AccountDAO.create({
      user_profile_id: this.testUserId,
      account_name: 'Primary Checking',
      account_type: 'checking',
      current_balance: 5000,
      is_primary: true
    }));

    accounts.push(await AccountDAO.create({
      user_profile_id: this.testUserId,
      account_name: 'Savings Account',
      account_type: 'savings',
      current_balance: 15000,
      interest_rate: 0.02
    }));

    accounts.push(await AccountDAO.create({
      user_profile_id: this.testUserId,
      account_name: '401k',
      account_type: '401k',
      current_balance: 75000,
      tax_advantaged: true
    }));

    accounts.push(await AccountDAO.create({
      user_profile_id: this.testUserId,
      account_name: 'Investment',
      account_type: 'investment',
      current_balance: 45000
    }));

    accounts.push(await AccountDAO.create({
      user_profile_id: this.testUserId,
      account_name: 'Credit Card',
      account_type: 'credit_card',
      current_balance: -3500,
      credit_limit: 10000,
      interest_rate: 0.18
    }));

    return accounts;
  }

  async testWorkflowCreation() {
    console.log('🏗️ Testing workflow creation...');
    
    try {
      if (!this.workflow) {
        throw new Error('Workflow not initialized');
      }

      this.testResults.push({
        test: 'Workflow Creation',
        status: 'PASSED',
        message: 'Workflow created successfully',
        timestamp: new Date().toISOString()
      });

      console.log('✅ Workflow creation test passed\n');
      
    } catch (error) {
      console.error('❌ Workflow creation test failed:', error);
      this.testResults.push({
        test: 'Workflow Creation',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testPortfolioAggregation() {
    console.log('📊 Testing portfolio aggregation...');
    
    try {
      const result = await this.workflow.invoke({
        userId: this.testUserId
      });

      const portfolio = result.accountPortfolio;
      if (!portfolio) {
        throw new Error('No account portfolio generated');
      }

      if (!portfolio.accounts || portfolio.accounts.length === 0) {
        throw new Error('No accounts in portfolio');
      }

      if (typeof portfolio.netWorth !== 'number') {
        throw new Error('Net worth not calculated');
      }

      this.testResults.push({
        test: 'Portfolio Aggregation',
        status: 'PASSED',
        message: `Portfolio aggregated: $${portfolio.netWorth.toLocaleString()} net worth, ${portfolio.accounts.length} accounts`,
        details: {
          netWorth: portfolio.netWorth,
          accountCount: portfolio.accounts.length
        },
        timestamp: new Date().toISOString()
      });

      console.log('✅ Portfolio aggregation test passed\n');
      
    } catch (error) {
      console.error('❌ Portfolio aggregation test failed:', error);
      this.testResults.push({
        test: 'Portfolio Aggregation',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testCompleteWorkflow() {
    console.log('🔄 Testing complete workflow execution...');
    
    try {
      const startTime = Date.now();
      
      const result = await this.workflow.invoke({
        userId: this.testUserId
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      if (!result.accountPortfolio) {
        throw new Error('Account portfolio missing');
      }

      if (!result.portfolioAnalysis) {
        throw new Error('Portfolio analysis missing');
      }

      if (!result.optimizationOpportunities) {
        throw new Error('Optimization opportunities missing');
      }

      if (!result.actionableRecommendations) {
        throw new Error('Recommendations missing');
      }

      this.testResults.push({
        test: 'Complete Workflow',
        status: 'PASSED',
        message: `Workflow executed successfully in ${executionTime}ms`,
        details: {
          executionTime: executionTime,
          recommendationCount: result.actionableRecommendations.length,
          opportunityCount: result.optimizationOpportunities.length
        },
        timestamp: new Date().toISOString()
      });

      console.log('✅ Complete workflow test passed\n');
      
    } catch (error) {
      console.error('❌ Complete workflow test failed:', error);
      this.testResults.push({
        test: 'Complete Workflow',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      if (this.testUserId) {
        for (const account of this.testAccounts) {
          try {
            await AccountDAO.delete(account.id);
          } catch (error) {
            console.warn(`⚠️ Could not delete account ${account.id}:`, error.message);
          }
        }
      }

      console.log('✅ Cleanup completed\n');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  displayResults() {
    console.log('📊 MULTI-ACCOUNT INTELLIGENCE TEST RESULTS');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(`\n📈 SUMMARY: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
    
    if (failed > 0) {
      console.log(`❌ ${failed} tests failed\n`);
    } else {
      console.log(`✅ All tests passed!\n`);
    }

    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   📋 Details:`, result.details);
      }
      
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Phase 3.7.1 Multi-Account Intelligence Testing Complete');
    
    if (failed === 0) {
      console.log('🚀 Multi-Account Intelligence workflow is ready for production!');
    } else {
      console.log('⚠️ Some tests failed - review and fix issues before deployment');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new MultiAccountIntelligenceTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n🏁 Test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { MultiAccountIntelligenceTestSuite };
