"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerification = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../utils/prisma");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const encryption_1 = require("../utils/encryption");
const client_1 = require("@prisma/client");
const email_1 = require("../services/email");
// Register new user
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Validate input
        if (!email || !password) {
            throw new errors_1.ValidationError('Email and password are required');
        }
        if (password.length < 8) {
            throw new errors_1.ValidationError('Password must be at least 8 characters');
        }
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user with free subscription
        const user = await prisma_1.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                firstName,
                lastName,
                emailVerifyToken: (0, encryption_1.generateToken)(),
                subscription: {
                    create: {
                        planType: client_1.PlanType.FREE,
                        resumeLimit: 1,
                    },
                },
            },
            include: {
                subscription: true,
            },
        });
        // Send verification email (non-blocking)
        if (user.emailVerifyToken) {
            email_1.emailService.sendVerificationEmail(user.email, user.emailVerifyToken, firstName).catch((err) => {
                console.error('Failed to send verification email:', err);
            });
        }
        // Generate JWT
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    planType: user.subscription?.planType || client_1.PlanType.FREE,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errors_1.ValidationError('Email and password are required');
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
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
            throw new errors_1.AuthenticationError('Invalid email or password');
        }
        // Check password (passwordHash can be null for OAuth users)
        if (!user.passwordHash) {
            throw new errors_1.AuthenticationError('Invalid email or password');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new errors_1.AuthenticationError('Invalid email or password');
        }
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Generate JWT
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // Determine plan type
        let planType = user.subscription?.planType || client_1.PlanType.FREE;
        if (user.organization?.subscription) {
            planType = client_1.PlanType.BUSINESS;
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    planType,
                    organizationId: user.organizationId,
                    organizationName: user.organization?.name,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Get current user
const me = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                organization: {
                    include: {
                        subscription: true,
                    },
                },
                _count: {
                    select: {
                        resumes: true,
                        coverLetters: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        let planType = user.subscription?.planType || client_1.PlanType.FREE;
        if (user.organization?.subscription) {
            planType = client_1.PlanType.BUSINESS;
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                emailVerified: user.emailVerified,
                planType,
                subscription: user.subscription
                    ? {
                        status: user.subscription.status,
                        currentPeriodEnd: user.subscription.currentPeriodEnd,
                        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
                        resumeLimit: user.subscription.resumeLimit,
                        resumesCreated: user.subscription.resumesCreated,
                    }
                    : null,
                organization: user.organization
                    ? {
                        id: user.organization.id,
                        name: user.organization.name,
                        logoUrl: user.organization.logoUrl,
                    }
                    : null,
                stats: {
                    resumes: user._count.resumes,
                    coverLetters: user._count.coverLetters,
                },
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
// Update profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
            },
        });
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// Change password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new errors_1.ValidationError('Current password and new password are required');
        }
        if (newPassword.length < 8) {
            throw new errors_1.ValidationError('New password must be at least 8 characters');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Verify current password (passwordHash can be null for OAuth users)
        if (!user.passwordHash) {
            throw new errors_1.AuthenticationError('Cannot change password for OAuth accounts');
        }
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new errors_1.AuthenticationError('Current password is incorrect');
        }
        // Update password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
// Request password reset
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new errors_1.ValidationError('Email is required');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        // Don't reveal if user exists
        if (!user) {
            res.json({
                success: true,
                message: 'If an account exists with this email, a reset link will be sent',
            });
            return;
        }
        // Generate reset token
        const resetToken = (0, encryption_1.generateToken)();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });
        // Send password reset email (non-blocking)
        email_1.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || undefined).catch((err) => {
            console.error('Failed to send password reset email:', err);
        });
        res.json({
            success: true,
            message: 'If an account exists with this email, a reset link will be sent',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            throw new errors_1.ValidationError('Token and password are required');
        }
        if (password.length < 8) {
            throw new errors_1.ValidationError('Password must be at least 8 characters');
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new errors_1.ValidationError('Invalid or expired reset token');
        }
        // Update password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
// Verify email
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new errors_1.ValidationError('Verification token is required');
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                emailVerifyToken: token,
            },
        });
        if (!user) {
            throw new errors_1.ValidationError('Invalid verification token');
        }
        if (user.emailVerified) {
            res.json({
                success: true,
                message: 'Email already verified',
            });
            return;
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyToken: null,
            },
        });
        res.json({
            success: true,
            message: 'Email verified successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
// Resend verification email
const resendVerification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.emailVerified) {
            res.json({
                success: true,
                message: 'Email already verified',
            });
            return;
        }
        // Generate new verification token
        const verifyToken = (0, encryption_1.generateToken)();
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerifyToken: verifyToken,
            },
        });
        // Send verification email
        await email_1.emailService.sendVerificationEmail(user.email, verifyToken, user.firstName || undefined);
        res.json({
            success: true,
            message: 'Verification email sent',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerification = resendVerification;
//# sourceMappingURL=auth.js.map