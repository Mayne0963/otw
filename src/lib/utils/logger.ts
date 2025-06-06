import { NextRequest, NextResponse } from 'next/server';
// import { firestore } from "../firebaseAdmin";

interface LogEntry {
  timestamp: Date;
  method: string;
  path: string;
  query?: Record<string, string>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  responseStatus: number;
  responseBody?: any;
  duration: number;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private readonly collection = 'api_logs';
  private readonly maxBodySize = 10000; // characters

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private truncateBody(body: any): any {
    const stringified = JSON.stringify(body);
    if (stringified.length > this.maxBodySize) {
      return {
        _truncated: true,
        preview: stringified.substring(0, this.maxBodySize) + '...',
        originalSize: stringified.length,
      };
    }
    return body;
  }

  private sanitizeBody(body: any): any {
    if (!body) {return body;}

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'apiKey',
    ];
    const sanitized = { ...body };

    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (
          sensitiveFields.some((field) =>
            key.toLowerCase().includes(field.toLowerCase()),
          )
        ) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private async saveLog(entry: LogEntry): Promise<void> {
    try {
      // Store only the last 30 days of logs
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Temporarily disabled during Firebase setup
      // Delete old logs periodically (1% chance per request)
      // if (Math.random() < 0.01) {
      //   const oldLogs = await firestore
      //     .collection(this.collection)
      //     .where("timestamp", "<", thirtyDaysAgo)
      //     .limit(100)
      //     .get();

      //   const batch = firestore.batch();
      //   oldLogs.docs.forEach((doc) => batch.delete(doc.ref));
      //   await batch.commit();
      // }

      // Save new log
      // await firestore.collection(this.collection).add({
      //   ...entry,
      //   _ttl: thirtyDaysAgo, // For Firestore TTL if enabled
      // });

      // Console log for now
      console.log('Log entry:', entry);
    } catch (error) {
      console.error('Failed to save log entry:', error);
    }
  }

  public async logRequest(
    req: NextRequest,
    res: NextResponse,
    userId: string | undefined,
    startTime: number,
    error?: Error,
  ): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - startTime;

    let requestBody;
    if (req.body) {
      try {
        const clone = req.clone();
        requestBody = await clone.json();
      } catch {
        requestBody = undefined;
      }
    }

    let responseBody;
    try {
      responseBody = await res.clone().json();
    } catch {
      responseBody = undefined;
    }

    const url = new URL(req.url);
    const entry: LogEntry = {
      timestamp: new Date(),
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userId,
      ip: req.ip,
      userAgent: req.headers.get('user-agent') || undefined,
      requestBody: this.truncateBody(this.sanitizeBody(requestBody)),
      responseStatus: res.status,
      responseBody: this.truncateBody(this.sanitizeBody(responseBody)),
      duration,
      error: error
        ? {
            message: error.message,
            code: (error as any).code,
            stack:
              process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : undefined,
    };

    await this.saveLog(entry);
  }

  public async getRecentLogs(
    userId?: string,
    path?: string,
    limit = 100,
  ): Promise<LogEntry[]> {
    // Temporarily disabled during Firebase setup
    // let query = firestore
    //   .collection(this.collection)
    //   .orderBy("timestamp", "desc")
    //   .limit(limit);

    // if (userId) {
    //   query = query.where("userId", "==", userId);
    // }
    // if (path) {
    //   query = query.where("path", "==", path);
    // }

    // const snapshot = await query.get();
    // return snapshot.docs.map((doc) => doc.data() as LogEntry);

    console.log('getRecentLogs called with:', { userId, path, limit });
    return [];
  }

  public async getErrorLogs(hours = 24, limit = 100): Promise<LogEntry[]> {
    // Temporarily disabled during Firebase setup
    // const since = new Date();
    // since.setHours(since.getHours() - hours);

    // const snapshot = await firestore
    //   .collection(this.collection)
    //   .where("timestamp", ">", since)
    //   .where("error", "!=", null)
    //   .orderBy("timestamp", "desc")
    //   .limit(limit)
    //   .get();

    // return snapshot.docs.map((doc) => doc.data() as LogEntry);

    console.log('getErrorLogs called with:', { hours, limit });
    return [];
  }

  public async getEndpointMetrics(
    path: string,
    hours = 24,
  ): Promise<{
    totalRequests: number;
    averageDuration: number;
    errorRate: number;
    statusCodes: Record<number, number>;
  }> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Temporarily disabled during Firebase setup
    // const snapshot = await firestore
    //   .collection(this.collection)
    //   .where("path", "==", path)
    //   .where("timestamp", ">", since)
    //   .get();

    // const logs = snapshot.docs.map((doc) => doc.data() as LogEntry);
    const logs: LogEntry[] = [];
    const totalRequests = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const errorCount = logs.filter((log) => log.error).length;

    const statusCodes = logs.reduce(
      (acc, log) => {
        acc[log.responseStatus] = (acc[log.responseStatus] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      totalRequests,
      averageDuration: totalRequests ? totalDuration / totalRequests : 0,
      errorRate: totalRequests ? errorCount / totalRequests : 0,
      statusCodes,
    };
  }
}

export const logger = Logger.getInstance();
