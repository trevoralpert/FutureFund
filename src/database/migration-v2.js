/**
 * FutureFund Database Migration V1 → V2
 * Comprehensive Multi-Account Schema Migration
 * 
 * This migration preserves all existing data while upgrading to the new
 * multi-account structure with professional financial planning support.
 */

const { dbManager } = require('./database');
const { SCHEMA_V2, INDEXES_V2 } = require('./schema-v2');
const { v4: uuidv4 } = require('uuid');

/**
 * Database Migration Manager
 */
class MigrationManager {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
  }

  /**
   * Execute complete migration from V1 to V2
   */
  async migrateToV2() {
    console.log('🚀 Starting database migration to V2 schema...');
    
    try {
      // Check if migration already completed
      const migrationStatus = await this.checkMigrationStatus();
      if (migrationStatus.isComplete) {
        console.log('✅ Database already migrated to V2');
        return { success: true, message: 'Already migrated' };
      }

      // Begin transaction for safe migration
      await dbManager.beginTransaction();

      // Step 1: Backup existing data
      const backupData = await this.backupExistingData();
      this.log('Backed up existing data', { 
        transactions: backupData.transactions?.length || 0,
        scenarios: backupData.scenarios?.length || 0 
      });

      // Step 2: Create new V2 schema
      await this.createV2Schema();
      this.log('Created V2 schema tables');

      // Step 3: Create default user profile
      const defaultUser = await this.createDefaultUserProfile();
      this.log('Created default user profile', { userId: defaultUser.id });

      // Step 4: Create default checking account
      const defaultAccount = await this.createDefaultAccount(defaultUser.id);
      this.log('Created default checking account', { accountId: defaultAccount.id });

      // Step 5: Migrate existing transactions
      const migratedTransactions = await this.migrateTransactions(defaultAccount.id, backupData.transactions);
      this.log('Migrated transactions', { count: migratedTransactions.length });

      // Step 6: Migrate existing scenarios
      const migratedScenarios = await this.migrateScenarios(defaultUser.id, backupData.scenarios);
      this.log('Migrated scenarios', { count: migratedScenarios.length });

      // Step 7: Create performance indexes
      await this.createIndexes();
      this.log('Created performance indexes');

      // Step 8: Mark migration as complete
      await this.markMigrationComplete();
      this.log('Migration completed successfully');

      // Commit transaction
      await dbManager.commitTransaction();

      console.log('✅ Database migration to V2 completed successfully');
      console.log(`📊 Migration Summary:
        - Transactions migrated: ${migratedTransactions.length}
        - Scenarios migrated: ${migratedScenarios.length}
        - New default user: ${defaultUser.id}
        - New default account: ${defaultAccount.id}`);

      return { 
        success: true, 
        message: 'Migration completed',
        summary: {
          transactionsMigrated: migratedTransactions.length,
          scenariosMigrated: migratedScenarios.length,
          defaultUserId: defaultUser.id,
          defaultAccountId: defaultAccount.id
        }
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      await dbManager.rollbackTransaction();
      this.errors.push(error.message);
      
      return { 
        success: false, 
        message: `Migration failed: ${error.message}`,
        errors: this.errors,
        log: this.migrationLog
      };
    }
  }

  /**
   * Check if migration has already been completed
   */
  async checkMigrationStatus() {
    try {
      // Check if V2 tables exist
      const tablesQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('user_profiles', 'accounts', 'transactions_v2', 'scenarios_v2')
      `;
      const tables = await dbManager.selectQuery(tablesQuery);
      
      // Check if migration metadata exists
      const migrationQuery = `
        SELECT value FROM user_preferences 
        WHERE key = 'schema_version' AND value = 'v2'
      `;
      const migrationRecord = await dbManager.selectOneQuery(migrationQuery);

      return {
        isComplete: tables.length >= 4 && migrationRecord !== null,
        existingTables: tables.map(t => t.name)
      };
    } catch (error) {
      console.warn('Could not check migration status:', error.message);
      return { isComplete: false, existingTables: [] };
    }
  }

  /**
   * Backup existing data before migration
   */
  async backupExistingData() {
    console.log('📦 Backing up existing data...');
    
    const backup = {
      transactions: [],
      scenarios: [],
      preferences: [],
      categories: []
    };

    try {
      // Backup transactions
      backup.transactions = await dbManager.selectQuery('SELECT * FROM transactions ORDER BY date');
      
      // Backup scenarios
      backup.scenarios = await dbManager.selectQuery('SELECT * FROM scenarios ORDER BY created_at');
      
      // Backup user preferences
      backup.preferences = await dbManager.selectQuery('SELECT * FROM user_preferences');
      
      // Backup categories
      backup.categories = await dbManager.selectQuery('SELECT * FROM categories');

      console.log(`📦 Backup complete: ${backup.transactions.length} transactions, ${backup.scenarios.length} scenarios`);
      return backup;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Create V2 schema tables
   */
  async createV2Schema() {
    console.log('🏗️ Creating V2 schema...');
    
    for (const [tableName, schemaSql] of Object.entries(SCHEMA_V2)) {
      try {
        await dbManager.executeQuery(schemaSql);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to create table ${tableName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Create default user profile for existing data
   */
  async createDefaultUserProfile() {
    const userId = uuidv4();
    const userProfile = {
      id: userId,
      first_name: 'FutureFund',
      last_name: 'User',
      nickname: 'Default User',
      employment_status: 'employed',
      annual_income: 75000,
      risk_category: 'moderate',
      primary_currency: 'USD',
      onboarding_completed: false,
      ai_recommendations_enabled: true
    };

    const sql = `
      INSERT INTO user_profiles (
        id, first_name, last_name, nickname, employment_status, 
        annual_income, risk_category, primary_currency, 
        onboarding_completed, ai_recommendations_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userProfile.id,
      userProfile.first_name,
      userProfile.last_name,
      userProfile.nickname,
      userProfile.employment_status,
      userProfile.annual_income,
      userProfile.risk_category,
      userProfile.primary_currency,
      userProfile.onboarding_completed ? 1 : 0,
      userProfile.ai_recommendations_enabled ? 1 : 0
    ];

    await dbManager.executeQuery(sql, params);
    console.log(`✅ Created default user profile: ${userId}`);
    
    return userProfile;
  }

  /**
   * Create default checking account for migrated transactions
   */
  async createDefaultAccount(userId) {
    const accountId = uuidv4();
    const account = {
      id: accountId,
      user_profile_id: userId,
      account_name: 'Primary Checking',
      account_type: 'checking',
      institution_name: 'Local Bank',
      current_balance: 0, // Will be calculated from transactions
      is_active: true,
      is_primary: true,
      include_in_forecasting: true,
      scenario_priority: 1
    };

    const sql = `
      INSERT INTO accounts (
        id, user_profile_id, account_name, account_type, institution_name,
        current_balance, is_active, is_primary, include_in_forecasting, scenario_priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      account.id,
      account.user_profile_id,
      account.account_name,
      account.account_type,
      account.institution_name,
      account.current_balance,
      account.is_active ? 1 : 0,
      account.is_primary ? 1 : 0,
      account.include_in_forecasting ? 1 : 0,
      account.scenario_priority
    ];

    await dbManager.executeQuery(sql, params);
    console.log(`✅ Created default checking account: ${accountId}`);
    
    return account;
  }

  /**
   * Migrate existing transactions to new schema
   */
  async migrateTransactions(defaultAccountId, transactions) {
    console.log(`🔄 Migrating ${transactions.length} transactions...`);
    
    const migratedTransactions = [];
    let runningBalance = 0;

    for (const transaction of transactions) {
      try {
        // Convert old transaction format to new format
        const newTransaction = {
          id: transaction.id,
          account_id: defaultAccountId,
          transaction_date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          transaction_type: transaction.type.toLowerCase(), // 'Income' → 'income'
          is_recurring: transaction.is_recurring || false,
          is_projected: transaction.is_projected || false,
          confidence_score: transaction.is_projected ? 0.8 : 1.0,
          scenario_influenced: false,
          influencing_scenarios: JSON.stringify([]),
          notes: `Migrated from V1 - Original balance: ${transaction.balance || 'N/A'}`
        };

        // Calculate running balance
        runningBalance += transaction.amount;

        const sql = `
          INSERT INTO transactions_v2 (
            id, account_id, transaction_date, description, amount, category,
            transaction_type, is_recurring, is_projected, confidence_score,
            scenario_influenced, influencing_scenarios, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          newTransaction.id,
          newTransaction.account_id,
          newTransaction.transaction_date,
          newTransaction.description,
          newTransaction.amount,
          newTransaction.category,
          newTransaction.transaction_type,
          newTransaction.is_recurring ? 1 : 0,
          newTransaction.is_projected ? 1 : 0,
          newTransaction.confidence_score,
          newTransaction.scenario_influenced ? 1 : 0,
          newTransaction.influencing_scenarios,
          newTransaction.notes
        ];

        await dbManager.executeQuery(sql, params);
        migratedTransactions.push(newTransaction);

      } catch (error) {
        console.error(`❌ Failed to migrate transaction ${transaction.id}:`, error);
        this.errors.push(`Transaction migration failed: ${transaction.id} - ${error.message}`);
      }
    }

    // Update account balance with final running balance
    await dbManager.executeQuery(
      'UPDATE accounts SET current_balance = ? WHERE id = ?',
      [runningBalance, defaultAccountId]
    );

    console.log(`✅ Migrated ${migratedTransactions.length} transactions`);
    return migratedTransactions;
  }

  /**
   * Migrate existing scenarios to new schema
   */
  async migrateScenarios(defaultUserId, scenarios) {
    console.log(`🔄 Migrating ${scenarios.length} scenarios...`);
    
    const migratedScenarios = [];

    for (const scenario of scenarios) {
      try {
        // Convert old scenario format to new format
        const newScenario = {
          id: scenario.id,
          user_profile_id: defaultUserId,
          name: scenario.name,
          description: scenario.description,
          scenario_type: scenario.type,
          is_active: scenario.is_active || false,
          priority_weight: 1.0,
          parameters: scenario.parameters, // Should already be JSON string
          feasibility_score: 75, // Default reasonable score
          risk_assessment: JSON.stringify({
            migrated: true,
            originalData: {
              type: scenario.type,
              created_at: scenario.created_at
            }
          })
        };

        const sql = `
          INSERT INTO scenarios_v2 (
            id, user_profile_id, name, description, scenario_type,
            is_active, priority_weight, parameters, feasibility_score, risk_assessment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          newScenario.id,
          newScenario.user_profile_id,
          newScenario.name,
          newScenario.description,
          newScenario.scenario_type,
          newScenario.is_active ? 1 : 0,
          newScenario.priority_weight,
          newScenario.parameters,
          newScenario.feasibility_score,
          newScenario.risk_assessment
        ];

        await dbManager.executeQuery(sql, params);
        migratedScenarios.push(newScenario);

      } catch (error) {
        console.error(`❌ Failed to migrate scenario ${scenario.id}:`, error);
        this.errors.push(`Scenario migration failed: ${scenario.id} - ${error.message}`);
      }
    }

    console.log(`✅ Migrated ${migratedScenarios.length} scenarios`);
    return migratedScenarios;
  }

  /**
   * Create performance indexes
   */
  async createIndexes() {
    console.log('📈 Creating performance indexes...');
    
    for (const indexSql of INDEXES_V2) {
      try {
        await dbManager.executeQuery(indexSql);
      } catch (error) {
        console.warn('Index creation warning:', error.message);
      }
    }
    
    console.log('✅ Performance indexes created');
  }

  /**
   * Mark migration as complete
   */
  async markMigrationComplete() {
    const sql = `
      INSERT OR REPLACE INTO user_preferences (key, value, type) 
      VALUES ('schema_version', 'v2', 'string')
    `;
    
    await dbManager.executeQuery(sql);
    
    const migrationTimeSql = `
      INSERT OR REPLACE INTO user_preferences (key, value, type)
      VALUES ('migration_v2_completed_at', ?, 'string')
    `;
    
    await dbManager.executeQuery(migrationTimeSql, [new Date().toISOString()]);
  }

  /**
   * Add entry to migration log
   */
  log(message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data
    };
    
    this.migrationLog.push(logEntry);
    console.log(`📝 ${message}`, data ? JSON.stringify(data) : '');
  }

  /**
   * Rollback migration (for testing/development)
   */
  async rollbackMigration() {
    console.log('🔄 Rolling back V2 migration...');
    
    try {
      await dbManager.beginTransaction();

      // Drop V2 tables
      const v2Tables = ['user_profiles', 'accounts', 'transactions_v2', 'scenarios_v2', 
                       'scenario_effects', 'ai_predictions', 'account_balances'];
      
      for (const table of v2Tables) {
        await dbManager.executeQuery(`DROP TABLE IF EXISTS ${table}`);
      }

      // Remove migration markers
      await dbManager.executeQuery(`DELETE FROM user_preferences WHERE key LIKE 'migration_v2%' OR key = 'schema_version'`);

      await dbManager.commitTransaction();
      console.log('✅ Migration rollback completed');
      
      return { success: true, message: 'Rollback completed' };
    } catch (error) {
      await dbManager.rollbackTransaction();
      console.error('❌ Rollback failed:', error);
      return { success: false, message: `Rollback failed: ${error.message}` };
    }
  }
}

module.exports = { MigrationManager }; 