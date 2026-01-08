export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class SubscriptionError extends AppError {
    constructor(message?: string);
}
export declare class QuotaExceededError extends AppError {
    constructor(message?: string);
}
export declare class AIServiceError extends AppError {
    constructor(message?: string);
}
export declare class FileProcessingError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map