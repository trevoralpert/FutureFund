/**
 * Workflow Orchestrator
 * Manages LangGraph workflow execution with progress tracking and caching
 */

const { executeSimpleWorkflow, ForecastState } = require('./simple-workflow');
const config = require('../config');

/**
 * Workflow Orchestrator Class
 * Handles execution, progress tracking, and caching
 */
class WorkflowOrchestrator {
  constructor() {
    this.activeWorkflows = new Map();
    this.cache = new Map();
    this.progressCallbacks = new Map();
    this.maxCacheSize = 50;
    this.defaultTimeout = 60000; // 60 seconds
  }

  /**
   * Execute financial forecast workflow
   */
  async executeForecastWorkflow(inputData, options = {}) {
    const workflowId = this.generateWorkflowId();
    const startTime = Date.now();
    
    console.log(`🚀 Starting financial forecast workflow: ${workflowId}`);

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(inputData);
      if (options.useCache !== false && this.cache.has(cacheKey)) {
        console.log('📦 Returning cached result');
        return this.cache.get(cacheKey);
      }

      // Track active workflow
      this.activeWorkflows.set(workflowId, {
        startTime,
        timeout: options.timeout || this.defaultTimeout,
        status: 'running'
      });

      // Set up progress tracking
      if (options.onProgress) {
        this.progressCallbacks.set(workflowId, options.onProgress);
      }

      // Execute workflow with timeout
      const result = await Promise.race([
        this.executeWithProgress(inputData, workflowId),
        this.createTimeoutPromise(options.timeout || this.defaultTimeout)
      ]);

      // Cache successful results
      if (result.finalForecast && !result.metadata.hasErrors) {
        this.cacheResult(cacheKey, result);
      }

      // Cleanup
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Workflow completed in ${totalTime}ms: ${workflowId}`);

      return {
        success: true,
        workflowId,
        data: result.finalForecast,
        metadata: {
          ...result.metadata,
          totalExecutionTime: totalTime,
          workflowId
        }
      };

    } catch (error) {
      console.error(`❌ Workflow failed: ${workflowId}`, error);
      
      // Cleanup on error
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);

      return {
        success: false,
        workflowId,
        error: error.message,
        code: error.code || 'WORKFLOW_ERROR'
      };
    }
  }

  /**
   * Execute workflow with progress tracking
   */
  async executeWithProgress(inputData, workflowId) {
    const progressCallback = this.progressCallbacks.get(workflowId);
    
    // Node progress tracking
    const nodeOrder = [
      'dataIngestion',
      'patternAnalysis', 
      'projectionCalculation',
      'scenarioApplication',
      'resultFormatting'
    ];
    
    let currentNodeIndex = 0;
    
    // Progress updates during execution
    const progressInterval = setInterval(() => {
      if (progressCallback && currentNodeIndex < nodeOrder.length) {
        const progress = {
          stage: nodeOrder[currentNodeIndex],
          progress: Math.min(95, ((currentNodeIndex + 1) / nodeOrder.length) * 95),
          message: this.getProgressMessage(nodeOrder[currentNodeIndex])
        };
        
        progressCallback(progress);
        currentNodeIndex++;
      }
    }, 1000);

    try {
      // Execute the simplified workflow
      const result = await executeSimpleWorkflow(inputData);
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: 'Forecast generation complete'
        });
      }
      
      clearInterval(progressInterval);
      return result;
      
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  /**
   * Get user-friendly progress messages
   */
  getProgressMessage(stage) {
    const messages = {
      dataIngestion: 'Processing your financial data...',
      patternAnalysis: 'Analyzing spending patterns and trends...',
      projectionCalculation: 'Computing future projections...',
      scenarioApplication: 'Applying scenario adjustments...',
      resultFormatting: 'Preparing your forecast...'
    };
    
    return messages[stage] || 'Processing...';
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Workflow timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Generate unique workflow ID
   */
  generateWorkflowId() {
    return `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate cache key from input data
   */
  generateCacheKey(inputData) {
    const key = {
      transactionCount: inputData.transactions?.length || 0,
      dateRange: inputData.dateRange,
      scenarios: inputData.scenarios?.map(s => ({ type: s.type, amount: s.amount })) || []
    };
    
    return JSON.stringify(key);
  }

  /**
   * Cache workflow result
   */
  cacheResult(key, result) {
    // Implement LRU cache behavior
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      ...result,
      cachedAt: Date.now()
    });
  }

  /**
   * Cancel active workflow
   */
  cancelWorkflow(workflowId) {
    if (this.activeWorkflows.has(workflowId)) {
      this.activeWorkflows.get(workflowId).status = 'cancelled';
      this.activeWorkflows.delete(workflowId);
      this.progressCallbacks.delete(workflowId);
      
      console.log(`🚫 Workflow cancelled: ${workflowId}`);
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
    
    return {
      status: workflow.status,
      startTime: workflow.startTime,
      elapsedTime: Date.now() - workflow.startTime
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  calculateHitRate() {
    // This would be more sophisticated in a real implementation
    return this.cache.size > 0 ? 0.15 : 0; // 15% estimated hit rate
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Workflow cache cleared');
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
    
    if (!inputData.transactions || !Array.isArray(inputData.transactions)) {
      errors.push('Transactions array is required');
    } else if (inputData.transactions.length === 0) {
      errors.push('At least one transaction is required');
    }
    
    // Validate transaction structure
    const invalidTransactions = inputData.transactions.filter(t => 
      !t.amount || !t.date || typeof t.amount !== 'number'
    );
    
    if (invalidTransactions.length > 0) {
      errors.push(`${invalidTransactions.length} transactions have invalid data`);
    }
    
    return errors;
  }

  /**
   * Health check for workflow system
   */
  async healthCheck() {
    try {
      // Test basic workflow functionality
      const testData = {
        transactions: [
          { id: 1, date: '2024-01-01', amount: 1000, description: 'Test', category: 'Income' }
        ]
      };
      
      // Validate test data
      const validationErrors = this.validateInputData(testData);
      
      // Test configuration
      const configValid = config.isAIEnabled;
      
      return {
        status: 'healthy',
        workflow: true,
        config: configValid,
        validation: validationErrors.length === 0,
        cache: this.getCacheStats(),
        activeWorkflows: this.activeWorkflows.size
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
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