type ErrorSeverity = "low" | "medium" | "high" | "critical"

interface ErrorDetails {
  message: string
  code?: string
  severity?: ErrorSeverity
  context?: Record<string, any>
  stack?: string
}

class ErrorService {
  /**
   * Log an error to the console and optionally to an error tracking service
   */
  public logError(error: Error | string, details?: Partial<ErrorDetails>): void {
    const errorMessage = typeof error === "string" ? error : error.message
    const errorStack = typeof error === "string" ? new Error().stack : error.stack

    const errorDetails: ErrorDetails = {
      message: errorMessage,
      severity: details?.severity || "medium",
      context: details?.context || {},
      stack: errorStack,
      code: details?.code,
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error]", errorDetails)
    }

    // Here you would send to your error tracking service
    // Example: Sentry.captureException(error, { extra: errorDetails });
  }

  /**
   * Format an error message for display to users
   */
  public formatErrorForUser(error: Error | string | unknown): string {
    if (typeof error === "string") {
      return error
    }

    if (error instanceof Error) {
      // Remove technical details from error messages
      return this.sanitizeErrorMessage(error.message)
    }

    return "An unexpected error occurred. Please try again."
  }

  /**
   * Sanitize error messages to remove sensitive or technical information
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove any sensitive information like API keys, tokens, etc.
    const sanitized = message
      .replace(/key[-_]?[0-9a-zA-Z]{5,}/gi, "[REDACTED]")
      .replace(/token[-_]?[0-9a-zA-Z]{5,}/gi, "[REDACTED]")
      .replace(/password[-_]?[0-9a-zA-Z]{5,}/gi, "[REDACTED]")

    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      ECONNREFUSED: "Unable to connect to the server. Please check your internet connection.",
      ETIMEDOUT: "The request timed out. Please try again later.",
      NetworkError: "Network error. Please check your internet connection.",
      AbortError: "The request was cancelled. Please try again.",
    }

    for (const [technical, friendly] of Object.entries(errorMap)) {
      if (sanitized.includes(technical)) {
        return friendly
      }
    }

    return sanitized
  }
}

export const errorService = new ErrorService()
