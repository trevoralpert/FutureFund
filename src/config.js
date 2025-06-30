/**
 * Configuration module for FutureFund
 * Handles environment variables and provides secure defaults
 */

require('dotenv').config();

class Config {
  constructor() {
    this.validateEnvironment();
  }

  // OpenAI Configuration
  get openai() {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      timeout: 30000, // 30 seconds
      maxRetries: 3
    };
  }

  // LangSmith Configuration (Optional)
  get langsmith() {
    return {
      enabled: process.env.LANGCHAIN_TRACING_V2 === 'true',
      apiKey: process.env.LANGCHAIN_API_KEY,
      project: process.env.LANGCHAIN_PROJECT || 'FutureFund',
      endpoint: process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com'
    };
  }

  // Langfuse Configuration (Alternative observability)
  get langfuse() {
    return {
      enabled: !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY),
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      host: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
    };
  }

  // Application Configuration
  get app() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    };
  }

  // Validate required environment variables
  validateEnvironment() {
    const required = ['OPENAI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️  Missing required environment variables:', missing.join(', '));
      console.warn('📋 Please copy environment.template to .env and fill in your API keys');
      
      // Don't throw error in development to allow app to start
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
  }

  // Check if AI features are available
  get isAIEnabled() {
    return !!(this.openai.apiKey && this.openai.apiKey !== 'your_openai_api_key_here');
  }

  // Get observability configuration
  get observability() {
    if (this.langsmith.enabled && this.langsmith.apiKey) {
      return { type: 'langsmith', config: this.langsmith };
    } else if (this.langfuse.enabled) {
      return { type: 'langfuse', config: this.langfuse };
    }
    return { type: 'none' };
  }

  // Rate limiting configuration
  get rateLimits() {
    return {
      openai: {
        requests: 60, // requests per minute
        tokens: 150000 // tokens per minute for gpt-4o-mini
      },
      chat: {
        messagesPerMinute: 10,
        maxHistoryLength: 50
      }
    };
  }
}

// Export singleton instance
const config = new Config();
module.exports = config; 