/**
 * Enhanced AI Chat Service
 * Provides context-aware financial chat with conversation memory
 */

const { OpenAI } = require("openai");
const config = require('../config');

/**
 * Conversation Memory Manager
 */
class ConversationMemory {
  constructor(maxMessages = 20) {
    this.messages = [];
    this.maxMessages = maxMessages;
    this.context = null;
    this.sessionId = this.generateSessionId();
  }

  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: new Date(),
      id: this.generateMessageId()
    });

    // Keep only recent messages to avoid token limits
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getMessages() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  setFinancialContext(context) {
    this.context = context;
  }

  getFinancialContext() {
    return this.context;
  }

  clear() {
    this.messages = [];
    this.context = null;
  }

  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  getSummary() {
    return {
      sessionId: this.sessionId,
      messageCount: this.messages.length,
      hasContext: !!this.context,
      startTime: this.messages[0]?.timestamp,
      lastActivity: this.messages[this.messages.length - 1]?.timestamp
    };
  }
}

/**
 * Financial Query Parser
 */
class FinancialQueryParser {
  constructor() {
    this.patterns = {
      amount: /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
      date: /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december)/gi,
      timeframe: /(\d+)\s*(month|year|week|day)s?/gi,
      category: /(rent|food|grocery|gas|salary|income|entertainment|shopping|utilities|insurance)/gi,
      intent: {
        forecast: /forecast|predict|project|future|will have|expect/i,
        analysis: /analyze|pattern|trend|spending|how much|total/i,
        scenario: /what if|scenario|suppose|assume|change/i,
        comparison: /compare|vs|versus|difference|better|worse/i
      }
    };
  }

  parse(query) {
    const result = {
      originalQuery: query,
      amounts: this.extractAmounts(query),
      dates: this.extractDates(query),
      timeframes: this.extractTimeframes(query),
      categories: this.extractCategories(query),
      intent: this.detectIntent(query),
      confidence: 0.8
    };

    return result;
  }

  extractAmounts(query) {
    const matches = query.match(this.patterns.amount);
    return matches ? matches.map(match => parseFloat(match.replace(/[$,]/g, ''))) : [];
  }

  extractDates(query) {
    const matches = query.match(this.patterns.date);
    return matches ? matches.map(match => this.parseDate(match)) : [];
  }

  extractTimeframes(query) {
    const matches = [...query.matchAll(this.patterns.timeframe)];
    return matches.map(match => ({
      value: parseInt(match[1]),
      unit: match[2].toLowerCase()
    }));
  }

  extractCategories(query) {
    const matches = query.match(this.patterns.category);
    return matches ? matches.map(match => match.toLowerCase()) : [];
  }

  detectIntent(query) {
    for (const [intent, pattern] of Object.entries(this.patterns.intent)) {
      if (pattern.test(query)) {
        return intent;
      }
    }
    return 'general';
  }

  parseDate(dateString) {
    // Simple date parsing - in production would use a proper date library
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
}

/**
 * Enhanced Chat Service
 */
class ChatService {
  constructor() {
    this.memory = new ConversationMemory();
    this.parser = new FinancialQueryParser();
    this.openai = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (!config.isAIEnabled) {
      throw new Error('AI features not enabled. Please configure OpenAI API key.');
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    });

    this.isInitialized = true;
    console.log('✅ Chat service initialized');
  }

  async sendMessage(userMessage, financialContext = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Update financial context if provided
      if (financialContext) {
        this.memory.setFinancialContext(financialContext);
      }

      // Parse the user query
      const parsedQuery = this.parser.parse(userMessage);
      
      // Add user message to memory
      this.memory.addMessage('user', userMessage);

      // Build context-aware system prompt
      const systemPrompt = this.buildSystemPrompt(parsedQuery);
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.memory.getMessages().slice(-10) // Last 10 messages for context
      ];

      // Get AI response
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: messages,
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        stream: false // We'll implement streaming later
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Add AI response to memory
      this.memory.addMessage('assistant', aiResponse);

      return {
        success: true,
        response: aiResponse,
        parsedQuery,
        sessionId: this.memory.sessionId,
        usage: completion.usage,
        confidence: this.calculateConfidence(parsedQuery, financialContext)
      };

    } catch (error) {
      console.error('❌ Chat service error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'CHAT_ERROR'
      };
    }
  }

  buildSystemPrompt(parsedQuery) {
    const context = this.memory.getFinancialContext();
    let prompt = `You are FutureFund AI, a professional personal finance assistant. You help users with financial planning, budgeting, forecasting, and investment decisions.

PERSONALITY: Be helpful, accurate, and professional. Provide specific, actionable advice when possible.

`;

    // Add financial context if available
    if (context) {
      prompt += `CURRENT FINANCIAL CONTEXT:
- Current Balance: $${context.currentBalance?.toFixed(2) || 'Unknown'}
- Monthly Net Income: $${context.monthlyNetIncome?.toFixed(2) || 'Unknown'}
- Total Actual Transactions: ${context.totalTransactions || 'Unknown'}
- Total Projected Transactions: ${context.totalProjectedTransactions || 'Unknown'}
- Date Range: ${context.dateRange?.start || 'Unknown'} to ${context.dateRange?.end || 'Unknown'}

`;

      if (context.allTransactions && context.allTransactions.length > 0) {
        prompt += `ALL FINANCIAL TRANSACTIONS (${context.allTransactions.length} total):
${context.allTransactions.map(t => 
  `${t.date}: ${t.description} - $${t.amount.toFixed(2)} (${t.category}) [${t.isProjected ? 'Projected' : 'Actual'}] Balance: $${t.balance.toFixed(2)}`
).join('\n')}

`;
      }
    }

    // Add query-specific guidance
    if (parsedQuery.intent !== 'general') {
      prompt += `QUERY ANALYSIS:
- Detected Intent: ${parsedQuery.intent}
- Amounts mentioned: ${parsedQuery.amounts.join(', ') || 'None'}
- Timeframes: ${parsedQuery.timeframes.map(t => `${t.value} ${t.unit}(s)`).join(', ') || 'None'}
- Categories: ${parsedQuery.categories.join(', ') || 'None'}

`;
    }

    prompt += `INSTRUCTIONS:
1. You have access to the user's COMPLETE financial transaction history
2. Analyze ALL transactions to answer questions - don't limit yourself to recent data
3. For date-specific questions, search through the entire dataset
4. Calculate precise totals, patterns, and trends from the full data
5. Always be specific with numbers and reference actual transactions when available
6. If asked about forecasts, use both actual and projected transactions for analysis
7. For scenario questions, explain how factors affect their complete financial picture
8. Keep responses conversational but data-driven and accurate`;

    return prompt;
  }

  calculateConfidence(parsedQuery, context) {
    let confidence = 0.7; // Higher base confidence with complete dataset

    // Increase confidence based on available context
    if (context && context.hasData) {
      confidence += 0.2;
      if (context.allTransactions && context.allTransactions.length > 50) {
        confidence += 0.1; // Lots of data available
      }
    }

    // Adjust based on query specificity
    if (parsedQuery.amounts.length > 0) confidence += 0.05;
    if (parsedQuery.timeframes.length > 0) confidence += 0.05;
    if (parsedQuery.categories.length > 0) confidence += 0.05;
    if (parsedQuery.intent !== 'general') confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  getConversationSummary() {
    return this.memory.getSummary();
  }

  clearConversation() {
    this.memory.clear();
    console.log('🗑️ Conversation cleared');
  }

  setFinancialContext(context) {
    this.memory.setFinancialContext(context);
  }

  async healthCheck() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Test with a simple message
      const testResponse = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return {
        status: 'healthy',
        model: config.openai.model,
        conversationLength: this.memory.messages.length,
        hasContext: !!this.memory.context
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
const chatService = new ChatService();

module.exports = {
  ChatService,
  ConversationMemory,
  FinancialQueryParser,
  chatService
}; 