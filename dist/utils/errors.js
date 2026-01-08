"use strict";
// Custom error classes for the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessingError = exports.AIServiceError = exports.QuotaExceededError = exports.SubscriptionError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
// Alias for AuthorizationError
class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
class SubscriptionError extends AppError {
    constructor(message = 'Subscription required for this feature') {
        super(message, 402);
    }
}
exports.SubscriptionError = SubscriptionError;
class QuotaExceededError extends AppError {
    constructor(message = 'Usage quota exceeded') {
        super(message, 429);
    }
}
exports.QuotaExceededError = QuotaExceededError;
class AIServiceError extends AppError {
    constructor(message = 'AI service error') {
        super(message, 503);
    }
}
exports.AIServiceError = AIServiceError;
class FileProcessingError extends AppError {
    constructor(message = 'File processing error') {
        super(message, 422);
    }
}
exports.FileProcessingError = FileProcessingError;
//# sourceMappingURL=errors.js.map