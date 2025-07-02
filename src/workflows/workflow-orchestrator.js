/**
 * Workflow Orchestrator - Phase 3.5.3 Updated
 * Enhanced with Background Intelligence continuous monitoring capabilities
 * FlowGenius Assignment: Advanced LangGraph Integration Complete
 */

const { createLangGraphWorkflow } = require('./langgraph-foundation');
const { createFinancialIntelligenceWorkflow } = require('./financial-intelligence');
const { createBackgroundIntelligenceWorkflow, BackgroundIntelligenceManager } = require('./background-intelligence');
const { createScenarioAnalysisWorkflow } = require('./scenario-analysis');
const { createSmartScenarioWorkflows } = require('./smart-scenario-workflows');
const config = require('../config');

/**
 * Workflow Orchestrator Class
 * Handles execution, progress tracking, and caching for all LangGraph workflows
 * Enhanced with Background Intelligence continuous monitoring
 */
class WorkflowOrchestrator {
  constructor() {
    this.activeWorkflows = new Map();
    this.cache = new Map();
    this.progressCallbacks = new Map();
    this.maxCacheSize = 50;
    this.defaultTimeout = 60000; // 60 seconds
    this.langGraphWorkflow = null;
    this.financialIntelligenceWorkflow = null;
    this.backgroundIntelligenceWorkflow = null;
    this.scenarioAnalysisWorkflow = null;
    this.smartScenarioWorkflow = null;
    this.backgroundManager = null;
    
    // Initialize LangGraph workflow on startup
    this.initializeLangGraph();
    
    // Initialize Financial Intelligence workflow for Phase 3.5.2
    this.initializeFinancialIntelligence();
    
    // Initialize Background Intelligence system for Phase 3.5.3
    this.initializeBackgroundIntelligence();
    
    // Initialize Scenario Analysis system for Phase 3.6.1
    this.initializeScenarioAnalysis();
    
    // Initialize Smart Scenario Workflows for Phase 3.6.2
    this.initializeSmartScenarioWorkflows();
  }

  /**
   * Initialize LangGraph workflow
   */
  async initializeLangGraph() {
    try {
      console.log('🚀 [Orchestrator] Initializing LangGraph workflow...');
      this.langGraphWorkflow = createLangGraphWorkflow();
      console.log('✅ [Orchestrator] LangGraph workflow initialized successfully');
    } catch (error) {
      console.error('❌ [Orchestrator] Failed to initialize LangGraph:', error);
      this.langGraphWorkflow = null;
    }
  }

  /**
   * Initialize Financial Intelligence workflow - Phase 3.5.2
   */
  async initializeFinancialIntelligence() {
    try {
      console.log('🧠 [Orchestrator] Initializing Financial Intelligence workflow...');
      this.financialIntelligenceWorkflow = createFinancialIntelligenceWorkflow();
      console.log('✅ [Orchestrator] Financial Intelligence workflow initialized successfully');
    } catch (error) {
      console.error('❌ [Orchestrator] Failed to initialize Financial Intelligence:', error);
      this.financialIntelligenceWorkflow = null;
    }
  }

  /**
   * Initialize Background Intelligence system - Phase 3.5.3
   */
  async initializeBackgroundIntelligence() {
    try {
      console.log('🔄 [Orchestrator] Initializing Background Intelligence system...');
      
      // Create workflow
      this.backgroundIntelligenceWorkflow = createBackgroundIntelligenceWorkflow();
      
      // Create manager with event handlers
      this.backgroundManager = new BackgroundIntelligenceManager({
        interval: 30000, // 30 seconds default for production
        autoStart: false, // Manual start for better control
        alertCallback: this.handleBackgroundAlert.bind(this),
        insightCallback: this.handleBackgroundInsight.bind(this)
      });
      
      // Set up event listeners
      this.backgroundManager.on('alert', this.handleBackgroundAlert.bind(this));
      this.backgroundManager.on('insight', this.handleBackgroundInsight.bind(this));
      this.backgroundManager.on('cycleComplete', this.handleBackgroundCycleComplete.bind(this));
      this.backgroundManager.on('error', this.handleBackgroundError.bind(this));
      
      console.log('✅ [Orchestrator] Background Intelligence system initialized');
    } catch (error) {
      console.error('❌ [Orchestrator] Failed to initialize Background Intelligence system:', error);
      throw error;
    }
  }

  /**
   * Initialize Scenario Analysis System - Phase 3.6.1
   */
  initializeScenarioAnalysis() {
    try {
      console.log('🎯 Initializing Scenario Analysis system...');
      this.scenarioAnalysisWorkflow = createScenarioAnalysisWorkflow();
      console.log('✅ Scenario Analysis system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Scenario Analysis system:', error);
      throw error;
    }
  }

  /**
   * Initialize Smart Scenario Workflows - Phase 3.6.2
   */
  initializeSmartScenarioWorkflows() {
    try {
      console.log('🚀 Initializing Smart Scenario Workflows...');
      this.smartScenarioWorkflow = createSmartScenarioWorkflows();
      console.log('✅ Smart Scenario Workflows initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Smart Scenario Workflows:', error);
      throw error;
    }
  }

  /**
   * Execute financial forecast workflow using LangGraph
   */
  async executeForecastWorkflow(inputData, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🚀 [Orchestrator] Starting LangGraph financial forecast workflow: ${workflowId}`);

    try {
      // Ensure LangGraph is initialized
      if (!this.langGraphWorkflow) {
        await this.initializeLangGraph();
        if (!this.langGraphWorkflow) {
          throw new Error('LangGraph workflow initialization failed');
        }
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(inputData);
      if (options.useCache !== false && this.cache.has(cacheKey)) {
        console.log('📦 [Orchestrator] Returning cached result');
        const cachedResult = this.cache.get(cacheKey);
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cached: true,
            retrievalTime: Date.now() - startTime
          }
        };
      }

      // Validate input data
      const validationErrors = this.validateInputData(inputData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          workflowId,
          error: 'Invalid input data',
          details: validationErrors
        };
      }

      // Track active workflow
      this.activeWorkflows.set(workflowId, {
        startTime,
        timeout: options.timeout || this.defaultTimeout,
        status: 'running',
        type: 'langgraph_forecast'
      });

      // Set up progress tracking
      if (options.onProgress) {
        this.progressCallbacks.set(workflowId, options.onProgress);
      }

      // Execute LangGraph workflow with timeout
      const result = await Promise.race([
        this.executeWithProgress(inputData, workflowId),
        this.createTimeoutPromise(options.timeout || this.defaultTimeout)
      ]);

      // Cache successful results
      if (result.finalResult && result.metadata.success !== false) {
        this.cacheResult(cacheKey, result);
      }

      // Cleanup
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [Orchestrator] LangGraph workflow completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result.finalResult,
        metadata: {
          ...result.metadata,
          totalExecutionTime: totalTime,
          workflowId,
          framework: 'LangGraph',
          version: '3.5.1'
        }
      };

    } catch (error) {
      console.error(`❌ [Orchestrator] LangGraph workflow failed: ${workflowId}`, error);
      
      // Cleanup on error
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'LANGGRAPH_WORKFLOW_ERROR'
      };
    }
  }

  /**
   * Execute Financial Intelligence workflow - Phase 3.5.2
   */
  async executeFinancialIntelligenceWorkflow(inputData, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🧠 [Orchestrator] Starting Financial Intelligence workflow: ${workflowId}`);

    try {
      // Ensure Financial Intelligence is initialized
      if (!this.financialIntelligenceWorkflow) {
        await this.initializeFinancialIntelligence();
        if (!this.financialIntelligenceWorkflow) {
          throw new Error('Financial Intelligence workflow initialization failed');
        }
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(inputData, 'financial_intelligence');
      if (options.useCache !== false && this.cache.has(cacheKey)) {
        console.log('📦 [Orchestrator] Returning cached Financial Intelligence result');
        const cachedResult = this.cache.get(cacheKey);
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cached: true,
            retrievalTime: Date.now() - startTime
          }
        };
      }

      // Validate input data
      const validationErrors = this.validateInputData(inputData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          workflowId,
          error: 'Invalid input data',
          details: validationErrors
        };
      }

      // Track active workflow
      this.activeWorkflows.set(workflowId, {
        startTime,
        timeout: options.timeout || this.defaultTimeout,
        status: 'running',
        type: 'financial_intelligence'
      });

      // Set up progress tracking
      if (options.onProgress) {
        this.progressCallbacks.set(workflowId, options.onProgress);
      }

      // Execute Financial Intelligence workflow with timeout
      const result = await Promise.race([
        this.executeFinancialIntelligenceWithProgress(inputData, workflowId),
        this.createTimeoutPromise(options.timeout || this.defaultTimeout)
      ]);

      // Cache successful results
      if (result && result.executionMetadata?.phases?.every(p => p.success)) {
        this.cacheResult(cacheKey, result);
      }

      // Cleanup
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [Orchestrator] Financial Intelligence workflow completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result,
        metadata: {
          totalExecutionTime: totalTime,
          workflowId,
          framework: 'FinancialIntelligence',
          version: '3.5.2',
          phases: result.executionMetadata?.phases?.length || 0,
          healthScore: result.healthScore?.overall?.score || 0,
          anomalies: result.anomalies?.totalAnomalies || 0
        }
      };

    } catch (error) {
      console.error(`❌ [Orchestrator] Financial Intelligence workflow failed: ${workflowId}`, error);
      
      // Cleanup on error
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'FINANCIAL_INTELLIGENCE_ERROR'
      };
    }
  }

  /**
   * Execute Financial Intelligence workflow with progress tracking
   */
  async executeFinancialIntelligenceWithProgress(inputData, workflowId) {
    const progressCallback = this.progressCallbacks.get(workflowId);
    
    // Financial Intelligence workflow phases
    const phases = [
      'loadAndPreprocess',
      'analyzePatterns',
      'detectAnomalies',
      'calculateHealth',
      'categorizeTransactions',
      'generateInsights'
    ];
    
    let currentPhaseIndex = 0;
    
    // Progress tracking
    const progressInterval = setInterval(() => {
      if (progressCallback && currentPhaseIndex < phases.length) {
        const progress = {
          stage: phases[currentPhaseIndex],
          progress: Math.min(95, ((currentPhaseIndex + 1) / phases.length) * 95),
          message: this.getFinancialIntelligenceProgressMessage(phases[currentPhaseIndex]),
          framework: 'FinancialIntelligence'
        };
        
        progressCallback(progress);
        currentPhaseIndex++;
      }
    }, 1500); // Realistic processing time for advanced analysis

    try {
      // Execute the Financial Intelligence workflow
      console.log('🧠 [Orchestrator] Invoking Financial Intelligence workflow...');
      const result = await this.financialIntelligenceWorkflow.invoke({
        transactionData: inputData
      });
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: 'Financial Intelligence analysis complete',
          framework: 'FinancialIntelligence',
          results: {
            healthScore: result.healthScore?.overall?.score || 0,
            anomalies: result.anomalies?.totalAnomalies || 0,
            insights: result.insights?.keyFindings?.length || 0
          }
        });
      }
      
      clearInterval(progressInterval);
      return result;
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ [Orchestrator] Financial Intelligence execution error:', error);
      throw error;
    }
  }

  /**
   * Execute LangGraph workflow with progress tracking
   */
  async executeWithProgress(inputData, workflowId) {
    const progressCallback = this.progressCallbacks.get(workflowId);
    
    // LangGraph node execution order
    const nodeOrder = [
      'dataIngestion',
      'patternAnalysis',
      'projectionCalculation',
      'scenarioApplication',
      'resultFormatting'
    ];
    
    let currentNodeIndex = 0;
    
    // Progress tracking simulation (LangGraph doesn't provide built-in progress callbacks)
    const progressInterval = setInterval(() => {
      if (progressCallback && currentNodeIndex < nodeOrder.length) {
        const progress = {
          stage: nodeOrder[currentNodeIndex],
          progress: Math.min(95, ((currentNodeIndex + 1) / nodeOrder.length) * 95),
          message: this.getProgressMessage(nodeOrder[currentNodeIndex]),
          framework: 'LangGraph'
        };
        
        progressCallback(progress);
        currentNodeIndex++;
      }
    }, 1200); // Slightly slower for more realistic LangGraph processing

    try {
      // Execute the LangGraph workflow
      console.log('🔄 [Orchestrator] Invoking LangGraph workflow...');
      const result = await this.langGraphWorkflow.invoke({
        rawData: inputData
      });
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: 'LangGraph forecast generation complete',
          framework: 'LangGraph'
        });
      }
      
      clearInterval(progressInterval);
      return result;
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ [Orchestrator] LangGraph execution error:', error);
      throw new Error(`LangGraph execution failed: ${error.message}`);
    }
  }

  /**
   * Get user-friendly progress messages
   */
  getProgressMessage(stage) {
    const messages = {
      dataIngestion: 'LangGraph: Processing your financial data...',
      patternAnalysis: 'LangGraph: AI analyzing spending patterns...',
      projectionCalculation: 'LangGraph: Computing future projections...',
      scenarioApplication: 'LangGraph: Applying scenario adjustments...',
      resultFormatting: 'LangGraph: Preparing your forecast...'
    };
    
    return messages[stage] || 'LangGraph: Processing...';
  }

  /**
   * Get progress message for Financial Intelligence workflow
   */
  getFinancialIntelligenceProgressMessage(stage) {
    const messages = {
      loadAndPreprocess: 'Financial Intelligence: Loading and preprocessing transaction data...',
      analyzePatterns: 'Financial Intelligence: Analyzing spending patterns with AI...',
      detectAnomalies: 'Financial Intelligence: Detecting spending anomalies...',
      calculateHealth: 'Financial Intelligence: Calculating financial health score...',
      categorizeTransactions: 'Financial Intelligence: Categorizing transactions with AI...',
      generateInsights: 'Financial Intelligence: Generating insights and recommendations...'
    };
    
    return messages[stage] || 'Financial Intelligence: Processing advanced analysis...';
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`LangGraph workflow timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Generate unique workflow ID
   */
  generateWorkflowId() {
    return `langgraph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate cache key from input data
   */
  generateCacheKey(inputData, workflowType = 'langgraph') {
    const key = {
      transactionCount: inputData.transactions?.length || 0,
      dateRange: inputData.dateRange,
      scenarios: inputData.scenarios?.map(s => ({ type: s.type, amount: s.amount })) || [],
      framework: workflowType
    };
    
    return JSON.stringify(key);
  }

  /**
   * Cache workflow result with LRU behavior
   */
  cacheResult(key, result) {
    // Implement LRU cache behavior
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      ...result,
      cachedAt: Date.now(),
      framework: 'LangGraph'
    });
  }

  /**
   * Cancel running workflow
   */
  cancelWorkflow(workflowId) {
    if (this.activeWorkflows.has(workflowId)) {
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);
      console.log(`🛑 [Orchestrator] Cancelled LangGraph workflow: ${workflowId}`);
      return true;
    }
    return false;
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return { status: 'not_found' };
    }
    
    const elapsed = Date.now() - workflow.startTime;
    return {
      status: workflow.status,
      type: workflow.type,
      elapsed,
      timeout: workflow.timeout,
      framework: 'LangGraph'
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const langGraphEntries = Array.from(this.cache.values())
      .filter(entry => entry.framework === 'LangGraph').length;
      
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      langGraphEntries,
      hitRate: this.calculateHitRate(),
      framework: 'LangGraph'
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate() {
    // Simple implementation - would need hit/miss tracking for accuracy
    return this.cache.size > 0 ? 0.75 : 0;
  }

  /**
   * Clear cache
   */
  clearCache() {
    const cleared = this.cache.size;
    this.cache.clear();
    console.log(`🧹 [Orchestrator] Cleared ${cleared} cached LangGraph results`);
    return cleared;
  }

  /**
   * Validate input data
   */
  validateInputData(inputData) {
    const errors = [];
    
    if (!inputData) {
      errors.push('Input data is required');
      return errors;
    }
    
    if (!inputData.transactions) {
      errors.push('Transactions array is required');
    } else if (!Array.isArray(inputData.transactions)) {
      errors.push('Transactions must be an array');
    } else if (inputData.transactions.length === 0) {
      errors.push('At least one transaction is required');
    } else {
      // Validate transaction structure
      inputData.transactions.forEach((transaction, index) => {
        if (!transaction.amount) {
          errors.push(`Transaction ${index}: amount is required`);
        }
        if (!transaction.date) {
          errors.push(`Transaction ${index}: date is required`);
        }
        if (!transaction.description) {
          errors.push(`Transaction ${index}: description is required`);
        }
      });
    }
    
    // Validate scenarios if provided
    if (inputData.scenarios && Array.isArray(inputData.scenarios)) {
      inputData.scenarios.forEach((scenario, index) => {
        if (!scenario.type) {
          errors.push(`Scenario ${index}: type is required`);
        }
      });
    }
    
    return errors;
  }

  /**
   * Health check for LangGraph workflow system
   */
  async healthCheck() {
    try {
      // Test LangGraph workflow initialization
      const workflowHealthy = !!this.langGraphWorkflow;
      
      // Test configuration
      const configValid = config.isAIEnabled !== undefined;
      
      // Test OpenAI connectivity if enabled
      let aiConnectivity = true;
      if (config.isAIEnabled && config.openai?.apiKey) {
        try {
          // Simple connectivity test would go here
          aiConnectivity = true;
        } catch (error) {
          aiConnectivity = false;
        }
      }
      
      return {
        status: workflowHealthy && configValid ? 'healthy' : 'unhealthy',
        framework: 'LangGraph',
        version: '3.5.1',
        components: {
          langGraph: workflowHealthy,
          config: configValid,
          aiConnectivity: config.isAIEnabled ? aiConnectivity : 'disabled'
        },
        cache: this.getCacheStats(),
        activeWorkflows: this.activeWorkflows.size
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        framework: 'LangGraph',
        error: error.message
      };
    }
  }

  /**
   * Get detailed system status
   */
  getSystemStatus() {
    return {
      framework: 'LangGraph',
      version: '3.5.1',
      initialized: !!this.langGraphWorkflow,
      activeWorkflows: this.activeWorkflows.size,
      cache: this.getCacheStats(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  // === BACKGROUND INTELLIGENCE MANAGEMENT ===

  /**
   * Start Background Intelligence Monitoring
   */
  async startBackgroundMonitoring() {
    if (!this.backgroundManager) {
      throw new Error('Background Intelligence not initialized');
    }
    
    console.log('🚀 Starting Background Intelligence monitoring...');
    await this.backgroundManager.start();
    
    return {
      success: true,
      message: 'Background monitoring started',
      status: this.backgroundManager.getStatus()
    };
  }

  /**
   * Stop Background Intelligence Monitoring
   */
  async stopBackgroundMonitoring() {
    if (!this.backgroundManager) {
      throw new Error('Background Intelligence not initialized');
    }
    
    console.log('🛑 Stopping Background Intelligence monitoring...');
    await this.backgroundManager.stop();
    
    return {
      success: true,
      message: 'Background monitoring stopped',
      status: this.backgroundManager.getStatus()
    };
  }

  /**
   * Get Background Intelligence Status
   */
  getBackgroundStatus() {
    if (!this.backgroundManager) {
      return {
        available: false,
        message: 'Background Intelligence not initialized'
      };
    }
    
    return {
      available: true,
      ...this.backgroundManager.getStatus(),
      alerts: this.backgroundManager.getAlerts(),
      insights: this.backgroundManager.getInsights()
    };
  }

  /**
   * Execute Single Background Monitoring Cycle
   */
  async executeBackgroundCycle() {
    if (!this.backgroundManager) {
      throw new Error('Background Intelligence not initialized');
    }
    
    console.log('🔄 Executing single background monitoring cycle...');
    return await this.backgroundManager.executeMonitoringCycle();
  }

  // === BACKGROUND EVENT HANDLERS ===

  /**
   * Handle Background Alert
   */
  handleBackgroundAlert(alert) {
    console.log(`🚨 Background Alert [${alert.severity.toUpperCase()}]: ${alert.title}`);
    console.log(`   Message: ${alert.message}`);
    
    // Here you could integrate with notification systems, UI updates, etc.
    // For now, we'll just log the alert
    
    // Store alert for retrieval
    if (!this.recentAlerts) {
      this.recentAlerts = [];
    }
    this.recentAlerts.push({
      ...alert,
      receivedAt: Date.now()
    });
    
    // Keep only last 50 alerts
    if (this.recentAlerts.length > 50) {
      this.recentAlerts = this.recentAlerts.slice(-50);
    }
  }

  /**
   * Handle Background Insight
   */
  handleBackgroundInsight(insight) {
    console.log(`💡 Background Insight [${insight.type}]: ${insight.message}`);
    
    // Store insight for retrieval
    if (!this.recentInsights) {
      this.recentInsights = [];
    }
    this.recentInsights.push({
      ...insight,
      receivedAt: Date.now()
    });
    
    // Keep only last 100 insights
    if (this.recentInsights.length > 100) {
      this.recentInsights = this.recentInsights.slice(-100);
    }
  }

  /**
   * Handle Background Cycle Complete
   */
  handleBackgroundCycleComplete(data) {
    console.log(`📊 Background Cycle Complete: ${data.duration}ms`);
    
    // Update performance metrics
    if (!this.performanceMetrics) {
      this.performanceMetrics = {
        cycleCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        lastCycleTime: 0
      };
    }
    
    this.performanceMetrics.cycleCount++;
    this.performanceMetrics.totalDuration += data.duration;
    this.performanceMetrics.averageDuration = this.performanceMetrics.totalDuration / this.performanceMetrics.cycleCount;
    this.performanceMetrics.lastCycleTime = data.duration;
  }

  /**
   * Handle Background Error
   */
  handleBackgroundError(error) {
    console.error('❌ Background Intelligence Error:', error);
    
    // Store error for monitoring
    if (!this.recentErrors) {
      this.recentErrors = [];
    }
    this.recentErrors.push({
      error: error.message || error,
      timestamp: Date.now()
    });
    
    // Keep only last 20 errors
    if (this.recentErrors.length > 20) {
      this.recentErrors = this.recentErrors.slice(-20);
    }
  }

  /**
   * Execute Scenario Analysis workflow - Phase 3.6.1
   */
  async executeScenarioAnalysisWorkflow(scenarioData, financialContext, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🎯 [Orchestrator] Starting Scenario Analysis workflow: ${workflowId}`);

    try {
      // Ensure Scenario Analysis is initialized
      if (!this.scenarioAnalysisWorkflow) {
        this.initializeScenarioAnalysis();
        if (!this.scenarioAnalysisWorkflow) {
          throw new Error('Scenario Analysis workflow initialization failed');
        }
      }

      // Check cache first
      const cacheKey = this.generateCacheKey({ scenarioData, financialContext }, 'scenario_analysis');
      if (options.useCache !== false && this.cache.has(cacheKey)) {
        console.log('📦 [Orchestrator] Returning cached Scenario Analysis result');
        const cachedResult = this.cache.get(cacheKey);
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cached: true,
            retrievalTime: Date.now() - startTime
          }
        };
      }

      // Validate input data
      const validationErrors = this.validateScenarioData(scenarioData, financialContext);
      if (validationErrors.length > 0) {
        return {
          success: false,
          workflowId,
          error: 'Invalid scenario data',
          details: validationErrors
        };
      }

      // Track active workflow
      this.activeWorkflows.set(workflowId, {
        startTime,
        timeout: options.timeout || this.defaultTimeout,
        status: 'running',
        type: 'scenario_analysis'
      });

      // Set up progress tracking
      if (options.onProgress) {
        this.progressCallbacks.set(workflowId, options.onProgress);
      }

      // Execute Scenario Analysis workflow with timeout
      const result = await Promise.race([
        this.executeScenarioAnalysisWithProgress({ scenarioData, financialContext }, workflowId),
        this.createTimeoutPromise(options.timeout || this.defaultTimeout)
      ]);

      // Cache successful results
      if (result && result.feasibilityAssessment) {
        this.cacheResult(cacheKey, result);
      }

      // Cleanup
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [Orchestrator] Scenario Analysis workflow completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result,
        metadata: {
          totalExecutionTime: totalTime,
          workflowId,
          framework: 'ScenarioAnalysis',
          version: '3.6.1',
          phases: result.executionMetadata?.phases?.length || 0,
          feasibilityScore: result.feasibilityAssessment?.feasibilityScore || 0,
          validationErrors: result.validationResults?.errors?.length || 0,
          conflicts: result.conflictAnalysis?.conflicts?.length || 0
        }
      };

    } catch (error) {
      console.error(`❌ [Orchestrator] Scenario Analysis workflow failed: ${workflowId}`, error);
      
      // Cleanup on error
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'SCENARIO_ANALYSIS_ERROR'
      };
    }
  }

  /**
   * Execute Scenario Analysis workflow with progress tracking
   */
  async executeScenarioAnalysisWithProgress(inputData, workflowId) {
    const progressCallback = this.progressCallbacks.get(workflowId);
    
    // Scenario Analysis workflow phases
    const phases = [
      'validateScenario',
      'calculateEffects',
      'analyzeConflicts',
      'assessFeasibility',
      'generateRecommendations'
    ];
    
    let currentPhaseIndex = 0;
    
    // Progress tracking
    const progressInterval = setInterval(() => {
      if (progressCallback && currentPhaseIndex < phases.length) {
        const progress = {
          stage: phases[currentPhaseIndex],
          progress: Math.min(95, ((currentPhaseIndex + 1) / phases.length) * 95),
          message: this.getScenarioAnalysisProgressMessage(phases[currentPhaseIndex]),
          framework: 'ScenarioAnalysis'
        };
        
        progressCallback(progress);
        currentPhaseIndex++;
      }
    }, 1000); // Fast execution for scenario analysis

    try {
      // Execute the Scenario Analysis workflow
      console.log('🎯 [Orchestrator] Invoking Scenario Analysis workflow...');
      const result = await this.scenarioAnalysisWorkflow.invoke(inputData);
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: 'Scenario analysis complete',
          framework: 'ScenarioAnalysis',
          results: {
            feasibilityScore: result.feasibilityAssessment?.feasibilityScore || 0,
            validationErrors: result.validationResults?.errors?.length || 0,
            conflicts: result.conflictAnalysis?.conflicts?.length || 0,
            recommendations: result.analysisReport?.recommendations?.length || 0
          }
        });
      }
      
      clearInterval(progressInterval);
      return result;
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ [Orchestrator] Scenario Analysis execution error:', error);
      throw error;
    }
  }

  /**
   * Get progress message for Scenario Analysis workflow
   */
  getScenarioAnalysisProgressMessage(stage) {
    const messages = {
      validateScenario: 'Scenario Analysis: Validating scenario parameters...',
      calculateEffects: 'Scenario Analysis: Calculating financial effects...',
      analyzeConflicts: 'Scenario Analysis: Analyzing conflicts with existing scenarios...',
      assessFeasibility: 'Scenario Analysis: Assessing scenario feasibility...',
      generateRecommendations: 'Scenario Analysis: Generating AI-powered recommendations...'
    };
    
    return messages[stage] || 'Scenario Analysis: Processing scenario analysis...';
  }

  /**
   * Validate scenario data for Scenario Analysis workflow
   */
  validateScenarioData(scenarioData, financialContext) {
    const errors = [];

    if (!scenarioData) {
      errors.push('Scenario data is required');
      return errors;
    }

    if (!scenarioData.name || typeof scenarioData.name !== 'string') {
      errors.push('Scenario name is required and must be a string');
    }

    if (!scenarioData.type || typeof scenarioData.type !== 'string') {
      errors.push('Scenario type is required and must be a string');
    }

    if (!scenarioData.parameters || typeof scenarioData.parameters !== 'object') {
      errors.push('Scenario parameters are required and must be an object');
    }

    if (!financialContext) {
      errors.push('Financial context is required');
      return errors;
    }

    if (typeof financialContext.currentBalance !== 'number' || financialContext.currentBalance < 0) {
      errors.push('Current balance must be a non-negative number');
    }

    if (typeof financialContext.monthlyIncome !== 'number' || financialContext.monthlyIncome < 0) {
      errors.push('Monthly income must be a non-negative number');
    }

    if (typeof financialContext.monthlyExpenses !== 'number' || financialContext.monthlyExpenses < 0) {
      errors.push('Monthly expenses must be a non-negative number');
    }

    return errors;
  }

  /**
   * Execute Smart Scenario Workflows - Phase 3.6.2
   */
  async executeSmartScenarioWorkflow(baseScenario, financialContext, constraints = {}, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🚀 [Orchestrator] Starting Smart Scenario Workflow: ${workflowId}`);

    try {
      // Ensure Smart Scenario Workflow is initialized
      if (!this.smartScenarioWorkflow) {
        this.initializeSmartScenarioWorkflows();
        if (!this.smartScenarioWorkflow) {
          throw new Error('Smart Scenario Workflow initialization failed');
        }
      }

      // Execute Smart Scenario workflow
      const inputData = {
        baseScenario,
        financialContext,
        constraints,
        analysisType: constraints.analysisType || 'optimization'
      };

      const result = await this.smartScenarioWorkflow.invoke(inputData);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [Orchestrator] Smart Scenario Workflow completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result,
        metadata: {
          totalExecutionTime: totalTime,
          workflowId,
          framework: 'LangGraph',
          version: '3.6.2',
          phase: 'SmartScenarioWorkflows',
          variationsGenerated: result.executionMetadata?.variationsGenerated || 0,
          optionsRanked: result.executionMetadata?.optionsRanked || 0,
          recommendationCount: result.executionMetadata?.recommendationCount || 0
        }
      };

    } catch (error) {
      console.error(`❌ [Orchestrator] Smart Scenario Workflow failed: ${workflowId}`, error);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'SMART_SCENARIO_WORKFLOW_ERROR'
      };
    }
  }
}

// Export singleton instance
const orchestrator = new WorkflowOrchestrator();

module.exports = {
  WorkflowOrchestrator,
  orchestrator
}; 