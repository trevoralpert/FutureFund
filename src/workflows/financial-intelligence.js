/**
 * Financial Intelligence Workflow - Phase 3.5.2
 * Advanced AI-powered financial analysis workflows
 * Building on LangGraph foundation for sophisticated financial insights
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require("openai");
const config = require('../config');

// Import helper functions for advanced analysis
const {
  analyzeSeasonalTrends,
  getTopSpendingCategories,
  analyzeCategoryTrends,
  analyzeCategorySeasonality,
  analyzeSpendingFrequency,
  analyzeAmountPatterns,
  analyzeMerchantPatterns,
  generateAISpendingInsights,
  generateFallbackSpendingInsights,
  detectAmountAnomalies,
  detectFrequencyAnomalies,
  detectCategoryAnomalies,
  detectTemporalAnomalies,
  detectMerchantAnomalies,
  calculateCashFlowHealth,
  calculateSpendingStability,
  calculateBudgetingDiscipline,
  calculateRiskManagement,
  calculateStandardDeviation,
  extractMerchantName,
  getDaySpan,
  getSeason
} = require('./financial-intelligence-helpers');

/**
 * Enhanced Financial Intelligence State Schema
 * More sophisticated state management for advanced workflows
 */
const financialIntelligenceState = {
  channels: {
    // Input data
    transactionData: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Analysis results
    spendingPatterns: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Anomaly detection
    anomalies: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Financial health
    healthScore: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Categorization
    categorizedTransactions: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Insights and recommendations
    insights: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Recommendations
    recommendations: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Execution metadata
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        startTime: Date.now(),
        currentPhase: null,
        phases: [],
        version: '3.5.2',
        workflow: 'FinancialIntelligence'
      })
    },
    
    // Error tracking
    errors: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    }
  }
};

/**
 * Node 1: Advanced Transaction Loading and Preprocessing
 * Enhanced data loading with intelligent preprocessing
 */
async function loadAndPreprocessTransactions(state) {
  console.log('🔄 [Financial Intelligence] Loading and preprocessing transactions...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.transactionData || !Array.isArray(state.transactionData.transactions)) {
      throw new Error('Invalid transaction data provided');
    }

    const transactions = state.transactionData.transactions;
    
    // Enhanced preprocessing with intelligent data cleaning
    const preprocessedTransactions = transactions
      .filter(t => t.amount !== undefined && t.date && t.description)
      .map(t => ({
        ...t,
        amount: parseFloat(t.amount),
        date: new Date(t.date),
        description: t.description.trim(),
        category: t.category || 'Uncategorized',
        type: parseFloat(t.amount) >= 0 ? 'Income' : 'Expense',
        normalizedAmount: Math.abs(parseFloat(t.amount)),
        dayOfWeek: new Date(t.date).getDay(),
        monthOfYear: new Date(t.date).getMonth(),
        weekOfYear: getWeekOfYear(new Date(t.date))
      }))
      .sort((a, b) => a.date - b.date);

    // Enhanced metrics calculation
    const metrics = calculateAdvancedMetrics(preprocessedTransactions);
    
    // Time-based analysis
    const timeAnalysis = analyzeTimePatterns(preprocessedTransactions);
    
    // Category distribution
    const categoryDistribution = analyzeCategoryDistribution(preprocessedTransactions);
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Preprocessed ${preprocessedTransactions.length} transactions in ${processingTime}ms`);
    
    return {
      ...state,
      transactionData: {
        ...state.transactionData,
        transactions: preprocessedTransactions,
        metrics,
        timeAnalysis,
        categoryDistribution,
        processingQuality: {
          originalCount: transactions.length,
          processedCount: preprocessedTransactions.length,
          completeness: preprocessedTransactions.length / transactions.length,
          avgAmount: metrics.avgTransactionAmount,
          totalRange: metrics.totalRange
        }
      },
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'preprocessing',
        phases: [...state.executionMetadata.phases, {
          phase: 'preprocessing',
          duration: processingTime,
          timestamp: Date.now(),
          success: true
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Preprocessing Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'preprocessing', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'preprocessing',
        phases: [...state.executionMetadata.phases, {
          phase: 'preprocessing',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Node 2: Advanced Spending Pattern Analysis
 * AI-powered pattern recognition with behavioral analysis
 */
async function analyzeSpendingPatterns(state) {
  console.log('🔍 [Financial Intelligence] Analyzing spending patterns with AI...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.transactionData || !state.transactionData.transactions) {
      throw new Error('No transaction data available for pattern analysis');
    }

    const transactions = state.transactionData.transactions;
    const metrics = state.transactionData.metrics;
    
    // Multi-dimensional pattern analysis
    const patterns = {
      // Temporal patterns
      temporal: {
        dailyPatterns: analyzeDailySpendingPatterns(transactions),
        weeklyPatterns: analyzeWeeklySpendingPatterns(transactions),
        monthlyPatterns: analyzeMonthlySpendingPatterns(transactions),
        seasonalTrends: analyzeSeasonalTrends(transactions)
      },
      
      // Category patterns
      categorical: {
        topCategories: getTopSpendingCategories(transactions),
        categoryTrends: analyzeCategoryTrends(transactions),
        categorySeasonality: analyzeCategorySeasonality(transactions)
      },
      
      // Behavioral patterns
      behavioral: {
        spendingFrequency: analyzeSpendingFrequency(transactions),
        amountPatterns: analyzeAmountPatterns(transactions),
        merchantPatterns: analyzeMerchantPatterns(transactions)
      }
    };
    
    // AI-powered insights
    let aiInsights = null;
    if (config.isAIEnabled) {
      try {
        aiInsights = await generateAISpendingInsights(transactions, patterns, metrics);
        console.log('✅ [Financial Intelligence] AI spending insights generated');
      } catch (aiError) {
        console.warn('⚠️ [Financial Intelligence] AI insights failed, using fallback:', aiError.message);
        aiInsights = generateFallbackSpendingInsights(transactions, patterns, metrics);
      }
    } else {
      aiInsights = generateFallbackSpendingInsights(transactions, patterns, metrics);
    }
    
    const spendingPatterns = {
      ...patterns,
      insights: aiInsights,
      confidence: aiInsights?.confidence || 0.7,
      analysisDate: new Date().toISOString(),
      dataQuality: state.transactionData.processingQuality
    };
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Spending pattern analysis completed in ${processingTime}ms`);
    
    return {
      ...state,
      spendingPatterns,
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'patternAnalysis',
        phases: [...state.executionMetadata.phases, {
          phase: 'patternAnalysis',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          aiEnabled: config.isAIEnabled
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Pattern Analysis Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'patternAnalysis', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'patternAnalysis',
        phases: [...state.executionMetadata.phases, {
          phase: 'patternAnalysis',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Node 3: Intelligent Anomaly Detection
 * Advanced anomaly detection with ML-style algorithms
 */
async function detectAnomalies(state) {
  console.log('🔍 [Financial Intelligence] Detecting spending anomalies...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.transactionData || !state.spendingPatterns) {
      throw new Error('Missing data for anomaly detection');
    }

    const transactions = state.transactionData.transactions;
    const patterns = state.spendingPatterns;
    
    // Multi-layered anomaly detection
    const anomalies = {
      // Amount-based anomalies
      amountAnomalies: detectAmountAnomalies(transactions, patterns),
      
      // Frequency-based anomalies
      frequencyAnomalies: detectFrequencyAnomalies(transactions, patterns),
      
      // Category-based anomalies
      categoryAnomalies: detectCategoryAnomalies(transactions, patterns),
      
      // Time-based anomalies
      temporalAnomalies: detectTemporalAnomalies(transactions, patterns),
      
      // Merchant/location anomalies
      merchantAnomalies: detectMerchantAnomalies(transactions, patterns)
    };
    
    // Risk scoring for anomalies
    const riskScores = calculateAnomalyRiskScores(anomalies);
    
    // Prioritized anomaly list
    const prioritizedAnomalies = prioritizeAnomalies(anomalies, riskScores);
    
    // AI-powered anomaly analysis
    let aiAnomalyAnalysis = null;
    if (config.isAIEnabled) {
      try {
        aiAnomalyAnalysis = await generateAIAnomalyInsights(prioritizedAnomalies, transactions, patterns);
        console.log('✅ [Financial Intelligence] AI anomaly analysis completed');
      } catch (aiError) {
        console.warn('⚠️ [Financial Intelligence] AI anomaly analysis failed:', aiError.message);
        aiAnomalyAnalysis = generateFallbackAnomalyInsights(prioritizedAnomalies);
      }
    } else {
      aiAnomalyAnalysis = generateFallbackAnomalyInsights(prioritizedAnomalies);
    }
    
    const anomalyResults = {
      ...anomalies,
      riskScores,
      prioritizedAnomalies,
      aiAnalysis: aiAnomalyAnalysis,
      totalAnomalies: prioritizedAnomalies.length,
      highRiskAnomalies: prioritizedAnomalies.filter(a => a.riskScore > 0.7).length,
      detectionDate: new Date().toISOString()
    };
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Detected ${prioritizedAnomalies.length} anomalies in ${processingTime}ms`);
    
    return {
      ...state,
      anomalies: anomalyResults,
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'anomalyDetection',
        phases: [...state.executionMetadata.phases, {
          phase: 'anomalyDetection',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          anomaliesDetected: prioritizedAnomalies.length
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Anomaly Detection Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'anomalyDetection', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'anomalyDetection',
        phases: [...state.executionMetadata.phases, {
          phase: 'anomalyDetection',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Node 4: Smart Financial Health Scoring
 * Comprehensive financial health assessment
 */
async function calculateFinancialHealthScore(state) {
  console.log('💚 [Financial Intelligence] Calculating financial health score...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.transactionData || !state.spendingPatterns) {
      throw new Error('Missing data for health score calculation');
    }

    const transactions = state.transactionData.transactions;
    const patterns = state.spendingPatterns;
    const anomalies = state.anomalies;
    
    // Multi-dimensional health scoring
    const healthComponents = {
      // Cash flow health (40% weight)
      cashFlowHealth: calculateCashFlowHealth(transactions, patterns),
      
      // Spending stability (25% weight)
      spendingStability: calculateSpendingStability(transactions, patterns),
      
      // Budgeting discipline (20% weight)
      budgetingDiscipline: calculateBudgetingDiscipline(transactions, patterns),
      
      // Risk management (15% weight)
      riskManagement: calculateRiskManagement(transactions, anomalies)
    };
    
    // Weighted overall score
    const overallScore = (
      healthComponents.cashFlowHealth.score * 0.4 +
      healthComponents.spendingStability.score * 0.25 +
      healthComponents.budgetingDiscipline.score * 0.2 +
      healthComponents.riskManagement.score * 0.15
    );
    
    // Health grade and recommendations
    const healthGrade = getHealthGrade(overallScore);
    const healthRecommendations = generateHealthRecommendations(healthComponents, overallScore);
    
    // AI-powered health insights
    let aiHealthInsights = null;
    if (config.isAIEnabled) {
      try {
        aiHealthInsights = await generateAIHealthInsights(healthComponents, overallScore, transactions);
        console.log('✅ [Financial Intelligence] AI health insights generated');
      } catch (aiError) {
        console.warn('⚠️ [Financial Intelligence] AI health insights failed:', aiError.message);
        aiHealthInsights = generateFallbackHealthInsights(healthComponents, overallScore);
      }
    } else {
      aiHealthInsights = generateFallbackHealthInsights(healthComponents, overallScore);
    }
    
    const healthScore = {
      overall: {
        score: Math.round(overallScore * 100) / 100,
        grade: healthGrade,
        percentile: calculateHealthPercentile(overallScore)
      },
      components: healthComponents,
      recommendations: healthRecommendations,
      aiInsights: aiHealthInsights,
      calculationDate: new Date().toISOString(),
      confidence: aiHealthInsights?.confidence || 0.8
    };
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Health score calculated: ${healthScore.overall.score}/5.0 (${healthGrade}) in ${processingTime}ms`);
    
    return {
      ...state,
      healthScore,
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'healthScoring',
        phases: [...state.executionMetadata.phases, {
          phase: 'healthScoring',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          healthScore: healthScore.overall.score,
          healthGrade: healthGrade
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Health Scoring Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'healthScoring', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'healthScoring',
        phases: [...state.executionMetadata.phases, {
          phase: 'healthScoring',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Node 5: Automated Transaction Categorization
 * Intelligent category assignment with ML-like algorithms
 */
async function categorizeTransactions(state) {
  console.log('🏷️ [Financial Intelligence] Categorizing transactions...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.transactionData) {
      throw new Error('No transaction data available for categorization');
    }

    const transactions = state.transactionData.transactions;
    
    // Enhanced categorization with multiple algorithms
    const categorizedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        // Rule-based categorization
        const ruleBasedCategory = categorizeBinaryRules(transaction);
        
        // Pattern-based categorization
        const patternBasedCategory = categorizeByPatterns(transaction);
        
        // AI-powered categorization (if enabled)
        let aiCategory = null;
        if (config.isAIEnabled) {
          try {
            aiCategory = await categorizeWithAI(transaction);
          } catch (aiError) {
            console.warn('⚠️ AI categorization failed for transaction:', transaction.id);
          }
        }
        
        // Confidence-weighted category selection
        const finalCategory = selectBestCategory(
          ruleBasedCategory,
          patternBasedCategory,
          aiCategory,
          transaction.category || 'Uncategorized'
        );
        
        return {
          ...transaction,
          originalCategory: transaction.category,
          suggestedCategory: finalCategory.category,
          categoryConfidence: finalCategory.confidence,
          categorizationMethods: finalCategory.methods
        };
      })
    );
    
    // Categorization statistics
    const categorizationStats = analyzeCategorizationResults(categorizedTransactions);
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Categorized ${categorizedTransactions.length} transactions in ${processingTime}ms`);
    
    return {
      ...state,
      categorizedTransactions: {
        transactions: categorizedTransactions,
        stats: categorizationStats,
        categorizationDate: new Date().toISOString()
      },
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'categorization',
        phases: [...state.executionMetadata.phases, {
          phase: 'categorization',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          transactionsCategorized: categorizedTransactions.length
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Categorization Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'categorization', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'categorization',
        phases: [...state.executionMetadata.phases, {
          phase: 'categorization',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Node 6: Generate Comprehensive Insights and Recommendations
 * Final intelligence synthesis and actionable recommendations
 */
async function generateInsightsAndRecommendations(state) {
  console.log('💡 [Financial Intelligence] Generating insights and recommendations...');
  
  try {
    const nodeStart = Date.now();
    
    // Comprehensive insights synthesis
    const insights = {
      // Executive summary
      executiveSummary: generateExecutiveSummary(state),
      
      // Key findings
      keyFindings: extractKeyFindings(state),
      
      // Trend analysis
      trendAnalysis: generateTrendAnalysis(state),
      
      // Risk assessment
      riskAssessment: generateRiskAssessment(state),
      
      // Opportunity identification
      opportunities: identifyOpportunities(state)
    };
    
    // Prioritized recommendations
    const recommendations = {
      // Immediate actions (next 30 days)
      immediate: generateImmediateRecommendations(state),
      
      // Short-term improvements (next 90 days)
      shortTerm: generateShortTermRecommendations(state),
      
      // Long-term optimizations (next 12 months)
      longTerm: generateLongTermRecommendations(state)
    };
    
    // AI-powered personalized recommendations
    let aiRecommendations = null;
    if (config.isAIEnabled) {
      try {
        aiRecommendations = await generateAIPersonalizedRecommendations(state);
        console.log('✅ [Financial Intelligence] AI personalized recommendations generated');
      } catch (aiError) {
        console.warn('⚠️ [Financial Intelligence] AI recommendations failed:', aiError.message);
        aiRecommendations = generateFallbackPersonalizedRecommendations(state);
      }
    } else {
      aiRecommendations = generateFallbackPersonalizedRecommendations(state);
    }
    
    const finalResults = {
      insights,
      recommendations: {
        ...recommendations,
        aiPersonalized: aiRecommendations
      },
      executionSummary: {
        totalTransactions: state.transactionData?.transactions?.length || 0,
        spendingPatterns: state.spendingPatterns ? Object.keys(state.spendingPatterns.temporal).length : 0,
        anomaliesDetected: state.anomalies?.totalAnomalies || 0,
        healthScore: state.healthScore?.overall?.score || 0,
        healthGrade: state.healthScore?.overall?.grade || 'Unknown',
        categorizedTransactions: state.categorizedTransactions?.transactions?.length || 0,
        aiEnabled: config.isAIEnabled,
        processingTime: Date.now() - state.executionMetadata.startTime
      },
      generationDate: new Date().toISOString(),
      confidence: calculateOverallConfidence(state)
    };
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [Financial Intelligence] Generated ${insights.keyFindings.length} insights and ${Object.keys(recommendations).length} recommendation categories in ${processingTime}ms`);
    
    return {
      ...state,
      insights: finalResults.insights,
      recommendations: finalResults.recommendations,
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'insightsGeneration',
        phases: [...state.executionMetadata.phases, {
          phase: 'insightsGeneration',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          insightsGenerated: insights.keyFindings.length,
          recommendationsGenerated: Object.keys(recommendations).length
        }],
        endTime: Date.now(),
        totalDuration: Date.now() - state.executionMetadata.startTime,
        summary: finalResults.executionSummary
      }
    };
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Insights Generation Error:', error);
    return {
      ...state,
      errors: [...state.errors, { 
        phase: 'insightsGeneration', 
        error: error.message, 
        timestamp: Date.now() 
      }],
      executionMetadata: {
        ...state.executionMetadata,
        currentPhase: 'insightsGeneration',
        phases: [...state.executionMetadata.phases, {
          phase: 'insightsGeneration',
          duration: Date.now() - Date.now(),
          timestamp: Date.now(),
          success: false,
          error: error.message
        }],
        endTime: Date.now()
      }
    };
  }
}

/**
 * Create Financial Intelligence LangGraph Workflow
 * Advanced workflow building on the foundation
 */
function createFinancialIntelligenceWorkflow() {
  console.log('🏗️ [Financial Intelligence] Creating advanced workflow...');
  
  try {
    const workflow = new StateGraph(financialIntelligenceState)
      .addNode("loadAndPreprocess", loadAndPreprocessTransactions)
      .addNode("analyzePatterns", analyzeSpendingPatterns)
      .addNode("detectAnomalies", detectAnomalies)
      .addNode("calculateHealth", calculateFinancialHealthScore)
      .addNode("categorizeTransactions", categorizeTransactions)
      .addNode("generateInsights", generateInsightsAndRecommendations)
      .addEdge(START, "loadAndPreprocess")
      .addEdge("loadAndPreprocess", "analyzePatterns")
      .addEdge("analyzePatterns", "detectAnomalies")
      .addEdge("detectAnomalies", "calculateHealth")
      .addEdge("calculateHealth", "categorizeTransactions")
      .addEdge("categorizeTransactions", "generateInsights")
      .addEdge("generateInsights", END);

    const compiledWorkflow = workflow.compile();
    console.log('✅ [Financial Intelligence] Advanced workflow compiled successfully');
    
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ [Financial Intelligence] Workflow creation failed:', error);
    throw new Error(`Financial Intelligence workflow creation failed: ${error.message}`);
  }
}

// === Helper Functions ===

function getWeekOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

function calculateAdvancedMetrics(transactions) {
  const income = transactions.filter(t => t.amount > 0);
  const expenses = transactions.filter(t => t.amount < 0);
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
  
  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    avgTransactionAmount: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length,
    transactionCount: transactions.length,
    incomeTransactionCount: income.length,
    expenseTransactionCount: expenses.length,
    totalRange: Math.max(...transactions.map(t => Math.abs(t.amount))) - Math.min(...transactions.map(t => Math.abs(t.amount))),
    avgDailySpending: totalExpenses / Math.max(1, getDaySpan(transactions))
  };
}

function analyzeTimePatterns(transactions) {
  const byDay = {};
  const byMonth = {};
  const byWeek = {};
  
  transactions.forEach(t => {
    const day = t.dayOfWeek;
    const month = t.monthOfYear;
    const week = t.weekOfYear;
    
    byDay[day] = (byDay[day] || 0) + Math.abs(t.amount);
    byMonth[month] = (byMonth[month] || 0) + Math.abs(t.amount);
    byWeek[week] = (byWeek[week] || 0) + Math.abs(t.amount);
  });
  
  return { byDay, byMonth, byWeek };
}

function analyzeCategoryDistribution(transactions) {
  const distribution = {};
  
  transactions.forEach(t => {
    distribution[t.category] = distribution[t.category] || { count: 0, total: 0 };
    distribution[t.category].count += 1;
    distribution[t.category].total += Math.abs(t.amount);
  });
  
  return distribution;
}

// Daily spending pattern analysis
function analyzeDailySpendingPatterns(transactions) {
  const dailySpending = {};
  
  transactions.forEach(t => {
    const day = t.date.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    
    if (!dailySpending[dayName]) {
      dailySpending[dayName] = { total: 0, count: 0, avg: 0 };
    }
    
    dailySpending[dayName].total += Math.abs(t.amount);
    dailySpending[dayName].count += 1;
  });
  
  Object.keys(dailySpending).forEach(day => {
    dailySpending[day].avg = dailySpending[day].total / dailySpending[day].count;
  });
  
  return dailySpending;
}

// Weekly spending pattern analysis
function analyzeWeeklySpendingPatterns(transactions) {
  const weeklySpending = {};
  
  transactions.forEach(t => {
    const week = t.weekOfYear;
    
    if (!weeklySpending[week]) {
      weeklySpending[week] = { total: 0, count: 0, avg: 0 };
    }
    
    weeklySpending[week].total += Math.abs(t.amount);
    weeklySpending[week].count += 1;
  });
  
  Object.keys(weeklySpending).forEach(week => {
    weeklySpending[week].avg = weeklySpending[week].total / weeklySpending[week].count;
  });
  
  return weeklySpending;
}

// Monthly spending pattern analysis
function analyzeMonthlySpendingPatterns(transactions) {
  const monthlySpending = {};
  
  transactions.forEach(t => {
    const month = t.monthOfYear;
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    
    if (!monthlySpending[monthName]) {
      monthlySpending[monthName] = { total: 0, count: 0, avg: 0 };
    }
    
    monthlySpending[monthName].total += Math.abs(t.amount);
    monthlySpending[monthName].count += 1;
  });
  
  Object.keys(monthlySpending).forEach(month => {
    monthlySpending[month].avg = monthlySpending[month].total / monthlySpending[month].count;
  });
  
  return monthlySpending;
}

// === Additional Helper Functions for Anomaly Detection ===

function calculateAnomalyRiskScores(anomalies) {
  const riskScores = {
    overall: 0,
    byType: {}
  };
  
  let totalAnomalies = 0;
  let totalRisk = 0;
  
  Object.keys(anomalies).forEach(type => {
    const typeAnomalies = anomalies[type];
    if (Array.isArray(typeAnomalies)) {
      const typeRisk = typeAnomalies.reduce((sum, anomaly) => sum + (anomaly.riskScore || 0), 0);
      riskScores.byType[type] = {
        count: typeAnomalies.length,
        totalRisk: typeRisk,
        avgRisk: typeAnomalies.length > 0 ? typeRisk / typeAnomalies.length : 0
      };
      
      totalAnomalies += typeAnomalies.length;
      totalRisk += typeRisk;
    }
  });
  
  riskScores.overall = totalAnomalies > 0 ? totalRisk / totalAnomalies : 0;
  
  return riskScores;
}

function prioritizeAnomalies(anomalies, riskScores) {
  const allAnomalies = [];
  
  Object.keys(anomalies).forEach(type => {
    if (Array.isArray(anomalies[type])) {
      anomalies[type].forEach(anomaly => {
        allAnomalies.push({
          ...anomaly,
          type,
          priority: calculatePriority(anomaly, type)
        });
      });
    }
  });
  
  return allAnomalies.sort((a, b) => b.priority - a.priority);
}

function calculatePriority(anomaly, type) {
  const baseRisk = anomaly.riskScore || 0;
  const typeWeights = {
    amount: 1.0,
    frequency: 0.8,
    category: 0.7,
    temporal: 0.5,
    merchant: 0.3
  };
  
  const severityMultipliers = {
    high: 1.5,
    medium: 1.0,
    low: 0.5
  };
  
  const typeWeight = typeWeights[type] || 0.5;
  const severityMultiplier = severityMultipliers[anomaly.severity] || 1.0;
  
  return baseRisk * typeWeight * severityMultiplier;
}

async function generateAIAnomalyInsights(prioritizedAnomalies, transactions, patterns) {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: config.openai.timeout
  });

  const topAnomalies = prioritizedAnomalies.slice(0, 5);
  const prompt = `Analyze financial anomalies and provide insights:

DETECTED ANOMALIES (${prioritizedAnomalies.length} total):
${topAnomalies.map(a => `- ${a.type}: ${a.description} (Risk: ${(a.riskScore * 100).toFixed(0)}%)`).join('\n')}

CONTEXT:
- Total transactions analyzed: ${transactions.length}
- High-risk anomalies: ${prioritizedAnomalies.filter(a => a.riskScore > 0.7).length}
- Anomaly types detected: ${Array.from(new Set(prioritizedAnomalies.map(a => a.type))).join(', ')}

Provide JSON response with:
1. Risk assessment summary
2. Recommended actions (2-3 items)
3. Potential causes for top anomalies
4. Confidence score (0-1)

Keep response actionable and specific.`;

  try {
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;
    
    return {
      riskAssessment: extractRiskAssessment(analysis),
      recommendedActions: extractRecommendedActions(analysis),
      potentialCauses: extractPotentialCauses(analysis),
      confidence: extractConfidenceScore(analysis) || 0.8,
      rawAnalysis: analysis
    };
  } catch (error) {
    console.warn('AI anomaly insights failed:', error.message);
    throw error;
  }
}

function generateFallbackAnomalyInsights(prioritizedAnomalies) {
  const highRiskCount = prioritizedAnomalies.filter(a => a.riskScore > 0.7).length;
  const topTypes = Array.from(new Set(prioritizedAnomalies.map(a => a.type))).slice(0, 3);
  
  return {
    riskAssessment: highRiskCount > 0 ? 
      `${highRiskCount} high-risk anomalies detected` : 
      'Low risk anomalies detected',
    recommendedActions: [
      'Review unusual transactions for accuracy',
      'Monitor spending patterns for changes',
      'Consider setting spending alerts'
    ],
    potentialCauses: topTypes.map(type => `Unusual ${type} patterns detected`),
    confidence: 0.6
  };
}

// === Health Score Helpers ===

function getHealthGrade(score) {
  if (score >= 4.5) return 'A';
  if (score >= 4.0) return 'B+';
  if (score >= 3.5) return 'B';
  if (score >= 3.0) return 'B-';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'C-';
  if (score >= 1.0) return 'D';
  return 'F';
}

function calculateHealthPercentile(score) {
  // Simplified percentile calculation (in production, use real data)
  return Math.min(95, Math.max(5, Math.round(score * 20)));
}

function generateHealthRecommendations(healthComponents, overallScore) {
  const recommendations = [];
  
  if (healthComponents.cashFlowHealth.score < 3) {
    recommendations.push({
      priority: 'high',
      category: 'Cash Flow',
      action: 'Focus on increasing income or reducing expenses',
      impact: 'Improve monthly cash flow balance'
    });
  }
  
  if (healthComponents.spendingStability.score < 3) {
    recommendations.push({
      priority: 'medium',
      category: 'Stability',
      action: 'Create a consistent spending routine',
      impact: 'Reduce spending volatility'
    });
  }
  
  if (healthComponents.budgetingDiscipline.score < 3) {
    recommendations.push({
      priority: 'medium',
      category: 'Budgeting',
      action: 'Diversify spending across categories',
      impact: 'Better budget distribution'
    });
  }
  
  if (healthComponents.riskManagement.score < 3) {
    recommendations.push({
      priority: 'high',
      category: 'Risk',
      action: 'Review unusual transactions',
      impact: 'Reduce financial risk exposure'
    });
  }
  
  return recommendations;
}

async function generateAIHealthInsights(healthComponents, overallScore, transactions) {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: config.openai.timeout
  });

  const prompt = `Analyze financial health score and provide insights:

FINANCIAL HEALTH SCORE: ${overallScore.toFixed(2)}/5.0 (${getHealthGrade(overallScore)})

COMPONENT SCORES:
- Cash Flow Health: ${healthComponents.cashFlowHealth.score.toFixed(2)}/5.0 (${healthComponents.cashFlowHealth.assessment})
- Spending Stability: ${healthComponents.spendingStability.score.toFixed(2)}/5.0 (${healthComponents.spendingStability.assessment})
- Budgeting Discipline: ${healthComponents.budgetingDiscipline.score.toFixed(2)}/5.0 (${healthComponents.budgetingDiscipline.assessment})
- Risk Management: ${healthComponents.riskManagement.score.toFixed(2)}/5.0 (${healthComponents.riskManagement.assessment})

Provide JSON response with:
1. Strengths (2-3 items)
2. Areas for improvement (2-3 items)
3. Personalized advice
4. Confidence score (0-1)

Keep response encouraging and actionable.`;

  try {
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;
    
    return {
      strengths: extractStrengths(analysis),
      improvements: extractImprovements(analysis),
      personalizedAdvice: extractPersonalizedAdvice(analysis),
      confidence: extractConfidenceScore(analysis) || 0.8,
      rawAnalysis: analysis
    };
  } catch (error) {
    console.warn('AI health insights failed:', error.message);
    throw error;
  }
}

function generateFallbackHealthInsights(healthComponents, overallScore) {
  const strengths = [];
  const improvements = [];
  
  Object.keys(healthComponents).forEach(component => {
    const comp = healthComponents[component];
    if (comp.score >= 3.5) {
      strengths.push(`Good ${component.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } else if (comp.score < 2.5) {
      improvements.push(`Improve ${component.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }
  });
  
  return {
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    personalizedAdvice: overallScore >= 3.5 ? 
      'You have good financial habits, keep it up!' :
      'Focus on the lowest scoring areas for improvement',
    confidence: 0.7
  };
}

// === Categorization Helpers ===

function categorizeBinaryRules(transaction) {
  const description = transaction.description.toLowerCase();
  const amount = Math.abs(transaction.amount);
  
  // Simple rule-based categorization
  if (description.includes('grocery') || description.includes('supermarket')) {
    return { category: 'Groceries', confidence: 0.9, method: 'rule' };
  }
  if (description.includes('gas') || description.includes('fuel')) {
    return { category: 'Transportation', confidence: 0.9, method: 'rule' };
  }
  if (description.includes('restaurant') || description.includes('food')) {
    return { category: 'Dining', confidence: 0.8, method: 'rule' };
  }
  if (description.includes('rent') || description.includes('mortgage')) {
    return { category: 'Housing', confidence: 0.95, method: 'rule' };
  }
  if (amount > 0) {
    return { category: 'Income', confidence: 0.7, method: 'rule' };
  }
  
  return { category: 'Other', confidence: 0.3, method: 'rule' };
}

function categorizeByPatterns(transaction) {
  // Pattern-based categorization using amount ranges and merchant patterns
  const amount = Math.abs(transaction.amount);
  const merchant = extractMerchantName(transaction.description);
  
  if (amount < 10) {
    return { category: 'Small Purchases', confidence: 0.6, method: 'pattern' };
  }
  if (amount > 1000) {
    return { category: 'Large Expenses', confidence: 0.7, method: 'pattern' };
  }
  if (merchant.length > 0) {
    return { category: 'Retail', confidence: 0.5, method: 'pattern' };
  }
  
  return { category: 'General', confidence: 0.4, method: 'pattern' };
}

async function categorizeWithAI(transaction) {
  // Simplified AI categorization (in production, would use a trained model)
  return { category: 'AI_Category', confidence: 0.8, method: 'ai' };
}

function selectBestCategory(ruleCategory, patternCategory, aiCategory, originalCategory) {
  const candidates = [
    { ...ruleCategory, weight: 0.4 },
    { ...patternCategory, weight: 0.3 },
    aiCategory ? { ...aiCategory, weight: 0.3 } : null,
    { category: originalCategory, confidence: 0.5, method: 'original', weight: 0.2 }
  ].filter(Boolean);
  
  // Select category with highest weighted confidence
  const best = candidates.reduce((best, candidate) => {
    const score = candidate.confidence * candidate.weight;
    return score > (best.confidence * best.weight) ? candidate : best;
  });
  
  return {
    category: best.category,
    confidence: best.confidence,
    methods: candidates.map(c => c.method)
  };
}

function analyzeCategorizationResults(categorizedTransactions) {
  const stats = {
    totalCategorized: categorizedTransactions.length,
    avgConfidence: 0,
    categoryDistribution: {},
    methodUsage: {}
  };
  
  let totalConfidence = 0;
  
  categorizedTransactions.forEach(t => {
    totalConfidence += t.categoryConfidence || 0;
    
    const category = t.suggestedCategory || 'Unknown';
    stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
    
    if (t.categorizationMethods) {
      t.categorizationMethods.forEach(method => {
        stats.methodUsage[method] = (stats.methodUsage[method] || 0) + 1;
      });
    }
  });
  
  stats.avgConfidence = totalConfidence / categorizedTransactions.length;
  
  return stats;
}

// === Insights and Recommendations Helpers ===

function generateExecutiveSummary(state) {
  const transactions = state.transactionData?.transactions || [];
  const healthScore = state.healthScore?.overall?.score || 0;
  const anomalies = state.anomalies?.totalAnomalies || 0;
  
  return {
    totalTransactions: transactions.length,
    healthScore: healthScore,
    healthGrade: getHealthGrade(healthScore),
    anomaliesFound: anomalies,
    timeSpan: getDaySpan(transactions),
    summary: healthScore >= 3.5 ? 
      'Your financial health is good with stable patterns' :
      'There are areas for financial improvement'
  };
}

function extractKeyFindings(state) {
  const findings = [];
  
  if (state.spendingPatterns?.insights?.keyInsights) {
    findings.push(...state.spendingPatterns.insights.keyInsights.slice(0, 3));
  }
  
  if (state.anomalies?.totalAnomalies > 0) {
    findings.push(`${state.anomalies.totalAnomalies} spending anomalies detected`);
  }
  
  if (state.healthScore?.overall?.score) {
    findings.push(`Financial health score: ${state.healthScore.overall.score.toFixed(1)}/5.0`);
  }
  
  return findings;
}

function generateTrendAnalysis(state) {
  return {
    spendingTrend: state.spendingPatterns?.temporal ? 'Analyzed' : 'Not available',
    seasonalPatterns: state.spendingPatterns?.temporal?.seasonalTrends ? 'Detected' : 'Not detected',
    categoryTrends: state.spendingPatterns?.categorical?.categoryTrends ? 'Analyzed' : 'Not available'
  };
}

function generateRiskAssessment(state) {
  const anomalyCount = state.anomalies?.totalAnomalies || 0;
  const healthScore = state.healthScore?.overall?.score || 0;
  
  let riskLevel = 'Low';
  if (anomalyCount > 5 || healthScore < 2.5) riskLevel = 'High';
  else if (anomalyCount > 2 || healthScore < 3.5) riskLevel = 'Medium';
  
  return {
    level: riskLevel,
    factors: [
      `${anomalyCount} anomalies detected`,
      `Health score: ${healthScore.toFixed(1)}/5.0`
    ]
  };
}

function identifyOpportunities(state) {
  const opportunities = [];
  
  if (state.healthScore?.components?.cashFlowHealth?.score >= 4) {
    opportunities.push('Good cash flow - consider investment opportunities');
  }
  
  if (state.spendingPatterns?.categorical?.topCategories?.length > 0) {
    const topCategory = state.spendingPatterns.categorical.topCategories[0];
    opportunities.push(`Optimize ${topCategory.category} spending for savings`);
  }
  
  return opportunities;
}

function generateImmediateRecommendations(state) {
  const recommendations = [];
  
  if (state.anomalies?.highRiskAnomalies > 0) {
    recommendations.push('Review high-risk anomalies immediately');
  }
  
  if (state.healthScore?.components?.cashFlowHealth?.score < 2) {
    recommendations.push('Address negative cash flow urgently');
  }
  
  return recommendations;
}

function generateShortTermRecommendations(state) {
  return [
    'Set up spending category budgets',
    'Monitor spending patterns weekly',
    'Review and categorize transactions regularly'
  ];
}

function generateLongTermRecommendations(state) {
  return [
    'Build emergency fund',
    'Optimize spending across all categories',
    'Create long-term financial goals'
  ];
}

async function generateAIPersonalizedRecommendations(state) {
  // Simplified - in production would use comprehensive AI analysis
  return {
    personalizedTips: [
      'Based on your spending patterns, consider automating savings',
      'Your highest category could be optimized for better value'
    ],
    goals: [
      'Improve health score by 0.5 points',
      'Reduce spending anomalies by 50%'
    ],
    confidence: 0.8
  };
}

function generateFallbackPersonalizedRecommendations(state) {
  return {
    personalizedTips: [
      'Review your spending regularly',
      'Set clear financial goals'
    ],
    goals: [
      'Maintain consistent spending patterns',
      'Monitor financial health monthly'
    ],
    confidence: 0.6
  };
}

function calculateOverallConfidence(state) {
  const confidences = [];
  
  if (state.spendingPatterns?.confidence) confidences.push(state.spendingPatterns.confidence);
  if (state.healthScore?.confidence) confidences.push(state.healthScore.confidence);
  if (state.anomalies?.aiAnalysis?.confidence) confidences.push(state.anomalies.aiAnalysis.confidence);
  
  return confidences.length > 0 ? 
    confidences.reduce((sum, c) => sum + c, 0) / confidences.length : 0.7;
}

// === AI Response Parsing Helpers ===

function extractRiskAssessment(analysis) {
  const match = analysis.match(/risk[^:]*:\s*([^\.]+)/i);
  return match ? match[1].trim() : 'Risk assessment completed';
}

function extractRecommendedActions(analysis) {
  const lines = analysis.split('\n').filter(line => 
    line.includes('•') || line.includes('-') || line.includes('action')
  );
  return lines.slice(0, 3).map(line => line.replace(/^[•\-\d\.]+\s*/, '').trim());
}

function extractPotentialCauses(analysis) {
  const lines = analysis.split('\n').filter(line => 
    line.includes('cause') || line.includes('reason')
  );
  return lines.slice(0, 3).map(line => line.replace(/^[•\-\d\.]+\s*/, '').trim());
}

function extractStrengths(analysis) {
  const lines = analysis.split('\n').filter(line => 
    line.includes('strength') || line.includes('good') || line.includes('excellent')
  );
  return lines.slice(0, 3).map(line => line.replace(/^[•\-\d\.]+\s*/, '').trim());
}

function extractImprovements(analysis) {
  const lines = analysis.split('\n').filter(line => 
    line.includes('improve') || line.includes('better') || line.includes('enhance')
  );
  return lines.slice(0, 3).map(line => line.replace(/^[•\-\d\.]+\s*/, '').trim());
}

function extractPersonalizedAdvice(analysis) {
  const match = analysis.match(/advice[^:]*:\s*([^\.]+)/i);
  return match ? match[1].trim() : 'Continue monitoring your financial health';
}

function extractConfidenceScore(analysisText) {
  const match = analysisText.match(/confidence[^:]*:\s*([0-9\.]+)/i);
  return match ? parseFloat(match[1]) : null;
}

module.exports = {
  createFinancialIntelligenceWorkflow,
  financialIntelligenceState,
  // Export individual nodes for testing
  loadAndPreprocessTransactions,
  analyzeSpendingPatterns,
  detectAnomalies,
  calculateFinancialHealthScore,
  categorizeTransactions,
  generateInsightsAndRecommendations
}; 