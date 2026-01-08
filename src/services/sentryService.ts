import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express, Request, Response, NextFunction } from 'express';
import config from '../config';

// Sentry Error Monitoring Service
// FREE tier: 5K errors/month, 10K performance transactions

// Initialize Sentry
export function initSentry(app: Express): void {
  if (!config.sentry.dsn) {
    console.log('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    release: config.sentry.release || '1.0.0',

    // Performance monitoring
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    profilesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      // Enable HTTP tracing
      Sentry.httpIntegration(),
      // Enable Express tracing
      Sentry.expressIntegration(),
      // Enable profiling
      nodeProfilingIntegration(),
    ],

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from request body
      if (event.request?.data) {
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

          if (data.password) data.password = '[REDACTED]';
          if (data.currentPassword) data.currentPassword = '[REDACTED]';
          if (data.newPassword) data.newPassword = '[REDACTED]';
          if (data.token) data.token = '[REDACTED]';

          event.request.data = JSON.stringify(data);
        } catch {
          // Ignore parsing errors
        }
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      'cancelled',
    ],
  });

  // Setup Express error handler
  Sentry.setupExpressErrorHandler(app);

  console.log('Sentry initialized for error monitoring');
}

// Sentry request handler - no longer needed with v8+, returns passthrough middleware
export function sentryRequestHandler() {
  return (req: Request, res: Response, next: NextFunction) => next();
}

// Sentry tracing handler - no longer needed with v8+, returns passthrough middleware
export function sentryTracingHandler() {
  return (req: Request, res: Response, next: NextFunction) => next();
}

// Sentry error handler - handled by setupExpressErrorHandler in v8+
export function sentryErrorHandler() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Capture the error with Sentry if configured
    if (config.sentry.dsn) {
      Sentry.captureException(err);
    }
    next(err);
  };
}

// Capture exception manually
export function captureException(error: Error, context?: Record<string, any>): string | undefined {
  if (!config.sentry.dsn) {
    console.error('Error (Sentry disabled):', error);
    return undefined;
  }

  return Sentry.captureException(error, {
    extra: context,
  });
}

// Capture message manually
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
): string | undefined {
  if (!config.sentry.dsn) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// Set user context
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!config.sentry.dsn) return;
  Sentry.setUser(user);
}

// Set custom tags
export function setTag(key: string, value: string): void {
  if (!config.sentry.dsn) return;
  Sentry.setTag(key, value);
}

// Set custom context
export function setContext(name: string, context: Record<string, any>): void {
  if (!config.sentry.dsn) return;
  Sentry.setContext(name, context);
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, any>;
}): void {
  if (!config.sentry.dsn) return;
  Sentry.addBreadcrumb(breadcrumb);
}

// Start a transaction for performance monitoring
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startInactiveSpan> | null {
  if (!config.sentry.dsn) return null;
  return Sentry.startInactiveSpan({ name, op });
}

// Flush events before shutdown
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
  if (!config.sentry.dsn) return true;
  return Sentry.flush(timeout);
}

// Check if Sentry is configured
export function isSentryConfigured(): boolean {
  return !!config.sentry.dsn;
}
