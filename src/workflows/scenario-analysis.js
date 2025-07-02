/**
 * Scenario Analysis Workflow - Phase 3.6.1
 * LangGraph-powered intelligent scenario analysis with AI-enhanced validation,
 * feasibility scoring, conflict detection, and automated recommendations
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require("openai");
const config = require('../config');

/**
 * Scenario Analysis State Schema
 * Manages scenario validation, analysis, and recommendation generation
 */
const scenarioAnalysisState = {
  channels: {
    // Input scenario data
    scenarioData: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        id: null,
        name: '',
        description: '',
        type: '',
        parameters: {},
        userId: null,
        existingScenarios: []
      })
    },
    
    // User financial context
    financialContext: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        currentBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        accounts: [],
        transactions: [],
        financialGoals: []
      })
    },
    
    // Validation results
    validationResults: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        isValid: false,
        errors: [],
        warnings: [],
        validationScore: 0
      })
    },
    
    // Financial effects calculation
    financialEffects: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        monthlyImpact: 0,
        yearlyImpact: 0,
        balanceProjection: [],
        affectedAccounts: [],
        cashFlowChanges: {}
      })
    },
    
    // Conflict detection
    conflictAnalysis: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        conflicts: [],
        compatibilityScore: 0,
        recommendations: []
      })
    },
    
    // Feasibility scoring
    feasibilityAssessment: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        feasibilityScore: 0,
        riskLevel: 'unknown',
        sustainabilityRating: 0,
        viabilityFactors: {}
      })
    },
    
    // AI-generated insights
    aiInsights: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        recommendations: [],
        optimizations: [],
        alternatives: [],
        riskAssessment: {}
      })
    },
    
    // Final analysis report
    analysisReport: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        summary: '',
        feasibilityScore: 0,
        riskLevel: 'unknown',
        recommendations: [],
        nextSteps: []
      })
    },
    
    // Execution metadata
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        startTime: Date.now(),
        currentPhase: null,
        phases: [],
        version: '3.6.1',
        workflow: 'ScenarioAnalysis'
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
 * Validate Scenario Inputs
 * Validates scenario data and parameters for completeness and correctness
 */
async function validateScenarioInputs(state) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Scenario Analysis: Validating scenario inputs...');
    
    const { scenarioData } = state;
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      validationScore: 0
    };
    
    // Required field validation
    if (!scenarioData.name || scenarioData.name.trim() === '') {
      validationResults.errors.push('Scenario name is required');
      validationResults.isValid = false;
    }
    
    if (!scenarioData.type || scenarioData.type.trim() === '') {
      validationResults.errors.push('Scenario type is required');
      validationResults.isValid = false;
    }
    
    if (!scenarioData.parameters || Object.keys(scenarioData.parameters).length === 0) {
      validationResults.errors.push('Scenario parameters are required');
      validationResults.isValid = false;
    }
    
    // Parameter validation based on scenario type
    if (scenarioData.type && scenarioData.parameters) {
      const paramValidation = validateScenarioParameters(scenarioData.type, scenarioData.parameters);
      validationResults.errors.push(...paramValidation.errors);
      validationResults.warnings.push(...paramValidation.warnings);
      if (paramValidation.errors.length > 0) {
        validationResults.isValid = false;
      }
    }
    
    // Calculate validation score
    const maxScore = 100;
    let score = maxScore;
    score -= validationResults.errors.length * 20; // Major deduction for errors
    score -= validationResults.warnings.length * 5; // Minor deduction for warnings
    score = Math.max(0, score);
    
    validationResults.validationScore = score;
    
    console.log(`✅ Scenario Analysis: Validation completed (${validationResults.errors.length} errors, ${validationResults.warnings.length} warnings)`);
    
    return {
      validationResults,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'validation'],
        validationTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Scenario Analysis: Validation failed:', error);
    return {
      errors: [{
        phase: 'validation',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Calculate Financial Effects
 * Calculates the financial impact of the scenario on user's finances
 */
async function calculateFinancialEffects(state) {
  const startTime = Date.now();
  
  try {
    console.log('💰 Scenario Analysis: Calculating financial effects...');
    
    const { scenarioData, financialContext } = state;
    
    // Calculate monthly impact based on scenario type
    const monthlyImpact = calculateMonthlyImpact(scenarioData, financialContext);
    const yearlyImpact = monthlyImpact * 12;
    
    // Generate balance projection for next 12 months
    const balanceProjection = generateBalanceProjection(
      financialContext.currentBalance,
      financialContext.monthlyIncome,
      financialContext.monthlyExpenses,
      monthlyImpact,
      12
    );
    
    // Identify affected accounts
    const affectedAccounts = identifyAffectedAccounts(scenarioData, financialContext.accounts);
    
    // Calculate cash flow changes
    const cashFlowChanges = calculateCashFlowChanges(scenarioData, financialContext);
    
    const financialEffects = {
      monthlyImpact,
      yearlyImpact,
      balanceProjection,
      affectedAccounts,
      cashFlowChanges
    };
    
    console.log(`✅ Scenario Analysis: Financial effects calculated (${Math.abs(monthlyImpact).toFixed(2)} monthly impact)`);
    
    return {
      financialEffects,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'financial_effects'],
        financialEffectsTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Scenario Analysis: Financial effects calculation failed:', error);
    return {
      errors: [{
        phase: 'financial_effects',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Analyze Scenario Conflicts
 * Detects conflicts with existing scenarios and calculates compatibility
 */
async function analyzeScenarioConflicts(state) {
  const startTime = Date.now();
  
  try {
    console.log('⚔️ Scenario Analysis: Analyzing scenario conflicts...');
    
    const { scenarioData, financialContext } = state;
    const existingScenarios = scenarioData.existingScenarios || [];
    
    const conflicts = [];
    const recommendations = [];
    
    // Check for direct conflicts
    existingScenarios.forEach(existingScenario => {
      const conflict = detectScenarioConflict(scenarioData, existingScenario);
      if (conflict) {
        conflicts.push(conflict);
      }
    });
    
    // Check for resource conflicts
    const resourceConflicts = detectResourceConflicts(scenarioData, existingScenarios, financialContext);
    conflicts.push(...resourceConflicts);
    
    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(scenarioData, existingScenarios);
    
    // Generate recommendations for conflict resolution
    if (conflicts.length > 0) {
      recommendations.push(...generateConflictResolutionRecommendations(conflicts, scenarioData));
    }
    
    const conflictAnalysis = {
      conflicts,
      compatibilityScore,
      recommendations
    };
    
    console.log(`✅ Scenario Analysis: Conflict analysis completed (${conflicts.length} conflicts found)`);
    
    return {
      conflictAnalysis,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'conflict_analysis'],
        conflictAnalysisTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Scenario Analysis: Conflict analysis failed:', error);
    return {
      errors: [{
        phase: 'conflict_analysis',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Assess Scenario Feasibility
 * Calculates feasibility score and risk assessment using multiple factors
 */
async function assessScenarioFeasibility(state) {
  const startTime = Date.now();
  
  try {
    console.log('📊 Scenario Analysis: Assessing scenario feasibility...');
    
    const { scenarioData, financialContext, financialEffects, conflictAnalysis } = state;
    
    // Calculate feasibility factors
    const viabilityFactors = {
      financialCapacity: calculateFinancialCapacity(financialContext, financialEffects),
      resourceAvailability: calculateResourceAvailability(scenarioData, financialContext),
      timelineRealism: calculateTimelineRealism(scenarioData),
      riskLevel: calculateRiskLevel(scenarioData, financialEffects),
      conflictImpact: calculateConflictImpact(conflictAnalysis)
    };
    
    // Calculate overall feasibility score (0-100)
    const feasibilityScore = calculateOverallFeasibilityScore(viabilityFactors);
    
    // Determine risk level
    const riskLevel = determineRiskLevel(feasibilityScore, viabilityFactors);
    
    // Calculate sustainability rating
    const sustainabilityRating = calculateSustainabilityRating(scenarioData, financialContext, financialEffects);
    
    const feasibilityAssessment = {
      feasibilityScore,
      riskLevel,
      sustainabilityRating,
      viabilityFactors
    };
    
    console.log(`✅ Scenario Analysis: Feasibility assessment completed (${feasibilityScore}/100 score, ${riskLevel} risk)`);
    
    return {
      feasibilityAssessment,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'feasibility_assessment'],
        feasibilityAssessmentTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Scenario Analysis: Feasibility assessment failed:', error);
    return {
      errors: [{
        phase: 'feasibility_assessment',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Create Actionable Recommendations
 * Generates AI-powered recommendations and optimizations
 */
async function createActionableRecommendations(state) {
  const startTime = Date.now();
  
  try {
    console.log('💡 Scenario Analysis: Creating actionable recommendations...');
    
    const { scenarioData, financialContext, financialEffects, conflictAnalysis, feasibilityAssessment } = state;
    
    // Generate recommendations based on feasibility score
    const recommendations = generateFeasibilityRecommendations(feasibilityAssessment, scenarioData);
    
    // Generate optimizations
    const optimizations = generateScenarioOptimizations(scenarioData, financialEffects, financialContext);
    
    // Generate alternatives
    const alternatives = generateScenarioAlternatives(scenarioData, feasibilityAssessment, financialContext);
    
    // Create risk assessment
    const riskAssessment = createRiskAssessment(scenarioData, financialEffects, feasibilityAssessment);
    
    // Try to get AI insights if available
    let aiEnhancedInsights = null;
    try {
      if (config.OPENAI_API_KEY) {
        aiEnhancedInsights = await generateAIInsights(scenarioData, financialContext, feasibilityAssessment);
      }
    } catch (aiError) {
      console.log('⚠️ AI insights unavailable, using rule-based recommendations');
    }
    
    const aiInsights = {
      recommendations: aiEnhancedInsights?.recommendations || recommendations,
      optimizations: aiEnhancedInsights?.optimizations || optimizations,
      alternatives: aiEnhancedInsights?.alternatives || alternatives,
      riskAssessment: aiEnhancedInsights?.riskAssessment || riskAssessment
    };
    
    // Create final analysis report
    const analysisReport = {
      summary: generateScenarioSummary(scenarioData, feasibilityAssessment, financialEffects),
      feasibilityScore: feasibilityAssessment.feasibilityScore,
      riskLevel: feasibilityAssessment.riskLevel,
      recommendations: aiInsights.recommendations,
      nextSteps: generateNextSteps(scenarioData, feasibilityAssessment, conflictAnalysis)
    };
    
    console.log(`✅ Scenario Analysis: Recommendations created (${aiInsights.recommendations.length} recommendations)`);
    
    return {
      aiInsights,
      analysisReport,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'recommendations'],
        recommendationsTime: Date.now() - startTime,
        completionTime: Date.now(),
        totalDuration: Date.now() - state.executionMetadata.startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Scenario Analysis: Recommendations creation failed:', error);
    return {
      errors: [{
        phase: 'recommendations',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

// === HELPER FUNCTIONS ===

/**
 * Validate scenario parameters based on type
 */
function validateScenarioParameters(type, parameters) {
  const errors = [];
  const warnings = [];
  
  switch (type) {
    case 'job_change':
      if (!parameters.newSalary || parameters.newSalary <= 0) {
        errors.push('New salary must be greater than 0');
      }
      if (parameters.newSalary && parameters.newSalary > 1000000) {
        warnings.push('New salary seems unusually high');
      }
      break;
      
    case 'home_purchase':
      if (!parameters.homePrice || parameters.homePrice <= 0) {
        errors.push('Home price must be greater than 0');
      }
      if (!parameters.downPayment || parameters.downPayment <= 0) {
        errors.push('Down payment must be greater than 0');
      }
      if (parameters.downPayment && parameters.homePrice && parameters.downPayment > parameters.homePrice) {
        errors.push('Down payment cannot be greater than home price');
      }
      break;
      
    case 'debt_payoff':
      if (!parameters.debtAmount || parameters.debtAmount <= 0) {
        errors.push('Debt amount must be greater than 0');
      }
      if (!parameters.monthlyPayment || parameters.monthlyPayment <= 0) {
        errors.push('Monthly payment must be greater than 0');
      }
      break;
      
    case 'investment':
      if (!parameters.investmentAmount || parameters.investmentAmount <= 0) {
        errors.push('Investment amount must be greater than 0');
      }
      if (!parameters.expectedReturn) {
        warnings.push('Expected return not specified');
      }
      break;
      
    case 'emergency_fund':
      if (!parameters.targetAmount || parameters.targetAmount <= 0) {
        errors.push('Target amount must be greater than 0');
      }
      if (!parameters.monthlyContribution || parameters.monthlyContribution <= 0) {
        errors.push('Monthly contribution must be greater than 0');
      }
      break;
      
    default:
      warnings.push(`Unknown scenario type: ${type}`);
  }
  
  return { errors, warnings };
}

/**
 * Calculate monthly financial impact
 */
function calculateMonthlyImpact(scenarioData, financialContext) {
  const { type, parameters } = scenarioData;
  
  switch (type) {
    case 'job_change':
      const currentSalary = financialContext.monthlyIncome || 0;
      const newSalary = parameters.newSalary || 0;
      return newSalary - currentSalary;
      
    case 'home_purchase':
      const monthlyPayment = parameters.monthlyPayment || 0;
      const currentRent = parameters.currentRent || 0;
      return -(monthlyPayment - currentRent);
      
    case 'debt_payoff':
      return -Math.abs(parameters.monthlyPayment || 0);
      
    case 'investment':
      return -Math.abs(parameters.monthlyContribution || 0);
      
    case 'emergency_fund':
      return -Math.abs(parameters.monthlyContribution || 0);
      
    default:
      return 0;
  }
}

/**
 * Generate balance projection
 */
function generateBalanceProjection(currentBalance, monthlyIncome, monthlyExpenses, additionalImpact, months) {
  const projection = [];
  let balance = currentBalance;
  
  for (let month = 0; month < months; month++) {
    balance += monthlyIncome - monthlyExpenses + additionalImpact;
    projection.push({
      month: month + 1,
      balance: Math.round(balance * 100) / 100
    });
  }
  
  return projection;
}

/**
 * Identify affected accounts
 */
function identifyAffectedAccounts(scenarioData, accounts) {
  const affectedAccounts = [];
  
  // Basic logic - in a real implementation, this would be more sophisticated
  if (scenarioData.type === 'home_purchase') {
    affectedAccounts.push('checking', 'savings');
  } else if (scenarioData.type === 'investment') {
    affectedAccounts.push('investment');
  } else if (scenarioData.type === 'debt_payoff') {
    affectedAccounts.push('credit_card', 'loan');
  }
  
  return affectedAccounts;
}

/**
 * Calculate cash flow changes
 */
function calculateCashFlowChanges(scenarioData, financialContext) {
  const changes = {
    income: 0,
    expenses: 0,
    netChange: 0
  };
  
  if (scenarioData.type === 'job_change') {
    changes.income = (scenarioData.parameters.newSalary || 0) - (financialContext.monthlyIncome || 0);
  } else {
    changes.expenses = Math.abs(calculateMonthlyImpact(scenarioData, financialContext));
  }
  
  changes.netChange = changes.income - changes.expenses;
  
  return changes;
}

/**
 * Detect scenario conflicts
 */
function detectScenarioConflict(newScenario, existingScenario) {
  // Define conflict rules
  const conflictRules = {
    'job_change': ['job_change', 'career_break'],
    'home_purchase': ['home_purchase', 'major_expense'],
    'debt_payoff': ['large_purchase', 'investment'],
    'investment': ['debt_payoff', 'cash_hoarding']
  };
  
  const conflictTypes = conflictRules[newScenario.type] || [];
  
  if (conflictTypes.includes(existingScenario.type)) {
    return {
      type: 'scenario_conflict',
      severity: 'high',
      description: `${newScenario.type} conflicts with existing ${existingScenario.type}`,
      existingScenario: existingScenario
    };
  }
  
  return null;
}

/**
 * Detect resource conflicts
 */
function detectResourceConflicts(newScenario, existingScenarios, financialContext) {
  const conflicts = [];
  
  // Calculate total financial commitment
  const newCommitment = Math.abs(calculateMonthlyImpact(newScenario, financialContext));
  const existingCommitments = existingScenarios.reduce((total, scenario) => {
    return total + Math.abs(calculateMonthlyImpact(scenario, financialContext));
  }, 0);
  
  const totalCommitment = newCommitment + existingCommitments;
  const availableIncome = financialContext.monthlyIncome - financialContext.monthlyExpenses;
  
  if (totalCommitment > availableIncome * 0.8) {
    conflicts.push({
      type: 'resource_conflict',
      severity: 'high',
      description: `Total commitments ($${totalCommitment.toFixed(2)}) exceed 80% of available income ($${availableIncome.toFixed(2)})`
    });
  }
  
  return conflicts;
}

/**
 * Calculate compatibility score
 */
function calculateCompatibilityScore(newScenario, existingScenarios) {
  if (existingScenarios.length === 0) return 100;
  
  let compatibilityScore = 100;
  
  existingScenarios.forEach(existingScenario => {
    const conflict = detectScenarioConflict(newScenario, existingScenario);
    if (conflict) {
      compatibilityScore -= conflict.severity === 'high' ? 30 : 15;
    }
  });
  
  return Math.max(0, compatibilityScore);
}

/**
 * Generate conflict resolution recommendations
 */
function generateConflictResolutionRecommendations(conflicts, scenarioData) {
  const recommendations = [];
  
  conflicts.forEach(conflict => {
    switch (conflict.type) {
      case 'scenario_conflict':
        recommendations.push({
          type: 'resolution',
          priority: 'high',
          description: `Consider adjusting ${scenarioData.name} parameters or deactivating conflicting scenarios`
        });
        break;
        
      case 'resource_conflict':
        recommendations.push({
          type: 'resolution',
          priority: 'high',
          description: 'Reduce scenario commitments or increase income to avoid overcommitment'
        });
        break;
    }
  });
  
  return recommendations;
}

/**
 * Calculate financial capacity
 */
function calculateFinancialCapacity(financialContext, financialEffects) {
  const availableIncome = financialContext.monthlyIncome - financialContext.monthlyExpenses;
  const requiredAmount = Math.abs(financialEffects.monthlyImpact);
  
  if (availableIncome <= 0) return 0;
  
  const capacity = Math.min(100, (availableIncome / requiredAmount) * 100);
  return Math.max(0, capacity);
}

/**
 * Calculate resource availability
 */
function calculateResourceAvailability(scenarioData, financialContext) {
  const { type, parameters } = scenarioData;
  
  switch (type) {
    case 'home_purchase':
      const downPayment = parameters.downPayment || 0;
      const currentSavings = financialContext.currentBalance || 0;
      return currentSavings >= downPayment ? 100 : (currentSavings / downPayment) * 100;
      
    case 'investment':
      const investmentAmount = parameters.investmentAmount || 0;
      const availableBalance = financialContext.currentBalance || 0;
      return availableBalance >= investmentAmount ? 100 : (availableBalance / investmentAmount) * 100;
      
    default:
      return 80; // Default moderate availability
  }
}

/**
 * Calculate timeline realism
 */
function calculateTimelineRealism(scenarioData) {
  const { type, parameters } = scenarioData;
  
  // Basic timeline realism scoring
  switch (type) {
    case 'job_change':
      return parameters.timeline <= 6 ? 100 : 80;
      
    case 'home_purchase':
      return parameters.timeline >= 3 ? 100 : 60;
      
    case 'debt_payoff':
      const months = parameters.debtAmount / parameters.monthlyPayment;
      return months <= 60 ? 100 : 70;
      
    default:
      return 80;
  }
}

/**
 * Calculate risk level
 */
function calculateRiskLevel(scenarioData, financialEffects) {
  const impact = Math.abs(financialEffects.monthlyImpact);
  
  if (impact > 2000) return 30; // High risk
  if (impact > 1000) return 60; // Medium risk
  return 90; // Low risk
}

/**
 * Calculate conflict impact
 */
function calculateConflictImpact(conflictAnalysis) {
  const conflicts = conflictAnalysis.conflicts.length;
  
  if (conflicts === 0) return 100;
  if (conflicts <= 2) return 70;
  return 40;
}

/**
 * Calculate overall feasibility score
 */
function calculateOverallFeasibilityScore(factors) {
  const weights = {
    financialCapacity: 0.3,
    resourceAvailability: 0.25,
    timelineRealism: 0.15,
    riskLevel: 0.15,
    conflictImpact: 0.15
  };
  
  let score = 0;
  Object.keys(weights).forEach(factor => {
    score += (factors[factor] || 0) * weights[factor];
  });
  
  return Math.round(score);
}

/**
 * Determine risk level
 */
function determineRiskLevel(feasibilityScore, factors) {
  if (feasibilityScore >= 80) return 'low';
  if (feasibilityScore >= 60) return 'medium';
  if (feasibilityScore >= 40) return 'high';
  return 'very_high';
}

/**
 * Calculate sustainability rating
 */
function calculateSustainabilityRating(scenarioData, financialContext, financialEffects) {
  const balanceProjection = financialEffects.balanceProjection || [];
  
  if (balanceProjection.length === 0) return 50;
  
  const finalBalance = balanceProjection[balanceProjection.length - 1].balance;
  const lowestBalance = Math.min(...balanceProjection.map(p => p.balance));
  
  if (lowestBalance < 0) return 30; // Unsustainable
  if (finalBalance > financialContext.currentBalance) return 90; // Improving
  return 70; // Stable
}

/**
 * Generate feasibility recommendations
 */
function generateFeasibilityRecommendations(feasibilityAssessment, scenarioData) {
  const recommendations = [];
  const score = feasibilityAssessment.feasibilityScore;
  
  if (score < 50) {
    recommendations.push({
      type: 'improvement',
      priority: 'high',
      description: 'Consider reducing scenario scope or increasing financial capacity'
    });
  } else if (score < 80) {
    recommendations.push({
      type: 'improvement',
      priority: 'medium',
      description: 'Scenario is moderately feasible but could benefit from adjustments'
    });
  } else {
    recommendations.push({
      type: 'approval',
      priority: 'low',
      description: 'Scenario appears highly feasible and well-planned'
    });
  }
  
  return recommendations;
}

/**
 * Generate scenario optimizations
 */
function generateScenarioOptimizations(scenarioData, financialEffects, financialContext) {
  const optimizations = [];
  
  const impact = Math.abs(financialEffects.monthlyImpact);
  const availableIncome = financialContext.monthlyIncome - financialContext.monthlyExpenses;
  
  if (impact > availableIncome * 0.5) {
    optimizations.push({
      type: 'cost_reduction',
      description: 'Consider reducing monthly commitment to improve cash flow'
    });
  }
  
  if (scenarioData.type === 'debt_payoff') {
    optimizations.push({
      type: 'payment_optimization',
      description: 'Consider debt snowball or avalanche method for faster payoff'
    });
  }
  
  return optimizations;
}

/**
 * Generate scenario alternatives
 */
function generateScenarioAlternatives(scenarioData, feasibilityAssessment, financialContext) {
  const alternatives = [];
  
  if (feasibilityAssessment.feasibilityScore < 60) {
    alternatives.push({
      type: 'scaled_down',
      description: `Scaled-down version of ${scenarioData.name}`,
      modifications: 'Reduce scope by 50%'
    });
    
    alternatives.push({
      type: 'phased_approach',
      description: `Phased implementation of ${scenarioData.name}`,
      modifications: 'Split into multiple phases over longer timeline'
    });
  }
  
  return alternatives;
}

/**
 * Create risk assessment
 */
function createRiskAssessment(scenarioData, financialEffects, feasibilityAssessment) {
  return {
    overallRisk: feasibilityAssessment.riskLevel,
    financialRisk: financialEffects.monthlyImpact > 1000 ? 'high' : 'low',
    timelineRisk: feasibilityAssessment.viabilityFactors.timelineRealism < 70 ? 'high' : 'low',
    resourceRisk: feasibilityAssessment.viabilityFactors.resourceAvailability < 70 ? 'high' : 'low'
  };
}

/**
 * Generate AI insights using OpenAI
 */
async function generateAIInsights(scenarioData, financialContext, feasibilityAssessment) {
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY
  });
  
  const prompt = `
    Analyze this financial scenario and provide insights:
    
    Scenario: ${scenarioData.name}
    Type: ${scenarioData.type}
    Description: ${scenarioData.description}
    Parameters: ${JSON.stringify(scenarioData.parameters)}
    
    Financial Context:
    - Monthly Income: $${financialContext.monthlyIncome}
    - Monthly Expenses: $${financialContext.monthlyExpenses}
    - Current Balance: $${financialContext.currentBalance}
    
    Feasibility Score: ${feasibilityAssessment.feasibilityScore}/100
    Risk Level: ${feasibilityAssessment.riskLevel}
    
    Provide specific recommendations, optimizations, and alternatives.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000
  });
  
  const content = response.choices[0].message.content;
  
  // Parse AI response into structured format
  return {
    recommendations: [
      {
        type: 'ai_insight',
        priority: 'medium',
        description: content.substring(0, 200) + '...'
      }
    ],
    optimizations: [
      {
        type: 'ai_optimization',
        description: 'AI-powered optimization suggestions'
      }
    ],
    alternatives: [
      {
        type: 'ai_alternative',
        description: 'AI-generated alternative approach'
      }
    ],
    riskAssessment: {
      aiAssessment: content.includes('risk') ? 'AI identified risk factors' : 'No major risks identified'
    }
  };
}

/**
 * Generate scenario summary
 */
function generateScenarioSummary(scenarioData, feasibilityAssessment, financialEffects) {
  const score = feasibilityAssessment.feasibilityScore;
  const risk = feasibilityAssessment.riskLevel;
  const impact = financialEffects.monthlyImpact;
  
  let summary = `${scenarioData.name} has a feasibility score of ${score}/100 with ${risk} risk. `;
  
  if (impact > 0) {
    summary += `This scenario would increase your monthly cash flow by $${impact.toFixed(2)}.`;
  } else {
    summary += `This scenario would require a monthly commitment of $${Math.abs(impact).toFixed(2)}.`;
  }
  
  if (score >= 80) {
    summary += ' The scenario appears highly feasible and well-planned.';
  } else if (score >= 60) {
    summary += ' The scenario is moderately feasible but may benefit from adjustments.';
  } else {
    summary += ' The scenario faces significant feasibility challenges.';
  }
  
  return summary;
}

/**
 * Generate next steps
 */
function generateNextSteps(scenarioData, feasibilityAssessment, conflictAnalysis) {
  const steps = [];
  
  if (feasibilityAssessment.feasibilityScore >= 80) {
    steps.push('Consider activating this scenario');
    steps.push('Monitor financial impact regularly');
  } else if (feasibilityAssessment.feasibilityScore >= 60) {
    steps.push('Review and adjust scenario parameters');
    steps.push('Consider implementation timeline');
  } else {
    steps.push('Improve financial capacity before proceeding');
    steps.push('Consider alternative approaches');
  }
  
  if (conflictAnalysis.conflicts.length > 0) {
    steps.push('Resolve conflicts with existing scenarios');
  }
  
  return steps;
}

// === LANGGRAPH WORKFLOW CREATION ===

/**
 * Create Scenario Analysis Workflow
 * 5-node workflow for comprehensive scenario analysis
 */
function createScenarioAnalysisWorkflow() {
  try {
    console.log('🏗️ Creating Scenario Analysis workflow...');
    
    // Create the StateGraph with our state schema
    const workflow = new StateGraph(scenarioAnalysisState)
      .addNode("validateScenario", validateScenarioInputs)
      .addNode("calculateEffects", calculateFinancialEffects)
      .addNode("detectConflicts", analyzeScenarioConflicts)
      .addNode("scoreViability", assessScenarioFeasibility)
      .addNode("generateInsights", createActionableRecommendations)
      .addEdge(START, "validateScenario")
      .addEdge("validateScenario", "calculateEffects")
      .addEdge("calculateEffects", "detectConflicts")
      .addEdge("detectConflicts", "scoreViability")
      .addEdge("scoreViability", "generateInsights")
      .addEdge("generateInsights", END);
    
    const compiledWorkflow = workflow.compile();
    
    console.log('✅ Scenario Analysis workflow created successfully');
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ Failed to create Scenario Analysis workflow:', error);
    throw error;
  }
}

module.exports = {
  createScenarioAnalysisWorkflow,
  scenarioAnalysisState
};
