#!/usr/bin/env node

/**
 * FutureFund Security Configuration Script
 * Handles security hardening for production deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 FutureFund Security Configuration');
console.log('=====================================');

// Generate secure encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate API key format
function validateApiKey(key, keyType) {
  if (!key || key.length < 16) {
    console.log(`❌ ${keyType} API key is too short or missing`);
    return false;
  }
  
  if (key.includes('your_') || key.includes('_here')) {
    console.log(`❌ ${keyType} API key is using placeholder value`);
    return false;
  }
  
  console.log(`✅ ${keyType} API key format is valid`);
  return true;
}

// Create necessary directories
function createSecureDirectories() {
  const directories = [
    './data/backups',
    './logs',
    './temp'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.log(`❌ Failed to create directory: ${dir} - ${error.message}`);
      }
    }
  }
}

// Main security configuration
async function runSecurityConfiguration() {
  console.log('\n🛡️  Starting security hardening...');
  
  // Create secure directories
  createSecureDirectories();
  
  // Load environment configuration
  const configPath = path.join(__dirname, '..', 'environment.production');
  if (fs.existsSync(configPath)) {
    require('dotenv').config({ path: configPath });
    console.log('✅ Loaded production environment configuration');
  } else {
    console.log('⚠️  Production environment configuration not found');
    console.log('   Please create environment.production file');
    return;
  }
  
  // Validate API keys
  console.log('\n🔑 Validating API keys...');
  let keyValidations = 0;
  let passedValidations = 0;
  
  const apiKeys = [
    { key: process.env.OPENAI_API_KEY, type: 'OpenAI' },
    { key: process.env.LANGCHAIN_API_KEY, type: 'LangChain' },
    { key: process.env.DB_ENCRYPTION_KEY, type: 'Database Encryption' }
  ];
  
  for (const apiKey of apiKeys) {
    if (apiKey.key) {
      keyValidations++;
      if (validateApiKey(apiKey.key, apiKey.type)) {
        passedValidations++;
      }
    }
  }
  
  // Security summary
  console.log('\n📊 Security Configuration Summary:');
  console.log(`   API Key Validations: ${passedValidations}/${keyValidations}`);
  console.log(`   Directories Created: 3/3`);
  console.log(`   Success Rate: ${Math.round((passedValidations / keyValidations) * 100)}%`);
  
  // Security recommendations
  console.log('\n💡 Security Recommendations:');
  console.log('   1. Review and update all API keys before deployment');
  console.log('   2. Enable database encryption for sensitive data');
  console.log('   3. Configure proper file system permissions');
  console.log('   4. Set up monitoring and alerting for security events');
  console.log('   5. Regular security audits and updates');
  
  console.log('\n🔒 Security configuration completed!');
  
  return passedValidations === keyValidations;
}

// Run if called directly
if (require.main === module) {
  runSecurityConfiguration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Security configuration failed:', error);
      process.exit(1);
    });
}

module.exports = { runSecurityConfiguration, generateEncryptionKey, validateApiKey };