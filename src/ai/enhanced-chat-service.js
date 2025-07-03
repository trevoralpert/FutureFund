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
    console.log('🚀 Debug: Starting Financial Intelligence workflow execution');
    console.log('🔍 Debug: Input context has transactions:', financialContext?.allTransactions?.length || 0);
    
    // Transform enhanced financial context to workflow format
    const inputData = {
      transactions: financialContext?.allTransactions || [],
      query: userMessage,
      userProfile: financialContext?.userProfile || {},
      accounts: financialContext?.accounts || {},
      accountStats: financialContext?.accountStats || {},
      financialHealth: financialContext?.financialHealth || {},
      spendingAnalysis: financialContext?.spendingAnalysis || {},
      personalizedInsights: financialContext?.personalizedInsights || {},
      contextMetadata: financialContext?.contextMetadata || {},
      conversationHistory: this.getRecentHistory(),
      analysisType: 'comprehensive',
      includeRecommendations: true
    };
    
    console.log('🔍 Debug: Prepared input data for workflow:', {
      transactionCount: inputData.transactions.length,
      hasUserProfile: !!inputData.userProfile.name,
      hasAccounts: !!inputData.accounts,
      analysisType: inputData.analysisType
    });
    
    try {
      console.log('⏳ Debug: Calling orchestrator.executeFinancialIntelligenceWorkflow...');
      const result = await this.orchestrator.executeFinancialIntelligenceWorkflow(inputData, {
        workflowId,
        progressCallback: (progress) => {
          console.log('📊 Debug: Workflow progress:', progress);
          this.notifyProgress(workflowId, progress);
        },
        ...options
      });
      
      console.log('✅ Debug: Workflow completed. Result structure:', {
        success: result?.success,
        hasData: !!result?.data,
        dataKeys: Object.keys(result?.data || {}),
        hasMetadata: !!result?.metadata
      });
      
      if (!result?.success) {
        console.error('❌ Debug: Workflow execution failed:', result?.error);
      }
      
      return {
        response: this.formatIntelligenceResponse(result, userMessage, financialContext),
        workflowData: result,
        metadata: {
          type: 'intelligence',
          workflowId,
          analysisDepth: result?.data?.executionMetadata?.summary?.processingTime || 0,
          insightCount: result?.data?.insights?.keyFindings?.length || 0,
          dataPoints: financialContext?.allTransactions?.length || 0,
          confidence: financialContext?.contextMetadata?.confidenceLevel || 0
        }
      };
      
    } catch (error) {
      console.error('❌ Debug: Workflow execution threw error:', error);
      
      // Return fallback response on error
      return {
        response: this.formatIntelligenceResponse({ success: false, error: error.message }, userMessage, financialContext),
        workflowData: { success: false, error: error.message },
        metadata: {
          type: 'intelligence',
          workflowId,
          analysisDepth: 0,
          insightCount: 0,
          dataPoints: financialContext?.allTransactions?.length || 0,
          confidence: 0,
          error: error.message
        }
      };
    }
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
      forecastType: 'comprehensive',
      userProfile: financialContext?.userProfile || {},
      accounts: financialContext?.accounts || {},
      financialHealth: financialContext?.financialHealth || {}
    };
    
    const result = await this.orchestrator.executeForecastWorkflow(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatForecastResponse(result, userMessage, financialContext),
      workflowData: result,
      metadata: {
        type: 'forecast',
        workflowId,
        timeHorizon: inputData.timeHorizon,
        projectionCount: result?.data?.projections?.length || 0,
        dataPoints: financialContext?.allTransactions?.length || 0
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
      financialData: {
        transactions: financialContext?.allTransactions || [],
        currentBalance: financialContext?.currentBalance || 0,
        monthlyNetIncome: financialContext?.monthlyNetIncome || 0,
        userProfile: financialContext?.userProfile || {},
        accounts: financialContext?.accounts || {},
        accountStats: financialContext?.accountStats || {}
      },
      includeRecommendations: true,
      analysisDepth: 'detailed'
    };
    
    const result = await this.orchestrator.runFinancialHealthMonitoring(inputData, {
      workflowId,
      progressCallback: (progress) => this.notifyProgress(workflowId, progress),
      ...options
    });
    
    return {
      response: this.formatHealthResponse(result, userMessage, financialContext),
      workflowData: result,
      metadata: {
        type: 'health',
        workflowId,
        overallScore: result?.overallScore || result?.health_score?.overall || 0,
        concernsCount: result?.concerns?.length || result?.health_concerns?.length || 0,
        dataPoints: financialContext?.allTransactions?.length || 0
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
  formatIntelligenceResponse(result, originalQuery, financialContext) {
    // Debug what we're actually getting
    console.log('🔍 Debug: Formatting Intelligence Response');
    console.log('🔍 Debug: Full result object:', result);
    console.log('🔍 Debug: Result success:', result?.success);
    console.log('🔍 Debug: Result data keys:', Object.keys(result?.data || {}));
    
    // Extract data from the workflow result structure
    const workflowData = result?.data || {};
    const healthScore = workflowData?.healthScore?.overall?.score || 0;
    const spendingPatterns = workflowData?.spendingPatterns || {};
    const anomalies = workflowData?.anomalies || {};
    const categorizedTransactions = workflowData?.categorizedTransactions || {};
    
    console.log('🔍 Debug: Health score:', healthScore);
    console.log('🔍 Debug: Anomalies:', anomalies);
    
    // Start building human-like response
    let response = `🧠 **Financial Intelligence Analysis**\n\n`;
    
    // Add health score if available
    if (healthScore > 0) {
      // Convert 5-point scale to 100-point scale
      const percentageScore = Math.round((healthScore / 5.0) * 100);
      
      // Determine correct grade based on 100-point scale
      let grade;
      if (percentageScore >= 90) grade = 'A';
      else if (percentageScore >= 80) grade = 'B';
      else if (percentageScore >= 70) grade = 'C';
      else if (percentageScore >= 60) grade = 'D';
      else grade = 'F';
      
      response += `**AI Financial Health Score: ${percentageScore}/100 (${grade})**\n\n`;
    }
    
    // Provide sophisticated financial analysis
    response += this.generateContextualFinancialAdvice(
      workflowData, 
      financialContext, 
      originalQuery,
      healthScore
    );
    
    console.log(`✅ Debug: Final formatted response length: ${response.length}`);
    return response;
  }

  /**
   * Generate contextual, human-like financial advice
   */
  generateContextualFinancialAdvice(workflowData, financialContext, originalQuery, healthScore) {
    const transactions = financialContext?.allTransactions || [];
    const userProfile = financialContext?.userProfile || {};
    const accounts = financialContext?.accounts || {};
    const currentBalance = financialContext?.currentBalance || 0;
    const monthlyNetIncome = financialContext?.monthlyNetIncome || 0;
    
    let advice = '';
    
    // 1. Analyze spending patterns and major expenses
    const spendingAnalysis = this.analyzeSpendingPatterns(transactions, userProfile);
    if (spendingAnalysis.insights.length > 0) {
      advice += `**What I'm Seeing:**\n`;
      spendingAnalysis.insights.forEach(insight => {
        advice += `• ${insight}\n`;
      });
      advice += `\n`;
    }
    
    // 2. Debt-specific analysis (if asking about debt)
    if (originalQuery.toLowerCase().includes('debt')) {
      const debtAnalysis = this.analyzeDebtSituation(userProfile, monthlyNetIncome, transactions);
      if (debtAnalysis.recommendations.length > 0) {
        advice += `**Debt Reduction Strategy:**\n`;
        debtAnalysis.recommendations.forEach(rec => {
          advice += `• ${rec}\n`;
        });
        advice += `\n`;
      }
    }
    
    // 3. Cash flow and budget analysis
    const cashFlowAnalysis = this.analyzeCashFlowSituation(transactions, currentBalance, monthlyNetIncome);
    if (cashFlowAnalysis.observations.length > 0) {
      advice += `**Cash Flow Observations:**\n`;
      cashFlowAnalysis.observations.forEach(obs => {
        advice += `• ${obs}\n`;
      });
      advice += `\n`;
    }
    
    // 4. Actionable recommendations
    const actionableSteps = this.generateActionableRecommendations(
      spendingAnalysis, 
      userProfile, 
      monthlyNetIncome, 
      healthScore
    );
    
    if (actionableSteps.length > 0) {
      advice += `**Actionable Steps:**\n`;
      actionableSteps.forEach((step, index) => {
        advice += `${index + 1}. ${step}\n`;
      });
      advice += `\n`;
    }
    
    // 5. Encouraging conclusion
    advice += `**Remember:** Financial improvement takes time. Focus on one or two changes at a time for the best results.`;
    
    return advice;
  }

  /**
   * Analyze spending patterns with human-like insights
   */
  analyzeSpendingPatterns(transactions, userProfile) {
    const insights = [];
    
    // Analyze by category
    const categorySpending = {};
    const monthlyAmounts = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      const amount = Math.abs(transaction.amount);
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (transaction.amount < 0) { // Expenses only
        categorySpending[category] = (categorySpending[category] || 0) + amount;
        
        if (!monthlyAmounts[monthKey]) monthlyAmounts[monthKey] = {};
        monthlyAmounts[monthKey][category] = (monthlyAmounts[monthKey][category] || 0) + amount;
      }
    });
    
    // Find largest expense categories
    const sortedCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const totalExpenses = Object.values(categorySpending).reduce((sum, amt) => sum + amt, 0);
      const percentage = ((topAmount / totalExpenses) * 100).toFixed(1);
      
      // Identify if it's likely recurring (housing, utilities, subscriptions)
      const recurringCategories = ['Housing', 'Utilities', 'Subscriptions', 'Insurance', 'Phone'];
      const isRecurring = recurringCategories.includes(topCategory);
      
      if (isRecurring && percentage > 30) {
        insights.push(`Your ${topCategory.toLowerCase()} expenses are $${topAmount.toLocaleString()} (${percentage}% of spending), which is your largest category. This suggests your fixed costs may be too high relative to your income.`);
        
        if (topCategory === 'Housing') {
          insights.push(`Housing costs above 30% of income can strain finances. Consider whether your rent/mortgage fits your budget long-term.`);
        }
      } else {
        insights.push(`Your top spending category is ${topCategory} at $${topAmount.toLocaleString()} (${percentage}% of total expenses).`);
      }
    }
    
    // Analyze debt situation
    if (userProfile.creditCardDebt?.total > 0) {
      const totalDebt = userProfile.creditCardDebt.total;
      insights.push(`You're carrying $${totalDebt.toLocaleString()} in credit card debt across ${userProfile.creditCardDebt.accountCount} accounts.`);
    }
    
    return { insights, categorySpending };
  }

  /**
   * Analyze debt situation with specific recommendations
   */
  analyzeDebtSituation(userProfile, monthlyNetIncome, transactions) {
    const recommendations = [];
    
    if (userProfile.creditCardDebt?.total > 0) {
      const totalDebt = userProfile.creditCardDebt.total;
      const accounts = userProfile.creditCardDebt.accounts || [];
      
      // Calculate debt-to-income ratio
      const annualIncome = monthlyNetIncome * 12;
      const debtToIncomeRatio = annualIncome > 0 ? (totalDebt / annualIncome) * 100 : 0;
      
      if (debtToIncomeRatio > 40) {
        recommendations.push(`Your debt-to-income ratio is ${debtToIncomeRatio.toFixed(1)}%, which is quite high. This limits your financial flexibility significantly.`);
      }
      
      // Specific debt strategy recommendations
      if (accounts.length > 1) {
        const highestBalanceAccount = accounts.reduce((max, acc) => 
          acc.balance > max.balance ? acc : max
        );
        
        recommendations.push(`Consider the "debt avalanche" method: make minimum payments on all cards, then put extra money toward your highest APR debt first.`);
        
        if (highestBalanceAccount.balance > 5000) {
          recommendations.push(`Your ${highestBalanceAccount.name} has a high balance ($${highestBalanceAccount.balance.toLocaleString()}). Consider a balance transfer to a 0% APR card if you qualify.`);
        }
      }
      
      // Monthly payment analysis
      const recommendedPayment = Math.max(
        totalDebt * 0.05, // 5% of total debt
        monthlyNetIncome * 0.2 // 20% of monthly income
      );
      
      if (monthlyNetIncome > 0) {
        recommendations.push(`Try to allocate $${recommendedPayment.toFixed(0)} per month toward debt payments (20% of your monthly income) to make meaningful progress.`);
      }
    }
    
    return { recommendations };
  }

  /**
   * Analyze cash flow situation
   */
  analyzeCashFlowSituation(transactions, currentBalance, monthlyNetIncome) {
    const observations = [];
    
    // Current financial position
    if (currentBalance < 0) {
      observations.push(`Your current net worth is negative ($${currentBalance.toLocaleString()}), indicating you owe more than you own.`);
    }
    
    // Monthly cash flow analysis
    if (monthlyNetIncome > 0) {
      const monthlyExpenses = this.calculateAverageMonthlyExpenses(transactions);
      const netCashFlow = monthlyNetIncome - monthlyExpenses;
      
      if (netCashFlow < 0) {
        observations.push(`You're spending $${Math.abs(netCashFlow).toFixed(0)} more per month than you earn. This is unsustainable and requires immediate attention.`);
      } else if (netCashFlow < 500) {
        observations.push(`Your monthly cash flow is tight at $${netCashFlow.toFixed(0)}. You have little cushion for unexpected expenses.`);
      } else {
        observations.push(`You have $${netCashFlow.toFixed(0)} in positive monthly cash flow, which is good for building savings.`);
      }
    }
    
    return { observations };
  }

  /**
   * Calculate average monthly expenses
   */
  calculateAverageMonthlyExpenses(transactions) {
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    
    if (expenseTransactions.length === 0) return 0;
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const dateRange = this.getDateRangeInMonths(transactions);
    
    return dateRange > 0 ? totalExpenses / dateRange : 0;
  }

  /**
   * Get date range in months
   */
  getDateRangeInMonths(transactions) {
    if (transactions.length === 0) return 0;
    
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    return Math.max(1, monthsDiff);
  }

  /**
   * Generate actionable recommendations
   */
  generateActionableRecommendations(spendingAnalysis, userProfile, monthlyNetIncome, healthScore) {
    const recommendations = [];
    
    // Based on spending analysis
    const sortedCategories = Object.entries(spendingAnalysis.categorySpending)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      
      if (topCategory === 'Housing' && topAmount > monthlyNetIncome * 0.3) {
        recommendations.push(`Consider finding more affordable housing or increasing your income. Your housing costs are consuming too much of your budget.`);
      }
      
      if (topCategory === 'Dining' || topCategory === 'Food') {
        recommendations.push(`Track your food spending more carefully. Consider meal planning and cooking at home to reduce this expense.`);
      }
    }
    
    // Debt-specific recommendations
    if (userProfile.creditCardDebt?.total > 0) {
      recommendations.push(`Stop using credit cards for new purchases until you pay down existing debt.`);
      
      if (userProfile.creditCardDebt.total > 10000) {
        recommendations.push(`Consider debt consolidation with a personal loan at a lower interest rate.`);
      }
    }
    
    // Health score based recommendations
    if (healthScore < 2.5) {
      recommendations.push(`Create a strict budget and track every expense for the next 30 days to identify where money is going.`);
    }
    
    // Income recommendations
    if (monthlyNetIncome > 0 && monthlyNetIncome < 4000) {
      recommendations.push(`Look for ways to increase your income - side gigs, skill development, or job advancement opportunities.`);
    }
    
    return recommendations;
  }
  
  formatForecastResponse(result, originalQuery, financialContext) {
    const workflowData = result?.data || {};
    const projections = workflowData?.projections || [];
    const timeHorizon = this.extractTimeHorizon(originalQuery) || 12;
    
    let response = `📈 **Financial Forecast**\n\n`;
    
    // Add personalized context
    if (financialContext?.userProfile?.name) {
      response += `**Forecast for ${financialContext.userProfile.name}:**\n`;
      response += `• Current Balance: $${financialContext.currentBalance?.toLocaleString() || 'N/A'}\n`;
      response += `• Monthly Net Cash Flow: $${financialContext.monthlyNetIncome?.toLocaleString() || 'N/A'}\n\n`;
    }
    
    if (projections.length > 0) {
      const finalProjection = projections[projections.length - 1];
      response += `**Projected outcome in ${timeHorizon} months:**\n`;
      response += `• Balance: $${finalProjection.balance?.toLocaleString() || 'N/A'}\n`;
      response += `• Net worth: $${finalProjection.netWorth?.toLocaleString() || 'N/A'}\n`;
      response += `• Monthly cash flow: $${finalProjection.monthlyFlow?.toLocaleString() || 'N/A'}\n\n`;
    }
    
    if (workflowData.keyFactors) {
      response += `**Key factors affecting your forecast:**\n`;
      workflowData.keyFactors.slice(0, 3).forEach((factor, i) => {
        response += `${i + 1}. ${factor}\n`;
      });
      response += `\n`;
    }
    
    // Add debt-specific insights for Sampuel
    if (financialContext?.userProfile?.creditCardDebt?.total) {
      response += `**Debt Impact Analysis:**\n`;
      response += `• Current debt: $${financialContext.userProfile.creditCardDebt.total.toLocaleString()}\n`;
      response += `• Monthly minimum payments: $${(financialContext.userProfile.creditCardDebt.cards.reduce((sum, card) => sum + card.minPayment, 0)).toLocaleString()}\n\n`;
    }
    
    const confidence = financialContext?.contextMetadata?.confidenceLevel || 0.8;
    response += `*Forecast based on current trends with ${(confidence * 100).toFixed(0)}% confidence.*`;
    
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
  
  formatHealthResponse(result, originalQuery, financialContext) {
    let response = `🏥 **Financial Health Assessment**\n\n`;
    
    // Add personalized context
    if (financialContext?.userProfile?.name) {
      response += `**Health Assessment for ${financialContext.userProfile.name}:**\n`;
      response += `• Current Balance: $${financialContext.currentBalance?.toLocaleString() || 'N/A'}\n`;
      response += `• Monthly Net Cash Flow: $${financialContext.monthlyNetIncome?.toLocaleString() || 'N/A'}\n\n`;
    }
    
    // Handle different result structures
    const overallScore = result?.overallScore || result?.health_score?.overall || result?.overall_score || 0;
    const scores = result?.scores || result?.health_scores || result?.dimension_scores || {};
    const concerns = result?.concerns || result?.health_concerns || result?.warnings || [];
    
    if (overallScore > 0) {
      const score = Math.round(overallScore * 100);
      const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement';
      response += `**Overall Health Score: ${score}/100 (${grade})**\n\n`;
    }
    
    if (Object.keys(scores).length > 0) {
      response += `**Health Dimensions:**\n`;
      Object.entries(scores).slice(0, 4).forEach(([dimension, score]) => {
        const percentage = Math.round((score || 0) * 100);
        const formattedDimension = dimension.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        response += `• ${formattedDimension}: ${percentage}%\n`;
      });
      response += `\n`;
    }
    
    if (concerns.length > 0) {
      response += `**Areas of Concern:**\n`;
      concerns.slice(0, 3).forEach((concern, i) => {
        const description = concern.description || concern.message || concern;
        response += `${i + 1}. ${description}\n`;
      });
      response += `\n`;
    }
    
    // Add debt-specific health insights for Sampuel
    if (financialContext?.userProfile?.creditCardDebt?.total) {
      const totalDebt = financialContext.userProfile.creditCardDebt.total;
      const totalMinPayments = financialContext.userProfile.creditCardDebt.cards.reduce((sum, card) => sum + card.minPayment, 0);
      const debtToIncomeRatio = (totalMinPayments / (financialContext.monthlyNetIncome || 1)) * 100;
      
      response += `**Debt Health Analysis:**\n`;
      response += `• Total Credit Card Debt: $${totalDebt.toLocaleString()}\n`;
      response += `• Monthly Minimum Payments: $${totalMinPayments.toLocaleString()}\n`;
      response += `• Debt-to-Income Ratio: ${debtToIncomeRatio.toFixed(1)}%\n\n`;
    }
    
    const dataPoints = financialContext?.allTransactions?.length || 0;
    response += `*Health assessment based on ${dataPoints} data points.*`;
    
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