/**
 * LangGraph Foundation - Phase 3.5.1
 * Proper LangGraph framework setup with StateGraph and OpenAI integration
 * FlowGenius Assignment Requirement: LangGraph Implementation
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require("openai");
const config = require('../config');

/**
 * Define the workflow state schema
 * Simple object-based state for LangGraph 0.0.19 compatibility
 */
const initialState = {
  // Input data
  rawData: null,
  
  // Processed data
  processedData: null,
  
  // Analysis results
  patterns: null,
  
  // Projections
  projections: null,
  
  // Scenario adjustments
  scenarios: null,
  
  // Final result
  finalResult: null,
  
  // Metadata
  metadata: {
    startTime: Date.now(),
    currentNode: null,
    processingSteps: [],
    version: '3.5.1',
    framework: 'LangGraph'
  },
  
  // Error tracking
  errors: []
};

/**
 * LangGraph Node: Data Ingestion and Validation
 * First step in the financial analysis workflow
 */
async function dataIngestionNode(state) {
  console.log('🔄 [LangGraph] Data Ingestion Node: Processing financial data...');
  
  try {
    const nodeStart = Date.now();
    
    // Validate input data
    if (!state.rawData || !Array.isArray(state.rawData.transactions)) {
      throw new Error('Invalid financial data: transactions array required');
    }

    // Process and clean the data
    const transactions = state.rawData.transactions;
    const processedTransactions = transactions
      .filter(t => t.amount && t.date)
      .map(t => ({
        ...t,
        amount: parseFloat(t.amount),
        date: new Date(t.date),
        category: t.category || 'Other',
        type: parseFloat(t.amount) >= 0 ? 'Income' : 'Expense'
      }))
      .sort((a, b) => a.date - b.date);

    // Calculate comprehensive metrics
    const income = processedTransactions.filter(t => t.amount > 0);
    const expenses = processedTransactions.filter(t => t.amount < 0);
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const currentBalance = processedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const processedData = {
      transactions: processedTransactions,
      income: income,
      expenses: expenses,
      summary: {
        totalTransactions: processedTransactions.length,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        currentBalance,
        averageMonthlyIncome: totalIncome / Math.max(1, getMonthSpan(processedTransactions)),
        averageMonthlyExpenses: totalExpenses / Math.max(1, getMonthSpan(processedTransactions)),
        dateRange: {
          start: processedTransactions[0]?.date,
          end: processedTransactions[processedTransactions.length - 1]?.date
        }
      },
      categories: categorizeTransactions(processedTransactions),
      quality: {
        completeness: calculateDataCompleteness(processedTransactions),
        consistency: calculateDataConsistency(processedTransactions),
        recency: calculateDataRecency(processedTransactions)
      }
    };

    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [LangGraph] Data ingestion completed: ${processedTransactions.length} transactions processed in ${processingTime}ms`);
    
    return {
      ...state,
      processedData,
      metadata: {
        ...state.metadata,
        currentNode: 'dataIngestion',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'dataIngestion',
          duration: processingTime,
          timestamp: Date.now(),
          success: true
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Data Ingestion Error:', error);
    return {
      ...state,
      errors: [...state.errors, { node: 'dataIngestion', error: error.message, timestamp: Date.now() }],
      metadata: {
        ...state.metadata,
        currentNode: 'dataIngestion',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'dataIngestion',
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
 * LangGraph Node: AI-Powered Pattern Analysis
 * Uses OpenAI to analyze financial patterns and trends
 */
async function patternAnalysisNode(state) {
  console.log('🔍 [LangGraph] Pattern Analysis Node: AI analysis starting...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.processedData) {
      throw new Error('No processed data available for pattern analysis');
    }

    let patterns;
    
    if (!config.isAIEnabled) {
      // Fallback analysis without AI
      patterns = createFallbackPatterns(state.processedData);
      console.log('⚠️ [LangGraph] Using fallback analysis (AI not configured)');
    } else {
      // AI-powered analysis
      patterns = await performAIPatternAnalysis(state.processedData);
      console.log('✅ [LangGraph] AI pattern analysis completed');
    }

    const processingTime = Date.now() - nodeStart;
    
    return {
      ...state,
      patterns,
      metadata: {
        ...state.metadata,
        currentNode: 'patternAnalysis',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'patternAnalysis',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          aiEnabled: config.isAIEnabled
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Pattern Analysis Error:', error);
    return {
      ...state,
      errors: [...state.errors, { node: 'patternAnalysis', error: error.message, timestamp: Date.now() }],
      metadata: {
        ...state.metadata,
        currentNode: 'patternAnalysis',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'patternAnalysis',
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
 * LangGraph Node: Financial Projections Calculation
 * Performs mathematical projections based on patterns
 */
async function projectionCalculationNode(state) {
  console.log('📊 [LangGraph] Projection Calculation Node: Computing forecasts...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.processedData || !state.patterns) {
      throw new Error('Missing processed data or patterns for projection calculation');
    }

    const projections = calculateFinancialProjections(state.processedData, state.patterns);
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [LangGraph] Projections calculated for ${Object.keys(projections.timeframes).length} timeframes in ${processingTime}ms`);
    
    return {
      ...state,
      projections,
      metadata: {
        ...state.metadata,
        currentNode: 'projectionCalculation',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'projectionCalculation',
          duration: processingTime,
          timestamp: Date.now(),
          success: true
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Projection Calculation Error:', error);
    return {
      ...state,
      errors: [...state.errors, { node: 'projectionCalculation', error: error.message, timestamp: Date.now() }],
      metadata: {
        ...state.metadata,
        currentNode: 'projectionCalculation',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'projectionCalculation',
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
 * LangGraph Node: Scenario Application
 * Applies scenario adjustments to base projections
 */
async function scenarioApplicationNode(state) {
  console.log('🎭 [LangGraph] Scenario Application Node: Applying scenarios...');
  
  try {
    const nodeStart = Date.now();
    
    if (!state.projections) {
      throw new Error('No projections available for scenario application');
    }

    const scenarios = state.rawData?.scenarios || [];
    const adjustedProjections = applyScenarios(state.projections, scenarios);
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [LangGraph] Applied ${scenarios.length} scenarios in ${processingTime}ms`);
    
    return {
      ...state,
      scenarios: {
        applied: scenarios,
        adjustedProjections,
        baseProjections: state.projections
      },
      metadata: {
        ...state.metadata,
        currentNode: 'scenarioApplication',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'scenarioApplication',
          duration: processingTime,
          timestamp: Date.now(),
          success: true,
          scenariosApplied: scenarios.length
        }]
      }
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Scenario Application Error:', error);
    return {
      ...state,
      errors: [...state.errors, { node: 'scenarioApplication', error: error.message, timestamp: Date.now() }],
      metadata: {
        ...state.metadata,
        currentNode: 'scenarioApplication',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'scenarioApplication',
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
 * LangGraph Node: Result Formatting
 * Final formatting and packaging of results
 */
async function resultFormattingNode(state) {
  console.log('📋 [LangGraph] Result Formatting Node: Finalizing results...');
  
  try {
    const nodeStart = Date.now();
    const totalStartTime = state.metadata.startTime;
    
    const finalResult = {
      // Executive Summary
      summary: {
        currentBalance: state.processedData?.summary?.currentBalance || 0,
        monthlyNetIncome: state.processedData?.summary?.netIncome || 0,
        projectedBalance: state.scenarios?.adjustedProjections?.timeframes?.['1_year']?.projectedBalance || 
                         state.projections?.timeframes?.['1_year']?.projectedBalance || 0,
        confidence: calculateOverallConfidence(state),
        riskLevel: assessRiskLevel(state)
      },
      
      // Detailed Data
      data: {
        historical: state.processedData,
        patterns: state.patterns,
        projections: state.projections,
        scenarios: state.scenarios
      },
      
      // Insights and Recommendations
      insights: extractFinalInsights(state),
      recommendations: generateRecommendations(state),
      
      // Quality Metrics
      quality: calculateFinalQuality(state),
      
      // Metadata
      metadata: {
        ...state.metadata,
        endTime: Date.now(),
        totalDuration: Date.now() - totalStartTime,
        success: state.errors.length === 0,
        framework: 'LangGraph',
        version: '3.5.1'
      },
      
      // Errors (if any)
      errors: state.errors || []
    };
    
    const processingTime = Date.now() - nodeStart;
    
    console.log(`✅ [LangGraph] Workflow completed successfully in ${Date.now() - totalStartTime}ms`);
    
    return {
      ...state,
      finalResult,
      metadata: {
        ...state.metadata,
        currentNode: 'resultFormatting',
        processingSteps: [...state.metadata.processingSteps, {
          node: 'resultFormatting',
          duration: processingTime,
          timestamp: Date.now(),
          success: true
        }],
        endTime: Date.now(),
        totalDuration: Date.now() - totalStartTime
      }
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Result Formatting Error:', error);
    return {
      ...state,
      errors: [...state.errors, { node: 'resultFormatting', error: error.message, timestamp: Date.now() }],
      finalResult: {
        success: false,
        error: error.message,
        partialData: {
          processedData: state.processedData,
          patterns: state.patterns,
          projections: state.projections
        }
      },
      metadata: {
        ...state.metadata,
        currentNode: 'resultFormatting',
        success: false,
        endTime: Date.now()
      }
    };
  }
}

/**
 * Create the LangGraph Workflow
 * This is the main workflow factory function
 */
function createLangGraphWorkflow() {
  console.log('🏗️ [LangGraph] Creating financial analysis workflow...');
  
  try {
    // Create StateGraph with proper channels definition for LangGraph 0.0.19
    const workflow = new StateGraph({
      channels: {
        rawData: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        processedData: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        patterns: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        projections: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        scenarios: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        finalResult: {
          value: (x, y) => y ?? x ?? null,
          default: () => null
        },
        metadata: {
          value: (x, y) => ({ ...x, ...y }),
          default: () => ({
            startTime: Date.now(),
            currentNode: null,
            processingSteps: [],
            version: '3.5.1',
            framework: 'LangGraph'
          })
        },
        errors: {
          value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
          default: () => []
        }
      }
    })
      .addNode("dataIngestion", dataIngestionNode)
      .addNode("patternAnalysis", patternAnalysisNode)
      .addNode("projectionCalculation", projectionCalculationNode)
      .addNode("scenarioApplication", scenarioApplicationNode)
      .addNode("resultFormatting", resultFormattingNode)
      .addEdge(START, "dataIngestion")
      .addEdge("dataIngestion", "patternAnalysis")
      .addEdge("patternAnalysis", "projectionCalculation")
      .addEdge("projectionCalculation", "scenarioApplication")
      .addEdge("scenarioApplication", "resultFormatting")
      .addEdge("resultFormatting", END);

    const compiledWorkflow = workflow.compile();
    console.log('✅ [LangGraph] Workflow compiled successfully');
    
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ [LangGraph] Workflow creation failed:', error);
    throw new Error(`LangGraph workflow creation failed: ${error.message}`);
  }
}

// === Helper Functions ===

function getMonthSpan(transactions) {
  if (transactions.length < 2) return 1;
  const start = new Date(transactions[0].date);
  const end = new Date(transactions[transactions.length - 1].date);
  return Math.max(1, Math.ceil((end - start) / (30 * 24 * 60 * 60 * 1000)));
}

function categorizeTransactions(transactions) {
  const categories = {};
  transactions.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = { total: 0, count: 0, average: 0 };
    }
    categories[t.category].total += Math.abs(t.amount);
    categories[t.category].count += 1;
  });
  
  Object.keys(categories).forEach(cat => {
    categories[cat].average = categories[cat].total / categories[cat].count;
  });
  
  return categories;
}

function calculateDataCompleteness(transactions) {
  const requiredFields = ['amount', 'date', 'description'];
  let completeness = 0;
  
  transactions.forEach(t => {
    const fieldScore = requiredFields.filter(field => t[field] && t[field] !== '').length;
    completeness += fieldScore / requiredFields.length;
  });
  
  return Math.round((completeness / transactions.length) * 100) / 100;
}

function calculateDataConsistency(transactions) {
  // Check for consistent date format and reasonable amounts
  const dateConsistency = transactions.filter(t => t.date instanceof Date).length / transactions.length;
  const amountConsistency = transactions.filter(t => !isNaN(t.amount) && isFinite(t.amount)).length / transactions.length;
  
  return Math.round(((dateConsistency + amountConsistency) / 2) * 100) / 100;
}

function calculateDataRecency(transactions) {
  if (transactions.length === 0) return 0;
  
  const latest = new Date(transactions[transactions.length - 1].date);
  const now = new Date();
  const daysSinceLatest = Math.ceil((now - latest) / (24 * 60 * 60 * 1000));
  
  // Score based on recency (1.0 for current day, decreasing over time)
  return Math.max(0, Math.min(1, 1 - (daysSinceLatest / 30)));
}

function createFallbackPatterns(processedData) {
  const { summary, categories } = processedData;
  
  return {
    trends: {
      direction: summary.netIncome > 0 ? 'positive' : 'negative',
      strength: Math.abs(summary.netIncome) / Math.max(summary.totalIncome, 1),
      description: 'Basic trend analysis (no AI)'
    },
    categories: categories,
    insights: [
      `Monthly net income: $${(summary.netIncome / 12).toFixed(2)}`,
      `Top expense category: ${Object.keys(categories).reduce((a, b) => 
        categories[a].total > categories[b].total ? a : b, 'Unknown')}`
    ],
    confidence: 0.6
  };
}

async function performAIPatternAnalysis(processedData) {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: config.openai.timeout
  });

  const { summary, transactions } = processedData;
  const recentTransactions = transactions.slice(-20);

  const prompt = `Analyze financial data and provide structured insights:

SUMMARY:
- Income: $${summary.totalIncome.toFixed(2)}
- Expenses: $${summary.totalExpenses.toFixed(2)}
- Net: $${summary.netIncome.toFixed(2)}
- Balance: $${summary.currentBalance.toFixed(2)}

RECENT TRANSACTIONS:
${recentTransactions.map(t => 
  `${t.date.toISOString().split('T')[0]}: ${t.description} - $${t.amount.toFixed(2)}`
).join('\n')}

Provide JSON response with:
1. Spending trends
2. Risk factors
3. Opportunities
4. Key insights (3-5 points)

Keep response concise and actionable.`;

  try {
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;
    
    return {
      trends: {
        direction: summary.netIncome > 0 ? 'positive' : 'negative',
        strength: Math.abs(summary.netIncome) / Math.max(summary.totalIncome, 1),
        description: 'AI-powered trend analysis'
      },
      categories: processedData.categories,
      insights: extractInsightsFromAI(analysis),
      risks: ['Market volatility', 'Income stability'],
      opportunities: ['Budget optimization', 'Investment planning'],
      aiAnalysis: analysis,
      confidence: 0.85
    };
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error.message);
    return createFallbackPatterns(processedData);
  }
}

function extractInsightsFromAI(analysisText) {
  // Simple extraction - in production would use more sophisticated parsing
  const lines = analysisText.split('\n').filter(line => line.trim());
  return lines.slice(0, 5).map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function calculateFinancialProjections(processedData, patterns) {
  const { summary } = processedData;
  const monthlyNet = summary.netIncome / 12;
  const currentBalance = summary.currentBalance;
  
  // Apply trend adjustments
  const trendMultiplier = patterns.trends.strength > 0.1 ? 
    (patterns.trends.direction === 'positive' ? 1.05 : 0.95) : 1.0;
  
  return {
    baseProjection: {
      monthlyNet: monthlyNet * trendMultiplier,
      confidence: patterns.confidence
    },
    timeframes: {
      '3_months': {
        projectedBalance: currentBalance + (monthlyNet * trendMultiplier * 3),
        confidence: patterns.confidence * 0.95
      },
      '6_months': {
        projectedBalance: currentBalance + (monthlyNet * trendMultiplier * 6),
        confidence: patterns.confidence * 0.9
      },
      '1_year': {
        projectedBalance: currentBalance + (monthlyNet * trendMultiplier * 12),
        confidence: patterns.confidence * 0.8
      }
    }
  };
}

function applyScenarios(projections, scenarios) {
  const adjusted = JSON.parse(JSON.stringify(projections));
  
  scenarios.forEach(scenario => {
    Object.keys(adjusted.timeframes).forEach(timeframe => {
      switch (scenario.type) {
        case 'salary_change':
          const salaryImpact = (scenario.percentage / 100) * adjusted.baseProjection.monthlyNet;
          adjusted.timeframes[timeframe].projectedBalance += salaryImpact * 
            parseInt(timeframe.split('_')[0]) * (timeframe.includes('months') ? 1 : 12);
          break;
        case 'expense_change':
          const expenseImpact = -(scenario.percentage / 100) * Math.abs(adjusted.baseProjection.monthlyNet);
          adjusted.timeframes[timeframe].projectedBalance += expenseImpact * 
            parseInt(timeframe.split('_')[0]) * (timeframe.includes('months') ? 1 : 12);
          break;
      }
    });
  });
  
  return adjusted;
}

function calculateOverallConfidence(state) {
  if (state.errors.length > 0) return 0.3;
  
  const baseConfidence = state.patterns?.confidence || 0.5;
  const dataQuality = state.processedData?.quality?.completeness || 0.5;
  
  return Math.round((baseConfidence + dataQuality) / 2 * 100) / 100;
}

function assessRiskLevel(state) {
  const netIncome = state.processedData?.summary?.netIncome || 0;
  const balance = state.processedData?.summary?.currentBalance || 0;
  
  if (netIncome < 0 && balance < 1000) return 'High';
  if (netIncome < 0 || balance < 5000) return 'Medium';
  return 'Low';
}

function extractFinalInsights(state) {
  const baseInsights = state.patterns?.insights || [];
  const processingInsights = [
    `Processed ${state.processedData?.summary?.totalTransactions || 0} transactions`,
    `Data quality score: ${((state.processedData?.quality?.completeness || 0.5) * 100).toFixed(0)}%`,
    `Analysis confidence: ${((state.patterns?.confidence || 0.5) * 100).toFixed(0)}%`
  ];
  
  return [...baseInsights, ...processingInsights];
}

function generateRecommendations(state) {
  const recommendations = [];
  const netIncome = state.processedData?.summary?.netIncome || 0;
  const balance = state.processedData?.summary?.currentBalance || 0;
  
  if (netIncome < 0) {
    recommendations.push('Focus on reducing expenses or increasing income');
  } else if (netIncome > 0) {
    recommendations.push('Consider investment opportunities for positive cash flow');
  }
  
  if (balance < 10000) {
    recommendations.push('Build emergency fund to 3-6 months of expenses');
  }
  
  if (state.errors.length > 0) {
    recommendations.push('Review data quality for more accurate projections');
  }
  
  return recommendations;
}

function calculateFinalQuality(state) {
  const dataQuality = state.processedData?.quality?.completeness || 0.5;
  const analysisQuality = state.patterns?.confidence || 0.5;
  const processingQuality = state.errors.length === 0 ? 1.0 : 0.7;
  
  return {
    overall: Math.round(((dataQuality + analysisQuality + processingQuality) / 3) * 100) / 100,
    data: dataQuality,
    analysis: analysisQuality,
    processing: processingQuality
  };
}

module.exports = {
  initialState,
  createLangGraphWorkflow,
  // Export individual nodes for testing
  dataIngestionNode,
  patternAnalysisNode,
  projectionCalculationNode,
  scenarioApplicationNode,
  resultFormattingNode
}; 