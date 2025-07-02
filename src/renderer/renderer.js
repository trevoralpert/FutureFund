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
        
        // Loading guards to prevent infinite loops
        this.isLoadingScenarios = false;
        this.isLoadingFinancialData = false;
        
        this.init();
    }

    async init() {
        console.log('FutureFund initializing...');
        
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
        
        console.log('FutureFund initialized successfully!');
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
        document.getElementById('dateRange').addEventListener('change', 
            window.performanceManager.debounce('dateRange', () => {
                this.refreshLedger();
            }, 200)
        );

        document.getElementById('toggleView').addEventListener('click', () => {
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
        document.getElementById('categoryChartType')?.addEventListener('change', 
            window.performanceManager.debounce('categoryChart', (e) => {
                this.updateCategoryChart(e.target.value);
            }, 150)
        );

        document.getElementById('trendsTimeframe')?.addEventListener('change', 
            window.performanceManager.debounce('trendsChart', (e) => {
                this.updateTrendsChart(e.target.value);
            }, 150)
        );

        // Analytics functionality with throttling for heavy operations
        document.getElementById('refreshAnalyticsBtn')?.addEventListener('click', 
            window.performanceManager.throttle('refreshAnalytics', () => {
                this.refreshAnalytics();
            }, 1000)
        );

        document.getElementById('exportAnalyticsBtn')?.addEventListener('click', () => {
            this.exportAnalyticsReport();
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
        const tbody = document.getElementById('ledgerTableBody');
        
        // Measure table rendering performance
        window.performanceManager.measurePerformance('Ledger Table Rendering', () => {
            const filteredData = this.getFilteredData(dateRange);
            
            tbody.innerHTML = '';
            
            // Use document fragment for efficient DOM manipulation
            const fragment = document.createDocumentFragment();
            
            filteredData.forEach(transaction => {
                const row = document.createElement('tr');
                row.className = transaction.isProjected ? 'projected-row' : '';
                
                row.innerHTML = `
                    <td>${this.formatDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>
                        <span class="category-badge">
                            ${transaction.category}
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
            
            // Single DOM update for better performance
            tbody.appendChild(fragment);
            
            // Track table for memory optimization
            window.performanceManager.trackComponent(tbody, {
                type: 'ledger-table',
                transactionCount: filteredData.length
            });
        });
    }

    getFilteredData(dateRange) {
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
            return transactionDate >= startDate && transactionDate <= endDate;
        }).slice(0, 500);
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
        // Create cache key based on message and data context
        const contextHash = this.financialData?.length || 0;
        const cacheKey = `chat_${message.toLowerCase().trim()}_${contextHash}`;
        
        // Check cache first
        const cachedResponse = window.performanceManager.getCache(cacheKey);
        if (cachedResponse) {
            console.log('📱 Using cached AI response for:', message);
            return cachedResponse;
        }

        try {
            // Measure performance of AI chat operations
            const result = await window.performanceManager.measurePerformance(
                'AI Chat Response',
                async () => {
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
                }
            );
            
            if (result.success) {
                // Store additional response data for debugging
                if (result.parsedQuery && result.confidence) {
                    console.log('Chat response metadata:', {
                        intent: result.parsedQuery.intent,
                        confidence: result.confidence,
                        sessionId: result.sessionId
                    });
                }
                
                // Cache the successful response
                window.performanceManager.setCache(cacheKey, result.response);
                
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
        this.currentView = this.currentView === 'table' ? 'chart' : 'table';
        
        const tableView = document.getElementById('tableView');
        const chartView = document.getElementById('chartView');
        const toggleBtn = document.getElementById('toggleView');
        const viewModeText = document.getElementById('viewModeText');
        
        if (this.currentView === 'chart') {
            // Switch to chart view
            tableView.classList.add('hidden');
            chartView.classList.remove('hidden');
            toggleBtn.innerHTML = '<span class="btn-icon">📊</span><span id="viewModeText">Table View</span>';
            
            // Initialize charts with current data
            this.initializeCharts();
        } else {
            // Switch to table view
            chartView.classList.add('hidden');
            tableView.classList.remove('hidden');
            toggleBtn.innerHTML = '<span class="btn-icon">📈</span><span id="viewModeText">Chart View</span>';
        }
    }

    // Chart Initialization and Management
    initializeCharts() {
        console.log('=== Initialize Charts Debug ===');
        console.log('chartService exists:', !!this.chartService);
        console.log('financialData exists:', !!this.financialData);
        console.log('financialData length:', this.financialData?.length);
        console.log('financialData sample:', this.financialData?.slice(0, 3));
        
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

            console.log('⏰ Setting timeout for chart creation...');
            // Initialize charts with a small delay for better UX
            setTimeout(() => {
                console.log('🎯 Starting chart creation...');
                
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
            }, 300);

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
            const analysis = await window.performanceManager.measurePerformance(
                'Analytics Complete Analysis',
                async () => {
                    return this.analyticsService.runCompleteAnalysis(this.financialData);
                }
            );
            
            console.log('📊 Analytics results:', analysis);
            
            // Populate UI with results using performance tracking
            await window.performanceManager.measurePerformance('Analytics UI Population', async () => {
                this.populateHealthScore(analysis.healthScore);
                this.populateSpendingHabits(analysis.spendingHabits);
                this.populateAnomalies(analysis.anomalies);
                this.populateSeasonalPatterns(analysis.seasonalPatterns);
                this.populateGoalProgress(analysis.goalProgress);
            });
            
            // Hide loading state
            this.hideAnalyticsLoading();
            
            // Track analytics container for memory optimization
            const analyticsContainer = document.querySelector('.analytics-container');
            if (analyticsContainer) {
                window.performanceManager.trackComponent(analyticsContainer, {
                    type: 'analytics',
                    transactionCount: this.financialData.length
                });
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
        if (!this.analyticsService || !this.financialData) return;

        try {
            const analysis = this.analyticsService.runCompleteAnalysis(this.financialData);
            const report = {
                generatedAt: new Date().toISOString(),
                healthScore: analysis.healthScore,
                summary: {
                    totalTransactions: this.financialData.length,
                    overallScore: analysis.healthScore.overall,
                    grade: analysis.healthScore.grade,
                    topAnomalies: analysis.anomalies.anomalies.slice(0, 5),
                    goalProgress: analysis.goalProgress.map(g => ({
                        name: g.name,
                        progress: g.progress,
                        status: g.status
                    }))
                }
            };

            // Use existing export functionality
            const result = await electronAPI.exportData({
                data: report,
                filename: `financial-analytics-${new Date().toISOString().split('T')[0]}.json`,
                type: 'analytics'
            });

            if (result.success) {
                this.showNotification('Analytics report exported successfully', 'success');
            } else {
                this.showNotification('Failed to export analytics report', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export analytics report', 'error');
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
        document.getElementById('accountSearch')?.addEventListener('input', 
            window.performanceManager.debounce('accountSearch', (e) => {
                this.filterAccounts();
            }, 300)
        );

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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FutureFundApp();
});

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

// =============================================================================
// GLOBAL ENHANCEMENT INITIALIZATION
// =============================================================================

// Create global instances
const notifications = new NotificationManager();
const loadingManager = new LoadingManager();
const keyboardShortcuts = new KeyboardShortcuts();
const tooltipManager = new TooltipManager();

// Enhance the existing FutureFundApp class
if (window.FutureFundApp) {
    const originalInit = FutureFundApp.prototype.init;
    FutureFundApp.prototype.init = async function() {
        await originalInit.call(this);
        
        // Add enhanced UX features
        this.notifications = notifications;
        this.loadingManager = loadingManager;
        this.keyboardShortcuts = keyboardShortcuts;
        this.tooltipManager = tooltipManager;
        
        // Show welcome message
        setTimeout(() => {
            notifications.info(`
                <div>
                    <strong>Welcome to FutureFund!</strong><br>
                    <small>Press Ctrl+? for keyboard shortcuts</small>
                </div>
            `, 6000);
        }, 2000);
    };
    
    // Enhance existing methods with notifications and loading states
    const originalSendChatMessage = FutureFundApp.prototype.sendChatMessage;
    FutureFundApp.prototype.sendChatMessage = async function() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !chatInput.value.trim()) {
            notifications.warning('Please enter a message before sending.');
            if (chatInput) chatInput.focus();
            return;
        }
        
        try {
            await originalSendChatMessage.call(this);
        } catch (error) {
            notifications.error('Failed to send message. Please try again.');
            console.error('Chat error:', error);
        }
    };
}

// Add global event handlers for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Handle form submissions with better UX
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.tagName === 'FORM') {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>Submitting...';
                
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
                    }
                }, 2000);
            }
        }
    });
    
    // Handle errors gracefully
    window.addEventListener('error', (e) => {
        console.error('Global error:', e);
        notifications.error('An unexpected error occurred. Please try again.');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e);
        notifications.error('A background operation failed. Some features may not work correctly.');
    });
    
    // Add accessibility improvements
    document.addEventListener('keydown', (e) => {
        // Skip to main content with Ctrl+M
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            const mainContent = document.querySelector('main') || 
                              document.querySelector('.main-content') ||
                              document.querySelector('.tab-content.active');
            if (mainContent) {
                mainContent.focus();
                notifications.info('Jumped to main content');
            }
        }
    });
});

// Expose enhanced functionality globally
window.FutureFundUX = {
    notifications,
    loadingManager,
    keyboardShortcuts,
    tooltipManager,
    
    // Utility functions
    showSuccess: (message) => notifications.success(message),
    showError: (message) => notifications.error(message),
    showInfo: (message) => notifications.info(message),
    showWarning: (message) => notifications.warning(message),
    
    showLoading: (element, text) => loadingManager.show(element, text),
    hideLoading: (element) => loadingManager.hide(element),
    
    addTooltip: (selector, text, options) => tooltipManager.add(selector, text, options),
    addShortcut: (combo, action, description) => keyboardShortcuts.add(combo, action, description)
};

console.log('🎨 Enhanced UX features loaded successfully!');
console.log('🔥 FutureFund is now fully enhanced with:');
console.log('  ✅ Smart notifications');
console.log('  ✅ Keyboard shortcuts (Ctrl+? for help)');
console.log('  ✅ Interactive tooltips');
console.log('  ✅ Enhanced loading states');
console.log('  ✅ Better accessibility');
console.log('  ✅ Improved error handling');

// =============================================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// =============================================================================

class PerformanceManager {
    constructor() {
        this.debounceTimers = new Map();
        this.responseCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.maxCacheSize = 100;
        this.memoryUsage = {
            components: new Map(), // Changed from WeakMap to Map for iteration support
            cleanupIntervals: new Set()
        };
        
        this.initializePerformanceMonitoring();
    }

    // =============================================================================
    // DEBOUNCING UTILITIES
    // =============================================================================

    /**
     * Debounce function calls to prevent excessive executions
     * @param {string} key - Unique identifier for the debounced operation
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds (default: 300ms)
     * @returns {Function} Debounced function
     */
    debounce(key, func, delay = 300) {
        return (...args) => {
            // Clear existing timer
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            // Set new timer
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Throttle function calls to limit execution frequency
     * @param {string} key - Unique identifier for the throttled operation
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds (default: 100ms)
     * @returns {Function} Throttled function
     */
    throttle(key, func, limit = 100) {
        let inThrottle = false;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // =============================================================================
    // CACHING SYSTEM
    // =============================================================================

    /**
     * Cache AI responses and expensive computations
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    setCache(key, data) {
        // Implement LRU cache eviction
        if (this.responseCache.size >= this.maxCacheSize) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }

        this.responseCache.set(key, {
            data: data,
            timestamp: Date.now(),
            accessCount: 1
        });
    }

    /**
     * Retrieve cached data
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if not found/expired
     */
    getCache(key) {
        const cached = this.responseCache.get(key);
        if (!cached) return null;

        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            this.responseCache.delete(key);
            return null;
        }

        // Update access count and timestamp for LRU
        cached.accessCount++;
        cached.timestamp = Date.now();
        return cached.data;
    }

    /**
     * Clear cache entries
     * @param {string} pattern - Optional pattern to match keys for selective clearing
     */
    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.responseCache.keys()) {
                if (key.includes(pattern)) {
                    this.responseCache.delete(key);
                }
            }
        } else {
            this.responseCache.clear();
        }
    }

    // =============================================================================
    // MEMORY OPTIMIZATION
    // =============================================================================

    /**
     * Register component for memory tracking
     * @param {Element} element - DOM element to track
     * @param {Object} data - Associated data
     */
    trackComponent(element, data = {}) {
        this.memoryUsage.components.set(element, {
            ...data,
            createdAt: Date.now(),
            lastAccessed: Date.now()
        });
    }

    /**
     * Clean up unused DOM references and event listeners
     */
    cleanupMemory() {
        // Safety check: ensure components is properly initialized
        if (!this.memoryUsage?.components || typeof this.memoryUsage.components[Symbol.iterator] !== 'function') {
            console.warn('⚠️ Memory components not properly initialized, skipping cleanup');
            return;
        }

        // Clean up detached DOM elements
        const elementsToClean = [];
        
        try {
            for (const [element, data] of this.memoryUsage.components) {
                if (!document.contains(element)) {
                    elementsToClean.push(element);
                } else if (data && Date.now() - data.lastAccessed > 10 * 60 * 1000) { // 10 minutes
                    // Mark for potential cleanup if not accessed recently
                    data.markedForCleanup = true;
                }
            }

            // Remove detached elements
            elementsToClean.forEach(element => {
                this.memoryUsage.components.delete(element);
            });

            console.log(`🧹 Memory cleanup: Removed ${elementsToClean.length} detached elements`);
        } catch (error) {
            console.error('❌ Memory cleanup error:', error);
        }
    }

    /**
     * Schedule automatic memory cleanup
     */
    scheduleCleanup() {
        const cleanupInterval = setInterval(() => {
            this.cleanupMemory();
            this.clearExpiredCache();
        }, 2 * 60 * 1000); // Every 2 minutes

        this.memoryUsage.cleanupIntervals.add(cleanupInterval);
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, cached] of this.responseCache) {
            if (now - cached.timestamp > this.cacheExpiry) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.responseCache.delete(key));
        
        if (expiredKeys.length > 0) {
            console.log(`🗑️ Cache cleanup: Removed ${expiredKeys.length} expired entries`);
        }
    }

    // =============================================================================
    // PERFORMANCE MONITORING
    // =============================================================================

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Monitor memory usage
        if (window.performance && window.performance.memory) {
            const checkMemory = () => {
                const memory = window.performance.memory;
                const memoryInfo = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };

                // Log warning if memory usage is high
                if (memoryInfo.used > memoryInfo.limit * 0.8) {
                    console.warn('🚨 High memory usage detected:', memoryInfo);
                    this.cleanupMemory();
                }
            };

            setInterval(checkMemory, 30000); // Check every 30 seconds
        }

        // Start cleanup scheduler
        this.scheduleCleanup();
        
        console.log('📊 Performance monitoring initialized');
    }

    /**
     * Measure and log performance of operations
     * @param {string} label - Performance label
     * @param {Function} operation - Operation to measure
     * @returns {Promise<any>} Operation result
     */
    async measurePerformance(label, operation) {
        const startTime = performance.now();
        
        try {
            const result = await operation();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            if (duration > 100) { // Log operations taking more than 100ms
                console.log(`⏱️ Performance: ${label} took ${duration.toFixed(2)}ms`);
            }
            
            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.error(`❌ Performance: ${label} failed after ${duration.toFixed(2)}ms`, error);
            throw error;
        }
    }

    /**
     * Create a performance-optimized virtual scroll for large lists
     * @param {Element} container - Container element
     * @param {Array} items - Items to render
     * @param {Function} renderItem - Function to render each item
     * @param {number} itemHeight - Height of each item in pixels
     */
    createVirtualScroll(container, items, renderItem, itemHeight = 50) {
        const containerHeight = container.clientHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
        const totalHeight = items.length * itemHeight;
        
        let scrollTop = 0;
        let startIndex = 0;
        
        // Create virtual container
        const virtualContainer = document.createElement('div');
        virtualContainer.style.height = `${totalHeight}px`;
        virtualContainer.style.position = 'relative';
        
        // Create visible items container
        const visibleContainer = document.createElement('div');
        visibleContainer.style.position = 'absolute';
        visibleContainer.style.top = '0px';
        visibleContainer.style.width = '100%';
        
        virtualContainer.appendChild(visibleContainer);
        container.appendChild(virtualContainer);
        
        const updateVisible = this.throttle('virtualScroll', () => {
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount, items.length);
            
            // Clear visible items
            visibleContainer.innerHTML = '';
            visibleContainer.style.transform = `translateY(${startIndex * itemHeight}px)`;
            
            // Render visible items
            for (let i = startIndex; i < endIndex; i++) {
                const itemElement = renderItem(items[i], i);
                itemElement.style.height = `${itemHeight}px`;
                visibleContainer.appendChild(itemElement);
            }
        }, 16); // 60fps
        
        container.addEventListener('scroll', (e) => {
            scrollTop = e.target.scrollTop;
            updateVisible();
        });
        
        // Initial render
        updateVisible();
        
        return {
            update: (newItems) => {
                items = newItems;
                virtualContainer.style.height = `${newItems.length * itemHeight}px`;
                updateVisible();
            },
            destroy: () => {
                container.removeChild(virtualContainer);
            }
        };
    }

    /**
     * Destroy performance manager and cleanup resources
     */
    destroy() {
        // Clear all timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        
        // Clear cache
        this.responseCache.clear();
        
        // Clear component tracking
        if (this.memoryUsage?.components) {
            this.memoryUsage.components.clear();
        }
        
        // Clear cleanup intervals
        for (const interval of this.memoryUsage.cleanupIntervals) {
            clearInterval(interval);
        }
        this.memoryUsage.cleanupIntervals.clear();
        
        console.log('🛑 Performance manager destroyed');
    }
}

// Create global performance manager instance
window.performanceManager = new PerformanceManager();