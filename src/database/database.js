/**
 * FutureFund Database Module
 * SQLite-based data persistence with comprehensive CRUD operations
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

/**
 * Database Manager Class
 * Handles all database operations with transaction safety and validation
 */
class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
    this.isClosing = false;
  }

  /**
   * Initialize database connection and create schema
   */
  async initialize() {
    try {
      // Determine database path 
      // In development, use local data directory; in production, use userData
      const userDataPath = (app && process.env.NODE_ENV === 'production') 
        ? app.getPath('userData') 
        : path.join(__dirname, '../../data');
      
      // Ensure data directory exists
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }

      this.dbPath = path.join(userDataPath, 'futurefund.db');
      console.log(`📁 Database path: ${this.dbPath}`);

      // Create database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          throw err;
        }
        console.log('✅ Connected to SQLite database');
      });

      // Enable foreign keys and WAL mode for better performance
      await this.executeQuery('PRAGMA foreign_keys = ON');
      await this.executeQuery('PRAGMA journal_mode = WAL');
      await this.executeQuery('PRAGMA synchronous = NORMAL');

      // Create database schema
      await this.createSchema();
      
      this.isInitialized = true;
      console.log('🗄️ Database initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database schema with comprehensive structure
   */
  async createSchema() {
    console.log('📊 Creating database schema...');

    // Transactions table
    const transactionsSchema = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
        balance REAL,
        is_projected BOOLEAN DEFAULT 0,
        is_recurring BOOLEAN DEFAULT 0,
        recurring_pattern TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'manual'
      )
    `;

    // Scenarios table
    const scenariosSchema = `
      CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        parameters TEXT NOT NULL, -- JSON string
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User preferences table
    const preferencesSchema = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Financial insights cache table
    const insightsSchema = `
      CREATE TABLE IF NOT EXISTS financial_insights (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL, -- JSON string
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `;

    // Categories table for transaction categorization
    const categoriesSchema = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
        color TEXT,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute schema creation
    const schemas = [
      { name: 'transactions', sql: transactionsSchema },
      { name: 'scenarios', sql: scenariosSchema },
      { name: 'user_preferences', sql: preferencesSchema },
      { name: 'financial_insights', sql: insightsSchema },
      { name: 'categories', sql: categoriesSchema }
    ];

    for (const schema of schemas) {
      await this.executeQuery(schema.sql);
      console.log(`✅ Created ${schema.name} table`);
    }

    // Create indexes for better performance
    await this.createIndexes();
    
    // Insert default data
    await this.insertDefaultData();
  }

  /**
   * Create database indexes for performance optimization
   */
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_scenarios_type ON scenarios(type)',
      'CREATE INDEX IF NOT EXISTS idx_insights_type ON financial_insights(type)',
      'CREATE INDEX IF NOT EXISTS idx_insights_expires ON financial_insights(expires_at)'
    ];

    for (const indexSql of indexes) {
      await this.executeQuery(indexSql);
    }
    
    console.log('📈 Created database indexes');
  }

  /**
   * Insert default categories and preferences
   */
  async insertDefaultData() {
    // Default categories
    const defaultCategories = [
      { id: 'income_salary', name: 'Salary', type: 'Income', color: '#10b981', is_default: 1 },
      { id: 'income_freelance', name: 'Freelance', type: 'Income', color: '#06b6d4', is_default: 1 },
      { id: 'income_investment', name: 'Investment', type: 'Income', color: '#8b5cf6', is_default: 1 },
      { id: 'expense_housing', name: 'Housing', type: 'Expense', color: '#ef4444', is_default: 1 },
      { id: 'expense_food', name: 'Food', type: 'Expense', color: '#f97316', is_default: 1 },
      { id: 'expense_transport', name: 'Transportation', type: 'Expense', color: '#eab308', is_default: 1 },
      { id: 'expense_entertainment', name: 'Entertainment', type: 'Expense', color: '#ec4899', is_default: 1 },
      { id: 'expense_healthcare', name: 'Healthcare', type: 'Expense', color: '#14b8a6', is_default: 1 },
      { id: 'expense_shopping', name: 'Shopping', type: 'Expense', color: '#6366f1', is_default: 1 },
      { id: 'expense_other', name: 'Other', type: 'Expense', color: '#64748b', is_default: 1 }
    ];

    for (const category of defaultCategories) {
      await this.executeQuery(
        `INSERT OR IGNORE INTO categories (id, name, type, color, is_default) VALUES (?, ?, ?, ?, ?)`,
        [category.id, category.name, category.type, category.color, category.is_default]
      );
    }

    // Default preferences
    const defaultPreferences = [
      { key: 'currency', value: 'USD', type: 'string' },
      { key: 'date_format', value: 'YYYY-MM-DD', type: 'string' },
      { key: 'theme', value: 'light', type: 'string' },
      { key: 'auto_backup', value: 'true', type: 'boolean' },
      { key: 'forecast_months', value: '12', type: 'number' },
      { key: 'confidence_threshold', value: '0.7', type: 'number' }
    ];

    for (const pref of defaultPreferences) {
      await this.executeQuery(
        `INSERT OR IGNORE INTO user_preferences (key, value, type) VALUES (?, ?, ?)`,
        [pref.key, pref.value, pref.type]
      );
    }

    console.log('📊 Inserted default data');
  }

  /**
   * Execute a SQL query with promise wrapper
   */
  executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ SQL Error:', err.message);
          console.error('   Query:', sql);
          console.error('   Params:', params);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Execute a SELECT query and return all results
   */
  selectQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ SQL Select Error:', err.message);
          console.error('   Query:', sql);
          console.error('   Params:', params);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute a SELECT query and return single result
   */
  selectOneQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ SQL Select One Error:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Begin database transaction
   */
  beginTransaction() {
    return this.executeQuery('BEGIN TRANSACTION');
  }

  /**
   * Commit database transaction
   */
  commitTransaction() {
    return this.executeQuery('COMMIT');
  }

  /**
   * Rollback database transaction
   */
  rollbackTransaction() {
    return this.executeQuery('ROLLBACK');
  }

  /**
   * Close database connection (with safety guards)
   */
  close() {
    return new Promise((resolve, reject) => {
      // Safety guard: prevent multiple close attempts
      if (!this.db || this.isClosing) {
        resolve();
        return;
      }
      
      this.isClosing = true;
      
      this.db.close((err) => {
        if (err) {
          console.error('❌ Database close error:', err);
          this.isClosing = false;
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          this.db = null;
          this.isInitialized = false;
          this.isClosing = false;
          resolve();
        }
      });
    });
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const transactionCount = await this.selectOneQuery('SELECT COUNT(*) as count FROM transactions');
      const scenarioCount = await this.selectOneQuery('SELECT COUNT(*) as count FROM scenarios');
      const categoryCount = await this.selectOneQuery('SELECT COUNT(*) as count FROM categories');
      const dbSize = fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0;

      return {
        transactions: transactionCount.count,
        scenarios: scenarioCount.count,
        categories: categoryCount.count,
        databaseSize: dbSize,
        databasePath: this.dbPath,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return null;
    }
  }

  /**
   * Validate database integrity
   */
  async validateIntegrity() {
    try {
      const result = await this.selectOneQuery('PRAGMA integrity_check');
      return result.integrity_check === 'ok';
    } catch (error) {
      console.error('❌ Database integrity check failed:', error);
      return false;
    }
  }

  /**
   * Optimize database (vacuum and analyze)
   */
  async optimize() {
    try {
      await this.executeQuery('VACUUM');
      await this.executeQuery('ANALYZE');
      console.log('✅ Database optimized');
      return true;
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = {
  DatabaseManager,
  dbManager
}; 