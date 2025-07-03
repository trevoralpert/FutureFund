# FutureFund Developer Documentation
**Version 1.0** | **Technical Reference & API Documentation**

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [AI Workflow System](#ai-workflow-system)
5. [API Reference](#api-reference)
6. [Integration Guides](#integration-guides)
7. [Development Setup](#development-setup)
8. [Testing Framework](#testing-framework)
9. [Performance Optimization](#performance-optimization)
10. [Security Guidelines](#security-guidelines)

---

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Electron 32.0.1 (Cross-platform desktop application)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **AI/ML**: LangChain, LangGraph, OpenAI API (gpt-4o-mini)
- **Database**: SQLite 3 with WAL mode
- **Build Tools**: npm, electron-builder
- **Testing**: Custom test suite with performance monitoring

### Core Components
```
Main Process (Node.js)
├── Database Management
├── AI Workflow Orchestration
├── File System Access
├── Background Processing
└── IPC Handler

Renderer Process (Chromium)
├── UI Management
├── Chart Rendering
├── User Interactions
├── Performance Monitoring
└── Accessibility Features
```

---

## 📁 Project Structure

### Key Files
```
src/
├── main.js                    # Electron main process (1,200+ lines)
├── preload.js                 # Secure IPC bridge (200+ lines)
├── renderer/renderer.js       # Frontend logic (8,000+ lines)
├── workflows/                 # AI workflow system
│   ├── workflow-orchestrator.js    # Central orchestration (1,500+ lines)
│   ├── financial-intelligence.js   # Financial analysis (2,500+ lines)
│   ├── financial-health-monitoring.js  # Health scoring (2,800+ lines)
│   └── predictive-analytics-pipeline.js  # Forecasting (2,800+ lines)
├── database/                  # Database layer
│   ├── database.js           # Core database management
│   ├── schema-v2.js          # Database schema
│   └── *-dao.js              # Data access objects
└── test-suite/               # Testing framework
    ├── comprehensive-test-suite.js  # Main tests (2,800+ lines)
    └── performance-test.js          # Performance tests (1,200+ lines)
```

### Core Directory Structure
```
FutureFund/
├── src/                           # Source code
│   ├── main.js                   # Electron main process
│   ├── preload.js                # Secure IPC bridge
│   ├── config.js                 # Configuration management
│   ├── ai/                       # AI services
│   │   ├── chat-service.js       # AI chat functionality
│   │   └── chat-test.js          # AI testing utilities
│   ├── database/                 # Database layer
│   │   ├── database.js           # Core database management
│   │   ├── schema-v2.js          # Database schema definition
│   │   ├── *-dao.js              # Data access objects
│   │   └── migration-*.js        # Database migrations
│   ├── workflows/                # AI workflow system
│   │   ├── workflow-orchestrator.js     # Main orchestrator
│   │   ├── langgraph-foundation.js      # LangGraph base
│   │   ├── financial-*.js               # Financial workflows
│   │   └── test-*.js                    # Workflow tests
│   ├── renderer/                 # Frontend code
│   │   ├── index.html            # Main UI
│   │   ├── styles.css            # Application styling
│   │   ├── renderer.js           # Main frontend logic
│   │   ├── analytics-service.js  # Analytics processing
│   │   └── chart-service.js      # Chart rendering
│   └── test-suite/               # Testing framework
│       ├── comprehensive-test-suite.js  # Main test suite
│       ├── performance-test.js          # Performance testing
│       └── test-runner.js              # Test orchestration
├── data/                         # Local data storage
│   ├── futurefund.db            # Main SQLite database
│   ├── sample-transactions.json # Sample data
│   └── exports/                 # Export directory
├── package.json                 # Dependencies and scripts
├── .env                        # Environment variables
└── *.md                        # Documentation files
```

### Key File Responsibilities

#### **main.js** (1,200+ lines)
- Electron application lifecycle management
- IPC handler registration
- Database initialization and management
- AI workflow orchestration
- Security and validation

#### **preload.js** (200+ lines)
- Secure context bridge implementation
- API exposure to renderer process
- Security boundary enforcement

#### **renderer.js** (8,000+ lines)
- UI management and interactions
- Tab system and navigation
- Chart rendering and data visualization
- Performance monitoring and optimization
- Accessibility features

#### **workflow-orchestrator.js** (1,500+ lines)
- Central AI workflow management
- LangGraph workflow coordination
- Background processing orchestration
- Error handling and recovery

---

## 🗄️ Database Schema

### Core Tables

#### **transactions**
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    account TEXT NOT NULL,
    amount REAL NOT NULL,
    balance REAL NOT NULL,
    type TEXT NOT NULL,
    is_projected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **accounts**
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    institution TEXT,
    balance REAL NOT NULL DEFAULT 0,
    interest_rate REAL,
    credit_limit REAL,
    account_number TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **scenarios**
```sql
CREATE TABLE scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL,
    parameters TEXT,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **user_preferences**
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **financial_insights**
```sql
CREATE TABLE financial_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    score REAL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Performance Optimizations
- **Indexes**: Strategic indexing on frequently queried columns
- **WAL Mode**: Write-Ahead Logging for concurrent access
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Prepared statements and parameter binding

---

## 🤖 AI Workflow System

### LangGraph Foundation
FutureFund uses LangGraph for sophisticated AI workflows with state management and conditional logic.

#### **Core Workflow Components**
```javascript
// Base workflow structure
const workflow = new LangGraph()
    .addNode('loadData', dataLoader)
    .addNode('analyzePatterns', patternAnalyzer)
    .addNode('generateInsights', insightGenerator)
    .addNode('formatResponse', responseFormatter)
    .addEdge('loadData', 'analyzePatterns')
    .addEdge('analyzePatterns', 'generateInsights')
    .addEdge('generateInsights', 'formatResponse');
```

### Available AI Workflows

#### **1. Financial Intelligence** (2,500+ lines)
- **Purpose**: Comprehensive financial analysis and recommendations
- **Nodes**: Data loading, pattern analysis, insight generation, response formatting
- **Capabilities**: Health scoring, spending analysis, trend identification

#### **2. Predictive Analytics Pipeline** (2,800+ lines)
- **Purpose**: Future balance and trend prediction
- **Nodes**: Data preprocessing, pattern recognition, forecasting, confidence scoring
- **Capabilities**: 1-year projections, seasonal adjustments, risk assessment

#### **3. Financial Health Monitoring** (2,800+ lines)
- **Purpose**: Real-time financial health assessment
- **Nodes**: Health calculation, trend analysis, alert generation, recommendations
- **Capabilities**: 8-dimensional scoring, continuous monitoring, early warnings

#### **4. Scenario Analysis** (2,000+ lines)
- **Purpose**: What-if scenario modeling and optimization
- **Nodes**: Scenario parsing, impact calculation, optimization, reporting
- **Capabilities**: Template-based scenarios, comparative analysis, recommendations

#### **5. Background Intelligence** (1,800+ lines)
- **Purpose**: Continuous monitoring and proactive insights
- **Nodes**: Monitoring, analysis, alert generation, insight compilation
- **Capabilities**: Anomaly detection, pattern changes, proactive recommendations

### Workflow Execution Patterns
```javascript
// Synchronous execution
const result = await workflow.execute(inputData);

// Asynchronous with callbacks
workflow.executeAsync(inputData, {
    onProgress: (step, data) => console.log(`Step ${step}:`, data),
    onComplete: (result) => console.log('Complete:', result),
    onError: (error) => console.error('Error:', error)
});

// Streaming execution
const stream = workflow.stream(inputData);
for await (const chunk of stream) {
    console.log('Chunk:', chunk);
}
```

---

## 🔌 API Reference

### IPC API (Main ↔ Renderer Communication)

#### **Database Operations**
```javascript
// Transaction operations
electronAPI.addTransaction(transactionData)
electronAPI.getTransactions(filters)
electronAPI.updateTransaction(id, updates)
electronAPI.deleteTransaction(id)

// Account operations
electronAPI.addAccount(accountData)
electronAPI.getAccounts()
electronAPI.updateAccount(id, updates)
electronAPI.deleteAccount(id)

// Scenario operations
electronAPI.saveScenario(scenarioData)
electronAPI.getScenarios()
electronAPI.activateScenario(id)
electronAPI.deactivateScenario(id)
```

#### **AI Workflow Operations**
```javascript
// Chat and analysis
electronAPI.sendChatMessage(message)
electronAPI.getFinancialInsights(options)
electronAPI.calculateHealthScore()
electronAPI.runPredictiveAnalysis(timeframe)

// Scenario modeling
electronAPI.createScenario(template, parameters)
electronAPI.runScenarioAnalysis(scenarioId)
electronAPI.compareScenarios(scenarioIds)
```

#### **Data Management**
```javascript
// Export operations
electronAPI.exportData(format, filters)
electronAPI.exportChart(chartId, format)
electronAPI.exportAnalysis(analysisId)

// Import operations
electronAPI.importTransactions(filePath)
electronAPI.importAccounts(filePath)
```

### Frontend API (Renderer Process)

#### **Chart Service**
```javascript
// Chart creation and management
ChartService.createChart(type, data, options)
ChartService.updateChart(chartId, newData)
ChartService.exportChart(chartId, format)
ChartService.destroyChart(chartId)

// Available chart types
// - line, bar, pie, doughnut, scatter, radar
```

#### **Analytics Service**
```javascript
// Analytics processing
AnalyticsService.calculateSpendingPatterns(transactions)
AnalyticsService.detectAnomalies(transactions)
AnalyticsService.analyzeSeasonalTrends(transactions)
AnalyticsService.generateInsights(data)
```

#### **Performance Manager**
```javascript
// Performance monitoring
PerformanceManager.startMonitoring()
PerformanceManager.measurePerformance(operation)
PerformanceManager.getMetrics()
PerformanceManager.optimizePerformance()
```

---

## 🔧 Integration Guides

### Adding New AI Workflows

#### **Step 1: Create Workflow File**
```javascript
// src/workflows/my-custom-workflow.js
const { LangGraph } = require('./langgraph-foundation');

class MyCustomWorkflow {
    constructor() {
        this.workflow = new LangGraph()
            .addNode('myNode', this.myNodeFunction.bind(this))
            .addEdge('myNode', 'end');
    }

    async myNodeFunction(state) {
        // Your custom logic here
        return { result: 'processed' };
    }

    async execute(input) {
        return await this.workflow.execute(input);
    }
}

module.exports = MyCustomWorkflow;
```

#### **Step 2: Register in Orchestrator**
```javascript
// In workflow-orchestrator.js
const MyCustomWorkflow = require('./my-custom-workflow');

// Add to initialization
this.myCustomWorkflow = new MyCustomWorkflow();

// Add to IPC handlers
ipcMain.handle('my-custom-operation', async (event, data) => {
    return await this.myCustomWorkflow.execute(data);
});
```

#### **Step 3: Expose in Preload**
```javascript
// In preload.js
contextBridge.exposeInMainWorld('electronAPI', {
    // ... existing APIs
    runMyCustomOperation: (data) => ipcRenderer.invoke('my-custom-operation', data)
});
```

### Adding New Database Tables

#### **Step 1: Create Migration**
```javascript
// src/database/migration-v3.js
const migrationV3 = {
    version: 3,
    up: async (db) => {
        await db.exec(`
            CREATE TABLE my_new_table (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },
    down: async (db) => {
        await db.exec('DROP TABLE IF EXISTS my_new_table;');
    }
};

module.exports = migrationV3;
```

#### **Step 2: Create DAO**
```javascript
// src/database/my-new-dao.js
class MyNewDAO {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const stmt = await this.db.prepare(
            'INSERT INTO my_new_table (name) VALUES (?)'
        );
        return await stmt.run(data.name);
    }

    async getAll() {
        return await this.db.all('SELECT * FROM my_new_table');
    }
}

module.exports = MyNewDAO;
```

### Adding New UI Components

#### **Step 1: Create Component Class**
```javascript
// In renderer.js
class MyNewComponent {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="my-component">
                <h2>My New Component</h2>
                <button id="myButton">Click Me</button>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('myButton').addEventListener('click', () => {
            this.handleClick();
        });
    }

    handleClick() {
        console.log('Button clicked!');
    }
}
```

#### **Step 2: Register Component**
```javascript
// In renderer.js initialization
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization
    
    const myComponentContainer = document.getElementById('myComponentContainer');
    if (myComponentContainer) {
        new MyNewComponent(myComponentContainer);
    }
});
```

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Operating System**: macOS, Windows, or Linux

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/futurefund.git
cd futurefund

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp environment.template .env
# Edit .env with your configuration

# 4. Initialize database
npm run db:init

# 5. Start development server
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev          # Start in development mode
npm start           # Start in production mode
npm run db:init     # Initialize database
npm run db:migrate  # Run database migrations

# Testing
npm test            # Run comprehensive test suite
npm run test:unit   # Run unit tests only
npm run test:performance  # Run performance tests
npm run test:e2e    # Run end-to-end tests

# Building
npm run build       # Build for production
npm run dist        # Create distribution packages
npm run pack        # Package for current platform

# Utilities
npm run lint        # Run code linting
npm run format      # Format code
npm run clean       # Clean build artifacts
```

### Environment Variables
```bash
# .env configuration
OPENAI_API_KEY=your_openai_api_key_here
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_PROJECT=futurefund
NODE_ENV=development
DEBUG=true
LOG_LEVEL=info

# Optional
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.langchain.com
```

---

## 🧪 Testing Framework

### Test Suite Structure
```
src/test-suite/
├── comprehensive-test-suite.js   # Main test framework (2,800+ lines)
├── performance-test.js           # Performance validation (1,200+ lines)
└── test-runner.js               # Test orchestration (800+ lines)
```

### Test Categories

#### **Unit Tests (5 tests)**
- Financial calculation accuracy
- Data formatting and validation
- Component initialization
- Utility function correctness
- Error handling robustness

#### **Integration Tests (5 tests)**
- Database operations
- AI workflow execution
- Scenario analysis
- IPC communication
- Cross-component interaction

#### **Performance Tests (7 tests)**
- Application load time
- Memory usage monitoring
- Rendering performance
- Database query speed
- AI response time
- Cache efficiency
- Virtual scrolling performance

#### **End-to-End Tests (6 tests)**
- User workflow simulation
- Transaction management
- Scenario creation
- Analytics generation
- Export functionality
- Error recovery

#### **Accessibility Tests (5 tests)**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast validation

### Running Tests
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:e2e
npm run test:accessibility

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Results Interpretation
- **Success Rate**: Percentage of tests passing
- **Performance Metrics**: Timing and resource usage
- **Coverage Reports**: Code coverage analysis
- **Regression Detection**: Comparison with previous runs

---

## ⚡ Performance Optimization

### Optimization Strategies

#### **Memory Management**
- **Object Pooling**: Reuse objects to reduce garbage collection
- **Lazy Loading**: Load components only when needed
- **Memory Monitoring**: Track memory usage and optimize accordingly
- **Cache Management**: Intelligent caching with TTL and LRU eviction

#### **Rendering Optimization**
- **Virtual Scrolling**: Efficient handling of large datasets
- **Debounced Updates**: Prevent excessive re-renders
- **Animation Optimization**: Use CSS transforms and GPU acceleration
- **Component Lifecycle**: Proper cleanup of event listeners and timers

#### **Database Optimization**
- **Query Optimization**: Use indexes and prepared statements
- **Connection Pooling**: Efficient database connection management
- **Bulk Operations**: Batch database operations where possible
- **WAL Mode**: Write-Ahead Logging for concurrent access

### Performance Monitoring
```javascript
// Built-in performance monitoring
const metrics = await electronAPI.getPerformanceMetrics();
console.log({
    fps: metrics.fps,
    memoryUsage: metrics.memoryUsage,
    dbQueryTime: metrics.dbQueryTime,
    aiResponseTime: metrics.aiResponseTime
});
```

### Performance Benchmarks
- **Target Load Time**: < 3 seconds
- **Target Memory Usage**: < 100 MB
- **Target FPS**: > 30 FPS
- **Target DB Query Time**: < 100ms
- **Target AI Response Time**: < 2 seconds

---

## 🔐 Security Guidelines

### Data Security
- **Local Storage**: All sensitive data stored locally
- **Encryption**: Database encryption for sensitive information
- **No Cloud Dependencies**: Complete offline functionality
- **Access Control**: Proper file system permissions

### API Security
- **API Key Management**: Secure storage of API keys
- **Environment Variables**: Use .env files for sensitive configuration
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Secure error messages without data leakage

### Electron Security
- **Context Isolation**: Enabled by default
- **Node Integration**: Disabled in renderer process
- **Secure Defaults**: Use secure Electron configuration
- **IPC Validation**: Validate all IPC messages

### Development Security
- **Dependency Scanning**: Regular dependency vulnerability scans
- **Code Review**: Security-focused code reviews
- **Testing**: Security-focused testing scenarios
- **Updates**: Keep dependencies and Electron updated

---

## 📚 Additional Resources

### Documentation
- **User Manual**: Comprehensive user guide
- **Installation Guide**: Setup and configuration
- **Troubleshooting Guide**: Common issues and solutions
- **API Reference**: Complete API documentation

### Development Resources
- **Code Style Guide**: JavaScript and CSS conventions
- **Architecture Decision Records**: Technical decisions and rationale
- **Performance Guidelines**: Optimization best practices
- **Testing Standards**: Quality assurance procedures

### External Dependencies
- **Electron**: https://www.electronjs.org/
- **LangChain**: https://langchain.com/
- **OpenAI**: https://openai.com/
- **SQLite**: https://sqlite.org/
- **Chart.js**: https://www.chartjs.org/

---

**🎯 This documentation provides the technical foundation for developing, extending, and maintaining FutureFund. For user-facing information, refer to the User Manual and other documentation files.**

---

*FutureFund Developer Documentation v1.0 - Technical Reference*  
*Last Updated: Version 1.0 - Production Ready* 