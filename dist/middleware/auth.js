"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.requireOrgAdmin = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
// Authenticate user from JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('No token provided');
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                subscription: true,
                organization: {
                    include: {
                        subscription: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        // Determine plan type
        let planType = client_1.PlanType.FREE;
        if (user.subscription) {
            planType = user.subscription.planType;
        }
        else if (user.organization?.subscription) {
            planType = client_1.PlanType.BUSINESS;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            planType,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.AuthenticationError('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errors_1.AuthenticationError('Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                subscription: true,
            },
        });
        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                planType: user.subscription?.planType || client_1.PlanType.FREE,
            };
        }
        next();
    }
    catch {
        // Silently fail for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Require specific roles
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.AuthenticationError());
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_1.AuthorizationError('Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
// Require admin role
exports.requireAdmin = (0, exports.requireRole)(client_1.UserRole.ADMIN);
// Require organization admin or super admin
exports.requireOrgAdmin = (0, exports.requireRole)(client_1.UserRole.ORG_ADMIN, client_1.UserRole.ADMIN);
// Generate JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    // Cast expiresIn to the expected type (e.g., '7d', '1h')
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
        expiresIn: config_1.default.jwt.expiresIn,
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map