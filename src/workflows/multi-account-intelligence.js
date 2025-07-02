/**
 * Multi-Account Intelligence Workflows - Phase 3.7.1
 * AI-Powered Cross-Account Analysis and Portfolio Optimization
 * 
 * This system provides sophisticated multi-account analysis beyond basic calculations,
 * offering portfolio optimization, risk assessment, and intelligent recommendations.
 */

const { StateGraph, START, END } = require("@langchain/langgraph");
const { AccountDAO } = require('../database/account-dao');
const { TransactionDAO } = require('../database/transaction-dao');
const config = require('../config');

/**
 * Multi-Account Intelligence State Schema
 * Manages cross-account analysis and portfolio optimization
 */
const MultiAccountIntelligenceState = {
  channels: {
    // Input data
    userId: {
      value: (x, y) => y ?? x ?? null,
      default: () => null
    },
    
    // Account aggregation
    accountPortfolio: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        accounts: [],
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        accountsByCategory: {},
        riskProfile: null
      })
    },
    
    // Portfolio analysis
    portfolioAnalysis: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        assetAllocation: {},
        diversificationScore: 0,
        liquidityAnalysis: {},
        riskAssessment: {},
        performanceMetrics: {}
      })
    },
    
    // Cross-account insights
    crossAccountInsights: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    },
    
    // Optimization opportunities
    optimizationOpportunities: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    },
    
    // Actionable recommendations
    actionableRecommendations: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    },
    
    // Execution metadata
    executionMetadata: {
      value: (x, y) => ({ ...x, ...y }),
      default: () => ({
        workflowId: `multi-account-${Date.now()}`,
        version: '3.7.1',
        framework: 'MultiAccountIntelligence',
        startTime: Date.now(),
        phases: []
      })
    },
    
    // Errors
    errors: {
      value: (x, y) => [...(x || []), ...(Array.isArray(y) ? y : [y])],
      default: () => []
    }
  }
};

// === WORKFLOW NODES ===

/**
 * Node 1: Aggregate Account Data
 * Consolidates all user accounts with comprehensive portfolio overview
 */
async function aggregateAccountData(state) {
  console.log('📊 Multi-Account Intelligence: Aggregating account data...');
  
  try {
    const { userId } = state;
    
    if (!userId) {
      throw new Error('User ID is required for account aggregation');
    }
    
    // Load all user accounts
    const accounts = await AccountDAO.getByUserId(userId, { is_active: true });
    console.log(`📈 Found ${accounts.length} active accounts`);
    
    // Get account statistics
    const accountStats = await AccountDAO.getAccountStatistics(userId);
    
    // Categorize accounts by type and category
    const accountsByCategory = {};
    const accountsByType = {};
    
    accounts.forEach(account => {
      const category = account.typeInfo?.category || 'OTHER';
      if (!accountsByCategory[category]) {
        accountsByCategory[category] = [];
      }
      accountsByCategory[category].push(account);
      
      if (!accountsByType[account.type]) {
        accountsByType[account.type] = [];
      }
      accountsByType[account.type].push(account);
    });
    
    // Calculate portfolio totals
    const totalAssets = accounts
      .filter(acc => acc.currentBalance > 0)
      .reduce((sum, acc) => sum + acc.currentBalance, 0);
      
    const totalLiabilities = Math.abs(accounts
      .filter(acc => acc.currentBalance < 0)
      .reduce((sum, acc) => sum + acc.currentBalance, 0));
      
    const netWorth = totalAssets - totalLiabilities;
    
    // Determine risk profile based on account composition
    const riskProfile = determineRiskProfile(accounts, accountsByCategory);
    
    const accountPortfolio = {
      accounts,
      totalAssets,
      totalLiabilities,
      netWorth,
      accountsByCategory,
      accountsByType,
      accountStats,
      riskProfile,
      accountCount: accounts.length
    };
    
    console.log(`✅ Portfolio aggregated: $${netWorth.toLocaleString()} net worth across ${accounts.length} accounts`);
    
    return {
      accountPortfolio,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'aggregateAccountData'],
        accountCount: accounts.length,
        netWorth
      }
    };
    
  } catch (error) {
    console.error('❌ Error aggregating account data:', error);
    return {
      errors: [{
        phase: 'aggregateAccountData',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Node 2: Analyze Portfolio Allocation
 * Performs sophisticated portfolio analysis and risk assessment
 */
async function analyzePortfolioAllocation(state) {
  console.log('🔍 Multi-Account Intelligence: Analyzing portfolio allocation...');
  
  try {
    const { accountPortfolio } = state;
    
    if (!accountPortfolio || !accountPortfolio.accounts) {
      throw new Error('Account portfolio data is required');
    }
    
    // Asset allocation analysis
    const assetAllocation = calculateAssetAllocation(accountPortfolio);
    
    // Diversification scoring
    const diversificationScore = calculateDiversificationScore(accountPortfolio);
    
    // Liquidity analysis
    const liquidityAnalysis = analyzeLiquidity(accountPortfolio);
    
    // Risk assessment
    const riskAssessment = assessPortfolioRisk(accountPortfolio);
    
    // Performance metrics
    const performanceMetrics = calculatePerformanceMetrics(accountPortfolio);
    
    const portfolioAnalysis = {
      assetAllocation,
      diversificationScore,
      liquidityAnalysis,
      riskAssessment,
      performanceMetrics,
      allocationHealth: calculateAllocationHealth(assetAllocation, accountPortfolio.riskProfile)
    };
    
    console.log(`✅ Portfolio analysis complete: ${diversificationScore}% diversification score`);
    
    return {
      portfolioAnalysis,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'analyzePortfolioAllocation'],
        diversificationScore,
        liquidityRatio: liquidityAnalysis.liquidityRatio
      }
    };
    
  } catch (error) {
    console.error('❌ Error analyzing portfolio allocation:', error);
    return {
      errors: [{
        phase: 'analyzePortfolioAllocation',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Node 3: Identify Optimization Opportunities
 * Finds specific areas for portfolio improvement and cost reduction
 */
async function identifyOptimizationOpportunities(state) {
  console.log('💡 Multi-Account Intelligence: Identifying optimization opportunities...');
  
  try {
    const { accountPortfolio, portfolioAnalysis } = state;
    const opportunities = [];
    
    // 1. Interest Rate Optimization
    const interestOpportunities = findInterestRateOpportunities(accountPortfolio);
    opportunities.push(...interestOpportunities);
    
    // 2. Account Consolidation Opportunities
    const consolidationOpportunities = findConsolidationOpportunities(accountPortfolio);
    opportunities.push(...consolidationOpportunities);
    
    // 3. Cash Flow Optimization
    const cashFlowOpportunities = findCashFlowOptimizations(accountPortfolio, portfolioAnalysis);
    opportunities.push(...cashFlowOpportunities);
    
    // 4. Tax Optimization
    const taxOpportunities = findTaxOptimizations(accountPortfolio);
    opportunities.push(...taxOpportunities);
    
    // 5. Risk Balancing
    const riskOpportunities = findRiskBalancingOpportunities(accountPortfolio, portfolioAnalysis);
    opportunities.push(...riskOpportunities);
    
    // 6. Fee Reduction
    const feeOpportunities = findFeeReductionOpportunities(accountPortfolio);
    opportunities.push(...feeOpportunities);
    
    // Prioritize opportunities by impact
    const prioritizedOpportunities = opportunities
      .map(opp => ({
        ...opp,
        priorityScore: calculateOpportunityPriority(opp, accountPortfolio)
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
    
    console.log(`✅ Identified ${opportunities.length} optimization opportunities`);
    
    return {
      optimizationOpportunities: prioritizedOpportunities,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'identifyOptimizationOpportunities'],
        opportunityCount: opportunities.length,
        highPriorityOpportunities: prioritizedOpportunities.filter(o => o.priorityScore >= 8).length
      }
    };
    
  } catch (error) {
    console.error('❌ Error identifying optimization opportunities:', error);
    return {
      errors: [{
        phase: 'identifyOptimizationOpportunities',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

/**
 * Node 4: Generate Cross-Account Recommendations
 * Creates actionable recommendations with specific implementation steps
 */
async function generateCrossAccountRecommendations(state) {
  console.log('🧠 Multi-Account Intelligence: Generating cross-account recommendations...');
  
  try {
    const { accountPortfolio, portfolioAnalysis, optimizationOpportunities } = state;
    const recommendations = [];
    const insights = [];
    
    // Generate recommendations for top opportunities
    const topOpportunities = optimizationOpportunities.slice(0, 5); // Top 5 opportunities
    
    for (const opportunity of topOpportunities) {
      const recommendation = generateRecommendationFromOpportunity(opportunity, accountPortfolio);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    // Generate strategic insights
    insights.push(...generateStrategicInsights(accountPortfolio, portfolioAnalysis));
    
    // Generate portfolio rebalancing recommendations
    if (portfolioAnalysis.allocationHealth < 0.7) {
      recommendations.push(...generateRebalancingRecommendations(accountPortfolio, portfolioAnalysis));
    }
    
    // Generate emergency fund recommendations
    const emergencyFundRec = generateEmergencyFundRecommendation(accountPortfolio);
    if (emergencyFundRec) {
      recommendations.push(emergencyFundRec);
    }
    
    // Generate debt optimization recommendations
    const debtRecommendations = generateDebtOptimizationRecommendations(accountPortfolio);
    recommendations.push(...debtRecommendations);
    
    // Prioritize all recommendations
    const prioritizedRecommendations = recommendations
      .map(rec => ({
        ...rec,
        priorityScore: calculateRecommendationPriority(rec, accountPortfolio),
        timeframe: determineImplementationTimeframe(rec),
        difficulty: assessImplementationDifficulty(rec)
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
    
    console.log(`✅ Generated ${recommendations.length} recommendations and ${insights.length} insights`);
    
    return {
      actionableRecommendations: prioritizedRecommendations,
      crossAccountInsights: insights,
      executionMetadata: {
        ...state.executionMetadata,
        phases: [...state.executionMetadata.phases, 'generateCrossAccountRecommendations'],
        recommendationCount: recommendations.length,
        insightCount: insights.length,
        completionTime: Date.now(),
        totalDuration: Date.now() - state.executionMetadata.startTime
      }
    };
    
  } catch (error) {
    console.error('❌ Error generating cross-account recommendations:', error);
    return {
      errors: [{
        phase: 'generateCrossAccountRecommendations',
        error: error.message,
        timestamp: Date.now()
      }]
    };
  }
}

// === HELPER FUNCTIONS ===

/**
 * Determine risk profile based on account composition
 */
function determineRiskProfile(accounts, accountsByCategory) {
  let riskScore = 0;
  let totalBalance = accounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  
  if (totalBalance === 0) return 'conservative';
  
  // Conservative: High cash, CDs, savings
  const conservativeBalance = (accountsByCategory['ASSETS.LIQUID'] || [])
    .reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  
  // Moderate: 401k, some investment
  const moderateBalance = (accountsByCategory['ASSETS.RETIREMENT'] || [])
    .reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  
  // Aggressive: Stocks, crypto, high-risk investments
  const aggressiveBalance = (accountsByCategory['ASSETS.INVESTMENT'] || [])
    .concat(accountsByCategory['ASSETS.ALTERNATIVE'] || [])
    .reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  
  const conservativeRatio = conservativeBalance / totalBalance;
  const moderateRatio = moderateBalance / totalBalance;
  const aggressiveRatio = aggressiveBalance / totalBalance;
  
  if (conservativeRatio > 0.6) return 'conservative';
  if (aggressiveRatio > 0.4) return 'aggressive';
  return 'moderate';
}

/**
 * Calculate asset allocation across categories
 */
function calculateAssetAllocation(portfolio) {
  const { accounts, totalAssets } = portfolio;
  
  if (totalAssets === 0) return {};
  
  const allocation = {};
  
  accounts.forEach(account => {
    if (account.currentBalance > 0) { // Only count assets
      const category = account.typeInfo?.category || 'OTHER';
      if (!allocation[category]) {
        allocation[category] = { balance: 0, percentage: 0, accounts: [] };
      }
      allocation[category].balance += account.currentBalance;
      allocation[category].accounts.push(account);
    }
  });
  
  // Calculate percentages
  Object.keys(allocation).forEach(category => {
    allocation[category].percentage = (allocation[category].balance / totalAssets) * 100;
  });
  
  return allocation;
}

/**
 * Calculate portfolio diversification score
 */
function calculateDiversificationScore(portfolio) {
  const { accountsByCategory } = portfolio;
  const categories = Object.keys(accountsByCategory);
  
  // Base score on number of categories (0-40 points)
  let score = Math.min(categories.length * 8, 40);
  
  // Bonus for balanced allocation (0-30 points)
  if (categories.length > 1) {
    const balances = categories.map(cat => 
      accountsByCategory[cat].reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0)
    );
    const totalBalance = balances.reduce((sum, bal) => sum + bal, 0);
    
    if (totalBalance > 0) {
      const percentages = balances.map(bal => bal / totalBalance);
      const maxPercentage = Math.max(...percentages);
      
      // Penalty for over-concentration
      if (maxPercentage < 0.5) score += 30;
      else if (maxPercentage < 0.7) score += 20;
      else if (maxPercentage < 0.8) score += 10;
    }
  }
  
  // Bonus for having emergency fund (0-20 points)
  const liquidAccounts = accountsByCategory['ASSETS.LIQUID'] || [];
  const liquidBalance = liquidAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  if (liquidBalance > 5000) score += 20;
  else if (liquidBalance > 2000) score += 10;
  
  // Bonus for retirement accounts (0-10 points)
  const retirementAccounts = accountsByCategory['ASSETS.RETIREMENT'] || [];
  if (retirementAccounts.length > 0) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Analyze portfolio liquidity
 */
function analyzeLiquidity(portfolio) {
  const { accounts, totalAssets } = portfolio;
  
  let liquidBalance = 0;
  let semiLiquidBalance = 0;
  let illiquidBalance = 0;
  
  accounts.forEach(account => {
    if (account.currentBalance > 0) {
      const liquidityScore = account.typeInfo?.liquidityScore || 0;
      
      if (liquidityScore >= 90) {
        liquidBalance += account.currentBalance;
      } else if (liquidityScore >= 50) {
        semiLiquidBalance += account.currentBalance;
      } else {
        illiquidBalance += account.currentBalance;
      }
    }
  });
  
  const liquidityRatio = totalAssets > 0 ? liquidBalance / totalAssets : 0;
  
  return {
    liquidBalance,
    semiLiquidBalance,
    illiquidBalance,
    liquidityRatio,
    liquidityScore: liquidityRatio * 100,
    emergencyFundRatio: liquidBalance / (portfolio.totalAssets || 1),
    recommendation: liquidityRatio < 0.1 ? 'increase_liquidity' : 
                   liquidityRatio > 0.5 ? 'reduce_excess_cash' : 'balanced'
  };
}

/**
 * Assess portfolio risk
 */
function assessPortfolioRisk(portfolio) {
  const { accounts, totalAssets } = portfolio;
  
  let totalRiskScore = 0;
  let weightedRiskScore = 0;
  
  accounts.forEach(account => {
    if (account.currentBalance > 0) {
      const riskLevel = account.typeInfo?.riskLevel || 1;
      const weight = account.currentBalance / totalAssets;
      
      totalRiskScore += riskLevel;
      weightedRiskScore += riskLevel * weight;
    }
  });
  
  const averageRiskLevel = accounts.length > 0 ? totalRiskScore / accounts.length : 1;
  
  return {
    averageRiskLevel,
    weightedRiskScore,
    riskCategory: weightedRiskScore < 2 ? 'low' : 
                  weightedRiskScore < 4 ? 'moderate' : 'high',
    riskConcentration: calculateRiskConcentration(accounts),
    volatilityEstimate: estimatePortfolioVolatility(accounts)
  };
}

/**
 * Calculate performance metrics
 */
function calculatePerformanceMetrics(portfolio) {
  // For MVP, we'll use simplified metrics
  // In a real implementation, we'd integrate with account transaction history
  
  const { accounts, totalAssets, totalLiabilities, netWorth } = portfolio;
  
  const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
  const assetUtilization = calculateAssetUtilization(accounts);
  const growthPotential = estimateGrowthPotential(accounts);
  
  return {
    netWorth,
    debtToAssetRatio,
    assetUtilization,
    growthPotential,
    efficiencyScore: calculateEfficiencyScore(accounts),
    balanceHealthScore: calculateBalanceHealthScore(accounts)
  };
}

/**
 * Calculate allocation health based on risk profile
 */
function calculateAllocationHealth(assetAllocation, riskProfile) {
  const categories = Object.keys(assetAllocation);
  
  if (categories.length === 0) return 0;
  
  // Ideal allocations by risk profile
  const idealAllocations = {
    conservative: {
      'ASSETS.LIQUID': 40,
      'ASSETS.RETIREMENT': 30,
      'ASSETS.INVESTMENT': 20,
      'ASSETS.REAL_ESTATE': 10
    },
    moderate: {
      'ASSETS.LIQUID': 20,
      'ASSETS.RETIREMENT': 40,
      'ASSETS.INVESTMENT': 30,
      'ASSETS.REAL_ESTATE': 10
    },
    aggressive: {
      'ASSETS.LIQUID': 10,
      'ASSETS.RETIREMENT': 30,
      'ASSETS.INVESTMENT': 50,
      'ASSETS.ALTERNATIVE': 10
    }
  };
  
  const idealAllocation = idealAllocations[riskProfile] || idealAllocations.moderate;
  let totalDeviation = 0;
  let categoriesChecked = 0;
  
  Object.keys(idealAllocation).forEach(category => {
    const idealPercentage = idealAllocation[category];
    const actualPercentage = assetAllocation[category]?.percentage || 0;
    const deviation = Math.abs(idealPercentage - actualPercentage);
    
    totalDeviation += deviation;
    categoriesChecked++;
  });
  
  const averageDeviation = categoriesChecked > 0 ? totalDeviation / categoriesChecked : 100;
  return Math.max(0, (100 - averageDeviation) / 100);
}

/**
 * Find interest rate optimization opportunities
 */
function findInterestRateOpportunities(portfolio) {
  const opportunities = [];
  const { accounts } = portfolio;
  
  accounts.forEach(account => {
    const interestRate = account.interestRate || 0;
    const balance = Math.abs(account.currentBalance);
    
    // Low interest on savings accounts
    if (account.type === 'savings' && interestRate < 0.02 && balance > 1000) {
      opportunities.push({
        type: 'interest_rate_optimization',
        category: 'savings_rate',
        title: 'Low Savings Account Interest Rate',
        description: `${account.name} earning ${(interestRate * 100).toFixed(2)}% - consider high-yield savings`,
        impact: 'medium',
        potentialSavings: balance * 0.03, // Assume 3% high-yield rate
        accountId: account.id,
        recommendation: 'Consider switching to a high-yield savings account'
      });
    }
    
    // High interest on debt
    if (account.currentBalance < 0 && interestRate > 0.15) {
      opportunities.push({
        type: 'interest_rate_optimization',
        category: 'debt_refinancing',
        title: 'High Interest Debt',
        description: `${account.name} at ${(interestRate * 100).toFixed(2)}% - consider refinancing`,
        impact: 'high',
        potentialSavings: balance * 0.05, // Assume 5% rate reduction
        accountId: account.id,
        recommendation: 'Consider debt consolidation or refinancing'
      });
    }
  });
  
  return opportunities;
}

/**
 * Find account consolidation opportunities
 */
function findConsolidationOpportunities(portfolio) {
  const opportunities = [];
  const { accountsByType } = portfolio;
  
  Object.keys(accountsByType).forEach(accountType => {
    const accountsOfType = accountsByType[accountType];
    
    if (accountsOfType.length > 2) {
      const totalBalance = accountsOfType.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const smallAccounts = accountsOfType.filter(acc => Math.abs(acc.currentBalance) < 500);
      
      if (smallAccounts.length > 0) {
        opportunities.push({
          type: 'account_consolidation',
          category: 'reduce_complexity',
          title: `Multiple ${accountType} Accounts`,
          description: `${accountsOfType.length} ${accountType} accounts - consider consolidating`,
          impact: 'low',
          potentialSavings: smallAccounts.length * 50, // Estimated fee savings
          accountIds: smallAccounts.map(acc => acc.id),
          recommendation: 'Consolidate small accounts to reduce complexity and fees'
        });
      }
    }
  });
  
  return opportunities;
}

/**
 * Find cash flow optimization opportunities
 */
function findCashFlowOptimizations(portfolio, portfolioAnalysis) {
  const opportunities = [];
  const { liquidityAnalysis } = portfolioAnalysis;
  
  // Too much cash sitting idle
  if (liquidityAnalysis.liquidityRatio > 0.3) {
    opportunities.push({
      type: 'cash_flow_optimization',
      category: 'excess_liquidity',
      title: 'Excess Cash Position',
      description: `${(liquidityAnalysis.liquidityRatio * 100).toFixed(1)}% of portfolio in liquid assets`,
      impact: 'medium',
      potentialSavings: liquidityAnalysis.liquidBalance * 0.04, // Opportunity cost
      recommendation: 'Consider investing excess cash in higher-yield accounts or investments'
    });
  }
  
  // Insufficient emergency fund
  if (liquidityAnalysis.liquidBalance < 5000) {
    opportunities.push({
      type: 'cash_flow_optimization',
      category: 'emergency_fund',
      title: 'Insufficient Emergency Fund',
      description: `Only $${liquidityAnalysis.liquidBalance.toLocaleString()} in liquid assets`,
      impact: 'high',
      potentialSavings: 0, // This is risk mitigation, not savings
      recommendation: 'Build emergency fund to 3-6 months of expenses'
    });
  }
  
  return opportunities;
}

/**
 * Find tax optimization opportunities
 */
function findTaxOptimizations(portfolio) {
  const opportunities = [];
  const { accounts } = portfolio;
  
  const taxAdvantagedBalance = accounts
    .filter(acc => acc.taxAdvantaged && acc.currentBalance > 0)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);
    
  const totalAssets = accounts
    .filter(acc => acc.currentBalance > 0)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  const taxAdvantagedRatio = totalAssets > 0 ? taxAdvantagedBalance / totalAssets : 0;
  
  if (taxAdvantagedRatio < 0.2 && totalAssets > 10000) {
    opportunities.push({
      type: 'tax_optimization',
      category: 'retirement_contributions',
      title: 'Underutilized Tax-Advantaged Accounts',
      description: `Only ${(taxAdvantagedRatio * 100).toFixed(1)}% in tax-advantaged accounts`,
      impact: 'high',
      potentialSavings: totalAssets * 0.1 * 0.22, // Assume 22% tax savings on 10% shift
      recommendation: 'Maximize 401k and IRA contributions for tax benefits'
    });
  }
  
  return opportunities;
}

/**
 * Find risk balancing opportunities
 */
function findRiskBalancingOpportunities(portfolio, portfolioAnalysis) {
  const opportunities = [];
  const { riskAssessment } = portfolioAnalysis;
  
  if (riskAssessment.riskConcentration > 0.7) {
    opportunities.push({
      type: 'risk_balancing',
      category: 'diversification',
      title: 'Risk Concentration',
      description: 'Portfolio concentrated in similar risk assets',
      impact: 'medium',
      potentialSavings: 0, // Risk mitigation
      recommendation: 'Diversify across different asset classes and risk levels'
    });
  }
  
  return opportunities;
}

/**
 * Find fee reduction opportunities
 */
function findFeeReductionOpportunities(portfolio) {
  const opportunities = [];
  const { accounts } = portfolio;
  
  // Look for accounts that might have high fees (simplified)
  accounts.forEach(account => {
    if (account.currentBalance < 1000 && (account.type === 'checking' || account.type === 'savings')) {
      opportunities.push({
        type: 'fee_reduction',
        category: 'minimum_balance',
        title: 'Potential Monthly Fees',
        description: `${account.name} below minimum balance requirements`,
        impact: 'low',
        potentialSavings: 120, // $10/month estimated fee
        accountId: account.id,
        recommendation: 'Consider fee-free account options or maintain minimum balance'
      });
    }
  });
  
  return opportunities;
}

/**
 * Calculate opportunity priority score
 */
function calculateOpportunityPriority(opportunity, portfolio) {
  let score = 0;
  
  // Impact weight (0-4 points)
  const impactWeights = { high: 4, medium: 2, low: 1 };
  score += impactWeights[opportunity.impact] || 1;
  
  // Potential savings weight (0-3 points)
  const savings = opportunity.potentialSavings || 0;
  if (savings > 1000) score += 3;
  else if (savings > 500) score += 2;
  else if (savings > 100) score += 1;
  
  // Implementation ease (0-2 points)
  const easyCategories = ['savings_rate', 'reduce_complexity', 'minimum_balance'];
  if (easyCategories.includes(opportunity.category)) score += 2;
  
  // Portfolio relevance (0-1 point)
  if (portfolio.netWorth > 50000) score += 1;
  
  return score;
}

/**
 * Generate recommendation from opportunity
 */
function generateRecommendationFromOpportunity(opportunity, portfolio) {
  return {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: opportunity.type,
    title: opportunity.title,
    description: opportunity.description,
    recommendation: opportunity.recommendation,
    impact: opportunity.impact,
    potentialSavings: opportunity.potentialSavings,
    accountIds: opportunity.accountIds || (opportunity.accountId ? [opportunity.accountId] : []),
    category: opportunity.category,
    actionSteps: generateActionSteps(opportunity),
    estimatedTimeToImplement: estimateImplementationTime(opportunity)
  };
}

/**
 * Generate strategic insights
 */
function generateStrategicInsights(portfolio, portfolioAnalysis) {
  const insights = [];
  
  // Net worth insight
  insights.push({
    type: 'portfolio_overview',
    title: 'Portfolio Health',
    description: `Net worth of $${portfolio.netWorth.toLocaleString()} across ${portfolio.accountCount} accounts`,
    confidence: 1.0,
    actionable: false
  });
  
  // Diversification insight
  insights.push({
    type: 'diversification',
    title: 'Portfolio Diversification',
    description: `Diversification score: ${portfolioAnalysis.diversificationScore}%`,
    confidence: 0.9,
    actionable: portfolioAnalysis.diversificationScore < 70
  });
  
  // Risk insight
  if (portfolioAnalysis.riskAssessment) {
    insights.push({
      type: 'risk_assessment',
      title: 'Risk Profile',
      description: `Portfolio risk level: ${portfolioAnalysis.riskAssessment.riskCategory}`,
      confidence: 0.8,
      actionable: portfolioAnalysis.riskAssessment.riskConcentration > 0.7
    });
  }
  
  return insights;
}

/**
 * Generate rebalancing recommendations
 */
function generateRebalancingRecommendations(portfolio, portfolioAnalysis) {
  const recommendations = [];
  
  if (portfolioAnalysis.allocationHealth < 0.7) {
    recommendations.push({
      id: `rebalance-${Date.now()}`,
      type: 'portfolio_rebalancing',
      title: 'Portfolio Rebalancing Needed',
      description: 'Current allocation deviates from optimal distribution',
      recommendation: 'Rebalance portfolio to match risk tolerance and financial goals',
      impact: 'medium',
      category: 'asset_allocation',
      actionSteps: [
        'Review current asset allocation',
        'Determine target allocation based on risk tolerance',
        'Identify accounts to rebalance',
        'Execute rebalancing trades'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Generate emergency fund recommendation
 */
function generateEmergencyFundRecommendation(portfolio) {
  const liquidAccounts = portfolio.accountsByCategory['ASSETS.LIQUID'] || [];
  const liquidBalance = liquidAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  if (liquidBalance < 5000) {
    return {
      id: `emergency-fund-${Date.now()}`,
      type: 'emergency_fund',
      title: 'Build Emergency Fund',
      description: `Current liquid assets: $${liquidBalance.toLocaleString()}`,
      recommendation: 'Build emergency fund to cover 3-6 months of expenses',
      impact: 'high',
      category: 'financial_safety',
      actionSteps: [
        'Calculate monthly expenses',
        'Set emergency fund target (3-6 months expenses)',
        'Open high-yield savings account',
        'Set up automatic transfers'
      ]
    };
  }
  
  return null;
}

/**
 * Generate debt optimization recommendations
 */
function generateDebtOptimizationRecommendations(portfolio) {
  const recommendations = [];
  const debtAccounts = portfolio.accounts.filter(acc => acc.currentBalance < 0);
  
  if (debtAccounts.length > 0) {
    const totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
    const highInterestDebt = debtAccounts.filter(acc => (acc.interestRate || 0) > 0.1);
    
    if (highInterestDebt.length > 0) {
      recommendations.push({
        id: `debt-optimization-${Date.now()}`,
        type: 'debt_optimization',
        title: 'High Interest Debt Optimization',
        description: `$${totalDebt.toLocaleString()} in debt, including high-interest accounts`,
        recommendation: 'Prioritize paying off high-interest debt first',
        impact: 'high',
        category: 'debt_management',
        actionSteps: [
          'List all debts by interest rate',
          'Focus extra payments on highest rate debt',
          'Consider debt consolidation options',
          'Avoid taking on new high-interest debt'
        ]
      });
    }
  }
  
  return recommendations;
}

// Additional helper functions for comprehensive analysis
function calculateRiskConcentration(accounts) {
  // Simplified risk concentration calculation
  const riskLevels = accounts.map(acc => acc.typeInfo?.riskLevel || 1);
  const maxRisk = Math.max(...riskLevels);
  const avgRisk = riskLevels.reduce((sum, risk) => sum + risk, 0) / riskLevels.length;
  return maxRisk > 0 ? avgRisk / maxRisk : 0;
}

function estimatePortfolioVolatility(accounts) {
  // Simplified volatility estimate based on account types
  const totalBalance = accounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  if (totalBalance === 0) return 0;
  
  let weightedVolatility = 0;
  accounts.forEach(acc => {
    const weight = Math.abs(acc.currentBalance) / totalBalance;
    const volatility = getAccountTypeVolatility(acc.type);
    weightedVolatility += weight * volatility;
  });
  
  return weightedVolatility;
}

function getAccountTypeVolatility(accountType) {
  const volatilityMap = {
    'checking': 0,
    'savings': 0,
    'cd': 0,
    'money_market': 0.01,
    'investment': 0.15,
    'brokerage': 0.18,
    'stocks': 0.20,
    'crypto': 0.50,
    '401k': 0.12,
    'ira_traditional': 0.12,
    'ira_roth': 0.12,
    'real_estate': 0.08
  };
  
  return volatilityMap[accountType] || 0.10;
}

function calculateAssetUtilization(accounts) {
  // How effectively are assets being used
  const assetAccounts = accounts.filter(acc => acc.currentBalance > 0);
  const idleAssets = assetAccounts.filter(acc => 
    (acc.type === 'checking' || acc.type === 'savings') && acc.currentBalance > 10000
  );
  
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const idleBalance = idleAssets.reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  return totalAssets > 0 ? 1 - (idleBalance / totalAssets) : 1;
}

function estimateGrowthPotential(accounts) {
  // Estimate portfolio growth potential based on account mix
  const totalBalance = accounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);
  if (totalBalance === 0) return 0;
  
  let weightedGrowthRate = 0;
  accounts.forEach(acc => {
    if (acc.currentBalance > 0) {
      const weight = acc.currentBalance / totalBalance;
      const growthRate = getAccountTypeGrowthRate(acc.type);
      weightedGrowthRate += weight * growthRate;
    }
  });
  
  return weightedGrowthRate;
}

function getAccountTypeGrowthRate(accountType) {
  const growthRateMap = {
    'checking': 0.001,
    'savings': 0.02,
    'cd': 0.03,
    'money_market': 0.025,
    'investment': 0.07,
    'brokerage': 0.08,
    'stocks': 0.10,
    'crypto': 0.15,
    '401k': 0.07,
    'ira_traditional': 0.07,
    'ira_roth': 0.07,
    'real_estate': 0.04
  };
  
  return growthRateMap[accountType] || 0.05;
}

function calculateEfficiencyScore(accounts) {
  // How efficiently is the portfolio structured
  let score = 100;
  
  // Penalty for too many small accounts
  const smallAccounts = accounts.filter(acc => Math.abs(acc.currentBalance) < 500);
  score -= smallAccounts.length * 5;
  
  // Penalty for unused credit capacity
  const creditAccounts = accounts.filter(acc => acc.creditLimit && acc.creditLimit > 0);
  creditAccounts.forEach(acc => {
    const utilization = Math.abs(acc.currentBalance) / acc.creditLimit;
    if (utilization > 0.9) score -= 10; // Over-utilized
    if (utilization === 0 && acc.creditLimit > 5000) score -= 2; // Unused large credit
  });
  
  return Math.max(0, score);
}

function calculateBalanceHealthScore(accounts) {
  // Overall health of account balances
  let score = 100;
  
  // Check for negative balances in asset accounts
  const negativeAssets = accounts.filter(acc => 
    acc.currentBalance < 0 && 
    (acc.type === 'checking' || acc.type === 'savings')
  );
  score -= negativeAssets.length * 20;
  
  // Check for very low balances
  const lowBalanceAccounts = accounts.filter(acc => 
    acc.currentBalance > 0 && acc.currentBalance < 100
  );
  score -= lowBalanceAccounts.length * 5;
  
  return Math.max(0, score);
}

function calculateRecommendationPriority(recommendation, portfolio) {
  let score = 0;
  
  // Impact weight
  const impactWeights = { high: 4, medium: 2, low: 1 };
  score += impactWeights[recommendation.impact] || 1;
  
  // Potential savings
  const savings = recommendation.potentialSavings || 0;
  if (savings > 1000) score += 3;
  else if (savings > 500) score += 2;
  else if (savings > 100) score += 1;
  
  // Implementation difficulty (inverse scoring)
  if (recommendation.actionSteps && recommendation.actionSteps.length <= 2) score += 2;
  else if (recommendation.actionSteps && recommendation.actionSteps.length <= 4) score += 1;
  
  return score;
}

function determineImplementationTimeframe(recommendation) {
  const quickCategories = ['savings_rate', 'minimum_balance', 'fee_reduction'];
  const mediumCategories = ['debt_refinancing', 'account_consolidation'];
  
  if (quickCategories.includes(recommendation.category)) return 'immediate';
  if (mediumCategories.includes(recommendation.category)) return 'short_term';
  return 'medium_term';
}

function assessImplementationDifficulty(recommendation) {
  const easyCategories = ['savings_rate', 'minimum_balance'];
  const hardCategories = ['portfolio_rebalancing', 'debt_optimization'];
  
  if (easyCategories.includes(recommendation.category)) return 'easy';
  if (hardCategories.includes(recommendation.category)) return 'difficult';
  return 'moderate';
}

function generateActionSteps(opportunity) {
  const stepMap = {
    'savings_rate': [
      'Research high-yield savings account options',
      'Compare interest rates and fees',
      'Open new account or negotiate with current bank'
    ],
    'debt_refinancing': [
      'Check credit score',
      'Research refinancing options',
      'Apply for better rates',
      'Consolidate if beneficial'
    ],
    'reduce_complexity': [
      'List all accounts of same type',
      'Compare benefits and fees',
      'Close unnecessary accounts',
      'Consolidate balances'
    ],
    'emergency_fund': [
      'Calculate 3-6 months of expenses',
      'Open high-yield savings account',
      'Set up automatic transfers',
      'Monitor progress monthly'
    ]
  };
  
  return stepMap[opportunity.category] || ['Review opportunity details', 'Research options', 'Take action'];
}

function estimateImplementationTime(opportunity) {
  const timeMap = {
    'savings_rate': '1-2 weeks',
    'debt_refinancing': '2-4 weeks',
    'reduce_complexity': '1-3 weeks',
    'emergency_fund': '6-12 months',
    'asset_allocation': '1-2 weeks',
    'tax_optimization': '2-4 weeks'
  };
  
  return timeMap[opportunity.category] || '2-4 weeks';
}

/**
 * Create Multi-Account Intelligence Workflow
 */
function createMultiAccountIntelligenceWorkflow() {
  console.log('🏗️ Creating Multi-Account Intelligence workflow...');
  
  try {
    const workflow = new StateGraph(MultiAccountIntelligenceState);
    
    // Add workflow nodes
    workflow.addNode('aggregateAccountData', aggregateAccountData);
    workflow.addNode('analyzePortfolioAllocation', analyzePortfolioAllocation);
    workflow.addNode('identifyOptimizationOpportunities', identifyOptimizationOpportunities);
    workflow.addNode('generateCrossAccountRecommendations', generateCrossAccountRecommendations);
    
    // Define workflow edges
    workflow.addEdge(START, 'aggregateAccountData');
    workflow.addEdge('aggregateAccountData', 'analyzePortfolioAllocation');
    workflow.addEdge('analyzePortfolioAllocation', 'identifyOptimizationOpportunities');
    workflow.addEdge('identifyOptimizationOpportunities', 'generateCrossAccountRecommendations');
    workflow.addEdge('generateCrossAccountRecommendations', END);
    
    // Compile workflow
    const compiledWorkflow = workflow.compile();
    
    console.log('✅ Multi-Account Intelligence workflow created successfully');
    return compiledWorkflow;
    
  } catch (error) {
    console.error('❌ Failed to create Multi-Account Intelligence workflow:', error);
    throw error;
  }
}

module.exports = {
  createMultiAccountIntelligenceWorkflow,
  MultiAccountIntelligenceState
}; 