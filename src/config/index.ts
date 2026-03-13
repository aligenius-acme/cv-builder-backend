import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || undefined,

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // JWT
  jwt: {
    secret: (() => {
      const s = process.env.JWT_SECRET;
      if (!s && process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET environment variable is not set in production.');
        process.exit(1);
      }
      return s || 'dev-only-secret-change-me';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  // AI Provider - OpenAI
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },

  // Adzuna Job Search API
  adzuna: {
    appId: process.env.ADZUNA_APP_ID || "",
    appKey: process.env.ADZUNA_APP_KEY || "",
    baseUrl: "https://api.adzuna.com/v1/api",
  },

  // OAuth Providers (FREE)
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri:
        process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3000/auth/google/callback",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectUri:
        process.env.GITHUB_REDIRECT_URI ||
        "http://localhost:3000/auth/github/callback",
    },
  },

  // Email (SendGrid - FREE 100/day)
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    fromEmail: process.env.EMAIL_FROM_ADDRESS || "noreply@jobtools.ai",
    fromName: process.env.EMAIL_FROM_NAME || "JobTools AI",
  },

  // Sentry Error Monitoring (FREE 5K errors/month)
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
    release: process.env.SENTRY_RELEASE || "1.0.0",
  },

  // Encryption
  encryptionKey:
    process.env.ENCRYPTION_KEY || "default-32-char-encryption-key!",
};

export default config;
