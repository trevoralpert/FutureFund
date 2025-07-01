/**
 * Data Migration Service
 * Handles data import/export, migration, and backup/restore operations
 */

const fs = require('fs').promises;
const path = require('path');
const { dbManager } = require('./database');
const TransactionDAO = require('./transaction-dao');
const ScenarioDAO = require('./scenario-dao');

/**
 * Data Migration Service
 */
class DataMigrationService {

  /**
   * Import transactions from JSON file or array
   */
  static async importTransactions(source, options = {}) {
    try {
      let transactions = [];

      // Handle different source types
      if (typeof source === 'string') {
        // File path
        const data = await fs.readFile(source, 'utf8');
        transactions = JSON.parse(data);
      } else if (Array.isArray(source)) {
        // Direct array
        transactions = source;
      } else {
        throw new Error('Source must be a file path or array of transactions');
      }

      console.log(`📥 Importing ${transactions.length} transactions...`);

      // Validate and transform transactions
      const validTransactions = [];
      const errors = [];

      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        try {
          const transformed = this.transformTransactionData(transaction);
          validTransactions.push(transformed);
        } catch (error) {
          errors.push(`Transaction ${i + 1}: ${error.message}`);
          if (options.skipErrors !== true) {
            throw new Error(`Import failed at transaction ${i + 1}: ${error.message}`);
          }
        }
      }

      if (errors.length > 0 && options.reportErrors !== false) {
        console.warn(`⚠️ ${errors.length} transactions had errors:`);
        errors.forEach(error => console.warn(`  - ${error}`));
      }

      // Import in batches for better performance
      const batchSize = options.batchSize || 100;
      let imported = 0;
      let skipped = 0;

      for (let i = 0; i < validTransactions.length; i += batchSize) {
        const batch = validTransactions.slice(i, i + batchSize);
        
        try {
          if (options.replaceExisting) {
            // Delete existing and insert new
            await this.replaceTransactionBatch(batch);
          } else {
            // Skip existing, insert new
            const result = await this.insertTransactionBatch(batch, options.skipExisting);
            imported += result.imported;
            skipped += result.skipped;
          }
        } catch (error) {
          if (options.skipErrors !== true) {
            throw error;
          }
          console.warn(`⚠️ Batch import error: ${error.message}`);
        }
      }

      console.log(`✅ Import completed: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);
      
      return {
        success: true,
        imported,
        skipped,
        errors: errors.length,
        total: transactions.length
      };
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  /**
   * Transform transaction data to database format
   */
  static transformTransactionData(transaction) {
    // Generate ID if missing
    if (!transaction.id) {
      transaction.id = `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Ensure required fields exist
    const transformed = {
      id: transaction.id,
      date: this.formatDate(transaction.date),
      description: transaction.description || 'Unknown Transaction',
      amount: this.parseAmount(transaction.amount),
      category: transaction.category || 'Other',
      type: this.normalizeType(transaction.type),
      balance: transaction.balance || null,
      is_projected: Boolean(transaction.isProjected || transaction.is_projected),
      is_recurring: Boolean(transaction.isRecurring || transaction.is_recurring),
      recurring_pattern: transaction.recurringPattern || transaction.recurring_pattern || null,
      source: transaction.source || 'import'
    };

    return transformed;
  }

  /**
   * Format date to YYYY-MM-DD format
   */
  static formatDate(dateInput) {
    if (!dateInput) {
      throw new Error('Date is required');
    }

    let date;
    if (typeof dateInput === 'string') {
      // Handle various date formats
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateInput; // Already in correct format
      }
      date = new Date(dateInput);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateInput}`);
    }

    return date.toISOString().split('T')[0];
  }

  /**
   * Parse amount to number
   */
  static parseAmount(amount) {
    if (typeof amount === 'number') {
      return amount;
    }

    if (typeof amount === 'string') {
      // Remove currency symbols and commas
      const cleaned = amount.replace(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) {
        throw new Error(`Invalid amount: ${amount}`);
      }
      return parsed;
    }

    throw new Error(`Amount must be a number or string: ${amount}`);
  }

  /**
   * Normalize transaction type
   */
  static normalizeType(type) {
    if (!type) return 'Expense';
    
    const normalized = type.toString().toLowerCase();
    if (normalized.includes('income') || normalized.includes('credit')) {
      return 'Income';
    }
    return 'Expense';
  }

  /**
   * Insert transaction batch with duplicate handling
   */
  static async insertTransactionBatch(transactions, skipExisting = true) {
    let imported = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      try {
        // Check if transaction already exists
        if (skipExisting) {
          const existing = await TransactionDAO.getById(transaction.id);
          if (existing) {
            skipped++;
            continue;
          }
        }

        await TransactionDAO.create(transaction);
        imported++;
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          skipped++;
        } else {
          throw error;
        }
      }
    }

    return { imported, skipped };
  }

  /**
   * Replace transaction batch (delete existing, insert new)
   */
  static async replaceTransactionBatch(transactions) {
    await dbManager.beginTransaction();
    
    try {
      // Delete existing transactions
      const ids = transactions.map(t => t.id);
      if (ids.length > 0) {
        await TransactionDAO.bulkDelete(ids);
      }

      // Insert new transactions
      await TransactionDAO.bulkCreate(transactions);
      
      await dbManager.commitTransaction();
    } catch (error) {
      await dbManager.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Export transactions to JSON
   */
  static async exportTransactions(filePath, options = {}) {
    try {
      console.log('📤 Exporting transactions...');
      
      const transactions = await TransactionDAO.getAll(options.filters || {});
      
      // Transform for export
      const exportData = transactions.map(transaction => {
        const exported = { ...transaction };
        
        // Remove internal fields if requested
        if (options.excludeInternalFields) {
          delete exported.createdAt;
          delete exported.updatedAt;
          delete exported.source;
        }

        return exported;
      });

      // Write to file
      const jsonData = JSON.stringify(exportData, null, options.pretty ? 2 : 0);
      await fs.writeFile(filePath, jsonData, 'utf8');
      
      console.log(`✅ Exported ${exportData.length} transactions to ${filePath}`);
      
      return {
        success: true,
        exported: exportData.length,
        filePath
      };
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Create full database backup
   */
  static async createBackup(backupPath) {
    try {
      console.log('💾 Creating database backup...');
      
      const backup = {
        metadata: {
          version: '1.0',
          created: new Date().toISOString(),
          source: 'FutureFund'
        },
        transactions: await TransactionDAO.getAll(),
        scenarios: await ScenarioDAO.getAll(),
        // Add other data types as needed
      };

      const jsonData = JSON.stringify(backup, null, 2);
      await fs.writeFile(backupPath, jsonData, 'utf8');
      
      console.log(`✅ Backup created: ${backupPath}`);
      
      return {
        success: true,
        backupPath,
        transactions: backup.transactions.length,
        scenarios: backup.scenarios.length
      };
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore from database backup
   */
  static async restoreBackup(backupPath, options = {}) {
    try {
      console.log('📥 Restoring from backup...');
      
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
      
      // Validate backup format
      if (!backupData.metadata || !backupData.transactions) {
        throw new Error('Invalid backup format');
      }

      let results = {
        transactions: { imported: 0, skipped: 0 },
        scenarios: { imported: 0, skipped: 0 }
      };

      // Restore transactions
      if (backupData.transactions && backupData.transactions.length > 0) {
        const transactionResult = await this.importTransactions(
          backupData.transactions, 
          { ...options, skipErrors: true }
        );
        results.transactions = transactionResult;
      }

      // Restore scenarios
      if (backupData.scenarios && backupData.scenarios.length > 0) {
        const scenarioResult = await this.importScenarios(
          backupData.scenarios,
          { ...options, skipErrors: true }
        );
        results.scenarios = scenarioResult;
      }

      console.log('✅ Backup restored successfully');
      
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Import scenarios from array
   */
  static async importScenarios(scenarios, options = {}) {
    try {
      console.log(`📥 Importing ${scenarios.length} scenarios...`);

      let imported = 0;
      let skipped = 0;
      const errors = [];

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        try {
          // Check if scenario already exists
          if (options.skipExisting) {
            const existing = await ScenarioDAO.getById(scenario.id);
            if (existing) {
              skipped++;
              continue;
            }
          }

          await ScenarioDAO.create(scenario);
          imported++;
        } catch (error) {
          errors.push(`Scenario ${i + 1}: ${error.message}`);
          if (options.skipErrors !== true) {
            throw new Error(`Import failed at scenario ${i + 1}: ${error.message}`);
          }
        }
      }

      console.log(`✅ Scenarios import completed: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);
      
      return {
        success: true,
        imported,
        skipped,
        errors: errors.length,
        total: scenarios.length
      };
    } catch (error) {
      console.error('❌ Scenario import failed:', error);
      throw error;
    }
  }

  /**
   * Import existing mock data to database
   */
  static async importMockData() {
    try {
      console.log('🔄 Importing mock data to database...');
      
      // Import from sample-transactions.json if it exists
      const sampleDataPath = path.join(__dirname, '../../data/sample-transactions.json');
      
      try {
        await fs.access(sampleDataPath);
        const result = await this.importTransactions(sampleDataPath, {
          skipExisting: true,
          skipErrors: true,
          reportErrors: true
        });
        
        console.log('✅ Mock data imported successfully');
        return result;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('ℹ️ No sample data file found, skipping mock data import');
          return { success: true, imported: 0, skipped: 0, errors: 0, total: 0 };
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Mock data import failed:', error);
      throw error;
    }
  }

  /**
   * Get migration statistics
   */
  static async getMigrationStats() {
    try {
      const stats = await dbManager.getStats();
      
      return {
        database: stats,
        diskUsage: {
          databaseSize: stats?.databaseSize || 0,
          databasePath: stats?.databasePath || 'Unknown'
        }
      };
    } catch (error) {
      console.error('❌ Error getting migration stats:', error);
      return null;
    }
  }

  /**
   * Cleanup old data (older than specified date)
   */
  static async cleanupOldData(cutoffDate, options = {}) {
    try {
      console.log(`🧹 Cleaning up data older than ${cutoffDate}...`);
      
      // Get transactions to delete
      const oldTransactions = await TransactionDAO.getAll({
        dateTo: cutoffDate,
        is_projected: false // Don't delete projected data
      });

      if (oldTransactions.length === 0) {
        console.log('ℹ️ No old data to cleanup');
        return { success: true, deleted: 0 };
      }

      // Create backup if requested
      if (options.createBackup) {
        const backupPath = options.backupPath || 
          path.join(__dirname, '../../data/backups', `cleanup_backup_${Date.now()}.json`);
        
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        await this.exportTransactions(backupPath, { 
          filters: { dateTo: cutoffDate },
          pretty: true 
        });
        
        console.log(`💾 Backup created before cleanup: ${backupPath}`);
      }

      // Delete old transactions
      const ids = oldTransactions.map(t => t.id);
      await TransactionDAO.bulkDelete(ids);
      
      console.log(`✅ Cleanup completed: ${ids.length} transactions deleted`);
      
      return {
        success: true,
        deleted: ids.length
      };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Validate data integrity
   */
  static async validateDataIntegrity() {
    try {
      console.log('🔍 Validating data integrity...');
      
      const issues = [];
      
      // Check database integrity
      const dbIntegrity = await dbManager.validateIntegrity();
      if (!dbIntegrity) {
        issues.push('Database integrity check failed');
      }

      // Check for duplicate transactions
      const duplicates = await dbManager.selectQuery(`
        SELECT id, COUNT(*) as count 
        FROM transactions 
        GROUP BY id 
        HAVING COUNT(*) > 1
      `);
      
      if (duplicates.length > 0) {
        issues.push(`Found ${duplicates.length} duplicate transaction IDs`);
      }

      // Check for invalid data
      const invalidTransactions = await dbManager.selectQuery(`
        SELECT id FROM transactions 
        WHERE date IS NULL OR amount IS NULL OR description IS NULL
      `);
      
      if (invalidTransactions.length > 0) {
        issues.push(`Found ${invalidTransactions.length} transactions with missing required fields`);
      }

      console.log(`🔍 Integrity check completed: ${issues.length} issues found`);
      
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('❌ Integrity validation failed:', error);
      throw error;
    }
  }
}

module.exports = DataMigrationService; 