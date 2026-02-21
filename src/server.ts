import app from './app';
import config from './config';
import { prisma } from './utils/prisma';
import { closeRedis } from './config/redis';
import { closeAllQueues } from './queues';

const PORT = config.port;

// For Vercel serverless deployment
export default app;

// Only start server locally (not in Vercel)
if (process.env.VERCEL !== '1') {
  async function main() {
    try {
      // Test database connection
      await prisma.$connect();
      console.log('Database connected successfully');

      // Start server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${config.nodeEnv}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    try {
      // Close all background job queues
      await closeAllQueues();
      console.log('Job queues closed');

      // Close Redis connection
      await closeRedis();
      console.log('Redis connection closed');

      // Disconnect from database
      await prisma.$disconnect();
      console.log('Database disconnected');

      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  main();
}
