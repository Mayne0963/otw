import { NextResponse } from 'next/server'

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'

export class APIError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: ErrorCode,
    public readonly status: number,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }

  toResponse(): NextResponse {
    const body = {
      error: this.message,
      code: this.code,
      ...(process.env.NODE_ENV === 'development' && { details: this.details })
    }
    return NextResponse.json(body, { status: this.status })
  }
}

export const createError = {
  unauthorized: (message = 'Unauthorized', details?: any) => 
    new APIError(message, 'UNAUTHORIZED', 401, details),

  forbidden: (message = 'Forbidden', details?: any) =>
    new APIError(message, 'FORBIDDEN', 403, details),

  notFound: (message = 'Not Found', details?: any) =>
    new APIError(message, 'NOT_FOUND', 404, details),

  badRequest: (message = 'Bad Request', details?: any) =>
    new APIError(message, 'BAD_REQUEST', 400, details),

  validation: (message = 'Validation Error', details?: any) =>
    new APIError(message, 'VALIDATION_ERROR', 422, details),

  rateLimit: (message = 'Rate Limit Exceeded', details?: any) =>
    new APIError(message, 'RATE_LIMIT_EXCEEDED', 429, details),

  internal: (message = 'Internal Server Error', details?: any) =>
    new APIError(message, 'INTERNAL_ERROR', 500, details)
}

export const handleError = (error: unknown): NextResponse => {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return error.toResponse()
  }

  const internalError = createError.internal(
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error : undefined
  )
  return internalError.toResponse()
}

export function createAPIError(
  message: string,
  status = 500,
  code?: string,
  details?: any
) {
  return new APIError(message, code as ErrorCode, status, details)
}

// Common error creators
export const apiErrors = {
  unauthorized: (message = 'Unauthorized') => 
    createAPIError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Forbidden') =>
    createAPIError(message, 403, 'FORBIDDEN'),
  
  notFound: (message = 'Resource not found') =>
    createAPIError(message, 404, 'NOT_FOUND'),
  
  badRequest: (message: string, details?: any) =>
    createAPIError(message, 400, 'BAD_REQUEST', details),
  
  conflict: (message: string) =>
    createAPIError(message, 409, 'CONFLICT'),
  
  tooManyRequests: (message = 'Too many requests') =>
    createAPIError(message, 429, 'RATE_LIMIT_EXCEEDED'),
  
  internal: (message = 'Internal server error') =>
    createAPIError(message, 500, 'INTERNAL_ERROR')
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Permission denied') {
    super(403, message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  console.error('Unhandled error:', error)
  return new Response(JSON.stringify({
    error: 'Internal server error'
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  )
}