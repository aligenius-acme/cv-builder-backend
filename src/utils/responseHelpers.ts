import { Response } from 'express';

/**
 * Standard success response format
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
}

/**
 * Send a standardized created response (201)
 */
export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400,
  code?: string,
  details?: unknown
): void {
  const response: ErrorResponse = {
    success: false,
    error,
  };
  if (code) {
    response.code = code;
  }
  if (details) {
    response.details = details;
  }
  res.status(statusCode).json(response);
}

/**
 * Send a not found error response (404)
 */
export function sendNotFound(res: Response, resource = 'Resource'): void {
  sendError(res, `${resource} not found`, 404, 'NOT_FOUND');
}

/**
 * Send an unauthorized error response (401)
 */
export function sendUnauthorized(res: Response, message = 'Unauthorized'): void {
  sendError(res, message, 401, 'UNAUTHORIZED');
}

/**
 * Send a forbidden error response (403)
 */
export function sendForbidden(res: Response, message = 'Access denied'): void {
  sendError(res, message, 403, 'FORBIDDEN');
}

/**
 * Send a validation error response (400)
 */
export function sendValidationError(res: Response, message: string, details?: unknown): void {
  sendError(res, message, 400, 'VALIDATION_ERROR', details);
}

/**
 * Send a server error response (500)
 */
export function sendServerError(res: Response, message = 'Internal server error'): void {
  sendError(res, message, 500, 'SERVER_ERROR');
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): void {
  const totalPages = Math.ceil(total / limit);
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
  res.json(response);
}

/**
 * Build pagination options from query params
 */
export function getPaginationParams(
  query: { page?: string; limit?: string },
  defaults: { page: number; limit: number; maxLimit: number } = { page: 1, limit: 20, maxLimit: 100 }
): { page: number; limit: number; skip: number } {
  let page = parseInt(query.page || String(defaults.page), 10);
  let limit = parseInt(query.limit || String(defaults.limit), 10);

  // Validate
  if (isNaN(page) || page < 1) page = defaults.page;
  if (isNaN(limit) || limit < 1) limit = defaults.limit;
  if (limit > defaults.maxLimit) limit = defaults.maxLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
