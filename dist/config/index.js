"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    // Server
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Database
    databaseUrl: process.env.DATABASE_URL || '',
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    // Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    // Stripe
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        businessPriceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    },
    // AI Provider - Groq
    ai: {
        groqApiKey: process.env.GROQ_API_KEY || '',
        groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    // Adzuna Job Search API
    adzuna: {
        appId: process.env.ADZUNA_APP_ID || '',
        appKey: process.env.ADZUNA_APP_KEY || '',
        baseUrl: 'https://api.adzuna.com/v1/api',
    },
    // OAuth Providers (FREE)
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
        },
    },
    // Email (SendGrid - FREE 100/day)
    email: {
        sendgridApiKey: process.env.SENDGRID_API_KEY || '',
        fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@resumeai.com',
        fromName: process.env.EMAIL_FROM_NAME || 'ResumeAI',
    },
    // Sentry Error Monitoring (FREE 5K errors/month)
    sentry: {
        dsn: process.env.SENTRY_DSN || '',
        release: process.env.SENTRY_RELEASE || '1.0.0',
    },
    // Encryption
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!',
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map