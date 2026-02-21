# CV Builder Backend

AI-powered resume customization and job search platform backend API.

## Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Queue**: Redis with ioredis and Bull
- **AI**: OpenAI GPT-4o-mini
- **Storage**: Cloudinary
- **Email**: SendGrid / SMTP / Gmail OAuth2
- **Authentication**: JWT with bcrypt
- **Payment**: Stripe

## Features

- Resume upload, parsing, and AI-powered tailoring
- Cover letter generation
- ATS score analysis
- Job application tracker
- Job board integration (Adzuna)
- Interview preparation tools
- A/B testing for resumes
- OAuth2 authentication (Google, GitHub)
- Real-time performance monitoring
- Background job processing
- Redis caching layer

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+ (for caching and job queues)
- OpenAI API key
- Cloudinary account

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Redis

#### Option A: Docker (Recommended)

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Verify Redis is running
docker ps | grep redis
```

#### Option B: Local Installation

**Windows (WSL2)**:
```bash
wsl -d Ubuntu
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**macOS**:
```bash
brew install redis
brew services start redis
```

**Linux**:
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Option C: Redis Cloud (Production)

1. Sign up at https://redis.com/try-free/
2. Create a free database (30MB)
3. Copy connection details to `.env`

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and fill in your credentials
# At minimum, configure:
# - DATABASE_URL
# - JWT_SECRET
# - OPENAI_API_KEY
# - CLOUDINARY credentials
# - REDIS_HOST and REDIS_PORT (if not localhost:6379)
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed database with templates
npm run seed:templates
```

### 5. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   └── redis.ts     # Redis connection
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication
│   │   ├── validation.ts # Request validation
│   │   ├── cache.ts     # Cache middleware
│   │   └── performance.ts # Performance tracking
│   ├── services/        # Business logic
│   │   ├── ai.ts        # AI operations
│   │   └── cache.ts     # Cache service
│   ├── queues/          # Background job queues
│   │   ├── emailQueue.ts    # Email queue
│   │   ├── documentQueue.ts # Document processing
│   │   └── aiQueue.ts       # AI operations
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run seed             # Seed database

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Run ESLint
```

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

#### Resumes
- `GET /api/resume` - List user resumes
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/tailor` - Tailor resume for job
- `GET /api/resume/:id` - Get resume details
- `DELETE /api/resume/:id` - Delete resume

#### Cover Letters
- `POST /api/cover-letter/generate` - Generate cover letter
- `GET /api/cover-letter` - List cover letters
- `DELETE /api/cover-letter/:id` - Delete cover letter

#### Job Tracker
- `GET /api/job-tracker/applications` - List applications
- `POST /api/job-tracker/applications` - Create application
- `PUT /api/job-tracker/applications/:id` - Update application
- `DELETE /api/job-tracker/applications/:id` - Delete application

#### Job Board
- `GET /api/job-board/search` - Search jobs
- `POST /api/job-board/save` - Save job
- `GET /api/job-board/saved` - List saved jobs

#### Monitoring (Admin)
- `GET /api/monitoring/performance` - Performance metrics
- `GET /api/monitoring/cache` - Cache statistics
- `GET /api/monitoring/health` - Health check
- `POST /api/monitoring/cache/clear` - Clear cache

## Redis Integration

### Caching

The application uses Redis for caching frequently accessed data:

- **User Sessions**: 7 days TTL
- **Resume Data**: 5 minutes TTL
- **Job Applications**: 5 minutes TTL
- **Dashboard Stats**: 2 minutes TTL
- **AI Results**: 30 minutes TTL

### Job Queues

Three background job queues powered by Bull:

1. **Email Queue**: Async email sending
2. **Document Queue**: Resume parsing
3. **AI Queue**: AI operations with rate limiting

Monitor queues at `/api/monitoring/performance`

## Performance Optimizations

### Phase 1: Security
- Rate limiting (express-rate-limit)
- Input validation (Zod)
- Helmet security headers
- CORS configuration
- SQL injection prevention

### Phase 2: Scalability
- Redis caching layer (60-80% reduced DB load)
- Background job processing
- Database query optimization with indexes
- Real-time performance monitoring
- Automatic slow query logging

See [SCALABILITY.md](./SCALABILITY.md) for detailed documentation.

## Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name description_of_changes
```

### Deploy Migration (Production)

```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

```bash
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=            # JWT signing secret (min 64 chars)
OPENAI_API_KEY=        # OpenAI API key
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY=    # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
```

### Optional Variables

```bash
REDIS_HOST=localhost   # Redis host (default: localhost)
REDIS_PORT=6379        # Redis port (default: 6379)
REDIS_PASSWORD=        # Redis password (if required)

RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
SLOW_QUERY_THRESHOLD=1000      # Log queries slower than 1000ms
```

## Monitoring

### Performance Metrics

Access real-time performance metrics:

```bash
curl http://localhost:3001/api/monitoring/performance
```

### Health Check

```bash
curl http://localhost:3001/api/monitoring/health
```

### Cache Statistics

```bash
curl http://localhost:3001/api/monitoring/cache
```

### Queue Statistics

Included in performance metrics endpoint - shows:
- Jobs waiting, active, completed, failed
- For email, document, and AI queues

## Troubleshooting

### Redis Connection Errors

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis logs
docker logs redis  # If using Docker
```

### Database Connection Errors

```bash
# Test database connection
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
```

### Slow Queries

Check slow query logs in console output:
```
[SLOW QUERY] GET /api/resume/versions took 1500ms (200)
[SLOW DB QUERY] findMany resumes took 1200ms
```

Review indexes and optimize queries in [SCALABILITY.md](./SCALABILITY.md)

## Production Deployment

### 1. Environment Setup

- Use strong, unique values for all secrets
- Enable Redis authentication
- Use managed PostgreSQL (e.g., Neon, Supabase)
- Use Redis Cloud or managed Redis
- Set `NODE_ENV=production`

### 2. Database Setup

```bash
npx prisma generate
npx prisma migrate deploy
```

### 3. Build Application

```bash
npm run build
```

### 4. Start Server

```bash
npm start
```

### 5. Process Manager (Recommended)

Use PM2 for production:

```bash
npm install -g pm2
pm2 start dist/server.js --name cv-builder-api
pm2 save
pm2 startup
```

### 6. Monitoring

Set up monitoring for:
- API response times
- Queue health
- Cache hit rate
- Database performance
- Error rates

## Security Considerations

See [SECURITY.md](./SECURITY.md) for security implementation details.

Key security features:
- JWT authentication with secure secrets
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Request validation with Zod
- Helmet security headers
- CORS configuration
- SQL injection prevention
- XSS protection

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint` and fix issues
4. Submit PR with description

## License

ISC

## Support

For issues or questions:
- Check [SCALABILITY.md](./SCALABILITY.md) for performance documentation
- Check [SECURITY.md](./SECURITY.md) for security documentation
- Review `.env.example` for configuration options
