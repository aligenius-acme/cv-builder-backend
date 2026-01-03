// Custom error classes for the application

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

export class SubscriptionError extends AppError {
  constructor(message: string = 'Subscription required for this feature') {
    super(message, 402);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Usage quota exceeded') {
    super(message, 429);
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'AI service error') {
    super(message, 503);
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string = 'File processing error') {
    super(message, 422);
  }
}
