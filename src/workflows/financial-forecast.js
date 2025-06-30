/**
 * Financial Forecasting Workflow using LangGraph
 * Multi-step AI workflow for intelligent financial projections
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require("openai");
const config = require('../config');

/**
 * State interface for the workflow
 */
class ForecastState {
  constructor() {
    this.rawData = null;           // Input financial data
    this.processedData = null;     // Cleaned and validated data
    this.patterns = null;          // Detected patterns and trends
    this.baseProjection = null;    // Base case projection
    this.scenarioAdjustments = null; // Scenario-specific adjustments
    this.finalForecast = null;     // Final formatted forecast
    this.confidence = null;        // Confidence metrics
    this.insights = null;          // Generated insights
    this.errors = [];              // Error tracking
    this.metadata = {
      startTime: null,
      processingTime: null,
      modelUsed: config.openai.model,
      version: '1.0.0'
    };
  }
}

/**
 * Data Ingestion Node
 * Validates and prepares financial data for analysis
 */
async function dataIngestionNode(state) {
  console.log('🔄 Data Ingestion Node: Processing financial data...');
  
  try {
    state.metadata.startTime = new Date();
    
    // Validate input data
    if (!state.rawData || !Array.isArray(state.rawData.transactions)) {
      throw new Error('Invalid financial data provided');
    }

    // Process and clean the data
    const transactions = state.rawData.transactions;
    const processedTransactions = transactions
      .filter(t => t.amount && t.date)
      .map(t => ({
        ...t,
        amount: parseFloat(t.amount),
        date: new Date(t.date),
        category: t.category || 'Other'
      }))
      .sort((a, b) => a.date - b.date);

    // Calculate basic metrics
    const totalIncome = processedTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = Math.abs(processedTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const currentBalance = processedTransactions
      .reduce((sum, t) => sum + t.amount, 0);

    state.processedData = {
      transactions: processedTransactions,
      summary: {
        totalTransactions: processedTransactions.length,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        currentBalance,
        dateRange: {
          start: processedTransactions[0]?.date,
          end: processedTransactions[processedTransactions.length - 1]?.date
        }
      }
    };

    console.log(`✅ Processed ${processedTransactions.length} transactions`);
    return state;
    
  } catch (error) {
    console.error('❌ Data Ingestion Error:', error);
    state.errors.push({ node: 'dataIngestion', error: error.message });
    return state;
  }
}

/**
 * Pattern Analysis Node
 * Uses AI to detect spending patterns, trends, and seasonality
 */
async function patternAnalysisNode(state) {
  console.log('🔍 Pattern Analysis Node: Analyzing financial patterns...');
  
  try {
    if (!state.processedData) {
      throw new Error('No processed data available for pattern analysis');
    }

    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    });

    // Prepare data summary for AI analysis
    const { summary, transactions } = state.processedData;
    const recentTransactions = transactions.slice(-20); // Last 20 transactions

    const prompt = `Analyze the following financial data and identify patterns, trends, and insights:

FINANCIAL SUMMARY:
- Total Income: $${summary.totalIncome.toFixed(2)}
- Total Expenses: $${summary.totalExpenses.toFixed(2)}
- Net Income: $${summary.netIncome.toFixed(2)}
- Current Balance: $${summary.currentBalance.toFixed(2)}
- Date Range: ${summary.dateRange.start?.toDateString()} to ${summary.dateRange.end?.toDateString()}

RECENT TRANSACTIONS (${recentTransactions.length}):
${recentTransactions.map(t => 
  `${t.date.toDateString()}: ${t.description} - $${t.amount.toFixed(2)} (${t.category})`
).join('\n')}

Please analyze and provide:
1. Spending patterns and trends
2. Seasonal variations
3. Recurring transactions
4. Unusual activity or outliers
5. Financial behavior insights

Format as structured JSON with these keys:
{
  "trends": { "direction": "increasing/decreasing/stable", "rate": "percentage", "description": "text" },
  "patterns": { "recurring": [], "seasonal": [], "categories": {} },
  "insights": ["insight1", "insight2", ...],
  "risks": ["risk1", "risk2", ...],
  "opportunities": ["opp1", "opp2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3
    });

    // Parse AI response
    const analysisText = completion.choices[0].message.content;
    let patterns;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      patterns = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      console.warn('Could not parse JSON from AI response, using fallback analysis');
    }

    // Fallback analysis if AI parsing fails
    if (!patterns) {
      patterns = {
        trends: { 
          direction: summary.netIncome > 0 ? 'positive' : 'negative', 
          rate: '0%', 
          description: 'Basic trend analysis' 
        },
        patterns: { recurring: [], seasonal: [], categories: {} },
        insights: ['Pattern analysis in progress'],
        risks: [],
        opportunities: []
      };
    }

    state.patterns = {
      ...patterns,
      rawAnalysis: analysisText,
      processingTime: Date.now() - state.metadata.startTime.getTime()
    };

    console.log('✅ Pattern analysis completed');
    return state;
    
  } catch (error) {
    console.error('❌ Pattern Analysis Error:', error);
    state.errors.push({ node: 'patternAnalysis', error: error.message });
    return state;
  }
}

/**
 * Projection Calculation Node
 * Performs mathematical projections based on detected patterns
 */
async function projectionCalculationNode(state) {
  console.log('📊 Projection Calculation Node: Computing forecasts...');
  
  try {
    if (!state.processedData || !state.patterns) {
      throw new Error('Missing required data for projection calculations');
    }

    const { summary } = state.processedData;
    const timeframes = [3, 6, 12, 24, 36]; // months
    const projections = {};

    // Calculate projections for each timeframe
    for (const months of timeframes) {
      const monthlyNetIncome = summary.netIncome / 12; // Assuming yearly data
      const projectedBalance = summary.currentBalance + (monthlyNetIncome * months);
      
      // Apply trend adjustments if available
      let trendAdjustment = 1.0;
      if (state.patterns.trends?.direction === 'increasing') {
        trendAdjustment = 1.05; // 5% optimistic adjustment
      } else if (state.patterns.trends?.direction === 'decreasing') {
        trendAdjustment = 0.95; // 5% pessimistic adjustment
      }

      const adjustedBalance = projectedBalance * trendAdjustment;
      
      projections[`${months}months`] = {
        timeframe: `${months} months`,
        projectedBalance: Math.round(adjustedBalance * 100) / 100,
        monthlyChange: Math.round(monthlyNetIncome * trendAdjustment * 100) / 100,
        confidence: Math.max(0.3, 0.9 - (months * 0.1)), // Decreasing confidence over time
        assumptions: [
          'Current spending patterns continue',
          'No major life changes',
          'Economic conditions remain stable'
        ]
      };
    }

    // Calculate best/worst case scenarios
    const baseProjection = projections['12months'];
    const optimisticMultiplier = 1.2;
    const pessimisticMultiplier = 0.8;

    state.baseProjection = {
      timeframes: projections,
      scenarios: {
        base: baseProjection,
        optimistic: {
          ...baseProjection,
          projectedBalance: baseProjection.projectedBalance * optimisticMultiplier,
          scenario: 'Optimistic (20% better than expected)'
        },
        pessimistic: {
          ...baseProjection,
          projectedBalance: baseProjection.projectedBalance * pessimisticMultiplier,
          scenario: 'Pessimistic (20% worse than expected)'
        }
      }
    };

    console.log('✅ Projection calculations completed');
    return state;
    
  } catch (error) {
    console.error('❌ Projection Calculation Error:', error);
    state.errors.push({ node: 'projectionCalculation', error: error.message });
    return state;
  }
}

/**
 * Scenario Application Node
 * Applies user-defined scenarios to modify projections
 */
async function scenarioApplicationNode(state) {
  console.log('🎯 Scenario Application Node: Applying scenarios...');
  
  try {
    // Start with base projection
    let adjustedProjection = { ...state.baseProjection };
    
    // Apply scenarios if provided
    if (state.rawData?.scenarios && state.rawData.scenarios.length > 0) {
      for (const scenario of state.rawData.scenarios) {
        adjustedProjection = applyScenario(adjustedProjection, scenario);
      }
    }

    state.scenarioAdjustments = adjustedProjection;
    
    console.log('✅ Scenario applications completed');
    return state;
    
  } catch (error) {
    console.error('❌ Scenario Application Error:', error);
    state.errors.push({ node: 'scenarioApplication', error: error.message });
    return state;
  }
}

/**
 * Result Formatting Node
 * Formats final results for presentation
 */
async function resultFormattingNode(state) {
  console.log('📋 Result Formatting Node: Preparing final forecast...');
  
  try {
    const endTime = new Date();
    state.metadata.processingTime = endTime.getTime() - state.metadata.startTime.getTime();

    // Prepare final forecast
    state.finalForecast = {
      summary: {
        currentBalance: state.processedData?.summary.currentBalance || 0,
        projectedBalance12Months: state.scenarioAdjustments?.timeframes?.['12months']?.projectedBalance || 0,
        monthlyNetIncome: state.processedData?.summary.netIncome / 12 || 0,
        confidence: state.baseProjection?.scenarios?.base?.confidence || 0.5
      },
      projections: state.scenarioAdjustments?.timeframes || {},
      scenarios: state.scenarioAdjustments?.scenarios || {},
      insights: state.patterns?.insights || [],
      risks: state.patterns?.risks || [],
      opportunities: state.patterns?.opportunities || [],
      metadata: {
        ...state.metadata,
        endTime,
        hasErrors: state.errors.length > 0,
        errorCount: state.errors.length
      }
    };

    console.log('✅ Result formatting completed');
    return state;
    
  } catch (error) {
    console.error('❌ Result Formatting Error:', error);
    state.errors.push({ node: 'resultFormatting', error: error.message });
    return state;
  }
}

/**
 * Helper function to apply scenarios to projections
 */
function applyScenario(projection, scenario) {
  // Example scenario applications
  const modified = { ...projection };
  
  switch (scenario.type) {
    case 'salary_change':
      const salaryMultiplier = (100 + scenario.percentage) / 100;
      Object.keys(modified.timeframes).forEach(key => {
        modified.timeframes[key].projectedBalance *= salaryMultiplier;
      });
      break;
      
    case 'expense_change':
      const expenseMultiplier = (100 - scenario.percentage) / 100;
      Object.keys(modified.timeframes).forEach(key => {
        modified.timeframes[key].projectedBalance *= expenseMultiplier;
      });
      break;
      
    case 'one_time_expense':
      Object.keys(modified.timeframes).forEach(key => {
        modified.timeframes[key].projectedBalance -= scenario.amount;
      });
      break;
  }
  
  return modified;
}

/**
 * Create and configure the LangGraph workflow
 */
function createFinancialForecastWorkflow() {
  // Create StateGraph without class parameter (LangGraph handles state internally)
  const workflow = new StateGraph({})
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

  return workflow.compile();
}

module.exports = {
  ForecastState,
  createFinancialForecastWorkflow,
  // Export individual nodes for testing
  dataIngestionNode,
  patternAnalysisNode,
  projectionCalculationNode,
  scenarioApplicationNode,
  resultFormattingNode
}; 