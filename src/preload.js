const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Financial data operations
  loadFinancialData: () => ipcRenderer.invoke('load-financial-data'),
  saveFinancialData: (data) => ipcRenderer.invoke('save-financial-data', data),
  
  // Scenario management
  loadScenarios: () => ipcRenderer.invoke('load-scenarios'),
  saveScenario: (scenario) => ipcRenderer.invoke('save-scenario', scenario),
  deleteScenario: (scenarioId) => ipcRenderer.invoke('delete-scenario', scenarioId),
  
  // AI/LangGraph operations
  runForecast: (params) => ipcRenderer.invoke('run-forecast', params),
  askChatbot: (question, context) => ipcRenderer.invoke('ask-chatbot', question, context),
  
  // Workflow Management
  cancelForecast: (workflowId) => ipcRenderer.invoke('cancel-forecast', workflowId),
  getWorkflowStatus: (workflowId) => ipcRenderer.invoke('get-workflow-status', workflowId),
  workflowHealthCheck: () => ipcRenderer.invoke('workflow-health-check'),
  clearWorkflowCache: () => ipcRenderer.invoke('clear-workflow-cache'),
  
  // API Configuration and Testing
  testAPIConnectivity: () => ipcRenderer.invoke('test-api-connectivity'),
  getConfigStatus: () => ipcRenderer.invoke('get-config-status'),
  
  // Data import/export
  importCSV: (filePath) => ipcRenderer.invoke('import-csv', filePath),
  exportData: (format) => ipcRenderer.invoke('export-data', format),
  
  // Notification system
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // File operations
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  
  // Event listeners
  onDataUpdate: (callback) => {
    ipcRenderer.on('data-updated', callback);
    return () => ipcRenderer.removeListener('data-updated', callback);
  },
  
  onForecastComplete: (callback) => {
    ipcRenderer.on('forecast-complete', callback);
    return () => ipcRenderer.removeListener('forecast-complete', callback);
  },
  
  onForecastProgress: (callback) => {
    ipcRenderer.on('forecast-progress', callback);
    return () => ipcRenderer.removeListener('forecast-progress', callback);
  }
});

// Expose some constants
contextBridge.exposeInMainWorld('APP_CONSTANTS', {
  VERSION: '1.0.0',
  SUPPORTED_FORMATS: ['csv', 'json'],
  MAX_FORECAST_YEARS: 10,
  DEFAULT_CATEGORIES: [
    'Income',
    'Housing',
    'Transportation', 
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Savings',
    'Debt',
    'Entertainment',
    'Other'
  ]
}); 