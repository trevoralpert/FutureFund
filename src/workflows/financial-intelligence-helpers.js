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

// === Anomaly Detection Algorithms ===
function detectAmountAnomalies(transactions, patterns) {
  const amounts = transactions.map(t => Math.abs(t.amount));
  const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const stdDev = calculateStandardDeviation(amounts);
  const threshold = mean + (2 * stdDev); // 2 standard deviations
  
  return transactions
    .filter(t => Math.abs(t.amount) > threshold)
    .map(t => ({
      transaction: t,
      type: 'amount',
      severity: Math.abs(t.amount) > (mean + 3 * stdDev) ? 'high' : 'medium',
      description: `Unusually large transaction: $${Math.abs(t.amount).toFixed(2)} (${((Math.abs(t.amount) - mean) / mean * 100).toFixed(1)}% above average)`,
      riskScore: Math.min(1, (Math.abs(t.amount) - mean) / (3 * stdDev))
    }));
}

function detectFrequencyAnomalies(transactions, patterns) {
  const dailyCounts = {};
  
  transactions.forEach(t => {
    const date = t.date.toDateString();
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });
  
  const counts = Object.values(dailyCounts);
  const avgDailyCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const stdDev = calculateStandardDeviation(counts);
  const threshold = avgDailyCount + (2 * stdDev);
  
  return Object.entries(dailyCounts)
    .filter(([, count]) => count > threshold)
    .map(([date, count]) => ({
      date,
      type: 'frequency',
      severity: count > (avgDailyCount + 3 * stdDev) ? 'high' : 'medium',
      description: `Unusually high transaction frequency: ${count} transactions on ${date}`,
      riskScore: Math.min(1, (count - avgDailyCount) / (3 * stdDev))
    }));
}

function detectCategoryAnomalies(transactions, patterns) {
  const categoryExpected = {};
  const categoryActual = {};
  
  // Calculate expected spending based on historical patterns
  patterns.categorical.topCategories.forEach(cat => {
    categoryExpected[cat.category] = cat.total / getDaySpan(transactions);
  });
  
  // Calculate recent spending (last 7 days)
  const recentDate = new Date(Math.max(...transactions.map(t => t.date)));
  const sevenDaysAgo = new Date(recentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  transactions
    .filter(t => t.date >= sevenDaysAgo)
    .forEach(t => {
      categoryActual[t.category] = (categoryActual[t.category] || 0) + Math.abs(t.amount);
    });
  
  const anomalies = [];
  
  Object.keys(categoryExpected).forEach(category => {
    const expected = categoryExpected[category] * 7; // 7 days worth
    const actual = categoryActual[category] || 0;
    const deviation = Math.abs(actual - expected) / expected;
    
    if (deviation > 0.5) { // 50% deviation threshold
      anomalies.push({
        category,
        type: 'category',
        severity: deviation > 1.0 ? 'high' : 'medium',
        description: `Unusual spending in ${category}: $${actual.toFixed(2)} vs expected $${expected.toFixed(2)}`,
        riskScore: Math.min(1, deviation)
      });
    }
  });
  
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
  
  // Anomaly Detection
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