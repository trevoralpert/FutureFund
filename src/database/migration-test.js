/**
 * Database Migration Test Script
 * Test and demonstrate V2 schema migration functionality
 */

const { dbManager } = require('./database');
const { MigrationManager } = require('./migration-v2');
const { AccountDAO } = require('./account-dao');
const { UserProfileDAO } = require('./user-profile-dao');

/**
 * Migration Test Suite
 */
class MigrationTestSuite {
  constructor() {
    this.testResults = [];
    this.errors = [];
    this.testUserId = null;
    this.testAccountId = null;
  }

  /**
   * Run complete migration test suite
   */
  async runTests() {
    console.log('🧪 Starting Migration Test Suite...\n');

    try {
      // Initialize database
      await this.initializeDatabase();

      // Run migration
      await this.testMigration();

      // Test new DAOs
      await this.testAccountDAO();
      await this.testUserProfileDAO();

      // Test multi-account functionality
      await this.testMultiAccountFeatures();

      // Print results
      this.printResults();

      return {
        success: this.errors.length === 0,
        testsRun: this.testResults.length,
        errors: this.errors
      };

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return {
        success: false,
        error: error.message,
        testsRun: this.testResults.length,
        errors: this.errors
      };
    }
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    const initResult = await this.test('Database Initialization', async () => {
      if (!dbManager.isInitialized) {
        await dbManager.initialize();
      }
      return 'Database connected successfully';
    });

    // Stop if initialization failed
    if (!initResult.success) {
      console.log('❌ Cannot continue tests without database connection');
      throw new Error('Database initialization failed - stopping test suite');
    }
  }

  /**
   * Test database migration
   */
  async testMigration() {
    const migrationResult = await this.test('V2 Schema Migration', async () => {
      const migration = new MigrationManager();
      const result = await migration.migrateToV2();
      
      if (!result.success) {
        throw new Error(`Migration failed: ${result.message}`);
      }

      return `Migration completed: ${result.summary?.transactionsMigrated || 0} transactions, ${result.summary?.scenariosMigrated || 0} scenarios`;
    });

    // Stop if migration failed
    if (!migrationResult.success) {
      console.log('❌ Cannot continue tests without successful migration');
      throw new Error('Migration failed - stopping test suite');
    }
  }

  /**
   * Test Account DAO functionality
   */
  async testAccountDAO() {
    await this.test('AccountDAO - Get Account Types', async () => {
      const accountTypes = AccountDAO.getAccountTypes();
      const typeCount = Object.keys(accountTypes).length;
      
      if (typeCount < 10) {
        throw new Error(`Expected at least 10 account types, got ${typeCount}`);
      }

      return `${typeCount} account types available`;
    });

    const userProfileResult = await this.test('AccountDAO - Create Test User Profile', async () => {
      const testUser = {
        first_name: 'Test',
        last_name: 'User',
        employment_status: 'employed',
        annual_income: 75000,
        risk_category: 'moderate'
      };

      const profile = await UserProfileDAO.create(testUser);
      this.testUserId = profile.id;
      
      return `Created test user: ${profile.fullName} (${this.testUserId})`;
    });

    // Stop if user profile creation failed
    if (!userProfileResult.success) {
      console.log('❌ Cannot continue AccountDAO tests without user profile');
      return;
    }

    await this.test('AccountDAO - Create Checking Account', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const checkingAccount = {
        user_profile_id: this.testUserId,
        account_name: 'Test Checking',
        account_type: 'checking',
        institution_name: 'Test Bank',
        current_balance: 5000,
        is_primary: true
      };

      const account = await AccountDAO.create(checkingAccount);
      this.testAccountId = account.id;
      
      return `Created checking account: ${account.name} with balance $${account.currentBalance}`;
    });

    await this.test('AccountDAO - Create Savings Account', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const savingsAccount = {
        user_profile_id: this.testUserId,
        account_name: 'Test Savings',
        account_type: 'savings',
        institution_name: 'Test Bank',
        current_balance: 15000
      };

      const account = await AccountDAO.create(savingsAccount);
      
      return `Created savings account: ${account.name} with balance $${account.currentBalance}`;
    });

    await this.test('AccountDAO - Create Credit Card', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const creditCard = {
        user_profile_id: this.testUserId,
        account_name: 'Test Credit Card',
        account_type: 'credit_card',
        institution_name: 'Test Bank',
        current_balance: -1500,
        credit_limit: 10000
      };

      const account = await AccountDAO.create(creditCard);
      
      return `Created credit card: ${account.name} with balance $${account.currentBalance}, limit $${account.creditLimit}`;
    });

    await this.test('AccountDAO - Get Accounts by User', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const accounts = await AccountDAO.getByUserId(this.testUserId);
      
      if (accounts.length !== 3) {
        throw new Error(`Expected 3 accounts, got ${accounts.length}`);
      }

      return `Retrieved ${accounts.length} accounts for user`;
    });

    await this.test('AccountDAO - Account Statistics', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const stats = await AccountDAO.getAccountStatistics(this.testUserId);
      
      const expectedNetWorth = 5000 + 15000 - 1500; // 18500
      if (Math.abs(stats.totals.net_worth - expectedNetWorth) > 0.01) {
        throw new Error(`Expected net worth $${expectedNetWorth}, got $${stats.totals.net_worth}`);
      }

      return `Net worth: $${stats.totals.net_worth}, Assets: $${stats.totals.total_assets}, Liabilities: $${stats.totals.total_liabilities}`;
    });

    await this.test('AccountDAO - Payment Sequence', async () => {
      if (!this.testUserId) {
        throw new Error('Test user ID not available');
      }

      const paymentSequence = await AccountDAO.getPaymentSequence(this.testUserId, 2000);
      
      if (paymentSequence.length === 0) {
        throw new Error('Expected payment sequence options, got none');
      }

      return `Payment sequence: ${paymentSequence.map(p => p.accountName).join(', ')}`;
    });

    await this.test('AccountDAO - Set Primary Account', async () => {
      if (!this.testUserId || !this.testAccountId) {
        throw new Error('Test user ID or account ID not available');
      }

      const updatedAccount = await AccountDAO.setPrimary(this.testAccountId, this.testUserId);
      
      if (!updatedAccount.isPrimary) {
        throw new Error('Account should be set as primary');
      }

      return 'Successfully set account as primary';
    });
  }

  /**
   * Test User Profile DAO functionality
   */
  async testUserProfileDAO() {
    this.test('UserProfileDAO - Get by ID', async () => {
      // Use the test user created in AccountDAO tests
      const accounts = await AccountDAO.getByUserId('test-user-id');
      let testUserId;
      
      if (accounts.length > 0) {
        testUserId = accounts[0].userId;
      } else {
        // Create a new test user
        const profile = await UserProfileDAO.create({
          first_name: 'Profile',
          last_name: 'Test',
          employment_status: 'employed'
        });
        testUserId = profile.id;
      }

      const profile = await UserProfileDAO.getById(testUserId);
      
      if (!profile) {
        throw new Error('User profile not found');
      }

      return `Retrieved profile: ${profile.fullName}`;
    });

    this.test('UserProfileDAO - Update Profile', async () => {
      // Get first available user
      const accounts = await AccountDAO.getByUserId('test-user-id');
      if (accounts.length === 0) {
        throw new Error('No test user available');
      }

      const testUserId = accounts[0].userId;
      const updates = {
        annual_income: 85000,
        risk_category: 'aggressive'
      };

      const updatedProfile = await UserProfileDAO.update(testUserId, updates);
      
      if (updatedProfile.annualIncome !== 85000) {
        throw new Error('Profile update failed');
      }

      return `Updated profile: income $${updatedProfile.annualIncome}, risk ${updatedProfile.riskCategory}`;
    });
  }

  /**
   * Test multi-account features
   */
  async testMultiAccountFeatures() {
    this.test('Multi-Account - Account Categories', async () => {
      // Get accounts by category
      const accounts = await AccountDAO.getByUserId('test-user-id');
      if (accounts.length === 0) {
        throw new Error('No test accounts available');
      }

      const testUserId = accounts[0].userId;
      const liquidAccounts = await AccountDAO.getByCategory(testUserId, 'ASSETS.LIQUID');
      
      return `Found ${liquidAccounts.length} liquid asset accounts`;
    });

    this.test('Multi-Account - Account Type Validation', async () => {
      const accounts = await AccountDAO.getByUserId('test-user-id');
      if (accounts.length === 0) {
        throw new Error('No test accounts available');
      }

      const testUserId = accounts[0].userId;
      
      // Try to create account with invalid type
      try {
        await AccountDAO.create({
          user_profile_id: testUserId,
          account_name: 'Invalid Account',
          account_type: 'invalid_type',
          current_balance: 1000
        });
        throw new Error('Should have failed with invalid account type');
      } catch (error) {
        if (!error.message.includes('Invalid account type')) {
          throw error;
        }
      }

      return 'Account type validation working correctly';
    });
  }

  /**
   * Test helper function
   */
  async test(testName, testFunction) {
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;

      this.testResults.push({
        name: testName,
        status: 'PASS',
        result,
        duration
      });

      console.log(`✅ ${testName}: ${result} (${duration}ms)`);
      return { success: true, result };
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        duration: 0
      });

      this.errors.push({
        test: testName,
        error: error.message
      });

      console.log(`❌ ${testName}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));

    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);

    console.log(`Tests Run: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

    if (this.errors.length > 0) {
      console.log('\n❌ Failures:');
      this.errors.forEach(error => {
        console.log(`  • ${error.test}: ${error.error}`);
      });
    }

    console.log('\n' + '='.repeat(50));
  }

  /**
   * Cleanup test data
   */
  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Note: In a real scenario, you might want to clean up test data
      // For now, we'll leave it for inspection
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

/**
 * Run migration test if called directly
 */
if (require.main === module) {
  (async () => {
    const testSuite = new MigrationTestSuite();
    
    try {
      const results = await testSuite.runTests();
      
      if (results.success) {
        console.log('\n🎉 All tests passed! Migration is ready for production.');
        process.exit(0);
      } else {
        console.log('\n🚨 Some tests failed. Review errors before proceeding.');
        process.exit(1);
      }
    } catch (error) {
      console.error('\n💥 Test suite crashed:', error);
      process.exit(1);
    } finally {
      await testSuite.cleanup();
    }
  })();
}

module.exports = { MigrationTestSuite }; 