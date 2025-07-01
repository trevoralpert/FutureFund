// FutureFund Chart Service - Data Visualization Engine
class ChartService {
    constructor() {
        this.charts = new Map(); // Store chart instances
        this.defaultColors = {
            primary: '#2563eb',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4',
            secondary: '#64748b',
            gradients: {
                primary: ['#2563eb', '#3b82f6'],
                success: ['#10b981', '#34d399'],
                danger: ['#ef4444', '#f87171'],
                balance: ['#8b5cf6', '#a855f7']
            }
        };
        
        // Chart.js global defaults
        this.initializeChartDefaults();
    }
    
    initializeChartDefaults() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter';
            Chart.defaults.font.size = 12;
            Chart.defaults.color = '#64748b';
            Chart.defaults.borderColor = '#e2e8f0';
            Chart.defaults.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        }
    }
    
    // Balance Over Time Chart
    createBalanceOverTimeChart(canvasId, financialData, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        // Prepare data
        const chartData = this.prepareBalanceData(financialData, options);
        
        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Balance Over Time',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM yyyy'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.3,
                        borderWidth: 3
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        };
        
        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        
        return chart;
    }
    
    // Expense Category Breakdown (Pie/Doughnut Chart)
    createCategoryBreakdownChart(canvasId, financialData, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        // Prepare data
        const chartData = this.prepareCategoryData(financialData, options);
        
        const config = {
            type: options.chartType || 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: options.title || 'Expense Categories',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: options.chartType === 'doughnut' ? '60%' : 0
            }
        };
        
        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        
        return chart;
    }
    
    // Income vs Expense Trends (Bar Chart)
    createIncomeExpenseTrendsChart(canvasId, financialData, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        // Prepare data
        const chartData = this.prepareIncomeExpenseData(financialData, options);
        
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income vs Expenses Trends',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = Math.abs(context.parsed.y);
                                return `${context.dataset.label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrency(Math.abs(value))
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4
                    }
                }
            }
        };
        
        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        
        return chart;
    }
    
    // Scenario Comparison Chart
    createScenarioComparisonChart(canvasId, baseScenario, compareScenarios, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }
        
        // Prepare comparison data
        const chartData = this.prepareScenarioComparisonData(baseScenario, compareScenarios, options);
        
        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Scenario Comparison',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM yyyy'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Projected Balance ($)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.3,
                        borderWidth: 3
                    },
                    point: {
                        radius: 3,
                        hoverRadius: 5
                    }
                }
            }
        };
        
        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        
        return chart;
    }
    
    // Data preparation methods
    prepareBalanceData(financialData, options = {}) {
        // Sort data by date
        const sortedData = financialData
            .filter(d => d.balance !== undefined)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Separate actual and projected data
        const actualData = sortedData.filter(d => !d.isProjected);
        const projectedData = sortedData.filter(d => d.isProjected);
        
        const datasets = [];
        
        // Actual balance line
        if (actualData.length > 0) {
            datasets.push({
                label: 'Actual Balance',
                data: actualData.map(d => ({
                    x: d.date,
                    y: d.balance
                })),
                borderColor: this.defaultColors.primary,
                backgroundColor: this.defaultColors.primary + '20',
                fill: false,
                pointBackgroundColor: this.defaultColors.primary
            });
        }
        
        // Projected balance line
        if (projectedData.length > 0) {
            datasets.push({
                label: 'Projected Balance',
                data: projectedData.map(d => ({
                    x: d.date,
                    y: d.balance
                })),
                borderColor: this.defaultColors.info,
                backgroundColor: this.defaultColors.info + '20',
                borderDash: [5, 5],
                fill: false,
                pointBackgroundColor: this.defaultColors.info
            });
        }
        
        return { datasets };
    }
    
    prepareCategoryData(financialData, options = {}) {
        // Group expenses by category
        const categoryTotals = {};
        
        financialData
            .filter(d => d.amount < 0 && d.category) // Only expenses
            .forEach(d => {
                const category = d.category;
                const amount = Math.abs(d.amount);
                categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            });
        
        // Sort categories by amount (descending)
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, options.maxCategories || 10);
        
        const labels = sortedCategories.map(([category]) => category);
        const data = sortedCategories.map(([, amount]) => amount);
        
        // Generate colors
        const colors = this.generateCategoryColors(labels.length);
        
        return {
            labels,
            datasets: [{
                label: 'Expenses',
                data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 2
            }]
        };
    }
    
    prepareIncomeExpenseData(financialData, options = {}) {
        // Group data by month
        const monthlyData = {};
        
        financialData.forEach(d => {
            const date = new Date(d.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expenses: 0 };
            }
            
            if (d.amount > 0) {
                monthlyData[monthKey].income += d.amount;
            } else {
                monthlyData[monthKey].expenses += Math.abs(d.amount);
            }
        });
        
        // Sort by month
        const sortedMonths = Object.keys(monthlyData).sort();
        const recentMonths = sortedMonths.slice(-12); // Last 12 months
        
        const labels = recentMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        const incomeData = recentMonths.map(month => monthlyData[month].income);
        const expenseData = recentMonths.map(month => -monthlyData[month].expenses); // Negative for visual distinction
        
        return {
            labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: this.defaultColors.success + '80',
                    borderColor: this.defaultColors.success,
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: this.defaultColors.danger + '80',
                    borderColor: this.defaultColors.danger,
                    borderWidth: 2
                }
            ]
        };
    }
    
    prepareScenarioComparisonData(baseScenario, compareScenarios, options = {}) {
        // This is a simplified version - in a real implementation,
        // you would apply scenario parameters to generate different projections
        const datasets = [];
        const colors = [this.defaultColors.primary, this.defaultColors.success, this.defaultColors.warning, this.defaultColors.danger];
        
        // Base scenario (using actual financial data)
        if (baseScenario && baseScenario.projectedData) {
            datasets.push({
                label: baseScenario.name || 'Base Scenario',
                data: baseScenario.projectedData.map(d => ({
                    x: d.date,
                    y: d.balance
                })),
                borderColor: colors[0],
                backgroundColor: colors[0] + '20',
                fill: false
            });
        }
        
        // Comparison scenarios
        compareScenarios.forEach((scenario, index) => {
            if (scenario && scenario.projectedData) {
                datasets.push({
                    label: scenario.name,
                    data: scenario.projectedData.map(d => ({
                        x: d.date,
                        y: d.balance
                    })),
                    borderColor: colors[(index + 1) % colors.length],
                    backgroundColor: colors[(index + 1) % colors.length] + '20',
                    borderDash: [10, 5],
                    fill: false
                });
            }
        });
        
        return { datasets };
    }
    
    // Utility methods
    generateCategoryColors(count) {
        const baseColors = [
            'rgba(37, 99, 235, 0.8)',   // Blue
            'rgba(16, 185, 129, 0.8)',  // Green
            'rgba(239, 68, 68, 0.8)',   // Red
            'rgba(245, 158, 11, 0.8)',  // Yellow
            'rgba(139, 92, 246, 0.8)',  // Purple
            'rgba(6, 182, 212, 0.8)',   // Cyan
            'rgba(236, 72, 153, 0.8)',  // Pink
            'rgba(34, 197, 94, 0.8)',   // Emerald
            'rgba(249, 115, 22, 0.8)',  // Orange
            'rgba(168, 85, 247, 0.8)'   // Violet
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        
        return colors;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Chart management
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }
    
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }
    
    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }
    
    // Export functionality
    exportChart(canvasId, filename = 'chart') {
        const chart = this.charts.get(canvasId);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = url;
            link.click();
        }
    }
    
    // Responsive handling
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ChartService = ChartService;
} 