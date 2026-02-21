# Quick Start: Scalability Features

This guide helps you quickly start using the Phase 2 scalability features in the CV Builder backend.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running
- **Redis running** (new requirement)

## 1. Install Redis

### Option A: Docker (Fastest)

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

Verify it's running:
```bash
docker ps | grep redis
```

### Option B: Windows (WSL2)

```bash
wsl -d Ubuntu
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

### Option C: macOS

```bash
brew install redis
brew services start redis
```

## 2. Update Environment Variables

Add to your `.env`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # Only if you set one

# Optional: Email Queue Configuration
EMAIL_FROM_ADDRESS=noreply@yourapp.com
EMAIL_FROM_NAME=CV Builder
```

## 3. Install New Dependencies

```bash
npm install
```

## 4. Start the Server

```bash
npm run dev
```

You should see:
```
Redis connected successfully
Redis ready to accept commands
Database connected successfully
Server running on port 3001
```

## 5. Test the Features

### Health Check

```bash
curl http://localhost:3001/api/monitoring/health
```

Expected:
```json
{
  "status": "healthy",
  "services": {
    "redis": "up",
    "database": "up"
  }
}
```

### Performance Metrics

```bash
curl http://localhost:3001/api/monitoring/performance
```

### Cache Statistics

```bash
curl http://localhost:3001/api/monitoring/cache
```

## 6. Apply Database Indexes (Optional but Recommended)

```bash
# Connect to your database and run:
psql $DATABASE_URL -f PERFORMANCE_INDEXES.sql
```

Or use any PostgreSQL client to run the SQL in `PERFORMANCE_INDEXES.sql`.

## Using Caching in Your Code

### Basic Caching

```typescript
import { cacheService, CACHE_TTL } from './services/cache';

// Get from cache
const data = await cacheService.get('my-key');

// Set in cache (5 minutes)
await cacheService.set('my-key', { foo: 'bar' }, { ttl: CACHE_TTL.MEDIUM });

// Delete from cache
await cacheService.del('my-key');
```

### Route-Level Caching

```typescript
import { cacheMiddleware } from './middleware/cache';

// Cache this route for 5 minutes
router.get('/data',
  cacheMiddleware({ ttl: 300, prefix: 'data' }),
  async (req, res) => {
    // Expensive operation
    const result = await fetchData();
    res.json(result);
  }
);
```

### User-Specific Caching

```typescript
import { userCacheMiddleware } from './middleware/cache';

// Cache per user for 10 minutes
router.get('/profile',
  authenticate,
  userCacheMiddleware('profile', { ttl: 600 }),
  async (req, res) => {
    const profile = await getUserProfile(req.user.id);
    res.json(profile);
  }
);
```

## Using Background Jobs

### Send Email Asynchronously

```typescript
import { sendEmailAsync, sendWelcomeEmail } from './queues';

// Custom email
await sendEmailAsync({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Welcome!</h1>',
});

// Pre-built emails
await sendWelcomeEmail('user@example.com', 'John');
```

### Process Document Asynchronously

```typescript
import { processDocumentAsync } from './queues';

await processDocumentAsync({
  resumeId: 'resume-123',
  fileUrl: 'https://storage/file.pdf',
  fileType: 'application/pdf',
  userId: 'user-123',
});
```

### AI Operations with Caching

```typescript
import { processAIAsync, AIJobType } from './queues';

// Will automatically cache result for 30 minutes
const result = await processAIAsync(
  AIJobType.RESUME_TAILOR,
  userId,
  { resumeData, jobDescription }
);
```

## Monitoring Your Application

### Check Queue Status

```bash
curl http://localhost:3001/api/monitoring/performance | jq .queues
```

Shows:
- Jobs waiting
- Jobs active
- Jobs completed
- Jobs failed

### Check Cache Performance

```bash
curl http://localhost:3001/api/monitoring/cache
```

Shows:
- Cache hit rate (aim for >50%)
- Total connections
- Total commands processed

### View Slow Queries

Check your console logs for:
```
[SLOW QUERY] GET /api/resume/versions took 1500ms (200)
[SLOW DB QUERY] findMany resumes took 1200ms
```

## Common Issues

### Redis Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
docker start redis
# OR
brew services start redis
# OR
sudo service redis-server start
```

### Queues Not Processing

**Solution**:
1. Check Redis connection
2. Check console for errors
3. Restart the server

### Low Cache Hit Rate (<30%)

**Solution**:
1. Increase TTL values
2. Review which endpoints need caching
3. Check if cache invalidation is too aggressive

## Performance Tips

### Do's
✅ Cache expensive operations (AI, complex DB queries)
✅ Use appropriate TTL values (don't cache forever)
✅ Monitor cache hit rate regularly
✅ Use background jobs for non-urgent tasks
✅ Apply database indexes (PERFORMANCE_INDEXES.sql)

### Don'ts
❌ Don't cache user-specific auth data (security risk)
❌ Don't set TTL too high for frequently changing data
❌ Don't process emails synchronously (use queue)
❌ Don't ignore slow query warnings
❌ Don't cache errors or null results

## Testing in Development

### 1. Test Cache

```typescript
// Set a cache value
await cacheService.set('test', { value: 'hello' }, { ttl: 60 });

// Get it back
const result = await cacheService.get('test');
console.log(result); // { value: 'hello' }

// Clear it
await cacheService.del('test');
```

### 2. Test Email Queue

```typescript
await sendWelcomeEmail('test@test.com', 'Test User');
// Check console for "Email sent successfully"
```

### 3. Test Performance Monitoring

```bash
# Make some requests
curl http://localhost:3001/api/health

# Check performance stats
curl http://localhost:3001/api/monitoring/performance
```

## Production Checklist

Before deploying to production:

- [ ] Redis is running and accessible
- [ ] `REDIS_PASSWORD` is set (for security)
- [ ] Database indexes are applied
- [ ] Environment variables are configured
- [ ] Performance monitoring endpoints are protected
- [ ] Cache TTL values are appropriate
- [ ] Queue retry limits are configured
- [ ] Slow query threshold is set

## Getting Help

- **Full Documentation**: See [SCALABILITY.md](./SCALABILITY.md)
- **Setup Guide**: See [README.md](./README.md)
- **Implementation Details**: See [PHASE2_IMPLEMENTATION_SUMMARY.md](./PHASE2_IMPLEMENTATION_SUMMARY.md)

## Quick Reference: Environment Variables

```bash
# Required for Scalability
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional
REDIS_PASSWORD=
SLOW_QUERY_THRESHOLD=1000
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
```

## Quick Reference: Cache TTLs

```typescript
import { CACHE_TTL } from './services/cache';

CACHE_TTL.VERY_SHORT  // 1 minute
CACHE_TTL.SHORT       // 2 minutes
CACHE_TTL.MEDIUM      // 5 minutes
CACHE_TTL.LONG        // 30 minutes
CACHE_TTL.VERY_LONG   // 1 hour
CACHE_TTL.DAY         // 24 hours
```

## Quick Reference: Cache Prefixes

```typescript
import { CACHE_PREFIXES } from './services/cache';

CACHE_PREFIXES.USER_SESSION    // 'session'
CACHE_PREFIXES.RESUME          // 'resume'
CACHE_PREFIXES.JOB_APPLICATION // 'job_app'
CACHE_PREFIXES.DASHBOARD_STATS // 'dashboard'
CACHE_PREFIXES.AI_RESULT       // 'ai'
CACHE_PREFIXES.TEMPLATE        // 'template'
```

---

**Ready to Start?** Run `npm run dev` and visit http://localhost:3001/api/monitoring/health
