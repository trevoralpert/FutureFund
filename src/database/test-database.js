/**
 * Database Integration Test
 * Tests all database functionality to ensure proper operation
 */

const { dbManager } = require('./database');
const TransactionDAO = require('./transaction-dao');
const ScenarioDAO = require('./scenario-dao');
const DataMigrationService = require('./data-migration');

async function runDatabaseTests() {
  console.log('🧪 Starting Database Integration Tests...\n');
  
  try {
    // Test 1: Database Initialization
    console.log('1️⃣ Testing Database Initialization...');
    await dbManager.initialize();
    console.log('✅ Database initialized successfully');
    
    // Test 2: Database Stats
    console.log('\n2️⃣ Testing Database Stats...');
    const stats = await dbManager.getStats();
    console.log('📊 Database Stats:', {
      transactions: stats.transactions,
      scenarios: stats.scenarios,
      categories: stats.categories,
      databaseSize: `${Math.round(stats.databaseSize / 1024)} KB`
    });
    
    // Test 3: Create Sample Transaction
    console.log('\n3️⃣ Testing Transaction Creation...');
    const sampleTransaction = {
      id: `test_transaction_${Date.now()}`,
      date: '2025-01-15',
      description: 'Database Test Transaction',
      amount: -50.00,
      category: 'Food',
      type: 'Expense',
      source: 'test'
    };
    
    const createResult = await TransactionDAO.create(sampleTransaction);
    console.log('✅ Transaction created:', createResult);
    
    // Test 4: Read Transaction
    console.log('\n4️⃣ Testing Transaction Read...');
    const retrievedTransaction = await TransactionDAO.getById(sampleTransaction.id);
    console.log('✅ Transaction retrieved:', {
      id: retrievedTransaction.id,
      description: retrievedTransaction.description,
      amount: retrievedTransaction.amount
    });
    
    // Test 5: Update Transaction
    console.log('\n5️⃣ Testing Transaction Update...');
    const updateResult = await TransactionDAO.update(sampleTransaction.id, {
      description: 'Updated Test Transaction',
      amount: -75.00
    });
    console.log('✅ Transaction updated:', updateResult);
    
    // Test 6: Transaction Statistics
    console.log('\n6️⃣ Testing Transaction Statistics...');
    const transactionStats = await TransactionDAO.getStatistics();
    console.log('📈 Transaction Statistics:', {
      total: transactionStats.total_transactions,
      totalIncome: `$${transactionStats.total_income?.toFixed(2) || '0.00'}`,
      totalExpenses: `$${transactionStats.total_expenses?.toFixed(2) || '0.00'}`,
      netIncome: `$${transactionStats.net_income?.toFixed(2) || '0.00'}`
    });
    
    // Test 7: Get All Transactions
    console.log('\n7️⃣ Testing Transaction Query...');
    const allTransactions = await TransactionDAO.getAll({ limit: 5 });
    console.log('📋 Sample Transactions:', allTransactions.map(t => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type
    })));
    
    // Test 8: Create Sample Scenario
    console.log('\n8️⃣ Testing Scenario Creation...');
    const sampleScenario = {
      id: `test_scenario_${Date.now()}`,
      name: 'Database Test Scenario',
      description: 'Testing scenario functionality',
      type: 'salary_change',
      parameters: {
        percentage: 10,
        startDate: '2025-02-01',
        endDate: null
      }
    };
    
    const scenarioResult = await ScenarioDAO.create(sampleScenario);
    console.log('✅ Scenario created:', scenarioResult);
    
    // Test 9: Get Scenario Templates
    console.log('\n9️⃣ Testing Scenario Templates...');
    const templates = ScenarioDAO.getTemplates();
    console.log('📋 Available Templates:', templates.slice(0, 3).map(t => ({
      type: t.type,
      name: t.name,
      description: t.description
    })));
    
    // Test 10: Validate Scenario Parameters
    console.log('\n🔟 Testing Scenario Validation...');
    const validation = ScenarioDAO.validateScenarioParameters('salary_change', {
      percentage: 15,
      startDate: '2025-02-01'
    });
    console.log('✅ Scenario validation:', validation);
    
    // Test 11: Data Migration Stats
    console.log('\n1️⃣1️⃣ Testing Migration Stats...');
    const migrationStats = await DataMigrationService.getMigrationStats();
    console.log('📊 Migration Stats:', {
      transactions: migrationStats.database.transactions,
      databasePath: migrationStats.database.databasePath
    });
    
    // Test 12: Data Integrity Check
    console.log('\n1️⃣2️⃣ Testing Data Integrity...');
    const integrityCheck = await DataMigrationService.validateDataIntegrity();
    console.log('✅ Data Integrity:', integrityCheck.valid ? 'PASSED' : 'FAILED');
    if (!integrityCheck.valid) {
      console.log('⚠️ Issues found:', integrityCheck.issues);
    }
    
    // Test 13: Export Test
    console.log('\n1️⃣3️⃣ Testing Data Export...');
    const exportPath = require('path').join(__dirname, '../../data/test_export.json');
    const exportResult = await DataMigrationService.exportTransactions(exportPath, {
      filters: { limit: 10 },
      pretty: true
    });
    console.log('✅ Export completed:', {
      exported: exportResult.exported,
      filePath: exportResult.filePath
    });
    
    // Cleanup: Delete test data
    console.log('\n🧹 Cleaning up test data...');
    await TransactionDAO.delete(sampleTransaction.id);
    await ScenarioDAO.delete(sampleScenario.id);
    console.log('✅ Test data cleaned up');
    
    // Final stats
    console.log('\n📊 Final Database Stats...');
    const finalStats = await dbManager.getStats();
    console.log('📈 Final Stats:', {
      transactions: finalStats.transactions,
      scenarios: finalStats.scenarios,
      databaseSize: `${Math.round(finalStats.databaseSize / 1024)} KB`
    });
    
    console.log('\n🎉 All Database Tests PASSED! 🎉');
    console.log('✅ Database integration is working correctly');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Database Test FAILED:', error);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Close database connection
    try {
      await dbManager.close();
      console.log('\n🔒 Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDatabaseTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runDatabaseTests }; 