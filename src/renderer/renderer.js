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
        
        this.init();
    }

    async init() {
        console.log('FutureFund initializing...');
        
        // Initialize UI components
        this.initializeTabs();
        this.initializeEventListeners();
        this.initializeData();
        
        // Initialize chart service
        this.initializeChartService();
        
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
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch(tabName) {
            case 'ledger':
                this.refreshLedger();
                break;
            case 'chat':
                this.focusChatInput();
                break;
            case 'scenarios':
                this.refreshScenarios();
                break;
        }
    }

    initializeEventListeners() {
        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncData();
        });

        // Scenario selector
        document.getElementById('scenarioSelect').addEventListener('change', (e) => {
            this.currentScenario = e.target.value;
            this.refreshLedger();
        });

        // Date range selector
        document.getElementById('dateRange').addEventListener('change', () => {
            this.refreshLedger();
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
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = this.getQuickQuestion(e.target.textContent);
                document.getElementById('chatInput').value = question;
                this.sendChatMessage();
            });
        });

        // Chat management buttons
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearConversation();
        });

        document.getElementById('chatSummaryBtn').addEventListener('click', () => {
            this.showChatSummary();
        });

        document.getElementById('chatHealthBtn').addEventListener('click', () => {
            this.checkChatHealth();
        });

        // New scenario button
        document.getElementById('newScenarioBtn').addEventListener('click', () => {
            this.createNewScenario();
        });

        // Toggle view button
        document.getElementById('toggleView').addEventListener('click', () => {
            this.toggleLedgerView();
        });

        // Chart control event listeners
        document.getElementById('categoryChartType')?.addEventListener('change', (e) => {
            this.updateCategoryChart(e.target.value);
        });

        document.getElementById('trendsTimeframe')?.addEventListener('change', (e) => {
            this.updateTrendsChart(parseInt(e.target.value));
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
        
        const filteredData = this.getFilteredData(dateRange);
        
        tbody.innerHTML = '';
        
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
            
            tbody.appendChild(row);
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
        try {
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
            const result = await electronAPI.askChatbot(message, context);
            
            if (result.success) {
                // Store additional response data for debugging
                if (result.parsedQuery && result.confidence) {
                    console.log('Chat response metadata:', {
                        intent: result.parsedQuery.intent,
                        confidence: result.confidence,
                        sessionId: result.sessionId
                    });
                }
                
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
        grid.innerHTML = '';
        
        this.scenarios.forEach((scenario, id) => {
            const card = this.createScenarioCard(scenario);
            grid.appendChild(card);
        });
        
        // Load scenarios from database if needed
        if (this.scenarios.size <= 1) { // Only base scenario
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
        const formData = new FormData(form);
        const preview = document.getElementById('scenarioPreview');
        
        const scenarioData = {
            name: formData.get('scenarioName'),
            description: formData.get('scenarioDescription'),
            template: this.selectedTemplate,
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
        const template = this.getScenarioTemplates().find(t => t.id === this.selectedTemplate);
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
        try {
            const result = await electronAPI.getScenarios();
            
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
                
                // Update UI
                this.refreshScenarios();
                this.updateScenarioSelector();
            }
        } catch (error) {
            console.error('Error loading scenarios:', error);
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