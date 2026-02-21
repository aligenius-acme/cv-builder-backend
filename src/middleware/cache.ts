import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheOptions } from '../services/cache';

export interface CacheMiddlewareOptions extends CacheOptions {
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  invalidateOn?: string[]; // HTTP methods that should invalidate cache
}

/**
 * Cache middleware for Express routes
 * Caches GET requests and serves from cache on subsequent requests
 */
export const cacheMiddleware = (options: CacheMiddlewareOptions) => {
  const {
    ttl,
    prefix,
    keyGenerator,
    condition,
    invalidateOn = ['POST', 'PUT', 'PATCH', 'DELETE'],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition is false
    if (condition && !condition(req)) {
      return next();
    }

    // Handle cache invalidation
    if (invalidateOn.includes(req.method)) {
      const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
      await cacheService.del(key, { prefix });
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;

    try {
      // Try to get from cache
      const cached = await cacheService.get(key, { prefix });

      if (cached) {
        // Serve from cache
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (body: any) {
        // Cache the response
        cacheService.set(key, body, { ttl, prefix }).catch((error) => {
          console.error('Failed to cache response:', error);
        });

        // Send response
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache entries matching a pattern after successful mutations
 */
export const invalidateCacheMiddleware = (pattern: string, prefix?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after successful response
    res.json = function (body: any) {
      // Only invalidate on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.delPattern(pattern, { prefix }).catch((error) => {
          console.error('Failed to invalidate cache:', error);
        });
      }

      // Send response
      return originalJson(body);
    };

    next();
  };
};

/**
 * User-specific cache middleware
 * Automatically generates cache keys based on user ID
 */
export const userCacheMiddleware = (
  resourceType: string,
  options: Omit<CacheMiddlewareOptions, 'keyGenerator'> = {}
) => {
  return cacheMiddleware({
    ...options,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id || 'anonymous';
      const path = req.path;
      const query = JSON.stringify(req.query);
      return `${resourceType}:${userId}:${path}:${query}`;
    },
  });
};

/**
 * Conditional cache middleware based on query parameters
 */
export const conditionalCacheMiddleware = (
  queryParam: string,
  options: CacheMiddlewareOptions
) => {
  return cacheMiddleware({
    ...options,
    condition: (req: Request) => {
      return req.query[queryParam] !== undefined;
    },
  });
};
