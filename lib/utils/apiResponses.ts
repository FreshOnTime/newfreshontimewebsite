import { NextResponse } from 'next/server';

/**
 * Interface for API response data structure
 */
interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  metadata?: {
    timestamp: Date;
    [key: string]: unknown;
  };
}

/**
 * Base function to create consistent API responses
 */
const apiResponse = <T>(
  statusCode: number,
  message: string,
  data?: T,
  metadata?: Record<string, unknown>
): NextResponse => {
  const response: ApiResponseData<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    metadata: {
      timestamp: new Date(),
      ...metadata,
    },
  };
  return NextResponse.json(response, { status: statusCode });
};

/**
 * Send a 201 Created response
 */
export const sendCreated = <T>(
  message: string = "Resource created successfully",
  data?: T,
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(201, message, data, metadata);
};

/**
 * Send a 200 OK response
 */
export const sendSuccess = <T>(
  message: string = "Request successful",
  data?: T,
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(200, message, data, metadata);
};

/**
 * Send a 400 Bad Request response
 */
export const sendBadRequest = (
  message: string = "Bad request",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(400, message, undefined, metadata);
};

/**
 * Send a 401 Unauthorized response
 */
export const sendUnauthorized = (
  message: string = "Unauthorized",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(401, message, undefined, metadata);
};

/**
 * Send a 403 Forbidden response
 */
export const sendForbidden = (
  message: string = "Forbidden",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(403, message, undefined, metadata);
};

/**
 * Send a 404 Not Found response
 */
export const sendNotFound = (
  message: string = "Resource not found",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(404, message, undefined, metadata);
};

/**
 * Send a 409 Conflict response
 */
export const sendConflict = (
  message: string = "Conflict",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(409, message, undefined, metadata);
};

/**
 * Send a 500 Internal Server Error response
 */
export const sendInternalError = (
  message: string = "Internal server error",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(500, message, undefined, metadata);
};

/**
 * Send a 429 Too Many Requests response
 */
export const sendTooManyRequests = (
  message: string = "Too many requests",
  metadata?: Record<string, unknown>
): NextResponse => {
  return apiResponse(429, message, undefined, metadata);
};
