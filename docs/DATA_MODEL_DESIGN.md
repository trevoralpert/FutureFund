# FutureFund Data Model Design
# Phase 0.2 Complete - Database Architecture for Multi-Account Financial Forecasting

## EXECUTIVE SUMMARY
This document defines the comprehensive data model for FutureFund's multi-account, scenario-based financial forecasting system. The design is based on professional financial planning methodology and supports 20+ account types, sophisticated user profiles, intelligent scenario modeling, and AI-powered consequence prediction.

## CORE DATA ARCHITECTURE

### Database Design Philosophy
- **Account-Centric**: All financial data revolves around accounts as the primary entity
- **Scenario-Aware**: Every prediction can be influenced by multiple active scenarios
- **Audit-Friendly**: Complete historical tracking of all changes and predictions
- **AI-Ready**: Data structures optimized for LangChain/LangGraph workflows
- **Extensible**: Support for dynamic account types and custom user fields

## ACCOUNT TYPE SYSTEM

### Primary Account Categories
```javascript
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
}
```

### Account Type Definitions
```javascript
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
  }
  // ... additional account types
}
```

## USER PROFILE DATA MODEL

### Core User Profile Schema
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  date_of_birth DATE,
  marital_status VARCHAR(20), -- 'single', 'married', 'divorced', 'widowed'
  
  -- Contact Information
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address JSONB, -- Flexible address structure
  
  -- Employment Information
  employer VARCHAR(200),
  job_title VARCHAR(100),
  employment_status VARCHAR(30), -- 'employed', 'self_employed', 'unemployed', 'retired'
  annual_income DECIMAL(12,2),
  income_growth_rate DECIMAL(5,4) DEFAULT 0.03,
  
  -- Financial Goals & Priorities (1-10 scale)
  goal_priorities JSONB, -- Structured goal priority data
  risk_tolerance_score INTEGER, -- -14 to +11 professional scale
  risk_category VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
  
  -- Preferences & Settings
  primary_currency VARCHAR(3) DEFAULT 'USD',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  number_format VARCHAR(20) DEFAULT 'US',
  
  -- AI Personalization
  onboarding_completed BOOLEAN DEFAULT FALSE,
  ai_recommendations_enabled BOOLEAN DEFAULT TRUE,
  data_sharing_consent BOOLEAN DEFAULT FALSE
);
```

### Family & Dependents
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  relationship VARCHAR(30), -- 'spouse', 'child', 'parent', 'dependent'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  date_of_birth DATE,
  financial_dependency_level INTEGER, -- 0-10 scale
  education_goals JSONB, -- For children
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Financial Goals Detailed Schema
```sql
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  goal_type VARCHAR(50), -- 'retirement', 'education', 'home_purchase', 'emergency_fund'
  priority_score INTEGER, -- 1-10 scale from professional methodology
  target_amount DECIMAL(12,2),
  target_date DATE,
  current_progress DECIMAL(12,2) DEFAULT 0,
  monthly_contribution DECIMAL(8,2),
  auto_adjustment BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## ACCOUNT MANAGEMENT SYSTEM

### Accounts Table
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  
  -- Account Identification
  account_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- From ACCOUNT_TYPES enum
  institution_name VARCHAR(200),
  account_number_last4 VARCHAR(4), -- Security: only last 4 digits
  
  -- Account Details
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(12,2), -- For credit accounts
  credit_limit DECIMAL(12,2), -- For credit accounts
  interest_rate DECIMAL(6,4), -- APR for loans, APY for savings
  
  -- Account Properties
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE, -- Primary account for account type
  owner_type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'joint', 'trust'
  tax_advantaged BOOLEAN DEFAULT FALSE,
  
  -- Connection Status
  connection_status VARCHAR(20) DEFAULT 'manual', -- 'connected', 'manual', 'error'
  last_sync_at TIMESTAMP,
  sync_frequency VARCHAR(20) DEFAULT 'daily',
  
  -- AI & Scenario Integration
  include_in_forecasting BOOLEAN DEFAULT TRUE,
  scenario_priority INTEGER DEFAULT 1, -- Order for scenario fallbacks
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_account_name UNIQUE(user_profile_id, account_name)
);
```

### Account Balances History
```sql
CREATE TABLE account_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  balance_date DATE NOT NULL,
  balance_amount DECIMAL(12,2) NOT NULL,
  balance_type VARCHAR(20) DEFAULT 'actual', -- 'actual', 'projected'
  data_source VARCHAR(30), -- 'manual', 'bank_sync', 'ai_prediction'
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_account_balance_date UNIQUE(account_id, balance_date, balance_type)
);
```

## TRANSACTION SYSTEM

### Enhanced Transactions Schema
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  
  -- Transaction Core Data
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- Positive for income/credits, negative for expenses/debits
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Transaction Classification
  transaction_type VARCHAR(30), -- 'income', 'expense', 'transfer', 'fee', 'interest'
  is_recurring BOOLEAN DEFAULT FALSE,
  is_projected BOOLEAN DEFAULT FALSE, -- Future predictions vs actual
  confidence_score DECIMAL(3,2), -- 0.0-1.0 for AI predictions
  
  -- External References
  external_transaction_id VARCHAR(200), -- From bank API
  merchant_name VARCHAR(200),
  merchant_category VARCHAR(100),
  
  -- Scenario Integration
  scenario_influenced BOOLEAN DEFAULT FALSE,
  influencing_scenarios JSONB, -- Array of scenario IDs affecting this transaction
  
  -- Metadata
  notes TEXT,
  tags JSONB, -- Flexible tagging system
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_account_date (account_id, transaction_date),
  INDEX idx_category (category),
  INDEX idx_projected (is_projected),
  INDEX idx_scenario_influenced (scenario_influenced)
);
```

## SCENARIO MODELING SYSTEM

### Scenarios Schema
```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  
  -- Scenario Identity
  name VARCHAR(200) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50), -- 'job_change', 'home_purchase', 'retirement', 'education'
  template_id VARCHAR(50), -- Reference to scenario template
  
  -- Scenario Status
  is_active BOOLEAN DEFAULT FALSE,
  priority_weight DECIMAL(3,2) DEFAULT 1.0, -- For scenario combinations
  activation_date DATE,
  duration_months INTEGER, -- NULL for permanent scenarios
  
  -- Scenario Parameters
  parameters JSONB NOT NULL, -- Flexible parameter storage
  financial_impact JSONB, -- Calculated impact summary
  
  -- AI Analysis
  feasibility_score INTEGER, -- 0-100 AI-calculated feasibility
  risk_assessment JSONB, -- AI-generated risk analysis
  recommendations JSONB, -- AI suggestions for improvement
  
  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_calculated_at TIMESTAMP
);
```

### Scenario Effects Tracking
```sql
CREATE TABLE scenario_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id),
  account_id UUID REFERENCES accounts(id),
  
  -- Effect Details
  effect_type VARCHAR(50), -- 'balance_change', 'contribution_change', 'withdrawal', 'rate_change'
  effect_amount DECIMAL(12,2),
  effect_frequency VARCHAR(20), -- 'one_time', 'monthly', 'quarterly', 'annually'
  start_date DATE,
  end_date DATE,
  
  -- Advanced Effects
  percentage_impact DECIMAL(5,4), -- For percentage-based changes
  conditional_triggers JSONB, -- Conditions for effect activation
  fallback_account_id UUID REFERENCES accounts(id), -- For payment method switching
  
  -- Consequence Modeling
  generates_fees BOOLEAN DEFAULT FALSE,
  fee_amount DECIMAL(8,2),
  fee_frequency VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Scenario Combinations
```sql
CREATE TABLE scenario_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  combination_name VARCHAR(200),
  active_scenarios JSONB, -- Array of scenario IDs and weights
  
  -- Combination Analysis
  combined_feasibility_score INTEGER, -- 0-100
  major_conflicts JSONB, -- Array of conflict descriptions
  resolution_suggestions JSONB, -- AI suggestions for conflicts
  
  -- Consequence Predictions
  predicted_outcomes JSONB, -- Detailed outcome analysis
  bust_probability DECIMAL(3,2), -- 0.0-1.0 probability of financial failure
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## AI INTEGRATION DATA MODEL

### AI Predictions & Insights
```sql
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  prediction_type VARCHAR(50), -- 'balance_forecast', 'spending_pattern', 'goal_achievement'
  
  -- Prediction Data
  target_date DATE,
  predicted_value DECIMAL(12,2),
  confidence_interval JSONB, -- Lower/upper bounds
  prediction_accuracy DECIMAL(3,2), -- Historical accuracy score
  
  -- Context
  input_data_hash VARCHAR(64), -- For cache invalidation
  scenario_context JSONB, -- Active scenarios when prediction made
  model_version VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- When prediction becomes stale
  
  INDEX idx_user_type_date (user_profile_id, prediction_type, target_date)
);
```

### AI Conversation History
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  session_id UUID,
  
  -- Message Content
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  message_type VARCHAR(30), -- 'question', 'command', 'clarification'
  
  -- Context & Analysis
  financial_context JSONB, -- Relevant financial data at time of query
  extracted_intent VARCHAR(100), -- AI-parsed user intent
  confidence_score DECIMAL(3,2),
  
  -- Performance Tracking
  response_time_ms INTEGER,
  tokens_used INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

## PROFESSIONAL FINANCIAL PLANNING INTEGRATION

### Risk Assessment Data
```sql
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  
  -- Professional Risk Scoring (-14 to +11 scale)
  primary_goal_score INTEGER,
  investment_horizon_score INTEGER,
  withdrawal_timeframe_score INTEGER,
  inflation_tolerance_score INTEGER,
  portfolio_volatility_score INTEGER,
  volatility_comfort_score INTEGER,
  other_assets_score INTEGER,
  
  -- Calculated Results
  total_risk_score INTEGER, -- Sum of all scores
  risk_category VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
  recommended_allocation JSONB, -- Asset allocation recommendations
  
  -- Assessment Metadata
  assessment_date DATE DEFAULT CURRENT_DATE,
  assessment_method VARCHAR(30), -- 'questionnaire', 'ai_analysis', 'advisor_input'
  is_current BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Budget Categories (Professional Framework)
```sql
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  
  -- Category Details
  category_name VARCHAR(100) NOT NULL,
  parent_category VARCHAR(100), -- For subcategories
  category_type VARCHAR(30), -- 'housing', 'transportation', 'discretionary', etc.
  
  -- Budget Amounts
  planned_monthly_amount DECIMAL(8,2),
  actual_monthly_average DECIMAL(8,2),
  variance_percentage DECIMAL(5,2),
  
  -- Professional Planning Integration
  financial_advisor_recommended DECIMAL(8,2), -- Professional benchmark
  priority_level INTEGER, -- 1-10 scale
  is_fixed_expense BOOLEAN DEFAULT FALSE,
  
  -- Tracking
  last_reviewed_date DATE,
  auto_categorization_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## DATA RELATIONSHIPS & CONSTRAINTS

### Primary Relationships
```sql
-- User Profile → Accounts (One-to-Many)
ALTER TABLE accounts ADD CONSTRAINT fk_accounts_user 
  FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Accounts → Transactions (One-to-Many)
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_account 
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- User Profile → Scenarios (One-to-Many)
ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_user 
  FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Scenarios → Effects (One-to-Many)
ALTER TABLE scenario_effects ADD CONSTRAINT fk_effects_scenario 
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE;

-- Cross-Account Effects (Fallback Accounts)
ALTER TABLE scenario_effects ADD CONSTRAINT fk_effects_fallback_account 
  FOREIGN KEY (fallback_account_id) REFERENCES accounts(id) ON DELETE SET NULL;
```

### Data Integrity Rules
```sql
-- Ensure positive balances for asset accounts, negative for liabilities
CREATE OR REPLACE FUNCTION validate_account_balance() RETURNS TRIGGER AS $$
BEGIN
  -- Logic to validate balance based on account type
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure transaction amounts align with account types
CREATE OR REPLACE FUNCTION validate_transaction_amount() RETURNS TRIGGER AS $$
BEGIN
  -- Logic to validate transaction direction based on account type
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## PERFORMANCE OPTIMIZATION

### Database Indexing Strategy
```sql
-- High-frequency query indexes
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_category_date ON transactions(category, transaction_date DESC);
CREATE INDEX idx_transactions_projected_date ON transactions(is_projected, transaction_date DESC);
CREATE INDEX idx_accounts_user_active ON accounts(user_profile_id, is_active);
CREATE INDEX idx_scenario_effects_account ON scenario_effects(account_id, start_date, end_date);

-- AI query optimization
CREATE INDEX idx_ai_predictions_user_type ON ai_predictions(user_profile_id, prediction_type, target_date);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id, created_at DESC);

-- Full-text search for transactions
CREATE INDEX idx_transactions_description_fts ON transactions USING GIN(to_tsvector('english', description));
```

### Partitioning Strategy
```sql
-- Partition transactions table by date for performance
CREATE TABLE transactions_y2024 PARTITION OF transactions 
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Partition AI predictions by user for scaling
CREATE TABLE ai_predictions_partition_1 PARTITION OF ai_predictions 
  FOR VALUES WITH (MODULUS 10, REMAINDER 0);
```

## SCENARIO MODELING LOGIC

### Scenario Effect Calculation Engine
```sql
-- Function to calculate scenario impacts on account balances
CREATE OR REPLACE FUNCTION calculate_scenario_impact(
  p_account_id UUID,
  p_scenario_ids UUID[],
  p_target_date DATE
) RETURNS DECIMAL(12,2) AS $$
DECLARE
  base_balance DECIMAL(12,2);
  total_impact DECIMAL(12,2) := 0;
  effect RECORD;
BEGIN
  -- Get current account balance
  SELECT current_balance INTO base_balance 
  FROM accounts WHERE id = p_account_id;
  
  -- Calculate effects from all active scenarios
  FOR effect IN 
    SELECT se.* FROM scenario_effects se
    WHERE se.account_id = p_account_id 
    AND se.scenario_id = ANY(p_scenario_ids)
    AND se.start_date <= p_target_date
    AND (se.end_date IS NULL OR se.end_date >= p_target_date)
  LOOP
    -- Add effect calculation logic based on effect_type
    total_impact := total_impact + effect.effect_amount;
  END LOOP;
  
  RETURN base_balance + total_impact;
END;
$$ LANGUAGE plpgsql;
```

### Intelligent Payment Method Switching
```sql
-- Function to determine fallback payment accounts when primary account fails
CREATE OR REPLACE FUNCTION get_fallback_payment_sequence(
  p_user_profile_id UUID,
  p_payment_amount DECIMAL(12,2)
) RETURNS UUID[] AS $$
DECLARE
  fallback_sequence UUID[];
  account RECORD;
BEGIN
  -- Priority order: Checking → Savings → Credit Cards → Line of Credit
  FOR account IN 
    SELECT a.id, a.current_balance, a.credit_limit, a.account_type
    FROM accounts a
    WHERE a.user_profile_id = p_user_profile_id 
    AND a.is_active = true
    ORDER BY 
      CASE a.account_type 
        WHEN 'checking' THEN 1
        WHEN 'savings' THEN 2
        WHEN 'credit_card' THEN 3
        WHEN 'line_of_credit' THEN 4
        ELSE 5
      END
  LOOP
    -- Check if account can cover the payment
    IF (account.account_type IN ('checking', 'savings') AND account.current_balance >= p_payment_amount)
    OR (account.account_type IN ('credit_card', 'line_of_credit') AND account.credit_limit - ABS(account.current_balance) >= p_payment_amount)
    THEN
      fallback_sequence := array_append(fallback_sequence, account.id);
    END IF;
  END LOOP;
  
  RETURN fallback_sequence;
END;
$$ LANGUAGE plpgsql;
```

## API DATA TRANSFER OBJECTS

### Account DTO
```javascript
{
  id: "uuid",
  userId: "uuid",
  name: "Primary Checking",
  type: "checking",
  institution: "Chase Bank",
  currentBalance: 5250.75,
  availableBalance: 5250.75,
  isActive: true,
  isPrimary: true,
  features: ["debit_card", "checks", "direct_deposit"],
  lastSyncAt: "2024-01-15T10:30:00Z",
  projectedBalance: {
    "2024-02-01": 5100.25,
    "2024-03-01": 4950.50,
    "2024-04-01": 4800.75
  }
}
```

### Scenario DTO
```javascript
{
  id: "uuid",
  name: "Home Purchase",
  type: "home_purchase",
  isActive: true,
  priorityWeight: 1.0,
  parameters: {
    homePrice: 450000,
    downPayment: 90000,
    monthlyPayment: 2100,
    closingCosts: 15000,
    targetDate: "2024-06-01"
  },
  feasibilityScore: 85,
  impact: {
    totalCost: 505000,
    monthlyImpact: -2100,
    affectedAccounts: ["checking", "savings", "investment"],
    paymentSequence: ["checking", "savings", "credit_card"]
  },
  consequences: {
    overdraftRisk: "low",
    emergencyFundImpact: "moderate", 
    creditUtilization: "15%"
  }
}
```

## NEXT STEPS: PHASE 1.1 IMPLEMENTATION

Based on this comprehensive data model, Phase 1.1 will implement:

1. **✅ Core Database Schema** - All tables, relationships, and constraints
2. **✅ Data Access Objects (DAOs)** - Account, Transaction, Scenario, User Profile DAOs  
3. **✅ Database Migration Scripts** - Migrate existing transactions to new multi-account structure
4. **✅ Validation Functions** - Account balance validation, transaction validation
5. **✅ Performance Indexes** - Optimized queries for common operations

## KEY CAPABILITIES ENABLED

This data model provides the foundation for:
- **✅ 20+ Account Types** with professional categorization
- **✅ Sophisticated User Profiles** with financial planning methodology  
- **✅ Advanced Scenario Modeling** with consequence prediction
- **✅ AI Integration** with conversation history and predictions
- **✅ Professional Risk Assessment** with industry-standard scoring
- **✅ Intelligent Payment Fallbacks** with account switching logic
- **✅ Multi-Account Dashboard** with aggregated analytics
- **✅ Additive Scenario Combinations** with conflict resolution
- **✅ BUST Scenario Detection** with probability scoring

The design supports both current demo needs and future enterprise features while maintaining professional financial planning standards throughout.

---
*Phase 0.2 Complete ✅ - Ready for Phase 1.1: Database Schema Implementation* 