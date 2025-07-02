/**
 * FutureFund Database Schema V2
 * Comprehensive Multi-Account Financial Forecasting Schema
 * 
 * This schema implements the professional financial planning methodology
 * with support for 20+ account types, additive scenarios, and AI integration.
 */

/**
 * Account Types Enumeration
 * Based on professional financial planning methodology
 */
const ACCOUNT_CATEGORIES = {
  ASSETS: {
    LIQUID: ['checking', 'savings', 'money_market', 'cd'],
    INVESTMENT: ['investment', 'brokerage', 'mutual_funds', 'stocks', 'bonds'],
    RETIREMENT: ['401k', 'ira_traditional', 'ira_roth', 'pension', 'annuity'],
    EDUCATION: ['529_plan', 'education_savings', 'coverdell_esa'],
    REAL_ESTATE: ['primary_residence', 'rental_property', 'land'],
    PERSONAL: ['auto', 'personal_property', 'jewelry', 'collectibles'],
    BUSINESS: ['business_equity', 'business_savings', 'business_checking'],
    INSURANCE: ['life_insurance_cash', 'whole_life', 'universal_life'],
    ALTERNATIVE: ['crypto', 'precious_metals', 'commodities', 'art']
  },
  LIABILITIES: {
    CREDIT: ['credit_card', 'line_of_credit', 'personal_loan'],
    REAL_ESTATE: ['mortgage', 'home_equity_loan', 'heloc'],
    VEHICLE: ['auto_loan', 'boat_loan', 'rv_loan'],
    EDUCATION: ['student_loan', 'parent_plus_loan'],
    BUSINESS: ['business_loan', 'equipment_loan', 'sba_loan'],
    OTHER: ['tax_debt', 'medical_debt', 'family_loan']
  }
};

const ACCOUNT_TYPES = {
  // LIQUID ASSETS
  checking: {
    category: 'ASSETS.LIQUID',
    defaultName: 'Checking Account',
    liquidityScore: 10,
    riskLevel: 0,
    taxAdvantaged: false,
    canOverdraft: true,
    typicalAPY: 0.01,
    features: ['debit_card', 'checks', 'direct_deposit', 'bill_pay']
  },
  savings: {
    category: 'ASSETS.LIQUID',
    defaultName: 'Savings Account',
    liquidityScore: 9,
    riskLevel: 0,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPY: 0.05,
    features: ['high_yield_option', 'automatic_transfers']
  },
  money_market: {
    category: 'ASSETS.LIQUID',
    defaultName: 'Money Market Account',
    liquidityScore: 8,
    riskLevel: 1,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPY: 0.03,
    features: ['limited_checks', 'debit_card', 'tiered_rates']
  },
  cd: {
    category: 'ASSETS.LIQUID',
    defaultName: 'Certificate of Deposit',
    liquidityScore: 3,
    riskLevel: 0,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPY: 0.04,
    features: ['fixed_rate', 'penalty_early_withdrawal', 'fdic_insured']
  },
  
  // INVESTMENT ASSETS
  investment: {
    category: 'ASSETS.INVESTMENT',
    defaultName: 'Investment Account',
    liquidityScore: 7,
    riskLevel: 6,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPY: 0.07,
    features: ['stock_trading', 'mutual_funds', 'etf_trading']
  },
  brokerage: {
    category: 'ASSETS.INVESTMENT',
    defaultName: 'Brokerage Account',
    liquidityScore: 7,
    riskLevel: 7,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPY: 0.08,
    features: ['individual_stocks', 'options_trading', 'margin_trading']
  },
  
  // RETIREMENT ASSETS
  '401k': {
    category: 'ASSETS.RETIREMENT',
    defaultName: '401(k) Plan',
    liquidityScore: 2,
    riskLevel: 5,
    taxAdvantaged: true,
    canOverdraft: false,
    typicalAPY: 0.08,
    features: ['employer_match', 'loan_option', 'hardship_withdrawal'],
    contributionLimits: { annual: 23000, catchUp: 7500 }
  },
  ira_traditional: {
    category: 'ASSETS.RETIREMENT',
    defaultName: 'Traditional IRA',
    liquidityScore: 1,
    riskLevel: 4,
    taxAdvantaged: true,
    canOverdraft: false,
    typicalAPY: 0.07,
    features: ['tax_deductible', 'required_distributions'],
    contributionLimits: { annual: 7000, catchUp: 1000 }
  },
  ira_roth: {
    category: 'ASSETS.RETIREMENT',
    defaultName: 'Roth IRA',
    liquidityScore: 2,
    riskLevel: 4,
    taxAdvantaged: true,
    canOverdraft: false,
    typicalAPY: 0.07,
    features: ['tax_free_growth', 'no_required_distributions'],
    contributionLimits: { annual: 7000, catchUp: 1000 }
  },
  
  // LIABILITY ACCOUNTS
  credit_card: {
    category: 'LIABILITIES.CREDIT',
    defaultName: 'Credit Card',
    liquidityScore: 8, // High access to credit
    riskLevel: 9, // High interest rate risk
    taxAdvantaged: false,
    canOverdraft: true,
    typicalAPR: 0.24,
    features: ['rewards', 'cash_back', 'travel_benefits'],
    creditLimit: true
  },
  line_of_credit: {
    category: 'LIABILITIES.CREDIT',
    defaultName: 'Line of Credit',
    liquidityScore: 7,
    riskLevel: 7,
    taxAdvantaged: false,
    canOverdraft: true,
    typicalAPR: 0.12,
    features: ['variable_rate', 'revolving_credit'],
    creditLimit: true
  },
  mortgage: {
    category: 'LIABILITIES.REAL_ESTATE',
    defaultName: 'Home Mortgage',
    liquidityScore: 0,
    riskLevel: 3,
    taxAdvantaged: true, // Interest deduction
    canOverdraft: false,
    typicalAPR: 0.07,
    features: ['fixed_rate_option', 'tax_deductible_interest', 'long_term']
  },
  auto_loan: {
    category: 'LIABILITIES.VEHICLE',
    defaultName: 'Auto Loan',
    liquidityScore: 0,
    riskLevel: 2,
    taxAdvantaged: false,
    canOverdraft: false,
    typicalAPR: 0.05,
    features: ['secured_by_vehicle', 'fixed_payment']
  }
};

/**
 * Database Schema Definitions
 */
const SCHEMA_V2 = {
  
  // User Profiles - Core user data with financial planning integration
  user_profiles: `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Personal Information
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      nickname TEXT,
      date_of_birth DATE,
      marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
      
      -- Contact Information
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT, -- JSON string for flexible address structure
      
      -- Employment Information
      employer TEXT,
      job_title TEXT,
      employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'retired')),
      annual_income REAL,
      income_growth_rate REAL DEFAULT 0.03,
      
      -- Financial Goals & Priorities (1-10 scale)
      goal_priorities TEXT, -- JSON string for structured goal priority data
      risk_tolerance_score INTEGER, -- -14 to +11 professional scale
      risk_category TEXT CHECK (risk_category IN ('conservative', 'moderate', 'aggressive')),
      
      -- Preferences & Settings
      primary_currency TEXT DEFAULT 'USD',
      date_format TEXT DEFAULT 'MM/DD/YYYY',
      number_format TEXT DEFAULT 'US',
      
      -- AI Personalization
      onboarding_completed BOOLEAN DEFAULT 0,
      ai_recommendations_enabled BOOLEAN DEFAULT 1,
      data_sharing_consent BOOLEAN DEFAULT 0
    )
  `,

  // Accounts - Multi-account support with professional categorization
  accounts: `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      
      -- Account Identification
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      institution_name TEXT,
      account_number_last4 TEXT,
      
      -- Account Details
      current_balance REAL NOT NULL DEFAULT 0,
      available_balance REAL,
      credit_limit REAL,
      interest_rate REAL,
      
      -- Account Properties
      is_active BOOLEAN DEFAULT 1,
      is_primary BOOLEAN DEFAULT 0,
      owner_type TEXT DEFAULT 'individual' CHECK (owner_type IN ('individual', 'joint', 'trust')),
      tax_advantaged BOOLEAN DEFAULT 0,
      
      -- Connection Status
      connection_status TEXT DEFAULT 'manual' CHECK (connection_status IN ('connected', 'manual', 'error')),
      last_sync_at DATETIME,
      sync_frequency TEXT DEFAULT 'daily',
      
      -- AI & Scenario Integration
      include_in_forecasting BOOLEAN DEFAULT 1,
      scenario_priority INTEGER DEFAULT 1,
      
      -- Metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
      UNIQUE(user_profile_id, account_name)
    )
  `,

  // Enhanced Transactions - Account-linked with scenario tracking
  transactions_v2: `
    CREATE TABLE IF NOT EXISTS transactions_v2 (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      
      -- Transaction Core Data
      transaction_date DATE NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      subcategory TEXT,
      
      -- Transaction Classification
      transaction_type TEXT CHECK (transaction_type IN ('income', 'expense', 'transfer', 'fee', 'interest')),
      is_recurring BOOLEAN DEFAULT 0,
      is_projected BOOLEAN DEFAULT 0,
      confidence_score REAL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
      
      -- External References
      external_transaction_id TEXT,
      merchant_name TEXT,
      merchant_category TEXT,
      
      -- Scenario Integration
      scenario_influenced BOOLEAN DEFAULT 0,
      influencing_scenarios TEXT, -- JSON array of scenario IDs
      
      -- Metadata
      notes TEXT,
      tags TEXT, -- JSON array for flexible tagging
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `,

  // Enhanced Scenarios - Professional scenario modeling
  scenarios_v2: `
    CREATE TABLE IF NOT EXISTS scenarios_v2 (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      
      -- Scenario Identity
      name TEXT NOT NULL,
      description TEXT,
      scenario_type TEXT,
      template_id TEXT,
      
      -- Scenario Status
      is_active BOOLEAN DEFAULT 0,
      priority_weight REAL DEFAULT 1.0,
      activation_date DATE,
      duration_months INTEGER,
      
      -- Scenario Parameters
      parameters TEXT NOT NULL, -- JSON string for flexible parameter storage
      financial_impact TEXT, -- JSON string for calculated impact summary
      
      -- AI Analysis
      feasibility_score INTEGER CHECK (feasibility_score BETWEEN 0 AND 100),
      risk_assessment TEXT, -- JSON string for AI-generated risk analysis
      recommendations TEXT, -- JSON string for AI suggestions
      
      -- Tracking
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_calculated_at DATETIME,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // Scenario Effects - Detailed impact tracking per account
  scenario_effects: `
    CREATE TABLE IF NOT EXISTS scenario_effects (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      
      -- Effect Details
      effect_type TEXT CHECK (effect_type IN ('balance_change', 'contribution_change', 'withdrawal', 'rate_change')),
      effect_amount REAL,
      effect_frequency TEXT CHECK (effect_frequency IN ('one_time', 'monthly', 'quarterly', 'annually')),
      start_date DATE,
      end_date DATE,
      
      -- Advanced Effects
      percentage_impact REAL,
      conditional_triggers TEXT, -- JSON for conditions
      fallback_account_id TEXT,
      
      -- Consequence Modeling
      generates_fees BOOLEAN DEFAULT 0,
      fee_amount REAL,
      fee_frequency TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (scenario_id) REFERENCES scenarios_v2(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (fallback_account_id) REFERENCES accounts(id) ON DELETE SET NULL
    )
  `,

  // Scenario Combinations - Track multiple active scenarios
  scenario_combinations: `
    CREATE TABLE IF NOT EXISTS scenario_combinations (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      combination_name TEXT,
      active_scenarios TEXT, -- JSON array of scenario IDs and weights
      
      -- Combination Analysis
      combined_feasibility_score INTEGER CHECK (combined_feasibility_score BETWEEN 0 AND 100),
      major_conflicts TEXT, -- JSON array of conflict descriptions
      resolution_suggestions TEXT, -- JSON array of AI suggestions
      
      -- Consequence Predictions
      predicted_outcomes TEXT, -- JSON for detailed outcome analysis
      bust_probability REAL CHECK (bust_probability BETWEEN 0.0 AND 1.0),
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // Account Balance History - Historical tracking
  account_balances: `
    CREATE TABLE IF NOT EXISTS account_balances (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      balance_date DATE NOT NULL,
      balance_amount REAL NOT NULL,
      balance_type TEXT DEFAULT 'actual' CHECK (balance_type IN ('actual', 'projected')),
      data_source TEXT CHECK (data_source IN ('manual', 'bank_sync', 'ai_prediction')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      UNIQUE(account_id, balance_date, balance_type)
    )
  `,

  // Risk Assessments - Professional risk scoring
  risk_assessments: `
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      
      -- Professional Risk Scoring (-14 to +11 scale)
      primary_goal_score INTEGER,
      investment_horizon_score INTEGER,
      withdrawal_timeframe_score INTEGER,
      inflation_tolerance_score INTEGER,
      portfolio_volatility_score INTEGER,
      volatility_comfort_score INTEGER,
      other_assets_score INTEGER,
      
      -- Calculated Results
      total_risk_score INTEGER,
      risk_category TEXT CHECK (risk_category IN ('conservative', 'moderate', 'aggressive')),
      recommended_allocation TEXT, -- JSON for asset allocation recommendations
      
      -- Assessment Metadata
      assessment_date DATE DEFAULT CURRENT_DATE,
      assessment_method TEXT CHECK (assessment_method IN ('questionnaire', 'ai_analysis', 'advisor_input')),
      is_current BOOLEAN DEFAULT 1,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // Financial Goals - Goal tracking with progress
  financial_goals: `
    CREATE TABLE IF NOT EXISTS financial_goals (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      goal_type TEXT,
      priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 10),
      target_amount REAL,
      target_date DATE,
      current_progress REAL DEFAULT 0,
      monthly_contribution REAL,
      auto_adjustment BOOLEAN DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // Family Members - Dependents and family financial tracking
  family_members: `
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      relationship TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      date_of_birth DATE,
      financial_dependency_level INTEGER CHECK (financial_dependency_level BETWEEN 0 AND 10),
      education_goals TEXT, -- JSON for children's education planning
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // AI Predictions - Enhanced AI insights
  ai_predictions: `
    CREATE TABLE IF NOT EXISTS ai_predictions (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      prediction_type TEXT,
      
      -- Prediction Data
      target_date DATE,
      predicted_value REAL,
      confidence_interval TEXT, -- JSON for lower/upper bounds
      prediction_accuracy REAL,
      
      -- Context
      input_data_hash TEXT,
      scenario_context TEXT, -- JSON for active scenarios
      model_version TEXT,
      
      -- Metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // AI Conversations - Enhanced chat history
  ai_conversations: `
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      session_id TEXT,
      
      -- Message Content
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      message_type TEXT CHECK (message_type IN ('question', 'command', 'clarification')),
      
      -- Context & Analysis
      financial_context TEXT, -- JSON for relevant financial data
      extracted_intent TEXT,
      confidence_score REAL,
      
      -- Performance Tracking
      response_time_ms INTEGER,
      tokens_used INTEGER,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `,

  // Budget Categories - Professional budgeting framework
  budget_categories: `
    CREATE TABLE IF NOT EXISTS budget_categories (
      id TEXT PRIMARY KEY,
      user_profile_id TEXT NOT NULL,
      
      -- Category Details
      category_name TEXT NOT NULL,
      parent_category TEXT,
      category_type TEXT,
      
      -- Budget Amounts
      planned_monthly_amount REAL,
      actual_monthly_average REAL,
      variance_percentage REAL,
      
      -- Professional Planning Integration
      financial_advisor_recommended REAL,
      priority_level INTEGER CHECK (priority_level BETWEEN 1 AND 10),
      is_fixed_expense BOOLEAN DEFAULT 0,
      
      -- Tracking
      last_reviewed_date DATE,
      auto_categorization_enabled BOOLEAN DEFAULT 1,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
  `
};

/**
 * Database Indexes for Performance Optimization
 */
const INDEXES_V2 = [
  // High-frequency query indexes
  'CREATE INDEX IF NOT EXISTS idx_transactions_v2_account_date ON transactions_v2(account_id, transaction_date DESC)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_v2_category_date ON transactions_v2(category, transaction_date DESC)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_v2_projected_date ON transactions_v2(is_projected, transaction_date DESC)',
  'CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_profile_id, is_active)',
  'CREATE INDEX IF NOT EXISTS idx_scenario_effects_account ON scenario_effects(account_id, start_date, end_date)',
  
  // AI query optimization
  'CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_type ON ai_predictions(user_profile_id, prediction_type, target_date)',
  'CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id, created_at DESC)',
  
  // Scenario modeling optimization
  'CREATE INDEX IF NOT EXISTS idx_scenarios_v2_user_active ON scenarios_v2(user_profile_id, is_active)',
  'CREATE INDEX IF NOT EXISTS idx_scenario_combinations_user ON scenario_combinations(user_profile_id)',
  
  // Balance history optimization
  'CREATE INDEX IF NOT EXISTS idx_account_balances_account_date ON account_balances(account_id, balance_date DESC)',
  
  // Full-text search for transactions
  // Note: SQLite FTS would be added separately if needed
  'CREATE INDEX IF NOT EXISTS idx_transactions_v2_description ON transactions_v2(description)',
  'CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(account_name)'
];

module.exports = {
  ACCOUNT_CATEGORIES,
  ACCOUNT_TYPES,
  SCHEMA_V2,
  INDEXES_V2
}; 