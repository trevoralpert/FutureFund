const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const config = require('./config');
const isDev = process.argv.includes('--dev');

// Database imports
const { dbManager } = require('./database/database');
const TransactionDAO = require('./database/transaction-dao');
const ScenarioDAO = require('./database/scenario-dao');
const DataMigrationService = require('./database/data-migration');

let mainWindow;

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
    return { success: true, ...result };
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

// Import enhanced chat service
const { chatService } = require('./ai/chat-service');

ipcMain.handle('ask-chatbot', async (event, question, context) => {
  try {
    console.log('Enhanced chatbot question:', question);
    
    if (!config.isAIEnabled) {
      return {
        success: false,
        error: 'AI features not configured. Please set up your OpenAI API key.',
        setup: true
      };
    }

    // Use enhanced chat service with financial context
    const result = await chatService.sendMessage(question, context);
    
    if (result.success) {
      return {
        success: true,
        response: result.response,
        sessionId: result.sessionId,
        parsedQuery: result.parsedQuery,
        confidence: result.confidence,
        usage: result.usage,
        model: config.openai.model
      };
    } else {
      return {
        success: false,
        error: result.error,
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

// Add new chat management handlers
ipcMain.handle('chat-clear-conversation', async () => {
  try {
    chatService.clearConversation();
    return { success: true };
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('chat-get-summary', async () => {
  try {
    const summary = chatService.getConversationSummary();
    return { success: true, summary };
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('chat-health-check', async () => {
  try {
    const health = await chatService.healthCheck();
    return { success: true, health };
  } catch (error) {
    console.error('Error checking chat health:', error);
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
  try {
    console.log('Exporting data in format:', format);
    
    if (format === 'json') {
      // Use the export transactions function
      const filePath = options.filePath || path.join(__dirname, '../data/exports', `export_${Date.now()}.json`);
      const result = await DataMigrationService.exportTransactions(filePath, options);
      return { success: true, ...result };
    } else if (format === 'backup') {
      // Create full backup
      const backupPath = options.backupPath || path.join(__dirname, '../data/backups', `backup_${Date.now()}.json`);
      const result = await DataMigrationService.createBackup(backupPath);
      return { success: true, ...result };
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
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