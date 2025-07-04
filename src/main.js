const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const config = require('./config');
const isDev = process.argv.includes('--dev');

// Database imports
const { dbManager } = require('./database/database');
const TransactionDAO = require('./database/transaction-dao');
const ScenarioDAO = require('./database/scenario-dao');
const DataMigrationService = require('./database/data-migration');

// V2 Database imports
const { AccountDAO } = require('./database/account-dao');
const { UserProfileDAO } = require('./database/user-profile-dao');
const { MigrationManager } = require('./database/migration-v2');

// Scenario Transaction Engine
const ScenarioTransactionEngine = require('./workflows/scenario-transaction-engine');

let mainWindow;
let transactionEngine;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load the main HTML file
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(async () => {
  // Initialize database first (with safety check)
  if (dbManager.isInitialized) {
    console.log('⚠️ Database already initialized, skipping...');
  } else {
    try {
      console.log('🚀 Initializing FutureFund database...');
      await dbManager.initialize();
      
      // Run V2 Migration to upgrade database schema
      console.log('🔄 Running V2 database migration...');
      const migrationManager = new MigrationManager();
      const migrationResult = await migrationManager.migrateToV2();
      if (migrationResult.success) {
        console.log('✅ Database migration completed successfully');
      } else {
        console.log('⚠️ Database migration skipped or failed:', migrationResult.message);
      }
      
      // Import mock data if database is empty
      const stats = await dbManager.getStats();
      if (stats && stats.transactions === 0) {
        console.log('📊 Database is empty, importing mock data...');
        await DataMigrationService.importMockData();
      }
      
      console.log('✅ Database ready with', stats?.transactions || 0, 'transactions');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Continue with app startup even if database fails
    }
  }
  
  // Initialize scenario transaction engine
  try {
    console.log('🔧 Initializing Scenario Transaction Engine...');
    transactionEngine = new ScenarioTransactionEngine();
    console.log('✅ Scenario Transaction Engine initialized');
  } catch (error) {
    console.error('❌ Scenario Transaction Engine initialization failed:', error);
  }
  
  // Environment-specific optimizations
  if (process.env.NODE_ENV === 'production') {
    // Production optimizations
    console.log('🚀 Starting FutureFund in production mode');
    
    // Disable unnecessary features for performance
    app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
    app.commandLine.appendSwitch('--disable-web-security');
    
    // Enable performance optimizations
    app.commandLine.appendSwitch('--enable-gpu-rasterization');
    app.commandLine.appendSwitch('--enable-zero-copy');
  } else {
    // Development: Clear cache to prevent old API calls
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData();
    console.log('🛠️ Starting FutureFund in development mode');
  }
  
  createWindow();
  
  // Set up menu
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'FutureFund',
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'File',
        submenu: [
          { role: 'close' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for communication with renderer
ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    isAIEnabled: config.isAIEnabled,
    observability: config.observability.type
  };
});

// Configuration and API testing
ipcMain.handle('test-api-connectivity', async () => {
  try {
    if (!config.isAIEnabled) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please set up your .env file.',
        setup: true
      };
    }

    // Test OpenAI API connectivity
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    });

    // Simple test request
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5,
      temperature: 0
    });

    return {
      success: true,
      model: config.openai.model,
      usage: completion.usage,
      observability: config.observability.type
    };
  } catch (error) {
    console.error('API connectivity test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
});

ipcMain.handle('get-config-status', () => {
  return {
    ai: {
      enabled: config.isAIEnabled,
      model: config.openai.model,
      configured: !!config.openai.apiKey
    },
    observability: config.observability,
    rateLimits: config.rateLimits
  };
});

// Financial data operations
ipcMain.handle('load-financial-data', async (event, options = {}) => {
  try {
    console.log('Loading financial data from database...');
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const transactions = await TransactionDAO.getAll(options);
    const stats = await TransactionDAO.getStatistics(options);
    
    return { 
      success: true, 
      data: transactions,
      statistics: stats,
      count: transactions.length
    };
  } catch (error) {
    console.error('Error loading financial data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-financial-data', async (event, data) => {
  try {
    console.log('Saving financial data to database...');
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    let result;
    if (Array.isArray(data)) {
      // Bulk save
      result = await TransactionDAO.bulkCreate(data);
    } else {
      // Single transaction
      result = await TransactionDAO.create(data);
    }
    
    return { success: true, result };
  } catch (error) {
    console.error('Error saving financial data:', error);
    return { success: false, error: error.message };
  }
});

// New database-specific transaction handlers
ipcMain.handle('create-transaction', async (event, transaction) => {
  try {
    const result = await TransactionDAO.create(transaction);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-transaction', async (event, id, updates) => {
  try {
    const result = await TransactionDAO.update(id, updates);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-transaction', async (event, id) => {
  try {
    const result = await TransactionDAO.delete(id);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-transaction', async (event, id) => {
  try {
    const transaction = await TransactionDAO.getById(id);
    return { success: true, transaction };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-transaction-statistics', async (event, options = {}) => {
  try {
    const stats = await TransactionDAO.getStatistics(options);
    return { success: true, statistics: stats };
  } catch (error) {
    console.error('Error getting transaction statistics:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('bulk-delete-transactions', async (event, ids) => {
  try {
    const result = await TransactionDAO.bulkDelete(ids);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error bulk deleting transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('calculate-running-balances', async () => {
  try {
    const result = await TransactionDAO.calculateRunningBalances();
    return { success: true, ...result };
  } catch (error) {
    console.error('Error calculating running balances:', error);
    return { success: false, error: error.message };
  }
});

// Account management (imports moved to top of file)

ipcMain.handle('get-accounts', async (event, userId, options = {}) => {
  try {
    console.log('Loading accounts for user:', userId);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const accounts = await AccountDAO.getByUserId(userId, options);
    return { success: true, accounts };
  } catch (error) {
    console.error('Error loading accounts:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-account', async (event, account) => {
  try {
    console.log('Creating account:', account.account_name);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await AccountDAO.create(account);
    return { success: true, account: result };
  } catch (error) {
    console.error('Error creating account:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-account', async (event, id, updates) => {
  try {
    console.log('Updating account:', id);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await AccountDAO.update(id, updates);
    return { success: true, account: result };
  } catch (error) {
    console.error('Error updating account:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-account', async (event, id) => {
  try {
    console.log('Deleting account:', id);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await AccountDAO.delete(id);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-account', async (event, id) => {
  try {
    const account = await AccountDAO.getById(id);
    return { success: true, account };
  } catch (error) {
    console.error('Error getting account:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-account-types', async () => {
  try {
    const accountTypes = AccountDAO.getAccountTypes();
    return { success: true, accountTypes };
  } catch (error) {
    console.error('Error getting account types:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-account-statistics', async (event, userId) => {
  try {
    const stats = await AccountDAO.getAccountStatistics(userId);
    return { success: true, stats };
  } catch (error) {
    console.error('Error getting account statistics:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-accounts-by-category', async (event, userId, category) => {
  try {
    const accounts = await AccountDAO.getByCategory(userId, category);
    return { success: true, accounts };
  } catch (error) {
    console.error('Error getting accounts by category:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-account-primary', async (event, accountId, userId) => {
  try {
    const account = await AccountDAO.setPrimary(accountId, userId);
    return { success: true, account };
  } catch (error) {
    console.error('Error setting account primary:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-payment-sequence', async (event, userId, amount) => {
  try {
    const sequence = await AccountDAO.getPaymentSequence(userId, amount);
    return { success: true, sequence };
  } catch (error) {
    console.error('Error getting payment sequence:', error);
    return { success: false, error: error.message };
  }
});

// User Profile management
ipcMain.handle('get-user-profile', async (event, userId) => {
  try {
    const profile = await UserProfileDAO.getById(userId);
    return { success: true, profile };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-user-profile', async (event, profile) => {
  try {
    console.log('Creating user profile:', profile.first_name, profile.last_name);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await UserProfileDAO.create(profile);
    return { success: true, profile: result };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-user-profile', async (event, userId, updates) => {
  try {
    const result = await UserProfileDAO.update(userId, updates);
    return { success: true, profile: result };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-risk-assessment', async (event, userId, riskScores) => {
  try {
    const result = await UserProfileDAO.updateRiskAssessment(userId, riskScores);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating risk assessment:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-goal-priorities', async (event, userId, goals) => {
  try {
    const result = await UserProfileDAO.updateGoalPriorities(userId, goals);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating goal priorities:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('complete-onboarding', async (event, userId, data) => {
  try {
    const result = await UserProfileDAO.completeOnboarding(userId, data);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-financial-profile', async (event, userId) => {
  try {
    const profile = await UserProfileDAO.getFinancialProfile(userId);
    return { success: true, profile };
  } catch (error) {
    console.error('Error getting financial profile:', error);
    return { success: false, error: error.message };
  }
});

// Scenario management
ipcMain.handle('load-scenarios', async (event, options = {}) => {
  try {
    console.log('Loading scenarios from database...');
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const scenarios = await ScenarioDAO.getAll(options);
    const count = await ScenarioDAO.count(options);
    
    return { 
      success: true, 
      scenarios: scenarios,
      count: count
    };
  } catch (error) {
    console.error('Error loading scenarios:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-scenario', async (event, scenario) => {
  try {
    console.log('Saving scenario:', scenario.name);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await ScenarioDAO.create(scenario);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error saving scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-scenario', async (event, scenarioId) => {
  try {
    console.log('Deleting scenario:', scenarioId);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    const result = await ScenarioDAO.delete(scenarioId);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return { success: false, error: error.message };
  }
});

// Additional scenario handlers
ipcMain.handle('create-scenario', async (event, scenario) => {
  try {
    const result = await ScenarioDAO.create(scenario);
    // Fetch the complete created scenario to return to frontend
    const createdScenario = await ScenarioDAO.getById(result.id);
    return { success: true, scenario: createdScenario, id: result.id, changes: result.changes };
  } catch (error) {
    console.error('Error creating scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-scenario', async (event, id, updates) => {
  try {
    const result = await ScenarioDAO.update(id, updates);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-scenario', async (event, id) => {
  try {
    const scenario = await ScenarioDAO.getById(id);
    return { success: true, scenario };
  } catch (error) {
    console.error('Error getting scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clone-scenario', async (event, id, newName) => {
  try {
    const result = await ScenarioDAO.clone(id, newName);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error cloning scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-scenario-active', async (event, id, isActive) => {
  try {
    const result = await ScenarioDAO.setActive(id, isActive);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error toggling scenario active status:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-scenario-templates', async () => {
  try {
    const templates = ScenarioDAO.getTemplates();
    return { success: true, templates };
  } catch (error) {
    console.error('Error getting scenario templates:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('validate-scenario-parameters', async (event, type, parameters) => {
  try {
    const validation = ScenarioDAO.validateScenarioParameters(type, parameters);
    return { success: true, validation };
  } catch (error) {
    console.error('Error validating scenario parameters:', error);
    return { success: false, error: error.message };
  }
});

// Scenario Transaction Engine handlers
ipcMain.handle('generate-scenario-transactions', async (event, scenario) => {
  try {
    console.log('🔄 Generating transactions for scenario:', scenario.name);
    
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    const result = transactionEngine.generateTransactionsForScenario(scenario);
    return result;
  } catch (error) {
    console.error('Error generating scenario transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-scenario-transactions', async (event, scenarioId) => {
  try {
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    const transactions = transactionEngine.getTransactionsForScenario(scenarioId);
    const impact = transactionEngine.getImpactForScenario(scenarioId);
    
    return { 
      success: true, 
      transactions, 
      impact,
      totalTransactions: transactions.length 
    };
  } catch (error) {
    console.error('Error getting scenario transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-all-scenario-transactions', async (event, scenarioIds) => {
  try {
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    const transactions = transactionEngine.getTransactionsForScenarios(scenarioIds);
    const summary = transactionEngine.getSummaryStats();
    
    return { 
      success: true, 
      transactions, 
      summary
    };
  } catch (error) {
    console.error('Error getting all scenario transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('calculate-scenario-impact', async (event, scenario) => {
  try {
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    // Generate transactions first if they don't exist
    const existingTransactions = transactionEngine.getTransactionsForScenario(scenario.id);
    if (existingTransactions.length === 0) {
      const generationResult = transactionEngine.generateTransactionsForScenario(scenario);
      if (!generationResult.success) {
        return generationResult;
      }
    }
    
    const impact = transactionEngine.getImpactForScenario(scenario.id);
    return { success: true, impact };
  } catch (error) {
    console.error('Error calculating scenario impact:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-scenario-transactions', async (event, scenarioId) => {
  try {
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    transactionEngine.clearTransactionsForScenario(scenarioId);
    return { success: true };
  } catch (error) {
    console.error('Error clearing scenario transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-all-scenario-transactions', async () => {
  try {
    if (!transactionEngine) {
      return { success: false, error: 'Transaction engine not initialized' };
    }
    
    transactionEngine.clearAllTransactions();
    return { success: true };
  } catch (error) {
    console.error('Error clearing all scenario transactions:', error);
    return { success: false, error: error.message };
  }
});

// Import workflow orchestrator
const { orchestrator } = require('./workflows/workflow-orchestrator');

// AI/LangGraph operations
ipcMain.handle('run-forecast', async (event, params) => {
  try {
    console.log('Running forecast with params:', params);
    
    // Validate input data
    const validationErrors = orchestrator.validateInputData(params);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: 'Invalid input data',
        details: validationErrors
      };
    }

    // Execute LangGraph workflow
    const result = await orchestrator.executeForecastWorkflow(params, {
      useCache: true,
      timeout: 60000,
      onProgress: (progress) => {
        // Send progress updates to renderer
        event.sender.send('forecast-progress', progress);
      }
    });

    return result;
    
  } catch (error) {
    console.error('Error running forecast:', error);
    return { success: false, error: error.message };
  }
});

// New workflow management handlers
ipcMain.handle('cancel-forecast', async (event, workflowId) => {
  try {
    const cancelled = orchestrator.cancelWorkflow(workflowId);
    return { success: true, cancelled };
  } catch (error) {
    console.error('Error cancelling forecast:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-workflow-status', async (event, workflowId) => {
  try {
    const status = orchestrator.getWorkflowStatus(workflowId);
    return { success: true, status };
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workflow-health-check', async () => {
  try {
    const health = await orchestrator.healthCheck();
    return { success: true, health };
  } catch (error) {
    console.error('Error checking workflow health:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-workflow-cache', async () => {
  try {
    orchestrator.clearCache();
    return { success: true };
  } catch (error) {
    console.error('Error clearing workflow cache:', error);
    return { success: false, error: error.message };
  }
});

// Import enhanced chat service with workflow integration
const { enhancedChatService } = require('./ai/enhanced-chat-service');

ipcMain.handle('ask-chatbot', async (event, question, context) => {
  try {
    console.log('🤖 Enhanced chatbot question:', question);
    
    if (!config.isAIEnabled) {
      return {
        success: false,
        error: 'AI features not configured. Please set up your OpenAI API key.',
        setup: true
      };
    }

    // Use enhanced chat service with workflow routing
    const result = await enhancedChatService.sendMessage(question, context);
    
    if (result.success) {
      return {
        success: true,
        response: result.response,
        workflow: result.workflow,
        sessionId: result.sessionId,
        confidence: result.confidence,
        workflowData: result.workflowData,
        metadata: result.metadata,
        model: config.openai.model
      };
    } else {
      return {
        success: false,
        error: result.error,
        fallback: result.fallback,
        code: result.code || 'CHATBOT_ERROR'
      };
    }
    
  } catch (error) {
    console.error('Error with enhanced chatbot:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'CHATBOT_ERROR'
    };
  }
});

// Enhanced chat management handlers
ipcMain.handle('chat-clear-conversation', async () => {
  try {
    enhancedChatService.clearConversation();
    return { success: true };
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('chat-get-summary', async () => {
  try {
    const summary = enhancedChatService.getConversationSummary();
    return { success: true, summary };
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('chat-health-check', async () => {
  try {
    const health = await enhancedChatService.healthCheck();
    return { success: true, health };
  } catch (error) {
    console.error('Error checking chat health:', error);
    return { success: false, error: error.message };
  }
});

// Enhanced workflow-specific chat handlers
ipcMain.handle('chat-with-workflow', async (event, workflowType, question, context, options = {}) => {
  try {
    console.log(`🚀 Chat with ${workflowType} workflow:`, question);
    
    if (!config.isAIEnabled) {
      return {
        success: false,
        error: 'AI features not configured. Please set up your OpenAI API key.',
        setup: true
      };
    }

    // Force specific workflow execution
    const routing = { primaryWorkflow: workflowType, confidence: 1.0 };
    const result = await enhancedChatService.executeWorkflow(routing, question, context, options);
    
    return {
      success: true,
      response: result.response,
      workflow: workflowType,
      workflowData: result.workflowData,
      metadata: result.metadata
    };
    
  } catch (error) {
    console.error(`Error with ${workflowType} workflow:`, error);
    return { 
      success: false, 
      error: error.message,
      workflow: workflowType
    };
  }
});

ipcMain.handle('chat-route-query', async (event, question, context) => {
  try {
    const routing = enhancedChatService.routeQuery(question, context);
    return { success: true, routing };
  } catch (error) {
    console.error('Error routing query:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('chat-set-progress-callback', async (event, workflowId) => {
  try {
    enhancedChatService.setProgressCallback(workflowId, (progress) => {
      event.sender.send('chat-workflow-progress', { workflowId, progress });
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting progress callback:', error);
    return { success: false, error: error.message };
  }
});

// Debug logging handler
ipcMain.handle('log-debug', async (event, title, data) => {
  console.log(`🔍 ${title}:`, data);
  return { success: true };
});

// File operations and data migration
ipcMain.handle('import-csv', async (event, filePath) => {
  try {
    console.log('Importing CSV from:', filePath);
    // TODO: Implement CSV parsing
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error importing CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-transactions', async (event, source, options = {}) => {
  try {
    const result = await DataMigrationService.importTransactions(source, options);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error importing transactions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-transactions', async (event, filePath, options = {}) => {
  try {
    const result = await DataMigrationService.exportTransactions(filePath, options);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return { success: false, error: error.message };
  }
});

// Account import/export handlers
ipcMain.handle('import-accounts', async (event, source, options = {}) => {
  try {
    console.log('Importing accounts from:', source);
    // TODO: Implement account import functionality
    return { success: true, imported: 0 };
  } catch (error) {
    console.error('Error importing accounts:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-accounts', async (event, filePath, options = {}) => {
  try {
    console.log('Exporting accounts to:', filePath);
    
    if (!dbManager.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    // Get user ID from options or use default
    const userId = options.userId;
    if (!userId) {
      throw new Error('User ID required for account export');
    }
    
    const accounts = await AccountDAO.getByUserId(userId);
    
    // Export as JSON
    const fs = require('fs').promises;
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      accountCount: accounts.length,
      accounts: accounts
    };
    
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    
    return { 
      success: true, 
      exported: accounts.length,
      filePath 
    };
  } catch (error) {
    console.error('Error exporting accounts:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-backup', async (event, backupPath) => {
  try {
    const result = await DataMigrationService.createBackup(backupPath);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error creating backup:', error);  
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, backupPath, options = {}) => {
  try {
    const result = await DataMigrationService.restoreBackup(backupPath, options);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error restoring backup:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-database-stats', async () => {
  try {
    const stats = await DataMigrationService.getMigrationStats();
    return { success: true, stats };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('validate-data-integrity', async () => {
  try {
    const result = await DataMigrationService.validateDataIntegrity();
    return { success: true, ...result };
  } catch (error) {
    console.error('Error validating data integrity:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cleanup-old-data', async (event, cutoffDate, options = {}) => {
  try {
    const result = await DataMigrationService.cleanupOldData(cutoffDate, options);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimize-database', async () => {
  try {
    const result = await dbManager.optimize();
    return { success: true, optimized: result };
  } catch (error) {
    console.error('Error optimizing database:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-data', async (event, format, options = {}) => {
  console.log('📊 Export:', { format, filename: options?.filename });
  
  try {
    if (format === 'analytics') {
      const fs = require('fs').promises;
      const filePath = options.filename ? 
        path.join(__dirname, '../data/exports', options.filename) :
        path.join(__dirname, '../data/exports', `analytics_${Date.now()}.json`);
      
      if (!options.data) {
        throw new Error('Analytics data required for export');
      }
      
      await fs.writeFile(filePath, JSON.stringify(options.data, null, 2));
      console.log('✅ Export successful:', filePath);
      
      return { success: true, exported: 1, message: 'Export successful' };
    } 
    
    if (format === 'json') {
      const filePath = options.filePath || path.join(__dirname, '../data/exports', `export_${Date.now()}.json`);
      const result = await DataMigrationService.exportTransactions(filePath, options);
      return { success: true, ...result };
    } 
    
    if (format === 'backup') {
      const backupPath = options.backupPath || path.join(__dirname, '../data/backups', `backup_${Date.now()}.json`);
      const result = await DataMigrationService.createBackup(backupPath);
      return { success: true, ...result };
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  } catch (error) {
    console.error('❌ Export error:', error);
    return { success: false, error: error.message };
  }
});

// PDF Analytics Export
ipcMain.handle('export-analytics-pdf', async (event, options) => {
  console.log('📄 Generating PDF report...');
  
  try {
    const { BrowserWindow, app } = require('electron');
    const fs = require('fs').promises;
    const os = require('os');
    
    // Get Downloads folder path
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const filePath = path.join(downloadsPath, options.filename);
    
    // Create HTML content for the PDF
    const htmlContent = generateReportHTML(options.data);
    
    // Create invisible window for PDF generation
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    
    // Generate PDF
    const pdfBuffer = await pdfWindow.webContents.printToPDF({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 1,
        bottom: 1,
        left: 1,
        right: 1
      }
    });
    
    // Save PDF to Downloads
    await fs.writeFile(filePath, pdfBuffer);
    
    // Close the window
    pdfWindow.close();
    
    console.log('✅ PDF saved to:', filePath);
    return { success: true, filePath, message: 'PDF exported successfully' };
    
  } catch (error) {
    console.error('❌ PDF export error:', error);
    return { success: false, error: error.message };
  }
});

// Open file handler
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('❌ Error opening file:', error);
    return { success: false, error: error.message };
  }
});

// HTML template generator for PDF report
function generateReportHTML(data) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>FutureFund Analytics Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .date {
          color: #6b7280;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1f2937;
          border-left: 4px solid #2563eb;
          padding-left: 15px;
          margin-bottom: 20px;
        }
        .score-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin-bottom: 20px;
        }
        .score-number {
          font-size: 48px;
          font-weight: bold;
          color: ${getScoreColor(data.healthScore.overall)};
        }
        .score-grade {
          font-size: 24px;
          font-weight: bold;
          margin-top: 10px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        .goals-list {
          list-style: none;
          padding: 0;
        }
        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .goal-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-achieved { background: #d1fae5; color: #065f46; }
        .status-critical { background: #fee2e2; color: #991b1b; }
        .insights-list {
          background: #eff6ff;
          border-radius: 8px;
          padding: 20px;
        }
        .insights-list li {
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏦 FutureFund</div>
        <h1>Financial Analytics Report</h1>
        <div class="date">Generated on ${data.generatedDate}</div>
      </div>

      <div class="section">
        <h2>💯 Overall Financial Health</h2>
        <div class="score-card">
          <div class="score-number">${data.healthScore.overall}</div>
          <div class="score-grade">Grade ${data.healthScore.grade}</div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Key Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Transactions</div>
            <div class="metric-value">${data.totalTransactions.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Current Balance</div>
            <div class="metric-value">${formatCurrency(data.currentBalance)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Savings Rate Score</div>
            <div class="metric-value" style="color: ${getScoreColor(data.healthScore.components.savingsRate.score)}">${data.healthScore.components.savingsRate.score}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Budget Control Score</div>
            <div class="metric-value" style="color: ${getScoreColor(data.healthScore.components.budgetControl.score)}">${data.healthScore.components.budgetControl.score}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🎯 Goal Progress</h2>
        <ul class="goals-list">
          ${data.goalProgress.map(goal => `
            <li class="goal-item">
              <span>${goal.name} (${goal.progress}%)</span>
              <span class="goal-status status-${goal.status}">${goal.status.toUpperCase()}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>💡 Insights & Recommendations</h2>
        <div class="insights-list">
          <ul>
            ${data.healthScore.insights.map(insight => `<li>${insight}</li>`).join('')}
            ${data.healthScore.recommendations.map(rec => `<li><strong>Recommendation:</strong> ${rec}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by FutureFund AI-Powered Financial Planning</p>
        <p>Report ID: ${data.generatedAt}</p>
      </div>
    </body>
    </html>
  `;
}

// Test IPC communication
ipcMain.handle('test-ipc', async (event, testData) => {
  console.log('🔍 TEST IPC received:', testData);
  const result = { success: true, message: 'IPC working', received: testData };
  console.log('🔍 TEST IPC returning:', result);
  return result;
});

// Notifications
ipcMain.handle('show-notification', async (event, title, body) => {
  try {
    // Could use system notifications here
    console.log('Notification:', title, body);
    return { success: true };
  } catch (error) {
    console.error('Error showing notification:', error);
    return { success: false, error: error.message };
  }
});

// File selection
ipcMain.handle('select-file', async (event, options) => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog(mainWindow, options);
    return { success: true, filePaths: result.filePaths, cancelled: result.canceled };
  } catch (error) {
    console.error('Error selecting file:', error);
    return { success: false, error: error.message };
  }
});

// Handle app closing
app.on('before-quit', async (event) => {
  // Prevent default quit to allow graceful cleanup
  event.preventDefault();
  
  console.log('FutureFund is closing...');
  
  try {
    // Close database with timeout
    const closePromise = dbManager.close();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database close timeout')), 3000)
    );
    
    await Promise.race([closePromise, timeoutPromise]);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  } finally {
    // Force quit regardless of database status
    console.log('🔚 Forcing app shutdown');
    app.exit(0);
  }
});

// Hard refresh handler to clear cache
ipcMain.handle('hard-refresh', async () => {
  try {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData();
    
    if (mainWindow) {
      mainWindow.webContents.reloadIgnoringCache();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Hard refresh failed:', error);
    return { success: false, error: error.message };
  }
}); 