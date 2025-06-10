/**
 * Enhanced Logging and Debugging Utilities for Firebase Cloud Functions
 * Provides structured logging, error tracking, and performance monitoring
 */

import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ========================================================================
// TYPES AND INTERFACES
// ========================================================================

export interface LogContext {
  userId?: string;
  orderId?: string;
  restaurantId?: string;
  functionName?: string;
  requestId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: any;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  context?: LogContext;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceMetrics {
  functionName: string;
  duration: number;
  memoryUsed?: number;
  cpuUsed?: number;
  context?: LogContext;
  timestamp?: Date;
}

export interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  changes?: Record<string, any>;
  context?: LogContext;
  timestamp?: Date;
}

// ========================================================================
// LOGGER CLASS
// ========================================================================

export class EnhancedLogger {
  private db = getFirestore();
  private functionName: string;
  private requestId: string;
  private startTime: number;
  
  constructor(functionName: string, requestId?: string) {
    this.functionName = functionName;
    this.requestId = requestId || this.generateRequestId();
    this.startTime = Date.now();
  }
  
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level}] [${this.functionName}] [${this.requestId}] ${message} ${contextStr}`;
  }
  
  // ========================================================================
  // BASIC LOGGING METHODS
  // ========================================================================
  
  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('INFO', message, context);
    logger.info(formattedMessage, { 
      functionName: this.functionName,
      requestId: this.requestId,
      ...context 
    });
  }
  
  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('WARN', message, context);
    logger.warn(formattedMessage, { 
      functionName: this.functionName,
      requestId: this.requestId,
      ...context 
    });
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    const errorDetails: ErrorDetails = {
      message,
      stack: error?.stack,
      code: (error as any)?.code,
      context: {
        functionName: this.functionName,
        requestId: this.requestId,
        ...context
      },
      timestamp: new Date(),
      severity: 'medium'
    };
    
    const formattedMessage = this.formatMessage('ERROR', message, context);
    logger.error(formattedMessage, {
      error: error?.message,
      stack: error?.stack,
      functionName: this.functionName,
      requestId: this.requestId,
      ...context
    });
    
    // Store error in Firestore for analysis
    this.storeError(errorDetails).catch(err => {
      logger.error('Failed to store error in Firestore', err);
    });
  }
  
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const formattedMessage = this.formatMessage('DEBUG', message, context);
      logger.debug(formattedMessage, { 
        functionName: this.functionName,
        requestId: this.requestId,
        ...context 
      });
    }
  }
  
  // ========================================================================
  // SPECIALIZED LOGGING METHODS
  // ========================================================================
  
  logFunctionStart(context?: LogContext): void {
    this.info(`Function ${this.functionName} started`, {
      startTime: this.startTime,
      ...context
    });
  }
  
  logFunctionEnd(context?: LogContext): void {
    const duration = Date.now() - this.startTime;
    this.info(`Function ${this.functionName} completed`, {
      duration: `${duration}ms`,
      ...context
    });
    
    // Store performance metrics
    this.storePerformanceMetrics({
      functionName: this.functionName,
      duration,
      context: {
        requestId: this.requestId,
        ...context
      },
      timestamp: new Date()
    }).catch(err => {
      logger.error('Failed to store performance metrics', err);
    });
  }
  
  logApiCall(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`API call: ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...context
    });
  }
  
  logDatabaseOperation(operation: string, collection: string, documentId?: string, context?: LogContext): void {
    this.info(`Database operation: ${operation}`, {
      operation,
      collection,
      documentId,
      ...context
    });
  }
  
  logUserAction(userId: string, action: string, resource?: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      resource,
      ...context
    });
    
    // Store audit log
    this.storeAuditLog({
      action,
      resource: resource || 'unknown',
      userId,
      context: {
        functionName: this.functionName,
        requestId: this.requestId,
        ...context
      },
      timestamp: new Date()
    }).catch(err => {
      logger.error('Failed to store audit log', err);
    });
  }
  
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      event,
      severity,
      ...context
    });
    
    // Store security event
    this.storeError({
      message: `Security event: ${event}`,
      severity,
      context: {
        functionName: this.functionName,
        requestId: this.requestId,
        ...context
      },
      timestamp: new Date()
    }).catch(err => {
      logger.error('Failed to store security event', err);
    });
  }
  
  // ========================================================================
  // STORAGE METHODS
  // ========================================================================
  
  private async storeError(errorDetails: ErrorDetails): Promise<void> {
    try {
      await this.db.collection('system_logs').doc('errors').collection('entries').add({
        ...errorDetails,
        timestamp: Timestamp.fromDate(errorDetails.timestamp || new Date())
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to store error log:', error);
    }
  }
  
  private async storePerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      await this.db.collection('system_logs').doc('performance').collection('entries').add({
        ...metrics,
        timestamp: Timestamp.fromDate(metrics.timestamp || new Date())
      });
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }
  }
  
  private async storeAuditLog(auditEntry: AuditLogEntry): Promise<void> {
    try {
      await this.db.collection('system_logs').doc('audit').collection('entries').add({
        ...auditEntry,
        timestamp: Timestamp.fromDate(auditEntry.timestamp || new Date())
      });
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }
}

// ========================================================================
// PERFORMANCE MONITORING
// ========================================================================

export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();
  private logger: EnhancedLogger;
  
  constructor(logger: EnhancedLogger) {
    this.logger = logger;
    this.startTime = Date.now();
  }
  
  checkpoint(name: string): void {
    const now = Date.now();
    this.checkpoints.set(name, now);
    this.logger.debug(`Checkpoint ${name}`, {
      checkpoint: name,
      elapsed: `${now - this.startTime}ms`
    });
  }
  
  measure(startCheckpoint: string, endCheckpoint: string): number {
    const start = this.checkpoints.get(startCheckpoint);
    const end = this.checkpoints.get(endCheckpoint);
    
    if (!start || !end) {
      this.logger.warn('Invalid checkpoint names for measurement', {
        startCheckpoint,
        endCheckpoint
      });
      return 0;
    }
    
    const duration = end - start;
    this.logger.info(`Performance measurement: ${startCheckpoint} to ${endCheckpoint}`, {
      duration: `${duration}ms`
    });
    
    return duration;
  }
  
  getTotalDuration(): number {
    return Date.now() - this.startTime;
  }
}

// ========================================================================
// ERROR HANDLING UTILITIES
// ========================================================================

export class ErrorHandler {
  private logger: EnhancedLogger;
  
  constructor(logger: EnhancedLogger) {
    this.logger = logger;
  }
  
  handleError(error: Error, context?: LogContext): never {
    this.logger.error('Unhandled error occurred', error, context);
    
    // Determine appropriate HTTP error based on error type
    if ((error as any).code === 'permission-denied') {
      throw new functions.https.HttpsError('permission-denied', error.message);
    } else if ((error as any).code === 'not-found') {
      throw new functions.https.HttpsError('not-found', error.message);
    } else if ((error as any).code === 'invalid-argument') {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    } else {
      throw new functions.https.HttpsError('internal', 'An internal error occurred');
    }
  }
  
  wrapAsync<T>(fn: () => Promise<T>, context?: LogContext): Promise<T> {
    return fn().catch(error => {
      this.handleError(error, context);
    });
  }
}

// ========================================================================
// STRUCTURED LOGGING HELPERS
// ========================================================================

export function createLogger(functionName: string, requestId?: string): EnhancedLogger {
  return new EnhancedLogger(functionName, requestId);
}

export function withLogging<T extends any[], R>(
  functionName: string,
  fn: (logger: EnhancedLogger, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const logger = createLogger(functionName);
    const monitor = new PerformanceMonitor(logger);
    
    logger.logFunctionStart();
    monitor.checkpoint('start');
    
    try {
      const result = await fn(logger, ...args);
      
      monitor.checkpoint('end');
      logger.logFunctionEnd({
        totalDuration: `${monitor.getTotalDuration()}ms`
      });
      
      return result;
    } catch (error) {
      monitor.checkpoint('error');
      logger.error('Function failed', error as Error, {
        totalDuration: `${monitor.getTotalDuration()}ms`
      });
      
      const errorHandler = new ErrorHandler(logger);
      errorHandler.handleError(error as Error);
    }
  };
}

// ========================================================================
// RATE LIMITING AND MONITORING
// ========================================================================

export class RateLimitMonitor {
  private logger: EnhancedLogger;
  private db = getFirestore();
  
  constructor(logger: EnhancedLogger) {
    this.logger = logger;
  }
  
  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    context?: LogContext
  ): Promise<boolean> {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      const rateLimitDoc = this.db.collection('rate_limits').doc(key);
      const doc = await rateLimitDoc.get();
      
      if (!doc.exists) {
        await rateLimitDoc.set({
          requests: [now],
          createdAt: Timestamp.fromMillis(now)
        });
        return true;
      }
      
      const data = doc.data()!;
      const requests = (data.requests || []).filter((timestamp: number) => timestamp > windowStart);
      
      if (requests.length >= limit) {
        this.logger.logSecurityEvent('Rate limit exceeded', 'medium', {
          key,
          limit,
          windowMs,
          currentRequests: requests.length,
          ...context
        });
        return false;
      }
      
      requests.push(now);
      await rateLimitDoc.update({ requests });
      
      return true;
    } catch (error) {
      this.logger.error('Rate limit check failed', error as Error, context);
      // Fail open - allow request if rate limiting fails
      return true;
    }
  }
}

// ========================================================================
// HEALTH CHECK UTILITIES
// ========================================================================

export class HealthChecker {
  private logger: EnhancedLogger;
  private db = getFirestore();
  
  constructor(logger: EnhancedLogger) {
    this.logger = logger;
  }
  
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      const testDoc = await this.db.collection('health_check').doc('test').get();
      this.logger.debug('Database health check passed');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error as Error);
      return false;
    }
  }
  
  async checkExternalServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Add checks for external services here
    // Example: Stripe, email service, etc.
    
    return results;
  }
  
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: Date;
  }> {
    const checks: Record<string, boolean> = {
      database: await this.checkDatabaseHealth(),
      ...await this.checkExternalServices()
    };
    
    const allHealthy = Object.values(checks).every(check => check);
    const someHealthy = Object.values(checks).some(check => check);
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      status = 'healthy';
    } else if (someHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    this.logger.info('Health check completed', {
      status,
      checks
    });
    
    return {
      status,
      checks,
      timestamp: new Date()
    };
  }
}

// ========================================================================
// EXPORTS
// ========================================================================

export {
  logger as firebaseLogger
} from 'firebase-functions';

// Re-export Firebase Functions for convenience
import * as functions from 'firebase-functions';
export { functions };