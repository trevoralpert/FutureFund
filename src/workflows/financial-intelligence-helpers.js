/**
 * Financial Intelligence Helper Functions - Phase 3.5.2
 * Advanced algorithms for spending analysis, anomaly detection, and health scoring
 */

const { OpenAI } = require("openai");
const config = require('../config');

// === Seasonal Trend Analysis ===
function analyzeSeasonalTrends(transactions) {
  const seasonalData = {
    Spring: { total: 0, count: 0, months: [2, 3, 4] },
    Summer: { total: 0, count: 0, months: [5, 6, 7] },
    Fall: { total: 0, count: 0, months: [8, 9, 10] },
    Winter: { total: 0, count: 0, months: [11, 0, 1] }
  };
  
  transactions.forEach(t => {
    const month = t.monthOfYear;
    
    Object.keys(seasonalData).forEach(season => {
      if (seasonalData[season].months.includes(month)) {
        seasonalData[season].total += Math.abs(t.amount);
        seasonalData[season].count += 1;
      }
    });
  });
  
  Object.keys(seasonalData).forEach(season => {
    seasonalData[season].avg = seasonalData[season].count > 0 ? 
      seasonalData[season].total / seasonalData[season].count : 0;
  });
  
  return seasonalData;
}

// === Category Analysis ===
function getTopSpendingCategories(transactions, limit = 10) {
  const categoryTotals = {};
  
  transactions.forEach(t => {
    if (t.amount < 0) { // Only expenses
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });
  
  return Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([category, total]) => ({ category, total }));
}

function analyzeCategoryTrends(transactions) {
  const categoryTrends = {};
  const timeSpan = getDaySpan(transactions);
  const midPoint = timeSpan / 2;
  
  transactions.forEach(t => {
    const daysFromStart = Math.floor((t.date - new Date(transactions[0].date)) / (24 * 60 * 60 * 1000));
    const period = daysFromStart < midPoint ? 'early' : 'late';
    
    if (!categoryTrends[t.category]) {
      categoryTrends[t.category] = { early: 0, late: 0 };
    }
    
    categoryTrends[t.category][period] += Math.abs(t.amount);
  });
  
  Object.keys(categoryTrends).forEach(category => {
    const trend = categoryTrends[category];
    trend.change = trend.late - trend.early;
    trend.changePercent = trend.early > 0 ? (trend.change / trend.early) * 100 : 0;
    trend.direction = trend.change > 0 ? 'increasing' : 'decreasing';
  });
  
  return categoryTrends;
}

function analyzeCategorySeasonality(transactions) {
  const categorySeasonality = {};
  
  transactions.forEach(t => {
    const season = getSeason(t.monthOfYear);
    
    if (!categorySeasonality[t.category]) {
      categorySeasonality[t.category] = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };
    }
    
    categorySeasonality[t.category][season] += Math.abs(t.amount);
  });
  
  return categorySeasonality;
}

// === Behavioral Pattern Analysis ===
function analyzeSpendingFrequency(transactions) {
  const frequency = {
    daily: transactions.length / getDaySpan(transactions),
    weekly: transactions.length / Math.max(1, getDaySpan(transactions) / 7),
    monthly: transactions.length / Math.max(1, getDaySpan(transactions) / 30)
  };
  
  const amounts = transactions.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const medianAmount = amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)];
  
  return {
    frequency,
    avgAmount,
    medianAmount,
    totalTransactions: transactions.length,
    timeSpan: getDaySpan(transactions)
  };
}

function analyzeAmountPatterns(transactions) {
  const amounts = transactions.map(t => Math.abs(t.amount));
  const sortedAmounts = amounts.sort((a, b) => a - b);
  
  return {
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    avg: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
    median: sortedAmounts[Math.floor(amounts.length / 2)],
    stdDev: calculateStandardDeviation(amounts),
    percentiles: {
      p25: sortedAmounts[Math.floor(amounts.length * 0.25)],
      p75: sortedAmounts[Math.floor(amounts.length * 0.75)],
      p90: sortedAmounts[Math.floor(amounts.length * 0.90)],
      p95: sortedAmounts[Math.floor(amounts.length * 0.95)]
    }
  };
}

function analyzeMerchantPatterns(transactions) {
  const merchantFrequency = {};
  const merchantTotals = {};
  
  transactions.forEach(t => {
    // Extract merchant from description (simplified)
    const merchant = extractMerchantName(t.description);
    
    merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
    merchantTotals[merchant] = (merchantTotals[merchant] || 0) + Math.abs(t.amount);
  });
  
  const topMerchantsByFrequency = Object.entries(merchantFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
    
  const topMerchantsByAmount = Object.entries(merchantTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  return {
    topByFrequency: topMerchantsByFrequency,
    topByAmount: topMerchantsByAmount,
    uniqueMerchants: Object.keys(merchantFrequency).length
  };
}

// === AI-Powered Analysis ===
async function generateAISpendingInsights(transactions, patterns, metrics) {
  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    timeout: config.openai.timeout
  });

  const prompt = `Analyze financial spending patterns and provide insights:

FINANCIAL SUMMARY:
- Total Income: $${metrics.totalIncome.toFixed(2)}
- Total Expenses: $${metrics.totalExpenses.toFixed(2)}
- Net Income: $${metrics.netIncome.toFixed(2)}
- Avg Transaction: $${metrics.avgTransactionAmount.toFixed(2)}
- Transaction Count: ${metrics.transactionCount}

SPENDING PATTERNS:
- Top Category: ${patterns.categorical.topCategories[0]?.category || 'Unknown'}
- Top Amount: $${patterns.categorical.topCategories[0]?.total?.toFixed(2) || '0'}
- Daily Avg: $${metrics.avgDailySpending.toFixed(2)}

BEHAVIORAL INSIGHTS:
- Highest spending day: ${Object.entries(patterns.temporal.dailyPatterns).sort(([,a], [,b]) => b.total - a.total)[0]?.[0] || 'Unknown'}
- Spending frequency: ${patterns.behavioral.spendingFrequency.frequency.daily.toFixed(1)} transactions/day

Provide JSON response with:
1. Key insights (3-5 bullet points)
2. Spending behavior analysis
3. Potential concerns or positive trends
4. Confidence score (0-1)

Keep response concise and actionable.`;

  try {
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;
    
    return {
      rawAnalysis: analysis,
      keyInsights: extractInsightsFromAI(analysis),
      behaviorAnalysis: extractBehaviorAnalysis(analysis),
      concerns: extractConcerns(analysis),
      confidence: extractConfidenceScore(analysis) || 0.85
    };
  } catch (error) {
    console.warn('AI spending insights failed:', error.message);
    throw error;
  }
}

function generateFallbackSpendingInsights(transactions, patterns, metrics) {
  const topCategory = patterns.categorical.topCategories[0];
  const topSpendingDay = Object.entries(patterns.temporal.dailyPatterns)
    .sort(([,a], [,b]) => b.total - a.total)[0];
  
  return {
    keyInsights: [
      `Your largest expense category is ${topCategory?.category || 'Unknown'} at $${topCategory?.total?.toFixed(2) || '0'}`,
      `You spend most on ${topSpendingDay?.[0] || 'weekdays'} with an average of $${topSpendingDay?.[1]?.avg?.toFixed(2) || '0'}`,
      `Your daily spending average is $${metrics.avgDailySpending.toFixed(2)}`,
      metrics.netIncome > 0 ? 'You have positive cash flow' : 'You have negative cash flow',
      `You make ${metrics.transactionCount} transactions over ${getDaySpan(transactions)} days`
    ],
    behaviorAnalysis: 'Basic pattern analysis completed',
    concerns: metrics.netIncome < 0 ? ['Negative cash flow'] : [],
    confidence: 0.7
  };
}

// === Enhanced Anomaly Detection Algorithms ===

/**
 * Detect recurring transaction patterns
 * Returns transactions that appear to be recurring (rent, utilities, subscriptions, etc.)
 */
function detectRecurringTransactions(transactions) {
  console.log('🔍 Detecting recurring transaction patterns...');
  
  const recurringCandidates = {};
  const recurringThreshold = 0.1; // 10% amount variation allowed
  const minOccurrences = 2; // Need at least 2 occurrences
  
  // Group transactions by similar amount and description
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    const description = transaction.description.toLowerCase();
    
    // Create a key based on amount ranges and description patterns
    const amountBucket = Math.floor(amount / 50) * 50; // Group into $50 buckets
    const descriptionKey = description.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
    const key = `${amountBucket}-${descriptionKey}`;
    
    if (!recurringCandidates[key]) {
      recurringCandidates[key] = [];
    }
    
    recurringCandidates[key].push(transaction);
  });
  
  const recurringTransactions = [];
  
  // Analyze each group for recurring patterns
  Object.values(recurringCandidates).forEach(group => {
    if (group.length >= minOccurrences) {
      const amounts = group.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      
      // Check if amounts are consistent (within threshold)
      const amountVariation = Math.max(...amounts) - Math.min(...amounts);
      const variationPercentage = amountVariation / avgAmount;
      
      if (variationPercentage <= recurringThreshold) {
        // Check for time consistency (monthly, bi-weekly, etc.)
        const dates = group.map(t => new Date(t.date)).sort((a, b) => a - b);
        const intervals = [];
        
        for (let i = 1; i < dates.length; i++) {
          const daysBetween = Math.floor((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
          intervals.push(daysBetween);
        }
        
        // Check if intervals are consistent (monthly ~30 days, bi-weekly ~14 days, etc.)
        const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
        const intervalVariation = Math.max(...intervals) - Math.min(...intervals);
        
        if (intervalVariation <= 7) { // Allow 7-day variation in recurring patterns
          recurringTransactions.push(...group);
        }
      }
    }
  });
  
  console.log(`✅ Detected ${recurringTransactions.length} recurring transactions`);
  return recurringTransactions;
}

/**
 * Enhanced amount anomaly detection that excludes recurring expenses
 */
function detectAmountAnomalies(transactions, patterns) {
  console.log('🔍 Detecting amount anomalies (excluding recurring expenses)...');
  
  // First, identify recurring transactions
  const recurringTransactions = detectRecurringTransactions(transactions);
  const recurringIds = new Set(recurringTransactions.map(t => t.id));
  
  // Filter out recurring transactions for anomaly detection
  const nonRecurringTransactions = transactions.filter(t => !recurringIds.has(t.id));
  
  if (nonRecurringTransactions.length === 0) {
    return [];
  }
  
  const amounts = nonRecurringTransactions.map(t => Math.abs(t.amount));
  const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const stdDev = calculateStandardDeviation(amounts);
  const threshold = mean + (2.5 * stdDev); // Slightly higher threshold
  
  const anomalies = nonRecurringTransactions
    .filter(t => Math.abs(t.amount) > threshold)
    .map(t => ({
      transaction: t,
      type: 'amount',
      severity: Math.abs(t.amount) > (mean + 3 * stdDev) ? 'high' : 'medium',
      description: `Unusually large transaction: $${Math.abs(t.amount).toFixed(2)} (${((Math.abs(t.amount) - mean) / mean * 100).toFixed(1)}% above average)`,
      riskScore: Math.min(1, (Math.abs(t.amount) - mean) / (3 * stdDev)),
      category: t.category || 'Other'
    }));
  
  console.log(`✅ Found ${anomalies.length} amount anomalies (excluded ${recurringTransactions.length} recurring transactions)`);
  return anomalies;
}

// === Enhanced Anomaly Detection with Recurring Expense Intelligence ===
function detectCategoryAnomalies(transactions, patterns) {
  console.log('🔍 Detecting category anomalies (with recurring expense intelligence)...');
  
  const recurringTransactions = detectRecurringTransactions(transactions);
  const recurringIds = new Set(recurringTransactions.map(t => t.id));
  
  // Separate recurring and non-recurring transactions
  const nonRecurringTransactions = transactions.filter(t => !recurringIds.has(t.id));
  
  const categoryExpected = {};
  const categoryActual = {};
  
  // Calculate expected spending based on non-recurring historical patterns
  const categoryTotals = {};
  nonRecurringTransactions.forEach(t => {
    const category = t.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
  });
  
  const totalDays = getDaySpan(transactions);
  Object.keys(categoryTotals).forEach(category => {
    categoryExpected[category] = categoryTotals[category] / totalDays;
  });
  
  // Calculate recent spending (last 14 days, excluding recurring)
  const recentDate = new Date(Math.max(...transactions.map(t => new Date(t.date))));
  const fourteenDaysAgo = new Date(recentDate.getTime() - (14 * 24 * 60 * 60 * 1000));
  
  nonRecurringTransactions
    .filter(t => new Date(t.date) >= fourteenDaysAgo)
    .forEach(t => {
      const category = t.category || 'Other';
      categoryActual[category] = (categoryActual[category] || 0) + Math.abs(t.amount);
    });
  
  const anomalies = [];
  
  Object.keys(categoryExpected).forEach(category => {
    const expected = categoryExpected[category] * 14; // 14 days worth
    const actual = categoryActual[category] || 0;
    
    if (expected > 0) {
      const deviation = Math.abs(actual - expected) / expected;
      
      if (deviation > 0.75) { // 75% deviation threshold (higher than before)
        anomalies.push({
          category,
          type: 'category',
          severity: deviation > 1.5 ? 'high' : 'medium',
          description: `Unusual spending in ${category}: $${actual.toFixed(2)} vs expected $${expected.toFixed(2)}`,
          riskScore: Math.min(1, deviation / 2),
          isIncrease: actual > expected
        });
      }
    }
  });
  
  console.log(`✅ Found ${anomalies.length} category anomalies`);
  return anomalies;
}

function detectTemporalAnomalies(transactions, patterns) {
  // Detect unusual timing patterns
  const hourCounts = {};
  
  transactions.forEach(t => {
    const hour = t.date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  // Find transactions at unusual hours (very early morning)
  const unusualHours = [0, 1, 2, 3, 4, 5]; // Midnight to 5 AM
  
  return transactions
    .filter(t => unusualHours.includes(t.date.getHours()))
    .map(t => ({
      transaction: t,
      type: 'temporal',
      severity: 'medium',
      description: `Transaction at unusual hour: ${t.date.getHours()}:00`,
      riskScore: 0.6
    }));
}

function detectMerchantAnomalies(transactions, patterns) {
  const merchantCounts = {};
  
  transactions.forEach(t => {
    const merchant = extractMerchantName(t.description);
    merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
  });
  
  // Detect merchants with only one transaction (potentially suspicious)
  return Object.entries(merchantCounts)
    .filter(([, count]) => count === 1)
    .map(([merchant]) => {
      const transaction = transactions.find(t => extractMerchantName(t.description) === merchant);
      return {
        transaction,
        merchant,
        type: 'merchant',
        severity: 'low',
        description: `New or rarely used merchant: ${merchant}`,
        riskScore: 0.3
      };
    });
}

// === Financial Health Scoring ===
function calculateCashFlowHealth(transactions, patterns) {
  const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  const cashFlowRatio = income > 0 ? (income - expenses) / income : 0;
  const score = Math.max(0, Math.min(5, 2.5 + (cashFlowRatio * 2.5)));
  
  return {
    score,
    cashFlowRatio,
    monthlyIncome: income / Math.max(1, getDaySpan(transactions) / 30),
    monthlyExpenses: expenses / Math.max(1, getDaySpan(transactions) / 30),
    assessment: score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : score >= 2 ? 'Fair' : 'Poor'
  };
}

function calculateSpendingStability(transactions, patterns) {
  const dailyAmounts = {};
  
  transactions.forEach(t => {
    const date = t.date.toDateString();
    dailyAmounts[date] = (dailyAmounts[date] || 0) + Math.abs(t.amount);
  });
  
  const amounts = Object.values(dailyAmounts);
  const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const stdDev = calculateStandardDeviation(amounts);
  const coefficientOfVariation = stdDev / mean;
  
  // Lower coefficient of variation = higher stability
  const score = Math.max(0, Math.min(5, 5 - (coefficientOfVariation * 2)));
  
  return {
    score,
    coefficientOfVariation,
    meanDailySpending: mean,
    stdDeviation: stdDev,
    assessment: score >= 4 ? 'Very Stable' : score >= 3 ? 'Stable' : score >= 2 ? 'Moderate' : 'Unstable'
  };
}

function calculateBudgetingDiscipline(transactions, patterns) {
  // Simple budgeting discipline based on category distribution
  const categoryAmounts = {};
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  transactions.filter(t => t.amount < 0).forEach(t => {
    categoryAmounts[t.category] = (categoryAmounts[t.category] || 0) + Math.abs(t.amount);
  });
  
  // Check if spending is well-distributed (not too concentrated in one category)
  const topCategoryPercentage = Math.max(...Object.values(categoryAmounts)) / totalExpenses;
  const score = Math.max(0, Math.min(5, 5 - (topCategoryPercentage * 5)));
  
  return {
    score,
    topCategoryPercentage,
    categoryDistribution: Object.keys(categoryAmounts).length,
    assessment: score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : score >= 2 ? 'Fair' : 'Poor'
  };
}

function calculateRiskManagement(transactions, anomalies) {
  const anomalyCount = anomalies?.totalAnomalies || 0;
  const transactionCount = transactions.length;
  const anomalyRate = anomalyCount / transactionCount;
  
  // Lower anomaly rate = better risk management
  const score = Math.max(0, Math.min(5, 5 - (anomalyRate * 10)));
  
  return {
    score,
    anomalyRate,
    anomalyCount,
    transactionCount,
    assessment: score >= 4 ? 'Low Risk' : score >= 3 ? 'Moderate Risk' : score >= 2 ? 'High Risk' : 'Very High Risk'
  };
}

// === Enhanced Frequency Anomaly Detection ===
function detectFrequencyAnomalies(transactions, patterns) {
  console.log('🔍 Detecting frequency anomalies (excluding recurring patterns)...');
  
  const recurringTransactions = detectRecurringTransactions(transactions);
  const recurringIds = new Set(recurringTransactions.map(t => t.id));
  const nonRecurringTransactions = transactions.filter(t => !recurringIds.has(t.id));
  
  const dailyCounts = {};
  
  nonRecurringTransactions.forEach(t => {
    const date = new Date(t.date).toDateString();
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });
  
  const counts = Object.values(dailyCounts);
  if (counts.length === 0) return [];
  
  const avgDailyCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const stdDev = calculateStandardDeviation(counts);
  const threshold = avgDailyCount + (2 * stdDev);
  
  const anomalies = Object.entries(dailyCounts)
    .filter(([, count]) => count > threshold && count >= 5) // At least 5 transactions
    .map(([date, count]) => ({
      date,
      type: 'frequency',
      severity: count > (avgDailyCount + 3 * stdDev) ? 'high' : 'medium',
      description: `Unusually high transaction frequency: ${count} transactions on ${date}`,
      riskScore: Math.min(1, (count - avgDailyCount) / (3 * stdDev))
    }));
  
  console.log(`✅ Found ${anomalies.length} frequency anomalies`);
  return anomalies;
}

// === Utility Functions ===
function getSeason(month) {
  if ([11, 0, 1].includes(month)) return 'Winter';
  if ([2, 3, 4].includes(month)) return 'Spring';
  if ([5, 6, 7].includes(month)) return 'Summer';
  return 'Fall';
}

function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function extractMerchantName(description) {
  // Simple merchant extraction (can be enhanced)
  return description.split(' ')[0] || 'Unknown';
}

function getDaySpan(transactions) {
  if (transactions.length < 2) return 1;
  const start = new Date(transactions[0].date);
  const end = new Date(transactions[transactions.length - 1].date);
  return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
}

// === AI Response Parsing ===
function extractInsightsFromAI(analysisText) {
  const lines = analysisText.split('\n').filter(line => line.trim() && line.includes('•') || line.includes('-'));
  return lines.slice(0, 5).map(line => line.replace(/^[•\-\d\.]+\s*/, '').trim());
}

function extractBehaviorAnalysis(analysisText) {
  const match = analysisText.match(/behavior[^:]*:\s*([^\.]+)/i);
  return match ? match[1].trim() : 'Analysis completed';
}

function extractConcerns(analysisText) {
  const concernsMatch = analysisText.match(/concern[^:]*:\s*([^\.]+)/i);
  if (concernsMatch) {
    return [concernsMatch[1].trim()];
  }
  return [];
}

function extractConfidenceScore(analysisText) {
  const match = analysisText.match(/confidence[^:]*:\s*([0-9\.]+)/i);
  return match ? parseFloat(match[1]) : null;
}

module.exports = {
  // Seasonal and Category Analysis
  analyzeSeasonalTrends,
  getTopSpendingCategories,
  analyzeCategoryTrends,
  analyzeCategorySeasonality,
  
  // Behavioral Analysis
  analyzeSpendingFrequency,
  analyzeAmountPatterns,
  analyzeMerchantPatterns,
  
  // AI Analysis
  generateAISpendingInsights,
  generateFallbackSpendingInsights,
  
  // Enhanced Anomaly Detection
  detectRecurringTransactions,
  detectAmountAnomalies,
  detectFrequencyAnomalies,
  detectCategoryAnomalies,
  detectTemporalAnomalies,
  detectMerchantAnomalies,
  
  // Health Scoring
  calculateCashFlowHealth,
  calculateSpendingStability,
  calculateBudgetingDiscipline,
  calculateRiskManagement,
  
  // Utilities
  calculateStandardDeviation,
  extractMerchantName,
  getDaySpan,
  getSeason
}; 