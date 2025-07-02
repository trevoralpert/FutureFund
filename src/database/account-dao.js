/**
 * Account Data Access Object
 * Comprehensive multi-account management with professional financial planning support
 */

const { dbManager } = require('./database');
const { ACCOUNT_TYPES } = require('./schema-v2');
const { v4: uuidv4 } = require('uuid');

/**
 * Account validation schema
 */
function validateAccount(account) {
  const errors = [];

  if (!account.id || typeof account.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (!account.user_profile_id || typeof account.user_profile_id !== 'string') {
    errors.push('User profile ID is required and must be a string');
  }

  if (!account.account_name || typeof account.account_name !== 'string') {
    errors.push('Account name is required and must be a string');
  }

  if (!account.account_type || typeof account.account_type !== 'string') {
    errors.push('Account type is required and must be a string');
  }

  // Validate account type exists in our system
  if (account.account_type && !ACCOUNT_TYPES[account.account_type]) {
    errors.push(`Invalid account type: ${account.account_type}. Must be one of: ${Object.keys(ACCOUNT_TYPES).join(', ')}`);
  }

  if (account.current_balance !== undefined && typeof account.current_balance !== 'number') {
    errors.push('Current balance must be a number');
  }

  if (account.credit_limit !== undefined && account.credit_limit !== null && typeof account.credit_limit !== 'number') {
    errors.push('Credit limit must be a number or null');
  }

  if (account.interest_rate !== undefined && account.interest_rate !== null && typeof account.interest_rate !== 'number') {
    errors.push('Interest rate must be a number or null');
  }

  return errors;
}

/**
 * Account Data Access Object
 */
class AccountDAO {
  
  /**
   * Create a new account
   */
  static async create(account) {
    try {
      // Generate ID if not provided
      if (!account.id) {
        account.id = uuidv4();
      }

      // Validate account data
      const errors = validateAccount(account);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Get account type definition for defaults
      const accountTypeInfo = ACCOUNT_TYPES[account.account_type];
      
      const sql = `
        INSERT INTO accounts (
          id, user_profile_id, account_name, account_type, institution_name, account_number_last4,
          current_balance, available_balance, credit_limit, interest_rate,
          is_active, is_primary, owner_type, tax_advantaged,
          include_in_forecasting, scenario_priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        account.id,
        account.user_profile_id,
        account.account_name,
        account.account_type,
        account.institution_name || null,
        account.account_number_last4 || null,
        account.current_balance || 0,
        account.available_balance || account.current_balance || 0,
        account.credit_limit || null,
        account.interest_rate || accountTypeInfo?.typicalAPY || accountTypeInfo?.typicalAPR || null,
        account.is_active !== undefined ? (account.is_active ? 1 : 0) : 1,
        account.is_primary !== undefined ? (account.is_primary ? 1 : 0) : 0,
        account.owner_type || 'individual',
        account.tax_advantaged !== undefined ? (account.tax_advantaged ? 1 : 0) : (accountTypeInfo?.taxAdvantaged ? 1 : 0),
        account.include_in_forecasting !== undefined ? (account.include_in_forecasting ? 1 : 0) : 1,
        account.scenario_priority || 1
      ];

      const result = await dbManager.executeQuery(sql, params);
      
      console.log(`✅ Created account: ${account.account_name} (${account.account_type})`);
      
      // Return the complete created account
      return await this.getById(account.id);
    } catch (error) {
      console.error('❌ Error creating account:', error);
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM accounts WHERE id = ?';
      const account = await dbManager.selectOneQuery(sql, [id]);
      
      if (account) {
        return this.formatAccount(account);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting account by ID:', error);
      throw error;
    }
  }

  /**
   * Get all accounts for a user with optional filtering
   */
  static async getByUserId(userId, options = {}) {
    try {
      let sql = 'SELECT * FROM accounts WHERE user_profile_id = ?';
      const params = [userId];
      const conditions = [];

      // Add filters
      if (options.account_type) {
        conditions.push('account_type = ?');
        params.push(options.account_type);
      }

      if (options.is_active !== undefined) {
        conditions.push('is_active = ?');
        params.push(options.is_active ? 1 : 0);
      }

      if (options.is_primary !== undefined) {
        conditions.push('is_primary = ?');
        params.push(options.is_primary ? 1 : 0);
      }

      if (options.tax_advantaged !== undefined) {
        conditions.push('tax_advantaged = ?');
        params.push(options.tax_advantaged ? 1 : 0);
      }

      if (options.search) {
        conditions.push('(account_name LIKE ? OR institution_name LIKE ?)');
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Apply additional filters
      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
      }

      // Add ordering
      const orderBy = options.orderBy || 'account_name';
      const orderDirection = options.orderDirection || 'ASC';
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;

      const accounts = await dbManager.selectQuery(sql, params);
      return accounts.map(this.formatAccount);
    } catch (error) {
      console.error('❌ Error getting accounts by user ID:', error);
      throw error;
    }
  }

  /**
   * Update account
   */
  static async update(id, updates) {
    try {
      // Get existing account for validation
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Account not found');
      }

      // Merge updates with existing data
      const updatedAccount = { ...existing, ...updates, id };
      
      // Validate updated data
      const errors = validateAccount(updatedAccount);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        UPDATE accounts SET 
          account_name = ?, account_type = ?, institution_name = ?, account_number_last4 = ?,
          current_balance = ?, available_balance = ?, credit_limit = ?, interest_rate = ?,
          is_active = ?, is_primary = ?, owner_type = ?, tax_advantaged = ?,
          include_in_forecasting = ?, scenario_priority = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        updatedAccount.account_name,
        updatedAccount.account_type,
        updatedAccount.institution_name,
        updatedAccount.account_number_last4,
        updatedAccount.current_balance,
        updatedAccount.available_balance,
        updatedAccount.credit_limit,
        updatedAccount.interest_rate,
        updatedAccount.is_active ? 1 : 0,
        updatedAccount.is_primary ? 1 : 0,
        updatedAccount.owner_type,
        updatedAccount.tax_advantaged ? 1 : 0,
        updatedAccount.include_in_forecasting ? 1 : 0,
        updatedAccount.scenario_priority,
        id
      ];

      const result = await dbManager.executeQuery(sql, params);
      
      if (result.changes === 0) {
        throw new Error('Account not found or no changes made');
      }

      console.log(`✅ Updated account: ${id}`);
      return await this.getById(id);
    } catch (error) {
      console.error('❌ Error updating account:', error);
      throw error;
    }
  }

  /**
   * Delete account
   */
  static async delete(id) {
    try {
      // Check if account has transactions
      const transactionCount = await dbManager.selectOneQuery(
        'SELECT COUNT(*) as count FROM transactions_v2 WHERE account_id = ?',
        [id]
      );

      if (transactionCount && transactionCount.count > 0) {
        throw new Error('Cannot delete account with existing transactions. Consider deactivating instead.');
      }

      const sql = 'DELETE FROM accounts WHERE id = ?';
      const result = await dbManager.executeQuery(sql, [id]);
      
      if (result.changes === 0) {
        throw new Error('Account not found');
      }

      console.log(`✅ Deleted account: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Set account as primary for its type
   */
  static async setPrimary(accountId, userId) {
    try {
      const account = await this.getById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      if (account.userId !== userId) {
        throw new Error('Account does not belong to user');
      }

      // Begin transaction
      await dbManager.beginTransaction();

      try {
        // Clear primary flag for all accounts of same type
        await dbManager.executeQuery(
          'UPDATE accounts SET is_primary = 0 WHERE user_profile_id = ? AND account_type = ?',
          [userId, account.type]
        );

        // Set this account as primary
        await dbManager.executeQuery(
          'UPDATE accounts SET is_primary = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [accountId]
        );

        await dbManager.commitTransaction();
        
        console.log(`✅ Set account ${accountId} as primary ${account.type}`);
        return await this.getById(accountId);
      } catch (error) {
        await dbManager.rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error('❌ Error setting primary account:', error);
      throw error;
    }
  }

  /**
   * Get account statistics for user
   */
  static async getAccountStatistics(userId) {
    try {
      const sql = `
        SELECT 
          account_type,
          COUNT(*) as count,
          SUM(CASE WHEN current_balance > 0 THEN current_balance ELSE 0 END) as total_assets,
          SUM(CASE WHEN current_balance < 0 THEN ABS(current_balance) ELSE 0 END) as total_liabilities,
          AVG(current_balance) as avg_balance,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
        FROM accounts 
        WHERE user_profile_id = ?
        GROUP BY account_type
        ORDER BY count DESC
      `;

      const stats = await dbManager.selectQuery(sql, [userId]);
      
      // Calculate totals
      const totals = await dbManager.selectOneQuery(`
        SELECT 
          COUNT(*) as total_accounts,
          SUM(CASE WHEN current_balance > 0 THEN current_balance ELSE 0 END) as total_assets,
          SUM(CASE WHEN current_balance < 0 THEN ABS(current_balance) ELSE 0 END) as total_liabilities,
          SUM(current_balance) as net_worth,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_accounts
        FROM accounts 
        WHERE user_profile_id = ?
      `, [userId]);

      return {
        byType: stats,
        totals: totals || {
          total_accounts: 0,
          total_assets: 0,
          total_liabilities: 0,
          net_worth: 0,
          active_accounts: 0
        }
      };
    } catch (error) {
      console.error('❌ Error getting account statistics:', error);
      throw error;
    }
  }

  /**
   * Get payment sequence for scenario fallbacks
   */
  static async getPaymentSequence(userId, paymentAmount) {
    try {
      const sql = `
        SELECT id, account_name, account_type, current_balance, credit_limit, scenario_priority
        FROM accounts 
        WHERE user_profile_id = ? AND is_active = 1 AND include_in_forecasting = 1
        ORDER BY scenario_priority ASC, 
                 CASE account_type 
                   WHEN 'checking' THEN 1
                   WHEN 'savings' THEN 2
                   WHEN 'credit_card' THEN 3
                   WHEN 'line_of_credit' THEN 4
                   ELSE 5
                 END
      `;

      const accounts = await dbManager.selectQuery(sql, [userId]);
      const paymentSequence = [];

      for (const account of accounts) {
        const accountTypeInfo = ACCOUNT_TYPES[account.account_type];
        let availableAmount = 0;

        if (accountTypeInfo?.creditLimit) {
          // Credit account - calculate available credit
          availableAmount = (account.credit_limit || 0) - Math.abs(account.current_balance);
        } else {
          // Asset account - use current balance
          availableAmount = account.current_balance;
        }

        if (availableAmount >= paymentAmount) {
          paymentSequence.push({
            accountId: account.id,
            accountName: account.account_name,
            accountType: account.account_type,
            availableAmount,
            canCoverPayment: true
          });
        }
      }

      return paymentSequence;
    } catch (error) {
      console.error('❌ Error getting payment sequence:', error);
      throw error;
    }
  }

  /**
   * Get accounts by category
   */
  static async getByCategory(userId, category) {
    try {
      const accountTypes = [];
      
      // Find account types in the specified category
      for (const [type, info] of Object.entries(ACCOUNT_TYPES)) {
        if (info.category === category) {
          accountTypes.push(type);
        }
      }

      if (accountTypes.length === 0) {
        return [];
      }

      const placeholders = accountTypes.map(() => '?').join(',');
      const sql = `
        SELECT * FROM accounts 
        WHERE user_profile_id = ? AND account_type IN (${placeholders})
        ORDER BY is_primary DESC, account_name ASC
      `;

      const params = [userId, ...accountTypes];
      const accounts = await dbManager.selectQuery(sql, params);
      
      return accounts.map(this.formatAccount);
    } catch (error) {
      console.error('❌ Error getting accounts by category:', error);
      throw error;
    }
  }

  /**
   * Format account data from database
   */
  static formatAccount(dbAccount) {
    if (!dbAccount) return null;

    const accountTypeInfo = ACCOUNT_TYPES[dbAccount.account_type] || {};

    return {
      id: dbAccount.id,
      userId: dbAccount.user_profile_id,
      name: dbAccount.account_name,
      type: dbAccount.account_type,
      institution: dbAccount.institution_name,
      accountNumberLast4: dbAccount.account_number_last4,
      currentBalance: dbAccount.current_balance,
      availableBalance: dbAccount.available_balance,
      creditLimit: dbAccount.credit_limit,
      interestRate: dbAccount.interest_rate,
      isActive: Boolean(dbAccount.is_active),
      isPrimary: Boolean(dbAccount.is_primary),
      ownerType: dbAccount.owner_type,
      taxAdvantaged: Boolean(dbAccount.tax_advantaged),
      includeInForecasting: Boolean(dbAccount.include_in_forecasting),
      scenarioPriority: dbAccount.scenario_priority,
      createdAt: dbAccount.created_at,
      updatedAt: dbAccount.updated_at,
      
      // Add account type metadata
      typeInfo: {
        category: accountTypeInfo.category,
        defaultName: accountTypeInfo.defaultName,
        liquidityScore: accountTypeInfo.liquidityScore,
        riskLevel: accountTypeInfo.riskLevel,
        features: accountTypeInfo.features || [],
        canOverdraft: accountTypeInfo.canOverdraft || false,
        contributionLimits: accountTypeInfo.contributionLimits
      }
    };
  }

  /**
   * Get available account types
   */
  static getAccountTypes() {
    return ACCOUNT_TYPES;
  }

  /**
   * Count accounts for user
   */
  static async count(userId, options = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM accounts WHERE user_profile_id = ?';
      const params = [userId];

      if (options.is_active !== undefined) {
        sql += ' AND is_active = ?';
        params.push(options.is_active ? 1 : 0);
      }

      if (options.account_type) {
        sql += ' AND account_type = ?';
        params.push(options.account_type);
      }

      const result = await dbManager.selectOneQuery(sql, params);
      return result ? result.count : 0;
    } catch (error) {
      console.error('❌ Error counting accounts:', error);
      throw error;
    }
  }
}

module.exports = { AccountDAO }; 