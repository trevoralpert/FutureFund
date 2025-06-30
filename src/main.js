const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const config = require('./config');
const isDev = process.argv.includes('--dev');

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
app.whenReady().then(() => {
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
ipcMain.handle('load-financial-data', async () => {
  try {
    // In real app, this would load from database or API
    console.log('Loading financial data...');
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error loading financial data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-financial-data', async (event, data) => {
  try {
    console.log('Saving financial data...');
    // In real app, this would save to database
    return { success: true };
  } catch (error) {
    console.error('Error saving financial data:', error);
    return { success: false, error: error.message };
  }
});

// Scenario management
ipcMain.handle('load-scenarios', async () => {
  try {
    console.log('Loading scenarios...');
    return { success: true, scenarios: new Map() };
  } catch (error) {
    console.error('Error loading scenarios:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-scenario', async (event, scenario) => {
  try {
    console.log('Saving scenario:', scenario.name);
    return { success: true };
  } catch (error) {
    console.error('Error saving scenario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-scenario', async (event, scenarioId) => {
  try {
    console.log('Deleting scenario:', scenarioId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return { success: false, error: error.message };
  }
});

// AI/LangGraph operations (placeholders for now)
ipcMain.handle('run-forecast', async (event, params) => {
  try {
    console.log('Running forecast with params:', params);
    // Placeholder - would integrate with LangGraph here
    return { 
      success: true, 
      forecast: {
        projectedBalance: 25000,
        timeframe: '1 year',
        confidence: 0.85
      }
    };
  } catch (error) {
    console.error('Error running forecast:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ask-chatbot', async (event, question, context) => {
  try {
    console.log('Chatbot question:', question);
    
    if (!config.isAIEnabled) {
      return {
        success: false,
        error: 'AI features not configured. Please set up your OpenAI API key.',
        setup: true
      };
    }

    // Use OpenAI API
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    });

    // Build context-aware prompt
    const systemPrompt = `You are FutureFund AI, a personal finance assistant. You help users with financial planning, budgeting, and forecasting.

Current context:
- User has financial data: ${context?.hasData || false}
- Current balance: ${context?.currentBalance || 'Unknown'}
- Date range: ${context?.dateRange || 'Not specified'}

Be helpful, accurate, and professional. If you need more specific financial data to answer properly, ask for it.`;

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature
    });

    return {
      success: true,
      response: completion.choices[0].message.content,
      usage: completion.usage,
      model: config.openai.model
    };
  } catch (error) {
    console.error('Error with chatbot:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'CHATBOT_ERROR'
    };
  }
});

// File operations
ipcMain.handle('import-csv', async (event, filePath) => {
  try {
    console.log('Importing CSV from:', filePath);
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error importing CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-data', async (event, format) => {
  try {
    console.log('Exporting data in format:', format);
    return { success: true, filePath: '/path/to/exported/file' };
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
app.on('before-quit', () => {
  // Save any necessary data before closing
  console.log('FutureFund is closing...');
}); 