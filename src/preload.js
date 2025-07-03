const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Financial data operations
  loadFinancialData: (options) => ipcRenderer.invoke('load-financial-data', options),
  saveFinancialData: (data) => ipcRenderer.invoke('save-financial-data', data),
  
  // Transaction management
  createTransaction: (transaction) => ipcRenderer.invoke('create-transaction', transaction),
  updateTransaction: (id, updates) => ipcRenderer.invoke('update-transaction', id, updates),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  getTransaction: (id) => ipcRenderer.invoke('get-transaction', id),
  getTransactionStatistics: (options) => ipcRenderer.invoke('get-transaction-statistics', options),
  bulkDeleteTransactions: (ids) => ipcRenderer.invoke('bulk-delete-transactions', ids),
  calculateRunningBalances: () => ipcRenderer.invoke('calculate-running-balances'),
  
  // Scenario management
  loadScenarios: (options) => ipcRenderer.invoke('load-scenarios', options),
  saveScenario: (scenario) => ipcRenderer.invoke('save-scenario', scenario),
  deleteScenario: (scenarioId) => ipcRenderer.invoke('delete-scenario', scenarioId),
  createScenario: (scenario) => ipcRenderer.invoke('create-scenario', scenario),
  updateScenario: (id, updates) => ipcRenderer.invoke('update-scenario', id, updates),
  getScenario: (id) => ipcRenderer.invoke('get-scenario', id),
  cloneScenario: (id, newName) => ipcRenderer.invoke('clone-scenario', id, newName),
  toggleScenarioActive: (id, isActive) => ipcRenderer.invoke('toggle-scenario-active', id, isActive),
  getScenarioTemplates: () => ipcRenderer.invoke('get-scenario-templates'),
  validateScenarioParameters: (type, parameters) => ipcRenderer.invoke('validate-scenario-parameters', type, parameters),
  
  // AI/LangGraph operations
  runForecast: (params) => ipcRenderer.invoke('run-forecast', params),
  askChatbot: (question, context) => ipcRenderer.invoke('ask-chatbot', question, context),
  
  // Enhanced Chat Management
  clearConversation: () => ipcRenderer.invoke('chat-clear-conversation'),
  getChatSummary: () => ipcRenderer.invoke('chat-get-summary'),
  chatHealthCheck: () => ipcRenderer.invoke('chat-health-check'),
  
  // Workflow-specific Chat Methods
  chatWithWorkflow: (workflowType, question, context, options) => ipcRenderer.invoke('chat-with-workflow', workflowType, question, context, options),
  chatRouteQuery: (question, context) => ipcRenderer.invoke('chat-route-query', question, context),
  setChatProgressCallback: (workflowId) => ipcRenderer.invoke('chat-set-progress-callback', workflowId),
  
  // Debug logging
  logDebug: (title, data) => ipcRenderer.invoke('log-debug', title, data),
  
  // Test IPC communication
  testIPC: (testData) => ipcRenderer.invoke('test-ipc', testData),
  
  // Hard refresh to clear cache
  hardRefresh: () => ipcRenderer.invoke('hard-refresh'),
  
  // Workflow Management
  cancelForecast: (workflowId) => ipcRenderer.invoke('cancel-forecast', workflowId),
  getWorkflowStatus: (workflowId) => ipcRenderer.invoke('get-workflow-status', workflowId),
  workflowHealthCheck: () => ipcRenderer.invoke('workflow-health-check'),
  clearWorkflowCache: () => ipcRenderer.invoke('clear-workflow-cache'),
  
  // API Configuration and Testing
  testAPIConnectivity: () => ipcRenderer.invoke('test-api-connectivity'),
  getConfigStatus: () => ipcRenderer.invoke('get-config-status'),
  
  // Account management
  getAccounts: (userId, options) => ipcRenderer.invoke('get-accounts', userId, options),
  createAccount: (account) => ipcRenderer.invoke('create-account', account),
  updateAccount: (id, updates) => ipcRenderer.invoke('update-account', id, updates),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),
  getAccount: (id) => ipcRenderer.invoke('get-account', id),
  getAccountTypes: () => ipcRenderer.invoke('get-account-types'),
  getAccountStatistics: (userId) => ipcRenderer.invoke('get-account-statistics', userId),
  getAccountsByCategory: (userId, category) => ipcRenderer.invoke('get-accounts-by-category', userId, category),
  setAccountPrimary: (accountId, userId) => ipcRenderer.invoke('set-account-primary', accountId, userId),
  getPaymentSequence: (userId, amount) => ipcRenderer.invoke('get-payment-sequence', userId, amount),
  
  // User Profile management
  getUserProfile: (userId) => ipcRenderer.invoke('get-user-profile', userId),
  createUserProfile: (profile) => ipcRenderer.invoke('create-user-profile', profile),
  updateUserProfile: (userId, updates) => ipcRenderer.invoke('update-user-profile', userId, updates),
  updateRiskAssessment: (userId, riskScores) => ipcRenderer.invoke('update-risk-assessment', userId, riskScores),
  updateGoalPriorities: (userId, goals) => ipcRenderer.invoke('update-goal-priorities', userId, goals),
  completeOnboarding: (userId, data) => ipcRenderer.invoke('complete-onboarding', userId, data),
  getFinancialProfile: (userId) => ipcRenderer.invoke('get-financial-profile', userId),
  
  // Data import/export
  importCSV: (filePath) => ipcRenderer.invoke('import-csv', filePath),
  exportData: (format, options) => ipcRenderer.invoke('export-data', format, options),
  exportAnalyticsPDF: (options) => ipcRenderer.invoke('export-analytics-pdf', options),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  importTransactions: (source, options) => ipcRenderer.invoke('import-transactions', source, options),
  exportTransactions: (filePath, options) => ipcRenderer.invoke('export-transactions', filePath, options),
  importAccounts: (source, options) => ipcRenderer.invoke('import-accounts', source, options),
  exportAccounts: (filePath, options) => ipcRenderer.invoke('export-accounts', filePath, options),
  
  // Database management
  createBackup: (backupPath) => ipcRenderer.invoke('create-backup', backupPath),
  restoreBackup: (backupPath, options) => ipcRenderer.invoke('restore-backup', backupPath, options),
  getDatabaseStats: () => ipcRenderer.invoke('get-database-stats'),
  validateDataIntegrity: () => ipcRenderer.invoke('validate-data-integrity'),
  cleanupOldData: (cutoffDate, options) => ipcRenderer.invoke('cleanup-old-data', cutoffDate, options),
  optimizeDatabase: () => ipcRenderer.invoke('optimize-database'),
  
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
  },
  
  onChatWorkflowProgress: (callback) => {
    ipcRenderer.on('chat-workflow-progress', callback);
    return () => ipcRenderer.removeListener('chat-workflow-progress', callback);
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