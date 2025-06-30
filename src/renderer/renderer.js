// FutureFund Renderer - Main Frontend Logic
class FutureFundApp {
    constructor() {
        this.currentTab = 'ledger';
        this.currentScenario = 'base';
        this.financialData = [];
        this.scenarios = new Map();
        this.chatHistory = [];
        
        this.init();
    }

    async init() {
        console.log('FutureFund initializing...');
        
        // Initialize UI components
        this.initializeTabs();
        this.initializeEventListeners();
        this.initializeData();
        
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

        // New scenario button
        document.getElementById('newScenarioBtn').addEventListener('click', () => {
            this.createNewScenario();
        });

        // Toggle view button
        document.getElementById('toggleView').addEventListener('click', () => {
            this.toggleLedgerView();
        });
    }

    async initializeData() {
        // Initialize with mock financial data
        this.financialData = this.generateMockData();
        
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

        // Generate future projections
        const futureStartDate = new Date();
        for (let i = 1; i <= 365; i++) {
            const date = new Date(futureStartDate);
            date.setDate(date.getDate() + i);
            
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
            
            if (Math.random() < 0.3) {
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
        try {
            console.log('Scenarios loaded:', this.scenarios.size, 'scenarios');
            this.updateScenarioSelector();
        } catch (error) {
            console.error('Error loading scenarios:', error);
        }
    }

    refreshLedger() {
        this.updateSummaryCards();
        this.updateLedgerTable();
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('balance') || lowerMessage.includes('much will i have')) {
            const balance = this.financialData.find(d => d.isProjected)?.balance || 0;
            return `Based on your current financial trajectory, you're projected to have ${this.formatCurrency(balance)} in your account by the end of next year.`;
        }
        
        if (lowerMessage.includes('retirement')) {
            return `For retirement planning, I recommend focusing on consistent savings and investment growth. Based on your current savings rate, you might want to consider increasing your monthly contributions.`;
        }
        
        if (lowerMessage.includes('house') || lowerMessage.includes('home')) {
            return `For home buying, I can help you plan based on your projected savings. Typically, you'll want 10-20% down payment plus closing costs.`;
        }
        
        return `I understand you're asking about "${message}". I can help you analyze your financial projections and scenarios.`;
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
    }

    createScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.innerHTML = `
            <h3>${scenario.name}</h3>
            <p>${scenario.description}</p>
            <div class="scenario-actions">
                <button class="btn btn-primary" onclick="app.selectScenario('${scenario.id}')">
                    Select
                </button>
            </div>
        `;
        return card;
    }

    selectScenario(scenarioId) {
        this.currentScenario = scenarioId;
        document.getElementById('scenarioSelect').value = scenarioId;
        this.refreshLedger();
        this.switchTab('ledger');
    }

    createNewScenario() {
        const name = prompt('Enter scenario name:');
        if (!name) return;
        
        const description = prompt('Enter scenario description:');
        if (!description) return;
        
        const id = name.toLowerCase().replace(/\s+/g, '-');
        
        this.scenarios.set(id, {
            id: id,
            name: name,
            description: description,
            parameters: {},
            createdAt: new Date().toISOString()
        });
        
        this.updateScenarioSelector();
        this.refreshScenarios();
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

    toggleLedgerView() {
        alert('Chart view coming soon!');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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