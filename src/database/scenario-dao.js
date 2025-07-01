/**
 * Scenario Data Access Object
 * Handles all scenario-related database operations
 */

const { dbManager } = require('./database');

/**
 * Scenario validation schema
 */
function validateScenario(scenario) {
  const errors = [];

  if (!scenario.id || typeof scenario.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (!scenario.name || typeof scenario.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!scenario.type || typeof scenario.type !== 'string') {
    errors.push('Type is required and must be a string');
  }

  if (!scenario.parameters || typeof scenario.parameters !== 'object') {
    errors.push('Parameters are required and must be an object');
  }

  return errors;
}

/**
 * Scenario Data Access Object
 */
class ScenarioDAO {
  
  /**
   * Create a new scenario
   */
  static async create(scenario) {
    try {
      // Validate scenario data
      const errors = validateScenario(scenario);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        INSERT INTO scenarios (
          id, name, description, type, parameters, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const params = [
        scenario.id,
        scenario.name,
        scenario.description || null,
        scenario.type,
        JSON.stringify(scenario.parameters),
        scenario.is_active !== undefined ? (scenario.is_active ? 1 : 0) : 1
      ];

      const result = await dbManager.executeQuery(sql, params);
      console.log(`✅ Created scenario: ${scenario.id}`);
      
      return { success: true, id: scenario.id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error creating scenario:', error);
      throw error;
    }
  }

  /**
   * Get scenario by ID
   */
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM scenarios WHERE id = ?';
      const scenario = await dbManager.selectOneQuery(sql, [id]);
      
      if (scenario) {
        return this.formatScenario(scenario);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting scenario by ID:', error);
      throw error;
    }
  }

  /**
   * Get all scenarios with optional filtering
   */
  static async getAll(options = {}) {
    try {
      let sql = 'SELECT * FROM scenarios';
      const params = [];
      const conditions = [];

      // Add filters
      if (options.type) {
        conditions.push('type = ?');
        params.push(options.type);
      }

      if (options.is_active !== undefined) {
        conditions.push('is_active = ?');
        params.push(options.is_active ? 1 : 0);
      }

      if (options.search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Add ordering
      const orderBy = options.orderBy || 'created_at';
      const orderDirection = options.orderDirection || 'DESC';
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Add pagination
      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(options.offset);
        }
      }

      const scenarios = await dbManager.selectQuery(sql, params);
      return scenarios.map(this.formatScenario);
    } catch (error) {
      console.error('❌ Error getting all scenarios:', error);
      throw error;
    }
  }

  /**
   * Update scenario
   */
  static async update(id, updates) {
    try {
      // Get existing scenario for validation
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Scenario not found');
      }

      // Merge updates with existing data
      const updatedScenario = { ...existing, ...updates, id };
      
      // Validate updated data
      const errors = validateScenario(updatedScenario);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        UPDATE scenarios SET 
          name = ?, description = ?, type = ?, parameters = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        updatedScenario.name,
        updatedScenario.description,
        updatedScenario.type,
        JSON.stringify(updatedScenario.parameters),
        updatedScenario.is_active ? 1 : 0,
        id
      ];

      const result = await dbManager.executeQuery(sql, params);
      
      if (result.changes === 0) {
        throw new Error('Scenario not found or no changes made');
      }

      console.log(`✅ Updated scenario: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error updating scenario:', error);
      throw error;
    }
  }

  /**
   * Delete scenario
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM scenarios WHERE id = ?';
      const result = await dbManager.executeQuery(sql, [id]);
      
      if (result.changes === 0) {
        throw new Error('Scenario not found');
      }

      console.log(`✅ Deleted scenario: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error deleting scenario:', error);
      throw error;
    }
  }

  /**
   * Get scenarios by type
   */
  static async getByType(type, options = {}) {
    return this.getAll({ ...options, type });
  }

  /**
   * Get active scenarios
   */
  static async getActive(options = {}) {
    return this.getAll({ ...options, is_active: true });
  }

  /**
   * Activate/Deactivate scenario
   */
  static async setActive(id, isActive) {
    try {
      const sql = 'UPDATE scenarios SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const result = await dbManager.executeQuery(sql, [isActive ? 1 : 0, id]);
      
      if (result.changes === 0) {
        throw new Error('Scenario not found');
      }

      console.log(`✅ ${isActive ? 'Activated' : 'Deactivated'} scenario: ${id}`);
      return { success: true, id, changes: result.changes };
    } catch (error) {
      console.error('❌ Error setting scenario active status:', error);
      throw error;
    }
  }

  /**
   * Clone scenario with new ID and name
   */
  static async clone(id, newName) {
    try {
      const original = await this.getById(id);
      if (!original) {
        throw new Error('Original scenario not found');
      }

      const clonedScenario = {
        ...original,
        id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${original.name} (Copy)`,
        is_active: false // Clones start as inactive
      };

      delete clonedScenario.createdAt;
      delete clonedScenario.updatedAt;

      return await this.create(clonedScenario);
    } catch (error) {
      console.error('❌ Error cloning scenario:', error);
      throw error;
    }
  }

  /**
   * Get scenario templates (predefined scenario types)
   */
  static getTemplates() {
    return [
      {
        type: 'salary_change',
        name: 'Salary Change',
        description: 'Model the impact of a salary increase or decrease',
        parameters: {
          percentage: 0,
          startDate: null,
          endDate: null
        },
        validationRules: {
          percentage: { type: 'number', required: true, min: -100, max: 500 },
          startDate: { type: 'date', required: true },
          endDate: { type: 'date', required: false }
        }
      },
      {
        type: 'job_change',
        name: 'Job Change',
        description: 'Model changing jobs with different salary and benefits',
        parameters: {
          newSalary: 0,
          salaryFrequency: 'monthly',
          startDate: null,
          relocatoinCost: 0
        },
        validationRules: {
          newSalary: { type: 'number', required: true, min: 0 },
          salaryFrequency: { type: 'string', required: true, options: ['weekly', 'biweekly', 'monthly', 'annual'] },
          startDate: { type: 'date', required: true },
          relocatoinCost: { type: 'number', required: false, min: 0 }
        }
      },
      {
        type: 'major_purchase',
        name: 'Major Purchase',
        description: 'Model the impact of a large purchase (house, car, etc.)',
        parameters: {
          amount: 0,
          purchaseDate: null,
          downPayment: 0,
          monthlyPayment: 0,
          loanTermMonths: 0
        },
        validationRules: {
          amount: { type: 'number', required: true, min: 0 },
          purchaseDate: { type: 'date', required: true },
          downPayment: { type: 'number', required: false, min: 0 },
          monthlyPayment: { type: 'number', required: false, min: 0 },
          loanTermMonths: { type: 'number', required: false, min: 0, max: 480 }
        }
      },
      {
        type: 'expense_change',
        name: 'Expense Change',
        description: 'Model ongoing expense changes (rent increase, new subscription, etc.)',
        parameters: {
          category: '',
          monthlyAmount: 0,
          startDate: null,
          endDate: null,
          isIncrease: true
        },
        validationRules: {
          category: { type: 'string', required: true },
          monthlyAmount: { type: 'number', required: true, min: 0 },
          startDate: { type: 'date', required: true },
          endDate: { type: 'date', required: false },
          isIncrease: { type: 'boolean', required: true }
        }
      },
      {
        type: 'investment_strategy',
        name: 'Investment Strategy',
        description: 'Model regular investment contributions and returns',
        parameters: {
          monthlyContribution: 0,
          expectedAnnualReturn: 0,
          startDate: null,
          investmentType: 'stocks'
        },
        validationRules: {
          monthlyContribution: { type: 'number', required: true, min: 0 },
          expectedAnnualReturn: { type: 'number', required: true, min: -50, max: 100 },
          startDate: { type: 'date', required: true },
          investmentType: { type: 'string', required: true, options: ['stocks', 'bonds', 'mixed', 'crypto', 'real_estate'] }
        }
      },
      {
        type: 'emergency_fund',
        name: 'Emergency Fund Goal',
        description: 'Model building an emergency fund with specific target',
        parameters: {
          targetAmount: 0,
          monthlyContribution: 0,
          startDate: null,
          priority: 'high'
        },
        validationRules: {
          targetAmount: { type: 'number', required: true, min: 0 },
          monthlyContribution: { type: 'number', required: true, min: 0 },
          startDate: { type: 'date', required: true },
          priority: { type: 'string', required: true, options: ['low', 'medium', 'high'] }
        }
      },
      {
        type: 'life_event',
        name: 'Life Event',
        description: 'Model major life changes (marriage, children, retirement, etc.)',
        parameters: {
          eventType: '',
          eventDate: null,
          oneTimeCost: 0,
          monthlyImpact: 0,
          duration: 'permanent'
        },
        validationRules: {
          eventType: { type: 'string', required: true, options: ['marriage', 'child_birth', 'retirement', 'education', 'health'] },
          eventDate: { type: 'date', required: true },
          oneTimeCost: { type: 'number', required: false, min: 0 },
          monthlyImpact: { type: 'number', required: false },
          duration: { type: 'string', required: true, options: ['temporary', 'permanent', 'custom'] }
        }
      }
    ];
  }

  /**
   * Validate scenario parameters against template rules
   */
  static validateScenarioParameters(type, parameters) {
    const templates = this.getTemplates();
    const template = templates.find(t => t.type === type);
    
    if (!template) {
      return { valid: false, errors: [`Unknown scenario type: ${type}`] };
    }

    const errors = [];
    const rules = template.validationRules;

    for (const [field, rule] of Object.entries(rules)) {
      const value = parameters[field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
        continue;
      }

      if (rule.type === 'date' && !value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors.push(`${field} must be a valid date (YYYY-MM-DD)`);
        continue;
      }

      // Range validation
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }

      // Options validation
      if (rule.options && !rule.options.includes(value)) {
        errors.push(`${field} must be one of: ${rule.options.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format scenario object (convert database fields to app format)
   */
  static formatScenario(dbScenario) {
    return {
      id: dbScenario.id,
      name: dbScenario.name,
      description: dbScenario.description,
      type: dbScenario.type,
      parameters: JSON.parse(dbScenario.parameters),
      isActive: Boolean(dbScenario.is_active),
      createdAt: dbScenario.created_at,
      updatedAt: dbScenario.updated_at
    };
  }

  /**
   * Count scenarios with filters
   */
  static async count(options = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM scenarios';
      const params = [];
      const conditions = [];

      if (options.type) {
        conditions.push('type = ?');
        params.push(options.type);
      }

      if (options.is_active !== undefined) {
        conditions.push('is_active = ?');
        params.push(options.is_active ? 1 : 0);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await dbManager.selectOneQuery(sql, params);
      return result.count;
    } catch (error) {
      console.error('❌ Error counting scenarios:', error);
      throw error;
    }
  }
}

module.exports = ScenarioDAO; 