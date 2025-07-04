/**
 * Scenario Transaction Generation Engine
 * Converts scenario parameters into actual projected transactions
 * that can be integrated into the ledger and financial projections
 */

const crypto = require('crypto');

class ScenarioTransactionEngine {
    constructor() {
        this.generatedTransactions = new Map(); // scenarioId -> transactions[]
        this.impactCalculations = new Map(); // scenarioId -> impact data
        this.transactionTemplates = this.initializeTransactionTemplates();
    }

    /**
     * Initialize transaction templates for different scenario types
     */
    initializeTransactionTemplates() {
        return {
            job_change: {
                name: 'Job Change',
                transactionTypes: ['salary', 'final_paycheck', 'relocation_cost', 'benefits_gap'],
                requiredParams: ['newSalary', 'startDate', 'currentSalary']
            },
            salary_increase: {
                name: 'Salary Increase',
                transactionTypes: ['salary'],
                requiredParams: ['newSalary', 'startDate', 'currentSalary']
            },
            major_purchase: {
                name: 'Major Purchase',
                transactionTypes: ['down_payment', 'monthly_payment', 'insurance', 'maintenance'],
                requiredParams: ['totalCost', 'purchaseDate', 'downPayment']
            },
            home_buying: {
                name: 'Home Buying',
                transactionTypes: ['down_payment', 'mortgage_payment', 'property_tax', 'insurance', 'maintenance'],
                requiredParams: ['homePrice', 'downPayment', 'mortgageRate', 'purchaseDate']
            },
            debt_payoff: {
                name: 'Debt Payoff',
                transactionTypes: ['extra_payment', 'interest_savings'],
                requiredParams: ['extraPayment', 'startDate', 'currentBalance']
            },
            investment_strategy: {
                name: 'Investment Strategy',
                transactionTypes: ['contribution', 'dividends', 'capital_gains'],
                requiredParams: ['monthlyContribution', 'startDate', 'expectedReturn']
            },
            emergency_fund: {
                name: 'Emergency Fund',
                transactionTypes: ['contribution'],
                requiredParams: ['monthlyContribution', 'startDate', 'targetAmount']
            },
            expense_change: {
                name: 'Expense Change',
                transactionTypes: ['recurring_expense'],
                requiredParams: ['monthlyAmount', 'startDate', 'category']
            }
        };
    }

    /**
     * Generate projected transactions for a scenario
     */
    generateTransactionsForScenario(scenario) {
        console.log(`🔄 Generating transactions for scenario: ${scenario.name} (${scenario.type})`);
        
        try {
            // Clear any existing transactions for this scenario
            this.generatedTransactions.delete(scenario.id);
            
            // Validate scenario parameters
            const validationResult = this.validateScenarioParameters(scenario);
            if (!validationResult.isValid) {
                console.error(`❌ Scenario validation failed: ${validationResult.errors.join(', ')}`);
                return { success: false, errors: validationResult.errors };
            }

            // Generate transactions based on scenario type
            const transactions = this.generateTransactionsByType(scenario);
            
            // Store generated transactions
            this.generatedTransactions.set(scenario.id, transactions);
            
            // Calculate impact metrics
            const impact = this.calculateScenarioImpact(scenario, transactions);
            this.impactCalculations.set(scenario.id, impact);
            
            console.log(`✅ Generated ${transactions.length} transactions for scenario ${scenario.name}`);
            console.log(`💰 Calculated impact: ${impact.monthlyChange >= 0 ? '+' : ''}$${impact.monthlyChange.toFixed(2)}/month`);
            
            return {
                success: true,
                transactions,
                impact,
                scenarioId: scenario.id
            };
        } catch (error) {
            console.error(`❌ Error generating transactions for scenario ${scenario.id}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validate scenario parameters
     */
    validateScenarioParameters(scenario) {
        // Normalize scenario type to underscore format
        const normalizedType = this.normalizeScenarioType(scenario.type);
        const template = this.transactionTemplates[normalizedType];
        
        if (!template) {
            console.error(`❌ Unknown scenario type: "${scenario.type}" (normalized: "${normalizedType}")`);
            console.error(`📋 Available types:`, Object.keys(this.transactionTemplates));
            return {
                isValid: false,
                errors: [`Unknown scenario type: ${scenario.type} (expected one of: ${Object.keys(this.transactionTemplates).join(', ')})`]
            };
        }

        const errors = [];
        const params = scenario.parameters || {};

        // Parameter mapping: Handle UI parameter names vs backend expected names
        this.mapParameterNames(params, normalizedType);

        // Check required parameters
        for (const requiredParam of template.requiredParams) {
            if (!params[requiredParam]) {
                // Provide sensible defaults for missing parameters
                if (requiredParam === 'currentSalary' && normalizedType === 'job_change') {
                    params.currentSalary = 75000; // Default current salary
                    console.log(`ℹ️ Using default currentSalary: $${params.currentSalary}`);
                } else if (requiredParam === 'mortgageRate' && normalizedType === 'home_buying') {
                    params.mortgageRate = 6.5; // Default mortgage rate
                    console.log(`ℹ️ Using default mortgageRate: ${params.mortgageRate}%`);
                } else if (requiredParam === 'homePrice' && normalizedType === 'home_buying' && params.totalCost) {
                    params.homePrice = params.totalCost; // Map totalCost to homePrice
                    console.log(`ℹ️ Mapped totalCost to homePrice: $${params.homePrice}`);
                } else {
                    errors.push(`Missing required parameter: ${requiredParam}`);
                }
            }
        }

        // Type-specific validation using normalized type
        if (normalizedType === 'job_change' || normalizedType === 'salary_increase') {
            if (params.newSalary && params.currentSalary && params.newSalary <= 0) {
                errors.push('New salary must be positive');
            }
        }

        if (normalizedType === 'home_buying') {
            if (params.homePrice && params.homePrice <= 0) {
                errors.push('Home price must be positive');
            }
            if (params.downPayment && params.homePrice && params.downPayment > params.homePrice) {
                errors.push('Down payment cannot exceed home price');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Map UI parameter names to backend expected parameter names
     */
    mapParameterNames(params, normalizedType) {
        // Common parameter mappings
        const parameterMappings = {
            'targetDate': 'purchaseDate',  // UI sends targetDate, backend expects purchaseDate
            'totalCost': 'homePrice',      // For home buying scenarios
        };

        // Type-specific mappings
        const typeSpecificMappings = {
            'major_purchase': {
                'targetDate': 'purchaseDate'
            },
            'home_buying': {
                'targetDate': 'purchaseDate',
                'totalCost': 'homePrice'
            }
        };

        // Apply common mappings
        for (const [uiParam, backendParam] of Object.entries(parameterMappings)) {
            if (params[uiParam] !== undefined && params[backendParam] === undefined) {
                params[backendParam] = params[uiParam];
                console.log(`🔄 Mapped parameter: ${uiParam} -> ${backendParam} = ${params[backendParam]}`);
            }
        }

        // Apply type-specific mappings
        if (typeSpecificMappings[normalizedType]) {
            for (const [uiParam, backendParam] of Object.entries(typeSpecificMappings[normalizedType])) {
                if (params[uiParam] !== undefined && params[backendParam] === undefined) {
                    params[backendParam] = params[uiParam];
                    console.log(`🔄 Type-specific mapping for ${normalizedType}: ${uiParam} -> ${backendParam} = ${params[backendParam]}`);
                }
            }
        }

        // Update the scenario parameters with mapped values
        if (params.targetDate && params.purchaseDate) {
            console.log(`✅ Parameter mapping complete. Using purchaseDate: ${params.purchaseDate}`);
        }
    }

    /**
     * Normalize scenario type from human-readable to underscore format
     */
    normalizeScenarioType(type) {
        if (!type) return '';
        
        // Handle common mappings
        const typeMap = {
            'Job Change': 'job_change',
            'AI Engineering Career Move': 'job_change', // Backwards compatibility for old scenarios
            'Salary Increase': 'salary_increase', 
            'Major Purchase': 'major_purchase',
            'Home Buying': 'home_buying',
            'Debt Payoff': 'debt_payoff',
            'Investment Strategy': 'investment_strategy',
            'Emergency Fund': 'emergency_fund',
            'Expense Change': 'expense_change'
        };
        
        // Return mapped value if exists, otherwise convert spaces to underscores and lowercase
        return typeMap[type] || type.toLowerCase().replace(/\s+/g, '_');
    }

    /**
     * Generate transactions by scenario type
     */
    generateTransactionsByType(scenario) {
        const normalizedType = this.normalizeScenarioType(scenario.type);
        const methodName = `generate${normalizedType.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)).join('')}Transactions`;
        
        console.log(`🔍 Generating transactions for type: "${scenario.type}" -> "${normalizedType}" -> method: "${methodName}"`);
        
        if (typeof this[methodName] === 'function') {
            return this[methodName](scenario);
        } else {
            console.warn(`⚠️ No transaction generator for scenario type: ${scenario.type} (normalized: ${normalizedType})`);
            return this.generateGenericTransactions(scenario);
        }
    }

    /**
     * Generate transactions for job change scenarios
     */
    generateJobChangeTransactions(scenario) {
        // Map parameter names for backwards compatibility
        const startDate = scenario.parameters.startDate || scenario.parameters.transitionDate;
        const { newSalary, currentSalary, movingCosts, benefitsGap } = scenario.parameters;
        const transactions = [];
        
        console.log('🔍 Job Change Parameters received:', {
            newSalary,
            startDate,
            currentSalary,
            movingCosts,
            benefitsGap,
            transitionDate: scenario.parameters.transitionDate,
            allParams: scenario.parameters
        });
        
        // Convert string parameters to numbers for calculations
        const newSalaryNum = parseFloat(newSalary) || 0;
        const currentSalaryNum = parseFloat(currentSalary) || 75000;
        const movingCostsNum = parseFloat(movingCosts) || 0;
        
        console.log('🔍 Converted parameters:', {
            newSalaryNum,
            currentSalaryNum,
            movingCostsNum
        });
        
        const start = new Date(startDate);
        const finalPaycheckDate = new Date(start);
        finalPaycheckDate.setDate(start.getDate() - 1);
        
        // Final paycheck from old job
        if (currentSalaryNum > 0) {
            const finalPayAmount = (currentSalaryNum / 12) * 0.7; // After taxes
            console.log('💰 Final paycheck amount:', finalPayAmount);
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: finalPaycheckDate,
                description: 'Final Paycheck - Previous Job',
                category: 'Income',
                amount: finalPayAmount,
                type: 'income',
                tags: ['scenario', 'job_change', 'final_paycheck']
            }));
        }

        // Moving costs (if any)
        if (movingCostsNum > 0) {
            const relocationDate = new Date(start);
            relocationDate.setDate(start.getDate() - 7); // Week before starting
            
            console.log('💰 Moving costs amount:', -movingCostsNum);
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: relocationDate,
                description: 'Moving/Relocation Expenses',
                category: 'Moving',
                amount: -movingCostsNum,
                type: 'expense',
                tags: ['scenario', 'job_change', 'relocation']
            }));
        }

        // Monthly salary payments from new job
        const monthlyNetSalary = (newSalaryNum / 12) * 0.75; // After taxes and benefits
        console.log('💰 Monthly net salary amount:', monthlyNetSalary);
        
        const endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        let currentPayDate = new Date(start);
        currentPayDate.setDate(15); // Mid-month payday
        
        while (currentPayDate <= endDate) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentPayDate),
                description: `Salary - New Job`,
                category: 'Income',
                amount: monthlyNetSalary,
                type: 'income',
                tags: ['scenario', 'job_change', 'salary']
            }));
            
            currentPayDate.setMonth(currentPayDate.getMonth() + 1);
        }

        console.log(`✅ Generated ${transactions.length} job change transactions:`, transactions.map(t => ({
            date: t.date,
            description: t.description,
            amount: t.amount,
            category: t.category
        })));

        return transactions;
    }

    /**
     * Generate transactions for salary increase scenarios
     */
    generateSalaryIncreaseTransactions(scenario) {
        const { newSalary, startDate, currentSalary } = scenario.parameters;
        const transactions = [];
        
        const start = new Date(startDate);
        const endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        // Calculate the additional amount per month
        const currentMonthlyNet = (currentSalary / 12) * 0.75; // After taxes
        const newMonthlyNet = (newSalary / 12) * 0.75; // After taxes
        const additionalMonthlyAmount = newMonthlyNet - currentMonthlyNet;
        
        let currentPayDate = new Date(start);
        currentPayDate.setDate(15); // Mid-month payday
        
        while (currentPayDate <= endDate) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentPayDate),
                description: `Salary Increase - Additional Income`,
                category: 'Income',
                amount: additionalMonthlyAmount,
                type: 'income',
                tags: ['scenario', 'salary_increase', 'additional_income']
            }));
            
            currentPayDate.setMonth(currentPayDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate transactions for home buying scenarios
     */
    generateHomeBuyingTransactions(scenario) {
        const { homePrice, downPayment, mortgageRate, purchaseDate, loanTermYears } = scenario.parameters;
        const transactions = [];
        
        const purchaseDate_ = new Date(purchaseDate);
        const loanTerm = loanTermYears || 30;
        const annualRate = mortgageRate || 6.5;
        
        // Down payment
        transactions.push(this.createTransaction({
            scenarioId: scenario.id,
            date: purchaseDate_,
            description: 'Home Purchase - Down Payment',
            category: 'Housing',
            amount: -downPayment,
            type: 'expense',
            tags: ['scenario', 'home_buying', 'down_payment']
        }));

        // Closing costs (estimated 2-3% of home price)
        const closingCosts = homePrice * 0.025;
        transactions.push(this.createTransaction({
            scenarioId: scenario.id,
            date: purchaseDate_,
            description: 'Home Purchase - Closing Costs',
            category: 'Housing',
            amount: -closingCosts,
            type: 'expense',
            tags: ['scenario', 'home_buying', 'closing_costs']
        }));

        // Calculate monthly mortgage payment
        const loanAmount = homePrice - downPayment;
        const monthlyRate = annualRate / 100 / 12;
        const numPayments = loanTerm * 12;
        
        let monthlyPayment = 0;
        if (monthlyRate > 0) {
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            monthlyPayment = loanAmount / numPayments;
        }

        // Monthly mortgage payments
        let currentPaymentDate = new Date(purchaseDate_);
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        currentPaymentDate.setDate(1); // First of the month
        
        const endDate = new Date(purchaseDate_);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        while (currentPaymentDate <= endDate) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentPaymentDate),
                description: 'Mortgage Payment',
                category: 'Housing',
                amount: -monthlyPayment,
                type: 'expense',
                tags: ['scenario', 'home_buying', 'mortgage']
            }));
            
            currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        }

        // Property taxes (estimated 1.2% annually)
        const annualPropertyTax = homePrice * 0.012;
        const monthlyPropertyTax = annualPropertyTax / 12;
        
        currentPaymentDate = new Date(purchaseDate_);
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        currentPaymentDate.setDate(15); // Mid-month
        
        while (currentPaymentDate <= endDate) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentPaymentDate),
                description: 'Property Tax',
                category: 'Housing',
                amount: -monthlyPropertyTax,
                type: 'expense',
                tags: ['scenario', 'home_buying', 'property_tax']
            }));
            
            currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        }

        // Home insurance (estimated 0.5% annually)
        const annualInsurance = homePrice * 0.005;
        const monthlyInsurance = annualInsurance / 12;
        
        currentPaymentDate = new Date(purchaseDate_);
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        currentPaymentDate.setDate(20); // 20th of month
        
        while (currentPaymentDate <= endDate) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentPaymentDate),
                description: 'Home Insurance',
                category: 'Insurance',
                amount: -monthlyInsurance,
                type: 'expense',
                tags: ['scenario', 'home_buying', 'insurance']
            }));
            
            currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate transactions for major purchase scenarios
     */
    generateMajorPurchaseTransactions(scenario) {
        const { totalCost, purchaseDate, downPayment, monthlyPayment, loanTermMonths } = scenario.parameters;
        const transactions = [];
        
        const purchaseDate_ = new Date(purchaseDate);
        
        // Down payment
        if (downPayment && downPayment > 0) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: purchaseDate_,
                description: 'Major Purchase - Down Payment',
                category: 'Purchase',
                amount: -downPayment,
                type: 'expense',
                tags: ['scenario', 'major_purchase', 'down_payment']
            }));
        }

        // Monthly payments (if financed)
        if (monthlyPayment && monthlyPayment > 0 && loanTermMonths && loanTermMonths > 0) {
            let currentPaymentDate = new Date(purchaseDate_);
            currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
            currentPaymentDate.setDate(1); // First of the month
            
            for (let i = 0; i < loanTermMonths; i++) {
                if (currentPaymentDate > new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)) {
                    break; // Only project 2 years ahead
                }
                
                transactions.push(this.createTransaction({
                    scenarioId: scenario.id,
                    date: new Date(currentPaymentDate),
                    description: 'Major Purchase - Monthly Payment',
                    category: 'Purchase',
                    amount: -monthlyPayment,
                    type: 'expense',
                    tags: ['scenario', 'major_purchase', 'monthly_payment']
                }));
                
                currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
            }
        } else {
            // Full payment at purchase
            const fullPayment = totalCost - (downPayment || 0);
            if (fullPayment > 0) {
                transactions.push(this.createTransaction({
                    scenarioId: scenario.id,
                    date: purchaseDate_,
                    description: 'Major Purchase - Full Payment',
                    category: 'Purchase',
                    amount: -fullPayment,
                    type: 'expense',
                    tags: ['scenario', 'major_purchase', 'full_payment']
                }));
            }
        }

        return transactions;
    }

    /**
     * Generate transactions for investment strategy scenarios
     */
    generateInvestmentStrategyTransactions(scenario) {
        const { monthlyContribution, startDate, expectedReturn, investmentType } = scenario.parameters;
        const transactions = [];
        
        const start = new Date(startDate);
        const endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        let currentDate = new Date(start);
        currentDate.setDate(15); // Mid-month
        
        let investmentBalance = 0;
        
        while (currentDate <= endDate) {
            // Monthly contribution
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentDate),
                description: `${investmentType} Investment Contribution`,
                category: 'Investment',
                amount: -monthlyContribution,
                type: 'expense',
                tags: ['scenario', 'investment', 'contribution']
            }));
            
            investmentBalance += monthlyContribution;
            
            // Quarterly returns/dividends
            if (currentDate.getMonth() % 3 === 0) { // Every 3 months
                const quarterlyReturn = investmentBalance * (expectedReturn / 100 / 4);
                
                transactions.push(this.createTransaction({
                    scenarioId: scenario.id,
                    date: new Date(currentDate),
                    description: `${investmentType} Investment Returns`,
                    category: 'Investment',
                    amount: quarterlyReturn,
                    type: 'income',
                    tags: ['scenario', 'investment', 'returns']
                }));
                
                investmentBalance += quarterlyReturn;
            }
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate transactions for debt payoff scenarios
     */
    generateDebtPayoffTransactions(scenario) {
        const { extraPayment, startDate, currentBalance, interestRate } = scenario.parameters;
        const transactions = [];
        
        const start = new Date(startDate);
        const endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        let currentDate = new Date(start);
        currentDate.setDate(5); // 5th of month
        
        let remainingBalance = currentBalance;
        const monthlyInterestRate = (interestRate || 18) / 100 / 12;
        
        while (currentDate <= endDate && remainingBalance > 0) {
            // Extra payment
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentDate),
                description: 'Extra Debt Payment',
                category: 'Debt',
                amount: -extraPayment,
                type: 'expense',
                tags: ['scenario', 'debt_payoff', 'extra_payment']
            }));
            
            // Calculate interest saved
            const interestSaved = remainingBalance * monthlyInterestRate;
            remainingBalance = Math.max(0, remainingBalance - extraPayment + interestSaved);
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate transactions for emergency fund scenarios
     */
    generateEmergencyFundTransactions(scenario) {
        const { monthlyContribution, startDate, targetAmount } = scenario.parameters;
        const transactions = [];
        
        const start = new Date(startDate);
        const endDate = new Date(start);
        endDate.setFullYear(endDate.getFullYear() + 2); // Project 2 years ahead
        
        let currentDate = new Date(start);
        currentDate.setDate(10); // 10th of month
        
        let savedAmount = 0;
        
        while (currentDate <= endDate && savedAmount < targetAmount) {
            const contributionAmount = Math.min(monthlyContribution, targetAmount - savedAmount);
            
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentDate),
                description: 'Emergency Fund Contribution',
                category: 'Savings',
                amount: -contributionAmount,
                type: 'expense',
                tags: ['scenario', 'emergency_fund', 'contribution']
            }));
            
            savedAmount += contributionAmount;
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate transactions for expense change scenarios
     */
    generateExpenseChangeTransactions(scenario) {
        const { monthlyAmount, startDate, endDate, category, isIncrease } = scenario.parameters;
        const transactions = [];
        
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(start.getFullYear() + 2, start.getMonth(), start.getDate());
        
        let currentDate = new Date(start);
        currentDate.setDate(15); // Mid-month
        
        while (currentDate <= end) {
            const amount = isIncrease ? -monthlyAmount : monthlyAmount;
            const description = isIncrease ? 
                `Increased ${category} Expense` : 
                `Reduced ${category} Expense`;
            
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentDate),
                description,
                category,
                amount,
                type: isIncrease ? 'expense' : 'income',
                tags: ['scenario', 'expense_change', isIncrease ? 'increase' : 'decrease']
            }));
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Generate generic transactions for unknown scenario types
     */
    generateGenericTransactions(scenario) {
        const { monthlyAmount, startDate, duration } = scenario.parameters;
        const transactions = [];
        
        if (!monthlyAmount || !startDate) {
            return transactions;
        }
        
        const start = new Date(startDate);
        const durationMonths = duration || 12;
        
        let currentDate = new Date(start);
        
        for (let i = 0; i < durationMonths; i++) {
            transactions.push(this.createTransaction({
                scenarioId: scenario.id,
                date: new Date(currentDate),
                description: `${scenario.name} - Monthly Effect`,
                category: 'Scenario',
                amount: monthlyAmount,
                type: monthlyAmount > 0 ? 'income' : 'expense',
                tags: ['scenario', 'generic']
            }));
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return transactions;
    }

    /**
     * Create a transaction object
     */
    createTransaction({ scenarioId, date, description, category, amount, type, tags = [] }) {
        return {
            id: `scenario_${scenarioId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: date.toISOString().split('T')[0],
            description,
            category,
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
            type: type === 'income' ? 'Income' : 'Expense',
            balance: 0, // Will be calculated when integrated
            isProjected: true,
            isScenario: true,
            scenarioId,
            tags,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Calculate scenario impact from generated transactions
     */
    calculateScenarioImpact(scenario, transactions) {
        const impact = {
            scenarioId: scenario.id,
            totalTransactions: transactions.length,
            monthlyChange: 0,
            yearOneImpact: 0,
            yearTwoImpact: 0,
            netEffect: 0,
            affectedCategories: new Set(),
            riskLevel: 'low'
        };

        const now = new Date();
        const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

        let yearOneTotal = 0;
        let yearTwoTotal = 0;
        let monthlyTransactions = {};

        transactions.forEach(transaction => {
            const txDate = new Date(transaction.date);
            const amount = transaction.amount;
            
            impact.affectedCategories.add(transaction.category);

            if (txDate <= oneYearFromNow) {
                yearOneTotal += amount;
            } else if (txDate <= twoYearsFromNow) {
                yearTwoTotal += amount;
            }

            // Calculate monthly impact
            const monthKey = `${txDate.getFullYear()}-${txDate.getMonth()}`;
            if (!monthlyTransactions[monthKey]) {
                monthlyTransactions[monthKey] = 0;
            }
            monthlyTransactions[monthKey] += amount;
        });

        impact.yearOneImpact = yearOneTotal;
        impact.yearTwoImpact = yearTwoTotal;
        impact.netEffect = yearOneTotal + yearTwoTotal;

        // Calculate average monthly change
        const monthlyValues = Object.values(monthlyTransactions);
        if (monthlyValues.length > 0) {
            impact.monthlyChange = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
        }

        // Determine risk level
        const monthlyChangeAbs = Math.abs(impact.monthlyChange);
        if (monthlyChangeAbs > 2000) {
            impact.riskLevel = 'high';
        } else if (monthlyChangeAbs > 500) {
            impact.riskLevel = 'medium';
        } else {
            impact.riskLevel = 'low';
        }

        return impact;
    }

    /**
     * Get all transactions for a scenario
     */
    getTransactionsForScenario(scenarioId) {
        return this.generatedTransactions.get(scenarioId) || [];
    }

    /**
     * Get impact data for a scenario
     */
    getImpactForScenario(scenarioId) {
        return this.impactCalculations.get(scenarioId) || null;
    }

    /**
     * Get all transactions for multiple scenarios
     */
    getTransactionsForScenarios(scenarioIds) {
        const allTransactions = [];
        
        scenarioIds.forEach(scenarioId => {
            const transactions = this.getTransactionsForScenario(scenarioId);
            allTransactions.push(...transactions);
        });

        // Sort by date
        allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return allTransactions;
    }

    /**
     * Clear transactions for a scenario
     */
    clearTransactionsForScenario(scenarioId) {
        this.generatedTransactions.delete(scenarioId);
        this.impactCalculations.delete(scenarioId);
    }

    /**
     * Clear all generated transactions
     */
    clearAllTransactions() {
        this.generatedTransactions.clear();
        this.impactCalculations.clear();
    }

    /**
     * Get summary statistics
     */
    getSummaryStats() {
        const totalScenarios = this.generatedTransactions.size;
        let totalTransactions = 0;
        let totalImpact = 0;

        this.generatedTransactions.forEach(transactions => {
            totalTransactions += transactions.length;
        });

        this.impactCalculations.forEach(impact => {
            totalImpact += impact.netEffect;
        });

        return {
            totalScenarios,
            totalTransactions,
            totalImpact,
            averageTransactionsPerScenario: totalScenarios > 0 ? totalTransactions / totalScenarios : 0
        };
    }
}

module.exports = ScenarioTransactionEngine; 