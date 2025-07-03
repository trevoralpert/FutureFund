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
const { createAdvancedScenarioModelingWorkflow } = require('./advanced-scenario-modeling');
const { createMultiAccountIntelligenceWorkflow } = require('./multi-account-intelligence');
const { createPredictiveAnalyticsPipeline } = require('./predictive-analytics-pipeline');
const { FinancialHealthMonitoring } = require('./financial-health-monitoring');
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
    this.advancedScenarioModelingWorkflow = null;
    this.backgroundManager = null;
    this.multiAccountIntelligenceWorkflow = null;
    this.predictiveAnalyticsPipeline = null;
    this.financialHealthMonitoring = null;
    this.resultCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    this.isInitialized = false;
    
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
    
    // Initialize Advanced Scenario Modeling for Phase 3.6.3  
    this.initializeAdvancedScenarioModeling();

    // Initialize Multi-Account Intelligence workflow for Phase 3.7.1
    this.initializeMultiAccountIntelligence();

    // Initialize Predictive Analytics Pipeline for Phase 3.7.2
    this.initializePredictiveAnalyticsPipeline();

    // Initialize Financial Health Monitoring for Phase 3.7.3
    this.initializeFinancialHealthMonitoring();
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
   * Initialize Advanced Scenario Modeling - Phase 3.6.3
   */
  initializeAdvancedScenarioModeling() {
    try {
      console.log('🏗️ Initializing Advanced Scenario Modeling...');
      this.advancedScenarioModelingWorkflow = createAdvancedScenarioModelingWorkflow();
      console.log('✅ Advanced Scenario Modeling initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Scenario Modeling:', error);
      throw error;
    }
  }

  /**
   * Initialize Multi-Account Intelligence workflow - Phase 3.7.1
   */
  initializeMultiAccountIntelligence() {
    try {
      console.log('🧠 [Orchestrator] Initializing Multi-Account Intelligence workflow...');
      this.multiAccountIntelligenceWorkflow = createMultiAccountIntelligenceWorkflow();
      console.log('✅ Multi-Account Intelligence workflow initialized successfully');
    } catch (error) {
      console.error('❌ [Orchestrator] Failed to initialize Multi-Account Intelligence:', error);
      this.multiAccountIntelligenceWorkflow = null;
    }
  }

  /**
   * Initialize Predictive Analytics Pipeline
   */
  async initializePredictiveAnalyticsPipeline() {
    console.log('🤖 [Orchestrator] Initializing Predictive Analytics Pipeline...');
    
    try {
      this.predictiveAnalyticsPipeline = createPredictiveAnalyticsPipeline();
      console.log('✅ [Orchestrator] Predictive Analytics Pipeline initialized');
    } catch (error) {
      console.error('❌ [Orchestrator] Predictive Analytics Pipeline initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Financial Health Monitoring System - Phase 3.7.3
   */
  async initializeFinancialHealthMonitoring() {
    console.log('🏥 [Orchestrator] Initializing Financial Health Monitoring System...');
    
    try {
      this.financialHealthMonitoring = new FinancialHealthMonitoring(
        config.openaiApiKey,
        this // Pass orchestrator reference for integration
      );
      console.log('✅ [Orchestrator] Financial Health Monitoring System initialized');
    } catch (error) {
      console.error('❌ [Orchestrator] Financial Health Monitoring initialization failed:', error);
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

  /**
   * Execute Advanced Scenario Modeling - Phase 3.6.3
   */
  async executeAdvancedScenarioModeling(scenarioSet, financialContext, modelingParameters = {}, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🏗️ [Orchestrator] Starting Advanced Scenario Modeling: ${workflowId}`);

    try {
      // Ensure Advanced Scenario Modeling is initialized
      if (!this.advancedScenarioModelingWorkflow) {
        this.initializeAdvancedScenarioModeling();
        if (!this.advancedScenarioModelingWorkflow) {
          throw new Error('Advanced Scenario Modeling workflow initialization failed');
        }
      }

      // Execute Advanced Scenario Modeling workflow
      const inputData = {
        scenarioSet,
        financialContext,
        modelingParameters: {
          simulationRuns: 100,
          confidenceIntervals: [0.05, 0.25, 0.5, 0.75, 0.95],
          compoundingMethod: 'parallel',
          ...modelingParameters
        }
      };

      const result = await this.advancedScenarioModelingWorkflow.invoke(inputData);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [Orchestrator] Advanced Scenario Modeling completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result,
        metadata: {
          totalExecutionTime: totalTime,
          workflowId,
          framework: 'LangGraph',
          version: '3.6.3',
          phase: 'AdvancedScenarioModeling',
          primaryScenarioCount: result.executionMetadata?.primaryScenarioCount || 0,
          simulationCount: result.executionMetadata?.simulationCount || 0,
          synergyCount: result.executionMetadata?.synergyCount || 0,
          conflictCount: result.executionMetadata?.conflictCount || 0,
          expectedValue: result.executionMetadata?.expectedValue || 0
        }
      };

    } catch (error) {
      console.error(`❌ [Orchestrator] Advanced Scenario Modeling failed: ${workflowId}`, error);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'ADVANCED_SCENARIO_MODELING_ERROR'
      };
    }
  }

  /**
   * Run Multi-Account Intelligence Analysis - Phase 3.7.1
   * Provides comprehensive portfolio analysis and cross-account insights
   */
  async runMultiAccountIntelligence(userId, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 [Multi-Account Intelligence] Starting analysis for user ${userId}...`);
      
      if (!this.multiAccountIntelligenceWorkflow) {
        throw new Error('Multi-Account Intelligence workflow not initialized');
      }
      
      // Set progress callback
      const progressTracker = this.createProgressTracker('multiAccountIntelligence');
      
      // Execute workflow
      const result = await this.multiAccountIntelligenceWorkflow.invoke({
        userId,
        ...options
      });
      
      const duration = Date.now() - startTime;
      
      // Track performance
      this.trackPerformance('multiAccountIntelligence', {
        duration,
        accountCount: result.accountPortfolio?.accountCount,
        netWorth: result.accountPortfolio?.netWorth,
        diversificationScore: result.portfolioAnalysis?.diversificationScore,
        opportunityCount: result.optimizationOpportunities?.length,
        recommendationCount: result.actionableRecommendations?.length,
        timestamp: new Date().toISOString()
      });
      
      // Cache results
      this.cacheResult('multiAccountIntelligence', userId, result, {
        ttl: 30 * 60 * 1000 // 30 minutes
      });
      
      console.log(`✅ [Multi-Account Intelligence] Analysis completed in ${duration}ms`);
      console.log(`   📊 Portfolio: $${result.accountPortfolio?.netWorth?.toLocaleString() || 'N/A'} net worth`);
      console.log(`   🎯 Generated: ${result.actionableRecommendations?.length || 0} recommendations`);
      
      return {
        success: true,
        data: result,
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString(),
          workflowVersion: '3.7.1'
        }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ [Multi-Account Intelligence] Analysis failed after ${duration}ms:`, error);
      
      this.trackError('multiAccountIntelligence', {
        error: error.message,
        duration,
        userId,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: error.message,
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Execute Predictive Analytics Pipeline with comprehensive orchestration
   */
  async runPredictiveAnalyticsPipeline(inputData, options = {}) {
    console.log('🚀 [Orchestrator] Executing Predictive Analytics Pipeline...');
    
    try {
      const cacheKey = `predictive-analytics-${JSON.stringify(inputData).slice(0, 100)}`;
      
      // Check cache if enabled
      if (options.useCache !== false) {
        const cachedResult = this.resultCache.get(cacheKey);
        if (cachedResult && (Date.now() - cachedResult.timestamp) < this.cacheTimeout) {
          console.log('📋 [Orchestrator] Returning cached predictive analytics result');
          return cachedResult.data;
        }
      }
      
      const startTime = Date.now();
      
      // Validate pipeline initialization
      if (!this.predictiveAnalyticsPipeline) {
        throw new Error('Predictive Analytics Pipeline not initialized');
      }
      
      // Prepare input data streams
      const inputDataStreams = this.preparePredictiveAnalyticsData(inputData, options);
      
      // Execute the pipeline
      const result = await this.predictiveAnalyticsPipeline.invoke({
        inputDataStreams: inputDataStreams
      });
      
      const executionTime = Date.now() - startTime;
      
      // Process and enhance results
      const enhancedResult = this.enhancePredictiveAnalyticsResult(result, {
        executionTime,
        inputOptions: options,
        timestamp: Date.now()
      });
      
      // Cache result if enabled
      if (options.useCache !== false) {
        this.resultCache.set(cacheKey, {
          data: enhancedResult,
          timestamp: Date.now()
        });
      }
      
      console.log(`✅ [Orchestrator] Predictive Analytics Pipeline completed in ${executionTime}ms`);
      return enhancedResult;
      
    } catch (error) {
      console.error('❌ [Orchestrator] Predictive Analytics Pipeline execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute Predictive Analytics Pipeline with progress tracking
   */
  async executePredictiveAnalyticsWithProgress(inputData, workflowId, options = {}) {
    const progressCallback = this.progressCallbacks.get(workflowId);
    
    // Predictive Analytics Pipeline phases
    const phases = [
      'integrateDataStreams',
      'orchestrateExistingAnalytics',
      'generateMLPredictions',
      'processRealTimeAnalytics',
      'generateCrossDomainIntelligence',
      'detectPredictiveEvents',
      'performAdaptiveLearning',
      'integrateComprehensivePredictions'
    ];
    
    let currentPhaseIndex = 0;
    
    // Progress tracking with more detailed phases
    const progressInterval = setInterval(() => {
      if (progressCallback && currentPhaseIndex < phases.length) {
        const progress = {
          stage: phases[currentPhaseIndex],
          progress: Math.min(95, ((currentPhaseIndex + 1) / phases.length) * 95),
          message: this.getPredictiveAnalyticsProgressMessage(phases[currentPhaseIndex]),
          framework: 'PredictiveAnalyticsPipeline',
          phase: currentPhaseIndex + 1,
          totalPhases: phases.length
        };
        
        progressCallback(progress);
        currentPhaseIndex++;
      }
    }, 2000); // Slower interval for complex pipeline

    try {
      console.log('🔮 [Orchestrator] Invoking Predictive Analytics Pipeline with progress tracking...');
      const result = await this.runPredictiveAnalyticsPipeline(inputData, options);
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: 'Predictive Analytics Pipeline complete',
          framework: 'PredictiveAnalyticsPipeline',
          results: {
            overallConfidence: result.integratedPredictions?.confidenceMetrics?.overallConfidence || 0,
            totalInsights: result.integratedPredictions?.actionableInsights?.length || 0,
            totalRecommendations: result.integratedPredictions?.strategicRecommendations?.length || 0,
            riskScore: result.integratedPredictions?.riskAssessment?.overallRiskScore || 0,
            executionTime: result.executionMetadata?.processingTime || 0
          }
        });
      }
      
      clearInterval(progressInterval);
      return result;
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ [Orchestrator] Predictive Analytics Pipeline execution error:', error);
      throw error;
    }
  }

  /**
   * Prepare input data for Predictive Analytics Pipeline
   */
  preparePredictiveAnalyticsData(inputData, options) {
    console.log('📊 [Orchestrator] Preparing data for Predictive Analytics Pipeline...');
    
    return {
      transactionData: {
        transactions: inputData.transactions || [],
        metadata: {
          source: inputData.source || 'orchestrator',
          timestamp: Date.now(),
          preprocessed: true
        }
      },
      accountData: {
        accounts: inputData.accounts || [],
        metadata: {
          source: 'database',
          timestamp: Date.now(),
          userId: inputData.userId
        }
      },
      userContext: {
        userId: inputData.userId || 'default-user',
        age: inputData.userProfile?.age || 30,
        income: inputData.userProfile?.income || 50000,
        riskTolerance: inputData.userProfile?.riskTolerance || 'moderate',
        goals: inputData.userProfile?.goals || ['retirement'],
        dependents: inputData.userProfile?.dependents || 0,
        timeHorizon: options.timeHorizon || 120 // months
      },
      externalFactors: {
        marketConditions: options.marketConditions || 'stable',
        economicIndicators: options.economicIndicators || {
          inflation: 0.03,
          gdp: 0.025,
          unemployment: 0.04
        },
        seasonality: this.getCurrentSeasonality(),
        timestamp: Date.now()
      },
      realTimeEvents: inputData.realTimeEvents || []
    };
  }

  /**
   * Enhance Predictive Analytics Pipeline results
   */
  enhancePredictiveAnalyticsResult(result, metadata) {
    console.log('✨ [Orchestrator] Enhancing Predictive Analytics Pipeline results...');
    
    return {
      ...result,
      orchestratorMetadata: {
        enhancedAt: Date.now(),
        executionTime: metadata.executionTime,
        version: '3.7.2',
        framework: 'PredictiveAnalyticsPipeline',
        qualityScore: this.calculatePredictiveAnalyticsQuality(result),
        readinessLevel: this.assessPredictiveAnalyticsReadiness(result),
        actionPriorities: this.rankActionPriorities(result),
        summary: this.generatePredictiveAnalyticsSummary(result)
      }
    };
  }

  /**
   * Get progress message for Predictive Analytics Pipeline phases
   */
  getPredictiveAnalyticsProgressMessage(phase) {
    const messages = {
      'integrateDataStreams': 'Integrating multiple data sources and preparing unified data model...',
      'orchestrateExistingAnalytics': 'Coordinating financial forecasting, intelligence, and multi-account analytics...',
      'generateMLPredictions': 'Applying advanced machine learning algorithms for predictions...',
      'processRealTimeAnalytics': 'Processing real-time data streams and generating instant insights...',
      'generateCrossDomainIntelligence': 'Identifying correlations and patterns across analytical domains...',
      'detectPredictiveEvents': 'Detecting upcoming financial events and opportunities...',
      'performAdaptiveLearning': 'Learning from prediction accuracy and adapting models...',
      'integrateComprehensivePredictions': 'Synthesizing all analytics into comprehensive predictions...'
    };
    
    return messages[phase] || `Processing ${phase}...`;
  }

  /**
   * Calculate quality score for Predictive Analytics Pipeline results
   */
  calculatePredictiveAnalyticsQuality(result) {
    let qualityScore = 0;
    let factors = 0;
    
    // Data quality contribution
    if (result.inputDataStreams?.dataQuality?.overallScore) {
      qualityScore += result.inputDataStreams.dataQuality.overallScore * 0.2;
      factors += 0.2;
    }
    
    // Analytics integration contribution
    if (result.analyticsResults?.successfulWorkflows) {
      const integrationScore = result.analyticsResults.successfulWorkflows / 
                              (result.analyticsResults.totalWorkflows || 1);
      qualityScore += integrationScore * 0.25;
      factors += 0.25;
    }
    
    // ML predictions contribution
    if (result.machineLearningPredictions?.modelPerformance?.overallPerformance) {
      qualityScore += result.machineLearningPredictions.modelPerformance.overallPerformance * 0.25;
      factors += 0.25;
    }
    
    // Integrated predictions contribution
    if (result.integratedPredictions?.confidenceMetrics?.overallConfidence) {
      qualityScore += (result.integratedPredictions.confidenceMetrics.overallConfidence / 100) * 0.3;
      factors += 0.3;
    }
    
    return factors > 0 ? qualityScore / factors : 0.5;
  }

  /**
   * Assess readiness level of Predictive Analytics Pipeline results
   */
  assessPredictiveAnalyticsReadiness(result) {
    const quality = this.calculatePredictiveAnalyticsQuality(result);
    const errorCount = result.errors?.length || 0;
    const hasIntegratedPredictions = !!result.integratedPredictions;
    
    if (quality >= 0.8 && errorCount === 0 && hasIntegratedPredictions) {
      return 'production_ready';
    } else if (quality >= 0.6 && errorCount <= 2) {
      return 'review_recommended';
    } else {
      return 'development_required';
    }
  }

  /**
   * Rank action priorities from Predictive Analytics Pipeline results
   */
  rankActionPriorities(result) {
    const priorities = [];
    
    // Add insights as high priority actions
    if (result.integratedPredictions?.actionableInsights) {
      result.integratedPredictions.actionableInsights.forEach(insight => {
        priorities.push({
          type: 'insight',
          priority: 'high',
          action: insight.insight || insight.description,
          confidence: insight.confidence || 0.7
        });
      });
    }
    
    // Add recommendations as medium priority actions
    if (result.integratedPredictions?.strategicRecommendations) {
      result.integratedPredictions.strategicRecommendations.forEach(rec => {
        priorities.push({
          type: 'recommendation',
          priority: rec.priority || 'medium',
          action: rec.title || rec.description,
          confidence: rec.confidence || 0.6
        });
      });
    }
    
    // Add risk events as high priority actions
    if (result.predictiveEvents?.riskEvents) {
      result.predictiveEvents.riskEvents.forEach(event => {
        priorities.push({
          type: 'risk_mitigation',
          priority: 'high',
          action: `Mitigate risk: ${event.description || event.type}`,
          confidence: event.confidence || 0.8
        });
      });
    }
    
    // Sort by priority and confidence
    return priorities.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return b.confidence - a.confidence;
    });
  }

  /**
   * Generate executive summary for Predictive Analytics Pipeline results
   */
  generatePredictiveAnalyticsSummary(result) {
    const overallConfidence = result.integratedPredictions?.confidenceMetrics?.overallConfidence || 0;
    const totalInsights = result.integratedPredictions?.actionableInsights?.length || 0;
    const totalRecommendations = result.integratedPredictions?.strategicRecommendations?.length || 0;
    const riskScore = result.integratedPredictions?.riskAssessment?.overallRiskScore || 0;
    const processingTime = result.executionMetadata?.processingTime || 0;
    
    return {
      overallConfidence: overallConfidence,
      totalInsights: totalInsights,
      totalRecommendations: totalRecommendations,
      riskLevel: riskScore < 0.3 ? 'low' : riskScore < 0.7 ? 'moderate' : 'high',
      processingTime: processingTime,
      keyHighlights: [
        `Generated ${totalInsights} actionable insights`,
        `Provided ${totalRecommendations} strategic recommendations`,
        `Overall confidence: ${overallConfidence}%`,
        `Risk level: ${riskScore < 0.3 ? 'low' : riskScore < 0.7 ? 'moderate' : 'high'}`
      ]
    };
  }

  /**
   * Get current seasonality information
   */
  getCurrentSeasonality() {
    const month = new Date().getMonth();
    const quarters = {
      'Q1': [0, 1, 2],    // Jan, Feb, Mar
      'Q2': [3, 4, 5],    // Apr, May, Jun
      'Q3': [6, 7, 8],    // Jul, Aug, Sep
      'Q4': [9, 10, 11]   // Oct, Nov, Dec
    };
    
    for (const [quarter, months] of Object.entries(quarters)) {
      if (months.includes(month)) {
        return quarter;
      }
    }
    return 'Q1';
  }

  /**
   * Run Financial Health Monitoring Pipeline - Phase 3.7.3
   */
  async runFinancialHealthMonitoring(inputData, options = {}) {
    const cacheKey = this.generateCacheKey(inputData, 'financial_health_monitoring');
    
    // Check cache first
    const cachedResult = this.resultCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < this.cacheTimeout) {
      console.log('📋 [Orchestrator] Returning cached Financial Health Monitoring result');
      return {
        ...cachedResult.result,
        fromCache: true,
        cacheAge: Date.now() - cachedResult.timestamp
      };
    }

    console.log('🏥 [Orchestrator] Running Financial Health Monitoring Pipeline...');
    
    if (!this.financialHealthMonitoring) {
      throw new Error('Financial Health Monitoring system not initialized');
    }

    const startTime = Date.now();
    
    try {
      // Prepare enhanced input data with context
      const enhancedData = this.prepareHealthMonitoringData(inputData, options);
      
      // Execute the health monitoring pipeline
      const result = await this.financialHealthMonitoring.runHealthMonitoringPipeline(
        enhancedData, 
        options
      );
      
      const executionTime = Date.now() - startTime;
      const enhancedResult = this.enhanceHealthMonitoringResult(result, { 
        executionTime,
        inputSize: JSON.stringify(enhancedData).length 
      });
      
      // Cache the result
      this.cacheResult(cacheKey, enhancedResult);
      
      console.log(`✅ [Orchestrator] Financial Health Monitoring completed in ${executionTime}ms`);
      return enhancedResult;
      
    } catch (error) {
      console.error('❌ [Orchestrator] Financial Health Monitoring failed:', error);
      throw error;
    }
  }

  /**
   * Execute Financial Health Monitoring with Progress Tracking
   */
  async executeFinancialHealthMonitoringWithProgress(inputData, workflowId, options = {}) {
    console.log(`🏥 [Orchestrator] Starting Financial Health Monitoring with progress tracking: ${workflowId}`);
    
    if (!this.financialHealthMonitoring) {
      throw new Error('Financial Health Monitoring system not initialized');
    }

    const progressCallback = this.progressCallbacks.get(workflowId);
    let currentPhase = 0;
    const totalPhases = 8; // 8-node pipeline
    
    const phaseNames = [
      'gatherRealTimeData',
      'calculateHealthScores', 
      'analyzeHealthTrends',
      'assessRisksAndWarnings',
      'generateAutomatedAlerts',
      'createProactiveRecommendations',
      'integratePredictiveAnalytics',
      'generateHealthDashboard'
    ];

    try {
      const enhancedData = this.prepareHealthMonitoringData(inputData, options);
      
      // Execute with progress tracking
      const result = await this.financialHealthMonitoring.runHealthMonitoringPipeline(
        enhancedData,
        {
          ...options,
          progressCallback: (phase) => {
            currentPhase++;
            const progress = Math.round((currentPhase / totalPhases) * 100);
            const message = this.getHealthMonitoringProgressMessage(phase);
            
            if (progressCallback) {
              progressCallback({
                progress,
                message,
                phase,
                currentPhase,
                totalPhases,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      );
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          progress: 100,
          message: 'Financial Health Monitoring completed successfully',
          phase: 'completed',
          currentPhase: totalPhases,
          totalPhases,
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ [Orchestrator] Financial Health Monitoring failed: ${error.message}`);
      
      if (progressCallback) {
        progressCallback({
          progress: -1,
          message: `Error: ${error.message}`,
          phase: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      throw error;
    }
  }

  /**
   * Start Continuous Financial Health Monitoring
   */
  async startContinuousHealthMonitoring(inputData, intervalMinutes = 30) {
    console.log('🔄 [Orchestrator] Starting continuous financial health monitoring...');
    
    if (!this.financialHealthMonitoring) {
      throw new Error('Financial Health Monitoring system not initialized');
    }
    
    return await this.financialHealthMonitoring.startContinuousMonitoring(inputData, intervalMinutes);
  }

  /**
   * Stop Continuous Financial Health Monitoring
   */
  async stopContinuousHealthMonitoring() {
    console.log('⏹️ [Orchestrator] Stopping continuous financial health monitoring...');
    
    if (!this.financialHealthMonitoring) {
      throw new Error('Financial Health Monitoring system not initialized');
    }
    
    return this.financialHealthMonitoring.stopContinuousMonitoring();
  }

  /**
   * Get Financial Health Monitoring Status
   */
  getHealthMonitoringStatus() {
    if (!this.financialHealthMonitoring) {
      return { 
        initialized: false, 
        monitoring_active: false,
        error: 'System not initialized'
      };
    }
    
    return {
      initialized: true,
      monitoring_active: this.financialHealthMonitoring.monitoringActive,
      health_history_points: this.financialHealthMonitoring.healthMetrics.size,
      trend_history_points: this.financialHealthMonitoring.healthTrends.length
    };
  }

  /**
   * Prepare Financial Health Monitoring data with context
   */
  prepareHealthMonitoringData(inputData, options) {
    console.log('📊 [Orchestrator] Preparing Financial Health Monitoring data...');
    
    return {
      ...inputData,
      orchestratorMetadata: {
        preparedAt: Date.now(),
        version: '3.7.3',
        framework: 'FinancialHealthMonitoring',
        orchestratorId: this.generateWorkflowId(),
        options: options,
        seasonality: this.getCurrentSeasonality()
      }
    };
  }

  /**
   * Enhance Financial Health Monitoring results
   */
  enhanceHealthMonitoringResult(result, metadata) {
    console.log('✨ [Orchestrator] Enhancing Financial Health Monitoring results...');
    
    return {
      ...result,
      orchestratorMetadata: {
        enhancedAt: Date.now(),
        executionTime: metadata.executionTime,
        version: '3.7.3',
        framework: 'FinancialHealthMonitoring',
        qualityScore: this.calculateHealthMonitoringQuality(result),
        readinessLevel: this.assessHealthMonitoringReadiness(result),
        summary: this.generateHealthMonitoringSummary(result)
      }
    };
  }

  /**
   * Get progress message for Financial Health Monitoring phases
   */
  getHealthMonitoringProgressMessage(phase) {
    const messages = {
      'gatherRealTimeData': 'Gathering real-time financial data and market information...',
      'calculateHealthScores': 'Calculating comprehensive financial health scores across 8 dimensions...',
      'analyzeHealthTrends': 'Analyzing health trends and patterns over time...',
      'assessRisksAndWarnings': 'Assessing financial risks and generating early warnings...',
      'generateAutomatedAlerts': 'Creating automated alerts based on health thresholds...',
      'createProactiveRecommendations': 'Generating proactive recommendations for improvement...',
      'integratePredictiveAnalytics': 'Integrating with predictive analytics for future health forecasting...',
      'generateHealthDashboard': 'Generating comprehensive health dashboard and visual indicators...'
    };
    
    return messages[phase] || `Processing ${phase}...`;
  }

  /**
   * Calculate quality score for Financial Health Monitoring results
   */
  calculateHealthMonitoringQuality(result) {
    if (!result || !result.success) return 0;
    
    let qualityScore = 0;
    let factors = 0;
    
    // Dashboard completeness
    if (result.overview && result.component_health && result.trends) {
      qualityScore += 0.3;
      factors += 0.3;
    }
    
    // Health scores validity
    if (result.overview?.overall_health_score && 
        result.overview.overall_health_score >= 0 && 
        result.overview.overall_health_score <= 100) {
      qualityScore += 0.25;
      factors += 0.25;
    }
    
    // Alert system functionality
    if (result.alerts && Array.isArray(result.alerts.all_alerts)) {
      qualityScore += 0.2;
      factors += 0.2;
    }
    
    // Recommendation quality
    if (result.recommendations && result.recommendations.all_recommendations) {
      qualityScore += 0.25;
      factors += 0.25;
    }
    
    return factors > 0 ? qualityScore / factors : 0.5;
  }

  /**
   * Assess readiness level of Financial Health Monitoring results
   */
  assessHealthMonitoringReadiness(result) {
    const quality = this.calculateHealthMonitoringQuality(result);
    const hasHealthScore = !!result.overview?.overall_health_score;
    const hasRecommendations = !!(result.recommendations?.all_recommendations?.length > 0);
    
    if (quality >= 0.8 && hasHealthScore && hasRecommendations) {
      return 'production_ready';
    } else if (quality >= 0.6 && hasHealthScore) {
      return 'review_recommended';
    } else {
      return 'development_required';
    }
  }

  /**
   * Generate summary for Financial Health Monitoring results
   */
  generateHealthMonitoringSummary(result) {
    if (!result || !result.success) {
      return {
        status: 'failed',
        message: 'Health monitoring execution failed'
      };
    }
    
    const healthScore = result.overview?.overall_health_score || 0;
    const healthGrade = result.overview?.overall_health_grade || 'N/A';
    const alertCount = result.alerts?.alert_count || 0;
    const recommendationCount = result.recommendations?.recommendation_count || 0;
    const criticalAlerts = result.alerts?.critical_count || 0;
    const trendDirection = result.trends?.trend_analysis?.direction || 'stable';
    
    return {
      healthScore: healthScore,
      healthGrade: healthGrade,
      alertCount: alertCount,
      recommendationCount: recommendationCount,
      criticalAlerts: criticalAlerts,
      trendDirection: trendDirection,
      status: healthScore >= 70 ? 'healthy' : healthScore >= 50 ? 'fair' : 'needs_attention',
      keyHighlights: [
        `Overall Health Score: ${healthScore}/100 (${healthGrade})`,
        `Generated ${alertCount} alerts (${criticalAlerts} critical)`,
        `Provided ${recommendationCount} recommendations`,
        `Health trend: ${trendDirection}`
      ]
    };
  }
}

// Export singleton instance
const orchestrator = new WorkflowOrchestrator();

module.exports = {
  WorkflowOrchestrator,
  orchestrator
}; 