/**
 * Financial Consequence Engine - Phase 4.1
 * LangGraph-powered realistic financial consequence modeling with intelligent 
 * payment method switching, overdraft detection, and cascade effect analysis
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { OpenAI } = require('openai');

// Initialize OpenAI if available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Financial Consequence Engine State Structure
 */
const FinancialConsequenceState = {
  channels: {
    // Input scenario and financial context
    scenarioExecution: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        scenario: null,
        executionDate: new Date(),
        financialContext: {},
        accounts: [],
        paymentPreferences: {}
      })
    },
    
    // Payment method analysis
    paymentAnalysis: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        requiredAmount: 0,
        primaryAccount: null,
        availableFunds: 0,
        shortfall: 0,
        fallbackSequence: []
      })
    },
    
    // Consequence modeling
    consequenceModel: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        overdraftFees: [],
        creditUtilization: {},
        interestCosts: {},
        cascadeEffects: [],
        totalAdditionalCosts: 0
      })
    },
    
    // Intelligent recommendations
    intelligentSolutions: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        optimalPaymentMethod: null,
        alternativeApproaches: [],
        riskMitigation: [],
        costOptimizations: []
      })
    },
    
    // Final analysis results
    consequenceReport: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        executionFeasible: false,
        totalCost: 0,
        riskLevel: 'unknown',
        recommendedApproach: null,
        warnings: [],
        nextSteps: []
      })
    },
    
    // Execution tracking
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        startTime: Date.now(),
        phases: [],
        errors: []
      })
    }
  }
};

/**
 * Financial Consequence Engine Class
 * Manages the 6-node LangGraph workflow for realistic consequence modeling
 */
class FinancialConsequenceEngine {
  constructor() {
    this.workflow = this.createWorkflow();
  }
  
  /**
   * Create the 6-node LangGraph workflow
   */
  createWorkflow() {
    const workflow = new StateGraph(FinancialConsequenceState)
      .addNode("analyzePaymentCapacity", analyzePaymentCapacity)
      .addNode("modelOverdraftConsequences", modelOverdraftConsequences)
      .addNode("calculateCreditImpacts", calculateCreditImpacts)
      .addNode("analyzeCascadeEffects", analyzeCascadeEffects)
      .addNode("generateIntelligentSolutions", generateIntelligentSolutions)
      .addNode("synthesizeConsequenceReport", synthesizeConsequenceReport)
      .addEdge(START, "analyzePaymentCapacity")
      .addEdge("analyzePaymentCapacity", "modelOverdraftConsequences")
      .addEdge("modelOverdraftConsequences", "calculateCreditImpacts")
      .addEdge("calculateCreditImpacts", "analyzeCascadeEffects")
      .addEdge("analyzeCascadeEffects", "generateIntelligentSolutions")
      .addEdge("generateIntelligentSolutions", "synthesizeConsequenceReport")
      .addEdge("synthesizeConsequenceReport", END);
    
    return workflow.compile();
  }
  
  /**
   * Execute consequence analysis for a scenario
   */
  async executeConsequenceAnalysis(scenario, financialContext, accounts) {
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Financial Consequence Engine: Analyzing realistic consequences for scenario: ${scenario.name}`);
      
      const initialState = {
        scenarioExecution: {
          scenario,
          executionDate: new Date(),
          financialContext,
          accounts,
          paymentPreferences: financialContext.paymentPreferences || {}
        },
        executionMetadata: {
          startTime,
          phases: [],
          errors: []
        }
      };
      
      const result = await this.workflow.invoke(initialState);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Financial Consequence Engine: Analysis completed in ${executionTime}ms`);
      
      return {
        success: true,
        result: result.consequenceReport,
        metadata: {
          executionTime,
          phases: result.executionMetadata.phases,
          errors: result.executionMetadata.errors
        }
      };
      
    } catch (error) {
      console.error('❌ Financial Consequence Engine: Analysis failed:', error);
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }
}

// =============================================================================
// LANGGRAPH NODE FUNCTIONS  
// =============================================================================

/**
 * Node 1: Analyze Payment Capacity
 * Determines available funds and potential shortfalls across all accounts
 */
async function analyzePaymentCapacity(state) {
  console.log('💰 Consequence Engine: Analyzing payment capacity...');
  
  try {
    const { scenarioExecution } = state;
    const { scenario, accounts, financialContext } = scenarioExecution;
    
    // Calculate required amount for scenario
    const requiredAmount = calculateScenarioRequiredAmount(scenario);
    
    // Analyze primary account capacity
    const primaryAccount = findPrimaryAccount(accounts, scenario.type);
    const availableFunds = primaryAccount ? primaryAccount.currentBalance : 0;
    const shortfall = Math.max(0, requiredAmount - availableFunds);
    
    // Build fallback payment sequence
    const fallbackSequence = buildFallbackSequence(accounts, requiredAmount, primaryAccount);
    
    const paymentAnalysis = {
      requiredAmount,
      primaryAccount,
      availableFunds,
      shortfall,
      fallbackSequence
    };
    
    console.log(`✅ Payment capacity analysis: $${requiredAmount} required, $${availableFunds} available, $${shortfall} shortfall`);
    
    return {
      paymentAnalysis,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'payment_capacity_analysis']
      }
    };
    
  } catch (error) {
    console.error('❌ Payment capacity analysis failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'payment_capacity_analysis',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

/**
 * Node 2: Model Overdraft Consequences
 * Calculates overdraft fees, NSF charges, and banking penalties
 */
async function modelOverdraftConsequences(state) {
  console.log('🏦 Consequence Engine: Modeling overdraft consequences...');
  
  try {
    const { paymentAnalysis, scenarioExecution } = state;
    const { accounts } = scenarioExecution;
    
    const overdraftFees = [];
    let totalOverdraftCosts = 0;
    
    if (paymentAnalysis.shortfall > 0) {
      // Model overdraft scenarios for each account in fallback sequence
      for (const accountStep of paymentAnalysis.fallbackSequence) {
        if (accountStep.account.type === 'checking' && accountStep.overdraftAmount > 0) {
          const overdraftFee = calculateOverdraftFees(accountStep.account, accountStep.overdraftAmount);
          const nsfCharges = calculateNSFCharges(accountStep.account, accountStep.overdraftAmount);
          
          const overdraftConsequence = {
            accountId: accountStep.account.id,
            accountName: accountStep.account.name,
            overdraftAmount: accountStep.overdraftAmount,
            overdraftFee,
            nsfCharges,
            totalCost: overdraftFee + nsfCharges,
            dailyFees: calculateDailyOverdraftFees(accountStep.account),
            projectedDuration: estimateOverdraftDuration(accountStep.account, accountStep.overdraftAmount)
          };
          
          overdraftFees.push(overdraftConsequence);
          totalOverdraftCosts += overdraftConsequence.totalCost;
        }
      }
    }
    
    const consequenceModel = {
      ...state.consequenceModel,
      overdraftFees,
      totalOverdraftCosts
    };
    
    console.log(`✅ Overdraft modeling: ${overdraftFees.length} potential overdrafts, $${totalOverdraftCosts} total cost`);
    
    return {
      consequenceModel,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'overdraft_modeling']
      }
    };
    
  } catch (error) {
    console.error('❌ Overdraft modeling failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'overdraft_modeling',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

/**
 * Node 3: Calculate Credit Impacts
 * Models credit utilization, interest costs, and credit score effects
 */
async function calculateCreditImpacts(state) {
  console.log('💳 Consequence Engine: Calculating credit impacts...');
  
  try {
    const { paymentAnalysis, scenarioExecution } = state;
    const { accounts } = scenarioExecution;
    
    const creditUtilization = {};
    const interestCosts = {};
    let totalCreditCosts = 0;
    
    // Analyze credit card usage in fallback sequence
    for (const accountStep of paymentAnalysis.fallbackSequence) {
      if (accountStep.account.type === 'credit_card') {
        const creditAccount = accountStep.account;
        const chargeAmount = accountStep.amount;
        
        // Calculate new utilization
        const newBalance = (creditAccount.currentBalance || 0) + chargeAmount;
        const creditLimit = creditAccount.creditLimit || 0;
        const utilizationRate = creditLimit > 0 ? (newBalance / creditLimit) * 100 : 0;
        
        // Calculate interest costs
        const annualRate = creditAccount.interestRate || 0.18; // Default 18% APR
        const monthlyRate = annualRate / 12;
        const minimumPayment = Math.max(newBalance * 0.02, 25); // 2% minimum
        
        const interestProjection = calculateCreditInterestProjection(
          newBalance, 
          monthlyRate, 
          minimumPayment,
          12 // 12 month projection
        );
        
        creditUtilization[creditAccount.id] = {
          accountName: creditAccount.name,
          previousBalance: creditAccount.currentBalance || 0,
          newBalance,
          creditLimit,
          utilizationRate,
          utilizationImpact: utilizationRate > 30 ? 'high' : utilizationRate > 10 ? 'moderate' : 'low'
        };
        
        interestCosts[creditAccount.id] = {
          accountName: creditAccount.name,
          chargeAmount,
          monthlyInterest: interestProjection.monthlyInterest,
          yearlyInterest: interestProjection.yearlyInterest,
          minimumPayment,
          payoffTime: interestProjection.payoffMonths
        };
        
        totalCreditCosts += interestProjection.yearlyInterest;
      }
    }
    
    const consequenceModel = {
      ...state.consequenceModel,
      creditUtilization,
      interestCosts,
      totalCreditCosts
    };
    
    console.log(`✅ Credit impact analysis: ${Object.keys(creditUtilization).length} credit accounts affected, $${totalCreditCosts} annual interest`);
    
    return {
      consequenceModel,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'credit_impact_analysis']
      }
    };
    
  } catch (error) {
    console.error('❌ Credit impact analysis failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'credit_impact_analysis',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

/**
 * Node 4: Analyze Cascade Effects
 * Models secondary and tertiary effects of financial decisions
 */
async function analyzeCascadeEffects(state) {
  console.log('🌊 Consequence Engine: Analyzing cascade effects...');
  
  try {
    const { consequenceModel, paymentAnalysis, scenarioExecution } = state;
    const { scenario, financialContext } = scenarioExecution;
    
    const cascadeEffects = [];
    
    // Emergency fund impact
    if (paymentAnalysis.shortfall > 0) {
      const emergencyFundReduction = calculateEmergencyFundImpact(
        financialContext.emergencyFund || 0,
        paymentAnalysis.shortfall
      );
      
      if (emergencyFundReduction.impact === 'severe') {
        cascadeEffects.push({
          type: 'emergency_fund_depletion',
          severity: 'high',
          description: 'Emergency fund would be significantly depleted',
          financialImpact: emergencyFundReduction.amount,
          riskLevel: 'high'
        });
      }
    }
    
    // Credit score impact from high utilization
    Object.values(consequenceModel.creditUtilization).forEach(utilization => {
      if (utilization.utilizationRate > 30) {
        cascadeEffects.push({
          type: 'credit_score_impact',
          severity: 'moderate',
          description: `High credit utilization (${utilization.utilizationRate.toFixed(1)}%) may reduce credit score`,
          financialImpact: 0, // Indirect impact
          riskLevel: 'moderate'
        });
      }
    });
    
    // Cash flow stress
    const monthlyPaymentIncrease = calculateMonthlyPaymentIncrease(consequenceModel);
    if (monthlyPaymentIncrease > financialContext.monthlyIncome * 0.1) {
      cascadeEffects.push({
        type: 'cash_flow_stress',
        severity: 'high',
        description: `Monthly payment obligations would increase by $${monthlyPaymentIncrease.toFixed(2)}`,
        financialImpact: monthlyPaymentIncrease * 12,
        riskLevel: 'high'
      });
    }
    
    // Future borrowing capacity
    if (Object.keys(consequenceModel.creditUtilization).length > 0) {
      cascadeEffects.push({
        type: 'reduced_borrowing_capacity',
        severity: 'moderate',
        description: 'Increased credit utilization may limit future borrowing options',
        financialImpact: 0,
        riskLevel: 'moderate'
      });
    }
    
    const totalAdditionalCosts = (consequenceModel.totalOverdraftCosts || 0) + 
                                (consequenceModel.totalCreditCosts || 0) +
                                cascadeEffects.reduce((sum, effect) => sum + effect.financialImpact, 0);
    
    const updatedConsequenceModel = {
      ...consequenceModel,
      cascadeEffects,
      totalAdditionalCosts
    };
    
    console.log(`✅ Cascade analysis: ${cascadeEffects.length} cascade effects identified, $${totalAdditionalCosts} total additional costs`);
    
    return {
      consequenceModel: updatedConsequenceModel,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'cascade_analysis']
      }
    };
    
  } catch (error) {
    console.error('❌ Cascade analysis failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'cascade_analysis',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

/**
 * Node 5: Generate Intelligent Solutions
 * Creates optimized payment strategies and alternative approaches
 */
async function generateIntelligentSolutions(state) {
  console.log('🧠 Consequence Engine: Generating intelligent solutions...');
  
  try {
    const { paymentAnalysis, consequenceModel, scenarioExecution } = state;
    const { scenario, accounts } = scenarioExecution;
    
    // Find optimal payment method to minimize costs
    const optimalPaymentMethod = findOptimalPaymentMethod(
      paymentAnalysis,
      consequenceModel,
      accounts
    );
    
    // Generate alternative approaches
    const alternativeApproaches = generateAlternativeApproaches(
      scenario,
      paymentAnalysis,
      consequenceModel
    );
    
    // Create risk mitigation strategies
    const riskMitigation = generateRiskMitigationStrategies(
      consequenceModel,
      paymentAnalysis
    );
    
    // Generate cost optimization suggestions
    const costOptimizations = generateCostOptimizations(
      scenario,
      consequenceModel,
      accounts
    );
    
    const intelligentSolutions = {
      optimalPaymentMethod,
      alternativeApproaches,
      riskMitigation,
      costOptimizations
    };
    
    console.log(`✅ Intelligent solutions: ${alternativeApproaches.length} alternatives, ${riskMitigation.length} risk mitigations`);
    
    return {
      intelligentSolutions,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'intelligent_solutions']
      }
    };
    
  } catch (error) {
    console.error('❌ Intelligent solutions generation failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'intelligent_solutions',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

/**
 * Node 6: Synthesize Consequence Report
 * Creates comprehensive final analysis and recommendations
 */
async function synthesizeConsequenceReport(state) {
  console.log('📊 Consequence Engine: Synthesizing consequence report...');
  
  try {
    const { paymentAnalysis, consequenceModel, intelligentSolutions, scenarioExecution } = state;
    const { scenario } = scenarioExecution;
    
    // Determine execution feasibility
    const executionFeasible = determineExecutionFeasibility(
      paymentAnalysis,
      consequenceModel,
      intelligentSolutions
    );
    
    // Calculate total cost (scenario cost + additional consequences)
    const scenarioCost = paymentAnalysis.requiredAmount;
    const totalCost = scenarioCost + consequenceModel.totalAdditionalCosts;
    
    // Determine overall risk level
    const riskLevel = determineOverallRiskLevel(consequenceModel, paymentAnalysis);
    
    // Select recommended approach
    const recommendedApproach = selectRecommendedApproach(
      intelligentSolutions,
      consequenceModel,
      executionFeasible
    );
    
    // Generate warnings
    const warnings = generateWarnings(consequenceModel, paymentAnalysis);
    
    // Create next steps
    const nextSteps = generateNextSteps(
      executionFeasible,
      recommendedApproach,
      intelligentSolutions
    );
    
    const consequenceReport = {
      executionFeasible,
      totalCost,
      scenarioCost,
      additionalCosts: consequenceModel.totalAdditionalCosts,
      riskLevel,
      recommendedApproach,
      warnings,
      nextSteps,
      detailedAnalysis: {
        paymentAnalysis: paymentAnalysis,
        consequences: consequenceModel,
        solutions: intelligentSolutions
      }
    };
    
    console.log(`✅ Consequence report: ${executionFeasible ? 'Feasible' : 'Not feasible'}, $${totalCost} total cost, ${riskLevel} risk`);
    
    return {
      consequenceReport,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'consequence_report'],
        endTime: Date.now()
      }
    };
    
  } catch (error) {
    console.error('❌ Consequence report synthesis failed:', error);
    return {
      executionMetadata: {
        ...state.executionMetadata,
        errors: [...state.executionMetadata.errors, {
          phase: 'consequence_report',
          error: error.message,
          timestamp: Date.now()
        }]
      }
    };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate required amount for scenario execution
 */
function calculateScenarioRequiredAmount(scenario) {
  const { type, parameters } = scenario;
  
  switch (type) {
    case 'home_purchase':
      return (parameters.downPayment || 0) + (parameters.closingCosts || 0);
    case 'car_purchase':
      return parameters.downPayment || parameters.totalPrice || 0;
    case 'investment':
      return parameters.initialInvestment || parameters.investmentAmount || 0;
    case 'debt_payoff':
      return parameters.payoffAmount || parameters.currentBalance || 0;
    case 'major_purchase':
      return parameters.purchaseAmount || parameters.amount || 0;
    case 'emergency_expense':
      return parameters.expenseAmount || parameters.amount || 0;
    default:
      return parameters.amount || parameters.totalAmount || 0;
  }
}

/**
 * Find primary account for scenario type
 */
function findPrimaryAccount(accounts, scenarioType) {
  // Try to find account type that matches scenario
  const accountTypeMap = {
    'home_purchase': ['checking', 'savings'],
    'car_purchase': ['checking', 'savings'],
    'investment': ['checking', 'investment'],
    'debt_payoff': ['checking'],
    'major_purchase': ['checking'],
    'emergency_expense': ['checking', 'savings']
  };
  
  const preferredTypes = accountTypeMap[scenarioType] || ['checking'];
  
  for (const type of preferredTypes) {
    const account = accounts.find(acc => acc.type === type && acc.isActive);
    if (account) return account;
  }
  
  // Fallback to first checking account
  return accounts.find(acc => acc.type === 'checking' && acc.isActive) || accounts[0];
}

/**
 * Build intelligent fallback payment sequence
 */
function buildFallbackSequence(accounts, requiredAmount, primaryAccount) {
  const sequence = [];
  let remainingAmount = requiredAmount;
  
  // Step 1: Primary account
  if (primaryAccount) {
    const availableFromPrimary = Math.min(primaryAccount.currentBalance, remainingAmount);
    const overdraftAmount = Math.max(0, remainingAmount - availableFromPrimary);
    
    sequence.push({
      step: 1,
      account: primaryAccount,
      amount: availableFromPrimary,
      overdraftAmount,
      paymentMethod: 'bank_transfer'
    });
    
    remainingAmount -= availableFromPrimary;
  }
  
  // Step 2: Secondary liquid accounts (savings, checking)
  if (remainingAmount > 0) {
    const liquidAccounts = accounts.filter(acc => 
      acc.id !== primaryAccount?.id &&
      ['checking', 'savings'].includes(acc.type) &&
      acc.isActive &&
      acc.currentBalance > 0
    ).sort((a, b) => b.currentBalance - a.currentBalance);
    
    for (const account of liquidAccounts) {
      if (remainingAmount <= 0) break;
      
      const availableFromAccount = Math.min(account.currentBalance, remainingAmount);
      sequence.push({
        step: sequence.length + 1,
        account,
        amount: availableFromAccount,
        overdraftAmount: 0,
        paymentMethod: 'bank_transfer'
      });
      
      remainingAmount -= availableFromAccount;
    }
  }
  
  // Step 3: Credit cards (ordered by lowest utilization)
  if (remainingAmount > 0) {
    const creditCards = accounts.filter(acc => 
      acc.type === 'credit_card' &&
      acc.isActive &&
      (acc.creditLimit - acc.currentBalance) > 0
    ).sort((a, b) => {
      const utilizationA = a.currentBalance / a.creditLimit;
      const utilizationB = b.currentBalance / b.creditLimit;
      return utilizationA - utilizationB;
    });
    
    for (const card of creditCards) {
      if (remainingAmount <= 0) break;
      
      const availableCredit = card.creditLimit - card.currentBalance;
      const chargeAmount = Math.min(availableCredit, remainingAmount);
      
      sequence.push({
        step: sequence.length + 1,
        account: card,
        amount: chargeAmount,
        overdraftAmount: 0,
        paymentMethod: 'credit_card'
      });
      
      remainingAmount -= chargeAmount;
    }
  }
  
  return sequence;
}

/**
 * Calculate overdraft fees for account
 */
function calculateOverdraftFees(account, overdraftAmount) {
  // Standard overdraft fee structure
  const feeStructure = account.overdraftFees || {
    perOccurrence: 35,
    maxPerDay: 6,
    maxPerMonth: 30
  };
  
  if (overdraftAmount <= 0) return 0;
  
  // Calculate base overdraft fee
  let totalFees = feeStructure.perOccurrence;
  
  // Additional fees for larger amounts
  if (overdraftAmount > 500) {
    totalFees += Math.floor(overdraftAmount / 500) * 10;
  }
  
  return Math.min(totalFees, feeStructure.maxPerDay * feeStructure.perOccurrence);
}

/**
 * Calculate NSF (Non-Sufficient Funds) charges
 */
function calculateNSFCharges(account, amount) {
  if (amount <= 0) return 0;
  
  const nsfFee = account.nsfFee || 30;
  return nsfFee;
}

/**
 * Calculate daily overdraft fees
 */
function calculateDailyOverdraftFees(account) {
  return account.dailyOverdraftFee || 5;
}

/**
 * Estimate overdraft duration
 */
function estimateOverdraftDuration(account, overdraftAmount) {
  const monthlyIncome = account.monthlyDeposits || 2000; // Estimate
  const daysToRecover = Math.ceil(overdraftAmount / (monthlyIncome / 30));
  return Math.min(daysToRecover, 30); // Cap at 30 days
}

/**
 * Calculate credit interest projection
 */
function calculateCreditInterestProjection(balance, monthlyRate, minimumPayment, months) {
  let currentBalance = balance;
  let totalInterest = 0;
  let payoffMonths = 0;
  
  for (let month = 1; month <= months && currentBalance > 0; month++) {
    const interestCharge = currentBalance * monthlyRate;
    const principalPayment = Math.max(0, minimumPayment - interestCharge);
    
    totalInterest += interestCharge;
    currentBalance = Math.max(0, currentBalance - principalPayment);
    payoffMonths = month;
    
    if (principalPayment <= 0) break; // Minimum payment doesn't cover interest
  }
  
  return {
    monthlyInterest: totalInterest / months,
    yearlyInterest: totalInterest,
    payoffMonths: currentBalance > 0 ? Infinity : payoffMonths
  };
}

/**
 * Calculate emergency fund impact
 */
function calculateEmergencyFundImpact(currentEmergencyFund, usedAmount) {
  if (currentEmergencyFund === 0) {
    return { impact: 'none', amount: 0 };
  }
  
  const remainingFund = Math.max(0, currentEmergencyFund - usedAmount);
  const reductionPercentage = ((currentEmergencyFund - remainingFund) / currentEmergencyFund) * 100;
  
  let impact = 'minimal';
  if (reductionPercentage > 75) impact = 'severe';
  else if (reductionPercentage > 50) impact = 'moderate';
  else if (reductionPercentage > 25) impact = 'noticeable';
  
  return {
    impact,
    amount: usedAmount,
    reductionPercentage,
    remainingFund
  };
}

/**
 * Calculate monthly payment increase
 */
function calculateMonthlyPaymentIncrease(consequenceModel) {
  let increase = 0;
  
  // Add credit card minimum payment increases
  Object.values(consequenceModel.interestCosts || {}).forEach(cost => {
    increase += cost.minimumPayment || 0;
  });
  
  return increase;
}

/**
 * Find optimal payment method
 */
function findOptimalPaymentMethod(paymentAnalysis, consequenceModel, accounts) {
  const methods = paymentAnalysis.fallbackSequence.map(step => {
    let cost = 0;
    
    // Add overdraft costs
    if (step.overdraftAmount > 0) {
      cost += calculateOverdraftFees(step.account, step.overdraftAmount);
    }
    
    // Add credit costs
    if (step.account.type === 'credit_card') {
      const interestCost = consequenceModel.interestCosts[step.account.id];
      cost += interestCost?.yearlyInterest || 0;
    }
    
    return {
      step: step.step,
      account: step.account,
      cost,
      riskLevel: determinePaymentMethodRisk(step, cost)
    };
  });
  
  // Find method with lowest cost and acceptable risk
  return methods.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) {
      const riskOrder = { 'low': 0, 'moderate': 1, 'high': 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.cost - b.cost;
  })[0];
}

/**
 * Generate alternative approaches
 */
function generateAlternativeApproaches(scenario, paymentAnalysis, consequenceModel) {
  const alternatives = [];
  
  // Phased approach
  if (paymentAnalysis.requiredAmount > 1000) {
    alternatives.push({
      type: 'phased_implementation',
      title: `Implement ${scenario.name} in phases`,
      description: 'Split large expense into smaller monthly payments',
      costReduction: consequenceModel.totalAdditionalCosts * 0.6,
      riskReduction: 'moderate'
    });
  }
  
  // Delayed execution
  alternatives.push({
    type: 'delayed_execution',
    title: `Delay ${scenario.name} by 3-6 months`,
    description: 'Save additional funds to reduce borrowing needs',
    costReduction: consequenceModel.totalAdditionalCosts * 0.8,
    riskReduction: 'high'
  });
  
  // Scaled down version
  if (scenario.parameters.amount || scenario.parameters.purchaseAmount) {
    alternatives.push({
      type: 'scaled_down',
      title: `Scaled-down version of ${scenario.name}`,
      description: 'Reduce scope to match available funds',
      costReduction: consequenceModel.totalAdditionalCosts * 0.5,
      riskReduction: 'moderate'
    });
  }
  
  return alternatives;
}

/**
 * Generate risk mitigation strategies
 */
function generateRiskMitigationStrategies(consequenceModel, paymentAnalysis) {
  const strategies = [];
  
  // Emergency fund protection
  if (consequenceModel.cascadeEffects.some(e => e.type === 'emergency_fund_depletion')) {
    strategies.push({
      type: 'emergency_fund_protection',
      priority: 'high',
      description: 'Maintain minimum emergency fund of $1,000',
      implementation: 'Reduce scenario scope or delay execution'
    });
  }
  
  // Credit utilization management
  if (Object.values(consequenceModel.creditUtilization || {}).some(u => u.utilizationRate > 30)) {
    strategies.push({
      type: 'credit_utilization_management',
      priority: 'moderate',
      description: 'Keep credit utilization below 30%',
      implementation: 'Spread charges across multiple cards or increase credit limits'
    });
  }
  
  // Overdraft prevention
  if (consequenceModel.overdraftFees.length > 0) {
    strategies.push({
      type: 'overdraft_prevention',
      priority: 'high',
      description: 'Avoid overdraft fees through better timing',
      implementation: 'Time expense after payday or arrange temporary credit increase'
    });
  }
  
  return strategies;
}

/**
 * Generate cost optimizations
 */
function generateCostOptimizations(scenario, consequenceModel, accounts) {
  const optimizations = [];
  
  // Interest rate optimization
  const creditCards = accounts.filter(acc => acc.type === 'credit_card');
  if (creditCards.length > 1) {
    const lowestRateCard = creditCards.sort((a, b) => (a.interestRate || 0.18) - (b.interestRate || 0.18))[0];
    optimizations.push({
      type: 'interest_rate_optimization',
      description: `Use ${lowestRateCard.name} for lowest interest rate`,
      potentialSaving: consequenceModel.totalCreditCosts * 0.3
    });
  }
  
  // Balance transfer option
  if (consequenceModel.totalCreditCosts > 500) {
    optimizations.push({
      type: 'balance_transfer',
      description: 'Consider 0% APR balance transfer card',
      potentialSaving: consequenceModel.totalCreditCosts * 0.8
    });
  }
  
  // Payment timing optimization
  optimizations.push({
    type: 'payment_timing',
    description: 'Time large expenses after payroll deposits',
    potentialSaving: consequenceModel.totalOverdraftCosts || 0
  });
  
  return optimizations;
}

/**
 * Determine execution feasibility
 */
function determineExecutionFeasibility(paymentAnalysis, consequenceModel, intelligentSolutions) {
  // Check if payment sequence can cover required amount
  const totalAvailable = paymentAnalysis.fallbackSequence.reduce((sum, step) => sum + step.amount, 0);
  const canCoverAmount = totalAvailable >= paymentAnalysis.requiredAmount;
  
  // Check if consequences are manageable
  const consequencesTooHigh = consequenceModel.totalAdditionalCosts > paymentAnalysis.requiredAmount * 0.5;
  const highRiskEffects = consequenceModel.cascadeEffects.filter(e => e.severity === 'high').length;
  
  return canCoverAmount && !consequencesTooHigh && highRiskEffects < 2;
}

/**
 * Determine overall risk level
 */
function determineOverallRiskLevel(consequenceModel, paymentAnalysis) {
  let riskScore = 0;
  
  // High shortfall risk
  if (paymentAnalysis.shortfall > paymentAnalysis.requiredAmount * 0.5) riskScore += 30;
  
  // High additional costs
  if (consequenceModel.totalAdditionalCosts > paymentAnalysis.requiredAmount * 0.3) riskScore += 25;
  
  // Overdraft risk
  if (consequenceModel.overdraftFees.length > 0) riskScore += 20;
  
  // High credit utilization
  const highUtilization = Object.values(consequenceModel.creditUtilization || {})
    .some(u => u.utilizationRate > 50);
  if (highUtilization) riskScore += 15;
  
  // Cascade effects
  riskScore += consequenceModel.cascadeEffects.filter(e => e.severity === 'high').length * 10;
  
  if (riskScore >= 60) return 'high';
  if (riskScore >= 30) return 'moderate';
  return 'low';
}

/**
 * Select recommended approach
 */
function selectRecommendedApproach(intelligentSolutions, consequenceModel, executionFeasible) {
  if (!executionFeasible) {
    return intelligentSolutions.alternativeApproaches[0] || {
      type: 'not_recommended',
      title: 'Scenario execution not recommended',
      description: 'Financial consequences too severe for current situation'
    };
  }
  
  if (intelligentSolutions.optimalPaymentMethod) {
    return {
      type: 'optimal_payment',
      title: 'Proceed with optimal payment method',
      description: `Use ${intelligentSolutions.optimalPaymentMethod.account.name}`,
      estimatedCost: intelligentSolutions.optimalPaymentMethod.cost
    };
  }
  
  return {
    type: 'standard_approach',
    title: 'Proceed with caution',
    description: 'Monitor financial impact closely'
  };
}

/**
 * Generate warnings
 */
function generateWarnings(consequenceModel, paymentAnalysis) {
  const warnings = [];
  
  if (paymentAnalysis.shortfall > 0) {
    warnings.push({
      type: 'insufficient_funds',
      severity: 'high',
      message: `Insufficient funds: $${paymentAnalysis.shortfall} shortfall detected`
    });
  }
  
  if (consequenceModel.totalOverdraftCosts > 0) {
    warnings.push({
      type: 'overdraft_fees',
      severity: 'high',
      message: `Potential overdraft fees: $${consequenceModel.totalOverdraftCosts}`
    });
  }
  
  const highUtilization = Object.values(consequenceModel.creditUtilization || {})
    .filter(u => u.utilizationRate > 30);
  if (highUtilization.length > 0) {
    warnings.push({
      type: 'high_credit_utilization',
      severity: 'moderate',
      message: `High credit utilization may impact credit score`
    });
  }
  
  return warnings;
}

/**
 * Generate next steps
 */
function generateNextSteps(executionFeasible, recommendedApproach, intelligentSolutions) {
  const steps = [];
  
  if (executionFeasible) {
    steps.push('Review optimal payment method details');
    steps.push('Implement recommended risk mitigation strategies');
    steps.push('Monitor financial impact after execution');
  } else {
    steps.push('Consider alternative approaches');
    steps.push('Build additional financial capacity');
    steps.push('Reassess scenario in 3-6 months');
  }
  
  // Add specific optimization steps
  intelligentSolutions.costOptimizations.forEach(opt => {
    steps.push(`Consider ${opt.type}: ${opt.description}`);
  });
  
  return steps;
}

/**
 * Determine payment method risk
 */
function determinePaymentMethodRisk(paymentStep, cost) {
  if (paymentStep.overdraftAmount > 0) return 'high';
  if (cost > paymentStep.amount * 0.2) return 'high';
  if (paymentStep.account.type === 'credit_card' && cost > 100) return 'moderate';
  return 'low';
}

module.exports = {
  FinancialConsequenceEngine,
  // Export helper functions for testing
  calculateScenarioRequiredAmount,
  findPrimaryAccount,
  buildFallbackSequence,
  calculateOverdraftFees,
  calculateCreditInterestProjection
}; 