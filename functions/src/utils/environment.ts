/**
 * Environment Configuration and Security Utilities
 * Handles environment variables, secrets management, and security configurations
 */

import { logger } from 'firebase-functions';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { createLogger } from './logger';

// ========================================================================
// TYPES AND INTERFACES
// ========================================================================

export interface EnvironmentConfig {
  // Firebase Configuration
  projectId: string;
  region: string;
  
  // Database Configuration
  firestoreEmulatorHost?: string;
  
  // Authentication Configuration
  jwtSecret?: string;
  authDomain: string;
  
  // External Services
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  openaiApiKey?: string;
  googleMapsApiKey?: string;
  
  // Email Configuration
  emailProvider: 'sendgrid' | 'mailgun' | 'ses';
  emailApiKey?: string;
  emailFromAddress: string;
  
  // Storage Configuration
  storageBucket: string;
  
  // Security Configuration
  corsOrigins: string[];
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindowMs: number;
  
  // Monitoring and Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableAuditLogs: boolean;
  
  // Feature Flags
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableImageProcessing: boolean;
    enableBackups: boolean;
  };
}

export interface SecretConfig {
  name: string;
  version?: string;
  required: boolean;
  fallback?: string;
}

// ========================================================================
// ENVIRONMENT MANAGER
// ========================================================================

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig | null = null;
  private secretClient: SecretManagerServiceClient;
  private logger = createLogger('EnvironmentManager');
  
  private constructor() {
    this.secretClient = new SecretManagerServiceClient();
  }
  
  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }
  
  // ========================================================================
  // CONFIGURATION LOADING
  // ========================================================================
  
  async loadConfiguration(): Promise<EnvironmentConfig> {
    if (this.config) {
      return this.config;
    }
    
    this.logger.info('Loading environment configuration');
    
    try {
      // Load base configuration from environment variables
      const baseConfig = this.loadBaseConfig();
      
      // Load secrets from Secret Manager
      const secrets = await this.loadSecrets();
      
      // Merge configuration
      this.config = {
        ...baseConfig,
        ...secrets
      };
      
      // Validate configuration
      this.validateConfiguration(this.config);
      
      this.logger.info('Environment configuration loaded successfully');
      return this.config;
    } catch (error) {
      this.logger.error('Failed to load environment configuration', error as Error);
      throw error;
    }
  }
  
  private loadBaseConfig(): Partial<EnvironmentConfig> {
    const env = process.env;
    
    return {
      // Firebase Configuration
      projectId: env.GCLOUD_PROJECT || env.FIREBASE_PROJECT_ID || '',
      region: env.FUNCTIONS_REGION || 'us-central1',
      
      // Database Configuration
      firestoreEmulatorHost: env.FIRESTORE_EMULATOR_HOST,
      
      // Authentication Configuration
      authDomain: env.FIREBASE_AUTH_DOMAIN || `${env.GCLOUD_PROJECT}.firebaseapp.com`,
      
      // Email Configuration
      emailProvider: (env.EMAIL_PROVIDER as any) || 'sendgrid',
      emailFromAddress: env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
      
      // Storage Configuration
      storageBucket: env.FIREBASE_STORAGE_BUCKET || `${env.GCLOUD_PROJECT}.appspot.com`,
      
      // Security Configuration
      corsOrigins: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
      rateLimitEnabled: env.RATE_LIMIT_ENABLED === 'true',
      rateLimitRequests: parseInt(env.RATE_LIMIT_REQUESTS || '100'),
      rateLimitWindowMs: parseInt(env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      
      // Monitoring and Logging
      logLevel: (env.LOG_LEVEL as any) || 'info',
      enableMetrics: env.ENABLE_METRICS !== 'false',
      enableAuditLogs: env.ENABLE_AUDIT_LOGS !== 'false',
      
      // Feature Flags
      features: {
        enableNotifications: env.ENABLE_NOTIFICATIONS !== 'false',
        enableAnalytics: env.ENABLE_ANALYTICS !== 'false',
        enableImageProcessing: env.ENABLE_IMAGE_PROCESSING !== 'false',
        enableBackups: env.ENABLE_BACKUPS !== 'false'
      }
    };
  }
  
  private async loadSecrets(): Promise<Partial<EnvironmentConfig>> {
    const secrets: SecretConfig[] = [
      { name: 'jwt-secret', required: false },
      { name: 'stripe-secret-key', required: false },
      { name: 'stripe-webhook-secret', required: false },
      { name: 'openai-api-key', required: false },
      { name: 'google-maps-api-key', required: false },
      { name: 'email-api-key', required: false }
    ];
    
    const secretValues: Partial<EnvironmentConfig> = {};
    
    for (const secret of secrets) {
      try {
        const value = await this.getSecret(secret.name, secret.version);
        
        // Map secret names to config properties
        switch (secret.name) {
          case 'jwt-secret':
            secretValues.jwtSecret = value;
            break;
          case 'stripe-secret-key':
            secretValues.stripeSecretKey = value;
            break;
          case 'stripe-webhook-secret':
            secretValues.stripeWebhookSecret = value;
            break;
          case 'openai-api-key':
            secretValues.openaiApiKey = value;
            break;
          case 'google-maps-api-key':
            secretValues.googleMapsApiKey = value;
            break;
          case 'email-api-key':
            secretValues.emailApiKey = value;
            break;
        }
      } catch (error) {
        if (secret.required) {
          throw new Error(`Required secret '${secret.name}' not found`);
        }
        
        this.logger.warn(`Optional secret '${secret.name}' not found`, {
          secretName: secret.name
        });
        
        if (secret.fallback) {
          this.logger.info(`Using fallback value for secret '${secret.name}'`);
          // Apply fallback logic here
        }
      }
    }
    
    return secretValues;
  }
  
  private async getSecret(name: string, version: string = 'latest'): Promise<string> {
    const projectId = process.env.GCLOUD_PROJECT;
    if (!projectId) {
      throw new Error('GCLOUD_PROJECT environment variable not set');
    }
    
    const secretName = `projects/${projectId}/secrets/${name}/versions/${version}`;
    
    try {
      const [response] = await this.secretClient.accessSecretVersion({
        name: secretName
      });
      
      const payload = response.payload?.data?.toString();
      if (!payload) {
        throw new Error(`Secret '${name}' has no payload`);
      }
      
      return payload;
    } catch (error) {
      this.logger.error(`Failed to access secret '${name}'`, error as Error);
      throw error;
    }
  }
  
  // ========================================================================
  // CONFIGURATION VALIDATION
  // ========================================================================
  
  private validateConfiguration(config: EnvironmentConfig): void {
    const errors: string[] = [];
    
    // Required fields validation
    if (!config.projectId) {
      errors.push('Project ID is required');
    }
    
    if (!config.authDomain) {
      errors.push('Auth domain is required');
    }
    
    if (!config.storageBucket) {
      errors.push('Storage bucket is required');
    }
    
    if (!config.emailFromAddress) {
      errors.push('Email from address is required');
    }
    
    // Validation for specific configurations
    if (config.rateLimitEnabled) {
      if (config.rateLimitRequests <= 0) {
        errors.push('Rate limit requests must be greater than 0');
      }
      
      if (config.rateLimitWindowMs <= 0) {
        errors.push('Rate limit window must be greater than 0');
      }
    }
    
    // Email provider validation
    const validEmailProviders = ['sendgrid', 'mailgun', 'ses'];
    if (!validEmailProviders.includes(config.emailProvider)) {
      errors.push(`Invalid email provider: ${config.emailProvider}`);
    }
    
    // Log level validation
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(config.logLevel)) {
      errors.push(`Invalid log level: ${config.logLevel}`);
    }
    
    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed: ${errors.join(', ')}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    this.logger.info('Configuration validation passed');
  }
  
  // ========================================================================
  // CONFIGURATION ACCESS
  // ========================================================================
  
  getConfig(): EnvironmentConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    return this.config;
  }
  
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  isEmulator(): boolean {
    return !!process.env.FUNCTIONS_EMULATOR;
  }
  
  getFeatureFlag(feature: keyof EnvironmentConfig['features']): boolean {
    const config = this.getConfig();
    return config.features[feature];
  }
}

// ========================================================================
// SECURITY UTILITIES
// ========================================================================

export class SecurityManager {
  private logger = createLogger('SecurityManager');
  private envManager = EnvironmentManager.getInstance();
  
  // ========================================================================
  // CORS CONFIGURATION
  // ========================================================================
  
  getCorsOptions(): any {
    const config = this.envManager.getConfig();
    
    return {
      origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }
        
        if (config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Log unauthorized CORS attempt
        this.logger.logSecurityEvent('Unauthorized CORS origin', 'medium', {
          origin,
          allowedOrigins: config.corsOrigins
        });
        
        return callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
  }
  
  // ========================================================================
  // INPUT VALIDATION
  // ========================================================================
  
  validateInput(input: any, schema: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation logic - you can integrate with libraries like Joi or Yup
    // This is a simplified example
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!input[field]) {
          errors.push(`Field '${field}' is required`);
        }
      }
    }
    
    if (schema.properties) {
      for (const [field, rules] of Object.entries(schema.properties as any)) {
        const value = input[field];
        
        if (value !== undefined) {
          if (rules.type && typeof value !== rules.type) {
            errors.push(`Field '${field}' must be of type ${rules.type}`);
          }
          
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
          }
          
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Field '${field}' must be at most ${rules.maxLength} characters`);
          }
          
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            errors.push(`Field '${field}' does not match required pattern`);
          }
        }
      }
    }
    
    if (errors.length > 0) {
      this.logger.logSecurityEvent('Input validation failed', 'low', {
        errors,
        input: this.sanitizeForLogging(input)
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // ========================================================================
  // DATA SANITIZATION
  // ========================================================================
  
  sanitizeForLogging(data: any): any {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'credit_card', 'ssn', 'phone', 'email'
    ];
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
        
        if (isSensitive) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(value);
        }
      }
      
      return result;
    };
    
    return sanitizeObject(sanitized);
  }
  
  sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // ========================================================================
  // ENCRYPTION UTILITIES
  // ========================================================================
  
  async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  }
  
  generateSecureToken(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

export async function initializeEnvironment(): Promise<EnvironmentConfig> {
  const envManager = EnvironmentManager.getInstance();
  return await envManager.loadConfiguration();
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const envManager = EnvironmentManager.getInstance();
  return envManager.getConfig();
}

export function isProduction(): boolean {
  const envManager = EnvironmentManager.getInstance();
  return envManager.isProduction();
}

export function isDevelopment(): boolean {
  const envManager = EnvironmentManager.getInstance();
  return envManager.isDevelopment();
}

export function isEmulator(): boolean {
  const envManager = EnvironmentManager.getInstance();
  return envManager.isEmulator();
}

export function getFeatureFlag(feature: keyof EnvironmentConfig['features']): boolean {
  const envManager = EnvironmentManager.getInstance();
  return envManager.getFeatureFlag(feature);
}

export function createSecurityManager(): SecurityManager {
  return new SecurityManager();
}

// ========================================================================
// ENVIRONMENT VALIDATION MIDDLEWARE
// ========================================================================

export function validateEnvironment() {
  return async (req: any, res: any, next: any) => {
    try {
      const envManager = EnvironmentManager.getInstance();
      const config = envManager.getConfig();
      
      // Add environment info to request
      req.environment = {
        isProduction: envManager.isProduction(),
        isDevelopment: envManager.isDevelopment(),
        isEmulator: envManager.isEmulator(),
        config
      };
      
      next();
    } catch (error) {
      logger.error('Environment validation failed', error);
      res.status(500).json({
        error: 'Environment configuration error',
        message: 'Server configuration is invalid'
      });
    }
  };
}

// ========================================================================
// EXPORTS
// ========================================================================

export default {
  EnvironmentManager,
  SecurityManager,
  initializeEnvironment,
  getEnvironmentConfig,
  isProduction,
  isDevelopment,
  isEmulator,
  getFeatureFlag,
  createSecurityManager,
  validateEnvironment
};