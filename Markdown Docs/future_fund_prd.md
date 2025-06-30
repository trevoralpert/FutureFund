**Product Requirements Document (PRD)**

**Project Name:** FutureFund  
**Type:** Desktop AI Application  
**Platform:** macOS (initial) using Electron + LangGraph

---

### 1. Overview
FutureFund is a desktop application that enables users to forecast their personal finances using AI-powered simulations, based on their historical financial data, current transaction patterns, and hypothetical future scenarios. Designed for long-term financial planning, FutureFund is a local-first, desktop-native experience that updates daily and supports flexible interaction via spreadsheet views and a natural-language chatbot.

---

### 2. Problem Statement
Most personal finance tools focus on budgeting or past behavior. They don't provide flexible, AI-driven simulations of future financial scenarios. Users need:
- Predictive planning (not just tracking)
- Automatic scenario modeling
- Intuitive, customizable financial projections
- A tool that updates daily without requiring manual spreadsheet upkeep

---

### 3. Goals & Success Criteria

**Primary Goal:**
Create a predictive, AI-assisted desktop finance tool that simulates, compares, and explains future personal financial outcomes.

**Success Criteria:**
- ✅ Users can connect (or simulate) bank/credit accounts
- ✅ Daily updates forecast spending/saving trajectory
- ✅ Users can model and switch between multiple life scenarios
- ✅ A chatbot answers questions about financial predictions
- ✅ The app runs locally with background LangGraph workflows

---

### 4. Key Features (MVP)

- **Account Simulation Module:** Mock connection to checking/savings/credit accounts (via JSON or static CSV inputs)
- **Daily Forecaster:** AI system to calculate expected deposits/withdrawals based on historic averages
- **Scenario Manager:** Users can create/edit alternate future paths (e.g., new job, move cities, big purchase)
- **Interactive Ledger:** Spreadsheet view that shows past + projected future transactions
- **Natural Language Chatbot:** Answers user questions about timeline, balances, and savings
- **LangGraph Integration:** For handling multi-step forecasting + scenario branching workflows

---

### 5. User Workflows

**Daily Sync Flow:**
1. App loads → updates latest transaction snapshot
2. LangGraph process runs:
   - Updates forecasts based on new inputs
   - Applies changes across all saved scenarios

**Chatbot Workflow:**
1. User types: "How much will I have in my Roth IRA in 2027 if I move to Chicago in 2025?"
2. LangGraph fetches relevant scenario, aggregates financial deltas, and returns explanation

**Scenario Creation:**
1. User selects base financial profile
2. Inputs new job + salary starting July 2025
3. FutureFund generates delta visualization & updated forecast

---

### 6. Architecture Overview

- **Frontend:** Electron app (HTML/JS/CSS or React) with two tabs: Ledger + Chat
- **LangChain Backend:** LangGraph chains for forecasting + retrieval-augmented prompts
- **Local Storage:** IndexedDB or SQLite for caching financial data + scenarios
- **Mock API layer:** Simulates Plaid or financial data source

---

### 7. AI Integration Strategy
- **LLM:** GPT-4 or GPT-4o via OpenAI API
- **Use Cases:**
  - Chat-based timeline forecasting explanations
  - Classification of transaction categories
  - Memory of user preferences/scenarios
- **Retrieval:** LangChain retriever for scenario JSONs and user history

---

### 8. LangGraph Integration Plan
- **Node 1:** Ingest transactions (mock data)
- **Node 2:** Update user state for each account
- **Node 3:** Apply scenario adjustments (e.g., raise rent, change job)
- **Node 4:** Project balance over time
- **Node 5:** Serve results to chat & spreadsheet views

This LangGraph is triggered on startup + after every user interaction with the scenario builder.

---

### 9. Milestones & Timeline

| Date | Milestone |
|------|-----------|
| Day 1 | BrainLift, PRD, set up project skeleton + LangGraph base |
| Day 2 | Forecasting model, mock transaction ingestion, spreadsheet view MVP |
| Day 3 | Scenario builder, LangGraph agent flows, chatbot MVP |
| Day 4 | Polish UI, test edge cases, prep video demo and submission materials |

---

**Status:** In Development  
**Owner:** Trevor Alpert  
**Last Updated:** June 30, 2025

