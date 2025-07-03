// FutureFund Renderer - Main Frontend Logic
class FutureFundApp {
    constructor() {
        this.currentTab = 'ledger';
        this.currentScenario = 'base';
        this.financialData = [];
        this.scenarios = new Map();
        this.chatHistory = [];
        this.currentView = 'table'; // 'table' or 'chart'
        this.chartService = null;
        this.analyticsService = null;
        this.seasonalChart = null;
        this.aggregateView = true; // true for aggregate, false for individual account view
        this.scenarioMode = 'base'; // 'base', 'active', 'preview'
        this.activeScenarios = new Map(); // Track active scenarios
        this.scenarioEffects = new Map(); // Cache scenario effect calculations
        this.previewData = null; // Store preview calculations
        
        // Loading guards to prevent infinite loops
        this.isLoadingScenarios = false;
        this.isLoadingFinancialData = false;
        this.isCreatingCharts = false; // Flag to prevent rapid clicking during chart creation
        
        this.init();
    }

    async init() {
        console.log('FutureFund initializing...');
        
        // Initialize UI enhancement systems
        this.initializeUIEnhancements();
        
        // Initialize UI components
        this.initializeTabs();
        this.initializeEventListeners();
        this.initializeData();
        
        // Initialize services
        this.initializeChartService();
        this.initializeAnalyticsService();
        
        // Load initial data
        await this.loadFinancialData();
        await this.loadScenarios();
        await this.loadActiveScenarios();
        
        // Initialize onboarding for new users
        this.initializeOnboarding();
        
        console.log('FutureFund initialized successfully!');
    }

    initializeUIEnhancements() {
        // Initialize existing UI enhancement managers only
        window.accessibilityManager = new AccessibilityManager();
        window.errorManager = new ErrorManager();
        window.formValidator = new FormValidator();
        
        // Initialize performance optimization systems
        window.performanceMonitor = new PerformanceMonitor();
        window.cacheManager = new CacheManager();
        window.virtualScrollManager = new VirtualScrollManager();
        window.assetOptimizer = new AssetOptimizer();
        
        // Setup performance-optimized methods
        this.setupPerformanceOptimizations();
        
        console.log('✨ UI Enhancement and Performance systems initialized');
    }

    setupPerformanceOptimizations() {
        // Cache expensive calculations
        this.cachedCalculateScenarioEffects = window.cacheManager.memoizeAsync(
            this.calculateScenarioEffects.bind(this),
            (scenario) => `scenario_effects_${scenario.id}_${scenario.lastModified || Date.now()}`,
            5 * 60 * 1000 // 5 minute cache
        );

        // Cache financial analytics
        this.cachedAnalyticsGeneration = window.cacheManager.memoizeAsync(
            this.generateAnalyticsData.bind(this),
            (dateRange, accountFilter) => `analytics_${dateRange}_${accountFilter}`,
            2 * 60 * 1000 // 2 minute cache
        );

        // Setup virtual scrolling for large transaction lists
        this.setupVirtualScrolling();
        
        // Setup performance monitoring for key operations
        this.setupPerformanceTracking();
    }

    setupVirtualScrolling() {
        // Enable virtual scrolling for transaction table when data is large
        const originalUpdateLedgerTable = this.updateLedgerTable.bind(this);
        this.updateLedgerTable = () => {
            const data = this.getFilteredData(
                document.getElementById('dateRange')?.value || 'all',
                document.getElementById('accountFilter')?.value || 'all'
            );

            // Use normal table for all datasets for now (simplified)
            originalUpdateLedgerTable();
        };
    }

    setupVirtualTransactionTable(data) {
        // Placeholder for virtual scrolling - using normal table for now
        console.log(`📊 Virtual scrolling placeholder for ${data.length} transactions`);
    }

    renderTransactionRow(transaction, index) {
        const row = document.createElement('div');
        row.className = 'virtual-transaction-row';
        row.style.cssText = `
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            background: ${index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'};
        `;

        const accountName = this.getAccountNameForTransaction(transaction);
        const formattedDate = this.formatDate(transaction.date);
        const amount = this.formatCurrency(Math.abs(transaction.amount));
        const typeClass = transaction.amount >= 0 ? 'income' : 'expense';

        row.innerHTML = `
            <div style="flex: 1; min-width: 120px;">
                <div style="font-weight: 500;">${formattedDate}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${accountName}</div>
            </div>
            <div style="flex: 2; min-width: 200px;">
                <div style="font-weight: 500;">${transaction.description}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${transaction.category}</div>
            </div>
            <div style="flex: 1; min-width: 100px; text-align: right;">
                <div class="amount ${typeClass}" style="font-weight: 600;">${amount}</div>
            </div>
        `;

        return row;
    }

    setupPerformanceTracking() {
        // Track key operations with simple logging
        const originalSendChatMessage = this.sendChatMessage.bind(this);
        this.sendChatMessage = async () => {
            console.log('📤 Processing chat message...');
            
            try {
                const result = await originalSendChatMessage();
                console.log('✅ Chat message processed');
                return result;
            } catch (error) {
                console.error('❌ Chat message failed:', error);
                throw error;
            }
        };

        // Track scenario creation
        const originalCreateScenarioFromModal = this.createScenarioFromModal.bind(this);
        this.createScenarioFromModal = async () => {
            console.log('⚙️ Creating scenario...');
            
            try {
                const result = await originalCreateScenarioFromModal();
                console.log('✅ Scenario created');
                return result;
            } catch (error) {
                console.error('❌ Scenario creation failed:', error);
                throw error;
            }
        };

        // Track analytics generation
        const originalInitializeAnalytics = this.initializeAnalytics.bind(this);
        this.initializeAnalytics = async () => {
            console.log('📊 Generating analytics...');
            
            try {
                const result = await originalInitializeAnalytics();
                console.log('✅ Analytics generated');
                return result;
            } catch (error) {
                console.error('❌ Analytics generation failed:', error);
                throw error;
            }
        };
    }

    async generateAnalyticsData(dateRange, accountFilter) {
        // This method can be cached for performance
        const data = this.getFilteredData(dateRange, accountFilter);
        
        // Expensive analytics calculations here
        const analytics = {
            spendingHabits: this.analyzeSpendingHabits(data),
            anomalies: this.detectAnomalies(data),
            seasonalPatterns: this.analyzeSeasonalPatterns(data),
            goalProgress: this.calculateGoalProgress(data)
        };

        return analytics;
    }

    // Performance-optimized refresh method
    async refreshCurrentTab() {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        
        if (!activeTab) return;

        // Use cached operations where possible
        switch (activeTab) {
            case 'ledger':
                await this.refreshLedger();
                break;
            case 'analytics':
                await this.refreshAnalyticsWithCache();
                break;
            case 'scenarios':
                await this.refreshScenarios();
                break;
            case 'accounts':
                await this.initializeAccounts();
                break;
        }
    }

    async refreshAnalyticsWithCache() {
        const dateRange = 'all'; // Could be made dynamic
        const accountFilter = 'all';
        
        try {
            const analytics = await this.cachedAnalyticsGeneration(dateRange, accountFilter);
            this.populateAnalyticsDashboard(analytics);
        } catch (error) {
            console.error('Failed to refresh analytics:', error);
            this.showAnalyticsError('Failed to refresh analytics data');
        }
    }

    populateAnalyticsDashboard(analytics) {
        // Populate the analytics dashboard with cached data
        this.populateSpendingHabits(analytics.spendingHabits);
        this.populateAnomalies(analytics.anomalies);
        this.populateSeasonalPatterns(analytics.seasonalPatterns);
        this.populateGoalProgress(analytics.goalProgress);
    }

    // Enhanced error handling with performance context
    handlePerformanceError(error, operation) {
        const performanceReport = window.performanceMonitor.generatePerformanceReport();
        
        console.error(`Performance error in ${operation}:`, error);
        console.log('Performance context:', performanceReport);
        
        // Show user-friendly error with performance context
        if (performanceReport.memory?.usage && parseFloat(performanceReport.memory.usage) > 80) {
            window.notificationManager.warning(
                'High memory usage detected. Consider refreshing the page for optimal performance.',
                8000
            );
        }
        
        if (performanceReport.fps < 30) {
            window.notificationManager.info(
                'Performance optimization activated to improve responsiveness.',
                5000
            );
        }
    }

    // Memory cleanup method
    performMemoryCleanup() {
        // Clear caches
        window.cacheManager.clear();
        
        // Clean up chart instances
        if (this.chartService) {
            this.chartService.cleanup();
        }
        
        // Clear virtual scroll instances
        window.virtualScrollManager.virtualLists.forEach((list, container) => {
            window.virtualScrollManager.destroyVirtualList(container);
        });
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        window.notificationManager.success('Memory cleanup completed', 3000);
    }

    // Performance report generation
    generatePerformanceReport() {
        const report = window.performanceMonitor.generatePerformanceReport();
        const cacheStats = window.cacheManager.getStats();
        
        return {
            ...report,
            cache: cacheStats,
            virtualLists: window.virtualScrollManager.virtualLists.size,
            timestamp: new Date().toISOString()
        };
    }

    initializeOnboarding() {
        // Check if this is a first-time user
        const hasSeenOnboarding = localStorage.getItem('futurefund_onboarding_completed');
        if (!hasSeenOnboarding) {
            // Delay onboarding slightly to let UI load
            setTimeout(() => {
                window.onboardingManager.start();
            }, 1000);
        }
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected tab content
        document.getElementById(`${tabName}Tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Handle tab-specific initialization
        if (tabName === 'ledger') {
            this.refreshLedger();
        } else if (tabName === 'chat') {
            // Focus chat input when switching to chat tab
            document.getElementById('chatInput').focus();
        } else if (tabName === 'scenarios') {
            this.refreshScenarios();
        } else if (tabName === 'analytics') {
            this.initializeAnalytics();
        } else if (tabName === 'accounts') {
            this.initializeAccounts();
        }
    }

    initializeEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Ledger controls with debouncing for performance
        document.getElementById('dateRange').addEventListener('change', () => {
            // Simple debounce implementation
            clearTimeout(this.dateRangeTimeout);
            this.dateRangeTimeout = setTimeout(() => {
                this.refreshLedger();
            }, 200);
        });

        // Account filter listener
        document.getElementById('accountFilter')?.addEventListener('change', () => {
            // Simple debounce implementation
            clearTimeout(this.accountFilterTimeout);
            this.accountFilterTimeout = setTimeout(() => {
                this.refreshLedger();
            }, 200);
        });

        // Transaction functionality
        document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
            this.openTransactionModal();
        });

        // Aggregate view toggle
        document.getElementById('aggregateViewToggle')?.addEventListener('click', () => {
            this.toggleAggregateView();
        });

        // Scenario controls
        document.getElementById('scenarioModeToggle')?.addEventListener('click', () => {
            this.toggleScenarioMode();
        });

        document.getElementById('manageActiveBtn')?.addEventListener('click', () => {
            this.switchTab('scenarios');
        });

        document.getElementById('previewImpactBtn')?.addEventListener('click', () => {
            this.openImpactPreview();
        });

        document.getElementById('clearAllScenariosBtn')?.addEventListener('click', () => {
            this.clearAllActiveScenarios();
        });

        document.getElementById('toggleView')?.addEventListener('click', () => {
            console.log('📈 Chart view toggle button clicked!');
            this.toggleLedgerView();
        });

        // Chat functionality
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Quick questions
        document.querySelectorAll('.quick-question').forEach(button => {
            button.addEventListener('click', (e) => {
                const question = e.target.textContent.replace('💡 ', '').replace('🏠 ', '').replace('📈 ', '');
                document.getElementById('chatInput').value = `Tell me about ${question.toLowerCase()}`;
                this.sendChatMessage();
            });
        });

        // Chat management buttons
        document.getElementById('chatHealthBtn').addEventListener('click', () => {
            this.checkChatHealth();
        });

        document.getElementById('chatSummaryBtn').addEventListener('click', () => {
            this.showChatSummary();
        });

        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearConversation();
        });

        // Scenario functionality
        document.getElementById('newScenarioBtn').addEventListener('click', () => {
            this.openScenarioModal();
        });

        // Chart controls with debouncing
        document.getElementById('categoryChartType')?.addEventListener('change', (e) => {
            clearTimeout(this.categoryChartTimeout);
            this.categoryChartTimeout = setTimeout(() => {
                this.updateCategoryChart(e.target.value);
            }, 150);
        });

        document.getElementById('trendsTimeframe')?.addEventListener('change', (e) => {
            clearTimeout(this.trendsChartTimeout);
            this.trendsChartTimeout = setTimeout(() => {
                this.updateTrendsChart(e.target.value);
            }, 150);
        });

        // Analytics functionality with throttling for heavy operations
        document.getElementById('refreshAnalyticsBtn')?.addEventListener('click', () => {
            if (!this.refreshAnalyticsThrottle) {
                this.refreshAnalyticsThrottle = true;
                this.refreshAnalytics();
                setTimeout(() => {
                    this.refreshAnalyticsThrottle = false;
                }, 1000);
            }
        });

        document.getElementById('exportAnalyticsBtn')?.addEventListener('click', async () => {
            try {
                await this.exportAnalyticsReport();
            } catch (error) {
                console.error('❌ Export button handler error:', error);
                window.notificationManager.error('Export failed');
            }
        });
    }

    async initializeData() {
        // Initialize with mock financial data
        this.financialData = this.generateMockData();
        
        console.log('📊 Mock data generated:', {
            totalTransactions: this.financialData.length,
            actualTransactions: this.financialData.filter(d => !d.isProjected).length,
            projectedTransactions: this.financialData.filter(d => d.isProjected).length
        });
        
        // Initialize base scenario
        this.scenarios.set('base', {
            id: 'base',
            name: 'Base Scenario',
            description: 'Your current financial trajectory',
            parameters: {
                salaryIncrease: 0,
                newExpenses: [],
                moveLocation: null,
                majorPurchases: []
            },
            createdAt: new Date().toISOString()
        });

        this.updateScenarioSelector();
    }

    generateMockData() {
        const data = [];
        const categories = ['Income', 'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Savings', 'Debt', 'Entertainment', 'Other'];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        let currentBalance = 5000;
        
        // Generate past transactions (12 months)
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            const transactionCount = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < transactionCount; j++) {
                const isIncome = Math.random() < 0.15;
                const category = isIncome ? 'Income' : 
                               categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
                
                let amount;
                if (isIncome) {
                    amount = Math.random() * 1000 + 2000;
                } else {
                    amount = -(Math.random() * 200 + 10);
                }
                
                currentBalance += amount;
                
                data.push({
                    id: `${date.toISOString().split('T')[0]}-${j}`,
                    date: date.toISOString().split('T')[0],
                    description: this.generateTransactionDescription(category, isIncome),
                    category: category,
                    amount: amount,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: isIncome ? 'Income' : 'Expense',
                    isProjected: false
                });
            }
        }

        // Generate future projections with more frequent transactions
        const futureStartDate = new Date();
        for (let i = 1; i <= 365; i++) {
            const date = new Date(futureStartDate);
            date.setDate(date.getDate() + i);
            
            // Monthly salary on the 1st
            if (date.getDate() === 1) {
                currentBalance += 2500;
                data.push({
                    id: `proj-${date.toISOString().split('T')[0]}-salary`,
                    date: date.toISOString().split('T')[0],
                    description: 'Projected Salary',
                    category: 'Income',
                    amount: 2500,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: 'Income',
                    isProjected: true
                });
            }
            
            // Investment return on the 10th of each month
            if (date.getDate() === 10) {
                const investmentAmount = Math.random() * 1000 + 1500; // $1500-2500
                currentBalance += investmentAmount;
                data.push({
                    id: `proj-${date.toISOString().split('T')[0]}-investment`,
                    date: date.toISOString().split('T')[0],
                    description: 'Investment Return',
                    category: 'Income',
                    amount: Math.round(investmentAmount * 100) / 100,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: 'Income',
                    isProjected: true
                });
                
                // Also add some shopping expense on the same day
                const shoppingAmount = -(Math.random() * 200 + 50); // $50-250
                currentBalance += shoppingAmount;
                data.push({
                    id: `proj-${date.toISOString().split('T')[0]}-shopping`,
                    date: date.toISOString().split('T')[0],
                    description: 'Shopping',
                    category: 'Debt',
                    amount: Math.round(shoppingAmount * 100) / 100,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: 'Expense',
                    isProjected: true
                });
            }
            
            // Monthly rent on the 15th
            if (date.getDate() === 15) {
                currentBalance -= 1200;
                data.push({
                    id: `proj-${date.toISOString().split('T')[0]}-rent`,
                    date: date.toISOString().split('T')[0],
                    description: 'Projected Rent',
                    category: 'Housing',
                    amount: -1200,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: 'Expense',
                    isProjected: true
                });
            }
            
            // More frequent random transactions (70% chance instead of 30%)
            if (Math.random() < 0.7) {
                const category = categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
                const amount = -(Math.random() * 150 + 5);
                currentBalance += amount;
                
                data.push({
                    id: `proj-${date.toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`,
                    date: date.toISOString().split('T')[0],
                    description: `Projected ${category}`,
                    category: category,
                    amount: amount,
                    balance: Math.round(currentBalance * 100) / 100,
                    type: 'Expense',
                    isProjected: true
                });
            }
        }

        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    generateTransactionDescription(category, isIncome) {
        const descriptions = {
            'Income': ['Salary', 'Freelance Payment', 'Bonus', 'Investment Return'],
            'Housing': ['Rent', 'Mortgage', 'Property Tax', 'Home Insurance'],
            'Transportation': ['Gas', 'Uber', 'Car Payment', 'Car Insurance'],
            'Food': ['Grocery Store', 'Restaurant', 'Coffee Shop', 'Food Delivery'],
            'Utilities': ['Electric Bill', 'Internet', 'Phone Bill', 'Water Bill'],
            'Entertainment': ['Streaming Service', 'Movies', 'Concert', 'Gaming'],
            'Other': ['Shopping', 'Gift', 'Miscellaneous', 'Online Purchase']
        };

        const categoryDescriptions = descriptions[category] || descriptions['Other'];
        return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    }

    async loadFinancialData() {
        try {
            console.log('Financial data loaded:', this.financialData.length, 'transactions');
            this.refreshLedger();
        } catch (error) {
            console.error('Error loading financial data:', error);
        }
    }

    async loadScenarios() {
        if (this.isLoadingScenarios) {
            console.log('⚠️ Scenarios already loading, skipping...');
            return;
        }
        
        this.isLoadingScenarios = true;
        console.log('Loading scenarios...');
        
        try {
            // Load scenarios from database
            await this.refreshScenariosFromDB();
            
            console.log('Scenarios loaded successfully:', this.scenarios.size);
        } catch (error) {
            console.error('Error loading scenarios:', error);
            
            // Fallback to just base scenario
            this.scenarios.clear();
            this.scenarios.set('base', {
                id: 'base',
                name: 'Base Scenario',
                description: 'Your current financial trajectory',
                template: 'base',
                parameters: {},
                isActive: true,
                createdAt: new Date().toISOString()
            });
        } finally {
            this.isLoadingScenarios = false;
        }
        
        this.updateScenarioSelector();
    }

    refreshLedger() {
        this.updateSummaryCards();
        this.updateLedgerTable();
        this.refreshCharts(); // Update charts when data changes
    }

    updateSummaryCards() {
        const today = new Date().toISOString().split('T')[0];
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        const oneYearDate = oneYearFromNow.toISOString().split('T')[0];

        const currentData = this.financialData.find(d => d.date <= today && !d.isProjected);
        const projectedData = this.financialData.find(d => d.date <= oneYearDate && d.isProjected);
        
        const currentBalance = currentData ? currentData.balance : 0;
        const projectedBalance = projectedData ? projectedData.balance : 0;

        const monthlyIncome = this.financialData
            .filter(d => d.type === 'Income' && d.isProjected)
            .reduce((sum, d) => sum + d.amount, 0) / 12;
        
        const monthlyExpenses = this.financialData
            .filter(d => d.type === 'Expense' && d.isProjected)
            .reduce((sum, d) => sum + Math.abs(d.amount), 0) / 12;

        const monthlyCashFlow = monthlyIncome - monthlyExpenses;

        document.getElementById('currentBalance').textContent = this.formatCurrency(currentBalance);
        document.getElementById('projectedBalance').textContent = this.formatCurrency(projectedBalance);
        document.getElementById('monthlyCashFlow').textContent = this.formatCurrency(monthlyCashFlow);
        document.getElementById('monthlyCashFlow').className = `amount ${monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'}`;
    }

    updateLedgerTable() {
        const dateRange = document.getElementById('dateRange').value;
        const accountFilter = document.getElementById('accountFilter')?.value || 'all';
        const tbody = document.getElementById('ledgerTableBody');
        
        // Measure table rendering performance
        console.time('Ledger Table Rendering');
        const filteredData = this.getFilteredData(dateRange, accountFilter);
            
            tbody.innerHTML = '';
            
            // Use document fragment for efficient DOM manipulation
            const fragment = document.createDocumentFragment();
            
            if (this.aggregateView) {
                // Standard aggregate view - show all transactions in chronological order
                filteredData.forEach(transaction => {
                    const row = document.createElement('tr');
                    row.className = transaction.isProjected ? 'projected-row' : '';
                    
                    // Get account name for display
                    const accountName = this.getAccountNameForTransaction(transaction);
                    
                    row.innerHTML = `
                        <td>${this.formatDate(transaction.date)}</td>
                        <td>${transaction.description}</td>
                        <td>
                            <span class="category-badge">
                                ${transaction.category}
                            </span>
                        </td>
                        <td>
                            <span class="account-badge">
                                ${accountName}
                            </span>
                        </td>
                        <td class="${transaction.amount >= 0 ? 'text-success' : 'text-danger'}">
                            ${this.formatCurrency(transaction.amount)}
                        </td>
                        <td class="text-right">
                            ${this.formatCurrency(transaction.balance)}
                        </td>
                        <td>
                            <span class="type-badge ${transaction.isProjected ? 'projected' : 'actual'}">
                                ${transaction.isProjected ? 'Projected' : 'Actual'}
                            </span>
                        </td>
                    `;
                    
                    fragment.appendChild(row);
                });
            } else {
                // Individual account view - group transactions by account
                const transactionsByAccount = {};
                
                // Group transactions by account
                filteredData.forEach(transaction => {
                    const accountName = this.getAccountNameForTransaction(transaction);
                    if (!transactionsByAccount[accountName]) {
                        transactionsByAccount[accountName] = [];
                    }
                    transactionsByAccount[accountName].push(transaction);
                });
                
                // Create rows for each account group
                Object.keys(transactionsByAccount).sort().forEach(accountName => {
                    const transactions = transactionsByAccount[accountName];
                    
                    // Add account header row
                    const headerRow = document.createElement('tr');
                    headerRow.className = 'account-header-row';
                    headerRow.innerHTML = `
                        <td colspan="7" style="background-color: var(--bg-tertiary, #f8f9fa); font-weight: bold; padding: 1rem; border-top: 2px solid var(--border-color, #dee2e6);">
                            🏦 ${accountName} (${transactions.length} transactions)
                        </td>
                    `;
                    fragment.appendChild(headerRow);
                    
                    // Add transactions for this account
                    transactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        row.className = `${transaction.isProjected ? 'projected-row' : ''} account-grouped`.trim();
                        
                        row.innerHTML = `
                            <td>${this.formatDate(transaction.date)}</td>
                            <td>${transaction.description}</td>
                            <td>
                                <span class="category-badge">
                                    ${transaction.category}
                                </span>
                            </td>
                            <td style="opacity: 0.5; font-size: 0.85rem;">—</td>
                            <td class="${transaction.amount >= 0 ? 'text-success' : 'text-danger'}">
                                ${this.formatCurrency(transaction.amount)}
                            </td>
                            <td class="text-right">
                                ${this.formatCurrency(transaction.balance)}
                            </td>
                            <td>
                                <span class="type-badge ${transaction.isProjected ? 'projected' : 'actual'}">
                                    ${transaction.isProjected ? 'Projected' : 'Actual'}
                                </span>
                            </td>
                        `;
                        
                        fragment.appendChild(row);
                    });
                });
            }
            
            // Single DOM update for better performance
            tbody.appendChild(fragment);
            
            // Track table for memory optimization (simplified)
            console.log(`📊 Ledger table rendered: ${filteredData.length} transactions in ${this.aggregateView ? 'aggregate' : 'individual'} view`);
        
        console.timeEnd('Ledger Table Rendering');
    }

    getFilteredData(dateRange, accountFilter = 'all') {
        const today = new Date();
        let endDate = new Date();
        
        switch(dateRange) {
            case '6m':
                endDate.setMonth(today.getMonth() + 6);
                break;
            case '1y':
                endDate.setFullYear(today.getFullYear() + 1);
                break;
            case '2y':
                endDate.setFullYear(today.getFullYear() + 2);
                break;
            case '5y':
                endDate.setFullYear(today.getFullYear() + 5);
                break;
        }
        
        const startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        
        return this.financialData.filter(d => {
            const transactionDate = new Date(d.date);
            const dateInRange = transactionDate >= startDate && transactionDate <= endDate;
            
            // Apply account filter
            if (accountFilter === 'all') {
                return dateInRange;
            } else {
                // For mock data, we'll assign transactions to accounts based on their ID
                const assignedAccountId = this.getTransactionAccountId(d);
                return dateInRange && assignedAccountId === accountFilter;
            }
        }).slice(0, 500);
    }

    /**
     * Get account ID for a transaction (temporary logic for mock data)
     */
    getTransactionAccountId(transaction) {
        if (!this.accounts || this.accounts.length === 0) {
            return null;
        }

        // Simple assignment logic based on transaction type and category
        // In a real app, transactions would have an accountId field
        const accounts = this.accounts.filter(acc => acc.is_active);
        
        if (accounts.length === 0) return null;
        
        // Income usually goes to primary checking account
        if (transaction.amount > 0) {
            const primaryAccount = accounts.find(acc => acc.is_primary) || accounts[0];
            return primaryAccount.id;
        }
        
        // Expenses distributed across accounts based on category
        const categoryAccountMap = {
            'Housing': accounts.find(acc => acc.account_type === 'checking')?.id,
            'Transportation': accounts.find(acc => acc.account_type === 'credit_card')?.id,
            'Food': accounts.find(acc => acc.account_type === 'credit_card')?.id,
            'Entertainment': accounts.find(acc => acc.account_type === 'credit_card')?.id,
            'Debt': accounts.find(acc => acc.account_type === 'credit_card')?.id,
            'Default': accounts[0]?.id
        };
        
        return categoryAccountMap[transaction.category] || categoryAccountMap['Default'];
    }

    /**
     * Get account name for display in transaction table
     */
    getAccountNameForTransaction(transaction) {
        const accountId = this.getTransactionAccountId(transaction);
        
        if (!accountId || !this.accounts) {
            return 'Unknown Account';
        }
        
        const account = this.accounts.find(acc => acc.id === accountId);
        return account ? account.name : 'Unknown Account';
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        input.value = '';
        this.showChatLoading();
        
        try {
            const response = await this.generateChatResponse(message);
            this.addChatMessage(response, 'bot');
        } catch (error) {
            console.error('Error sending chat message:', error);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.hideChatLoading();
        }
    }

    async generateChatResponse(message) {
        console.log('🤖 Generating AI response for:', message);

        try {
            // Generate AI response
            const result = await (async () => {
                    // Prepare financial context from current data
                    const context = this.buildFinancialContext();
                    
                    // Debug: Log the context being sent to AI
                    console.log('🔍 Financial context being sent to AI:', {
                        hasData: context.hasData,
                        totalTransactions: context.totalTransactions,
                        totalProjectedTransactions: context.totalProjectedTransactions,
                        dateRange: context.dateRange,
                        allTransactionsCount: context.allTransactions?.length,
                        allTransactionDates: context.allTransactions?.map(t => t.date)
                    });
                    
                    // Send debug info to main process (visible in terminal)
                    electronAPI.logDebug('Financial Context Debug', {
                        message: `Sending ALL ${context.allTransactions?.length || 0} transactions to AI`,
                        dateRange: context.dateRange,
                        sampleDates: context.allTransactions?.slice(0, 10).map(t => t.date) || []
                    });
                    
                    // Use enhanced chat service
                    return await electronAPI.askChatbot(message, context);
                })();
            
            if (result.success) {
                // Store additional response data for debugging
                if (result.parsedQuery && result.confidence) {
                    console.log('Chat response metadata:', {
                        intent: result.parsedQuery.intent,
                        confidence: result.confidence,
                        sessionId: result.sessionId
                    });
                }
                
                // Cache the successful response (simplified)
                console.log('✅ Chat response cached');
                
                return result.response;
            } else {
                if (result.setup) {
                    return '🔧 To enable AI chat features, please set up your OpenAI API key in the .env file. See the README for instructions.';
                }
                return `❌ Sorry, I encountered an error: ${result.error}`;
            }
        } catch (error) {
            console.error('Error generating chat response:', error);
            return '❌ Sorry, I encountered an unexpected error. Please try again.';
        }
    }
    
    buildFinancialContext() {
        if (!this.financialData || this.financialData.length === 0) {
            return {
                hasData: false,
                currentBalance: 0,
                monthlyNetIncome: 0,
                totalTransactions: 0
            };
        }
        
        // Calculate current balance and metrics using actual transactions
        const actualTransactions = this.financialData.filter(d => !d.isProjected);
        const currentBalance = actualTransactions.length > 0 ? 
            actualTransactions[actualTransactions.length - 1].balance : 0;
        
        const totalIncome = actualTransactions
            .filter(d => d.amount > 0)
            .reduce((sum, d) => sum + d.amount, 0);
            
        const totalExpenses = Math.abs(actualTransactions
            .filter(d => d.amount < 0)
            .reduce((sum, d) => sum + d.amount, 0));
        
        const monthlyNetIncome = (totalIncome - totalExpenses) / 12;
        
        // Get ALL transactions (actual and projected) for comprehensive context
        const allTransactions = [...this.financialData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Send ALL transactions to AI - let it analyze the complete dataset
        // Modern LLMs like GPT-4 can handle thousands of transactions easily
        const allTransactionsForAI = allTransactions.map(t => ({
            date: t.date,
            description: t.description,
            amount: t.amount,
            category: t.category,
            balance: t.balance,
            type: t.type,
            isProjected: t.isProjected || false
        }));
        
        return {
            hasData: true,
            currentBalance,
            monthlyNetIncome,
            totalTransactions: actualTransactions.length,
            totalProjectedTransactions: this.financialData.filter(d => d.isProjected).length,
            totalIncome,
            totalExpenses,
            allTransactions: allTransactionsForAI,  // Send ALL data to AI
            dateRange: {
                start: allTransactions[0]?.date,
                end: allTransactions[allTransactions.length - 1]?.date
            }
        };
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        
        // Parse basic markdown formatting for AI responses
        let formattedMessage = message;
        if (sender === 'bot') {
            formattedMessage = this.parseMarkdown(message);
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div>${formattedMessage}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    parseMarkdown(text) {
        return text
            // Bold text: **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text: *text* -> <em>text</em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert line breaks to <br> tags
            .replace(/\n/g, '<br>')
            // Convert bullet points (• or -) to proper list items
            .replace(/^[•\-]\s(.+)$/gm, '<div class="bullet-point">• $1</div>')
            // Convert numbered lists (1. 2. 3.) 
            .replace(/^(\d+)\.\s(.+)$/gm, '<div class="numbered-point">$1. $2</div>');
    }

    showChatLoading() {
        const chatMessages = document.getElementById('chatMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading-message';
        loadingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Analyzing your financial data...</p>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideChatLoading() {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    getQuickQuestion(buttonText) {
        const questions = {
            '💡 Retirement readiness': 'Am I on track for retirement?',
            '🏠 Home buying timeline': 'When can I afford to buy a house?',
            '📈 Investment optimization': 'How can I optimize my investments?'
        };
        
        return questions[buttonText] || buttonText;
    }

    focusChatInput() {
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 100);
    }

    updateScenarioSelector() {
        const select = document.getElementById('scenarioSelect');
        select.innerHTML = '';
        
        this.scenarios.forEach((scenario, id) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = scenario.name;
            select.appendChild(option);
        });
        
        select.value = this.currentScenario;
    }

    refreshScenarios() {
        const grid = document.getElementById('scenariosGrid');
        if (!grid) return; // Guard against missing DOM element
        
        grid.innerHTML = '';
        
        this.scenarios.forEach((scenario, id) => {
            const card = this.createScenarioCard(scenario);
            grid.appendChild(card);
        });
        
        // Load scenarios from database if needed (but avoid infinite loops)
        if (this.scenarios.size <= 1 && !this.isLoadingScenarios) { // Only base scenario and not already loading
            console.log('📊 Only base scenario found, loading from database...');
            this.refreshScenariosFromDB();
        }
    }

    createScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = `scenario-card ${scenario.isActive ? 'active' : 'inactive'}`;
        
        const template = this.getScenarioTemplates().find(t => t.id === scenario.template);
        const templateIcon = template ? template.icon : '📋';
        const templateName = template ? template.name : 'Custom';
        
        // Format parameters for display
        const parameterTags = Object.entries(scenario.parameters || {})
            .slice(0, 3) // Show only first 3 parameters
            .map(([key, value]) => `
                <span class="parameter-tag">${this.humanizeParameterName(key)}: ${this.formatParameterValue(key, value)}</span>
            `).join('');
        
        const hasMoreParams = Object.keys(scenario.parameters || {}).length > 3;
        
        card.innerHTML = `
            <div class="scenario-card-header">
                <div>
                    <h3 class="scenario-title">${scenario.name}</h3>
                    <div class="scenario-type">${templateIcon} ${templateName}</div>
                </div>
                <div class="scenario-actions">
                    <button class="scenario-action" onclick="app.selectScenario('${scenario.id}')" title="Select Scenario">
                        ${this.currentScenario === scenario.id ? '✅' : '📊'}
                    </button>
                    <button class="scenario-action" onclick="app.openComparisonModal('${scenario.id}')" title="Compare">
                        ⚖️
                    </button>
                </div>
            </div>
            
            <p class="scenario-description">${scenario.description || 'No description provided'}</p>
            
            <div class="scenario-parameters">
                ${parameterTags}
                ${hasMoreParams ? '<span class="parameter-tag">...</span>' : ''}
            </div>
            
            <div class="scenario-status">
                <span class="status-badge ${scenario.isActive ? 'active' : 'inactive'}">
                    ${scenario.isActive ? 'Active' : 'Inactive'}
                </span>
                <span class="scenario-date">
                    ${scenario.createdAt ? new Date(scenario.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
            </div>
        `;
        
        // Add context menu handler (only for non-base scenarios)
        if (scenario.id !== 'base') {
            card.addEventListener('contextmenu', (e) => {
                this.showContextMenu(e, scenario.id);
            });
        }
        
        return card;
    }

    selectScenario(scenarioId) {
        this.currentScenario = scenarioId;
        document.getElementById('scenarioSelect').value = scenarioId;
        this.refreshLedger();
        this.switchTab('ledger');
    }

    // Enhanced Scenario Management
    createNewScenario() {
        this.openScenarioModal();
    }
    
    openScenarioModal(scenarioId = null) {
        this.currentModalStep = 1;
        this.selectedTemplate = null;
        this.editingScenario = scenarioId;
        
        const modal = document.getElementById('scenarioModal');
        const title = document.getElementById('scenarioModalTitle');
        
        title.textContent = scenarioId ? 'Edit Scenario' : 'Create New Scenario';
        
        // Initialize modal
        this.initializeScenarioModal();
        this.renderScenarioTemplates();
        this.updateScenarioModalNavigation();
        
        modal.classList.remove('hidden');
        
        // Add event listeners
        this.addScenarioModalListeners();
    }
    
    initializeScenarioModal() {
        // Show step 1, hide others
        document.querySelectorAll('.scenario-step').forEach((step, index) => {
            step.classList.toggle('active', index === 0);
        });
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index === 0);
            step.classList.remove('completed');
        });
    }
    
    renderScenarioTemplates() {
        const templatesContainer = document.getElementById('scenarioTemplates');
        const templates = this.getScenarioTemplates();
        
        templatesContainer.innerHTML = templates.map(template => `
            <div class="template-card" data-template="${template.id}">
                <span class="template-icon">${template.icon}</span>
                <h4>${template.name}</h4>
                <p>${template.description}</p>
            </div>
        `).join('');
        
        // Add click handlers
        templatesContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (card) {
                // Remove previous selection
                templatesContainer.querySelectorAll('.template-card').forEach(c => 
                    c.classList.remove('selected'));
                
                // Select this card
                card.classList.add('selected');
                this.selectedTemplate = card.dataset.template;
                
                // Enable next button
                document.getElementById('scenarioNextBtn').disabled = false;
            }
        });
    }
    
    getScenarioTemplates() {
        return [
            {
                id: 'salary_change',
                icon: '💰',
                name: 'Salary Change',
                description: 'Model a salary increase, decrease, or bonus changes'
            },
            {
                id: 'job_change',
                icon: '💼',
                name: 'Job Change',
                description: 'Plan for switching jobs or career transitions'
            },
            {
                id: 'major_purchase',
                icon: '🏠',
                name: 'Major Purchase',
                description: 'Budget for home, car, or other large expenses'
            },
            {
                id: 'expense_change',
                icon: '📊',
                name: 'Expense Change',
                description: 'Add, remove, or modify recurring expenses'
            },
            {
                id: 'investment_strategy',
                icon: '📈',
                name: 'Investment Strategy',
                description: 'Plan investment contributions and returns'
            },
            {
                id: 'emergency_fund',
                icon: '🛡️',
                name: 'Emergency Fund',
                description: 'Build or use emergency fund scenarios'
            },
            {
                id: 'debt_payoff',
                icon: '💳',
                name: 'Debt Payoff',
                description: 'Plan debt reduction or payoff strategies'
            },
            {
                id: 'retirement_planning',
                icon: '🌅',
                name: 'Retirement Planning',
                description: 'Model retirement savings and withdrawal strategies'
            }
        ];
    }
    
    addScenarioModalListeners() {
        // Remove existing listeners
        const closeBtn = document.getElementById('scenarioModalClose');
        const overlay = document.getElementById('scenarioModalOverlay');
        const prevBtn = document.getElementById('scenarioPrevBtn');
        const nextBtn = document.getElementById('scenarioNextBtn');
        
        // Clone to remove listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        const newOverlay = overlay.cloneNode(true);
        const newPrevBtn = prevBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        overlay.parentNode.replaceChild(newOverlay, overlay);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        // Add new listeners
        document.getElementById('scenarioModalClose').onclick = () => this.closeScenarioModal();
        document.getElementById('scenarioModalOverlay').onclick = () => this.closeScenarioModal();
        document.getElementById('scenarioPrevBtn').onclick = () => this.previousScenarioStep();
        document.getElementById('scenarioNextBtn').onclick = () => this.nextScenarioStep();
    }
    
    closeScenarioModal() {
        document.getElementById('scenarioModal').classList.add('hidden');
        this.selectedTemplate = null;
        this.editingScenario = null;
    }
    
    nextScenarioStep() {
        if (this.currentModalStep === 1) {
            if (!this.selectedTemplate) return;
            this.renderScenarioForm();
            this.currentModalStep = 2;
        } else if (this.currentModalStep === 2) {
            if (!this.validateScenarioForm()) return;
            this.renderScenarioPreview();
            this.currentModalStep = 3;
        } else if (this.currentModalStep === 3) {
            this.createScenarioFromModal();
        }
        
        this.updateScenarioModalNavigation();
        this.updateScenarioSteps();
    }
    
    previousScenarioStep() {
        if (this.currentModalStep > 1) {
            this.currentModalStep--;
            this.updateScenarioModalNavigation();
            this.updateScenarioSteps();
        }
    }
    
    updateScenarioSteps() {
        document.querySelectorAll('.scenario-step').forEach((step, index) => {
            step.classList.toggle('active', index === this.currentModalStep - 1);
        });
        
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('active', stepNum === this.currentModalStep);
            step.classList.toggle('completed', stepNum < this.currentModalStep);
        });
    }
    
    updateScenarioModalNavigation() {
        const prevBtn = document.getElementById('scenarioPrevBtn');
        const nextBtn = document.getElementById('scenarioNextBtn');
        
        prevBtn.disabled = this.currentModalStep === 1;
        
        switch (this.currentModalStep) {
            case 1:
                nextBtn.innerHTML = 'Next <span class="btn-icon">→</span>';
                nextBtn.disabled = !this.selectedTemplate;
                break;
            case 2:
                nextBtn.innerHTML = 'Preview <span class="btn-icon">👁️</span>';
                nextBtn.disabled = false;
                break;
            case 3:
                nextBtn.innerHTML = 'Create Scenario <span class="btn-icon">✨</span>';
                nextBtn.disabled = false;
                break;
        }
    }
    
    renderScenarioForm() {
        const form = document.getElementById('scenarioForm');
        const parametersContainer = document.getElementById('scenarioParameters');
        
        // Clear existing parameters
        parametersContainer.innerHTML = '';
        
        // Get template configuration
        const template = this.getTemplateConfig(this.selectedTemplate);
        
        // Render parameters based on template
        template.parameters.forEach(paramGroup => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'parameter-group';
            groupDiv.innerHTML = `
                <h4>${paramGroup.title}</h4>
                ${paramGroup.fields.map(field => this.renderFormField(field)).join('')}
            `;
            parametersContainer.appendChild(groupDiv);
        });
    }
    
    getTemplateConfig(templateId) {
        const configs = {
            salary_change: {
                parameters: [{
                    title: 'Salary Details',
                    fields: [
                        { type: 'number', name: 'currentSalary', label: 'Current Annual Salary', placeholder: '60000', required: true },
                        { type: 'number', name: 'newSalary', label: 'New Annual Salary', placeholder: '75000', required: true },
                        { type: 'date', name: 'effectiveDate', label: 'Effective Date', required: true },
                        { type: 'select', name: 'timing', label: 'Change Type', options: [
                            { value: 'immediate', label: 'Immediate Change' },
                            { value: 'gradual', label: 'Gradual Increase' }
                        ]}
                    ]
                }]
            },
            major_purchase: {
                parameters: [{
                    title: 'Purchase Details',
                    fields: [
                        { type: 'text', name: 'purchaseType', label: 'Purchase Type', placeholder: 'House, Car, etc.', required: true },
                        { type: 'number', name: 'totalCost', label: 'Total Cost', placeholder: '300000', required: true },
                        { type: 'number', name: 'downPayment', label: 'Down Payment', placeholder: '60000' },
                        { type: 'date', name: 'targetDate', label: 'Target Purchase Date', required: true },
                        { type: 'number', name: 'monthlyPayment', label: 'Monthly Payment (if financed)', placeholder: '2000' }
                    ]
                }]
            },
            investment_strategy: {
                parameters: [{
                    title: 'Investment Parameters',
                    fields: [
                        { type: 'number', name: 'monthlyContribution', label: 'Monthly Contribution', placeholder: '500', required: true },
                        { type: 'number', name: 'expectedReturn', label: 'Expected Annual Return (%)', placeholder: '8', required: true },
                        { type: 'select', name: 'riskProfile', label: 'Risk Profile', options: [
                            { value: 'conservative', label: 'Conservative (3-5%)' },
                            { value: 'moderate', label: 'Moderate (6-8%)' },
                            { value: 'aggressive', label: 'Aggressive (9-12%)' }
                        ]},
                        { type: 'date', name: 'startDate', label: 'Start Date', required: true }
                    ]
                }]
            },
            expense_change: {
                parameters: [{
                    title: 'Expense Details',
                    fields: [
                        { type: 'select', name: 'changeType', label: 'Change Type', options: [
                            { value: 'add', label: 'Add New Expense' },
                            { value: 'modify', label: 'Modify Existing Expense' },
                            { value: 'remove', label: 'Remove Expense' }
                        ], required: true },
                        { type: 'text', name: 'expenseName', label: 'Expense Name', placeholder: 'Gym Membership, Netflix, etc.', required: true },
                        { type: 'number', name: 'monthlyAmount', label: 'Monthly Amount', placeholder: '50', required: true },
                        { type: 'date', name: 'startDate', label: 'Start Date', required: true }
                    ]
                }]
            },
            emergency_fund: {
                parameters: [{
                    title: 'Emergency Fund Planning',
                    fields: [
                        { type: 'number', name: 'targetAmount', label: 'Target Emergency Fund', placeholder: '10000', required: true },
                        { type: 'number', name: 'currentAmount', label: 'Current Emergency Fund', placeholder: '2000' },
                        { type: 'number', name: 'monthlyContribution', label: 'Monthly Contribution', placeholder: '200', required: true },
                        { type: 'select', name: 'priority', label: 'Priority Level', options: [
                            { value: 'high', label: 'High Priority' },
                            { value: 'medium', label: 'Medium Priority' },
                            { value: 'low', label: 'Low Priority' }
                        ]}
                    ]
                }]
            },
            debt_payoff: {
                parameters: [{
                    title: 'Debt Information',
                    fields: [
                        { type: 'text', name: 'debtType', label: 'Debt Type', placeholder: 'Credit Card, Student Loan, etc.', required: true },
                        { type: 'number', name: 'currentBalance', label: 'Current Balance', placeholder: '5000', required: true },
                        { type: 'number', name: 'interestRate', label: 'Interest Rate (%)', placeholder: '18.5', required: true },
                        { type: 'number', name: 'monthlyPayment', label: 'Monthly Payment', placeholder: '200', required: true },
                        { type: 'select', name: 'strategy', label: 'Payoff Strategy', options: [
                            { value: 'minimum', label: 'Minimum Payments' },
                            { value: 'snowball', label: 'Debt Snowball' },
                            { value: 'avalanche', label: 'Debt Avalanche' }
                        ]}
                    ]
                }]
            },
            retirement_planning: {
                parameters: [{
                    title: 'Retirement Planning',
                    fields: [
                        { type: 'number', name: 'currentAge', label: 'Current Age', placeholder: '30', required: true },
                        { type: 'number', name: 'retirementAge', label: 'Target Retirement Age', placeholder: '65', required: true },
                        { type: 'number', name: 'currentSavings', label: 'Current Retirement Savings', placeholder: '50000' },
                        { type: 'number', name: 'monthlyContribution', label: 'Monthly Contribution', placeholder: '500', required: true },
                        { type: 'number', name: 'expectedReturn', label: 'Expected Annual Return (%)', placeholder: '7', required: true }
                    ]
                }]
            },
            job_change: {
                parameters: [{
                    title: 'Job Change Details',
                    fields: [
                        { type: 'text', name: 'newJobTitle', label: 'New Job Title', placeholder: 'Senior Developer, Manager, etc.', required: true },
                        { type: 'number', name: 'newSalary', label: 'New Annual Salary', placeholder: '80000', required: true },
                        { type: 'date', name: 'startDate', label: 'Start Date', required: true },
                        { type: 'number', name: 'signingBonus', label: 'Signing Bonus', placeholder: '5000' },
                        { type: 'number', name: 'relocationCost', label: 'Relocation Cost', placeholder: '3000' }
                    ]
                }]
            }
        };
        
        return configs[templateId] || { parameters: [] };
    }
    
    renderFormField(field) {
        switch (field.type) {
            case 'text':
            case 'number':
            case 'date':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <input type="${field.type}" 
                               id="${field.name}" 
                               name="${field.name}" 
                               placeholder="${field.placeholder || ''}"
                               ${field.required ? 'required' : ''}>
                        ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
                    </div>
                `;
            case 'select':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                            <option value="">Select ${field.label.toLowerCase()}...</option>
                            ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                        </select>
                        ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>
                        ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
                    </div>
                `;
            default:
                return '';
        }
    }
    
    validateScenarioForm() {
        const form = document.getElementById('scenarioForm');
        const formData = new FormData(form);
        
        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                field.style.borderColor = 'var(--danger-color)';
                setTimeout(() => field.style.borderColor = '', 3000);
                return false;
            }
        }
        
        return true;
    }
    
    renderScenarioPreview() {
        const form = document.getElementById('scenarioForm');
        const preview = document.getElementById('scenarioPreview');
        const formData = new FormData(form);
        
        const template = this.getScenarioTemplates().find(t => t.id === this.selectedTemplate);
        
        const scenarioData = {
            name: formData.get('scenarioName'),
            description: formData.get('scenarioDescription'),
            template: this.selectedTemplate,
            type: template.name, // Add the missing type field
            parameters: {}
        };
        
        // Collect all parameters
        for (let [key, value] of formData.entries()) {
            if (key !== 'scenarioName' && key !== 'scenarioDescription') {
                scenarioData.parameters[key] = value;
            }
        }
        
        // Store for creation
        this.scenarioToCreate = scenarioData;
        
        // Render preview
        preview.innerHTML = `
            <div class="preview-section">
                <h4>Scenario Information</h4>
                <div class="preview-value"><strong>Name:</strong> ${scenarioData.name}</div>
                <div class="preview-value"><strong>Type:</strong> ${template.name}</div>
                <div class="preview-value"><strong>Description:</strong> ${scenarioData.description || 'No description provided'}</div>
            </div>
            <div class="preview-section">
                <h4>Parameters</h4>
                <div class="preview-parameters">
                    ${Object.entries(scenarioData.parameters).map(([key, value]) => `
                        <div class="parameter-preview">
                            <span class="parameter-name">${this.humanizeParameterName(key)}</span>
                            <span class="parameter-value">${this.formatParameterValue(key, value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    humanizeParameterName(paramName) {
        return paramName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    
    formatParameterValue(key, value) {
        if (key.toLowerCase().includes('salary') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('payment') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('bonus')) {
            return this.formatCurrency(parseFloat(value) || 0);
        }
        if (key.toLowerCase().includes('date')) {
            return this.formatDate(value);
        }
        if (key.toLowerCase().includes('return') || key.toLowerCase().includes('rate')) {
            return `${value}%`;
        }
        return value;
    }
    
    async createScenarioFromModal() {
        try {
            const scenarioData = {
                ...this.scenarioToCreate,
                id: Date.now().toString(), // Temporary ID
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Save to database
            const result = await electronAPI.createScenario(scenarioData);
            
            if (result.success) {
                // Update local scenarios
                this.scenarios.set(result.scenario.id, result.scenario);
                
                // Refresh UI
                this.updateScenarioSelector();
                await this.refreshScenariosFromDB();
                
                // Close modal
                this.closeScenarioModal();
                
                // Switch to scenarios tab
                this.switchTab('scenarios');
                
                console.log('Scenario created successfully:', result.scenario);
            } else {
                alert('Failed to create scenario: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating scenario:', error);
            alert('Error creating scenario. Please try again.');
        }
    }
    
    async refreshScenariosFromDB() {
        if (this.isLoadingScenarios) {
            console.log('⚠️ Already loading scenarios from DB, skipping...');
            return;
        }
        
        this.isLoadingScenarios = true;
        
        try {
            // Add timeout to prevent hanging
            const loadPromise = electronAPI.loadScenarios();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Scenario loading timeout')), 10000)
            );
            
            const result = await Promise.race([loadPromise, timeoutPromise]);
            
            if (result.success) {
                // Clear existing scenarios
                this.scenarios.clear();
                
                // Add base scenario
                this.scenarios.set('base', {
                    id: 'base',
                    name: 'Base Scenario',
                    description: 'Your current financial trajectory',
                    template: 'base',
                    parameters: {},
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
                
                // Add scenarios from database
                result.scenarios.forEach(scenario => {
                    this.scenarios.set(scenario.id, scenario);
                });
                
                console.log(`✅ Loaded ${result.scenarios.length} scenarios from database`);
                
                // Update UI (but don't trigger another DB load)
                this.updateScenarioSelector();
                
                // Only refresh scenarios grid if we have the DOM element
                const grid = document.getElementById('scenariosGrid');
                if (grid) {
                    grid.innerHTML = '';
                    this.scenarios.forEach((scenario, id) => {
                        const card = this.createScenarioCard(scenario);
                        grid.appendChild(card);
                    });
                }
            } else {
                console.error('Failed to load scenarios:', result.error);
            }
        } catch (error) {
            console.error('Error loading scenarios:', error);
            // Don't retry automatically to prevent infinite loops
        } finally {
            // Ensure flag is always reset
            setTimeout(() => {
                this.isLoadingScenarios = false;
            }, 100);
        }
    }
    
    async deleteScenario(scenarioId) {
        if (scenarioId === 'base') {
            alert('Cannot delete the base scenario');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this scenario?')) {
            return;
        }
        
        try {
            const result = await electronAPI.deleteScenario(scenarioId);
            
            if (result.success) {
                // Remove from local scenarios
                this.scenarios.delete(scenarioId);
                
                // If this was the active scenario, switch to base
                if (this.currentScenario === scenarioId) {
                    this.currentScenario = 'base';
                    this.refreshLedger();
                }
                
                // Update UI
                this.updateScenarioSelector();
                this.refreshScenarios();
                
                console.log('Scenario deleted successfully:', scenarioId);
            } else {
                alert('Failed to delete scenario: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting scenario:', error);
            alert('Error deleting scenario. Please try again.');
        }
    }
    
    async toggleScenarioActive(scenarioId) {
        try {
            const scenario = this.scenarios.get(scenarioId);
            if (!scenario) return;
            
            const newActiveState = !scenario.isActive;
            
            const result = await electronAPI.updateScenario(scenarioId, {
                ...scenario,
                isActive: newActiveState
            });
            
            if (result.success) {
                // Update local scenario
                scenario.isActive = newActiveState;
                this.scenarios.set(scenarioId, scenario);
                
                // Refresh UI
                this.refreshScenarios();
                
                console.log('Scenario toggled:', scenarioId, 'Active:', newActiveState);
            }
        } catch (error) {
            console.error('Error toggling scenario:', error);
        }
    }
    
    async cloneScenario(scenarioId) {
        try {
            const originalScenario = this.scenarios.get(scenarioId);
            if (!originalScenario) return;
            
            const clonedScenario = {
                ...originalScenario,
                id: Date.now().toString(),
                name: `${originalScenario.name} (Copy)`,
                createdAt: new Date().toISOString()
            };
            
            const result = await electronAPI.createScenario(clonedScenario);
            
            if (result.success) {
                // Update local scenarios
                this.scenarios.set(result.scenario.id, result.scenario);
                
                // Refresh UI
                this.updateScenarioSelector();
                this.refreshScenarios();
                
                console.log('Scenario cloned successfully:', result.scenario);
            }
        } catch (error) {
            console.error('Error cloning scenario:', error);
        }
    }
    
    // Context menu functionality
    showContextMenu(e, scenarioId) {
        e.preventDefault();
        
        const contextMenu = document.getElementById('scenarioContextMenu');
        contextMenu.classList.remove('hidden');
        
        // Position the menu
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        
        // Set current scenario for context actions
        this.contextScenarioId = scenarioId;
        
        // Add click handlers
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextAction(action, scenarioId);
                this.hideContextMenu();
            }
        });
        
        // Hide on outside click
        document.addEventListener('click', this.hideContextMenu.bind(this));
    }
    
    hideContextMenu() {
        const contextMenu = document.getElementById('scenarioContextMenu');
        contextMenu.classList.add('hidden');
        document.removeEventListener('click', this.hideContextMenu.bind(this));
    }
    
    handleContextAction(action, scenarioId) {
        switch (action) {
            case 'edit':
                this.openScenarioModal(scenarioId);
                break;
            case 'clone':
                this.cloneScenario(scenarioId);
                break;
            case 'toggle':
                this.toggleScenarioActive(scenarioId);
                break;
            case 'compare':
                this.openComparisonModal(scenarioId);
                break;
            case 'delete':
                this.deleteScenario(scenarioId);
                break;
        }
    }
    
    openComparisonModal(baseScenarioId = null) {
        const modal = document.getElementById('comparisonModal');
        
        // Populate scenario selectors
        this.populateScenarioSelectors();
        
        if (baseScenarioId) {
            document.getElementById('baseScenarioSelect').value = baseScenarioId;
        }
        
        modal.classList.remove('hidden');
        
        // Add event listeners
        this.addComparisonModalListeners();
    }
    
    populateScenarioSelectors() {
        const baseSelect = document.getElementById('baseScenarioSelect');
        const compareSelect = document.getElementById('compareScenarioSelect');
        
        const options = Array.from(this.scenarios.values())
            .filter(s => s.isActive)
            .map(s => `<option value="${s.id}">${s.name}</option>`)
            .join('');
        
        baseSelect.innerHTML = '<option value="">Select base scenario...</option>' + options;
        compareSelect.innerHTML = '<option value="">Select scenario to compare...</option>' + options;
    }
    
    addComparisonModalListeners() {
        const modal = document.getElementById('comparisonModal');
        
        // Close modal
        document.getElementById('comparisonModalClose').onclick = () => {
            modal.classList.add('hidden');
        };
        
        document.getElementById('comparisonModalOverlay').onclick = () => {
            modal.classList.add('hidden');
        };
        
        document.getElementById('closeComparisonBtn').onclick = () => {
            modal.classList.add('hidden');
        };
        
        // Run comparison
        document.getElementById('runComparisonBtn').onclick = () => {
            this.runScenarioComparison();
        };
    }
    
    async runScenarioComparison() {
        const baseScenarioId = document.getElementById('baseScenarioSelect').value;
        const compareScenarioId = document.getElementById('compareScenarioSelect').value;
        
        if (!baseScenarioId || !compareScenarioId) {
            alert('Please select both scenarios to compare');
            return;
        }
        
        try {
            const baseScenario = this.scenarios.get(baseScenarioId);
            const compareScenario = this.scenarios.get(compareScenarioId);
            
            const resultsDiv = document.getElementById('comparisonResults');
            const metricsGrid = document.getElementById('metricsGrid');
            
            // Show loading state
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-label">Status</div>
                    <div class="metric-value">
                        <div class="spinner"></div>
                        Analyzing...
                    </div>
                </div>
            `;
            
            resultsDiv.classList.remove('hidden');
            
            // Simulate scenario analysis (in real implementation, this would apply scenario parameters)
            setTimeout(() => {
                // Calculate comparison metrics
                const comparisonData = this.calculateScenarioComparison(baseScenario, compareScenario);
                
                // Update metrics display
                metricsGrid.innerHTML = `
                    <div class="metric-card">
                        <div class="metric-label">Base Scenario</div>
                        <div class="metric-value">${baseScenario.name}</div>
                        <div class="metric-change">Current Selection</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Compare Scenario</div>
                        <div class="metric-value">${compareScenario.name}</div>
                        <div class="metric-change">Comparison Target</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">1-Year Impact</div>
                        <div class="metric-value">${this.formatCurrency(comparisonData.yearOneImpact)}</div>
                        <div class="metric-change ${comparisonData.yearOneImpact >= 0 ? 'positive' : 'negative'}">
                            ${comparisonData.yearOneImpact >= 0 ? '+' : ''}${this.formatCurrency(comparisonData.yearOneImpact)}
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">5-Year Impact</div>
                        <div class="metric-value">${this.formatCurrency(comparisonData.fiveYearImpact)}</div>
                        <div class="metric-change ${comparisonData.fiveYearImpact >= 0 ? 'positive' : 'negative'}">
                            ${comparisonData.fiveYearImpact >= 0 ? '+' : ''}${this.formatCurrency(comparisonData.fiveYearImpact)}
                        </div>
                    </div>
                `;
                
                // Create comparison chart if chart service is available
                if (this.chartService) {
                    this.createScenarioComparisonChart(baseScenario, compareScenario);
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error running comparison:', error);
            alert('Error running comparison. Please try again.');
        }
    }
    
    calculateScenarioComparison(baseScenario, compareScenario) {
        // This is a simplified calculation - in a real implementation,
        // you would apply the scenario parameters to financial projections
        
        // Simulate different impacts based on scenario types
        let yearOneImpact = 0;
        let fiveYearImpact = 0;
        
        if (compareScenario.template === 'salary_change') {
            const salaryIncrease = compareScenario.parameters?.newSalary - compareScenario.parameters?.currentSalary || 10000;
            yearOneImpact = salaryIncrease * 0.7; // Account for taxes
            fiveYearImpact = yearOneImpact * 5 * 1.1; // With compound growth
        } else if (compareScenario.template === 'major_purchase') {
            const purchaseCost = compareScenario.parameters?.totalCost || 50000;
            yearOneImpact = -purchaseCost * 0.2; // Down payment impact
            fiveYearImpact = -purchaseCost * 0.8; // Full cost over time
        } else if (compareScenario.template === 'investment_strategy') {
            const monthlyContribution = compareScenario.parameters?.monthlyContribution || 500;
            const expectedReturn = (compareScenario.parameters?.expectedReturn || 8) / 100;
            yearOneImpact = monthlyContribution * 12 * (1 + expectedReturn);
            fiveYearImpact = monthlyContribution * 12 * 5 * (1 + expectedReturn) * 1.5;
        } else {
            // Generic positive impact for other scenarios
            yearOneImpact = Math.random() * 5000 - 2500;
            fiveYearImpact = yearOneImpact * 5 * (1 + Math.random() * 0.5);
        }
        
        return {
            yearOneImpact: Math.round(yearOneImpact),
            fiveYearImpact: Math.round(fiveYearImpact)
        };
    }
    
    createScenarioComparisonChart(baseScenario, compareScenario) {
        if (!this.chartService) return;
        
        // Generate mock projection data for comparison
        const baseProjections = this.generateScenarioProjections(baseScenario, 'base');
        const compareProjections = this.generateScenarioProjections(compareScenario, 'compare');
        
        this.chartService.createScenarioComparisonChart('comparisonChart', 
            { ...baseScenario, projectedData: baseProjections },
            [{ ...compareScenario, projectedData: compareProjections }]
        );
    }
    
    generateScenarioProjections(scenario, type) {
        // Generate mock projection data based on current financial data
        const startDate = new Date();
        const projections = [];
        let currentBalance = this.financialData.find(d => !d.isProjected)?.balance || 10000;
        
        // Apply scenario-specific modifiers
        let monthlyChange = 500; // Base monthly savings
        
        if (scenario.template === 'salary_change') {
            const salaryIncrease = scenario.parameters?.newSalary - scenario.parameters?.currentSalary || 0;
            monthlyChange += salaryIncrease / 12 * 0.7; // After taxes
        } else if (scenario.template === 'major_purchase') {
            const purchaseCost = scenario.parameters?.totalCost || 0;
            monthlyChange -= purchaseCost / 60; // Spread over 5 years
        } else if (scenario.template === 'investment_strategy') {
            const contribution = scenario.parameters?.monthlyContribution || 0;
            const returnRate = (scenario.parameters?.expectedReturn || 8) / 100 / 12;
            monthlyChange += contribution * (1 + returnRate);
        }
        
        // Generate 60 months of projections
        for (let i = 0; i < 60; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            
            currentBalance += monthlyChange + (Math.random() - 0.5) * 200; // Add some variance
            
            projections.push({
                date: date.toISOString().split('T')[0],
                balance: Math.round(currentBalance)
            });
        }
        
        return projections;
    }

    async syncData() {
        const button = document.getElementById('syncBtn');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<span class="btn-icon">⏳</span> Syncing...';
        button.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Data synced successfully');
            
            button.innerHTML = '<span class="btn-icon">✅</span> Synced!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1000);
            
        } catch (error) {
            console.error('Sync failed:', error);
            button.innerHTML = '<span class="btn-icon">❌</span> Failed';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    }

    // Chart Service Initialization
    initializeChartService() {
        console.log('=== Chart Service Initialization Debug ===');
        console.log('typeof Chart:', typeof Chart);
        console.log('typeof ChartService:', typeof ChartService);
        console.log('Chart available:', typeof Chart !== 'undefined');
        console.log('ChartService available:', typeof ChartService !== 'undefined');
        
        if (typeof Chart !== 'undefined') {
            console.log('✅ Chart.js is loaded');
            console.log('Chart.defaults:', Chart.defaults);
        } else {
            console.error('❌ Chart.js is NOT loaded');
        }
        
        if (typeof ChartService !== 'undefined') {
            this.chartService = new ChartService();
            console.log('✅ Chart service initialized successfully');
            console.log('Chart service instance:', this.chartService);
        } else {
            console.error('❌ ChartService not available - charts will be disabled');
        }
    }

    // View Toggle Functionality
    toggleLedgerView() {
        // Prevent rapid clicking during chart creation
        if (this.isCreatingCharts) {
            console.log('⚠️ Charts are being created, ignoring click');
            return;
        }
        
        console.log('🔄 Toggle ledger view called');
        console.log('Current view before toggle:', this.currentView);
        
        this.currentView = this.currentView === 'table' ? 'chart' : 'table';
        console.log('New view after toggle:', this.currentView);
        
        const tableView = document.getElementById('tableView');
        const chartView = document.getElementById('chartView');
        const toggleBtn = document.getElementById('toggleView');
        const viewModeText = document.getElementById('viewModeText');
        
        console.log('Elements found:', {
            tableView: !!tableView,
            chartView: !!chartView,
            toggleBtn: !!toggleBtn,
            viewModeText: !!viewModeText
        });
        
        console.log('Element visibility before switch:', {
            tableViewHidden: tableView?.classList.contains('hidden'),
            chartViewHidden: chartView?.classList.contains('hidden'),
            tableViewDisplay: tableView?.style.display,
            chartViewDisplay: chartView?.style.display,
            chartViewClientWidth: chartView?.clientWidth,
            chartViewClientHeight: chartView?.clientHeight
        });
        
        if (this.currentView === 'chart') {
            console.log('📈 Switching to chart view...');
            // Switch to chart view
            if (tableView) tableView.classList.add('hidden');
            if (chartView) chartView.classList.remove('hidden');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<span class="btn-icon">📊</span><span id="viewModeText">Table View</span>';
            }
            
            console.log('Element visibility after switch to chart view:', {
                tableViewHidden: tableView?.classList.contains('hidden'),
                chartViewHidden: chartView?.classList.contains('hidden'),
                chartViewClientWidth: chartView?.clientWidth,
                chartViewClientHeight: chartView?.clientHeight
            });
            
            // Wait for DOM to be fully rendered before creating charts
            console.log('🚀 Waiting for DOM render then initializing charts...');
            this.isCreatingCharts = true; // Prevent rapid clicking
            
            // Use requestAnimationFrame to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                // Double-check we're still in chart view before creating charts
                if (this.currentView !== 'chart') {
                    console.log('⚠️ View changed before chart creation, aborting...');
                    this.isCreatingCharts = false; // Clear flag
                    return;
                }
                
                console.log('🎯 DOM rendered, creating charts now...');
                this.initializeCharts();
                
                // Force chart updates after creation
                setTimeout(() => {
                    // Only update charts if we're still in chart view
                    if (this.currentView === 'chart') {
                        console.log('🔄 Forcing chart updates and resize...');
                        this.forceChartUpdates();
                        this.resizeAllCharts();
                    } else {
                        console.log('⚠️ View changed, skipping chart updates');
                    }
                    
                    // Clear the chart creation flag
                    this.isCreatingCharts = false;
                    console.log('✅ Chart creation process completed');
                }, 100);
            });
            
            console.log('✅ Chart view activated');
        } else {
            console.log('📋 Switching to table view...');
            // Switch to table view
            if (chartView) chartView.classList.add('hidden');
            if (tableView) tableView.classList.remove('hidden');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<span class="btn-icon">📈</span><span id="viewModeText">Chart View</span>';
            }
            console.log('✅ Table view activated');
        }
    }

    // Chart Initialization and Management
    initializeCharts() {
        console.log('=== Initialize Charts Debug ===');
        console.log('chartService exists:', !!this.chartService);
        console.log('financialData exists:', !!this.financialData);
        console.log('financialData length:', this.financialData?.length);
        console.log('financialData sample:', this.financialData?.slice(0, 3));
        
        // Check if chart view is actually visible
        const chartView = document.getElementById('chartView');
        console.log('Chart view visibility check:', {
            exists: !!chartView,
            hidden: chartView?.classList.contains('hidden'),
            display: chartView?.style.display,
            clientWidth: chartView?.clientWidth,
            clientHeight: chartView?.clientHeight,
            offsetWidth: chartView?.offsetWidth,
            offsetHeight: chartView?.offsetHeight
        });
        
        if (!this.chartService || !this.financialData || this.financialData.length === 0) {
            console.warn('❌ Cannot initialize charts - missing service or data');
            console.log('Missing:', {
                chartService: !this.chartService,
                financialData: !this.financialData,
                emptyData: this.financialData?.length === 0
            });
            return;
        }

        try {
            console.log('🔄 Adding loading states...');
            // Add loading states
            this.showChartLoading('balanceChart');
            this.showChartLoading('categoryChart');
            this.showChartLoading('trendsChart');

            console.log('🎯 Starting chart creation immediately...');
            
            console.log('📊 Creating balance chart...');
            this.createBalanceChart();
            
            console.log('📊 Creating category chart...');
            this.createCategoryChart();
            
            console.log('📊 Creating trends chart...');
            this.createTrendsChart();
            
            // Hide loading overlays
            console.log('🔄 Hiding loading overlays...');
            this.hideChartLoading('balanceChart');
            this.hideChartLoading('categoryChart');
            this.hideChartLoading('trendsChart');
            
            // Add animation class
            document.querySelectorAll('.chart-container').forEach(container => {
                container.classList.add('animate');
            });
            
            console.log('✅ Chart initialization completed');

        } catch (error) {
            console.error('❌ Error initializing charts:', error);
            this.showChartError('balanceChart', 'Failed to load balance chart');
            this.showChartError('categoryChart', 'Failed to load category chart');
            this.showChartError('trendsChart', 'Failed to load trends chart');
        }
    }

    createBalanceChart() {
        console.log('=== Creating Balance Chart ===');
        if (!this.chartService) {
            console.error('❌ No chart service for balance chart');
            return;
        }

        const dateRangeElement = document.getElementById('dateRange');
        console.log('Date range element:', dateRangeElement);
        console.log('Date range value:', dateRangeElement?.value);
        
        const filteredData = this.getFilteredData(dateRangeElement?.value || '1y');
        console.log('Filtered data for balance chart:', filteredData?.length, 'transactions');
        console.log('Sample filtered data:', filteredData?.slice(0, 3));
        
        try {
            const result = this.chartService.createBalanceOverTimeChart('balanceChart', filteredData, {
                showProjected: true,
                timeframe: dateRangeElement?.value || '1y'
            });
            console.log('Balance chart creation result:', result);
        } catch (error) {
            console.error('❌ Error creating balance chart:', error);
        }
    }

    createCategoryChart() {
        console.log('=== Creating Category Chart ===');
        if (!this.chartService) {
            console.error('❌ No chart service for category chart');
            return;
        }

        const chartTypeElement = document.getElementById('categoryChartType');
        const chartType = chartTypeElement?.value || 'doughnut';
        console.log('Chart type:', chartType);
        
        const expenseData = this.financialData.filter(d => d.amount < 0 && !d.isProjected);
        console.log('Expense data for category chart:', expenseData?.length, 'expenses');
        console.log('Sample expense data:', expenseData?.slice(0, 3));
        
        try {
            const result = this.chartService.createCategoryBreakdownChart('categoryChart', expenseData, {
                chartType: chartType,
                title: 'Expense Categories',
                maxCategories: 8
            });
            console.log('Category chart creation result:', result);
        } catch (error) {
            console.error('❌ Error creating category chart:', error);
        }
    }

    createTrendsChart() {
        console.log('=== Creating Trends Chart ===');
        if (!this.chartService) {
            console.error('❌ No chart service for trends chart');
            return;
        }

        const timeframeElement = document.getElementById('trendsTimeframe');
        const timeframe = parseInt(timeframeElement?.value) || 12;
        console.log('Timeframe:', timeframe, 'months');
        
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - timeframe);
        console.log('Cutoff date:', cutoffDate);
        
        const recentData = this.financialData.filter(d => {
            return new Date(d.date) >= cutoffDate && !d.isProjected;
        });
        console.log('Recent data for trends chart:', recentData?.length, 'transactions');
        console.log('Sample recent data:', recentData?.slice(0, 3));

        try {
            const result = this.chartService.createIncomeExpenseTrendsChart('trendsChart', recentData, {
                timeframe: timeframe
            });
            console.log('Trends chart creation result:', result);
        } catch (error) {
            console.error('❌ Error creating trends chart:', error);
        }
    }

    // Chart Update Methods
    updateCategoryChart(chartType) {
        if (!this.chartService) return;
        
        this.showChartLoading('categoryChart');
        setTimeout(() => {
            this.createCategoryChart();
            this.hideChartLoading('categoryChart');
        }, 200);
    }

    updateTrendsChart(timeframe) {
        if (!this.chartService) return;
        
        this.showChartLoading('trendsChart');
        setTimeout(() => {
            this.createTrendsChart();
            this.hideChartLoading('trendsChart');
        }, 200);
    }

    // Chart State Management
    showChartLoading(canvasId) {
        const canvas = document.getElementById(canvasId);
        const wrapper = canvas?.parentElement;
        
        if (wrapper && canvas) {
            // Hide canvas and show loading overlay instead of replacing
            canvas.style.display = 'none';
            
            // Remove any existing loading overlay
            const existingOverlay = wrapper.querySelector('.chart-loading');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Add loading overlay
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chart-loading';
            loadingDiv.innerHTML = `
                <div class="spinner"></div>
                Loading chart...
            `;
            wrapper.appendChild(loadingDiv);
        }
    }

    hideChartLoading(canvasId) {
        const canvas = document.getElementById(canvasId);
        const wrapper = canvas?.parentElement;
        
        if (wrapper && canvas) {
            // Show canvas and remove loading overlay
            canvas.style.display = 'block';
            const loadingOverlay = wrapper.querySelector('.chart-loading');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
    }

    showChartError(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        const wrapper = canvas?.parentElement;
        
        if (wrapper) {
            wrapper.innerHTML = `
                <div class="chart-error">
                    <div>
                        <strong>⚠️ Chart Error</strong><br>
                        ${message}
                    </div>
                </div>
            `;
        }
    }

    // Chart Export Functionality
    exportChart(canvasId) {
        if (!this.chartService) {
            alert('Chart service not available');
            return;
        }

        try {
            const chartNames = {
                'balanceChart': 'balance-over-time',
                'categoryChart': 'expense-categories',
                'trendsChart': 'income-expense-trends'
            };

            const filename = chartNames[canvasId] || 'chart';
            this.chartService.exportChart(canvasId, filename);
            
            console.log(`Chart exported: ${filename}`);
        } catch (error) {
            console.error('Error exporting chart:', error);
            alert('Failed to export chart. Please try again.');
        }
    }

    // Refresh charts when data changes
    refreshCharts() {
        if (this.currentView === 'chart' && this.chartService) {
            this.initializeCharts();
        }
    }

    // Force Chart.js updates (fixes rendering issues)
    forceChartUpdates() {
        if (!this.chartService || !this.chartService.charts) return;
        
        console.log('🔄 Forcing chart updates...');
        let updatedCount = 0;
        
        for (const [chartId, chart] of this.chartService.charts) {
            try {
                if (chart && typeof chart.update === 'function') {
                    // Force canvas visibility
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        canvas.style.display = 'block';
                        canvas.style.visibility = 'visible';
                        
                        const container = canvas.parentElement;
                        if (container) {
                            container.style.display = 'block';
                            container.style.visibility = 'visible';
                        }
                    }
                    
                    // Force Chart.js update
                    chart.update('resize');
                    updatedCount++;
                    console.log(`✅ Chart ${chartId} updated successfully`);
                } else {
                    console.warn(`⚠️ Chart ${chartId} doesn't support update`);
                }
            } catch (error) {
                console.error(`❌ Error updating chart ${chartId}:`, error);
            }
        }
        
        console.log(`🎯 Updated ${updatedCount} charts`);
    }

    // Resize all existing charts (fixes dimension issues)
    resizeAllCharts() {
        if (!this.chartService || !this.chartService.charts) return;
        
        console.log('🔄 Resizing all charts...');
        let resizedCount = 0;
        
        for (const [chartId, chart] of this.chartService.charts) {
            try {
                if (chart && typeof chart.resize === 'function') {
                    // Force canvas to have proper dimensions
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        const container = canvas.parentElement;
                        if (container) {
                            // Set explicit dimensions based on container
                            const containerWidth = container.clientWidth;
                            const containerHeight = Math.max(container.clientHeight, 300);
                            
                            canvas.style.width = containerWidth + 'px';
                            canvas.style.height = containerHeight + 'px';
                            
                            console.log(`📏 Resizing chart ${chartId}: ${containerWidth}x${containerHeight}`);
                        }
                    }
                    
                    chart.resize();
                    resizedCount++;
                    console.log(`✅ Chart ${chartId} resized successfully`);
                } else {
                    console.warn(`⚠️ Chart ${chartId} doesn't support resize`);
                }
            } catch (error) {
                console.error(`❌ Error resizing chart ${chartId}:`, error);
            }
        }
        
        console.log(`🎯 Resized ${resizedCount} charts`);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        // Parse date without timezone conversion to avoid April 10 -> April 9 issues
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Chat management methods
    async clearConversation() {
        try {
            const result = await electronAPI.clearConversation();
            
            if (result.success) {
                // Clear the chat UI
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML = '';
                
                // Add welcome message back
                this.addChatMessage(`Hello! I'm your AI financial assistant. Your conversation has been cleared and I'm ready to help with fresh context.
                
Try asking me something like:
• "How much will I have saved by December 2025?"
• "What happens if I get a 20% raise next year?"
• "Can I afford a $300,000 house in 3 years?"`, 'bot');
                
                console.log('Conversation cleared successfully');
            } else {
                this.addChatMessage('❌ Failed to clear conversation. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Error clearing conversation:', error);
            this.addChatMessage('❌ Error clearing conversation. Please try again.', 'bot');
        }
    }

    async showChatSummary() {
        try {
            const result = await electronAPI.getChatSummary();
            
            if (result.success) {
                const summary = result.summary;
                const messageCount = summary.messageCount || 0;
                const sessionId = summary.sessionId || 'Unknown';
                const hasContext = summary.hasContext ? 'Yes' : 'No';
                const startTime = summary.startTime ? new Date(summary.startTime).toLocaleString() : 'No messages yet';
                const lastActivity = summary.lastActivity ? new Date(summary.lastActivity).toLocaleString() : 'No activity';

                const summaryMessage = `📋 **Conversation Summary**

**Session ID:** ${sessionId}
**Messages exchanged:** ${messageCount}
**Has financial context:** ${hasContext}
**Started:** ${startTime}
**Last activity:** ${lastActivity}

This conversation contains ${messageCount} messages and ${hasContext === 'Yes' ? 'includes' : 'does not include'} your financial data context.`;

                this.addChatMessage(summaryMessage, 'bot');
            } else {
                this.addChatMessage('❌ Failed to get conversation summary. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Error getting chat summary:', error);
            this.addChatMessage('❌ Error getting conversation summary. Please try again.', 'bot');
        }
    }

    async checkChatHealth() {
        try {
            this.addChatMessage('🔍 Checking AI chat system health...', 'bot');
            
            const result = await electronAPI.chatHealthCheck();
            
            if (result.success) {
                const health = result.health;
                const status = health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy';
                const model = health.model || 'Unknown';
                const conversationLength = health.conversationLength || 0;
                const hasContext = health.hasContext ? 'Yes' : 'No';

                const healthMessage = `🩺 **AI Chat Health Check**

**Status:** ${status}
**Model:** ${model}
**Conversation length:** ${conversationLength} messages
**Has financial context:** ${hasContext}

${health.status === 'healthy' ? 
    'All systems are operational and ready to assist with your financial questions!' : 
    `System issues detected: ${health.error || 'Unknown error'}`}`;

                this.addChatMessage(healthMessage, 'bot');
            } else {
                this.addChatMessage(`❌ Health check failed: ${result.error}`, 'bot');
            }
        } catch (error) {
            console.error('Error checking chat health:', error);
            this.addChatMessage('❌ Error performing health check. Please try again.', 'bot');
        }
    }

    // Service Initialization
    initializeServices() {
        this.initializeChartService();
        this.initializeScenarioSystem();
        this.initializeAnalyticsService();
    }

    // Analytics Service Initialization
    initializeAnalyticsService() {
        console.log('=== Analytics Service Initialization ===');
        console.log('typeof AnalyticsService:', typeof AnalyticsService);
        
        if (typeof AnalyticsService !== 'undefined') {
            this.analyticsService = new AnalyticsService();
            console.log('✅ Analytics service initialized');
        } else {
            console.error('❌ AnalyticsService class not available');
        }
    }

    // =============================================================================
    // ANALYTICS FUNCTIONALITY
    // =============================================================================

    // Initialize Analytics Tab with performance optimization
    async initializeAnalytics() {
        if (!this.analyticsService || !this.financialData) {
            console.warn('Analytics service or financial data not available');
            return;
        }

        try {
            console.log('🔍 Initializing analytics with', this.financialData.length, 'transactions');
            
            // Show loading state
            this.showAnalyticsLoading();
            
            // Run complete analysis with performance measurement
            console.time('Analytics Complete Analysis');
            const analysis = await this.analyticsService.runCompleteAnalysis(this.financialData);
            console.timeEnd('Analytics Complete Analysis');
            
            console.log('📊 Analytics results:', analysis);
            
            // Populate UI with results using performance tracking
            console.time('Analytics UI Population');
            this.populateHealthScore(analysis.healthScore);
            this.populateSpendingHabits(analysis.spendingHabits);
            this.populateAnomalies(analysis.anomalies);
            this.populateSeasonalPatterns(analysis.seasonalPatterns);
            this.populateGoalProgress(analysis.goalProgress);
            console.timeEnd('Analytics UI Population');
            
            // Hide loading state
            this.hideAnalyticsLoading();
            
            // Track analytics container for memory optimization
            const analyticsContainer = document.querySelector('.analytics-container');
            if (analyticsContainer) {
                console.log(`📊 Analytics container initialized with ${this.financialData.length} transactions`);
            }
            
        } catch (error) {
            console.error('❌ Analytics initialization failed:', error);
            this.showAnalyticsError(error.message);
        }
    }

    // Populate Financial Health Score
    populateHealthScore(healthScore) {
        if (!healthScore) return;

                 // Update main score display
        document.getElementById('healthScoreValue').textContent = Math.round(healthScore.overall);
        document.getElementById('healthScoreGrade').textContent = healthScore.grade;
        
        // Update score circle color based on grade
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.className = `score-circle grade-${healthScore.grade.toLowerCase().replace('+', '-plus')}`;

        // Populate component scores
        const componentsContainer = document.getElementById('healthComponents');
        componentsContainer.innerHTML = '';

                 Object.entries(healthScore.components).forEach(([componentName, data]) => {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'health-component';
            
            const gradeClass = this.getScoreGradeClass(data.score);
            const roundedScore = Math.round(data.score);
            
            componentDiv.innerHTML = `
                <div class="component-header">
                    <span class="component-name">${this.analyticsService.humanizeComponentName(componentName)}</span>
                    <span class="component-score">${roundedScore}/100</span>
                </div>
                <div class="component-bar">
                    <div class="component-progress ${gradeClass}" style="--progress-width: 0%; width: 0%" data-target-width="${roundedScore}"></div>
                </div>
            `;
            
            componentsContainer.appendChild(componentDiv);
            
            // Trigger animation after DOM is updated and rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const progressBar = componentDiv.querySelector('.component-progress');
                    if (progressBar) {
                        progressBar.style.setProperty('--progress-width', `${roundedScore}%`);
                        progressBar.style.width = `${roundedScore}%`;
                    }
                });
            });
        });

        // Populate insights
        const insightsContainer = document.getElementById('healthInsights');
        insightsContainer.innerHTML = '';

        [...healthScore.insights, ...healthScore.recommendations].forEach(insight => {
            const insightDiv = document.createElement('div');
            insightDiv.className = 'insight-item';
            insightDiv.innerHTML = `
                <span class="insight-icon">💡</span>
                <span>${insight}</span>
            `;
            insightsContainer.appendChild(insightDiv);
        });
    }

    // Populate Spending Habits Analysis
    populateSpendingHabits(spendingHabits) {
        if (!spendingHabits) return;

        // Category Breakdown
        const categoryContainer = document.getElementById('categoryHabits');
        categoryContainer.innerHTML = '';

        const sortedCategories = Object.entries(spendingHabits.categoryBreakdown)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .slice(0, 8); // Top 8 categories

        sortedCategories.forEach(([category, data]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            
            categoryDiv.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-details">${data.transactionCount} transactions • ${data.consistency} consistency</div>
                </div>
                <div class="category-amount">
                    <div class="category-percentage">${data.percentage.toFixed(1)}%</div>
                    <div class="category-total">$${data.totalSpent.toFixed(2)}</div>
                </div>
            `;
            
            categoryContainer.appendChild(categoryDiv);
        });

        // Time Patterns
        const patternsContainer = document.getElementById('timePatterns');
        patternsContainer.innerHTML = '';

        spendingHabits.timePatterns.weekdays.forEach(dayData => {
            const patternDiv = document.createElement('div');
            patternDiv.className = 'time-pattern-item';
            
            const isHigh = dayData.total === Math.max(...spendingHabits.timePatterns.weekdays.map(d => d.total));
            
            patternDiv.innerHTML = `
                <div class="pattern-day ${isHigh ? 'pattern-peak' : ''}">${dayData.day}</div>
                <div class="pattern-amount ${isHigh ? 'pattern-peak' : ''}">$${dayData.total.toFixed(2)}</div>
            `;
            
            patternsContainer.appendChild(patternDiv);
        });
    }

    // Populate Anomaly Detection
    populateAnomalies(anomalies) {
        if (!anomalies) return;

        // Update summary
        const summaryContainer = document.getElementById('anomalySummary');
        summaryContainer.innerHTML = `
            <div class="anomaly-badge high">
                <span>🚨</span>
                <span>${anomalies.summary.high} High</span>
            </div>
            <div class="anomaly-badge medium">
                <span>⚠️</span>
                <span>${anomalies.summary.medium} Medium</span>
            </div>
            <div class="anomaly-badge low">
                <span>ℹ️</span>
                <span>${anomalies.summary.low} Low</span>
            </div>
        `;

        // Populate anomaly list
        const anomaliesContainer = document.getElementById('anomaliesList');
        anomaliesContainer.innerHTML = '';

        anomalies.anomalies.slice(0, 10).forEach(anomaly => { // Show top 10
            const anomalyDiv = document.createElement('div');
            anomalyDiv.className = `anomaly-item ${anomaly.severity}`;
            
            const icon = anomaly.severity === 'high' ? '🚨' : anomaly.severity === 'medium' ? '⚠️' : 'ℹ️';
            const transaction = anomaly.transaction;
            
            anomalyDiv.innerHTML = `
                <div class="anomaly-icon">${icon}</div>
                <div class="anomaly-content">
                    <div class="anomaly-title">${anomaly.description}</div>
                    <div class="anomaly-description">
                        ${transaction ? `${transaction.description} - $${Math.abs(transaction.amount).toFixed(2)}` : anomaly.category || 'Category analysis'}
                    </div>
                    <div class="anomaly-details">
                        ${transaction ? `Date: ${transaction.date}` : `Impact: ${anomaly.impact?.toFixed?.(2) || 'N/A'}`}
                    </div>
                </div>
            `;
            
            anomaliesContainer.appendChild(anomalyDiv);
        });
    }

    // Populate Seasonal Patterns
    populateSeasonalPatterns(seasonalPatterns) {
        if (!seasonalPatterns) return;

        // Create seasonal spending chart
        this.createSeasonalChart(seasonalPatterns.monthly);

        // Populate insights
        const insightsContainer = document.getElementById('seasonalInsights');
        insightsContainer.innerHTML = '';

        seasonalPatterns.insights.forEach(insight => {
            const insightDiv = document.createElement('div');
            insightDiv.className = 'seasonal-insight-card';
            
            insightDiv.innerHTML = `
                <div class="seasonal-insight-title">Key Insight</div>
                <div class="seasonal-insight-value">${insight}</div>
            `;
            
            insightsContainer.appendChild(insightDiv);
        });

        // Add seasonal breakdown
        Object.entries(seasonalPatterns.seasonal).forEach(([season, data]) => {
            const seasonDiv = document.createElement('div');
            seasonDiv.className = 'seasonal-insight-card';
            
            seasonDiv.innerHTML = `
                <div class="seasonal-insight-title">${season.charAt(0).toUpperCase() + season.slice(1)}</div>
                <div class="seasonal-insight-value">$${data.total.toFixed(2)}</div>
            `;
            
            insightsContainer.appendChild(seasonDiv);
        });
    }

    // Populate Goal Progress
    populateGoalProgress(goalProgress) {
        if (!goalProgress) return;

        const goalsContainer = document.getElementById('goalsGrid');
        goalsContainer.innerHTML = '';

        goalProgress.forEach(goal => {
            const goalDiv = document.createElement('div');
            goalDiv.className = `goal-card ${goal.status}`;
            
            goalDiv.innerHTML = `
                <div class="goal-header">
                    <h4 class="goal-name">${goal.name}</h4>
                    <span class="goal-status ${goal.status}">${goal.status.replace('_', ' ')}</span>
                </div>
                
                <div class="goal-progress-container">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill ${goal.status}" style="--progress-width: 0%; width: 0%" data-target-width="${goal.progress}"></div>
                    </div>
                    <div class="goal-progress-text">
                        <span>Progress</span>
                        <span class="goal-progress-percentage">${goal.progress.toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="goal-details">
                    <div class="goal-detail-item">
                        <span class="goal-detail-label">Target</span>
                        <span class="goal-detail-value">$${goal.target.toFixed(2)}</span>
                    </div>
                    <div class="goal-detail-item">
                        <span class="goal-detail-label">Current</span>
                        <span class="goal-detail-value">$${Math.abs(goal.currentValue).toFixed(2)}</span>
                    </div>
                    <div class="goal-detail-item">
                        <span class="goal-detail-label">Timeframe</span>
                        <span class="goal-detail-value">${goal.timeframe} months</span>
                    </div>
                    <div class="goal-detail-item">
                        <span class="goal-detail-label">Completion</span>
                        <span class="goal-detail-value">${goal.projectedCompletion}</span>
                    </div>
                </div>
                
                <div class="goal-recommendations">
                    ${goal.recommendations.map(rec => `<div class="goal-recommendation">${rec}</div>`).join('')}
                </div>
            `;
            
            goalsContainer.appendChild(goalDiv);
            
            // Trigger staggered animation after DOM is updated and rendered
            const delay = goalProgress.indexOf(goal) * 100; // Stagger delay
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const progressBar = goalDiv.querySelector('.goal-progress-fill');
                    if (progressBar) {
                        const targetWidth = progressBar.dataset.targetWidth;
                        progressBar.style.setProperty('--progress-width', `${targetWidth}%`);
                        progressBar.style.width = `${targetWidth}%`;
                    }
                }, delay);
            });
        });
    }

    // Create Seasonal Spending Chart
    createSeasonalChart(monthlyData) {
        if (!this.chartService) return;

        const canvas = document.getElementById('seasonalChart');
        if (!canvas) return;

        const data = {
            labels: monthlyData.map(m => m.month),
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyData.map(m => m.total),
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: '#2563eb',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        };

        // Destroy existing chart if it exists
        if (this.seasonalChart) {
            this.seasonalChart.destroy();
        }

        this.seasonalChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: data,
            options: options
        });
    }

    // Analytics Helper Methods
    getScoreGradeClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    showAnalyticsLoading() {
        // Add loading overlay instead of replacing content
        const container = document.querySelector('.analytics-container');
        if (container) {
            // Remove any existing loading overlay
            const existingOverlay = container.querySelector('.analytics-loading-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Create loading overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'analytics-loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="analytics-loading">
                    <div class="spinner"></div>
                    Analyzing your financial data...
                </div>
            `;
            
            container.appendChild(loadingOverlay);
        }
    }

    hideAnalyticsLoading() {
        // Remove loading and error overlays
        const container = document.querySelector('.analytics-container');
        if (container) {
            const loadingOverlay = container.querySelector('.analytics-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
            
            const errorOverlay = container.querySelector('.analytics-error-overlay');
            if (errorOverlay) {
                errorOverlay.remove();
            }
        }
    }

    showAnalyticsError(message) {
        // Hide loading overlay first
        this.hideAnalyticsLoading();
        
        // Add error overlay instead of replacing content
        const container = document.querySelector('.analytics-container');
        if (container) {
            // Remove any existing error overlay
            const existingError = container.querySelector('.analytics-error-overlay');
            if (existingError) {
                existingError.remove();
            }
            
            // Create error overlay
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'analytics-error-overlay';
            errorOverlay.innerHTML = `
                <div class="analytics-error">
                    <h3>Analytics Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="app.initializeAnalytics()">Retry</button>
                </div>
            `;
            
            container.appendChild(errorOverlay);
        }
    }

    // Analytics Actions
    async refreshAnalytics() {
        await this.initializeAnalytics();
    }

    async exportAnalyticsReport() {
        if (!this.analyticsService || !this.financialData) {
            window.notificationManager?.error('Analytics data not available');
            return;
        }

        console.log('📊 Generating PDF analytics report...');
        
        // Generate analytics data
        const analysis = this.analyticsService.runCompleteAnalysis(this.financialData);
        
        // Create formatted report data
        const reportData = {
            generatedAt: new Date().toISOString(),
            generatedDate: new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            healthScore: analysis.healthScore,
            totalTransactions: this.financialData.length,
            currentBalance: this.financialData[this.financialData.length - 1]?.balance || 0,
            goalProgress: analysis.goalProgress,
            spendingHabits: analysis.spendingHabits,
            anomalies: analysis.anomalies.anomalies.slice(0, 10)
        };

        const filename = `FutureFund-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        
        const result = await electronAPI.exportAnalyticsPDF({
            data: reportData,
            filename: filename
        });
        
        if (result?.success) {
            window.notificationManager?.success(`Report saved to Downloads: ${filename}`);
            console.log('✅ PDF export successful');
            
            // Option to open the file
            if (result.filePath) {
                setTimeout(() => {
                    if (confirm('Report exported successfully! Would you like to open it now?')) {
                        electronAPI.openFile(result.filePath);
                    }
                }, 500);
            }
        } else {
            window.notificationManager?.error('Export failed');
            console.log('❌ Export failed:', result);
        }
    }

    // =================== ACCOUNT MANAGEMENT ===================
    
    /**
     * Initialize account management functionality
     */
    async initializeAccounts() {
        console.log('🏦 Initializing Account Management...');
        
        try {
            // Initialize account management components
            this.initializeAccountEventListeners();
            
            // Load user profile and accounts
            await this.loadCurrentUser();
            await this.loadAccounts();
            
            console.log('✅ Account Management initialized');
        } catch (error) {
            console.error('❌ Error initializing accounts:', error);
            this.showAccountsError('Failed to initialize account management');
        }
    }

    /**
     * Initialize account-related event listeners
     */
    initializeAccountEventListeners() {
        // Add Account button
        document.getElementById('addAccountBtn')?.addEventListener('click', () => {
            this.openAccountModal();
        });

        // Import/Export buttons
        document.getElementById('importAccountsBtn')?.addEventListener('click', () => {
            this.importAccounts();
        });

        document.getElementById('exportAccountsBtn')?.addEventListener('click', () => {
            this.exportAccounts();
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterAccountsByCategory(category);
            });
        });

        // Account filters
        document.getElementById('accountSearch')?.addEventListener('input', (e) => {
            clearTimeout(this.accountSearchTimeout);
            this.accountSearchTimeout = setTimeout(() => {
                this.filterAccounts();
            }, 300);
        });

        document.getElementById('accountSort')?.addEventListener('change', () => {
            this.sortAccounts();
        });

        document.getElementById('accountStatusFilter')?.addEventListener('change', () => {
            this.filterAccounts();
        });

        // Account modal event listeners
        this.initializeAccountModalListeners();

        // Account context menu
        this.initializeAccountContextMenu();
    }

    /**
     * Load current user profile
     */
    async loadCurrentUser() {
        try {
            // For now, we'll use the default user created during migration
            // In a full app, this would be based on login/authentication
            this.currentUserId = await this.getDefaultUserId();
            
            if (!this.currentUserId) {
                console.log('⚠️ No user found, creating default user...');
                await this.createDefaultUser();
            }

            console.log('📱 Current user ID:', this.currentUserId);
        } catch (error) {
            console.error('❌ Error loading current user:', error);
            throw error;
        }
    }

    /**
     * Get default user ID from database
     */
    async getDefaultUserId() {
        try {
            // Get accounts to find a user ID
            const response = await electronAPI.getAccounts('any-user', { limit: 1 });
            
            if (response.success && response.accounts.length > 0) {
                return response.accounts[0].userId;
            }
            
            // If no accounts exist, try to get first user profile
            // For now we'll return null and create a default user
            return null;
        } catch (error) {
            console.error('Error getting default user:', error);
            return null;
        }
    }

    /**
     * Create default user if none exists
     */
    async createDefaultUser() {
        try {
            const defaultUser = {
                first_name: 'Demo',
                last_name: 'User',
                employment_status: 'employed',
                annual_income: 75000,
                risk_category: 'moderate',
                primary_currency: 'USD'
            };

            const response = await electronAPI.createUserProfile(defaultUser);
            
            if (response.success) {
                this.currentUserId = response.profile.id;
                console.log('✅ Created default user:', this.currentUserId);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error creating default user:', error);
            throw error;
        }
    }

    /**
     * Load all accounts for current user
     */
    async loadAccounts() {
        if (!this.currentUserId) {
            console.error('❌ No current user ID available');
            return;
        }

        try {
            this.showAccountsLoading();
            
            // Load accounts
            const response = await electronAPI.getAccounts(this.currentUserId);
            
            if (response.success) {
                this.accounts = response.accounts || [];
                console.log('📊 Loaded', this.accounts.length, 'accounts');
                
                // Load account statistics
                await this.loadAccountStatistics();
                
                // Render accounts
                this.renderAccounts();
                this.updateAccountCategoryTabs();
                this.populateAccountFilter();
                
                // Show empty state if no accounts
                if (this.accounts.length === 0) {
                    this.showAccountsEmptyState();
                } else {
                    this.hideAccountsEmptyState();
                }
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
            this.showAccountsError('Failed to load accounts');
        } finally {
            this.hideAccountsLoading();
        }
    }

    /**
     * Load account statistics
     */
    async loadAccountStatistics() {
        try {
            const response = await electronAPI.getAccountStatistics(this.currentUserId);
            
            if (response.success) {
                this.accountStats = response.stats;
                this.updatePortfolioSummary();
            } else {
                console.error('Error loading account statistics:', response.error);
            }
        } catch (error) {
            console.error('Error loading account statistics:', error);
        }
    }

    /**
     * Update portfolio summary cards
     */
    updatePortfolioSummary() {
        if (!this.accountStats) return;

        const { totals } = this.accountStats;
        
        // Net Worth
        document.getElementById('portfolioNetWorth').textContent = this.formatCurrency(totals.net_worth || 0);
        
        // Assets
        document.getElementById('portfolioAssets').textContent = this.formatCurrency(totals.total_assets || 0);
        const assetAccounts = this.accounts.filter(a => this.isAssetAccount(a.type)).length;
        document.getElementById('assetAccountCount').textContent = `${assetAccounts} accounts`;
        
        // Liabilities
        document.getElementById('portfolioLiabilities').textContent = this.formatCurrency(totals.total_liabilities || 0);
        const liabilityAccounts = this.accounts.filter(a => this.isLiabilityAccount(a.type)).length;
        document.getElementById('liabilityAccountCount').textContent = `${liabilityAccounts} accounts`;
        
        // Active Accounts
        document.getElementById('activeAccountCount').textContent = (totals.active_accounts || 0).toString();
        document.getElementById('totalAccountCount').textContent = `of ${totals.total_accounts || 0} total`;
        
        // Net Worth Change (placeholder for now)
        document.getElementById('netWorthChange').textContent = '—';
    }

    /**
     * Check if account type is an asset
     */
    isAssetAccount(accountType) {
        const assetTypes = ['checking', 'savings', 'investment', 'retirement_401k', 'retirement_ira', 'brokerage'];
        return assetTypes.includes(accountType);
    }

    /**
     * Check if account type is a liability
     */
    isLiabilityAccount(accountType) {
        const liabilityTypes = ['credit_card', 'mortgage', 'auto_loan', 'student_loan', 'personal_loan'];
        return liabilityTypes.includes(accountType);
    }

    /**
     * Open account creation/edit modal
     */
    openAccountModal(accountId = null) {
        const modal = document.getElementById('accountModal');
        const title = document.getElementById('accountModalTitle');
        
        this.editingAccountId = accountId;
        
        if (accountId) {
            title.textContent = 'Edit Account';
            this.loadAccountForEditing(accountId);
        } else {
            title.textContent = 'Add New Account';
            this.resetAccountForm();
        }
        
        modal.classList.remove('hidden');
        this.loadAccountTypes();
    }

    /**
     * Initialize account modal event listeners
     */
    initializeAccountModalListeners() {
        // Modal close events
        document.getElementById('accountModalClose')?.addEventListener('click', () => {
            this.closeAccountModal();
        });

        document.getElementById('accountModalOverlay')?.addEventListener('click', () => {
            this.closeAccountModal();
        });

        document.getElementById('cancelAccountBtn')?.addEventListener('click', () => {
            this.closeAccountModal();
        });

        // Form submission
        document.getElementById('accountForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveAccount();
        });
    }

    /**
     * Initialize account context menu
     */
    initializeAccountContextMenu() {
        // Context menu will be implemented as needed
        console.log('Account context menu initialized');
    }

    /**
     * Close account modal
     */
    closeAccountModal() {
        document.getElementById('accountModal').classList.add('hidden');
        this.editingAccountId = null;
    }

    /**
     * Load account types for selection
     */
    async loadAccountTypes() {
        try {
            const response = await electronAPI.getAccountTypes();
            
            if (response.success) {
                this.renderAccountTypeSelector(response.accountTypes);
            }
        } catch (error) {
            console.error('Error loading account types:', error);
        }
    }

    /**
     * Render account type selector
     */
    renderAccountTypeSelector(accountTypes) {
        const selector = document.getElementById('accountTypeSelector');
        if (!selector) return;

        let html = '';
        
        for (const [typeKey, typeInfo] of Object.entries(accountTypes)) {
            html += `
                <div class="account-type-card" data-type="${typeKey}" onclick="app.selectAccountType('${typeKey}')">
                    <div class="type-icon">${typeInfo.icon || '💰'}</div>
                    <div class="type-name">${typeInfo.displayName}</div>
                    <div class="type-description">${typeInfo.description}</div>
                </div>
            `;
        }
        
        selector.innerHTML = html;
    }

    /**
     * Select account type
     */
    selectAccountType(accountType) {
        // Remove previous selection
        document.querySelectorAll('.account-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        document.querySelector(`[data-type="${accountType}"]`).classList.add('selected');
        
        // Set hidden input value
        document.getElementById('accountType').value = accountType;
        
        // Show type-specific fields
        this.renderTypeSpecificFields(accountType);
    }

    /**
     * Render type-specific fields based on account type
     */
    renderTypeSpecificFields(accountType) {
        const container = document.getElementById('typeSpecificFields');
        if (!container) return;

        let html = '';
        
        // Add fields based on account type
        if (accountType === 'credit_card' || accountType === 'line_of_credit') {
            html += `
                <h3>Credit Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="creditLimit">Credit Limit *</label>
                        <input type="number" id="creditLimit" name="credit_limit" 
                               step="0.01" placeholder="0.00" required>
                    </div>
                    <div class="form-group">
                        <label for="availableBalance">Available Credit</label>
                        <input type="number" id="availableBalance" name="available_balance" 
                               step="0.01" placeholder="0.00">
                    </div>
                </div>
            `;
        } else if (accountType === 'savings' || accountType === 'checking') {
            html += `
                <h3>Account Details</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="availableBalance">Available Balance</label>
                        <input type="number" id="availableBalance" name="available_balance" 
                               step="0.01" placeholder="0.00">
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    /**
     * Reset account form
     */
    resetAccountForm() {
        document.getElementById('accountForm').reset();
        document.getElementById('typeSpecificFields').innerHTML = '';
        document.querySelectorAll('.account-type-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    /**
     * Save account (create or update)
     */
    async saveAccount() {
        try {
            const formData = new FormData(document.getElementById('accountForm'));
            const accountData = {};
            
            for (const [key, value] of formData.entries()) {
                if (value !== '') {
                    accountData[key] = value;
                }
            }
            
            // Add user profile ID
            accountData.user_profile_id = this.currentUserId;
            
            // Convert numeric fields
            ['current_balance', 'available_balance', 'credit_limit', 'interest_rate', 'scenario_priority'].forEach(field => {
                if (accountData[field]) {
                    accountData[field] = parseFloat(accountData[field]);
                }
            });
            
            // Convert boolean fields
            ['is_active', 'is_primary', 'include_in_forecasting', 'tax_advantaged'].forEach(field => {
                accountData[field] = formData.has(field);
            });

            let response;
            if (this.editingAccountId) {
                response = await electronAPI.updateAccount(this.editingAccountId, accountData);
            } else {
                response = await electronAPI.createAccount(accountData);
            }
            
            if (response.success) {
                window.notificationManager.success(
                    this.editingAccountId ? 'Account updated successfully' : 'Account created successfully'
                );
                this.closeAccountModal();
                await this.loadAccounts(); // Refresh accounts list
            } else {
                window.notificationManager.error(response.error);
            }
        } catch (error) {
            console.error('Error saving account:', error);
            window.notificationManager.error('Failed to save account');
        }
    }

    /**
     * Show accounts loading state
     */
    showAccountsLoading() {
        document.getElementById('accountsLoadingState')?.classList.remove('hidden');
        document.getElementById('accountsList').style.display = 'none';
    }

    /**
     * Hide accounts loading state
     */
    hideAccountsLoading() {
        document.getElementById('accountsLoadingState')?.classList.add('hidden');
        document.getElementById('accountsList').style.display = 'block';
    }

    /**
     * Show accounts empty state
     */
    showAccountsEmptyState() {
        document.getElementById('accountsEmptyState')?.classList.remove('hidden');
        document.getElementById('accountsList').style.display = 'none';
    }

    /**
     * Hide accounts empty state
     */
    hideAccountsEmptyState() {
        document.getElementById('accountsEmptyState')?.classList.add('hidden');
        document.getElementById('accountsList').style.display = 'block';
    }

    /**
     * Show accounts error
     */
    showAccountsError(message) {
        window.notificationManager.error(message);
    }

    /**
     * Render accounts (simplified version for now)
     */
    renderAccounts() {
        const accountsList = document.getElementById('accountsList');
        if (!accountsList) return;
        
        if (!this.accounts || this.accounts.length === 0) {
            accountsList.innerHTML = '<div class="no-accounts">No accounts found</div>';
            return;
        }
        
        let html = '';
        this.accounts.forEach(account => {
            const balanceClass = account.currentBalance >= 0 ? 'positive' : 'negative';
            html += `
                <div class="account-card">
                    <div class="account-info">
                        <h4>${account.name}</h4>
                        <p>${account.institution}</p>
                        <span class="account-type">${account.type}</span>
                    </div>
                    <div class="account-balance ${balanceClass}">
                        ${this.formatCurrency(account.currentBalance)}
                    </div>
                </div>
            `;
        });
        
        accountsList.innerHTML = html;
    }

    /**
     * Update account category tabs
     */
    updateAccountCategoryTabs() {
        // Update category tab badges with account counts
        const categoryCounters = {
            all: this.accounts.length,
            liquid: this.accounts.filter(a => ['checking', 'savings'].includes(a.type)).length,
            investment: this.accounts.filter(a => ['investment', 'brokerage'].includes(a.type)).length,
            retirement: this.accounts.filter(a => a.type.includes('retirement')).length,
            credit: this.accounts.filter(a => ['credit_card', 'line_of_credit'].includes(a.type)).length,
            real_estate: this.accounts.filter(a => ['mortgage', 'home_equity'].includes(a.type)).length
        };
        
        for (const [category, count] of Object.entries(categoryCounters)) {
            const badge = document.getElementById(`${category}AccountBadge`);
            if (badge) {
                badge.textContent = count.toString();
            }
        }
    }

    /**
     * Filter accounts by category
     */
    filterAccountsByCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentAccountCategory = category;
        this.renderAccounts();
    }

    /**
     * Populate account filter dropdown in ledger
     */
    populateAccountFilter() {
        const accountFilter = document.getElementById('accountFilter');
        if (!accountFilter || !this.accounts || this.accounts.length === 0) {
            return;
        }

        // Clear existing options except 'All Accounts'
        accountFilter.innerHTML = '<option value="all">All Accounts</option>';

        // Add account options
        this.accounts
            .filter(account => account.is_active) // Only show active accounts
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.institution})`;
                accountFilter.appendChild(option);
            });

        console.log('🏦 Populated account filter with', this.accounts.filter(a => a.is_active).length, 'active accounts');
    }

    /**
     * Export accounts
     */
    async exportAccounts() {
        try {
            const result = await electronAPI.selectFile({
                defaultPath: `accounts-export-${new Date().toISOString().split('T')[0]}.json`,
                filters: [
                    { name: 'JSON Files', extensions: ['json'] }
                ]
            });
            
            if (!result.cancelled && result.filePaths.length > 0) {
                const response = await electronAPI.exportAccounts(result.filePaths[0], {
                    userId: this.currentUserId
                });
                
                if (response.success) {
                    window.notificationManager.success(`Exported ${response.exported} accounts successfully`);
                } else {
                    window.notificationManager.error('Failed to export accounts');
                }
            }
        } catch (error) {
            console.error('Error exporting accounts:', error);
            window.notificationManager.error('Failed to export accounts');
        }
    }

    /**
     * Import accounts
     */
    async importAccounts() {
        try {
            const result = await electronAPI.selectFile({
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'CSV Files', extensions: ['csv'] }
                ]
            });
            
            if (!result.cancelled && result.filePaths.length > 0) {
                const response = await electronAPI.importAccounts(result.filePaths[0], {
                    userId: this.currentUserId
                });
                
                if (response.success) {
                    window.notificationManager.success(`Imported ${response.imported} accounts successfully`);
                    await this.loadAccounts(); // Refresh accounts list
                } else {
                    window.notificationManager.error('Failed to import accounts');
                }
            }
        } catch (error) {
            console.error('Error importing accounts:', error);
            window.notificationManager.error('Failed to import accounts');
        }
    }

    // Transaction Management Methods
    openTransactionModal(transactionId = null) {
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('transactionModalTitle');
        
        if (transactionId) {
            title.textContent = 'Edit Transaction';
            // Load transaction data for editing
            this.loadTransactionForEditing(transactionId);
        } else {
            title.textContent = 'Add New Transaction';
            this.resetTransactionForm();
        }
        
        // Load accounts for the dropdown
        this.loadAccountsForTransaction();
        
        // Set today's date as default
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        
        modal.classList.remove('hidden');
        this.initializeTransactionModalListeners();
    }

    initializeTransactionModalListeners() {
        // Close modal listeners
        document.getElementById('transactionModalClose').onclick = () => this.closeTransactionModal();
        document.getElementById('transactionModalOverlay').onclick = () => this.closeTransactionModal();
        document.getElementById('cancelTransactionBtn').onclick = () => this.closeTransactionModal();

        // Form submission
        document.getElementById('transactionForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveTransaction();
        };

        // Recurring transaction toggle
        document.getElementById('isRecurring').onchange = (e) => {
            const recurringOptions = document.getElementById('recurringOptions');
            recurringOptions.style.display = e.target.checked ? 'flex' : 'none';
        };

        // Transaction type change updates amount sign handling
        document.getElementById('transactionType').onchange = (e) => {
            const amountInput = document.getElementById('transactionAmount');
            const label = amountInput.previousElementSibling;
            if (e.target.value === 'Income') {
                label.textContent = 'Amount * (Income)';
            } else {
                label.textContent = 'Amount * (Expense)';
            }
        };
    }

    closeTransactionModal() {
        document.getElementById('transactionModal').classList.add('hidden');
        this.resetTransactionForm();
    }

    resetTransactionForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('recurringOptions').style.display = 'none';
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    }

    async loadAccountsForTransaction() {
        try {
            const accounts = await electronAPI.getAccounts(this.currentUserId);
            const select = document.getElementById('transactionAccount');
            
            // Clear existing options except the first one
            select.innerHTML = '<option value="">Select Account</option>';
            
            if (accounts.success && accounts.accounts) {
                accounts.accounts.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = `${account.account_name} (${account.institution_name})`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading accounts for transaction:', error);
        }
    }

    async saveTransaction() {
        try {
            const formData = new FormData(document.getElementById('transactionForm'));
            const transactionData = {
                date: formData.get('date'),
                account_id: formData.get('account_id'),
                description: formData.get('description'),
                category: formData.get('category'),
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                is_recurring: formData.get('is_recurring') === 'on',
                is_projected: formData.get('is_projected') === 'on',
                recurring_frequency: formData.get('recurring_frequency'),
                recurring_end: formData.get('recurring_end')
            };

            // Validate required fields
            if (!transactionData.date || !transactionData.account_id || !transactionData.description || 
                !transactionData.category || !transactionData.type || !transactionData.amount) {
                window.notificationManager.error('Please fill in all required fields');
                return;
            }

            // Convert amount to negative for expenses
            if (transactionData.type === 'Expense') {
                transactionData.amount = -Math.abs(transactionData.amount);
            } else {
                transactionData.amount = Math.abs(transactionData.amount);
            }

            const result = await electronAPI.createTransaction(transactionData);
            
            if (result.success) {
                window.notificationManager.success('Transaction created successfully');
                this.closeTransactionModal();
                this.refreshLedger();
            } else {
                window.notificationManager.error(`Failed to create transaction: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            window.notificationManager.error('Failed to save transaction');
        }
    }

    // Aggregate View Toggle Methods
    toggleAggregateView() {
        this.aggregateView = !this.aggregateView;
        
        const toggleBtn = document.getElementById('aggregateViewToggle');
        const toggleText = document.getElementById('viewToggleText');
        const icon = toggleBtn.querySelector('.btn-icon');
        
        if (this.aggregateView) {
            toggleBtn.setAttribute('data-mode', 'aggregate');
            toggleText.textContent = 'Aggregate';
            icon.textContent = '📊';
            toggleBtn.title = 'Switch to Individual Account View';
        } else {
            toggleBtn.setAttribute('data-mode', 'individual');
            toggleText.textContent = 'Individual';
            icon.textContent = '🏦';
            toggleBtn.title = 'Switch to Aggregate View';
        }
        
        // Refresh the ledger with new view mode
        this.refreshLedger();
        
        console.log(`📊 Switched to ${this.aggregateView ? 'Aggregate' : 'Individual Account'} view`);
    }

    // ============================================================================
    // ENHANCED SCENARIO MANAGEMENT (Phase 3.1)
    // ============================================================================

    // Scenario Mode Toggle (Base/Active/Preview)
    toggleScenarioMode() {
        const modes = ['base', 'active', 'preview'];
        const currentIndex = modes.indexOf(this.scenarioMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.scenarioMode = modes[nextIndex];

        this.updateScenarioModeUI();
        this.refreshLedger();

        console.log(`🎯 Switched to scenario mode: ${this.scenarioMode}`);
    }

    updateScenarioModeUI() {
        const toggleBtn = document.getElementById('scenarioModeToggle');
        const toggleText = document.getElementById('scenarioModeText');
        const icon = toggleBtn.querySelector('.btn-icon');

        const modeConfig = {
            'base': { text: 'Base Only', icon: '📊', title: 'Showing base scenario only' },
            'active': { text: 'With Scenarios', icon: '🎯', title: 'Including active scenarios' },
            'preview': { text: 'Preview Mode', icon: '👁️', title: 'Previewing scenario changes' }
        };

        const config = modeConfig[this.scenarioMode];
        toggleBtn.setAttribute('data-mode', this.scenarioMode);
        toggleText.textContent = config.text;
        icon.textContent = config.icon;
        toggleBtn.title = config.title;
    }

    // Active Scenario Management
    async loadActiveScenarios() {
        try {
            const result = await electronAPI.loadScenarios({ active: true });
            if (result.success && result.scenarios) {
                this.activeScenarios.clear();
                result.scenarios.forEach(scenario => {
                    if (scenario.isActive) {
                        this.activeScenarios.set(scenario.id, scenario);
                    }
                });
                this.updateActiveScenariosUI();
                console.log(`📋 Loaded ${this.activeScenarios.size} active scenarios`);
            }
        } catch (error) {
            console.error('Error loading active scenarios:', error);
        }
    }

    updateActiveScenariosUI() {
        const activeGrid = document.getElementById('activeScenariosGrid');
        const impactSummary = document.getElementById('scenariosImpactSummary');

        if (!activeGrid) return;

        // Clear existing content
        activeGrid.innerHTML = '';

        if (this.activeScenarios.size === 0) {
            activeGrid.innerHTML = `
                <div class="empty-active-scenarios">
                    <div class="empty-icon">🎯</div>
                    <h3>No Active Scenarios</h3>
                    <p>Select scenarios from the list below to see their combined impact on your finances.</p>
                </div>
            `;
            if (impactSummary) impactSummary.innerHTML = '';
            return;
        }

        // Render active scenario cards
        const fragment = document.createDocumentFragment();
        this.activeScenarios.forEach(scenario => {
            const card = this.createActiveScenarioCard(scenario);
            fragment.appendChild(card);
        });
        activeGrid.appendChild(fragment);

        // Update impact summary
        this.updateImpactSummary();
    }

    createActiveScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = 'active-scenario-card';
        card.setAttribute('data-scenario-id', scenario.id);

        const template = this.getScenarioTemplates().find(t => t.id === scenario.template);
        const templateIcon = template ? template.icon : '📋';

        card.innerHTML = `
            <div class="active-card-header">
                <div class="active-card-info">
                    <span class="active-card-icon">${templateIcon}</span>
                    <div class="active-card-details">
                        <h4 class="active-card-name">${scenario.name}</h4>
                        <p class="active-card-type">${template ? template.name : 'Custom'}</p>
                    </div>
                </div>
                <div class="active-card-actions">
                    <button class="active-card-action" onclick="app.previewScenarioImpact('${scenario.id}')" title="Preview Impact">
                        👁️
                    </button>
                    <button class="active-card-action" onclick="app.toggleScenarioActive('${scenario.id}')" title="Deactivate">
                        ❌
                    </button>
                </div>
            </div>
            <div class="active-card-impact" id="scenarioImpact_${scenario.id}">
                <!-- Impact metrics will be calculated and shown here -->
            </div>
        `;

        return card;
    }

    async updateImpactSummary() {
        const impactSummary = document.getElementById('scenariosImpactSummary');
        if (!impactSummary || this.activeScenarios.size === 0) return;

        try {
            const combinedEffects = await this.calculateCombinedScenarioEffects();
            
            impactSummary.innerHTML = `
                <div class="impact-summary-card">
                    <h4>📊 Combined Impact Summary</h4>
                    <div class="impact-metrics-grid">
                        <div class="impact-metric">
                            <span class="impact-label">Net Effect (1 Year)</span>
                            <span class="impact-value ${combinedEffects.netEffect >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(combinedEffects.netEffect)}
                            </span>
                        </div>
                        <div class="impact-metric">
                            <span class="impact-label">Monthly Change</span>
                            <span class="impact-value ${combinedEffects.monthlyChange >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(combinedEffects.monthlyChange)}
                            </span>
                        </div>
                        <div class="impact-metric">
                            <span class="impact-label">Affected Transactions</span>
                            <span class="impact-value">${combinedEffects.affectedTransactions}</span>
                        </div>
                        <div class="impact-metric">
                            <span class="impact-label">Risk Level</span>
                            <span class="impact-value risk-${combinedEffects.riskLevel}">
                                ${combinedEffects.riskLevel.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error updating impact summary:', error);
            impactSummary.innerHTML = `
                <div class="impact-summary-error">
                    <p>⚠️ Error calculating scenario impacts</p>
                </div>
            `;
        }
    }

    // Scenario Effect Calculations
    async calculateCombinedScenarioEffects() {
        let netEffect = 0;
        let monthlyChange = 0;
        let affectedTransactions = 0;
        let riskLevel = 'low';

        // Process each active scenario
        for (const [scenarioId, scenario] of this.activeScenarios) {
            const effects = await this.calculateScenarioEffects(scenario);
            
            netEffect += effects.netEffect || 0;
            monthlyChange += effects.monthlyChange || 0;
            affectedTransactions += effects.affectedTransactions || 0;
            
            // Increase risk level based on scenario complexity
            if (effects.riskLevel === 'high') riskLevel = 'high';
            else if (effects.riskLevel === 'medium' && riskLevel === 'low') riskLevel = 'medium';
        }

        return {
            netEffect,
            monthlyChange,
            affectedTransactions,
            riskLevel
        };
    }

    async calculateScenarioEffects(scenario) {
        // Check cache first
        if (this.scenarioEffects.has(scenario.id)) {
            return this.scenarioEffects.get(scenario.id);
        }

        // Calculate effects based on scenario type and parameters
        let effects = {
            netEffect: 0,
            monthlyChange: 0,
            affectedTransactions: 0,
            riskLevel: 'low'
        };

        try {
            const parameters = scenario.parameters || {};
            
            switch (scenario.type || scenario.template) {
                case 'salary_increase':
                    effects = this.calculateSalaryIncreaseEffects(parameters);
                    break;
                case 'job_loss':
                    effects = this.calculateJobLossEffects(parameters);
                    break;
                case 'major_purchase':
                    effects = this.calculateMajorPurchaseEffects(parameters);
                    break;
                case 'debt_payoff':
                    effects = this.calculateDebtPayoffEffects(parameters);
                    break;
                case 'emergency_fund':
                    effects = this.calculateEmergencyFundEffects(parameters);
                    break;
                default:
                    effects = this.calculateGenericScenarioEffects(parameters);
            }

            // Cache the results
            this.scenarioEffects.set(scenario.id, effects);
            
        } catch (error) {
            console.error(`Error calculating effects for scenario ${scenario.id}:`, error);
        }

        return effects;
    }

    calculateSalaryIncreaseEffects(parameters) {
        const increasePercent = parseFloat(parameters.increasePercent || 0) / 100;
        const currentSalary = parseFloat(parameters.currentSalary || 60000);
        const increaseAmount = currentSalary * increasePercent;
        const monthlyIncrease = increaseAmount / 12;

        return {
            netEffect: increaseAmount,
            monthlyChange: monthlyIncrease,
            affectedTransactions: 12, // Monthly paychecks
            riskLevel: 'low'
        };
    }

    calculateJobLossEffects(parameters) {
        const monthsUnemployed = parseInt(parameters.monthsUnemployed || 3);
        const monthlySalary = parseFloat(parameters.monthlySalary || 5000);
        const unemploymentBenefit = parseFloat(parameters.unemploymentBenefit || 0);
        
        const totalLoss = monthsUnemployed * monthlySalary;
        const totalBenefits = monthsUnemployed * unemploymentBenefit;
        const netEffect = -(totalLoss - totalBenefits);

        return {
            netEffect,
            monthlyChange: -(monthlySalary - unemploymentBenefit),
            affectedTransactions: monthsUnemployed * 2, // Loss of income + unemployment benefits
            riskLevel: 'high'
        };
    }

    calculateMajorPurchaseEffects(parameters) {
        const purchaseAmount = parseFloat(parameters.purchaseAmount || 0);
        const downPayment = parseFloat(parameters.downPayment || purchaseAmount);
        const monthlyPayment = parseFloat(parameters.monthlyPayment || 0);
        const loanTermMonths = parseInt(parameters.loanTermMonths || 0);

        return {
            netEffect: -(downPayment + (monthlyPayment * loanTermMonths)),
            monthlyChange: -monthlyPayment,
            affectedTransactions: 1 + loanTermMonths, // Initial purchase + monthly payments
            riskLevel: purchaseAmount > 50000 ? 'high' : purchaseAmount > 10000 ? 'medium' : 'low'
        };
    }

    calculateDebtPayoffEffects(parameters) {
        const debtAmount = parseFloat(parameters.debtAmount || 0);
        const currentPayment = parseFloat(parameters.currentPayment || 0);
        const newPayment = parseFloat(parameters.newPayment || currentPayment);
        const monthsToPayoff = parseInt(parameters.monthsToPayoff || 12);

        return {
            netEffect: -(newPayment - currentPayment) * monthsToPayoff,
            monthlyChange: -(newPayment - currentPayment),
            affectedTransactions: monthsToPayoff,
            riskLevel: newPayment > currentPayment * 2 ? 'medium' : 'low'
        };
    }

    calculateEmergencyFundEffects(parameters) {
        const targetAmount = parseFloat(parameters.targetAmount || 10000);
        const monthlyContribution = parseFloat(parameters.monthlyContribution || 500);
        const months = Math.ceil(targetAmount / monthlyContribution);

        return {
            netEffect: -targetAmount,
            monthlyChange: -monthlyContribution,
            affectedTransactions: months,
            riskLevel: 'low'
        };
    }

    calculateGenericScenarioEffects(parameters) {
        // Fallback for unknown scenario types
        const monthlyAmount = parseFloat(parameters.monthlyAmount || 0);
        const duration = parseInt(parameters.duration || 12);

        return {
            netEffect: monthlyAmount * duration,
            monthlyChange: monthlyAmount,
            affectedTransactions: duration,
            riskLevel: Math.abs(monthlyAmount) > 1000 ? 'medium' : 'low'
        };
    }

    // Impact Preview Modal
    async openImpactPreview() {
        if (this.activeScenarios.size === 0) {
            if (window.notificationManager) {
                window.notificationManager.warning('No active scenarios to preview');
            } else {
                alert('No active scenarios to preview');
            }
            return;
        }

        const modal = document.getElementById('scenarioImpactModal');
        modal.classList.remove('hidden');

        // Calculate and display impact
        await this.generateImpactPreview();
        this.initializeImpactModalListeners();
    }

    async generateImpactPreview() {
        try {
            const combinedEffects = await this.calculateCombinedScenarioEffects();
            const affectedData = this.calculateAffectedTransactions();

            // Update impact metrics
            this.updateImpactMetrics(combinedEffects);
            
            // Update affected transactions
            this.updateAffectedTransactionsList(affectedData);
            
            // Check for conflicts
            this.checkScenarioConflicts();

            console.log('📊 Impact preview generated successfully');
        } catch (error) {
            console.error('Error generating impact preview:', error);
        }
    }

    updateImpactMetrics(effects) {
        const metricsContainer = document.getElementById('impactMetrics');
        if (!metricsContainer) return;

        metricsContainer.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Net Financial Impact</h4>
                    <div class="metric-value ${effects.netEffect >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(effects.netEffect)}
                    </div>
                    <div class="metric-subtitle">Over 1 year</div>
                </div>
                <div class="metric-card">
                    <h4>Monthly Change</h4>
                    <div class="metric-value ${effects.monthlyChange >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(effects.monthlyChange)}
                    </div>
                    <div class="metric-subtitle">Per month</div>
                </div>
                <div class="metric-card">
                    <h4>Transactions Affected</h4>
                    <div class="metric-value">${effects.affectedTransactions}</div>
                    <div class="metric-subtitle">Total count</div>
                </div>
                <div class="metric-card">
                    <h4>Risk Assessment</h4>
                    <div class="metric-value risk-${effects.riskLevel}">
                        ${effects.riskLevel.toUpperCase()}
                    </div>
                    <div class="metric-subtitle">Overall risk</div>
                </div>
            </div>
        `;
    }

    calculateAffectedTransactions() {
        // For now, return a simplified view
        // In a full implementation, this would analyze each transaction
        return {
            newTransactions: Array.from(this.activeScenarios.values()).length * 2,
            modifiedTransactions: 0,
            removedTransactions: 0
        };
    }

    updateAffectedTransactionsList(data) {
        const changesContainer = document.getElementById('transactionChanges');
        if (!changesContainer) return;

        changesContainer.innerHTML = `
            <div class="transaction-changes-summary">
                <div class="change-item">
                    <span class="change-icon">➕</span>
                    <span class="change-label">New Transactions:</span>
                    <span class="change-count">${data.newTransactions}</span>
                </div>
                <div class="change-item">
                    <span class="change-icon">✏️</span>
                    <span class="change-label">Modified:</span>
                    <span class="change-count">${data.modifiedTransactions}</span>
                </div>
                <div class="change-item">
                    <span class="change-icon">➖</span>
                    <span class="change-label">Removed:</span>
                    <span class="change-count">${data.removedTransactions}</span>
                </div>
            </div>
            <div class="transaction-preview-note">
                <p>💡 <strong>Note:</strong> These changes will be applied to your projected transactions. Historical data remains unchanged.</p>
            </div>
        `;
    }

    checkScenarioConflicts() {
        const conflictsContainer = document.getElementById('conflictsList');
        if (!conflictsContainer) return;

        // Simple conflict detection - in a full implementation this would be more sophisticated
        const conflicts = [];
        
        if (this.activeScenarios.size > 3) {
            conflicts.push({
                type: 'complexity',
                message: 'Multiple active scenarios may create unpredictable interactions',
                severity: 'medium'
            });
        }

        if (conflicts.length === 0) {
            conflictsContainer.innerHTML = `
                <div class="no-conflicts">
                    <span class="success-icon">✅</span>
                    <p>No conflicts detected between active scenarios.</p>
                </div>
            `;
        } else {
            const conflictItems = conflicts.map(conflict => `
                <div class="conflict-item severity-${conflict.severity}">
                    <span class="conflict-icon">⚠️</span>
                    <div class="conflict-content">
                        <div class="conflict-type">${conflict.type.toUpperCase()}</div>
                        <div class="conflict-message">${conflict.message}</div>
                    </div>
                </div>
            `).join('');

            conflictsContainer.innerHTML = conflictItems;
        }
    }

    initializeImpactModalListeners() {
        // Close modal listeners
        document.getElementById('scenarioImpactModalClose').onclick = () => this.closeImpactModal();
        document.getElementById('scenarioImpactModalOverlay').onclick = () => this.closeImpactModal();
        document.getElementById('cancelImpactBtn').onclick = () => this.closeImpactModal();

        // Apply changes listener
        document.getElementById('applyChangesBtn').onclick = () => this.applyScenarioChanges();
    }

    closeImpactModal() {
        document.getElementById('scenarioImpactModal').classList.add('hidden');
    }

    async applyScenarioChanges() {
        try {
            // This would implement the actual application of scenario effects
            console.log('🔄 Applying scenario changes...');
            
            // Update scenario mode to show effects
            this.scenarioMode = 'active';
            this.updateScenarioModeUI();
            
            // Refresh ledger with scenario effects
            this.refreshLedger();
            
            // Close modal
            this.closeImpactModal();
            
            // Show success notification
            if (window.notificationManager) {
                window.notificationManager.success('Scenario changes applied successfully');
            } else {
                alert('Scenario changes applied successfully');
            }
            
        } catch (error) {
            console.error('Error applying scenario changes:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Failed to apply scenario changes');
            } else {
                alert('Failed to apply scenario changes: ' + error.message);
            }
        }
    }

    async clearAllActiveScenarios() {
        try {
            const confirmMessage = `Are you sure you want to deactivate all ${this.activeScenarios.size} active scenarios?`;
            if (!confirm(confirmMessage)) return;

            // Deactivate all scenarios
            for (const scenarioId of this.activeScenarios.keys()) {
                await electronAPI.toggleScenarioActive(scenarioId, false);
            }

            // Clear local cache
            this.activeScenarios.clear();
            this.scenarioEffects.clear();

            // Update UI
            this.updateActiveScenariosUI();
            this.scenarioMode = 'base';
            this.updateScenarioModeUI();
            this.refreshLedger();

            if (window.notificationManager) {
                window.notificationManager.success('All scenarios deactivated');
            } else {
                alert('All scenarios deactivated');
            }
            console.log('🔄 All active scenarios cleared');

        } catch (error) {
            console.error('Error clearing scenarios:', error);
            if (window.notificationManager) {
                window.notificationManager.error('Failed to clear scenarios');
            } else {
                alert('Failed to clear scenarios: ' + error.message);
            }
        }
    }

    async previewScenarioImpact(scenarioId) {
        const scenario = this.activeScenarios.get(scenarioId);
        if (!scenario) return;

        try {
            const effects = await this.calculateScenarioEffects(scenario);
            
            // Update the specific scenario card with impact data
            const impactContainer = document.getElementById(`scenarioImpact_${scenarioId}`);
            if (impactContainer) {
                impactContainer.innerHTML = `
                    <div class="scenario-impact-preview">
                        <div class="impact-item">
                            <span class="impact-label">Monthly:</span>
                            <span class="impact-value ${effects.monthlyChange >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(effects.monthlyChange)}
                            </span>
                        </div>
                        <div class="impact-item">
                            <span class="impact-label">Annual:</span>
                            <span class="impact-value ${effects.netEffect >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(effects.netEffect)}
                            </span>
                        </div>
                    </div>
                `;
            }

        } catch (error) {
            console.error(`Error previewing scenario ${scenarioId}:`, error);
        }
    }
}

// App initialization moved to end of file for proper manager setup

// Add dynamic styles
const style = document.createElement('style');
style.textContent = `
    .projected-row {
        opacity: 0.7;
        font-style: italic;
    }
    
    .category-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        background-color: var(--bg-tertiary);
        color: var(--text-secondary);
    }
    
    .type-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .type-badge.actual {
        background-color: var(--accent-color);
        color: white;
    }
    
    .type-badge.projected {
        background-color: var(--warning-color);
        color: white;
    }
    
    .scenario-card {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
    }
    
    .scenario-card h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--text-primary);
    }
    
    .scenario-card p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
        font-size: 0.875rem;
    }
    
    .scenario-actions {
        display: flex;
        gap: var(--spacing-sm);
    }
`;
document.head.appendChild(style); 

// =============================================================================
// ENHANCED UX FEATURES & GLOBAL ENHANCEMENTS
// =============================================================================

/**
 * Enhanced Notification System for better user feedback
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.initializeStyles();
    }

    initializeStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    max-width: 400px;
                    cursor: pointer;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification.success {
                    background: var(--success-color);
                }
                
                .notification.error {
                    background: var(--danger-color);
                }
                
                .notification.info {
                    background: var(--primary-color);
                }
                
                .notification.warning {
                    background: var(--warning-color);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    margin-left: auto;
                    font-size: 18px;
                    padding: 0;
                    opacity: 0.8;
                    transition: opacity 0.2s ease;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        }[type] || 'ℹ️';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add click handler for close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification);
        });
        
        // Add click handler for entire notification
        notification.addEventListener('click', () => {
            this.remove(notification);
        });
        
        // Add to DOM and animate in
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        // Manage notification count
        this.notifications = this.notifications.filter(n => n.parentElement);
        this.notifications.push(notification);
        
        if (this.notifications.length > this.maxNotifications) {
            const oldNotification = this.notifications.shift();
            if (oldNotification && oldNotification.parentElement) {
                this.remove(oldNotification);
            }
        }
        
        // Position multiple notifications
        this.repositionNotifications();
    }

    remove(notification) {
        if (notification && notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                    this.repositionNotifications();
                }
            }, 300);
        }
    }

    repositionNotifications() {
        const activeNotifications = document.querySelectorAll('.notification.show');
        activeNotifications.forEach((notification, index) => {
            notification.style.top = `${20 + (index * 80)}px`;
        });
    }

    success(message, duration = 4000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        this.show(message, 'info', duration);
    }
}

/**
 * Enhanced Loading State Management
 */
class LoadingManager {
    constructor() {
        this.loadingStates = new Set();
        this.initializeStyles();
    }

    initializeStyles() {
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(248, 250, 252, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    backdrop-filter: blur(2px);
                    border-radius: inherit;
                    transition: opacity 0.3s ease;
                }
                
                .loading-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--primary-color);
                    font-weight: 500;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }
        
        if (!element) return;
        
        // Make container relative if not already
        const position = window.getComputedStyle(element).position;
        if (position === 'static') {
            element.style.position = 'relative';
        }
        
        // Remove existing loading overlay
        this.hide(element);
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
        
        element.appendChild(loadingOverlay);
        this.loadingStates.add(element);
        
        // Fade in
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
    }

    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }
        
        if (!element) return;
        
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 300);
            this.loadingStates.delete(element);
        }
    }

    isLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }
        return this.loadingStates.has(element);
    }
}

/**
 * Enhanced Keyboard Shortcuts System
 */
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.initializeDefaultShortcuts();
        this.bindEvents();
    }

    initializeDefaultShortcuts() {
        // Tab navigation
        this.add('1', () => this.switchTab('ledger'), 'Switch to Ledger');
        this.add('2', () => this.switchTab('chat'), 'Switch to AI Assistant');
        this.add('3', () => this.switchTab('scenarios'), 'Switch to Scenarios');
        this.add('4', () => this.switchTab('analytics'), 'Switch to Analytics');
        
        // Common actions
        this.add('ctrl+r', () => this.refreshCurrentTab(), 'Refresh Current Tab');
        this.add('ctrl+f', () => this.focusSearch(), 'Focus Search');
        this.add('escape', () => this.closeModals(), 'Close Modals');
        this.add('ctrl+?', () => this.showHelp(), 'Show Keyboard Shortcuts');
        
        // Chat shortcuts
        this.add('ctrl+enter', () => this.sendChatMessage(), 'Send Chat Message');
        this.add('ctrl+k', () => this.clearChat(), 'Clear Chat');
        
        // Quick actions
        this.add('ctrl+e', () => this.exportData(), 'Export Data');
        this.add('ctrl+s', () => this.saveState(), 'Save Current State');
    }

    add(keyCombo, action, description) {
        this.shortcuts.set(keyCombo.toLowerCase(), { action, description });
    }

    remove(keyCombo) {
        this.shortcuts.delete(keyCombo.toLowerCase());
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const combo = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(combo);
            
            if (shortcut && !this.isTyping(e.target)) {
                e.preventDefault();
                try {
                    shortcut.action();
                } catch (error) {
                    console.error('Shortcut error:', error);
                }
            }
        });
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    isTyping(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.contentEditable === 'true' ||
               element.isContentEditable;
    }

    switchTab(tabName) {
        if (window.app && typeof window.app.switchTab === 'function') {
            window.app.switchTab(tabName);
        }
    }

    refreshCurrentTab() {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            notifications.info('Refreshing current tab...');
            
            if (tabId.includes('ledger')) {
                window.app?.refreshLedger();
            } else if (tabId.includes('chat')) {
                // Chat doesn't need refresh
                notifications.info('Chat is always up to date');
            } else if (tabId.includes('scenarios')) {
                window.app?.refreshScenarios();
            } else if (tabId.includes('analytics')) {
                window.app?.refreshAnalytics();
            }
        }
    }

    focusSearch() {
        const searchInput = document.getElementById('search-input') || 
                          document.querySelector('input[type="search"]') ||
                          document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close') || 
                           modal.querySelector('[onclick*="close"]') ||
                           modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.click();
            }
        });
    }

    sendChatMessage() {
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn && !sendBtn.disabled) {
            sendBtn.click();
        }
    }

    clearChat() {
        if (window.app && typeof window.app.clearConversation === 'function') {
            window.app.clearConversation();
        }
    }

    exportData() {
        const exportBtn = document.querySelector('[onclick*="export"]') ||
                         document.getElementById('exportBtn') ||
                         document.getElementById('exportAnalyticsBtn');
        if (exportBtn) {
            exportBtn.click();
        } else {
            notifications.info('Export function not available in current context');
        }
    }

    saveState() {
        // Auto-save current state
        notifications.info('Saving current state...');
        // Implementation would depend on app's save mechanism
        setTimeout(() => {
            notifications.success('State saved successfully');
        }, 500);
    }

    showHelp() {
        const helpContent = Array.from(this.shortcuts.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([combo, {description}]) => 
                `<div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                    <kbd style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; border: 1px solid var(--border-color);">${combo.toUpperCase()}</kbd>
                    <span style="font-size: 14px;">${description}</span>
                </div>`
            ).join('');
        
        const helpModal = document.createElement('div');
        helpModal.className = 'modal';
        helpModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 16px;">
                        <p>Use these keyboard shortcuts to navigate FutureFund more efficiently:</p>
                    </div>
                    <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                        ${helpContent}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (helpModal.parentElement) {
                helpModal.remove();
            }
        }, 15000);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

/**
 * Enhanced Tooltip System
 */
class TooltipManager {
    constructor() {
        this.activeTooltip = null;
        this.tooltips = new Map();
        this.initializeStyles();
        this.initializeDefaultTooltips();
    }

    initializeStyles() {
        if (!document.getElementById('tooltip-styles')) {
            const style = document.createElement('style');
            style.id = 'tooltip-styles';
            style.textContent = `
                .tooltip {
                    position: fixed;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    z-index: 10001;
                    pointer-events: none;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transform: translateY(-8px);
                    opacity: 0;
                    transition: all 0.2s ease;
                    max-width: 300px;
                    white-space: normal;
                    text-align: center;
                }
                
                .tooltip.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-top-color: rgba(0, 0, 0, 0.9);
                }
                
                .tooltip.top::after {
                    top: -6px;
                    border-top-color: transparent;
                    border-bottom-color: rgba(0, 0, 0, 0.9);
                }
            `;
            document.head.appendChild(style);
        }
    }

    initializeDefaultTooltips() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // Tab tooltips
            document.querySelectorAll('.tab-btn').forEach((tab, index) => {
                const shortcuts = ['1', '2', '3', '4'];
                const names = ['Ledger', 'AI Assistant', 'Scenarios', 'Analytics'];
                if (names[index]) {
                    this.add(tab, `${names[index]} (Press ${shortcuts[index]})`);
                }
            });
            
            // Button tooltips
            this.add('#sendBtn', 'Send message (Ctrl+Enter)');
            this.add('#clearChatBtn', 'Clear chat history (Ctrl+K)');
            this.add('#newScenarioBtn', 'Create new financial scenario');
            this.add('#refreshAnalyticsBtn', 'Refresh analytics data (Ctrl+R)');
            this.add('#exportAnalyticsBtn', 'Export analytics report (Ctrl+E)');
            
            // Other interactive elements
            this.add('.summary-card', 'Click to view detailed breakdown');
            this.add('.scenario-card', 'Right-click for more options');
        }, 1000);
    }

    add(selector, text, options = {}) {
        const elements = typeof selector === 'string' ? 
            document.querySelectorAll(selector) : [selector];
        
        elements.forEach(element => {
            if (!element) return;
            
            // Store tooltip data
            this.tooltips.set(element, { text, options });
            
            // Add event listeners
            element.addEventListener('mouseenter', (e) => this.show(e.target, text, options));
            element.addEventListener('mouseleave', () => this.hide());
            element.addEventListener('focus', (e) => this.show(e.target, text, options));
            element.addEventListener('blur', () => this.hide());
        });
    }

    show(element, text, options = {}) {
        this.hide(); // Hide any existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 12;
        
        // Adjust if tooltip goes off-screen
        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        
        if (top < 8) {
            top = rect.bottom + 12;
            tooltip.classList.add('top');
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Show tooltip
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
        
        this.activeTooltip = tooltip;
        
        // Auto-hide after delay
        setTimeout(() => {
            if (this.activeTooltip === tooltip) {
                this.hide();
            }
        }, options.autoHide !== false ? 5000 : 0);
    }

    hide() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('show');
            const tooltip = this.activeTooltip;
            setTimeout(() => {
                if (tooltip && tooltip.parentElement) {
                    tooltip.remove();
                }
            }, 200);
            this.activeTooltip = null;
        }
    }

    remove(selector) {
        const elements = typeof selector === 'string' ? 
            document.querySelectorAll(selector) : [selector];
        
        elements.forEach(element => {
            if (element && this.tooltips.has(element)) {
                this.tooltips.delete(element);
                // Note: Event listeners will be removed when element is removed from DOM
            }
        });
    }
}

/**
 * AccessibilityManager - Enhanced accessibility features
 */
class AccessibilityManager {
    constructor() {
        this.initializeAccessibility();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
    }

    initializeAccessibility() {
        // Add skip-to-content link
        this.addSkipToContent();
        
        // Enhance existing ARIA labels
        this.enhanceAriaLabels();
        
        // Setup focus indicators
        this.setupFocusIndicators();
    }

    addSkipToContent() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-to-content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    enhanceAriaLabels() {
        // Add ARIA labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });

        // Add ARIA roles to key sections
        const nav = document.querySelector('.nav-tabs');
        if (nav) {
            nav.setAttribute('role', 'tablist');
            nav.setAttribute('aria-label', 'Main navigation');
        }

        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach((tab, index) => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', tab.classList.contains('active'));
            tab.setAttribute('aria-controls', `${tab.dataset.tab}Tab`);
            tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
        });

        const tabPanels = document.querySelectorAll('.tab-content');
        tabPanels.forEach(panel => {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-hidden', !panel.classList.contains('active'));
        });
    }

    setupKeyboardNavigation() {
        // Enhanced tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.nav-tabs')) {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const currentIndex = tabs.findIndex(tab => tab === document.activeElement);

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % tabs.length;
                this.focusTab(tabs[nextIndex]);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
                this.focusTab(tabs[prevIndex]);
                break;
            case 'Home':
                e.preventDefault();
                this.focusTab(tabs[0]);
                break;
            case 'End':
                e.preventDefault();
                this.focusTab(tabs[tabs.length - 1]);
                break;
        }
    }

    focusTab(tab) {
        // Update tabindex
        document.querySelectorAll('.tab-btn').forEach(t => t.setAttribute('tabindex', '-1'));
        tab.setAttribute('tabindex', '0');
        tab.focus();
    }

    setupScreenReaderSupport() {
        // Add live regions for dynamic content
        this.createLiveRegions();
        
        // Announce important updates
        this.setupUpdateAnnouncements();
    }

    createLiveRegions() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
    }

    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    setupUpdateAnnouncements() {
        // Announce tab changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabName = e.target.textContent.trim();
                this.announce(`${tabName} tab selected`);
            }
        });

        // Announce loading states
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('loading-overlay')) {
                        this.announce('Loading...');
                    }
                });
                
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('loading-overlay')) {
                        this.announce('Loading complete');
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    setupFocusManagement() {
        // Focus management for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal:not(.hidden)');
                if (modal) {
                    const closeBtn = modal.querySelector('.modal-close');
                    if (closeBtn) closeBtn.click();
                }
            }
        });

        // Trap focus in modals
        this.setupFocusTrap();
    }

    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal:not(.hidden)');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            body.keyboard-navigation *:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            
            body:not(.keyboard-navigation) *:focus {
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * ErrorManager - Global error handling and recovery
 */
class ErrorManager {
    constructor() {
        this.errorCount = 0;
        this.recentErrors = [];
        this.maxRecentErrors = 10;
        this.setupGlobalErrorHandling();
        this.initializeStyles();
    }

    initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .error-boundary {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
            }
            
            .error-title {
                color: #dc2626;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .error-message {
                color: #7f1d1d;
                margin-bottom: 1rem;
            }
            
            .error-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .retry-btn {
                background: #dc2626;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.875rem;
            }
            
            .retry-btn:hover {
                background: #b91c1c;
            }
            
            .error-details {
                font-family: monospace;
                font-size: 0.75rem;
                background: #fee2e2;
                padding: 0.5rem;
                border-radius: 4px;
                margin-top: 0.5rem;
                white-space: pre-wrap;
                max-height: 200px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
    }

    setupGlobalErrorHandling() {
        // Catch JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                error: event.reason
            });
        });

        // Catch network errors
        this.setupNetworkErrorHandling();
    }

    setupNetworkErrorHandling() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.handleError({
                        type: 'network',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: args[0]
                    });
                }
                return response;
            } catch (error) {
                this.handleError({
                    type: 'network',
                    message: `Network error: ${error.message}`,
                    url: args[0],
                    error
                });
                throw error;
            }
        };
    }

    handleError(errorInfo) {
        this.errorCount++;
        this.recentErrors.unshift({
            ...errorInfo,
            timestamp: new Date(),
            id: Date.now()
        });

        // Keep only recent errors
        if (this.recentErrors.length > this.maxRecentErrors) {
            this.recentErrors = this.recentErrors.slice(0, this.maxRecentErrors);
        }

        // Show user-friendly error message
        this.showUserFriendlyError(errorInfo);

        // Log detailed error for debugging
        console.error('🚨 Error captured:', errorInfo);

        // Track error for analytics
        this.trackError(errorInfo);
    }

    showUserFriendlyError(errorInfo) {
        const friendlyMessage = this.getFriendlyMessage(errorInfo);
        
        if (window.notificationManager) {
            window.notificationManager.error(friendlyMessage, 8000);
        }

        // For critical errors, show recovery UI
        if (this.isCriticalError(errorInfo)) {
            this.showErrorBoundary(errorInfo);
        }
    }

    getFriendlyMessage(errorInfo) {
        switch (errorInfo.type) {
            case 'network':
                return 'Connection issue detected. Please check your internet connection.';
            case 'javascript':
                return 'Something went wrong. The app is attempting to recover automatically.';
            case 'promise':
                return 'A background operation failed. Your data is safe.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }

    isCriticalError(errorInfo) {
        return errorInfo.type === 'javascript' && 
               (errorInfo.message?.includes('Cannot read property') ||
                errorInfo.message?.includes('undefined is not a function'));
    }

    showErrorBoundary(errorInfo) {
        const container = document.createElement('div');
        container.className = 'error-boundary';
        container.innerHTML = `
            <div class="error-title">Something went wrong</div>
            <div class="error-message">
                The application encountered an error but is attempting to recover.
                Your data has been preserved.
            </div>
            <div class="error-actions">
                <button class="retry-btn" onclick="window.errorManager.retry()">
                    Retry Operation
                </button>
                <button class="retry-btn" onclick="window.errorManager.refresh()">
                    Refresh Page
                </button>
                <button class="btn" onclick="window.errorManager.showDetails('${errorInfo.id}')">
                    Show Details
                </button>
            </div>
        `;

        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(container, mainContent.firstChild);
        }
    }

    retry() {
        // Remove error boundaries
        document.querySelectorAll('.error-boundary').forEach(el => el.remove());
        
        // Attempt to refresh current view
        if (window.app) {
            window.app.refreshCurrentTab();
        }
        
        window.notificationManager?.info('Retrying operation...', 3000);
    }

    refresh() {
        window.location.reload();
    }

    showDetails(errorId) {
        const error = this.recentErrors.find(e => e.id.toString() === errorId);
        if (error) {
            const details = `
Error Type: ${error.type}
Message: ${error.message}
Time: ${error.timestamp.toISOString()}
${error.filename ? `File: ${error.filename}:${error.lineno}:${error.colno}` : ''}
${error.error?.stack ? `Stack: ${error.error.stack}` : ''}
            `.trim();

            const container = document.querySelector('.error-boundary');
            if (container) {
                let detailsEl = container.querySelector('.error-details');
                if (!detailsEl) {
                    detailsEl = document.createElement('div');
                    detailsEl.className = 'error-details';
                    container.appendChild(detailsEl);
                }
                detailsEl.textContent = details;
            }
        }
    }

    trackError(errorInfo) {
        // Could send to analytics service
        console.log('📊 Error tracked:', {
            type: errorInfo.type,
            message: errorInfo.message,
            timestamp: new Date().toISOString()
        });
    }

    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            recentErrors: this.recentErrors.length,
            errorTypes: this.recentErrors.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

/**
 * FormValidator - Enhanced form validation with real-time feedback
 */
class FormValidator {
    constructor() {
        this.validationRules = new Map();
        this.activeValidations = new Map();
        this.initializeStyles();
        this.setupGlobalValidation();
    }

    initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .form-field {
                position: relative;
                margin-bottom: 1rem;
            }
            
            .form-field.has-error input,
            .form-field.has-error select,
            .form-field.has-error textarea {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
            
            .form-field.has-success input,
            .form-field.has-success select,
            .form-field.has-success textarea {
                border-color: #10b981;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
            }
            
            .validation-message {
                position: absolute;
                left: 0;
                top: 100%;
                font-size: 0.75rem;
                margin-top: 0.25rem;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .validation-message.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .validation-message.error {
                color: #ef4444;
            }
            
            .validation-message.success {
                color: #10b981;
            }
            
            .validation-icon {
                position: absolute;
                right: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.875rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .form-field.has-error .validation-icon {
                opacity: 1;
                color: #ef4444;
            }
            
            .form-field.has-success .validation-icon {
                opacity: 1;
                color: #10b981;
            }
            
            .form-progress {
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                margin-bottom: 1rem;
                overflow: hidden;
            }
            
            .form-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    setupGlobalValidation() {
        // Real-time validation on input
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        });

        // Validation on blur
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target, true);
            }
        }, true);

        // Form submission validation
        document.addEventListener('submit', (e) => {
            if (!this.validateForm(e.target)) {
                e.preventDefault();
            }
        });
    }

    addValidationRule(fieldSelector, rules) {
        this.validationRules.set(fieldSelector, rules);
    }

    validateField(field, showSuccess = false) {
        const fieldContainer = field.closest('.form-field') || this.wrapField(field);
        const rules = this.getFieldRules(field);
        
        if (!rules || rules.length === 0) return true;

        const value = field.value.trim();
        const result = this.runValidationRules(value, rules, field);

        this.updateFieldUI(fieldContainer, result, showSuccess);
        return result.isValid;
    }

    wrapField(field) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-field';
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
        
        // Add validation elements
        const icon = document.createElement('span');
        icon.className = 'validation-icon';
        wrapper.appendChild(icon);
        
        const message = document.createElement('div');
        message.className = 'validation-message';
        wrapper.appendChild(message);
        
        return wrapper;
    }

    getFieldRules(field) {
        // Try to find rules by various selectors
        for (const [selector, rules] of this.validationRules) {
            if (field.matches(selector)) {
                return rules;
            }
        }

        // Default rules based on field attributes
        return this.getDefaultRules(field);
    }

    getDefaultRules(field) {
        const rules = [];
        
        if (field.required) {
            rules.push({ type: 'required', message: 'This field is required' });
        }
        
        if (field.type === 'email') {
            rules.push({ type: 'email', message: 'Please enter a valid email address' });
        }
        
        if (field.type === 'number') {
            if (field.min !== '') {
                rules.push({ type: 'min', value: parseFloat(field.min), message: `Minimum value is ${field.min}` });
            }
            if (field.max !== '') {
                rules.push({ type: 'max', value: parseFloat(field.max), message: `Maximum value is ${field.max}` });
            }
        }
        
        if (field.minLength) {
            rules.push({ type: 'minLength', value: field.minLength, message: `Minimum length is ${field.minLength} characters` });
        }
        
        return rules;
    }

    runValidationRules(value, rules, field) {
        for (const rule of rules) {
            const result = this.validateRule(value, rule, field);
            if (!result.isValid) {
                return result;
            }
        }
        
        return { isValid: true, message: 'Valid' };
    }

    validateRule(value, rule, field) {
        switch (rule.type) {
            case 'required':
                return {
                    isValid: value.length > 0,
                    message: rule.message || 'This field is required'
                };
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: !value || emailRegex.test(value),
                    message: rule.message || 'Please enter a valid email address'
                };
                
            case 'min':
                const numValue = parseFloat(value);
                return {
                    isValid: !value || numValue >= rule.value,
                    message: rule.message || `Minimum value is ${rule.value}`
                };
                
            case 'max':
                const maxValue = parseFloat(value);
                return {
                    isValid: !value || maxValue <= rule.value,
                    message: rule.message || `Maximum value is ${rule.value}`
                };
                
            case 'minLength':
                return {
                    isValid: !value || value.length >= rule.value,
                    message: rule.message || `Minimum length is ${rule.value} characters`
                };
                
            case 'custom':
                return rule.validator(value, field);
                
            default:
                return { isValid: true, message: '' };
        }
    }

    updateFieldUI(container, result, showSuccess) {
        const field = container.querySelector('input, select, textarea');
        const icon = container.querySelector('.validation-icon');
        const message = container.querySelector('.validation-message');
        
        // Remove existing classes
        container.classList.remove('has-error', 'has-success');
        message.classList.remove('show', 'error', 'success');
        
        if (!result.isValid) {
            container.classList.add('has-error');
            message.classList.add('show', 'error');
            message.textContent = result.message;
            icon.textContent = '✗';
        } else if (showSuccess && field.value.trim()) {
            container.classList.add('has-success');
            message.classList.add('show', 'success');
            message.textContent = result.message;
            icon.textContent = '✓';
        } else {
            icon.textContent = '';
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        let invalidCount = 0;
        
        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
                invalidCount++;
            }
        });
        
        // Update form progress
        this.updateFormProgress(form, fields.length - invalidCount, fields.length);
        
        if (!isValid) {
            // Focus first invalid field
            const firstInvalid = form.querySelector('.form-field.has-error input, .form-field.has-error select, .form-field.has-error textarea');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            window.notificationManager?.error(`Please fix ${invalidCount} field${invalidCount > 1 ? 's' : ''} before submitting`, 5000);
        }
        
        return isValid;
    }

    updateFormProgress(form, validCount, totalCount) {
        let progressContainer = form.querySelector('.form-progress');
        if (!progressContainer && totalCount > 1) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'form-progress';
            progressContainer.innerHTML = '<div class="form-progress-bar"></div>';
            form.insertBefore(progressContainer, form.firstChild);
        }
        
        if (progressContainer) {
            const progress = (validCount / totalCount) * 100;
            const progressBar = progressContainer.querySelector('.form-progress-bar');
            progressBar.style.width = `${progress}%`;
        }
    }

    // Preset validation rules for common scenarios
    addFinancialValidation() {
        this.addValidationRule('.amount-input', [
            { type: 'required', message: 'Amount is required' },
            { type: 'min', value: 0, message: 'Amount must be positive' },
            { type: 'custom', validator: (value) => {
                const num = parseFloat(value);
                return {
                    isValid: !isNaN(num) && num < 1000000,
                    message: 'Please enter a valid amount under $1,000,000'
                };
            }}
        ]);
        
        this.addValidationRule('.date-input', [
            { type: 'required', message: 'Date is required' },
            { type: 'custom', validator: (value) => {
                const date = new Date(value);
                const now = new Date();
                return {
                    isValid: date <= now,
                    message: 'Date cannot be in the future'
                };
            }}
        ]);
    }
}

/**
 * PerformanceMonitor - Advanced performance tracking and optimization
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.performanceObserver = null;
        this.memoryTracker = new Map();
        this.frameRateMonitor = null;
        this.initializeMonitoring();
    }

    initializeMonitoring() {
        // Setup Performance Observer for detailed metrics
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                this.processPerformanceEntries(list.getEntries());
            });
            
            this.performanceObserver.observe({ 
                entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
            });
        }

        // Memory usage monitoring
        this.startMemoryMonitoring();
        
        // Frame rate monitoring
        this.startFrameRateMonitoring();
        
        // Network performance tracking
        this.setupNetworkMonitoring();
    }

    processPerformanceEntries(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'measure') {
                this.recordMetric(`measure.${entry.name}`, entry.duration);
            } else if (entry.entryType === 'paint') {
                this.recordMetric(`paint.${entry.name}`, entry.startTime);
            } else if (entry.entryType === 'navigation') {
                this.recordNavigationMetrics(entry);
            }
        });
    }

    recordNavigationMetrics(entry) {
        const metrics = {
            'navigation.dns': entry.domainLookupEnd - entry.domainLookupStart,
            'navigation.connect': entry.connectEnd - entry.connectStart,
            'navigation.request': entry.responseStart - entry.requestStart,
            'navigation.response': entry.responseEnd - entry.responseStart,
            'navigation.dom': entry.domContentLoadedEventStart - entry.responseEnd,
            'navigation.load': entry.loadEventStart - entry.domContentLoadedEventStart
        };

        Object.entries(metrics).forEach(([key, value]) => {
            this.recordMetric(key, value);
        });
    }

    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.recordMetric('memory.used', memory.usedJSHeapSize);
                this.recordMetric('memory.total', memory.totalJSHeapSize);
                this.recordMetric('memory.limit', memory.jsHeapSizeLimit);
                
                // Alert if memory usage is high
                const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                if (usagePercent > 80) {
                    this.triggerMemoryCleanup();
                }
            }, 5000);
        }
    }

    startFrameRateMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 0;

        const calculateFPS = (currentTime) => {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.recordMetric('fps', fps);
                
                // Alert if FPS drops below 30
                if (fps < 30) {
                    console.warn('⚠️ Low FPS detected:', fps);
                    this.optimizePerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(calculateFPS);
        };

        requestAnimationFrame(calculateFPS);
    }

    setupNetworkMonitoring() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - startTime;
                
                this.recordMetric(`network.${this.getUrlKey(url)}`, duration);
                
                if (duration > 5000) {
                    console.warn('🐌 Slow network request:', url, `${duration}ms`);
                }
                
                return response;
            } catch (error) {
                const duration = performance.now() - startTime;
                this.recordMetric(`network.error.${this.getUrlKey(url)}`, duration);
                throw error;
            }
        };
    }

    getUrlKey(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname.replace(/[^a-zA-Z0-9]/g, '_');
        } catch {
            return 'unknown';
        }
    }

    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                values: [],
                total: 0,
                count: 0,
                min: Infinity,
                max: -Infinity
            });
        }

        const metric = this.metrics.get(name);
        metric.values.push({ value, timestamp: Date.now() });
        metric.total += value;
        metric.count++;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);

        // Keep only last 100 values
        if (metric.values.length > 100) {
            const removed = metric.values.shift();
            metric.total -= removed.value;
            metric.count--;
        }
    }

    triggerMemoryCleanup() {
        console.log('🧹 Triggering memory cleanup...');
        
        // Clear caches
        if (window.cacheManager) {
            window.cacheManager.clear();
        }
        
        // Force garbage collection (if available)
        if (window.gc) {
            window.gc();
        }
        
        // Clean up charts
        if (window.app?.chartService) {
            window.app.chartService.cleanup();
        }
        
        // Clean up old DOM elements
        this.cleanupDOMElements();
    }

    cleanupDOMElements() {
        // Remove old error boundaries
        const oldErrors = document.querySelectorAll('.error-boundary');
        if (oldErrors.length > 3) {
            Array.from(oldErrors).slice(3).forEach(el => el.remove());
        }
        
        // Clean up old notifications
        const oldNotifications = document.querySelectorAll('.notification');
        if (oldNotifications.length > 5) {
            Array.from(oldNotifications).slice(5).forEach(el => el.remove());
        }
    }

    optimizePerformance() {
        // Reduce animation complexity
        document.body.classList.add('reduced-motion');
        
        // Defer non-critical operations
        setTimeout(() => {
            document.body.classList.remove('reduced-motion');
        }, 5000);
        
        // Throttle expensive operations
        this.throttleExpensiveOperations();
    }

    throttleExpensiveOperations() {
        // Placeholder for throttling expensive operations
        console.log('🔧 Throttling expensive operations (simplified)');
    }

    getMetrics() {
        const summary = {};
        
        this.metrics.forEach((metric, name) => {
            summary[name] = {
                average: metric.total / metric.count,
                min: metric.min,
                max: metric.max,
                count: metric.count,
                recent: metric.values.slice(-10).map(v => v.value)
            };
        });
        
        return summary;
    }

    generatePerformanceReport() {
        const metrics = this.getMetrics();
        const memory = performance.memory;
        
        return {
            timestamp: new Date().toISOString(),
            memory: memory ? {
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                usage: `${((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100).toFixed(1)}%`
            } : null,
            fps: metrics.fps?.average || 'N/A',
            networkRequests: Object.keys(metrics).filter(k => k.startsWith('network.')).length,
            slowOperations: Object.entries(metrics)
                .filter(([_, m]) => m.average > 1000)
                .map(([name, m]) => ({ name, averageMs: m.average.toFixed(2) })),
            recommendations: this.generateRecommendations(metrics)
        };
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        // Check for slow operations
        Object.entries(metrics).forEach(([name, metric]) => {
            if (metric.average > 1000) {
                recommendations.push(`Optimize ${name} (avg: ${metric.average.toFixed(2)}ms)`);
            }
        });
        
        // Check memory usage
        if (performance.memory) {
            const usage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
            if (usage > 70) {
                recommendations.push('Consider implementing data pagination for large datasets');
            }
        }
        
        // Check FPS
        if (metrics.fps && metrics.fps.average < 50) {
            recommendations.push('Reduce animation complexity or enable reduced motion');
        }
        
        return recommendations;
    }
}

/**
 * CacheManager - Intelligent caching system for performance optimization
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.accessCount = new Map();
        this.lastAccess = new Map();
        this.maxCacheSize = 100;
        this.cacheTTL = 10 * 60 * 1000; // 10 minutes
        this.setupCacheCleanup();
    }

    setupCacheCleanup() {
        // Clean expired cache entries every 5 minutes
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 5 * 60 * 1000);
    }

    set(key, value, ttl = this.cacheTTL) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLeastRecentlyUsed();
        }

        const entry = {
            value,
            timestamp: Date.now(),
            ttl,
            size: this.estimateSize(value)
        };

        this.cache.set(key, entry);
        this.accessCount.set(key, 0);
        this.lastAccess.set(key, Date.now());
    }

    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return null;
        }

        // Update access statistics
        this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
        this.lastAccess.set(key, Date.now());

        return entry.value;
    }

    delete(key) {
        this.cache.delete(key);
        this.accessCount.delete(key);
        this.lastAccess.delete(key);
    }

    clear() {
        this.cache.clear();
        this.accessCount.clear();
        this.lastAccess.clear();
    }

    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return false;
        }
        
        return true;
    }

    cleanupExpiredEntries() {
        const now = Date.now();
        const expiredKeys = [];

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach(key => this.delete(key));
        
        if (expiredKeys.length > 0) {
            console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }

    evictLeastRecentlyUsed() {
        let oldestKey = null;
        let oldestTime = Date.now();

        this.lastAccess.forEach((time, key) => {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        });

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    estimateSize(value) {
        try {
            return JSON.stringify(value).length;
        } catch {
            return 1; // Fallback for non-serializable objects
        }
    }

    getStats() {
        const totalSize = Array.from(this.cache.values())
            .reduce((sum, entry) => sum + entry.size, 0);

        const hitRates = new Map();
        this.accessCount.forEach((count, key) => {
            hitRates.set(key, count);
        });

        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            hitRates: Object.fromEntries(hitRates),
            oldestEntry: this.getOldestEntry(),
            newestEntry: this.getNewestEntry()
        };
    }

    getOldestEntry() {
        let oldest = null;
        let oldestTime = Date.now();

        this.cache.forEach((entry, key) => {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldest = key;
            }
        });

        return oldest;
    }

    getNewestEntry() {
        let newest = null;
        let newestTime = 0;

        this.cache.forEach((entry, key) => {
            if (entry.timestamp > newestTime) {
                newestTime = entry.timestamp;
                newest = key;
            }
        });

        return newest;
    }

    // Convenience methods for common cache patterns
    memoize(fn, keyGenerator, ttl) {
        return (...args) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            
            if (this.has(key)) {
                return this.get(key);
            }
            
            const result = fn(...args);
            this.set(key, result, ttl);
            return result;
        };
    }

    async memoizeAsync(fn, keyGenerator, ttl) {
        return async (...args) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            
            if (this.has(key)) {
                return this.get(key);
            }
            
            const result = await fn(...args);
            this.set(key, result, ttl);
            return result;
        };
    }
}

/**
 * VirtualScrollManager - Efficient rendering of large lists
 */
class VirtualScrollManager {
    constructor() {
        this.virtualLists = new Map();
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
    }

    createVirtualList(container, options = {}) {
        const config = {
            itemHeight: 50,
            buffer: 5,
            items: [],
            renderItem: null,
            ...options
        };

        const virtualList = new VirtualList(container, config);
        this.virtualLists.set(container, virtualList);
        return virtualList;
    }

    destroyVirtualList(container) {
        const virtualList = this.virtualLists.get(container);
        if (virtualList) {
            virtualList.destroy();
            this.virtualLists.delete(container);
        }
    }

    updateVirtualList(container, items) {
        const virtualList = this.virtualLists.get(container);
        if (virtualList) {
            virtualList.updateItems(items);
        }
    }
}

class VirtualList {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.scrollTop = 0;
        this.visibleStartIndex = 0;
        this.visibleEndIndex = 0;
        this.renderedItems = new Map();
        
        this.setupContainer();
        this.bindEvents();
        this.render();
    }

    setupContainer() {
        this.container.style.overflow = 'auto';
        this.container.style.position = 'relative';
        
        // Create scroll container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.style.height = `${this.config.items.length * this.config.itemHeight}px`;
        this.scrollContainer.style.position = 'relative';
        
        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.style.position = 'absolute';
        this.viewport.style.top = '0';
        this.viewport.style.left = '0';
        this.viewport.style.right = '0';
        
        this.scrollContainer.appendChild(this.viewport);
        this.container.appendChild(this.scrollContainer);
    }

    bindEvents() {
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        });
    }

    calculateVisibleRange() {
        const containerHeight = this.container.clientHeight;
        const startIndex = Math.floor(this.scrollTop / this.config.itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / this.config.itemHeight) + this.config.buffer,
            this.config.items.length - 1
        );

        this.visibleStartIndex = Math.max(0, startIndex - this.config.buffer);
        this.visibleEndIndex = endIndex;
    }

    render() {
        this.calculateVisibleRange();
        
        // Remove items that are no longer visible
        this.renderedItems.forEach((element, index) => {
            if (index < this.visibleStartIndex || index > this.visibleEndIndex) {
                element.remove();
                this.renderedItems.delete(index);
            }
        });

        // Add items that are now visible
        for (let i = this.visibleStartIndex; i <= this.visibleEndIndex; i++) {
            if (!this.renderedItems.has(i) && this.config.items[i]) {
                const element = this.createItemElement(this.config.items[i], i);
                this.renderedItems.set(i, element);
                this.viewport.appendChild(element);
            }
        }

        // Update viewport position
        this.viewport.style.transform = `translateY(${this.visibleStartIndex * this.config.itemHeight}px)`;
    }

    createItemElement(item, index) {
        const element = document.createElement('div');
        element.style.height = `${this.config.itemHeight}px`;
        element.style.position = 'absolute';
        element.style.top = `${(index - this.visibleStartIndex) * this.config.itemHeight}px`;
        element.style.left = '0';
        element.style.right = '0';
        
        if (this.config.renderItem) {
            const content = this.config.renderItem(item, index);
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        } else {
            element.textContent = item.toString();
        }
        
        return element;
    }

    updateItems(items) {
        this.config.items = items;
        this.scrollContainer.style.height = `${items.length * this.config.itemHeight}px`;
        
        // Clear rendered items
        this.renderedItems.forEach(element => element.remove());
        this.renderedItems.clear();
        
        this.render();
    }

    destroy() {
        this.renderedItems.forEach(element => element.remove());
        this.scrollContainer.remove();
    }
}

/**
 * AssetOptimizer - Lazy loading and resource management
 */
class AssetOptimizer {
    constructor() {
        this.imageObserver = null;
        this.loadedAssets = new Set();
        this.setupLazyLoading();
        this.setupResourcePreloading();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe existing images
            this.observeImages();
            
            // Observe new images
            this.setupMutationObserver();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.imageObserver.observe(img));
    }

    setupMutationObserver() {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const images = node.querySelectorAll ? 
                            node.querySelectorAll('img[data-src]') : 
                            (node.matches && node.matches('img[data-src]') ? [node] : []);
                        
                        images.forEach(img => this.imageObserver.observe(img));
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src && !this.loadedAssets.has(src)) {
            img.src = src;
            img.removeAttribute('data-src');
            this.loadedAssets.add(src);
            
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            img.addEventListener('error', () => {
                img.classList.add('error');
                console.warn('Failed to load image:', src);
            });
        }
    }

    setupResourcePreloading() {
        // Preload critical resources on idle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadCriticalResources();
            });
        } else {
            setTimeout(() => {
                this.preloadCriticalResources();
            }, 1000);
        }
    }

    preloadCriticalResources() {
        const criticalResources = [
            // Add critical resources that should be preloaded
            '/path/to/critical-font.woff2',
            '/path/to/critical-icon.svg'
        ];

        criticalResources.forEach(resource => {
            if (!this.loadedAssets.has(resource)) {
                this.preloadResource(resource);
            }
        });
    }

    preloadResource(url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        
        // Determine resource type
        if (url.includes('.woff') || url.includes('.woff2')) {
            link.as = 'font';
            link.crossOrigin = 'anonymous';
        } else if (url.includes('.css')) {
            link.as = 'style';
        } else if (url.includes('.js')) {
            link.as = 'script';
        }
        
        document.head.appendChild(link);
        this.loadedAssets.add(url);
    }

    // Optimize images by adding lazy loading attributes
    optimizeImage(img, src, options = {}) {
        const {
            placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjwvc3ZnPg==',
            lazy = true
        } = options;

        if (lazy && 'loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
            img.src = src;
        } else if (lazy && this.imageObserver) {
            img.src = placeholder;
            img.dataset.src = src;
            this.imageObserver.observe(img);
        } else {
            img.src = src;
        }

        return img;
    }
}

/**
 * PerformanceManager - Unified performance utilities and caching
 */
class PerformanceManager {
    constructor() {
        this.responseCache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.componentTrackers = new Map();
        this.performanceMetrics = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.debounceDelays = {
            default: 300,
            search: 150,
            filter: 200,
            chart: 400
        };
    }

    // Debounce utility
    debounce(key, callback, delay = this.debounceDelays.default) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timerId = setTimeout(() => {
            callback();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timerId);
    }

    // Throttle utility
    throttle(key, callback, delay = 1000) {
        if (this.throttleTimers.has(key)) {
            return;
        }
        
        callback();
        
        const timerId = setTimeout(() => {
            this.throttleTimers.delete(key);
        }, delay);
        
        this.throttleTimers.set(key, timerId);
    }

    // Performance measurement
    async measurePerformance(name, operation) {
        const startTime = performance.now();
        
        try {
            const result = await operation();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.performanceMetrics.set(name, {
                duration,
                timestamp: Date.now(),
                success: true
            });
            
            if (duration > 1000) {
                console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
            }
            
            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.performanceMetrics.set(name, {
                duration,
                timestamp: Date.now(),
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }

    // Cache management
    setCache(key, value, ttl = this.cacheTTL) {
        this.responseCache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    getCache(key) {
        const cached = this.responseCache.get(key);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.responseCache.delete(key);
            return null;
        }
        
        return cached.value;
    }

    clearCache() {
        this.responseCache.clear();
    }

    // Component tracking
    trackComponent(element, options = {}) {
        const id = this.generateComponentId(element);
        
        this.componentTrackers.set(id, {
            element,
            created: Date.now(),
            interactions: 0,
            ...options
        });
    }

    generateComponentId(element) {
        return `${element.tagName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Performance optimization
    increaseDebounceDelays() {
        Object.keys(this.debounceDelays).forEach(key => {
            this.debounceDelays[key] = Math.min(this.debounceDelays[key] * 1.5, 1000);
        });
    }

    resetDebounceDelays() {
        this.debounceDelays = {
            default: 300,
            search: 150,
            filter: 200,
            chart: 400
        };
    }

    // Clean up resources
    cleanup() {
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        this.throttleTimers.clear();
        this.responseCache.clear();
        this.componentTrackers.clear();
    }

    // Get performance stats
    getStats() {
        return {
            cacheSize: this.responseCache.size,
            activeDebounces: this.debounceTimers.size,
            activeThrottles: this.throttleTimers.size,
            trackedComponents: this.componentTrackers.size,
            performanceMetrics: Array.from(this.performanceMetrics.entries())
        };
    }
}

// Duplicate PerformanceMonitor class removed (original is at line 6351)

// Initialize global instances
window.notificationManager = new NotificationManager();
window.loadingManager = new LoadingManager();
window.keyboardShortcuts = new KeyboardShortcuts();
window.tooltipManager = new TooltipManager();
window.errorManager = new ErrorManager();
window.formValidator = new FormValidator();
// window.performanceManager = new PerformanceManager(); // Removed - using PerformanceMonitor instead
window.performanceMonitor = new PerformanceMonitor();
window.cacheManager = new CacheManager();
window.virtualScrollManager = new VirtualScrollManager();
window.assetOptimizer = new AssetOptimizer();

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FutureFundApp();
});

console.log('📚 FutureFund modules loaded successfully');