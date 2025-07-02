/**
 * User Profile Data Access Object
 * Professional financial planning methodology with comprehensive user management
 */

const { dbManager } = require('./database');
const { v4: uuidv4 } = require('uuid');

/**
 * User Profile validation schema
 */
function validateUserProfile(profile) {
  const errors = [];

  if (!profile.id || typeof profile.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (!profile.first_name || typeof profile.first_name !== 'string') {
    errors.push('First name is required and must be a string');
  }

  if (!profile.last_name || typeof profile.last_name !== 'string') {
    errors.push('Last name is required and must be a string');
  }

  if (profile.email && typeof profile.email !== 'string') {
    errors.push('Email must be a string');
  }

  if (profile.annual_income !== undefined && (typeof profile.annual_income !== 'number' || profile.annual_income < 0)) {
    errors.push('Annual income must be a positive number');
  }

  if (profile.risk_tolerance_score !== undefined && (typeof profile.risk_tolerance_score !== 'number' || profile.risk_tolerance_score < -14 || profile.risk_tolerance_score > 11)) {
    errors.push('Risk tolerance score must be between -14 and 11 (professional scale)');
  }

  const validMaritalStatuses = ['single', 'married', 'divorced', 'widowed'];
  if (profile.marital_status && !validMaritalStatuses.includes(profile.marital_status)) {
    errors.push(`Marital status must be one of: ${validMaritalStatuses.join(', ')}`);
  }

  const validEmploymentStatuses = ['employed', 'self_employed', 'unemployed', 'retired'];
  if (profile.employment_status && !validEmploymentStatuses.includes(profile.employment_status)) {
    errors.push(`Employment status must be one of: ${validEmploymentStatuses.join(', ')}`);
  }

  const validRiskCategories = ['conservative', 'moderate', 'aggressive'];
  if (profile.risk_category && !validRiskCategories.includes(profile.risk_category)) {
    errors.push(`Risk category must be one of: ${validRiskCategories.join(', ')}`);
  }

  return errors;
}

/**
 * User Profile Data Access Object
 */
class UserProfileDAO {
  
  /**
   * Create a new user profile
   */
  static async create(profile) {
    try {
      // Generate ID if not provided
      if (!profile.id) {
        profile.id = uuidv4();
      }

      // Validate profile data
      const errors = validateUserProfile(profile);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        INSERT INTO user_profiles (
          id, first_name, last_name, nickname, date_of_birth, marital_status,
          email, phone, address, employer, job_title, employment_status,
          annual_income, income_growth_rate, goal_priorities, risk_tolerance_score,
          risk_category, primary_currency, date_format, number_format,
          onboarding_completed, ai_recommendations_enabled, data_sharing_consent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        profile.id,
        profile.first_name,
        profile.last_name,
        profile.nickname || null,
        profile.date_of_birth || null,
        profile.marital_status || null,
        profile.email || null,
        profile.phone || null,
        profile.address ? JSON.stringify(profile.address) : null,
        profile.employer || null,
        profile.job_title || null,
        profile.employment_status || null,
        profile.annual_income || null,
        profile.income_growth_rate || 0.03,
        profile.goal_priorities ? JSON.stringify(profile.goal_priorities) : null,
        profile.risk_tolerance_score || null,
        profile.risk_category || null,
        profile.primary_currency || 'USD',
        profile.date_format || 'MM/DD/YYYY',
        profile.number_format || 'US',
        profile.onboarding_completed !== undefined ? (profile.onboarding_completed ? 1 : 0) : 0,
        profile.ai_recommendations_enabled !== undefined ? (profile.ai_recommendations_enabled ? 1 : 0) : 1,
        profile.data_sharing_consent !== undefined ? (profile.data_sharing_consent ? 1 : 0) : 0
      ];

      const result = await dbManager.executeQuery(sql, params);
      console.log(`✅ Created user profile: ${profile.first_name} ${profile.last_name}`);
      
      return await this.getById(profile.id);
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM user_profiles WHERE id = ?';
      const profile = await dbManager.selectOneQuery(sql, [id]);
      
      if (profile) {
        return this.formatUserProfile(profile);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile by ID:', error);
      throw error;
    }
  }

  /**
   * Get user profile by email
   */
  static async getByEmail(email) {
    try {
      const sql = 'SELECT * FROM user_profiles WHERE email = ?';
      const profile = await dbManager.selectOneQuery(sql, [email]);
      
      if (profile) {
        return this.formatUserProfile(profile);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile by email:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async update(id, updates) {
    try {
      // Get existing profile for validation
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('User profile not found');
      }

      // Merge updates with existing data
      const updatedProfile = { ...existing, ...updates, id };
      
      // Validate updated data
      const errors = validateUserProfile(updatedProfile);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      const sql = `
        UPDATE user_profiles SET 
          first_name = ?, last_name = ?, nickname = ?, date_of_birth = ?, marital_status = ?,
          email = ?, phone = ?, address = ?, employer = ?, job_title = ?, employment_status = ?,
          annual_income = ?, income_growth_rate = ?, goal_priorities = ?, risk_tolerance_score = ?,
          risk_category = ?, primary_currency = ?, date_format = ?, number_format = ?,
          onboarding_completed = ?, ai_recommendations_enabled = ?, data_sharing_consent = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        updatedProfile.first_name,
        updatedProfile.last_name,
        updatedProfile.nickname,
        updatedProfile.date_of_birth,
        updatedProfile.marital_status,
        updatedProfile.email,
        updatedProfile.phone,
        updatedProfile.address ? JSON.stringify(updatedProfile.address) : null,
        updatedProfile.employer,
        updatedProfile.job_title,
        updatedProfile.employment_status,
        updatedProfile.annual_income,
        updatedProfile.income_growth_rate,
        updatedProfile.goal_priorities ? JSON.stringify(updatedProfile.goal_priorities) : null,
        updatedProfile.risk_tolerance_score,
        updatedProfile.risk_category,
        updatedProfile.primary_currency,
        updatedProfile.date_format,
        updatedProfile.number_format,
        updatedProfile.onboarding_completed ? 1 : 0,
        updatedProfile.ai_recommendations_enabled ? 1 : 0,
        updatedProfile.data_sharing_consent ? 1 : 0,
        id
      ];

      const result = await dbManager.executeQuery(sql, params);
      
      if (result.changes === 0) {
        throw new Error('User profile not found or no changes made');
      }

      console.log(`✅ Updated user profile: ${id}`);
      return await this.getById(id);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Calculate and update risk assessment
   */
  static async updateRiskAssessment(userId, riskScores) {
    try {
      // Professional Risk Assessment Calculation (-14 to +11 scale)
      const {
        primary_goal_score = 0,
        investment_horizon_score = 0,
        withdrawal_timeframe_score = 0,
        inflation_tolerance_score = 0,
        portfolio_volatility_score = 0,
        volatility_comfort_score = 0,
        other_assets_score = 0
      } = riskScores;

      const totalRiskScore = primary_goal_score + investment_horizon_score + 
                           withdrawal_timeframe_score + inflation_tolerance_score +
                           portfolio_volatility_score + volatility_comfort_score + other_assets_score;

      // Determine risk category based on total score
      let riskCategory;
      if (totalRiskScore <= -5) {
        riskCategory = 'conservative';
      } else if (totalRiskScore >= 3) {
        riskCategory = 'aggressive';
      } else {
        riskCategory = 'moderate';
      }

      // Save risk assessment
      const riskAssessmentSql = `
        INSERT OR REPLACE INTO risk_assessments (
          id, user_profile_id, primary_goal_score, investment_horizon_score,
          withdrawal_timeframe_score, inflation_tolerance_score, portfolio_volatility_score,
          volatility_comfort_score, other_assets_score, total_risk_score, risk_category,
          assessment_method, is_current
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'questionnaire', 1)
      `;

      const assessmentId = uuidv4();
      await dbManager.executeQuery(riskAssessmentSql, [
        assessmentId, userId, primary_goal_score, investment_horizon_score,
        withdrawal_timeframe_score, inflation_tolerance_score, portfolio_volatility_score,
        volatility_comfort_score, other_assets_score, totalRiskScore, riskCategory
      ]);

      // Update user profile with risk assessment results
      await this.update(userId, {
        risk_tolerance_score: totalRiskScore,
        risk_category: riskCategory
      });

      console.log(`✅ Updated risk assessment for user ${userId}: ${totalRiskScore} (${riskCategory})`);
      
      return {
        totalRiskScore,
        riskCategory,
        assessmentId,
        breakdown: riskScores
      };
    } catch (error) {
      console.error('❌ Error updating risk assessment:', error);
      throw error;
    }
  }

  /**
   * Update financial goals and priorities
   */
  static async updateGoalPriorities(userId, goalPriorities) {
    try {
      // Validate goal priorities (1-10 scale)
      for (const [goal, priority] of Object.entries(goalPriorities)) {
        if (typeof priority !== 'number' || priority < 1 || priority > 10) {
          throw new Error(`Goal priority for ${goal} must be between 1 and 10`);
        }
      }

      await this.update(userId, { goal_priorities: goalPriorities });
      
      console.log(`✅ Updated goal priorities for user ${userId}`);
      return goalPriorities;
    } catch (error) {
      console.error('❌ Error updating goal priorities:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding process
   */
  static async completeOnboarding(userId, onboardingData = {}) {
    try {
      const updates = {
        onboarding_completed: true,
        ...onboardingData
      };

      await this.update(userId, updates);
      
      console.log(`✅ Completed onboarding for user ${userId}`);
      return await this.getById(userId);
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user financial profile
   */
  static async getFinancialProfile(userId) {
    try {
      const profile = await this.getById(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Get latest risk assessment
      const riskAssessment = await dbManager.selectOneQuery(`
        SELECT * FROM risk_assessments 
        WHERE user_profile_id = ? AND is_current = 1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get financial goals
      const financialGoals = await dbManager.selectQuery(`
        SELECT * FROM financial_goals 
        WHERE user_profile_id = ? 
        ORDER BY priority_score DESC, created_at DESC
      `, [userId]);

      // Get family members
      const familyMembers = await dbManager.selectQuery(`
        SELECT * FROM family_members 
        WHERE user_profile_id = ? 
        ORDER BY financial_dependency_level DESC
      `, [userId]);

      return {
        profile,
        riskAssessment: riskAssessment ? this.formatRiskAssessment(riskAssessment) : null,
        financialGoals: financialGoals.map(this.formatFinancialGoal),
        familyMembers: familyMembers.map(this.formatFamilyMember)
      };
    } catch (error) {
      console.error('❌ Error getting financial profile:', error);
      throw error;
    }
  }

  /**
   * Add family member
   */
  static async addFamilyMember(userId, familyMember) {
    try {
      const id = uuidv4();
      
      const sql = `
        INSERT INTO family_members (
          id, user_profile_id, relationship, first_name, last_name,
          date_of_birth, financial_dependency_level, education_goals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        userId,
        familyMember.relationship,
        familyMember.first_name,
        familyMember.last_name || null,
        familyMember.date_of_birth || null,
        familyMember.financial_dependency_level || 0,
        familyMember.education_goals ? JSON.stringify(familyMember.education_goals) : null
      ];

      await dbManager.executeQuery(sql, params);
      console.log(`✅ Added family member: ${familyMember.first_name}`);
      
      return id;
    } catch (error) {
      console.error('❌ Error adding family member:', error);
      throw error;
    }
  }

  /**
   * Add financial goal
   */
  static async addFinancialGoal(userId, goal) {
    try {
      const id = uuidv4();
      
      const sql = `
        INSERT INTO financial_goals (
          id, user_profile_id, goal_type, priority_score, target_amount,
          target_date, current_progress, monthly_contribution, auto_adjustment, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        userId,
        goal.goal_type,
        goal.priority_score || 5,
        goal.target_amount,
        goal.target_date || null,
        goal.current_progress || 0,
        goal.monthly_contribution || null,
        goal.auto_adjustment !== undefined ? (goal.auto_adjustment ? 1 : 0) : 1,
        goal.notes || null
      ];

      await dbManager.executeQuery(sql, params);
      console.log(`✅ Added financial goal: ${goal.goal_type}`);
      
      return id;
    } catch (error) {
      console.error('❌ Error adding financial goal:', error);
      throw error;
    }
  }

  /**
   * Get users requiring onboarding completion
   */
  static async getIncompleteOnboarding() {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, created_at 
        FROM user_profiles 
        WHERE onboarding_completed = 0 
        ORDER BY created_at DESC
      `;
      
      const users = await dbManager.selectQuery(sql);
      return users.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        createdAt: user.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting incomplete onboarding users:', error);
      throw error;
    }
  }

  /**
   * Delete user profile (and all associated data)
   */
  static async delete(id) {
    try {
      // Begin transaction - foreign key constraints will handle cascading deletes
      await dbManager.beginTransaction();

      try {
        const sql = 'DELETE FROM user_profiles WHERE id = ?';
        const result = await dbManager.executeQuery(sql, [id]);
        
        if (result.changes === 0) {
          throw new Error('User profile not found');
        }

        await dbManager.commitTransaction();
        console.log(`✅ Deleted user profile: ${id}`);
        
        return { success: true, id, changes: result.changes };
      } catch (error) {
        await dbManager.rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error('❌ Error deleting user profile:', error);
      throw error;
    }
  }

  /**
   * Format user profile data from database
   */
  static formatUserProfile(dbProfile) {
    if (!dbProfile) return null;

    return {
      id: dbProfile.id,
      firstName: dbProfile.first_name,
      lastName: dbProfile.last_name,
      nickname: dbProfile.nickname,
      fullName: `${dbProfile.first_name} ${dbProfile.last_name}`,
      dateOfBirth: dbProfile.date_of_birth,
      maritalStatus: dbProfile.marital_status,
      email: dbProfile.email,
      phone: dbProfile.phone,
      address: dbProfile.address ? JSON.parse(dbProfile.address) : null,
      
      // Employment Information
      employer: dbProfile.employer,
      jobTitle: dbProfile.job_title,
      employmentStatus: dbProfile.employment_status,
      annualIncome: dbProfile.annual_income,
      incomeGrowthRate: dbProfile.income_growth_rate,
      
      // Financial Planning
      goalPriorities: dbProfile.goal_priorities ? JSON.parse(dbProfile.goal_priorities) : null,
      riskToleranceScore: dbProfile.risk_tolerance_score,
      riskCategory: dbProfile.risk_category,
      
      // Preferences
      primaryCurrency: dbProfile.primary_currency,
      dateFormat: dbProfile.date_format,
      numberFormat: dbProfile.number_format,
      
      // Status
      onboardingCompleted: Boolean(dbProfile.onboarding_completed),
      aiRecommendationsEnabled: Boolean(dbProfile.ai_recommendations_enabled),
      dataSharingConsent: Boolean(dbProfile.data_sharing_consent),
      
      // Timestamps
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at
    };
  }

  /**
   * Format risk assessment data
   */
  static formatRiskAssessment(dbRiskAssessment) {
    if (!dbRiskAssessment) return null;

    return {
      id: dbRiskAssessment.id,
      userId: dbRiskAssessment.user_profile_id,
      scores: {
        primaryGoal: dbRiskAssessment.primary_goal_score,
        investmentHorizon: dbRiskAssessment.investment_horizon_score,
        withdrawalTimeframe: dbRiskAssessment.withdrawal_timeframe_score,
        inflationTolerance: dbRiskAssessment.inflation_tolerance_score,
        portfolioVolatility: dbRiskAssessment.portfolio_volatility_score,
        volatilityComfort: dbRiskAssessment.volatility_comfort_score,
        otherAssets: dbRiskAssessment.other_assets_score
      },
      totalRiskScore: dbRiskAssessment.total_risk_score,
      riskCategory: dbRiskAssessment.risk_category,
      recommendedAllocation: dbRiskAssessment.recommended_allocation ? 
        JSON.parse(dbRiskAssessment.recommended_allocation) : null,
      assessmentDate: dbRiskAssessment.assessment_date,
      assessmentMethod: dbRiskAssessment.assessment_method,
      isCurrent: Boolean(dbRiskAssessment.is_current),
      createdAt: dbRiskAssessment.created_at
    };
  }

  /**
   * Format financial goal data
   */
  static formatFinancialGoal(dbGoal) {
    if (!dbGoal) return null;

    return {
      id: dbGoal.id,
      userId: dbGoal.user_profile_id,
      type: dbGoal.goal_type,
      priorityScore: dbGoal.priority_score,
      targetAmount: dbGoal.target_amount,
      targetDate: dbGoal.target_date,
      currentProgress: dbGoal.current_progress,
      monthlyContribution: dbGoal.monthly_contribution,
      autoAdjustment: Boolean(dbGoal.auto_adjustment),
      notes: dbGoal.notes,
      createdAt: dbGoal.created_at,
      updatedAt: dbGoal.updated_at
    };
  }

  /**
   * Format family member data
   */
  static formatFamilyMember(dbMember) {
    if (!dbMember) return null;

    return {
      id: dbMember.id,
      userId: dbMember.user_profile_id,
      relationship: dbMember.relationship,
      firstName: dbMember.first_name,
      lastName: dbMember.last_name,
      fullName: `${dbMember.first_name}${dbMember.last_name ? ' ' + dbMember.last_name : ''}`,
      dateOfBirth: dbMember.date_of_birth,
      financialDependencyLevel: dbMember.financial_dependency_level,
      educationGoals: dbMember.education_goals ? JSON.parse(dbMember.education_goals) : null,
      createdAt: dbMember.created_at
    };
  }

  /**
   * Count user profiles
   */
  static async count(options = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM user_profiles';
      const params = [];

      if (options.onboarding_completed !== undefined) {
        sql += ' WHERE onboarding_completed = ?';
        params.push(options.onboarding_completed ? 1 : 0);
      }

      const result = await dbManager.selectOneQuery(sql, params);
      return result ? result.count : 0;
    } catch (error) {
      console.error('❌ Error counting user profiles:', error);
      throw error;
    }
  }
}

module.exports = { UserProfileDAO }; 