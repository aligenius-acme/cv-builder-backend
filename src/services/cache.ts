import redis from '../config/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

class CacheService {
  private defaultTTL = 300; // 5 minutes default

  /**
   * Generate a cache key with optional prefix
   */
  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      const value = await redis.get(fullKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set(
    key: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      await redis.setex(fullKey, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      await redis.del(fullKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullPattern = this.generateKey(pattern, options.prefix);
      const keys = await redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set a value with custom expiration
   */
  async setWithExpiry(
    key: string,
    value: any,
    expirySeconds: number,
    options: CacheOptions = {}
  ): Promise<boolean> {
    return this.set(key, value, { ...options, ttl: expirySeconds });
  }

  /**
   * Increment a counter
   */
  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      const result = await redis.incr(fullKey);

      // Set expiry if specified
      if (options.ttl) {
        await redis.expire(fullKey, options.ttl);
      }

      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Execute function to get fresh data
    const result = await fn();

    // Store in cache
    await this.set(key, result, options);

    return result;
  }

  /**
   * Clear all cache keys matching a prefix
   */
  async clearPrefix(prefix: string): Promise<number> {
    return this.delPattern('*', { prefix });
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clearAll(): Promise<boolean> {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear all error:', error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTTL(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.generateKey(key, options.prefix);
      return await redis.ttl(fullKey);
    } catch (error) {
      console.error('Cache get TTL error:', error);
      return -1;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export cache key prefixes for consistency
export const CACHE_PREFIXES = {
  USER_SESSION: 'session',
  RESUME: 'resume',
  JOB_APPLICATION: 'job_app',
  DASHBOARD_STATS: 'dashboard',
  AI_RESULT: 'ai',
  TEMPLATE: 'template',
  USER_PROFILE: 'user_profile',
};

// Export common TTL values (in seconds)
export const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute
  SHORT: 120, // 2 minutes
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};
