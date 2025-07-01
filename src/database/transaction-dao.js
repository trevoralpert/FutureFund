/**
 * Transaction Data Access Object
 * Handles all transaction-related database operations
 */

const { dbManager } = require('./database');

/**
 * Transaction validation schema
 */
function validateTransaction(transaction) {
  const errors = [];

  if (!transaction.id || typeof transaction.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (!transaction.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    }
  }

  if (!transaction.description || typeof transaction.description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (transaction.amount === undefined || typeof transaction.amount !== 'number') {
    errors.push('Amount is required and must be a number');
  }

  if (!transaction.category || typeof transaction.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (!transaction.type || !['Income', 'Expense'].includes(transaction.type)) {
    errors.push('Type must be either "Income" or "Expense"');
  }

  return errors;
}

/**
 * Transaction Data Access Object
 */
class TransactionDAO {
  
  /**
   * Create a new transaction
   */
  static async create(transaction) {
    try {
      // Validate transaction data
      const errors = validateTransaction(transaction);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        INSERT INTO transactions (
          id, date, description, amount, category, type, 
          balance, is_projected, is_recurring, recurring_pattern, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        transaction.id,
        transaction.date,
        transaction.description,
        transaction.amount,
        transaction.category,
        transaction.type,
        transaction.balance || null,
        transaction.is_projected || false,
        transaction.is_recurring || false,
        transaction.recurring_pattern || null,
        transaction.source || 'manual'
      ];

      const result = await dbManager.executeQuery(sql, params);
      console.log(`✅ Created transaction: ${transaction.id}`);
      
      return { success: true, id: transaction.id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM transactions WHERE id = ?';
      const transaction = await dbManager.selectOneQuery(sql, [id]);
      
      if (transaction) {
        return this.formatTransaction(transaction);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting transaction by ID:', error);
      throw error;
    }
  }

  /**
   * Get all transactions with optional filtering and pagination
   */
  static async getAll(options = {}) {
    try {
      let sql = 'SELECT * FROM transactions';
      const params = [];
      const conditions = [];

      // Add filters
      if (options.type) {
        conditions.push('type = ?');
        params.push(options.type);
      }

      if (options.category) {
        conditions.push('category = ?');
        params.push(options.category);
      }

      if (options.dateFrom) {
        conditions.push('date >= ?');
        params.push(options.dateFrom);
      }

      if (options.dateTo) {
        conditions.push('date <= ?');
        params.push(options.dateTo);
      }

      if (options.minAmount !== undefined) {
        conditions.push('amount >= ?');
        params.push(options.minAmount);
      }

      if (options.maxAmount !== undefined) {
        conditions.push('amount <= ?');
        params.push(options.maxAmount);
      }

      if (options.is_projected !== undefined) {
        conditions.push('is_projected = ?');
        params.push(options.is_projected ? 1 : 0);
      }

      if (options.source) {
        conditions.push('source = ?');
        params.push(options.source);
      }

      // Apply search filter
      if (options.search) {
        conditions.push('(description LIKE ? OR category LIKE ?)');
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Add ordering
      const orderBy = options.orderBy || 'date';
      const orderDirection = options.orderDirection || 'DESC';
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Add pagination
      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(options.offset);
        }
      }

      const transactions = await dbManager.selectQuery(sql, params);
      return transactions.map(this.formatTransaction);
    } catch (error) {
      console.error('❌ Error getting all transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  static async update(id, updates) {
    try {
      // Get existing transaction for validation
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Transaction not found');
      }

      // Merge updates with existing data
      const updatedTransaction = { ...existing, ...updates, id };
      
      // Validate updated data
      const errors = validateTransaction(updatedTransaction);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        UPDATE transactions SET 
          date = ?, description = ?, amount = ?, category = ?, type = ?,
          balance = ?, is_projected = ?, is_recurring = ?, recurring_pattern = ?,
          source = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        updatedTransaction.date,
        updatedTransaction.description,
        updatedTransaction.amount,
        updatedTransaction.category,
        updatedTransaction.type,
        updatedTransaction.balance,
        updatedTransaction.is_projected ? 1 : 0,
        updatedTransaction.is_recurring ? 1 : 0,
        updatedTransaction.recurring_pattern,
        updatedTransaction.source,
        id
      ];

      const result = await dbManager.executeQuery(sql, params);
      
      if (result.changes === 0) {
        throw new Error('Transaction not found or no changes made');
      }

      console.log(`✅ Updated transaction: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM transactions WHERE id = ?';
      const result = await dbManager.executeQuery(sql, [id]);
      
      if (result.changes === 0) {
        throw new Error('Transaction not found');
      }

      console.log(`✅ Deleted transaction: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Bulk create transactions (with transaction safety)
   */
  static async bulkCreate(transactions) {
    try {
      await dbManager.beginTransaction();

      const results = [];
      for (const transaction of transactions) {
        const result = await this.create(transaction);
        results.push(result);
      }

      await dbManager.commitTransaction();
      console.log(`✅ Bulk created ${results.length} transactions`);
      
      return { success: true, created: results.length, results };
    } catch (error) {
      await dbManager.rollbackTransaction();
      console.error('❌ Error in bulk create:', error);
      throw error;
    }
  }

  /**
   * Bulk delete transactions
   */
  static async bulkDelete(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('IDs array is required');
      }

      await dbManager.beginTransaction();

      const placeholders = ids.map(() => '?').join(',');
      const sql = `DELETE FROM transactions WHERE id IN (${placeholders})`;
      const result = await dbManager.executeQuery(sql, ids);

      await dbManager.commitTransaction();
      console.log(`✅ Bulk deleted ${result.changes} transactions`);
      
      return { success: true, deleted: result.changes };
    } catch (error) {
      await dbManager.rollbackTransaction();
      console.error('❌ Error in bulk delete:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getStatistics(options = {}) {
    try {
      let whereClause = '';
      const params = [];

      if (options.dateFrom || options.dateTo) {
        const conditions = [];
        
        if (options.dateFrom) {
          conditions.push('date >= ?');
          params.push(options.dateFrom);
        }
        
        if (options.dateTo) {
          conditions.push('date <= ?');
          params.push(options.dateTo);
        }
        
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      const sql = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'Expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
          AVG(CASE WHEN type = 'Income' THEN amount ELSE NULL END) as avg_income,
          AVG(CASE WHEN type = 'Expense' THEN ABS(amount) ELSE NULL END) as avg_expense,
          COUNT(DISTINCT category) as unique_categories,
          MIN(date) as earliest_date,
          MAX(date) as latest_date
        FROM transactions 
        ${whereClause}
      `;

      const stats = await dbManager.selectOneQuery(sql, params);
      
      // Calculate net income
      stats.net_income = (stats.total_income || 0) - (stats.total_expenses || 0);
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting transaction statistics:', error);
      throw error;
    }
  }

  /**
   * Get transactions by category
   */
  static async getByCategory(category, options = {}) {
    return this.getAll({ ...options, category });
  }

  /**
   * Get transactions by date range
   */
  static async getByDateRange(dateFrom, dateTo, options = {}) {
    return this.getAll({ ...options, dateFrom, dateTo });
  }

  /**
   * Calculate running balance for all transactions
   */
  static async calculateRunningBalances() {
    try {
      await dbManager.beginTransaction();

      // Get all transactions ordered by date
      const transactions = await this.getAll({ orderBy: 'date', orderDirection: 'ASC' });
      
      let runningBalance = 0;
      
      for (const transaction of transactions) {
        runningBalance += transaction.amount;
        
        await this.update(transaction.id, { balance: runningBalance });
      }

      await dbManager.commitTransaction();
      console.log(`✅ Updated running balances for ${transactions.length} transactions`);
      
      return { success: true, updated: transactions.length };
    } catch (error) {
      await dbManager.rollbackTransaction();
      console.error('❌ Error calculating running balances:', error);
      throw error;
    }
  }

  /**
   * Format transaction object (convert database fields to app format)
   */
  static formatTransaction(dbTransaction) {
    return {
      id: dbTransaction.id,
      date: dbTransaction.date,
      description: dbTransaction.description,
      amount: dbTransaction.amount,
      category: dbTransaction.category,
      type: dbTransaction.type,
      balance: dbTransaction.balance,
      isProjected: Boolean(dbTransaction.is_projected),
      isRecurring: Boolean(dbTransaction.is_recurring),
      recurringPattern: dbTransaction.recurring_pattern,
      source: dbTransaction.source,
      createdAt: dbTransaction.created_at,
      updatedAt: dbTransaction.updated_at
    };
  }

  /**
   * Count transactions with filters
   */
  static async count(options = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM transactions';
      const params = [];
      const conditions = [];

      // Add same filters as getAll method
      if (options.type) {
        conditions.push('type = ?');
        params.push(options.type);
      }

      if (options.category) {
        conditions.push('category = ?');
        params.push(options.category);
      }

      if (options.dateFrom) {
        conditions.push('date >= ?');
        params.push(options.dateFrom);
      }

      if (options.dateTo) {
        conditions.push('date <= ?');
        params.push(options.dateTo);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await dbManager.selectOneQuery(sql, params);
      return result.count;
    } catch (error) {
      console.error('❌ Error counting transactions:', error);
      throw error;
    }
  }
}

module.exports = TransactionDAO; 