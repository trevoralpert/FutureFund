/**
 * Enhanced AI Chat Service with LangGraph Workflow Integration
 * Routes user questions to appropriate workflows and provides sophisticated responses
 */

const { OpenAI } = require("openai");
const config = require('../config');
const { WorkflowOrchestrator } = require('../workflows/workflow-orchestrator');

/**
 * Enhanced Chat Service with Workflow Integration
 */
class EnhancedChatService {
  constructor() {
    this.orchestrator = new WorkflowOrchestrator();
    this.openai = null;
    this.isInitialized = false;
    this.conversationHistory = [];
    this.maxHistory = 20;
    this.sessionId = this.generateSessionId();
    this.progressCallbacks = new Map();
  }
  
  async initialize() {
    if (!config.isAIEnabled) {
      throw new Error('AI features not enabled. Please configure OpenAI API key.');
    }
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    });
    
    this.isInitialized = true;
    console.log('✅ Enhanced Chat Service initialized');
  }
  
  /**
   * Process user message with intelligent workflow routing
   */
  async sendMessage(userMessage, financialContext = null, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Add user message to history
      this.addToHistory('user', userMessage);
      
      // Route query to appropriate workflow
      const routing = this.routeQuery(userMessage, financialContext);
      console.log(`🧠 Query routed to: ${routing.primaryWorkflow} (confidence: ${routing.confidence.toFixed(2)})`);
      
      // Execute workflow-specific processing
      const result = await this.executeWorkflow(routing, userMessage, financialContext, options);
      
      // Add response to history
      this.addToHistory('assistant', result.response);
      
      return {
        success: true,
        response: result.response,
        workflow: routing.primaryWorkflow,
        confidence: routing.confidence,
        sessionId: this.sessionId,
        workflowData: result.workflowData,
        metadata: result.metadata
      };
      
    } catch (error) {
      console.error('Enhanced chat error:', error);
      return {
        success: false,
        error: error.message,
        fallback: await this.generateFallbackResponse(userMessage)
      };
    }
  }
  
  /**
   * Route user query to appropriate workflow
   */
  routeQuery(query, context = {}) {
    const queryLower = query.toLowerCase();
    
    // Intelligence patterns
    if (/analyze|analysis|pattern|trend|insight|understand|explain|why|how|spending|expense|income|budget|performance|efficiency|optimization|recommendation/i.test(queryLower)) {
      return { primaryWorkflow: 'intelligence', confidence: 0.8 };
    }
    
    // Forecasting patterns
    if (/forecast|predict|project|future|will have|expect|estimate|next year|next month|by \d+|in \d+ years|timeline|when|save|savings|retire|retirement|goal|target/i.test(queryLower)) {
      return { primaryWorkflow: 'forecast', confidence: 0.9 };
    }
    
    // Scenario patterns
    if (/what if|scenario|suppose|assume|change|impact|effect|raise|promotion|job|career|salary increase|pay increase|house|home|buy|purchase|mortgage|rent|move|emergency|unexpected|crisis|layoff|medical/i.test(queryLower)) {
      return { primaryWorkflow: 'scenario', confidence: 0.9 };
    }
    
    // Health patterns
    if (/health|score|rating|grade|assessment|status|debt|credit|ratio|emergency fund|liquidity|warning|alert|risk|danger|problem|issue/i.test(queryLower)) {
      return { primaryWorkflow: 'health', confidence: 0.8 };
    }
    
    // Multi-account patterns
    if (/account|portfolio|allocation|diversification|balance|transfer|move money|consolidate|optimize accounts|checking|savings|investment|retirement|401k|ira/i.test(queryLower)) {
      return { primaryWorkflow: 'multiAccount', confidence: 0.7 };
    }
    
    // Predictive patterns
    if (/predict|likelihood|probability|chances|odds|market|economy|inflation|recession|growth|investment|return|performance|volatility/i.test(queryLower)) {
      return { primaryWorkflow: 'predictive', confidence: 0.8 };
    }
    
    // Default to intelligence workflow
    return { primaryWorkflow: 'intelligence', confidence: 0.6 };
  }
  
  /**
   * Execute the appropriate workflow based on routing
   */
  async executeWorkflow(routing, userMessage, financialContext, options) {
    const workflowId = this.generateWorkflowId();
    
    try {
      switch (routing.primaryWorkflow) {
        case 'intelligence':
          return await this.executeIntelligenceWorkflow(userMessage, financialContext, workflowId, options);
          
        case 'forecast':
          return await this.executeForecastWorkflow(userMessage, financialContext, workflowId, options);
          
        case 'scenario':
          return await this.executeScenarioWorkflow(userMessage, financialContext, workflowId, options);
          
        case 'health':
          return await this.executeHealthWorkflow(userMessage, financialContext, workflowId, options);
          
        case 'multiAccount':
          return await this.executeMultiAccountWorkflow(userMessage, financialContext, workflowId, options);
          
        case 'predictive':
          return await this.executePredictiveWorkflow(userMessage, financialContext, workflowId, options);
          
        default:
          return await this.executeIntelligenceWorkflow(userMessage, financialContext, workflowId, options);
      }
    } catch (error) {
      console.error(`Workflow execution error (${routing.primaryWorkflow}):`, error);
      // Fallback to intelligence workflow
      return await this.executeIntelligenceWorkflow(userMessage, financialContext, workflowId, options);
    }
  }
  
  /**
   * Execute Financial Intelligence workflow
   */
  async executeIntelligenceWorkflow(userMessage, financialContext, workflowId, options) {
    const inputData = {
      query: userMessage,
      context: financialContext,
      conversationHistory: this.getRecentHistory(),
      analysisType: 'comprehensive',
      includeRecommendations: true
    };
    
    const result = await this.orchestrator.executeFinancialIntelligenceWorkflow(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatIntelligenceResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'intelligence',
        workflowId,
        analysisDepth: result.analysisDepth,
        insightCount: result.insights?.length || 0
      }
    };
  }
  
  /**
   * Execute Forecast workflow
   */
  async executeForecastWorkflow(userMessage, financialContext, workflowId, options) {
    const inputData = {
      query: userMessage,
      financialData: financialContext?.allTransactions || [],
      currentBalance: financialContext?.currentBalance || 0,
      timeHorizon: this.extractTimeHorizon(userMessage),
      forecastType: 'comprehensive'
    };
    
    const result = await this.orchestrator.executeForecastWorkflow(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatForecastResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'forecast',
        workflowId,
        timeHorizon: inputData.timeHorizon,
        projectionCount: result.projections?.length || 0
      }
    };
  }
  
  /**
   * Execute Scenario Analysis workflow
   */
  async executeScenarioWorkflow(userMessage, financialContext, workflowId, options) {
    const scenarioData = this.extractScenarioFromQuery(userMessage);
    
    const result = await this.orchestrator.executeScenarioAnalysisWorkflow(
      scenarioData,
      financialContext,
      {
        workflowId,
        progressCallback: (progress) => this.notifyProgress(workflowId, progress),
        ...options
      }
    );
    
    return {
      response: this.formatScenarioResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'scenario',
        workflowId,
        scenarioType: scenarioData.type,
        impactMagnitude: result.impactMagnitude
      }
    };
  }
  
  /**
   * Execute Health Monitoring workflow
   */
  async executeHealthWorkflow(userMessage, financialContext, workflowId, options) {
    const inputData = {
      query: userMessage,
      financialData: financialContext,
      includeRecommendations: true,
      analysisDepth: 'detailed'
    };
    
    const result = await this.orchestrator.runFinancialHealthMonitoring(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatHealthResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'health',
        workflowId,
        overallScore: result.overallScore,
        concernsCount: result.concerns?.length || 0
      }
    };
  }
  
  /**
   * Execute Multi-Account Intelligence workflow
   */
  async executeMultiAccountWorkflow(userMessage, financialContext, workflowId, options) {
    const userId = financialContext?.userId || 'default';
    
    const result = await this.orchestrator.runMultiAccountIntelligence(userId, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      query: userMessage,
      ...options
    });
    
    return {
      response: this.formatMultiAccountResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'multiAccount',
        workflowId,
        accountCount: result.accountCount,
        optimizationCount: result.optimizations?.length || 0
      }
    };
  }
  
  /**
   * Execute Predictive Analytics workflow
   */
  async executePredictiveWorkflow(userMessage, financialContext, workflowId, options) {
    const inputData = {
      query: userMessage,
      financialData: financialContext,
      predictionType: 'comprehensive',
      timeHorizon: this.extractTimeHorizon(userMessage) || 12
    };
    
    const result = await this.orchestrator.runPredictiveAnalyticsPipeline(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatPredictiveResponse(result, userMessage),
      workflowData: result,
      metadata: {
        type: 'predictive',
        workflowId,
        predictionAccuracy: result.accuracy,
        trendCount: result.trends?.length || 0
      }
    };
  }
  
  /**
   * Format responses for different workflow types
   */
  formatIntelligenceResponse(result, originalQuery) {
    const insights = result.insights || [];
    const recommendations = result.recommendations || [];
    
    let response = `🧠 **Financial Intelligence Analysis**\n\n`;
    
    if (insights.length > 0) {
      response += `**Key Insights:**\n`;
      insights.slice(0, 3).forEach((insight, i) => {
        response += `${i + 1}. ${insight.description}\n`;
      });
      response += `\n`;
    }
    
    if (recommendations.length > 0) {
      response += `**Recommendations:**\n`;
      recommendations.slice(0, 3).forEach((rec, i) => {
        response += `• ${rec.action}: ${rec.description}\n`;
      });
      response += `\n`;
    }
    
    response += `*Analysis based on ${result.dataPoints || 0} data points with ${(result.confidence * 100).toFixed(0)}% confidence.*`;
    
    return response;
  }
  
  formatForecastResponse(result, originalQuery) {
    const projections = result.projections || [];
    const timeHorizon = this.extractTimeHorizon(originalQuery);
    
    let response = `📈 **Financial Forecast**\n\n`;
    
    if (projections.length > 0) {
      const finalProjection = projections[projections.length - 1];
      response += `**Projected outcome in ${timeHorizon} months:**\n`;
      response += `• Balance: $${finalProjection.balance?.toLocaleString() || 'N/A'}\n`;
      response += `• Net worth: $${finalProjection.netWorth?.toLocaleString() || 'N/A'}\n`;
      response += `• Monthly cash flow: $${finalProjection.monthlyFlow?.toLocaleString() || 'N/A'}\n\n`;
    }
    
    if (result.keyFactors) {
      response += `**Key factors affecting your forecast:**\n`;
      result.keyFactors.slice(0, 3).forEach((factor, i) => {
        response += `${i + 1}. ${factor}\n`;
      });
      response += `\n`;
    }
    
    response += `*Forecast based on current trends with ${(result.confidence * 100).toFixed(0)}% confidence.*`;
    
    return response;
  }
  
  formatScenarioResponse(result, originalQuery) {
    let response = `🎯 **Scenario Analysis**\n\n`;
    
    if (result.impact) {
      response += `**Impact Assessment:**\n`;
      response += `• Financial impact: ${result.impact.magnitude || 'Moderate'}\n`;
      response += `• Timeline: ${result.impact.timeframe || 'Medium-term'}\n`;
      response += `• Risk level: ${result.impact.riskLevel || 'Moderate'}\n\n`;
    }
    
    if (result.outcomes) {
      response += `**Potential Outcomes:**\n`;
      result.outcomes.slice(0, 3).forEach((outcome, i) => {
        response += `${i + 1}. ${outcome.description} (${outcome.probability || 'N/A'} likely)\n`;
      });
      response += `\n`;
    }
    
    if (result.recommendations) {
      response += `**Recommendations:**\n`;
      result.recommendations.slice(0, 3).forEach((rec, i) => {
        response += `• ${rec.action}: ${rec.rationale}\n`;
      });
      response += `\n`;
    }
    
    response += `*Analysis completed with ${(result.confidence * 100).toFixed(0)}% confidence.*`;
    
    return response;
  }
  
  formatHealthResponse(result, originalQuery) {
    let response = `🏥 **Financial Health Assessment**\n\n`;
    
    if (result.overallScore) {
      const score = Math.round(result.overallScore * 100);
      const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement';
      response += `**Overall Health Score: ${score}/100 (${grade})**\n\n`;
    }
    
    if (result.scores) {
      response += `**Health Dimensions:**\n`;
      Object.entries(result.scores).slice(0, 4).forEach(([dimension, score]) => {
        const percentage = Math.round(score * 100);
        response += `• ${dimension}: ${percentage}%\n`;
      });
      response += `\n`;
    }
    
    if (result.concerns && result.concerns.length > 0) {
      response += `**Areas of Concern:**\n`;
      result.concerns.slice(0, 3).forEach((concern, i) => {
        response += `${i + 1}. ${concern.description}\n`;
      });
      response += `\n`;
    }
    
    response += `*Health assessment based on ${result.dataPoints || 0} data points.*`;
    
    return response;
  }
  
  formatMultiAccountResponse(result, originalQuery) {
    let response = `🏦 **Multi-Account Analysis**\n\n`;
    
    if (result.accountSummary) {
      response += `**Account Overview:**\n`;
      response += `• Total accounts: ${result.accountSummary.totalAccounts || 0}\n`;
      response += `• Total balance: $${result.accountSummary.totalBalance?.toLocaleString() || 'N/A'}\n`;
      response += `• Monthly flow: $${result.accountSummary.monthlyFlow?.toLocaleString() || 'N/A'}\n\n`;
    }
    
    if (result.optimizations) {
      response += `**Optimization Opportunities:**\n`;
      result.optimizations.slice(0, 3).forEach((opt, i) => {
        response += `${i + 1}. ${opt.description} (saves $${opt.potentialSavings?.toLocaleString() || 'N/A'})\n`;
      });
      response += `\n`;
    }
    
    response += `*Analysis based on ${result.accountCount || 0} accounts.*`;
    
    return response;
  }
  
  formatPredictiveResponse(result, originalQuery) {
    let response = `🔮 **Predictive Analytics**\n\n`;
    
    if (result.predictions) {
      response += `**Key Predictions:**\n`;
      result.predictions.slice(0, 3).forEach((pred, i) => {
        response += `${i + 1}. ${pred.description} (${Math.round(pred.probability * 100)}% likely)\n`;
      });
      response += `\n`;
    }
    
    if (result.trends) {
      response += `**Emerging Trends:**\n`;
      result.trends.slice(0, 3).forEach((trend, i) => {
        response += `• ${trend.description} (${trend.direction || 'N/A'} trend)\n`;
      });
      response += `\n`;
    }
    
    response += `*Predictions based on ${result.dataPoints || 0} data points.*`;
    
    return response;
  }
  
  /**
   * Utility methods
   */
  extractTimeHorizon(query) {
    const matches = query.match(/(\d+)\s*(month|year|day)s?/i);
    if (matches) {
      const value = parseInt(matches[1]);
      const unit = matches[2].toLowerCase();
      
      if (unit.startsWith('year')) return value * 12;
      if (unit.startsWith('month')) return value;
      if (unit.startsWith('day')) return Math.max(1, Math.round(value / 30));
    }
    
    return 12; // Default to 12 months
  }
  
  extractScenarioFromQuery(query) {
    const scenarioTypes = {
      'raise|promotion|salary|income': 'income_change',
      'house|home|buy|mortgage': 'major_purchase',
      'emergency|crisis|layoff|medical': 'emergency',
      'retire|retirement': 'retirement',
      'debt|loan|credit': 'debt_management'
    };
    
    for (const [pattern, type] of Object.entries(scenarioTypes)) {
      if (new RegExp(pattern, 'i').test(query)) {
        return {
          type,
          description: query,
          parameters: this.extractScenarioParameters(query, type)
        };
      }
    }
    
    return {
      type: 'general',
      description: query,
      parameters: {}
    };
  }
  
  extractScenarioParameters(query, type) {
    const params = {};
    
    // Extract monetary amounts
    const amountMatch = query.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      params.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }
    
    // Extract percentages
    const percentMatch = query.match(/(\d+)%/);
    if (percentMatch) {
      params.percentage = parseInt(percentMatch[1]);
    }
    
    return params;
  }
  
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });
    
    if (this.conversationHistory.length > this.maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
    }
  }
  
  getRecentHistory() {
    return this.conversationHistory.slice(-6);
  }
  
  notifyProgress(workflowId, progress) {
    const callback = this.progressCallbacks.get(workflowId);
    if (callback) {
      callback(progress);
    }
  }
  
  setProgressCallback(workflowId, callback) {
    this.progressCallbacks.set(workflowId, callback);
  }
  
  async generateFallbackResponse(userMessage) {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful financial assistant. Provide a brief, helpful response about personal finance.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 300
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
    }
  }
  
  generateSessionId() {
    return `enhanced_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  clearConversation() {
    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();
    this.progressCallbacks.clear();
  }
  
  getConversationSummary() {
    return {
      sessionId: this.sessionId,
      messageCount: this.conversationHistory.length,
      hasContext: this.conversationHistory.length > 0,
      startTime: this.conversationHistory[0]?.timestamp,
      lastActivity: this.conversationHistory[this.conversationHistory.length - 1]?.timestamp
    };
  }
  
  async healthCheck() {
    try {
      const orchestratorHealth = await this.orchestrator.healthCheck();
      
      return {
        status: 'healthy',
        model: config.openai.model,
        conversationLength: this.conversationHistory.length,
        hasContext: this.conversationHistory.length > 0,
        workflows: orchestratorHealth.workflows,
        sessionId: this.sessionId
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const enhancedChatService = new EnhancedChatService();

module.exports = {
  enhancedChatService,
  EnhancedChatService
}; 