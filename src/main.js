const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
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
    version: app.getVersion()
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
    // Placeholder - would integrate with OpenAI/Claude here
    return { 
      success: true, 
      response: `I understand you're asking about "${question}". This is a placeholder response.`
    };
  } catch (error) {
    console.error('Error with chatbot:', error);
    return { success: false, error: error.message };
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