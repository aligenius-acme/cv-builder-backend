import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { performanceMiddleware } from './middleware/performance';

const app = express();

// Security headers with Helmet
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  // Allow cross-origin resource sharing for images/assets
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // Content Security Policy - defines approved sources of content
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (required for some frameworks)
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"], // Allow images from data URIs and HTTPS sources
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS in production
    },
  },

  // HTTP Strict Transport Security - forces HTTPS connections
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking attacks
  frameguard: { action: 'deny' },

  // Prevent MIME type sniffing
  noSniff: true,

  // Disable X-Powered-By header (hides Express usage)
  hidePoweredBy: true,
}));

// CORS configuration - only allow specific origins
const allowedOrigins = config.allowedOrigins || [config.frontendUrl];
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development allow any localhost port (handles Next.js using 3001/3002 fallbacks)
    if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight requests for 24 hours
}));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Performance monitoring
app.use(performanceMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Inject updated credit counts into any AI response that deducted a credit
app.use((req: any, res, next) => {
  const _json = res.json.bind(res);
  (res as any).json = function (body: any) {
    if (req._creditsInfo && body && typeof body === 'object' && !Array.isArray(body)) {
      body.creditsInfo = req._creditsInfo;
    }
    return _json(body);
  };
  next();
});

// Apply rate limiting to all API routes
// This protects against brute force attacks and API abuse
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Legal disclaimer endpoint
app.get('/api/disclaimer', (req, res) => {
  res.json({
    success: true,
    data: {
      disclaimer: 'This platform does not fabricate experience or guarantee hiring outcomes. AI-generated content is based solely on user-provided information.',
      lastUpdated: '2025-01-01',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
