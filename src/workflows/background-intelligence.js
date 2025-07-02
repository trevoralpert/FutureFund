/**
 * Background Intelligence System - Phase 3.5.3
 * Continuous financial monitoring with proactive alerts and insights
 * Runs autonomously to provide real-time financial intelligence
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { createFinancialIntelligenceWorkflow } = require('./financial-intelligence');
const config = require('../config');

/**
 * Background Intelligence State Schema
 * Manages continuous monitoring state and alert generation
 */
const backgroundIntelligenceState = {
  channels: {
    // Monitoring configuration
    monitoringConfig: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        enabled: true,
        interval: 60000, // 60 seconds default
        alertThresholds: {
          highRiskAnomaly: 0.7,
          healthScoreDrop: 0.3,
          unusualSpending: 2.5, // Standard deviations
          largeTransaction: 500 // USD
        },
        monitoringTypes: ['anomalies', 'health', 'patterns', 'insights']
      })
    },
    
    // Latest financial data snapshot
    currentSnapshot: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Historical snapshots for comparison
    historicalSnapshots: {
      value: (x, y) => y ?? x ?? [...(x || [])],
      default: () => []
    },
    
    // Active alerts
    activeAlerts: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    },
    
    // Monitoring insights
    insights: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    },
    
    // System status
    systemStatus: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        isRunning: false,
        lastUpdate: null,
        updateCount: 0,
        errorCount: 0,
        startTime: null
      })
    },
    
    // Execution metadata
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        workflowId: `bg-intel-${Date.now()}`,
        version: '3.5.3',
        framework: 'BackgroundIntelligence',
        mode: 'continuous'
      })
    },
    
    // Error tracking
    errors: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    }
  }
};

// === WORKFLOW NODE IMPLEMENTATIONS ===

/**
 * Initialize Background Monitoring
 * Sets up the continuous monitoring system
 */
async function initializeBackgroundMonitoring(state) {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Background Intelligence: Initializing monitoring system...');
    
    // Update system status
    const systemStatus = {
      ...state.systemStatus,
      isRunning: true,
      startTime: startTime,
      lastUpdate: startTime
    };
    
    // Log initialization
    const executionMetadata = {
      ...state.executionMetadata,
      initTime: startTime,
      phases: [...(state.executionMetadata.phases || []), 'initialization']
    };
    
    console.log('✅ Background Intelligence: Monitoring system initialized');
    
    return {
      systemStatus,
      executionMetadata
    };
    
  } catch (error) {
    console.error('❌ Background Intelligence: Initialization failed:', error);
    return {
      errors: [{
        phase: 'initialization',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Load Financial Data Snapshot
 * Retrieves current financial data for analysis
 */
async function loadFinancialSnapshot(state) {
  try {
    console.log('📊 Background Intelligence: Loading financial data snapshot...');
    
    // In a real implementation, this would connect to the database
    // For now, we'll simulate with sample data
    const currentSnapshot = {
      timestamp: Date.now(),
      transactionCount: 0,
      accountCount: 0,
      totalBalance: 0,
      lastTransactionDate: null,
      // This would be populated with real data in production
      rawData: []
    };
    
    // Add to historical snapshots (keep last 100)
    const historicalSnapshots = [
      ...state.historicalSnapshots.slice(-99),
      currentSnapshot
    ];
    
    console.log('✅ Background Intelligence: Financial snapshot loaded');
    
    return {
      currentSnapshot,
      historicalSnapshots
    };
    
  } catch (error) {
    console.error('❌ Background Intelligence: Snapshot loading failed:', error);
    return {
      errors: [{
        phase: 'snapshot_loading',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Run Intelligent Analysis
 * Executes the Financial Intelligence workflow on current data
 */
async function runIntelligentAnalysis(state) {
  try {
    console.log('🧠 Background Intelligence: Running intelligent analysis...');
    
    // Skip analysis if no data
    if (!state.currentSnapshot || !state.currentSnapshot.rawData || state.currentSnapshot.rawData.length === 0) {
      console.log('⚠️ Background Intelligence: No transaction data for analysis');
      return {
        insights: [{
          type: 'info',
          message: 'No transaction data available for analysis',
          timestamp: Date.now(),
          confidence: 1.0
        }]
      };
    }
    
    // Run the Financial Intelligence workflow
    const WorkflowOrchestrator = require('./workflow-orchestrator');
    const orchestrator = new WorkflowOrchestrator();
    
    const analysisResult = await orchestrator.executeFinancialIntelligenceWorkflow(
      state.currentSnapshot.rawData
    );
    
    if (analysisResult && analysisResult.success) {
      console.log('✅ Background Intelligence: Analysis completed successfully');
      
      return {
        insights: [{
          type: 'analysis_complete',
          message: 'Financial intelligence analysis completed',
          data: analysisResult.data,
          timestamp: Date.now(),
          confidence: analysisResult.confidence || 0.8
        }]
      };
    } else {
      throw new Error('Financial Intelligence workflow failed');
    }
    
  } catch (error) {
    console.error('❌ Background Intelligence: Analysis failed:', error);
    return {
      errors: [{
        phase: 'intelligent_analysis',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Detect Alert Conditions
 * Analyzes data for conditions requiring user attention
 */
async function detectAlertConditions(state) {
  try {
    console.log('🚨 Background Intelligence: Detecting alert conditions...');
    
    const alerts = [];
    const config = state.monitoringConfig;
    
    // Check for analysis-based alerts
    if (state.insights && state.insights.length > 0) {
      const latestInsight = state.insights[state.insights.length - 1];
      
      if (latestInsight.type === 'analysis_complete' && latestInsight.data) {
        const analysisData = latestInsight.data;
        
        // High-risk anomaly alert
        if (analysisData.anomalies && analysisData.anomalies.high && analysisData.anomalies.high.length > 0) {
          alerts.push({
            id: `anomaly-${Date.now()}`,
            type: 'high_risk_anomaly',
            severity: 'high',
            title: 'High-Risk Financial Anomaly Detected',
            message: `${analysisData.anomalies.high.length} high-risk anomalies detected in your recent transactions`,
            timestamp: Date.now(),
            data: analysisData.anomalies.high,
            actionRequired: true
          });
        }
        
        // Low health score alert
        if (analysisData.healthScore && analysisData.healthScore.overall < 2.5) {
          alerts.push({
            id: `health-${Date.now()}`,
            type: 'low_health_score',
            severity: 'medium',
            title: 'Financial Health Score Alert',
            message: `Your financial health score is ${analysisData.healthScore.overall.toFixed(1)}/5.0 (${analysisData.healthScore.grade})`,
            timestamp: Date.now(),
            data: analysisData.healthScore,
            actionRequired: false
          });
        }
        
        // Large transaction alert
        if (analysisData.patterns && analysisData.patterns.amounts && analysisData.patterns.amounts.max > config.alertThresholds.largeTransaction) {
          alerts.push({
            id: `large-transaction-${Date.now()}`,
            type: 'large_transaction',
            severity: 'low',
            title: 'Large Transaction Detected',
            message: `Large transaction of $${analysisData.patterns.amounts.max.toFixed(2)} detected`,
            timestamp: Date.now(),
            data: { amount: analysisData.patterns.amounts.max },
            actionRequired: false
          });
        }
      }
    }
    
    // System health alerts
    if (state.systemStatus.errorCount > 5) {
      alerts.push({
        id: `system-errors-${Date.now()}`,
        type: 'system_health',
        severity: 'medium',
        title: 'System Error Alert',
        message: `${state.systemStatus.errorCount} errors detected in background monitoring`,
        timestamp: Date.now(),
        actionRequired: true
      });
    }
    
    console.log(`✅ Background Intelligence: ${alerts.length} alerts detected`);
    
    return {
      activeAlerts: alerts
    };
    
  } catch (error) {
    console.error('❌ Background Intelligence: Alert detection failed:', error);
    return {
      errors: [{
        phase: 'alert_detection',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Generate Proactive Insights
 * Creates actionable insights and recommendations
 */
async function generateProactiveInsights(state) {
  try {
    console.log('💡 Background Intelligence: Generating proactive insights...');
    
    const proactiveInsights = [];
    
    // Historical comparison insights
    if (state.historicalSnapshots.length >= 2) {
      const current = state.historicalSnapshots[state.historicalSnapshots.length - 1];
      const previous = state.historicalSnapshots[state.historicalSnapshots.length - 2];
      
      if (current.transactionCount > previous.transactionCount) {
        proactiveInsights.push({
          type: 'transaction_increase',
          message: `Transaction activity increased by ${current.transactionCount - previous.transactionCount} transactions`,
          timestamp: Date.now(),
          confidence: 0.9,
          actionable: false
        });
      }
      
      if (current.totalBalance !== previous.totalBalance) {
        const change = current.totalBalance - previous.totalBalance;
        proactiveInsights.push({
          type: 'balance_change',
          message: `Account balance ${change > 0 ? 'increased' : 'decreased'} by $${Math.abs(change).toFixed(2)}`,
          timestamp: Date.now(),
          confidence: 1.0,
          actionable: change < -100 // Actionable if significant decrease
        });
      }
    }
    
    // System performance insights
    const uptime = Date.now() - state.systemStatus.startTime;
    if (uptime > 3600000) { // 1 hour
      proactiveInsights.push({
        type: 'system_uptime',
        message: `Background monitoring has been running for ${Math.floor(uptime / 3600000)} hours with ${state.systemStatus.updateCount} updates`,
        timestamp: Date.now(),
        confidence: 1.0,
        actionable: false
      });
    }
    
    // Alert summary insight
    if (state.activeAlerts && state.activeAlerts.length > 0) {
      const highSeverityAlerts = state.activeAlerts.filter(a => a.severity === 'high').length;
      proactiveInsights.push({
        type: 'alert_summary',
        message: `${state.activeAlerts.length} total alerts (${highSeverityAlerts} high priority)`,
        timestamp: Date.now(),
        confidence: 1.0,
        actionable: highSeverityAlerts > 0
      });
    }
    
    console.log(`✅ Background Intelligence: ${proactiveInsights.length} proactive insights generated`);
    
    return {
      insights: proactiveInsights
    };
    
  } catch (error) {
    console.error('❌ Background Intelligence: Insight generation failed:', error);
    return {
      errors: [{
        phase: 'proactive_insights',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Update Monitoring Status
 * Updates system status and prepares for next cycle
 */
async function updateMonitoringStatus(state) {
  try {
    console.log('📊 Background Intelligence: Updating monitoring status...');
    
    const now = Date.now();
    const systemStatus = {
      ...state.systemStatus,
      lastUpdate: now,
      updateCount: (state.systemStatus.updateCount || 0) + 1,
      errorCount: state.errors.length
    };
    
    const executionMetadata = {
      ...state.executionMetadata,
      completedPhases: ['initialization', 'snapshot_loading', 'intelligent_analysis', 'alert_detection', 'proactive_insights', 'status_update'],
      completionTime: now,
      totalDuration: now - (state.executionMetadata.initTime || now)
    };
    
    console.log('✅ Background Intelligence: Monitoring status updated');
    console.log(`📈 Update #${systemStatus.updateCount} completed in ${executionMetadata.totalDuration}ms`);
    
    return {
      systemStatus,
      executionMetadata
    };
    
  } catch (error) {
    console.error('❌ Background Intelligence: Status update failed:', error);
    return {
      errors: [{
        phase: 'status_update',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

// === LANGGRAPH WORKFLOW CREATION ===

/**
 * Create Background Intelligence Workflow
 * 6-node workflow for continuous financial monitoring
 */
function createBackgroundIntelligenceWorkflow() {
  try {
    console.log('🏗️ Creating Background Intelligence workflow...');
    
    // Create the StateGraph with our state schema
    const workflow = new StateGraph(backgroundIntelligenceState)
      .addNode("initializeMonitoring", initializeBackgroundMonitoring)
      .addNode("loadSnapshot", loadFinancialSnapshot)
      .addNode("runAnalysis", runIntelligentAnalysis)
      .addNode("detectAlerts", detectAlertConditions)
      .addNode("generateInsights", generateProactiveInsights)
      .addNode("updateStatus", updateMonitoringStatus)
      .addEdge(START, "initializeMonitoring")
      .addEdge("initializeMonitoring", "loadSnapshot")
      .addEdge("loadSnapshot", "runAnalysis")
      .addEdge("runAnalysis", "detectAlerts")
      .addEdge("detectAlerts", "generateInsights")
      .addEdge("generateInsights", "updateStatus")
      .addEdge("updateStatus", END);
    
    const compiledWorkflow = workflow.compile();
    
    console.log('✅ Background Intelligence workflow created successfully');
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ Failed to create Background Intelligence workflow:', error);
    throw error;
  }
}

// === BACKGROUND INTELLIGENCE MANAGER ===

/**
 * Background Intelligence Manager Class
 * Manages continuous monitoring and automated execution
 */
class BackgroundIntelligenceManager {
  constructor(options = {}) {
    this.workflow = null;
    this.isRunning = false;
    this.intervalId = null;
    this.currentState = null;
    this.eventListeners = new Map();
    
    // Configuration
    this.config = {
      interval: options.interval || 60000, // 60 seconds default
      autoStart: options.autoStart || false,
      maxHistorySize: options.maxHistorySize || 100,
      alertCallback: options.alertCallback || null,
      insightCallback: options.insightCallback || null
    };
    
    // Initialize workflow
    this.initializeWorkflow();
    
    if (this.config.autoStart) {
      this.start();
    }
  }
  
  initializeWorkflow() {
    try {
      this.workflow = createBackgroundIntelligenceWorkflow();
      console.log('✅ Background Intelligence Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Background Intelligence Manager:', error);
      throw error;
    }
  }
  
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Background Intelligence already running');
      return;
    }
    
    console.log('🚀 Starting Background Intelligence monitoring...');
    this.isRunning = true;
    
    // Run initial execution
    await this.executeMonitoringCycle();
    
    // Set up interval for continuous monitoring
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.executeMonitoringCycle();
      }
    }, this.config.interval);
    
    console.log(`✅ Background Intelligence started with ${this.config.interval}ms interval`);
  }
  
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ Background Intelligence not running');
      return;
    }
    
    console.log('🛑 Stopping Background Intelligence monitoring...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('✅ Background Intelligence stopped');
  }
  
  async executeMonitoringCycle() {
    try {
      console.log('🔄 Background Intelligence: Executing monitoring cycle...');
      const startTime = Date.now();
      
      // Execute the workflow
      const result = await this.workflow.invoke({});
      
      // Update current state
      this.currentState = result;
      
      // Handle alerts
      if (result.activeAlerts && result.activeAlerts.length > 0) {
        this.handleAlerts(result.activeAlerts);
      }
      
      // Handle insights
      if (result.insights && result.insights.length > 0) {
        this.handleInsights(result.insights);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Background Intelligence: Monitoring cycle completed in ${duration}ms`);
      
      // Emit cycle complete event
      this.emit('cycleComplete', { duration, result });
      
      return result;
      
    } catch (error) {
      console.error('❌ Background Intelligence: Monitoring cycle failed:', error);
      this.emit('error', error);
      throw error;
    }
  }
  
  handleAlerts(alerts) {
    console.log(`🚨 Background Intelligence: Processing ${alerts.length} alerts`);
    
    alerts.forEach(alert => {
      console.log(`   • ${alert.severity.toUpperCase()}: ${alert.title}`);
      
      // Call custom alert callback if provided
      if (this.config.alertCallback) {
        this.config.alertCallback(alert);
      }
      
      // Emit alert event
      this.emit('alert', alert);
    });
  }
  
  handleInsights(insights) {
    console.log(`💡 Background Intelligence: Processing ${insights.length} insights`);
    
    insights.forEach(insight => {
      console.log(`   • ${insight.type}: ${insight.message}`);
      
      // Call custom insight callback if provided
      if (this.config.insightCallback) {
        this.config.insightCallback(insight);
      }
      
      // Emit insight event
      this.emit('insight', insight);
    });
  }
  
  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }
  
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  // Status methods
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.config.interval,
      currentState: this.currentState,
      uptime: this.currentState?.systemStatus?.startTime ? 
        Date.now() - this.currentState.systemStatus.startTime : 0
    };
  }
  
  getAlerts() {
    return this.currentState?.activeAlerts || [];
  }
  
  getInsights() {
    return this.currentState?.insights || [];
  }
}

module.exports = {
  createBackgroundIntelligenceWorkflow,
  BackgroundIntelligenceManager,
  backgroundIntelligenceState
}; 