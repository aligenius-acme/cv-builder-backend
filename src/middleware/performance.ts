import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache';

// Performance metrics storage
interface PerformanceMetric {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userId?: string;
}

// In-memory storage for recent metrics (limited to last 1000 requests)
const recentMetrics: PerformanceMetric[] = [];
const MAX_METRICS = 1000;

// Slow query threshold (in milliseconds)
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);

/**
 * Performance monitoring middleware
 * Tracks request/response times and logs slow queries
 */
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end to capture response time
  res.end = function (this: Response, chunk?: any, encoding?: any, callback?: any) {
    const responseTime = Date.now() - startTime;

    // Create metric object
    const metric: PerformanceMetric = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      timestamp: Date.now(),
      userId: (req as any).user?.id,
    };

    // Add to recent metrics (FIFO)
    recentMetrics.push(metric);
    if (recentMetrics.length > MAX_METRICS) {
      recentMetrics.shift();
    }

    // Log slow queries
    if (responseTime > SLOW_QUERY_THRESHOLD) {
      console.warn(
        `[SLOW QUERY] ${req.method} ${req.path} took ${responseTime}ms (${res.statusCode})`
      );
    }

    // Log request details
    const userId = (req as any).user?.id || 'anonymous';
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - User: ${userId}`
    );

    // Store in cache for analytics (last hour)
    const cacheKey = `perf:${Date.now()}`;
    cacheService.set(cacheKey, metric, { ttl: 3600, prefix: 'performance' }).catch((err) => {
      console.error('Failed to cache performance metric:', err);
    });

    // Call original end
    return originalEnd.apply(this, arguments as any);
  };

  next();
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null,
      fastestRequest: null,
      statusCodeDistribution: {},
      methodDistribution: {},
      slowQueries: [],
    };
  }

  // Calculate statistics
  const totalRequests = recentMetrics.length;
  const totalTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
  const averageResponseTime = totalTime / totalRequests;

  const sortedByTime = [...recentMetrics].sort((a, b) => b.responseTime - a.responseTime);
  const slowestRequest = sortedByTime[0];
  const fastestRequest = sortedByTime[sortedByTime.length - 1];

  // Status code distribution
  const statusCodeDistribution: Record<number, number> = {};
  recentMetrics.forEach((m) => {
    statusCodeDistribution[m.statusCode] = (statusCodeDistribution[m.statusCode] || 0) + 1;
  });

  // Method distribution
  const methodDistribution: Record<string, number> = {};
  recentMetrics.forEach((m) => {
    methodDistribution[m.method] = (methodDistribution[m.method] || 0) + 1;
  });

  // Slow queries (top 10)
  const slowQueries = sortedByTime
    .filter((m) => m.responseTime > SLOW_QUERY_THRESHOLD)
    .slice(0, 10);

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowestRequest,
    fastestRequest,
    statusCodeDistribution,
    methodDistribution,
    slowQueries,
  };
};

/**
 * Get performance statistics for a specific endpoint
 */
export const getEndpointStats = (path: string) => {
  const endpointMetrics = recentMetrics.filter((m) => m.path === path);

  if (endpointMetrics.length === 0) {
    return null;
  }

  const totalRequests = endpointMetrics.length;
  const totalTime = endpointMetrics.reduce((sum, m) => sum + m.responseTime, 0);
  const averageResponseTime = totalTime / totalRequests;

  const sortedByTime = [...endpointMetrics].sort((a, b) => b.responseTime - a.responseTime);

  return {
    path,
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowestRequest: sortedByTime[0],
    fastestRequest: sortedByTime[sortedByTime.length - 1],
  };
};

/**
 * Get metrics by time window (last N minutes)
 */
export const getMetricsByTimeWindow = (minutes: number) => {
  const cutoffTime = Date.now() - minutes * 60 * 1000;
  return recentMetrics.filter((m) => m.timestamp > cutoffTime);
};

/**
 * Clear all metrics
 */
export const clearMetrics = () => {
  recentMetrics.length = 0;
};

/**
 * Database query performance tracking
 */
export class QueryPerformanceTracker {
  private queries: Array<{
    query: string;
    duration: number;
    timestamp: number;
  }> = [];

  track(query: string, duration: number) {
    this.queries.push({
      query,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 queries
    if (this.queries.length > 100) {
      this.queries.shift();
    }

    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      console.warn(`[SLOW DB QUERY] ${query} took ${duration}ms`);
    }
  }

  getStats() {
    if (this.queries.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowestQuery: null,
      };
    }

    const totalQueries = this.queries.length;
    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const averageDuration = totalDuration / totalQueries;

    const sorted = [...this.queries].sort((a, b) => b.duration - a.duration);
    const slowestQuery = sorted[0];

    return {
      totalQueries,
      averageDuration: Math.round(averageDuration),
      slowestQuery,
      slowQueries: sorted.filter((q) => q.duration > SLOW_QUERY_THRESHOLD).slice(0, 10),
    };
  }

  clear() {
    this.queries.length = 0;
  }
}

export const queryTracker = new QueryPerformanceTracker();
