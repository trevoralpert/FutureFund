/**
 * Financial Health Monitoring Pipeline - Phase 3.7.3
 * Real-time financial health scoring, continuous monitoring, and proactive management
 * Integrates with Phase 3.7.2 Predictive Analytics Pipeline
 */

const { StateGraph, END } = require("@langchain/langgraph");

class FinancialHealthMonitoring {
    constructor(openaiApiKey, workflowOrchestrator) {
        this.openaiApiKey = openaiApiKey;
        this.orchestrator = workflowOrchestrator;
        this.healthMetrics = new Map(); // Store health history
        this.alertThresholds = this.initializeAlertThresholds();
        this.monitoringActive = false;
        this.monitoringInterval = null;
        this.healthTrends = [];
        
        // Initialize the health monitoring pipeline
        this.pipeline = this.createHealthMonitoringPipeline();
    }

    /**
     * Initialize alert thresholds for different health metrics
     */
    initializeAlertThresholds() {
        return {
            overall_health: { critical: 20, warning: 40, good: 70 },
            cash_flow: { critical: -1000, warning: -500, good: 500 },
            debt_ratio: { critical: 0.8, warning: 0.6, good: 0.3 },
            emergency_fund: { critical: 0.5, warning: 1.0, good: 3.0 }, // months
            spending_variance: { critical: 0.5, warning: 0.3, good: 0.1 },
            savings_rate: { critical: 0.05, warning: 0.10, good: 0.20 },
            liquidity_ratio: { critical: 0.1, warning: 0.3, good: 0.5 },
            investment_performance: { critical: -0.1, warning: 0.0, good: 0.07 }
        };
    }

    /**
     * Create the 8-node Financial Health Monitoring LangGraph pipeline
     */
    createHealthMonitoringPipeline() {
        const workflow = new StateGraph({
            channels: {
                input_data: { reducer: (x, y) => y || x },
                health_metrics: { reducer: (x, y) => ({ ...x, ...y }) },
                trend_analysis: { reducer: (x, y) => y || x },
                risk_assessment: { reducer: (x, y) => ({ ...x, ...y }) },
                alerts: { reducer: (x, y) => [...(x || []), ...(y || [])] },
                recommendations: { reducer: (x, y) => [...(x || []), ...(y || [])] },
                monitoring_status: { reducer: (x, y) => ({ ...x, ...y }) },
                final_output: { reducer: (x, y) => y || x }
            }
        });

        // Node 1: Gather Real-time Financial Data
        workflow.addNode("gatherRealTimeData", async (state) => {
            const { input_data } = state;
            console.log("🔄 Health Monitoring - Node 1: Gathering real-time data...");
            
            try {
                // Get latest financial data with enhanced real-time processing
                const realTimeData = await this.gatherRealTimeFinancialData(input_data);
                
                return {
                    input_data: realTimeData,
                    monitoring_status: {
                        data_freshness: new Date().toISOString(),
                        data_quality_score: realTimeData.quality_score || 85,
                        data_completeness: realTimeData.completeness || 90
                    }
                };
            } catch (error) {
                console.error("❌ Error gathering real-time data:", error.message);
                return {
                    input_data: input_data,
                    monitoring_status: { error: error.message, node: "gatherRealTimeData" }
                };
            }
        });

        // Node 2: Calculate Comprehensive Health Scores
        workflow.addNode("calculateHealthScores", async (state) => {
            const { input_data } = state;
            console.log("🔄 Health Monitoring - Node 2: Calculating health scores...");
            
            try {
                const healthScores = await this.calculateComprehensiveHealthScores(input_data);
                
                return {
                    health_metrics: healthScores,
                    monitoring_status: {
                        ...state.monitoring_status,
                        health_calculation_time: new Date().toISOString(),
                        overall_health_score: healthScores.overall_health_score
                    }
                };
            } catch (error) {
                console.error("❌ Error calculating health scores:", error.message);
                return {
                    health_metrics: { error: error.message },
                    monitoring_status: { ...state.monitoring_status, error: error.message, node: "calculateHealthScores" }
                };
            }
        });

        // Node 3: Perform Health Trend Analysis
        workflow.addNode("analyzeHealthTrends", async (state) => {
            const { health_metrics } = state;
            console.log("🔄 Health Monitoring - Node 3: Analyzing health trends...");
            
            try {
                const trendAnalysis = await this.analyzeHealthTrends(health_metrics);
                
                return {
                    trend_analysis: trendAnalysis,
                    monitoring_status: {
                        ...state.monitoring_status,
                        trend_analysis_time: new Date().toISOString(),
                        trend_direction: trendAnalysis.overall_trend
                    }
                };
            } catch (error) {
                console.error("❌ Error analyzing trends:", error.message);
                return {
                    trend_analysis: { error: error.message },
                    monitoring_status: { ...state.monitoring_status, error: error.message, node: "analyzeHealthTrends" }
                };
            }
        });

        // Node 4: Assess Financial Risks and Early Warnings
        workflow.addNode("assessRisksAndWarnings", async (state) => {
            const { health_metrics, trend_analysis } = state;
            console.log("🔄 Health Monitoring - Node 4: Assessing risks and early warnings...");
            
            try {
                const riskAssessment = await this.assessFinancialRisks(health_metrics, trend_analysis);
                
                return {
                    risk_assessment: riskAssessment,
                    monitoring_status: {
                        ...state.monitoring_status,
                        risk_assessment_time: new Date().toISOString(),
                        risk_level: riskAssessment.overall_risk_level
                    }
                };
            } catch (error) {
                console.error("❌ Error assessing risks:", error.message);
                return {
                    risk_assessment: { error: error.message },
                    monitoring_status: { ...state.monitoring_status, error: error.message, node: "assessRisksAndWarnings" }
                };
            }
        });

        // Node 5: Generate Automated Alerts
        workflow.addNode("generateAutomatedAlerts", async (state) => {
            const { health_metrics, risk_assessment, trend_analysis } = state;
            console.log("🔄 Health Monitoring - Node 5: Generating automated alerts...");
            
            try {
                const alerts = await this.generateAutomatedAlerts(health_metrics, risk_assessment, trend_analysis);
                
                return {
                    alerts: alerts,
                    monitoring_status: {
                        ...state.monitoring_status,
                        alert_generation_time: new Date().toISOString(),
                        alert_count: alerts.length,
                        critical_alerts: alerts.filter(a => a.severity === 'critical').length
                    }
                };
            } catch (error) {
                console.error("❌ Error generating alerts:", error.message);
                return {
                    alerts: [{ type: 'system_error', message: error.message, severity: 'warning' }],
                    monitoring_status: { ...state.monitoring_status, error: error.message, node: "generateAutomatedAlerts" }
                };
            }
        });

        // Node 6: Create Proactive Health Recommendations
        workflow.addNode("createProactiveRecommendations", async (state) => {
            const { health_metrics, risk_assessment, trend_analysis, alerts } = state;
            console.log("🔄 Health Monitoring - Node 6: Creating proactive recommendations...");
            
            try {
                const recommendations = await this.createProactiveRecommendations(
                    health_metrics, risk_assessment, trend_analysis, alerts
                );
                
                return {
                    recommendations: recommendations,
                    monitoring_status: {
                        ...state.monitoring_status,
                        recommendations_time: new Date().toISOString(),
                        recommendation_count: recommendations.length
                    }
                };
            } catch (error) {
                console.error("❌ Error creating recommendations:", error.message);
                return {
                    recommendations: [{ type: 'system_message', message: 'Unable to generate recommendations', priority: 'low' }],
                    monitoring_status: { ...state.monitoring_status, error: error.message, node: "createProactiveRecommendations" }
                };
            }
        });

        // Node 7: Integrate with Predictive Analytics
        workflow.addNode("integratePredictiveAnalytics", async (state) => {
            const { health_metrics, input_data } = state;
            console.log("🔄 Health Monitoring - Node 7: Integrating with predictive analytics...");
            
            try {
                // Leverage Phase 3.7.2 Predictive Analytics Pipeline
                const predictiveInsights = await this.integratePredictiveAnalytics(health_metrics, input_data);
                
                return {
                    monitoring_status: {
                        ...state.monitoring_status,
                        predictive_integration_time: new Date().toISOString(),
                        predictive_confidence: predictiveInsights.confidence || 0,
                        future_health_forecast: predictiveInsights.health_forecast
                    }
                };
            } catch (error) {
                console.error("❌ Error integrating predictive analytics:", error.message);
                return {
                    monitoring_status: { 
                        ...state.monitoring_status, 
                        error: error.message, 
                        node: "integratePredictiveAnalytics" 
                    }
                };
            }
        });

        // Node 8: Generate Comprehensive Health Dashboard Data
        workflow.addNode("generateHealthDashboard", async (state) => {
            const { health_metrics, trend_analysis, risk_assessment, alerts, recommendations, monitoring_status } = state;
            console.log("🔄 Health Monitoring - Node 8: Generating health dashboard...");
            
            try {
                const dashboardData = await this.generateHealthDashboard(
                    health_metrics, trend_analysis, risk_assessment, alerts, recommendations, monitoring_status
                );
                
                return {
                    final_output: {
                        ...dashboardData,
                        execution_time: Date.now() - (state.execution_start || Date.now()),
                        success: true,
                        timestamp: new Date().toISOString()
                    }
                };
            } catch (error) {
                console.error("❌ Error generating dashboard:", error.message);
                return {
                    final_output: {
                        error: error.message,
                        execution_time: Date.now() - (state.execution_start || Date.now()),
                        success: false,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Define the workflow edges
        workflow.addEdge("gatherRealTimeData", "calculateHealthScores");
        workflow.addEdge("calculateHealthScores", "analyzeHealthTrends");
        workflow.addEdge("analyzeHealthTrends", "assessRisksAndWarnings");
        workflow.addEdge("assessRisksAndWarnings", "generateAutomatedAlerts");
        workflow.addEdge("generateAutomatedAlerts", "createProactiveRecommendations");
        workflow.addEdge("createProactiveRecommendations", "integratePredictiveAnalytics");
        workflow.addEdge("integratePredictiveAnalytics", "generateHealthDashboard");
        workflow.addEdge("generateHealthDashboard", END);

        // Set entry point
        workflow.setEntryPoint("gatherRealTimeData");

        return workflow.compile();
    }

    /**
     * Gather real-time financial data with enhanced processing
     */
    async gatherRealTimeFinancialData(inputData) {
        console.log("📊 Gathering real-time financial data...");
        
        // Simulate real-time data enhancement
        const enhancedData = {
            ...inputData,
            timestamp: new Date().toISOString(),
            real_time_balance: this.calculateRealTimeBalance(inputData.transactions || []),
            recent_transactions: this.getRecentTransactions(inputData.transactions || [], 30), // Last 30 days
            account_balances: this.aggregateAccountBalances(inputData.accounts || []),
            market_data: await this.getMarketData(),
            quality_score: this.assessDataQuality(inputData),
            completeness: this.calculateDataCompleteness(inputData)
        };

        return enhancedData;
    }

    /**
     * Calculate comprehensive health scores across multiple dimensions
     */
    async calculateComprehensiveHealthScores(data) {
        console.log("🧮 Calculating comprehensive health scores...");
        
        const transactions = data.transactions || [];
        const accounts = data.accounts || [];
        const recentTransactions = data.recent_transactions || [];
        
        // 1. Cash Flow Health (0-100)
        const cashFlowHealth = this.calculateCashFlowHealth(recentTransactions);
        
        // 2. Debt Health (0-100)
        const debtHealth = this.calculateDebtHealth(accounts, recentTransactions);
        
        // 3. Emergency Fund Health (0-100)
        const emergencyFundHealth = this.calculateEmergencyFundHealth(accounts, recentTransactions);
        
        // 4. Spending Discipline Health (0-100)
        const spendingHealth = this.calculateSpendingHealth(recentTransactions);
        
        // 5. Savings Rate Health (0-100)
        const savingsHealth = this.calculateSavingsHealth(recentTransactions);
        
        // 6. Investment Health (0-100)
        const investmentHealth = this.calculateInvestmentHealth(accounts);
        
        // 7. Liquidity Health (0-100)
        const liquidityHealth = this.calculateLiquidityHealth(accounts);
        
        // 8. Overall Health Score (weighted average)
        const weights = {
            cash_flow: 0.20,
            debt: 0.18,
            emergency_fund: 0.15,
            spending: 0.15,
            savings: 0.12,
            investment: 0.10,
            liquidity: 0.10
        };
        
        const overallHealthScore = (
            cashFlowHealth * weights.cash_flow +
            debtHealth * weights.debt +
            emergencyFundHealth * weights.emergency_fund +
            spendingHealth * weights.spending +
            savingsHealth * weights.savings +
            investmentHealth * weights.investment +
            liquidityHealth * weights.liquidity
        );
        
        const healthScores = {
            overall_health_score: Math.round(overallHealthScore),
            overall_health_grade: this.getHealthGrade(overallHealthScore),
            component_scores: {
                cash_flow_health: Math.round(cashFlowHealth),
                debt_health: Math.round(debtHealth),
                emergency_fund_health: Math.round(emergencyFundHealth),
                spending_health: Math.round(spendingHealth),
                savings_health: Math.round(savingsHealth),
                investment_health: Math.round(investmentHealth),
                liquidity_health: Math.round(liquidityHealth)
            },
            score_weights: weights,
            calculation_timestamp: new Date().toISOString(),
            data_points_analyzed: {
                transactions: recentTransactions.length,
                accounts: accounts.length,
                days_of_data: 30
            }
        };
        
        // Store in history for trend analysis
        this.healthMetrics.set(new Date().toISOString(), healthScores);
        
        return healthScores;
    }

    /**
     * Analyze health trends over time
     */
    async analyzeHealthTrends(currentHealthMetrics) {
        console.log("📈 Analyzing health trends...");
        
        const historicalData = Array.from(this.healthMetrics.entries())
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-30); // Last 30 data points
        
        if (historicalData.length < 2) {
            return {
                trend_status: 'insufficient_data',
                message: 'Need more historical data for trend analysis',
                data_points: historicalData.length
            };
        }
        
        const trends = {
            overall_trend: this.calculateTrend(historicalData.map(([, data]) => data.overall_health_score)),
            component_trends: {},
            trend_analysis: {
                direction: '',
                strength: 0,
                consistency: 0,
                acceleration: 0
            },
            forecast: {
                next_30_days: 0,
                confidence: 0
            },
            historical_range: {
                min: Math.min(...historicalData.map(([, data]) => data.overall_health_score)),
                max: Math.max(...historicalData.map(([, data]) => data.overall_health_score)),
                average: historicalData.reduce((sum, [, data]) => sum + data.overall_health_score, 0) / historicalData.length
            }
        };
        
        // Analyze component trends
        const components = Object.keys(currentHealthMetrics.component_scores);
        for (const component of components) {
            const componentValues = historicalData.map(([, data]) => data.component_scores[component]);
            trends.component_trends[component] = {
                trend: this.calculateTrend(componentValues),
                change_rate: this.calculateChangeRate(componentValues),
                volatility: this.calculateVolatility(componentValues)
            };
        }
        
        // Overall trend analysis
        const overallScores = historicalData.map(([, data]) => data.overall_health_score);
        trends.trend_analysis.direction = this.getTrendDirection(overallScores);
        trends.trend_analysis.strength = this.getTrendStrength(overallScores);
        trends.trend_analysis.consistency = this.getTrendConsistency(overallScores);
        trends.trend_analysis.acceleration = this.getTrendAcceleration(overallScores);
        
        // Simple forecast
        trends.forecast.next_30_days = this.forecastNextValue(overallScores);
        trends.forecast.confidence = this.calculateForecastConfidence(overallScores);
        
        this.healthTrends.push({
            timestamp: new Date().toISOString(),
            ...trends
        });
        
        return trends;
    }
    
    /**
     * Calculate cash flow health score (0-100)
     */
    calculateCashFlowHealth(transactions) {
        if (!transactions.length) return 50; // Neutral score for no data
        
        const monthlyIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyExpenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
        
        const netCashFlow = monthlyIncome - monthlyExpenses;
        const cashFlowRatio = monthlyIncome > 0 ? netCashFlow / monthlyIncome : 0;
        
        // Score based on cash flow ratio
        if (cashFlowRatio >= 0.3) return 100; // Excellent: 30%+ savings rate
        if (cashFlowRatio >= 0.2) return 85;  // Very good: 20-30% savings
        if (cashFlowRatio >= 0.1) return 70;  // Good: 10-20% savings
        if (cashFlowRatio >= 0.05) return 55; // Fair: 5-10% savings
        if (cashFlowRatio >= 0) return 40;    // Poor: Breaking even
        return Math.max(0, 40 + (cashFlowRatio * 100)); // Negative cash flow
    }
    
    /**
     * Calculate debt health score (0-100)
     */
    calculateDebtHealth(accounts, transactions) {
        const totalDebt = accounts
            .filter(acc => acc.balance < 0)
            .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
        
        const totalAssets = accounts
            .filter(acc => acc.balance > 0)
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        if (totalDebt === 0) return 100; // No debt is perfect
        
        const debtToAssetRatio = totalAssets > 0 ? totalDebt / totalAssets : 1;
        
        // Score based on debt-to-asset ratio
        if (debtToAssetRatio <= 0.1) return 95;  // Excellent: <10%
        if (debtToAssetRatio <= 0.2) return 85;  // Very good: 10-20%
        if (debtToAssetRatio <= 0.3) return 70;  // Good: 20-30%
        if (debtToAssetRatio <= 0.5) return 50;  // Fair: 30-50%
        if (debtToAssetRatio <= 0.8) return 25;  // Poor: 50-80%
        return 10; // Critical: >80%
    }
    
    /**
     * Calculate emergency fund health score (0-100)
     */
    calculateEmergencyFundHealth(accounts, transactions) {
        const liquidAssets = accounts
            .filter(acc => acc.type && acc.type.includes('LIQUID') && acc.balance > 0)
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        const monthlyExpenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
        
        if (monthlyExpenses === 0) return 50; // Can't calculate without expense data
        
        const emergencyFundMonths = liquidAssets / monthlyExpenses;
        
        // Score based on months of expenses covered
        if (emergencyFundMonths >= 6) return 100; // Excellent: 6+ months
        if (emergencyFundMonths >= 3) return 80;  // Good: 3-6 months
        if (emergencyFundMonths >= 1) return 60;  // Fair: 1-3 months
        if (emergencyFundMonths >= 0.5) return 30; // Poor: 2 weeks - 1 month
        return 10; // Critical: <2 weeks
    }
    
    /**
     * Calculate spending health score (0-100)
     */
    calculateSpendingHealth(transactions) {
        if (!transactions.length) return 50;
        
        const expenses = transactions.filter(t => t.amount < 0);
        if (expenses.length < 7) return 50; // Need sufficient data
        
        // Calculate spending variance (consistency)
        const dailyTotals = this.groupTransactionsByDay(expenses);
        const amounts = Object.values(dailyTotals);
        const mean = amounts.reduce((sum, amt) => sum + Math.abs(amt), 0) / amounts.length;
        const variance = amounts.reduce((sum, amt) => sum + Math.pow(Math.abs(amt) - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
        
        // Score based on spending consistency (lower variation = better)
        if (coefficientOfVariation <= 0.2) return 90;  // Very consistent
        if (coefficientOfVariation <= 0.4) return 75;  // Fairly consistent
        if (coefficientOfVariation <= 0.6) return 60;  // Moderately consistent
        if (coefficientOfVariation <= 0.8) return 45;  // Inconsistent
        return 25; // Very inconsistent
    }
    
    /**
     * Calculate savings health score (0-100)
     */
    calculateSavingsHealth(transactions) {
        if (!transactions.length) return 50;
        
        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
        
        if (income === 0) return 0;
        
        const savingsRate = (income - expenses) / income;
        
        // Score based on savings rate
        if (savingsRate >= 0.3) return 100; // Excellent: 30%+
        if (savingsRate >= 0.2) return 85;  // Very good: 20-30%
        if (savingsRate >= 0.15) return 70; // Good: 15-20%
        if (savingsRate >= 0.1) return 55;  // Fair: 10-15%
        if (savingsRate >= 0.05) return 35; // Poor: 5-10%
        return Math.max(0, 20 + savingsRate * 100); // Very poor or negative
    }
    
    /**
     * Calculate investment health score (0-100)
     */
    calculateInvestmentHealth(accounts) {
        const investmentAccounts = accounts.filter(acc => 
            acc.type && (acc.type.includes('INVESTMENT') || acc.type.includes('RETIREMENT'))
        );
        
        if (investmentAccounts.length === 0) return 30; // Low score for no investments
        
        const totalAssets = accounts
            .filter(acc => acc.balance > 0)
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        const investmentAssets = investmentAccounts
            .reduce((sum, acc) => sum + Math.max(0, acc.balance), 0);
        
        if (totalAssets === 0) return 30;
        
        const investmentRatio = investmentAssets / totalAssets;
        
        // Score based on investment allocation
        if (investmentRatio >= 0.7) return 100; // Excellent: 70%+
        if (investmentRatio >= 0.5) return 85;  // Very good: 50-70%
        if (investmentRatio >= 0.3) return 70;  // Good: 30-50%
        if (investmentRatio >= 0.15) return 55; // Fair: 15-30%
        if (investmentRatio >= 0.05) return 35; // Poor: 5-15%
        return 20; // Very poor: <5%
    }
    
    /**
     * Calculate liquidity health score (0-100)
     */
    calculateLiquidityHealth(accounts) {
        const liquidAssets = accounts
            .filter(acc => acc.type && acc.type.includes('LIQUID') && acc.balance > 0)
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        const totalAssets = accounts
            .filter(acc => acc.balance > 0)
            .reduce((sum, acc) => sum + acc.balance, 0);
        
        if (totalAssets === 0) return 50;
        
        const liquidityRatio = liquidAssets / totalAssets;
        
        // Score based on liquidity ratio (too high or too low is bad)
        if (liquidityRatio >= 0.2 && liquidityRatio <= 0.4) return 100; // Optimal: 20-40%
        if (liquidityRatio >= 0.15 && liquidityRatio <= 0.5) return 85;  // Very good: 15-50%
        if (liquidityRatio >= 0.1 && liquidityRatio <= 0.6) return 70;   // Good: 10-60%
        if (liquidityRatio >= 0.05 && liquidityRatio <= 0.8) return 50;  // Fair: 5-80%
        return 30; // Poor: <5% or >80%
    }
    
    /**
     * Get health grade from score
     */
    getHealthGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 45) return 'D+';
        if (score >= 40) return 'D';
        return 'F';
    }
    
    /**
     * Group transactions by day
     */
    groupTransactionsByDay(transactions) {
        const grouped = {};
        transactions.forEach(transaction => {
            const date = transaction.date.split('T')[0]; // Get date part only
            if (!grouped[date]) grouped[date] = 0;
            grouped[date] += transaction.amount;
        });
        return grouped;
    }
    
    /**
     * Calculate trend from array of values
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2; // Sum of indices
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, idx) => sum + (idx * val), 0);
        const sumX2 = values.reduce((sum, val, idx) => sum + (idx * idx), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }
    
    /**
     * Calculate change rate from array of values
     */
    calculateChangeRate(values) {
        if (values.length < 2) return 0;
        const first = values[0];
        const last = values[values.length - 1];
        return first !== 0 ? (last - first) / Math.abs(first) : 0;
    }
    
    /**
     * Calculate volatility from array of values
     */
    calculateVolatility(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    /**
     * Get trend direction
     */
    getTrendDirection(values) {
        const trend = this.calculateTrend(values);
        if (trend > 1) return 'strongly_improving';
        if (trend > 0.5) return 'improving';
        if (trend > -0.5) return 'stable';
        if (trend > -1) return 'declining';
        return 'strongly_declining';
    }
    
    /**
     * Get trend strength (0-100)
     */
    getTrendStrength(values) {
        const trend = Math.abs(this.calculateTrend(values));
        return Math.min(100, trend * 20); // Scale to 0-100
    }
    
    /**
     * Get trend consistency (0-100)
     */
    getTrendConsistency(values) {
        if (values.length < 3) return 50;
        
        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(values[i] - values[i-1]);
        }
        
        const positiveChanges = changes.filter(c => c > 0).length;
        const negativeChanges = changes.filter(c => c < 0).length;
        const totalChanges = changes.length;
        
        const consistency = Math.max(positiveChanges, negativeChanges) / totalChanges;
        return Math.round(consistency * 100);
    }
    
    /**
     * Get trend acceleration
     */
    getTrendAcceleration(values) {
        if (values.length < 3) return 0;
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstTrend = this.calculateTrend(firstHalf);
        const secondTrend = this.calculateTrend(secondHalf);
        
        return secondTrend - firstTrend;
    }
    
    /**
     * Forecast next value using simple linear regression
     */
    forecastNextValue(values) {
        if (values.length < 2) return values[0] || 0;
        
        const trend = this.calculateTrend(values);
        const lastValue = values[values.length - 1];
        return lastValue + trend;
    }
    
    /**
     * Calculate forecast confidence (0-100)
     */
    calculateForecastConfidence(values) {
        if (values.length < 3) return 30;
        
        const consistency = this.getTrendConsistency(values);
        const volatility = this.calculateVolatility(values);
        const dataPoints = Math.min(values.length / 10, 5); // More data = higher confidence
        
        const confidence = (consistency * 0.4) + ((100 - volatility) * 0.4) + (dataPoints * 4);
        return Math.min(100, Math.max(0, confidence));
    }
    
    /**
     * Assess financial risks and generate early warnings
     */
    async assessFinancialRisks(healthMetrics, trendAnalysis) {
        console.log("⚠️ Assessing financial risks...");
        
        const risks = {
            overall_risk_level: 'low',
            risk_factors: [],
            early_warnings: [],
            risk_score: 0,
            critical_risks: [],
            moderate_risks: [],
            low_risks: []
        };
        
        const overallScore = healthMetrics.overall_health_score;
        const componentScores = healthMetrics.component_scores;
        
        // Critical risk factors (score < 30)
        Object.entries(componentScores).forEach(([component, score]) => {
            if (score < 30) {
                risks.critical_risks.push({
                    type: component,
                    score: score,
                    severity: 'critical',
                    message: this.getRiskMessage(component, score, 'critical')
                });
            } else if (score < 50) {
                risks.moderate_risks.push({
                    type: component,
                    score: score,
                    severity: 'moderate',
                    message: this.getRiskMessage(component, score, 'moderate')
                });
            } else if (score < 70) {
                risks.low_risks.push({
                    type: component,
                    score: score,
                    severity: 'low',
                    message: this.getRiskMessage(component, score, 'low')
                });
            }
        });
        
        // Trend-based early warnings
        if (trendAnalysis.trend_analysis) {
            const { direction, strength } = trendAnalysis.trend_analysis;
            
            if (direction === 'strongly_declining' && strength > 50) {
                risks.early_warnings.push({
                    type: 'declining_health_trend',
                    severity: 'critical',
                    message: 'Financial health is declining rapidly. Immediate action recommended.',
                    trend_strength: strength
                });
            } else if (direction === 'declining' && strength > 30) {
                risks.early_warnings.push({
                    type: 'declining_health_trend',
                    severity: 'moderate',
                    message: 'Financial health showing downward trend. Monitor closely.',
                    trend_strength: strength
                });
            }
        }
        
        // Calculate overall risk score
        risks.risk_score = this.calculateOverallRiskScore(risks);
        risks.overall_risk_level = this.determineRiskLevel(risks.risk_score);
        
        return risks;
    }
    
    /**
     * Get risk message for component
     */
    getRiskMessage(component, score, severity) {
        const messages = {
            cash_flow_health: {
                critical: 'Negative cash flow detected. Immediate budget review needed.',
                moderate: 'Low cash flow margin. Consider reducing expenses.',
                low: 'Cash flow could be improved with better budgeting.'
            },
            debt_health: {
                critical: 'High debt levels pose significant financial risk.',
                moderate: 'Debt levels are concerning. Focus on debt reduction.',
                low: 'Debt levels are manageable but could be improved.'
            },
            emergency_fund_health: {
                critical: 'Emergency fund critically low. Build emergency savings immediately.',
                moderate: 'Emergency fund insufficient. Aim for 3-6 months expenses.',
                low: 'Emergency fund below recommended levels.'
            },
            spending_health: {
                critical: 'Spending patterns are highly irregular and unpredictable.',
                moderate: 'Spending inconsistency detected. Create a budget plan.',
                low: 'Spending could be more consistent.'
            },
            savings_health: {
                critical: 'No savings or negative savings rate. Review income and expenses.',
                moderate: 'Low savings rate. Increase savings goals.',
                low: 'Savings rate below optimal levels.'
            },
            investment_health: {
                critical: 'No investment portfolio. Consider long-term investing.',
                moderate: 'Limited investment diversification. Expand portfolio.',
                low: 'Investment allocation could be optimized.'
            },
            liquidity_health: {
                critical: 'Liquidity severely constrained. Maintain more liquid assets.',
                moderate: 'Liquidity levels may be insufficient for emergencies.',
                low: 'Liquidity allocation could be balanced better.'
            }
        };
        
        return messages[component]?.[severity] || `${component} needs attention (score: ${score})`;
    }
    
    /**
     * Calculate overall risk score
     */
    calculateOverallRiskScore(risks) {
        let score = 0;
        
        // Weight by severity
        score += risks.critical_risks.length * 30;
        score += risks.moderate_risks.length * 15;
        score += risks.low_risks.length * 5;
        score += risks.early_warnings.filter(w => w.severity === 'critical').length * 25;
        score += risks.early_warnings.filter(w => w.severity === 'moderate').length * 10;
        
        return Math.min(100, score);
    }
    
    /**
     * Determine overall risk level
     */
    determineRiskLevel(riskScore) {
        if (riskScore >= 70) return 'critical';
        if (riskScore >= 40) return 'high';
        if (riskScore >= 20) return 'moderate';
        return 'low';
    }
    
    /**
     * Generate automated alerts
     */
    async generateAutomatedAlerts(healthMetrics, riskAssessment, trendAnalysis) {
        console.log("🚨 Generating automated alerts...");
        
        const alerts = [];
        
        // Health score alerts
        const overallScore = healthMetrics.overall_health_score;
        if (overallScore < this.alertThresholds.overall_health.critical) {
            alerts.push({
                id: `health_critical_${Date.now()}`,
                type: 'financial_health',
                severity: 'critical',
                title: 'Critical Financial Health Alert',
                message: `Overall financial health score is critically low (${overallScore}/100). Immediate action required.`,
                recommendations: ['Review budget immediately', 'Reduce non-essential expenses', 'Consider financial counseling'],
                timestamp: new Date().toISOString()
            });
        } else if (overallScore < this.alertThresholds.overall_health.warning) {
            alerts.push({
                id: `health_warning_${Date.now()}`,
                type: 'financial_health',
                severity: 'warning',
                title: 'Financial Health Warning',
                message: `Financial health score below recommended level (${overallScore}/100). Review and improve.`,
                recommendations: ['Analyze spending patterns', 'Increase savings rate', 'Review financial goals'],
                timestamp: new Date().toISOString()
            });
        }
        
        // Component-specific alerts
        Object.entries(healthMetrics.component_scores).forEach(([component, score]) => {
            const thresholds = this.alertThresholds[component.replace('_health', '')] || 
                             this.alertThresholds.overall_health;
            
            if (score < thresholds.critical) {
                alerts.push({
                    id: `${component}_critical_${Date.now()}`,
                    type: component,
                    severity: 'critical',
                    title: `Critical ${component.replace('_', ' ').toUpperCase()} Alert`,
                    message: `${component.replace('_', ' ')} score is critically low (${score}/100)`,
                    timestamp: new Date().toISOString()
                });
            } else if (score < thresholds.warning) {
                alerts.push({
                    id: `${component}_warning_${Date.now()}`,
                    type: component,
                    severity: 'warning',
                    title: `${component.replace('_', ' ').toUpperCase()} Warning`,
                    message: `${component.replace('_', ' ')} score needs attention (${score}/100)`,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Risk-based alerts
        riskAssessment.critical_risks.forEach(risk => {
            alerts.push({
                id: `risk_${risk.type}_${Date.now()}`,
                type: 'risk_alert',
                severity: 'critical',
                title: `High Risk: ${risk.type.replace('_', ' ').toUpperCase()}`,
                message: risk.message,
                risk_score: risk.score,
                timestamp: new Date().toISOString()
            });
        });
        
        // Trend-based alerts
        if (trendAnalysis.trend_analysis?.direction === 'strongly_declining') {
            alerts.push({
                id: `trend_declining_${Date.now()}`,
                type: 'trend_alert',
                severity: 'warning',
                title: 'Declining Financial Health Trend',
                message: 'Your financial health has been declining. Review recent changes.',
                trend_direction: trendAnalysis.trend_analysis.direction,
                timestamp: new Date().toISOString()
            });
        }
        
        return alerts;
    }
    
    /**
     * Create proactive health recommendations
     */
    async createProactiveRecommendations(healthMetrics, riskAssessment, trendAnalysis, alerts) {
        console.log("💡 Creating proactive recommendations...");
        
        const recommendations = [];
        
        // Health-based recommendations
        const overallScore = healthMetrics.overall_health_score;
        const componentScores = healthMetrics.component_scores;
        
        // Emergency fund recommendations
        if (componentScores.emergency_fund_health < 50) {
            recommendations.push({
                id: `emergency_fund_${Date.now()}`,
                category: 'emergency_preparedness',
                priority: 'high',
                title: 'Build Emergency Fund',
                description: 'Establish or increase emergency fund to cover 3-6 months of expenses',
                action_items: [
                    'Calculate monthly expenses',
                    'Set automatic savings transfer',
                    'Use high-yield savings account',
                    'Start with $1000 emergency fund'
                ],
                estimated_impact: 'High',
                timeframe: '3-6 months'
            });
        }
        
        // Cash flow recommendations
        if (componentScores.cash_flow_health < 60) {
            recommendations.push({
                id: `cash_flow_${Date.now()}`,
                category: 'cash_flow_optimization',
                priority: componentScores.cash_flow_health < 30 ? 'critical' : 'high',
                title: 'Improve Cash Flow',
                description: 'Optimize income and expenses to improve monthly cash flow',
                action_items: [
                    'Review and categorize all expenses',
                    'Identify and eliminate unnecessary subscriptions',
                    'Consider additional income sources',
                    'Negotiate better rates on utilities and services'
                ],
                estimated_impact: 'High',
                timeframe: '1-3 months'
            });
        }
        
        // Debt management recommendations
        if (componentScores.debt_health < 70) {
            recommendations.push({
                id: `debt_management_${Date.now()}`,
                category: 'debt_reduction',
                priority: componentScores.debt_health < 40 ? 'critical' : 'medium',
                title: 'Reduce Debt Burden',
                description: 'Implement debt reduction strategy to improve financial health',
                action_items: [
                    'List all debts with interest rates',
                    'Consider debt avalanche or snowball method',
                    'Negotiate with creditors for better terms',
                    'Avoid taking on new debt'
                ],
                estimated_impact: 'High',
                timeframe: '6-24 months'
            });
        }
        
        // Investment recommendations
        if (componentScores.investment_health < 60) {
            recommendations.push({
                id: `investment_${Date.now()}`,
                category: 'wealth_building',
                priority: 'medium',
                title: 'Start or Improve Investment Strategy',
                description: 'Build long-term wealth through strategic investing',
                action_items: [
                    'Open investment account if needed',
                    'Start with low-cost index funds',
                    'Contribute to employer 401(k) match',
                    'Consider Roth IRA for tax advantages'
                ],
                estimated_impact: 'Medium',
                timeframe: '3-12 months'
            });
        }
        
        // Spending optimization recommendations
        if (componentScores.spending_health < 70) {
            recommendations.push({
                id: `spending_${Date.now()}`,
                category: 'spending_optimization',
                priority: 'medium',
                title: 'Improve Spending Consistency',
                description: 'Create more predictable and controlled spending patterns',
                action_items: [
                    'Create and stick to monthly budget',
                    'Use spending tracking app',
                    'Implement the 24-hour rule for large purchases',
                    'Set up separate accounts for different spending categories'
                ],
                estimated_impact: 'Medium',
                timeframe: '1-3 months'
            });
        }
        
        // Trend-based recommendations
        if (trendAnalysis.trend_analysis?.direction?.includes('declining')) {
            recommendations.push({
                id: `trend_reversal_${Date.now()}`,
                category: 'trend_reversal',
                priority: 'high',
                title: 'Reverse Declining Trend',
                description: 'Take action to improve declining financial health trend',
                action_items: [
                    'Identify what changed in recent months',
                    'Return to previous successful financial habits',
                    'Seek professional financial advice',
                    'Set up weekly financial check-ins'
                ],
                estimated_impact: 'High',
                timeframe: '1-2 months'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Integrate with Predictive Analytics Pipeline (Phase 3.7.2)
     */
    async integratePredictiveAnalytics(healthMetrics, inputData) {
        console.log("🔮 Integrating with predictive analytics...");
        
        try {
            // Use the orchestrator to run predictive analytics if available
            if (this.orchestrator && this.orchestrator.runPredictiveAnalyticsPipeline) {
                const predictiveResult = await this.orchestrator.runPredictiveAnalyticsPipeline(
                    inputData,
                    { 
                        focus: 'health_monitoring',
                        health_context: healthMetrics 
                    }
                );
                
                return {
                    health_forecast: predictiveResult.integrated_predictions?.health_forecast || 'stable',
                    confidence: predictiveResult.overall_confidence || 0,
                    ml_insights: predictiveResult.ml_predictions || {},
                    risk_predictions: predictiveResult.risk_assessment || {},
                    integration_success: true,
                    integration_time: new Date().toISOString()
                };
            } else {
                // Fallback: Simple predictive analysis
                return this.simpleHealthForecast(healthMetrics);
            }
        } catch (error) {
            console.warn("⚠️ Predictive analytics integration failed, using fallback:", error.message);
            return this.simpleHealthForecast(healthMetrics);
        }
    }
    
    /**
     * Simple health forecast fallback
     */
    simpleHealthForecast(healthMetrics) {
        const currentScore = healthMetrics.overall_health_score;
        
        return {
            health_forecast: currentScore > 70 ? 'stable' : currentScore > 40 ? 'at_risk' : 'declining',
            confidence: 60, // Lower confidence for simple forecast
            ml_insights: {
                simple_forecast: true,
                message: 'Basic forecast based on current health score'
            },
            risk_predictions: {
                short_term_risk: currentScore < 50 ? 'high' : 'moderate',
                long_term_risk: currentScore < 40 ? 'high' : 'moderate'
            },
            integration_success: false,
            integration_time: new Date().toISOString()
        };
    }
    
    /**
     * Generate comprehensive health dashboard data
     */
    async generateHealthDashboard(healthMetrics, trendAnalysis, riskAssessment, alerts, recommendations, monitoringStatus) {
        console.log("📊 Generating health dashboard...");
        
        const dashboard = {
            // Overview section
            overview: {
                overall_health_score: healthMetrics.overall_health_score,
                overall_health_grade: healthMetrics.overall_health_grade,
                health_status: this.getHealthStatusMessage(healthMetrics.overall_health_score),
                last_updated: new Date().toISOString(),
                monitoring_active: this.monitoringActive
            },
            
            // Component scores with visual indicators
            component_health: {
                scores: healthMetrics.component_scores,
                visual_indicators: this.generateVisualIndicators(healthMetrics.component_scores),
                improvement_areas: this.identifyImprovementAreas(healthMetrics.component_scores)
            },
            
            // Trend analysis
            trends: {
                ...trendAnalysis,
                trend_summary: this.generateTrendSummary(trendAnalysis),
                chart_data: this.generateTrendChartData()
            },
            
            // Risk assessment
            risks: {
                ...riskAssessment,
                risk_summary: this.generateRiskSummary(riskAssessment)
            },
            
            // Alerts section
            alerts: {
                all_alerts: alerts,
                critical_count: alerts.filter(a => a.severity === 'critical').length,
                warning_count: alerts.filter(a => a.severity === 'warning').length,
                recent_alerts: alerts.slice(-5), // Last 5 alerts
                alert_summary: this.generateAlertSummary(alerts)
            },
            
            // Recommendations section
            recommendations: {
                all_recommendations: recommendations,
                high_priority: recommendations.filter(r => r.priority === 'high' || r.priority === 'critical'),
                quick_wins: recommendations.filter(r => r.timeframe && r.timeframe.includes('1')),
                recommendation_summary: this.generateRecommendationSummary(recommendations)
            },
            
            // Monitoring status
            monitoring: {
                ...monitoringStatus,
                health_history_points: this.healthMetrics.size,
                trend_history_points: this.healthTrends.length,
                monitoring_duration: this.getMonitoringDuration()
            },
            
            // Action items
            action_items: this.generateActionItems(alerts, recommendations, riskAssessment),
            
            // Key metrics for widgets
            key_metrics: {
                health_score: healthMetrics.overall_health_score,
                health_grade: healthMetrics.overall_health_grade,
                trend_direction: trendAnalysis.trend_analysis?.direction || 'stable',
                risk_level: riskAssessment.overall_risk_level,
                alert_count: alerts.length,
                recommendation_count: recommendations.length
            }
        };
        
        return dashboard;
    }
    
    /**
     * Main execution method - Run Health Monitoring Pipeline
     */
    async runHealthMonitoringPipeline(inputData, options = {}) {
        const startTime = Date.now();
        console.log("🏥 Starting Financial Health Monitoring Pipeline...");
        
        try {
            const initialState = {
                input_data: inputData,
                execution_start: startTime,
                options: options
            };
            
            const result = await this.pipeline.invoke(initialState);
            
            console.log(`✅ Health Monitoring Pipeline completed successfully in ${Date.now() - startTime}ms`);
            return {
                success: true,
                ...result.final_output,
                pipeline_execution_time: Date.now() - startTime
            };
            
        } catch (error) {
            console.error("❌ Health Monitoring Pipeline failed:", error);
            return {
                success: false,
                error: error.message,
                pipeline_execution_time: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Start continuous health monitoring
     */
    async startContinuousMonitoring(inputData, intervalMinutes = 30) {
        if (this.monitoringActive) {
            console.log("⚠️ Monitoring already active");
            return { success: false, message: "Monitoring already active" };
        }
        
        console.log(`🔄 Starting continuous health monitoring (${intervalMinutes} minute intervals)...`);
        this.monitoringActive = true;
        
        // Run initial analysis
        await this.runHealthMonitoringPipeline(inputData);
        
        // Set up recurring monitoring
        this.monitoringInterval = setInterval(async () => {
            if (this.monitoringActive) {
                try {
                    await this.runHealthMonitoringPipeline(inputData);
                    console.log("✅ Continuous monitoring cycle completed");
                } catch (error) {
                    console.error("❌ Monitoring cycle failed:", error);
                }
            }
        }, intervalMinutes * 60 * 1000);
        
        return { 
            success: true, 
            message: `Continuous monitoring started with ${intervalMinutes} minute intervals`,
            monitoring_active: true 
        };
    }
    
    /**
     * Stop continuous health monitoring
     */
    stopContinuousMonitoring() {
        if (!this.monitoringActive) {
            return { success: false, message: "Monitoring not active" };
        }
        
        console.log("⏹️ Stopping continuous health monitoring...");
        this.monitoringActive = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        return { 
            success: true, 
            message: "Continuous monitoring stopped",
            monitoring_active: false 
        };
    }
    
    // Helper methods...
    getHealthStatusMessage(score) {
        if (score >= 85) return "Excellent financial health! Keep up the great work.";
        if (score >= 70) return "Good financial health with room for improvement.";
        if (score >= 55) return "Fair financial health. Focus on key areas for improvement.";
        if (score >= 40) return "Below average financial health. Action needed.";
        return "Poor financial health. Immediate attention required.";
    }
    
    generateVisualIndicators(componentScores) {
        const indicators = {};
        Object.entries(componentScores).forEach(([component, score]) => {
            indicators[component] = {
                score: score,
                color: score >= 70 ? 'green' : score >= 50 ? 'yellow' : 'red',
                status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
                icon: score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌'
            };
        });
        return indicators;
    }
    
    identifyImprovementAreas(componentScores) {
        return Object.entries(componentScores)
            .filter(([, score]) => score < 70)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 3)
            .map(([component, score]) => ({
                component: component.replace('_health', '').replace('_', ' '),
                score,
                priority: score < 40 ? 'high' : score < 60 ? 'medium' : 'low'
            }));
    }
    
    generateTrendSummary(trendAnalysis) {
        if (!trendAnalysis.trend_analysis) return "Insufficient data for trend analysis";
        
        const { direction, strength, consistency } = trendAnalysis.trend_analysis;
        return `Health trend is ${direction} with ${strength}% strength and ${consistency}% consistency.`;
    }
    
    generateTrendChartData() {
        const data = Array.from(this.healthMetrics.entries())
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-30) // Last 30 data points
            .map(([timestamp, metrics]) => ({
                timestamp,
                score: metrics.overall_health_score,
                date: new Date(timestamp).toLocaleDateString()
            }));
        
        return data;
    }
    
    generateRiskSummary(riskAssessment) {
        const criticalCount = riskAssessment.critical_risks?.length || 0;
        const moderateCount = riskAssessment.moderate_risks?.length || 0;
        const lowCount = riskAssessment.low_risks?.length || 0;
        
        if (criticalCount > 0) {
            return `${criticalCount} critical risk(s) identified. Immediate action required.`;
        } else if (moderateCount > 0) {
            return `${moderateCount} moderate risk(s) detected. Monitor and address.`;
        } else if (lowCount > 0) {
            return `${lowCount} minor risk(s) present. Low priority for improvement.`;
        }
        return "No significant risks detected.";
    }
    
    generateAlertSummary(alerts) {
        const criticalCount = alerts.filter(a => a.severity === 'critical').length;
        const warningCount = alerts.filter(a => a.severity === 'warning').length;
        
        if (criticalCount > 0) {
            return `${criticalCount} critical alert(s) require immediate attention.`;
        } else if (warningCount > 0) {
            return `${warningCount} warning(s) need review.`;
        }
        return "No active alerts.";
    }
    
    generateRecommendationSummary(recommendations) {
        const highPriority = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length;
        const quickWins = recommendations.filter(r => r.timeframe && r.timeframe.includes('1')).length;
        
        return `${recommendations.length} recommendations available (${highPriority} high priority, ${quickWins} quick wins).`;
    }
    
    generateActionItems(alerts, recommendations, riskAssessment) {
        const actionItems = [];
        
        // Critical alerts become immediate action items
        alerts.filter(a => a.severity === 'critical').forEach(alert => {
            actionItems.push({
                type: 'alert_action',
                priority: 'immediate',
                title: `Address: ${alert.title}`,
                description: alert.message,
                source: 'critical_alert'
            });
        });
        
        // High priority recommendations
        recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').forEach(rec => {
            actionItems.push({
                type: 'recommendation_action',
                priority: rec.priority,
                title: rec.title,
                description: rec.description,
                action_items: rec.action_items,
                source: 'recommendation'
            });
        });
        
        // Critical risks
        riskAssessment.critical_risks?.forEach(risk => {
            actionItems.push({
                type: 'risk_action',
                priority: 'high',
                title: `Mitigate: ${risk.type.replace('_', ' ')}`,
                description: risk.message,
                source: 'critical_risk'
            });
        });
        
        return actionItems.slice(0, 10); // Top 10 action items
    }
    
    getMonitoringDuration() {
        // Implementation would track when monitoring started
        return "Active"; // Placeholder
    }
}

module.exports = { FinancialHealthMonitoring }; 