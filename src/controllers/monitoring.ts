import { Request, Response } from 'express';
import { getPerformanceStats, getEndpointStats, queryTracker } from '../middleware/performance';
import { getQueueStats } from '../queues';
import { cacheService } from '../services/cache';
import redis from '../config/redis';

/**
 * Get overall performance statistics
 */
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const performanceStats = getPerformanceStats();
    const queueStats = await getQueueStats();
    const dbQueryStats = queryTracker.getStats();

    // Get Redis info
    let redisInfo: any = {};
    try {
      const info = await redis.info();
      const lines = info.split('\r\n');
      redisInfo = {
        connected: true,
        version: lines.find((l) => l.startsWith('redis_version:'))?.split(':')[1],
        uptime: lines.find((l) => l.startsWith('uptime_in_seconds:'))?.split(':')[1],
        connected_clients: lines.find((l) => l.startsWith('connected_clients:'))?.split(':')[1],
        used_memory_human: lines.find((l) => l.startsWith('used_memory_human:'))?.split(':')[1],
      };
    } catch (error) {
      redisInfo = { connected: false };
    }

    res.json({
      performance: performanceStats,
      queues: queueStats,
      database: dbQueryStats,
      redis: redisInfo,
    });
  } catch (error: any) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      error: 'Failed to get performance metrics',
      message: error.message,
    });
  }
};

/**
 * Get statistics for a specific endpoint
 */
export const getEndpointMetrics = async (req: Request, res: Response) => {
  try {
    const { path } = req.params;
    const stats = getEndpointStats(path);

    if (!stats) {
      return res.status(404).json({
        error: 'No metrics found for this endpoint',
      });
    }

    res.json(stats);
  } catch (error: any) {
    console.error('Error getting endpoint metrics:', error);
    res.status(500).json({
      error: 'Failed to get endpoint metrics',
      message: error.message,
    });
  }
};

/**
 * Get cache statistics
 */
export const getCacheMetrics = async (req: Request, res: Response) => {
  try {
    const info = await redis.info('stats');
    const lines = info.split('\r\n');

    const stats = {
      keyspace_hits: lines.find((l) => l.startsWith('keyspace_hits:'))?.split(':')[1] || '0',
      keyspace_misses: lines.find((l) => l.startsWith('keyspace_misses:'))?.split(':')[1] || '0',
      total_connections: lines.find((l) => l.startsWith('total_connections_received:'))?.split(':')[1] || '0',
      total_commands: lines.find((l) => l.startsWith('total_commands_processed:'))?.split(':')[1] || '0',
    };

    const hits = parseInt(stats.keyspace_hits);
    const misses = parseInt(stats.keyspace_misses);
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

    res.json({
      ...stats,
      hitRate: hitRate.toFixed(2) + '%',
    });
  } catch (error: any) {
    console.error('Error getting cache metrics:', error);
    res.status(500).json({
      error: 'Failed to get cache metrics',
      message: error.message,
    });
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check Redis connection
    let redisHealthy = false;
    try {
      await redis.ping();
      redisHealthy = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check database connection
    let dbHealthy = false;
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
      await prisma.$disconnect();
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const allHealthy = redisHealthy && dbHealthy;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisHealthy ? 'up' : 'down',
        database: dbHealthy ? 'up' : 'down',
      },
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Clear cache (admin only)
 */
export const clearCache = async (req: Request, res: Response) => {
  try {
    const { prefix } = req.body;

    if (prefix) {
      const count = await cacheService.clearPrefix(prefix);
      res.json({
        message: 'Cache cleared successfully',
        keysDeleted: count,
        prefix,
      });
    } else {
      await cacheService.clearAll();
      res.json({
        message: 'All cache cleared successfully',
      });
    }
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
};
