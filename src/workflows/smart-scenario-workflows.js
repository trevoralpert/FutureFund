/**
 * Smart Scenario Workflows - Phase 3.6.2
 * Advanced AI-powered scenario automation and optimization
 */

require('dotenv').config();

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require('openai');

// Initialize OpenAI if available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Smart Scenario Workflows State Structure
 */
const SmartScenarioState = {
  channels: {
    // Input scenario and context
    baseScenario: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    financialContext: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        currentBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        accounts: []
      })
    },
    
    analysisType: {
      value: (x, y) => y || x,
      default: () => 'optimization'
    },
    
    constraints: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    // Generated data
    scenarioVariations: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    simulationResults: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    comparisonMatrix: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    outcomeAnalysis: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    rankingResults: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    topRecommendations: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    userPreferences: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    // Analysis outputs
    optimizationInsights: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({})
    },
    
    creativeSolutions: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    recommendations: {
      value: (x, y) => [...(y || [])],
      default: () => []
    },
    
    // Metadata and errors
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        startTime: Date.now(),
        phases: [],
        version: '3.6.2',
        workflow: 'SmartScenario'
      })
    },
    
    errors: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    }
  }
};

/**
 * Node 1: Generate Scenario Variations
 */
async function generateScenarioVariations(state) {
  console.log('🏗️ Smart Scenarios: Generating scenario variations...');
  
  try {
    const { baseScenario, financialContext } = state;
    
    if (!baseScenario || !baseScenario.type) {
      throw new Error('Base scenario is required for variation generation');
    }
    
    const variations = [];
    
    // Generate variations based on scenario type
    switch (baseScenario.type) {
      case 'job_change':
        variations.push(...generateJobChangeVariations(baseScenario, financialContext));
        break;
      case 'investment':
        variations.push(...generateInvestmentVariations(baseScenario, financialContext));
        break;
      case 'debt_payoff':
        variations.push(...generateDebtPayoffVariations(baseScenario, financialContext));
        break;
      default:
        variations.push(...generateGenericVariations(baseScenario, financialContext));
    }
    
    console.log(`✅ Generated ${variations.length} scenario variations`);
    
    return {
      ...state,
      scenarioVariations: variations,
      executionMetadata: {
        ...state.executionMetadata,
        variationsGenerated: variations.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error generating scenario variations:', error);
    return {
      ...state,
      errors: [...state.errors, {
        phase: 'generateVariations',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

/**
 * Node 2: Execute Financial Simulations
 */
async function executeFinancialSimulations(state) {
  console.log('📊 Smart Scenarios: Executing financial simulations...');
  
  try {
    const { scenarioVariations, baseScenario, financialContext } = state;
    
    if (!scenarioVariations || scenarioVariations.length === 0) {
      throw new Error('No scenario variations available for simulation');
    }
    
    const simulationResults = [];
    
    // Run simulations for each variation
    for (const variation of scenarioVariations) {
      const simulation = await runScenarioSimulation(variation, financialContext);
      simulationResults.push({
        variationId: variation.id,
        scenario: variation,
        results: simulation,
        timestamp: new Date().toISOString()
      });
    }
    
    // Include base scenario simulation for comparison
    const baseSimulation = await runScenarioSimulation(baseScenario, financialContext);
    simulationResults.unshift({
      variationId: 'base',
      scenario: baseScenario,
      results: baseSimulation,
      timestamp: new Date().toISOString(),
      isBase: true
    });
    
    console.log(`✅ Executed ${simulationResults.length} financial simulations`);
    
    return {
      ...state,
      simulationResults,
      executionMetadata: {
        ...state.executionMetadata,
        simulationsExecuted: simulationResults.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error executing financial simulations:', error);
    return {
      ...state,
      errors: [...state.errors, {
        phase: 'executeSimulations',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

/**
 * Node 3: Analyze and Compare Outcomes
 */
async function analyzeAndCompareOutcomes(state) {
  console.log('🔍 Smart Scenarios: Analyzing and comparing outcomes...');
  
  try {
    const { simulationResults, financialContext } = state;
    
    if (!simulationResults || simulationResults.length === 0) {
      throw new Error('No simulation results available for comparison');
    }
    
    // Create comparison matrix
    const comparisonMatrix = createComparisonMatrix(simulationResults);
    
    // Perform multi-dimensional analysis
    const outcomes = simulationResults.map(sim => ({
      id: sim.variationId,
      scenario: sim.scenario,
      monthlyImpact: sim.results.monthlyImpact,
      finalBalance: sim.results.finalBalance,
      riskLevel: sim.results.riskLevel,
      returnOnInvestment: calculateROI(sim.results, financialContext),
      liquidityScore: calculateLiquidityScore(sim.results),
      sustainabilityScore: sim.results.sustainability,
      overallScore: 0
    }));
    
    // Calculate composite scores
    outcomes.forEach(outcome => {
      outcome.overallScore = calculateCompositeScore(outcome);
    });
    
    const bestOutcome = outcomes.reduce((best, current) => 
      current.overallScore > best.overallScore ? current : best
    );
    
    console.log(`✅ Analyzed ${outcomes.length} scenario outcomes`);
    console.log(`📈 Best performer: ${bestOutcome.scenario.name} (Score: ${bestOutcome.overallScore.toFixed(2)})`);
    
    return {
      comparisonMatrix,
      outcomeAnalysis: {
        outcomes,
        bestOutcome,
        averageScore: outcomes.reduce((sum, o) => sum + o.overallScore, 0) / outcomes.length
      },
      executionMetadata: {
        ...state.executionMetadata,
        outcomesAnalyzed: outcomes.length,
        bestScore: bestOutcome.overallScore
      }
    };
    
  } catch (error) {
    console.error('❌ Error analyzing outcomes:', error);
    return {
      ...state,
      errors: [...state.errors, {
        phase: 'analyzeOutcomes',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

/**
 * Node 4: Rank and Prioritize Options
 */
async function rankAndPrioritizeOptions(state) {
  console.log('📊 Smart Scenarios: Ranking and prioritizing options...');
  
  try {
    const { outcomeAnalysis, financialContext, constraints } = state;
    
    if (!outcomeAnalysis || !outcomeAnalysis.outcomes) {
      throw new Error('No outcome analysis available for ranking');
    }
    
    const { outcomes } = outcomeAnalysis;
    
    // Apply user preferences and constraints
    const userPreferences = extractUserPreferences(constraints, financialContext);
    
    // Create weighted ranking based on preferences
    const rankedOptions = outcomes.map(outcome => ({
      ...outcome,
      financialScore: outcome.overallScore * userPreferences.financialWeight,
      riskScore: (100 - outcome.riskLevel) * userPreferences.riskWeight,
      liquidityScore: outcome.liquidityScore * userPreferences.liquidityWeight,
      sustainabilityScore: outcome.sustainabilityScore * userPreferences.sustainabilityWeight,
      finalScore: 0
    }));
    
    // Calculate final weighted scores
    rankedOptions.forEach(option => {
      option.finalScore = (
        option.financialScore +
        option.riskScore +
        option.liquidityScore +
        option.sustainabilityScore
      ) / 4;
    });
    
    // Sort by final score (descending)
    rankedOptions.sort((a, b) => b.finalScore - a.finalScore);
    
    // Add ranking positions
    rankedOptions.forEach((option, index) => {
      option.rank = index + 1;
      option.tier = index < 3 ? 'top' : index < 6 ? 'middle' : 'bottom';
    });
    
    const topRecommendations = rankedOptions.slice(0, 3);
    
    console.log(`✅ Ranked ${rankedOptions.length} scenario options`);
    console.log(`🏆 Top 3 recommendations:`);
    topRecommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec.scenario.name} (Score: ${rec.finalScore.toFixed(2)})`);
    });
    
    return {
      rankingResults: rankedOptions,
      topRecommendations,
      userPreferences,
      executionMetadata: {
        ...state.executionMetadata,
        optionsRanked: rankedOptions.length,
        topScore: rankedOptions[0]?.finalScore || 0
      }
    };
    
  } catch (error) {
    console.error('❌ Error ranking options:', error);
    return {
      errors: [...(state.errors || []), {
        phase: 'rankOptions',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

/**
 * Node 5: Generate Optimization Insights
 */
async function generateOptimizationInsights(state) {
  console.log('🤖 Smart Scenarios: Generating optimization insights...');
  
  try {
    const { rankingResults, topRecommendations, financialContext, baseScenario } = state;
    
    if (!rankingResults || rankingResults.length === 0) {
      throw new Error('No ranking results available for insight generation');
    }
    
    // Generate insights using AI if available
    let aiInsights = null;
    if (openai) {
      try {
        aiInsights = await generateAIOptimizationInsights(
          baseScenario, 
          topRecommendations, 
          financialContext
        );
      } catch (aiError) {
        console.warn('⚠️ AI insights generation failed, using fallback:', aiError.message);
      }
    }
    
    // Generate structured insights
    const optimizationInsights = {
      performanceGains: analyzePerformanceGains(rankingResults),
      riskAssessment: analyzeRiskProfile(rankingResults),
      opportunities: identifyOptimizationOpportunities(rankingResults, financialContext),
      strategicRecommendations: generateStrategicRecommendations(topRecommendations),
      aiInsights: aiInsights || generateFallbackInsights(topRecommendations, financialContext),
      actionItems: generateActionItems(topRecommendations, financialContext)
    };
    
    // Generate creative solutions
    const creativeSolutions = generateCreativeSolutions(rankingResults, financialContext);
    
    // Generate final recommendations
    const recommendations = generateFinalRecommendations(
      topRecommendations, 
      optimizationInsights, 
      creativeSolutions
    );
    
    console.log(`✅ Generated optimization insights with ${recommendations.length} recommendations`);
    console.log(`🎯 Key opportunities: ${optimizationInsights.opportunities.length}`);
    console.log(`💡 Creative solutions: ${creativeSolutions.length}`);
    
    return {
      ...state,
      optimizationInsights,
      creativeSolutions,
      recommendations,
      executionMetadata: {
        ...state.executionMetadata,
        insightsGenerated: true,
        recommendationCount: recommendations.length,
        opportunityCount: optimizationInsights.opportunities.length,
        aiInsightsUsed: !!aiInsights
      }
    };
    
  } catch (error) {
    console.error('❌ Error generating optimization insights:', error);
    return {
      ...state,
      errors: [...state.errors, {
        phase: 'generateInsights',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

/**
 * Create Smart Scenario Workflows using LangGraph
 */
function createSmartScenarioWorkflows() {
  console.log('🏗️ Creating Smart Scenario Workflows...');
  
  try {
    // Create the StateGraph
    const workflow = new StateGraph(SmartScenarioState);
    
    // Add nodes
    workflow.addNode('generateVariations', generateScenarioVariations);
    workflow.addNode('executeSimulations', executeFinancialSimulations);
    workflow.addNode('analyzeOutcomes', analyzeAndCompareOutcomes);
    workflow.addNode('rankOptions', rankAndPrioritizeOptions);
    workflow.addNode('generateInsights', generateOptimizationInsights);
    
    // Add edges (workflow flow)
    workflow.addEdge('generateVariations', 'executeSimulations');
    workflow.addEdge('executeSimulations', 'analyzeOutcomes');
    workflow.addEdge('analyzeOutcomes', 'rankOptions');
    workflow.addEdge('rankOptions', 'generateInsights');
    
    // Set entry and finish points
    workflow.setEntryPoint('generateVariations');
    workflow.setFinishPoint('generateInsights');
    
    // Compile the workflow
    const compiledWorkflow = workflow.compile();
    
    console.log('✅ Smart Scenario Workflows created successfully');
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ Failed to create Smart Scenario Workflows:', error);
    throw error;
  }
}

// Helper Functions for Scenario Generation

/**
 * Generate Job Change Variations
 */
function generateJobChangeVariations(baseScenario, financialContext) {
  const variations = [];
  const baseParams = baseScenario.parameters;
  
  // Conservative: 10% increase
  variations.push({
    id: `${baseScenario.id}_conservative`,
    name: `${baseScenario.name} (Conservative)`,
    type: 'job_change',
    strategy: 'conservative',
    parameters: {
      ...baseParams,
      newSalary: baseParams.currentSalary * 1.10,
      timeline: (baseParams.timeline || 3) + 2
    }
  });
  
  // Moderate: 25% increase
  variations.push({
    id: `${baseScenario.id}_moderate`,
    name: `${baseScenario.name} (Moderate Growth)`,
    type: 'job_change',
    strategy: 'moderate',
    parameters: {
      ...baseParams,
      newSalary: baseParams.currentSalary * 1.25,
      timeline: baseParams.timeline || 3
    }
  });
  
  // Aggressive: 40% increase
  variations.push({
    id: `${baseScenario.id}_aggressive`,
    name: `${baseScenario.name} (Aggressive)`,
    type: 'job_change',
    strategy: 'aggressive',
    parameters: {
      ...baseParams,
      newSalary: baseParams.currentSalary * 1.40,
      timeline: Math.max(1, (baseParams.timeline || 3) - 1)
    }
  });
  
  return variations;
}

/**
 * Generate Investment Variations
 */
function generateInvestmentVariations(baseScenario, financialContext) {
  const variations = [];
  const baseParams = baseScenario.parameters;
  
  // Conservative investment
  variations.push({
    id: `${baseScenario.id}_conservative`,
    name: `${baseScenario.name} (Conservative)`,
    type: 'investment',
    strategy: 'conservative',
    parameters: {
      ...baseParams,
      investmentAmount: baseParams.investmentAmount * 0.7,
      expectedReturn: (baseParams.expectedReturn || 0.07) * 0.8,
      riskLevel: 'low'
    }
  });
  
  // Aggressive investment
  variations.push({
    id: `${baseScenario.id}_aggressive`,
    name: `${baseScenario.name} (Aggressive)`,
    type: 'investment',
    strategy: 'aggressive',
    parameters: {
      ...baseParams,
      investmentAmount: baseParams.investmentAmount * 1.3,
      expectedReturn: (baseParams.expectedReturn || 0.07) * 1.4,
      riskLevel: 'high'
    }
  });
  
  return variations;
}

/**
 * Generate Debt Payoff Variations
 */
function generateDebtPayoffVariations(baseScenario, financialContext) {
  const variations = [];
  const baseParams = baseScenario.parameters;
  
  // Minimum payment
  variations.push({
    id: `${baseScenario.id}_minimum`,
    name: `${baseScenario.name} (Minimum Payment)`,
    type: 'debt_payoff',
    strategy: 'minimum',
    parameters: {
      ...baseParams,
      monthlyPayment: baseParams.monthlyPayment * 0.6
    }
  });
  
  // Aggressive payoff
  variations.push({
    id: `${baseScenario.id}_aggressive`,
    name: `${baseScenario.name} (Aggressive Payoff)`,
    type: 'debt_payoff',
    strategy: 'aggressive',
    parameters: {
      ...baseParams,
      monthlyPayment: baseParams.monthlyPayment * 1.5
    }
  });
  
  return variations;
}

/**
 * Generate Generic Variations
 */
function generateGenericVariations(baseScenario, financialContext) {
  const variations = [];
  
  // Create basic variations by adjusting timeline
  variations.push({
    id: `${baseScenario.id}_extended`,
    name: `${baseScenario.name} (Extended Timeline)`,
    type: baseScenario.type,
    strategy: 'extended',
    parameters: {
      ...baseScenario.parameters,
      timeline: (baseScenario.parameters.timeline || 12) * 1.5
    }
  });
  
  variations.push({
    id: `${baseScenario.id}_accelerated`,
    name: `${baseScenario.name} (Accelerated)`,
    type: baseScenario.type,
    strategy: 'accelerated',
    parameters: {
      ...baseScenario.parameters,
      timeline: Math.max(1, (baseScenario.parameters.timeline || 12) * 0.75)
    }
  });
  
  return variations;
}

// Helper Functions for Simulation and Analysis

/**
 * Run Scenario Simulation
 */
async function runScenarioSimulation(scenario, financialContext) {
  const startTime = Date.now();
  
  // Calculate basic financial effects
  const monthlyImpact = calculateMonthlyImpact(scenario, financialContext);
  const timeline = scenario.parameters.timeline || 12;
  
  // Project future balance
  let projectedBalance = financialContext.currentBalance;
  const balanceProjection = [];
  
  for (let month = 1; month <= timeline; month++) {
    projectedBalance += monthlyImpact;
    balanceProjection.push({
      month,
      balance: projectedBalance,
      cumulativeImpact: monthlyImpact * month
    });
  }
  
  const finalBalance = projectedBalance;
  const riskLevel = calculateScenarioRisk(scenario, financialContext);
  const sustainability = calculateSustainability(scenario, financialContext);
  const executionTime = Date.now() - startTime;
  
  return {
    monthlyImpact,
    finalBalance,
    riskLevel,
    sustainability,
    balanceProjection,
    timeline,
    executionTime
  };
}

/**
 * Calculate Monthly Impact
 */
function calculateMonthlyImpact(scenario, financialContext) {
  const { type, parameters } = scenario;
  
  switch (type) {
    case 'job_change':
      return (parameters.newSalary || 0) - (parameters.currentSalary || 0);
    case 'investment':
      return -(parameters.monthlyContribution || 0);
    case 'debt_payoff':
      return -(parameters.monthlyPayment || 0);
    default:
      return 0;
  }
}

/**
 * Calculate Scenario Risk
 */
function calculateScenarioRisk(scenario, financialContext) {
  const { type, parameters } = scenario;
  const monthlyIncome = financialContext.monthlyIncome || 0;
  const monthlyExpenses = financialContext.monthlyExpenses || 0;
  
  let riskScore = 0;
  
  // Income stability risk
  if (type === 'job_change') {
    const salaryChange = (parameters.newSalary || 0) - (parameters.currentSalary || 0);
    if (salaryChange < 0) riskScore += 30;
  }
  
  // Cash flow risk
  const monthlyImpact = calculateMonthlyImpact(scenario, financialContext);
  const netCashFlow = monthlyIncome - monthlyExpenses + monthlyImpact;
  if (netCashFlow < 0) riskScore += 40;
  
  // Timeline risk
  const timeline = parameters.timeline || 12;
  if (timeline < 6) riskScore += 20;
  
  return Math.min(100, riskScore);
}

/**
 * Calculate Sustainability
 */
function calculateSustainability(scenario, financialContext) {
  const monthlyImpact = calculateMonthlyImpact(scenario, financialContext);
  const netCashFlow = financialContext.monthlyIncome - financialContext.monthlyExpenses + monthlyImpact;
  
  if (netCashFlow > 0) return 100;
  if (netCashFlow > -500) return 70;
  if (netCashFlow > -1000) return 40;
  return 20;
}

/**
 * Create Comparison Matrix
 */
function createComparisonMatrix(simulationResults) {
  const matrix = {};
  
  simulationResults.forEach(sim => {
    matrix[sim.variationId] = {
      monthlyImpact: sim.results.monthlyImpact,
      finalBalance: sim.results.finalBalance,
      riskLevel: sim.results.riskLevel,
      sustainability: sim.results.sustainability,
      timeline: sim.results.timeline
    };
  });
  
  return matrix;
}

/**
 * Calculate Return on Investment
 */
function calculateROI(results, financialContext) {
  const totalInvestment = Math.abs(results.monthlyImpact) * results.timeline;
  const totalReturn = results.finalBalance - financialContext.currentBalance;
  
  if (totalInvestment === 0) return 0;
  return (totalReturn / totalInvestment) * 100;
}

/**
 * Calculate Liquidity Score
 */
function calculateLiquidityScore(results) {
  if (results.finalBalance > 50000) return 100;
  if (results.finalBalance > 20000) return 80;
  if (results.finalBalance > 10000) return 60;
  if (results.finalBalance > 5000) return 40;
  return 20;
}

/**
 * Calculate Composite Score
 */
function calculateCompositeScore(outcome) {
  const weights = {
    financial: 0.3,
    risk: 0.25,
    liquidity: 0.25,
    sustainability: 0.2
  };
  
  const normalizedRisk = 100 - outcome.riskLevel;
  
  return (
    (outcome.returnOnInvestment * weights.financial) +
    (normalizedRisk * weights.risk) +
    (outcome.liquidityScore * weights.liquidity) +
    (outcome.sustainabilityScore * weights.sustainability)
  );
}

/**
 * Extract User Preferences
 */
function extractUserPreferences(constraints, financialContext) {
  return {
    financialWeight: constraints.prioritizeReturns ? 0.4 : 0.3,
    riskWeight: constraints.riskAverse ? 0.4 : 0.25,
    liquidityWeight: constraints.needLiquidity ? 0.3 : 0.25,
    sustainabilityWeight: constraints.longTerm ? 0.3 : 0.2
  };
}

/**
 * Generate AI Optimization Insights
 */
async function generateAIOptimizationInsights(baseScenario, topRecommendations, financialContext) {
  const prompt = `
As a financial advisor, analyze these scenario optimization results:

Base Scenario: ${baseScenario.name}
Financial Context: Monthly income $${financialContext.monthlyIncome}, expenses $${financialContext.monthlyExpenses}

Top 3 Optimized Scenarios:
${topRecommendations.map((rec, idx) => `
${idx + 1}. ${rec.scenario.name}
   - Monthly Impact: $${rec.monthlyImpact}
   - Final Balance: $${rec.finalBalance}
   - Risk Level: ${rec.riskLevel}%
`).join('')}

Provide brief insights on optimization opportunities and implementation strategy.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7
  });

  return {
    insights: response.choices[0].message.content,
    model: 'gpt-3.5-turbo',
    generatedAt: new Date().toISOString()
  };
}

/**
 * Additional Helper Functions for Analysis and Recommendations
 */

function analyzePerformanceGains(rankingResults) {
  const baseResult = rankingResults.find(r => r.id === 'base');
  const topResult = rankingResults[0];
  
  if (!baseResult || !topResult) return {};
  
  return {
    monthlyGain: topResult.monthlyImpact - baseResult.monthlyImpact,
    balanceGain: topResult.finalBalance - baseResult.finalBalance,
    riskReduction: baseResult.riskLevel - topResult.riskLevel,
    improvementPercentage: ((topResult.finalScore - baseResult.finalScore) / baseResult.finalScore) * 100
  };
}

function analyzeRiskProfile(rankingResults) {
  const risks = rankingResults.map(r => r.riskLevel);
  
  return {
    averageRisk: risks.reduce((sum, r) => sum + r, 0) / risks.length,
    lowestRisk: Math.min(...risks),
    highestRisk: Math.max(...risks),
    riskSpread: Math.max(...risks) - Math.min(...risks)
  };
}

function identifyOptimizationOpportunities(rankingResults, financialContext) {
  const opportunities = [];
  const topPerformers = rankingResults.slice(0, 3);
  
  topPerformers.forEach(performer => {
    if (performer.monthlyImpact > 0) {
      opportunities.push({
        type: 'income_optimization',
        description: `${performer.scenario.name} could increase monthly income by $${performer.monthlyImpact}`,
        impact: performer.monthlyImpact,
        priority: 'high'
      });
    }
    
    if (performer.riskLevel < 30) {
      opportunities.push({
        type: 'risk_optimization',
        description: `${performer.scenario.name} offers low risk (${performer.riskLevel}%) with good returns`,
        impact: performer.finalScore,
        priority: 'medium'
      });
    }
  });
  
  return opportunities;
}

function generateStrategicRecommendations(topRecommendations) {
  return topRecommendations.map((rec, idx) => ({
    rank: idx + 1,
    scenario: rec.scenario.name,
    recommendation: `Consider ${rec.scenario.name} for ${rec.monthlyImpact > 0 ? 'income growth' : 'financial optimization'}`,
    rationale: `Scores ${rec.finalScore.toFixed(2)} with ${rec.riskLevel}% risk level`,
    priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low'
  }));
}

function generateFallbackInsights(topRecommendations, financialContext) {
  return {
    insights: `Based on your financial profile, the top scenario "${topRecommendations[0].scenario.name}" offers the best balance of returns and risk. Consider implementing this option as your primary strategy.`,
    model: 'fallback',
    generatedAt: new Date().toISOString()
  };
}

function generateActionItems(topRecommendations, financialContext) {
  return topRecommendations.slice(0, 3).map((rec, idx) => ({
    id: idx + 1,
    action: `Implement ${rec.scenario.name}`,
    timeline: rec.scenario.parameters.timeline || 12,
    priority: idx === 0 ? 'high' : 'medium',
    requirements: [`Monthly commitment: $${Math.abs(rec.monthlyImpact)}`],
    expectedOutcome: `Final balance: $${rec.finalBalance}`
  }));
}

function generateCreativeSolutions(rankingResults, financialContext) {
  const solutions = [];
  const topPerformers = rankingResults.slice(0, 3);
  
  if (topPerformers.length >= 2) {
    solutions.push({
      id: 'hybrid_approach',
      name: 'Hybrid Strategy',
      description: `Combine elements from "${topPerformers[0].scenario.name}" and "${topPerformers[1].scenario.name}"`,
      benefits: ['Diversified risk', 'Multiple income streams', 'Flexible implementation'],
      estimatedImpact: (topPerformers[0].monthlyImpact + topPerformers[1].monthlyImpact) * 0.8
    });
  }
  
  solutions.push({
    id: 'phased_implementation',
    name: 'Phased Implementation',
    description: `Start with "${topPerformers[0].scenario.name}" and gradually scale up`,
    benefits: ['Lower initial risk', 'Gradual scaling', 'Learning opportunity'],
    estimatedImpact: topPerformers[0].monthlyImpact * 1.1
  });
  
  return solutions;
}

function generateFinalRecommendations(topRecommendations, optimizationInsights, creativeSolutions) {
  const recommendations = [];
  
  // Primary recommendation
  recommendations.push({
    id: 'primary',
    type: 'primary',
    title: `Implement ${topRecommendations[0].scenario.name}`,
    description: `This is your best overall option with the highest optimization score`,
    scenario: topRecommendations[0].scenario,
    expectedImpact: topRecommendations[0].monthlyImpact,
    confidence: 'high',
    timeline: topRecommendations[0].scenario.parameters.timeline || 12
  });
  
  // Secondary recommendation
  if (topRecommendations.length > 1) {
    recommendations.push({
      id: 'secondary',
      type: 'secondary',
      title: `Consider ${topRecommendations[1].scenario.name} as Alternative`,
      description: `This option provides good balance if the primary recommendation doesn't fit`,
      scenario: topRecommendations[1].scenario,
      expectedImpact: topRecommendations[1].monthlyImpact,
      confidence: 'medium',
      timeline: topRecommendations[1].scenario.parameters.timeline || 12
    });
  }
  
  // Creative solution recommendation
  if (creativeSolutions.length > 0) {
    recommendations.push({
      id: 'creative',
      type: 'creative',
      title: creativeSolutions[0].name,
      description: creativeSolutions[0].description,
      expectedImpact: creativeSolutions[0].estimatedImpact,
      confidence: 'medium',
      timeline: 18
    });
  }
  
  return recommendations;
}

module.exports = {
  createSmartScenarioWorkflows,
  SmartScenarioState
};
