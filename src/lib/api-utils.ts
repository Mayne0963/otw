export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, message = 'Success') {
  return NextResponse.json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        data: error.data,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode },
    );
  }

  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
    { status: 500 },
  );
}

export async function handleApiRequest<T>(
  handler: () => Promise<T>,
  successMessage = 'Success',
) {
  try {
    const data = await handler();
    return successResponse(data, successMessage);
  } catch (error) {
    return errorResponse(error);
  }
}
