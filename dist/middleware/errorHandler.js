"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const config_1 = __importDefault(require("../config"));
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Handle AppError instances
    if (err instanceof errors_1.AppError) {
        const response = {
            success: false,
            error: err.message,
        };
        if (config_1.default.nodeEnv === 'development') {
            response.stack = err.stack;
        }
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: 'A record with this value already exists',
            });
            return;
        }
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Record not found',
            });
            return;
        }
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: err.message,
        });
        return;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
        return;
    }
    // Handle multer errors
    if (err.name === 'MulterError') {
        const multerError = err;
        let message = 'File upload error';
        if (multerError.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large';
        }
        else if (multerError.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        }
        res.status(400).json({
            success: false,
            error: message,
        });
        return;
    }
    // Default server error
    const response = {
        success: false,
        error: config_1.default.nodeEnv === 'production'
            ? 'Internal server error'
            : err.message,
    };
    if (config_1.default.nodeEnv === 'development') {
        response.stack = err.stack;
    }
    res.status(500).json(response);
};
exports.errorHandler = errorHandler;
// Handle 404 routes
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map