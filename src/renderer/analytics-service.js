// FutureFund Advanced Analytics Service
class AnalyticsService {
    constructor() {
        this.analysisCache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    // 🔍 SPENDING HABIT ANALYSIS
    analyzeSpendingHabits(transactions) {
        const cacheKey = 'spending-habits-' + transactions.length;
        if (this.isCacheValid(cacheKey)) {
            return this.analysisCache.get(cacheKey).data;
        }

        const expenses = transactions.filter(t => t.amount < 0 && !t.isProjected);
        
        // Category spending analysis
        const categorySpending = this.groupByCategory(expenses);
        const categoryHabits = this.analyzeCategoryPatterns(categorySpending);
        
        // Time-based patterns
        const timePatterns = this.analyzeTimePatterns(expenses);
        
        // Frequency analysis
        const frequencyPatterns = this.analyzeSpendingFrequency(expenses);
        
        const habits = {
            categoryBreakdown: categoryHabits,
            timePatterns: timePatterns,
            frequency: frequencyPatterns,
            insights: this.generateSpendingInsights(categoryHabits, timePatterns, frequencyPatterns),
            lastUpdated: new Date().toISOString()
        };

        this.cacheAnalysis(cacheKey, habits);
        return habits;
    }

    analyzeCategoryPatterns(categorySpending) {
        const patterns = {};
        
        Object.entries(categorySpending).forEach(([category, amounts]) => {
            const totalSpent = amounts.reduce((sum, amt) => sum + Math.abs(amt), 0);
            const avgTransaction = totalSpent / amounts.length;
            const variance = this.calculateVariance(amounts.map(Math.abs));
            
            patterns[category] = {
                totalSpent: totalSpent,
                transactionCount: amounts.length,
                averageAmount: avgTransaction,
                variance: variance,
                consistency: variance < avgTransaction * 0.5 ? 'high' : variance < avgTransaction ? 'medium' : 'low',
                trend: this.calculateTrend(amounts),
                percentage: 0 // Will be calculated later
            };
        });

        // Calculate percentages
        const totalSpending = Object.values(patterns).reduce((sum, cat) => sum + cat.totalSpent, 0);
        Object.values(patterns).forEach(cat => {
            cat.percentage = (cat.totalSpent / totalSpending) * 100;
        });

        return patterns;
    }

    analyzeTimePatterns(expenses) {
        const dayOfWeekSpending = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
        const dayOfMonthSpending = Array(31).fill(0).map(() => ({ total: 0, count: 0 }));
        const hourlySpending = Array(24).fill(0).map(() => ({ total: 0, count: 0 }));

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const dayOfWeek = date.getDay();
            const dayOfMonth = date.getDate() - 1;
            const hour = date.getHours();

            dayOfWeekSpending[dayOfWeek].total += Math.abs(expense.amount);
            dayOfWeekSpending[dayOfWeek].count += 1;

            if (dayOfMonth < 31) {
                dayOfMonthSpending[dayOfMonth].total += Math.abs(expense.amount);
                dayOfMonthSpending[dayOfMonth].count += 1;
            }

            hourlySpending[hour].total += Math.abs(expense.amount);
            hourlySpending[hour].count += 1;
        });

        return {
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                .map((day, i) => ({
                    day,
                    total: dayOfWeekSpending[i].total,
                    average: dayOfWeekSpending[i].count > 0 ? dayOfWeekSpending[i].total / dayOfWeekSpending[i].count : 0,
                    transactionCount: dayOfWeekSpending[i].count
                })),
            monthlyPattern: dayOfMonthSpending.map((data, i) => ({
                day: i + 1,
                total: data.total,
                average: data.count > 0 ? data.total / data.count : 0,
                transactionCount: data.count
            })),
            peakSpendingDay: this.findPeakSpendingDay(dayOfWeekSpending),
            peakSpendingTime: this.findPeakSpendingTime(hourlySpending)
        };
    }

    // 🚨 ANOMALY DETECTION
    detectAnomalies(transactions) {
        const cacheKey = 'anomalies-' + transactions.length;
        if (this.isCacheValid(cacheKey)) {
            return this.analysisCache.get(cacheKey).data;
        }

        const expenses = transactions.filter(t => t.amount < 0 && !t.isProjected);
        const anomalies = [];

        // Amount-based anomalies (using z-score)
        const amounts = expenses.map(t => Math.abs(t.amount));
        const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length);

        expenses.forEach(expense => {
            const amount = Math.abs(expense.amount);
            const zScore = (amount - mean) / stdDev;
            
            if (Math.abs(zScore) > 2.5) { // Outlier threshold
                anomalies.push({
                    type: 'unusual_amount',
                    transaction: expense,
                    severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
                    description: `Unusually ${zScore > 0 ? 'large' : 'small'} transaction`,
                    zScore: zScore,
                    impact: amount - mean
                });
            }
        });

        // Frequency-based anomalies
        const categoryFrequencies = this.analyzeCategoryFrequencies(expenses);
        const frequencyAnomalies = this.detectFrequencyAnomalies(categoryFrequencies, expenses);
        anomalies.push(...frequencyAnomalies);

        // Time-based anomalies
        const timeAnomalies = this.detectTimeAnomalies(expenses);
        anomalies.push(...timeAnomalies);

        const analysis = {
            anomalies: anomalies.sort((a, b) => {
                const severityWeight = { high: 3, medium: 2, low: 1 };
                return severityWeight[b.severity] - severityWeight[a.severity];
            }),
            summary: {
                total: anomalies.length,
                high: anomalies.filter(a => a.severity === 'high').length,
                medium: anomalies.filter(a => a.severity === 'medium').length,
                low: anomalies.filter(a => a.severity === 'low').length
            },
            lastUpdated: new Date().toISOString()
        };

        this.cacheAnalysis(cacheKey, analysis);
        return analysis;
    }

    // 📅 SEASONAL SPENDING PATTERNS
    analyzeSeasonalPatterns(transactions) {
        const cacheKey = 'seasonal-' + transactions.length;
        if (this.isCacheValid(cacheKey)) {
            return this.analysisCache.get(cacheKey).data;
        }

        const expenses = transactions.filter(t => t.amount < 0 && !t.isProjected);
        
        // Monthly patterns
        const monthlySpending = Array(12).fill(0).map(() => ({ total: 0, count: 0, categories: {} }));
        
        expenses.forEach(expense => {
            const month = new Date(expense.date).getMonth();
            const amount = Math.abs(expense.amount);
            
            monthlySpending[month].total += amount;
            monthlySpending[month].count += 1;
            
            if (!monthlySpending[month].categories[expense.category]) {
                monthlySpending[month].categories[expense.category] = 0;
            }
            monthlySpending[month].categories[expense.category] += amount;
        });

        const seasonalData = monthlySpending.map((data, i) => ({
            month: new Date(2024, i, 1).toLocaleString('default', { month: 'long' }),
            monthIndex: i,
            total: data.total,
            average: data.count > 0 ? data.total / data.count : 0,
            transactionCount: data.count,
            topCategories: this.getTopCategories(data.categories, 3)
        }));

        // Seasonal insights
        const seasons = this.groupBySeasons(seasonalData);
        const trends = this.calculateSeasonalTrends(seasonalData);

        const patterns = {
            monthly: seasonalData,
            seasonal: seasons,
            trends: trends,
            insights: this.generateSeasonalInsights(seasonalData, seasons, trends),
            lastUpdated: new Date().toISOString()
        };

        this.cacheAnalysis(cacheKey, patterns);
        return patterns;
    }

    // 🎯 GOAL TRACKING
    analyzeGoalProgress(transactions, goals = []) {
        // Default financial goals if none provided
        const defaultGoals = [
            {
                id: 'emergency_fund',
                name: 'Emergency Fund',
                type: 'savings',
                target: 10000,
                category: 'Savings',
                timeframe: 12 // months
            },
            {
                id: 'reduce_food_spending',
                name: 'Reduce Food Spending',
                type: 'expense_reduction',
                target: 300, // monthly target
                category: 'Food',
                timeframe: 6
            },
            {
                id: 'investment_growth',
                name: 'Investment Growth',
                type: 'savings',
                target: 25000,
                category: 'Income',
                timeframe: 24
            }
        ];

        const allGoals = [...goals, ...defaultGoals];
        const expenses = transactions.filter(t => t.amount < 0 && !t.isProjected);
        const income = transactions.filter(t => t.amount > 0 && !t.isProjected);

        return allGoals.map(goal => {
            let progress = 0;
            let currentValue = 0;
            let monthlyProgress = 0;

            if (goal.type === 'savings') {
                // Calculate current savings rate
                const savingsTransactions = transactions.filter(t => 
                    t.category === goal.category || t.category === 'Savings'
                );
                currentValue = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);
                progress = Math.max(0, (currentValue / goal.target) * 100);
                
                // Monthly savings rate
                const monthlySavings = this.calculateMonthlySavings(income, expenses);
                monthlyProgress = (monthlySavings / (goal.target / goal.timeframe)) * 100;
            } else if (goal.type === 'expense_reduction') {
                // Calculate current spending in category
                const categoryExpenses = expenses.filter(t => t.category === goal.category);
                const monthlySpending = this.calculateMonthlyAverage(categoryExpenses);
                currentValue = monthlySpending;
                progress = Math.max(0, ((goal.target - monthlySpending) / goal.target) * 100);
                monthlyProgress = progress;
            }

            return {
                ...goal,
                currentValue: currentValue,
                progress: Math.min(100, progress),
                monthlyProgress: monthlyProgress,
                status: progress >= 100 ? 'achieved' : progress >= 75 ? 'on_track' : progress >= 25 ? 'behind' : 'critical',
                projectedCompletion: this.calculateProjectedCompletion(goal, progress, monthlyProgress),
                recommendations: this.generateGoalRecommendations(goal, progress, monthlyProgress)
            };
        });
    }

    // 💪 FINANCIAL HEALTH SCORING
    calculateFinancialHealthScore(transactions) {
        const cacheKey = 'health-score-' + transactions.length;
        if (this.isCacheValid(cacheKey)) {
            return this.analysisCache.get(cacheKey).data;
        }

        const actualTransactions = transactions.filter(t => !t.isProjected);
        const expenses = actualTransactions.filter(t => t.amount < 0);
        const income = actualTransactions.filter(t => t.amount > 0);

        // Use realistic financial situation instead of mock transaction data
        // Sampuel's actual situation: -$8,331.68 net worth, $20,360.90 credit card debt
        const totalIncome = 45000; // Annual income
        const totalExpenses = 39000; // Annual expenses (45k - 6k savings)
        const currentBalance = -8331.68; // Actual net worth

        // Score components (each 0-100)
        const savingsRate = this.calculateSavingsRateScore(totalIncome, totalExpenses);
        const budgetControl = this.calculateBudgetControlScore(expenses);
        const emergencyFund = this.calculateEmergencyFundScore(currentBalance, totalExpenses);
        const consistency = this.calculateConsistencyScore(expenses);
        const diversification = this.calculateDiversificationScore(expenses);

        console.log('🔍 Health Score Components Debug:', {
            savingsRate,
            budgetControl,
            emergencyFund,
            consistency,
            diversification,
            totalIncome,
            totalExpenses,
            currentBalance
        });

        // Weighted overall score
        const overallScore = Math.round(
            (savingsRate * 0.25) +
            (budgetControl * 0.25) +
            (emergencyFund * 0.20) +
            (consistency * 0.15) +
            (diversification * 0.15)
        );

        console.log('🔍 Final Health Score:', overallScore, this.getHealthGrade(overallScore));

        const healthScore = {
            overall: overallScore,
            grade: this.getHealthGrade(overallScore),
            components: {
                savingsRate: { score: savingsRate, weight: 25 },
                budgetControl: { score: budgetControl, weight: 25 },
                emergencyFund: { score: emergencyFund, weight: 20 },
                consistency: { score: consistency, weight: 15 },
                diversification: { score: diversification, weight: 15 }
            },
            insights: this.generateHealthInsights(overallScore, {
                savingsRate, budgetControl, emergencyFund, consistency, diversification
            }),
            recommendations: this.generateHealthRecommendations(overallScore, {
                savingsRate, budgetControl, emergencyFund, consistency, diversification
            }),
            lastUpdated: new Date().toISOString()
        };

        this.cacheAnalysis(cacheKey, healthScore);
        return healthScore;
    }

    // Helper Methods
    groupByCategory(transactions) {
        return transactions.reduce((groups, transaction) => {
            const category = transaction.category || 'Other';
            if (!groups[category]) groups[category] = [];
            groups[category].push(transaction.amount);
            return groups;
        }, {});
    }

    calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    }

    calculateTrend(amounts) {
        if (amounts.length < 2) return 'stable';
        const recent = amounts.slice(-Math.ceil(amounts.length / 3));
        const earlier = amounts.slice(0, Math.floor(amounts.length / 3));
        
        const recentAvg = recent.reduce((sum, amt) => sum + Math.abs(amt), 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, amt) => sum + Math.abs(amt), 0) / earlier.length;
        
        const change = (recentAvg - earlierAvg) / earlierAvg;
        
        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    calculateSavingsRateScore(income, expenses) {
        if (income === 0) return 0;
        const savingsRate = ((income - expenses) / income) * 100;
        
        if (savingsRate >= 20) return 100;
        if (savingsRate >= 15) return 85;
        if (savingsRate >= 10) return 70;
        if (savingsRate >= 5) return 50;
        if (savingsRate >= 0) return 25;
        return 0;
    }

    calculateBudgetControlScore(expenses) {
        const monthlyExpenses = this.groupByMonth(expenses);
        const amounts = Object.values(monthlyExpenses).map(month => 
            Math.abs(month.reduce((sum, t) => sum + t.amount, 0))
        );
        
        if (amounts.length < 2) return 75; // Default for insufficient data
        
        const variance = this.calculateVariance(amounts);
        const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const coefficientOfVariation = variance / mean;
        
        if (coefficientOfVariation < 0.1) return 100;
        if (coefficientOfVariation < 0.2) return 85;
        if (coefficientOfVariation < 0.3) return 70;
        if (coefficientOfVariation < 0.5) return 50;
        return 25;
    }

    calculateEmergencyFundScore(balance, monthlyExpenses) {
        // If balance is negative, no emergency fund
        if (balance <= 0) return 0;
        
        const monthsOfExpenses = balance / (monthlyExpenses / 12);
        
        if (monthsOfExpenses >= 6) return 100;
        if (monthsOfExpenses >= 3) return 75;
        if (monthsOfExpenses >= 1) return 50;
        if (monthsOfExpenses >= 0.5) return 25;
        return 0;
    }

    getHealthGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    // Cache management
    isCacheValid(key) {
        const cached = this.analysisCache.get(key);
        return cached && (Date.now() - cached.timestamp) < this.cacheExpiry;
    }

    cacheAnalysis(key, data) {
        this.analysisCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Additional Helper Methods
    analyzeSpendingFrequency(expenses) {
        // Group transactions by week to analyze frequency patterns
        const weeklyGroups = this.groupByWeek(expenses);
        const frequencies = Object.values(weeklyGroups).map(week => week.length);
        
        return {
            averageTransactionsPerWeek: frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length,
            maxTransactionsPerWeek: Math.max(...frequencies),
            minTransactionsPerWeek: Math.min(...frequencies),
            frequencyVariation: this.calculateVariance(frequencies)
        };
    }

    generateSpendingInsights(categoryHabits, timePatterns, frequencyPatterns) {
        const insights = [];
        
        // Category insights
        const topCategory = Object.entries(categoryHabits)
            .sort((a, b) => b[1].percentage - a[1].percentage)[0];
        if (topCategory && topCategory[1].percentage > 30) {
            insights.push(`${topCategory[0]} represents ${topCategory[1].percentage.toFixed(1)}% of your spending`);
        }

        // Time insights
        const peakDay = timePatterns.weekdays.reduce((max, day) => 
            day.total > max.total ? day : max
        );
        insights.push(`You spend most on ${peakDay.day}s`);

        // Frequency insights
        if (frequencyPatterns.averageTransactionsPerWeek > 10) {
            insights.push("You make frequent small transactions");
        } else if (frequencyPatterns.averageTransactionsPerWeek < 3) {
            insights.push("You make fewer, larger transactions");
        }

        return insights;
    }

    findPeakSpendingDay(dayOfWeekSpending) {
        let maxIndex = 0;
        let maxAmount = 0;
        dayOfWeekSpending.forEach((day, index) => {
            if (day.total > maxAmount) {
                maxAmount = day.total;
                maxIndex = index;
            }
        });
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return { day: days[maxIndex], amount: maxAmount };
    }

    findPeakSpendingTime(hourlySpending) {
        let maxIndex = 0;
        let maxAmount = 0;
        hourlySpending.forEach((hour, index) => {
            if (hour.total > maxAmount) {
                maxAmount = hour.total;
                maxIndex = index;
            }
        });
        return { hour: maxIndex, amount: maxAmount };
    }

    analyzeCategoryFrequencies(expenses) {
        const frequencies = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Other';
            if (!frequencies[category]) frequencies[category] = [];
            frequencies[category].push(expense.date);
        });

        Object.keys(frequencies).forEach(category => {
            frequencies[category] = frequencies[category].length;
        });

        return frequencies;
    }

    detectFrequencyAnomalies(categoryFrequencies, expenses) {
        const anomalies = [];
        const avgFrequency = Object.values(categoryFrequencies).reduce((sum, freq) => sum + freq, 0) / Object.keys(categoryFrequencies).length;
        
        Object.entries(categoryFrequencies).forEach(([category, frequency]) => {
            if (frequency > avgFrequency * 2) {
                anomalies.push({
                    type: 'unusual_frequency',
                    category: category,
                    frequency: frequency,
                    severity: 'medium',
                    description: `Unusually high transaction frequency in ${category}`,
                    impact: frequency - avgFrequency
                });
            }
        });

        return anomalies;
    }

    detectTimeAnomalies(expenses) {
        const anomalies = [];
        const monthlySpending = this.groupByMonth(expenses);
        
        Object.entries(monthlySpending).forEach(([month, transactions]) => {
            const monthTotal = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const avgTransaction = monthTotal / transactions.length;
            
            // Detect months with unusual spending patterns
            transactions.forEach(transaction => {
                const amount = Math.abs(transaction.amount);
                if (amount > avgTransaction * 3) {
                    anomalies.push({
                        type: 'time_anomaly',
                        transaction: transaction,
                        severity: 'low',
                        description: `Large transaction in typically low-spending period`,
                        impact: amount - avgTransaction
                    });
                }
            });
        });

        return anomalies;
    }

    getTopCategories(categories, limit = 3) {
        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([category, amount]) => ({ category, amount }));
    }

    groupBySeasons(monthlyData) {
        const seasons = {
            spring: { months: [2, 3, 4], total: 0, average: 0 },
            summer: { months: [5, 6, 7], total: 0, average: 0 },
            fall: { months: [8, 9, 10], total: 0, average: 0 },
            winter: { months: [11, 0, 1], total: 0, average: 0 }
        };

        Object.entries(seasons).forEach(([season, data]) => {
            const seasonData = monthlyData.filter(month => data.months.includes(month.monthIndex));
            data.total = seasonData.reduce((sum, month) => sum + month.total, 0);
            data.average = data.total / seasonData.length;
        });

        return seasons;
    }

    calculateSeasonalTrends(seasonalData) {
        const trends = {};
        
        // Compare consecutive seasons
        for (let i = 0; i < seasonalData.length - 3; i += 3) {
            const seasonData = seasonalData.slice(i, i + 3);
            const seasonTotal = seasonData.reduce((sum, month) => sum + month.total, 0);
            trends[`season_${Math.floor(i/3)}`] = seasonTotal;
        }

        return trends;
    }

    generateSeasonalInsights(monthlyData, seasons, trends) {
        const insights = [];
        
        // Find highest spending season
        const highestSeason = Object.entries(seasons)
            .sort((a, b) => b[1].total - a[1].total)[0];
        insights.push(`Highest spending season: ${highestSeason[0]}`);

        // Find highest spending month
        const highestMonth = monthlyData.reduce((max, month) => 
            month.total > max.total ? month : max
        );
        insights.push(`Peak spending month: ${highestMonth.month}`);

        return insights;
    }

    calculateMonthlySavings(income, expenses) {
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
        return (totalIncome - totalExpenses) / 12; // Monthly average
    }

    calculateMonthlyAverage(transactions) {
        if (transactions.length === 0) return 0;
        const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const monthlyGroups = this.groupByMonth(transactions);
        const monthCount = Object.keys(monthlyGroups).length || 1;
        return total / monthCount;
    }

    calculateProjectedCompletion(goal, progress, monthlyProgress) {
        if (monthlyProgress <= 0) return 'Unknown';
        
        const remainingProgress = 100 - progress;
        const monthsRemaining = remainingProgress / monthlyProgress;
        
        if (monthsRemaining <= 0) return 'Achieved';
        if (monthsRemaining <= goal.timeframe) return `${Math.ceil(monthsRemaining)} months`;
        return `${Math.ceil(monthsRemaining)} months (behind schedule)`;
    }

    generateGoalRecommendations(goal, progress, monthlyProgress) {
        const recommendations = [];
        
        if (progress < 25) {
            recommendations.push(`Increase ${goal.type === 'savings' ? 'savings rate' : 'spending reduction'} to get back on track`);
        } else if (progress < 75) {
            recommendations.push('Consider adjusting your budget to improve progress');
        } else {
            recommendations.push('Great progress! Stay consistent to achieve your goal');
        }

        return recommendations;
    }

    calculateConsistencyScore(expenses) {
        const monthlyExpenses = this.groupByMonth(expenses);
        const amounts = Object.values(monthlyExpenses).map(month => 
            Math.abs(month.reduce((sum, t) => sum + t.amount, 0))
        );
        
        if (amounts.length < 2) return 75;
        
        const variance = this.calculateVariance(amounts);
        const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const consistency = 1 - (Math.sqrt(variance) / mean);
        
        return Math.max(0, Math.min(100, consistency * 100));
    }

    calculateDiversificationScore(expenses) {
        const categorySpending = this.groupByCategory(expenses);
        const categories = Object.keys(categorySpending);
        
        if (categories.length >= 8) return 100;
        if (categories.length >= 6) return 80;
        if (categories.length >= 4) return 60;
        if (categories.length >= 2) return 40;
        return 20;
    }

    generateHealthInsights(overallScore, components) {
        const insights = [];
        
        if (overallScore >= 80) {
            insights.push("Excellent financial health! Keep up the great work.");
        } else if (overallScore >= 60) {
            insights.push("Good financial foundation with room for improvement.");
        } else {
            insights.push("Focus on building better financial habits.");
        }

        // Component-specific insights
        const weakest = Object.entries(components)
            .sort((a, b) => a[1] - b[1])[0];
        insights.push(`Primary area for improvement: ${this.humanizeComponentName(weakest[0])}`);

        return insights;
    }

    generateHealthRecommendations(overallScore, components) {
        const recommendations = [];
        
        if (components.savingsRate < 50) {
            recommendations.push("Increase your savings rate to at least 10% of income");
        }
        if (components.budgetControl < 50) {
            recommendations.push("Track expenses more consistently to improve budget control");
        }
        if (components.emergencyFund < 50) {
            recommendations.push("Build an emergency fund covering 3-6 months of expenses");
        }

        return recommendations;
    }

    humanizeComponentName(componentName) {
        const names = {
            savingsRate: 'Savings Rate',
            budgetControl: 'Budget Control',
            emergencyFund: 'Emergency Fund',
            consistency: 'Spending Consistency',
            diversification: 'Category Diversification'
        };
        return names[componentName] || componentName;
    }

    groupByMonth(transactions) {
        return transactions.reduce((groups, transaction) => {
            const month = transaction.date.substring(0, 7); // YYYY-MM
            if (!groups[month]) groups[month] = [];
            groups[month].push(transaction);
            return groups;
        }, {});
    }

    groupByWeek(transactions) {
        return transactions.reduce((groups, transaction) => {
            const date = new Date(transaction.date);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            const weekKey = weekStart.toISOString().substring(0, 10);
            if (!groups[weekKey]) groups[weekKey] = [];
            groups[weekKey].push(transaction);
            return groups;
        }, {});
    }

    // Comprehensive analysis method
    runCompleteAnalysis(transactions) {
        return {
            spendingHabits: this.analyzeSpendingHabits(transactions),
            anomalies: this.detectAnomalies(transactions),
            seasonalPatterns: this.analyzeSeasonalPatterns(transactions),
            goalProgress: this.analyzeGoalProgress(transactions),
            healthScore: this.calculateFinancialHealthScore(transactions),
            lastUpdated: new Date().toISOString()
        };
    }
}

// Export for global access
window.AnalyticsService = AnalyticsService; 