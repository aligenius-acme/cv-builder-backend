# Middleware Documentation

This directory contains all Express middleware used throughout the application.

---

## Security Middleware

### Rate Limiting (`rateLimiter.ts`)

Protects the API from abuse by limiting request frequency from individual IPs.

**Available Limiters:**

```typescript
import {
  apiLimiter,          // General API protection
  authLimiter,         // Auth endpoint protection
  aiLimiter,           // AI operation protection
  uploadLimiter,       // File upload protection
  passwordResetLimiter // Password reset protection
} from './rateLimiter';
```

**Usage:**
```typescript
// Apply to specific routes
router.post('/login', authLimiter, login);
router.post('/ai-generate', aiLimiter, generate);
```

**Configuration:**
- `apiLimiter`: 100 requests per 15 minutes
- `authLimiter`: 5 attempts per 15 minutes (skips successful requests)
- `aiLimiter`: 10 requests per minute
- `uploadLimiter`: 5 uploads per minute
- `passwordResetLimiter`: 3 requests per hour

---

### Input Validation (`validate.ts`)

Validates incoming requests against Zod schemas to ensure data integrity and security.

**Available Validators:**

```typescript
import {
  validateBody,    // Validates req.body
  validateQuery,   // Validates req.query
  validateParams,  // Validates req.params
  validate         // Generic validator
} from './validate';
```

**Usage:**
```typescript
import { loginSchema } from '../validation/schemas';

router.post('/login', validateBody(loginSchema), login);
```

**Error Response Format:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## Authentication Middleware

### Authentication (`auth.ts`)

Handles JWT token validation and user authentication.

**Available Middleware:**

```typescript
import {
  authenticate,      // Require valid JWT token
  optionalAuth,     // Optional JWT token
  requireRole,      // Require specific role
  requireAdmin,     // Require admin role
  requireOrgAdmin,  // Require org admin or admin
  generateToken     // Generate JWT token
} from './auth';
```

**Usage:**
```typescript
// Require authentication
router.get('/profile', authenticate, getProfile);

// Optional authentication
router.get('/public-data', optionalAuth, getData);

// Require admin role
router.delete('/user/:id', authenticate, requireAdmin, deleteUser);

// Require org admin or admin
router.put('/org-settings', authenticate, requireOrgAdmin, updateSettings);
```

---

## Subscription Middleware

### Subscription Checks (`subscription.ts`)

Validates user subscription status and enforces feature access limits.

**Available Middleware:**

```typescript
import {
  checkResumeQuota,           // Check resume creation limit
  checkCoverLetterAccess,     // Check cover letter access
  checkATSSimulatorAccess,    // Check ATS simulator access
  checkInterviewPrepAccess,   // Check interview prep access
  checkJobTrackerAccess       // Check job tracker access
} from './subscription';
```

**Usage:**
```typescript
router.post('/resumes', authenticate, checkResumeQuota, createResume);
router.post('/cover-letters', authenticate, checkCoverLetterAccess, generateCoverLetter);
```

---

## Error Handling Middleware

### Error Handlers (`errorHandler.ts`)

Global error handling for the application.

**Available Handlers:**

```typescript
import {
  errorHandler,      // Global error handler
  notFoundHandler    // 404 handler
} from './errorHandler';
```

**Error Types:**
- `AuthenticationError`: 401 Unauthorized
- `AuthorizationError`: 403 Forbidden
- `ValidationError`: 400 Bad Request
- `NotFoundError`: 404 Not Found
- `SubscriptionError`: 402 Payment Required

**Usage:**
```typescript
// Apply at the end of all routes
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## Middleware Execution Order

The order of middleware is critical. Here's the recommended order:

```typescript
// 1. Security headers (Helmet)
app.use(helmet({...}));

// 2. CORS
app.use(cors({...}));

// 3. Request logging
app.use(morgan(...));

// 4. Body parsing
app.use(express.json());
app.use(express.urlencoded());

// 5. Global rate limiting
app.use('/api', apiLimiter);

// 6. Routes with specific middleware
app.use('/api', routes);

// 7. Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## Route-Level Middleware Stacking

Multiple middleware can be chained together:

```typescript
router.post(
  '/login',
  authLimiter,              // 1. Rate limit
  validateBody(loginSchema), // 2. Validate input
  login                      // 3. Controller
);

router.post(
  '/resumes/:id/customize',
  authenticate,              // 1. Check auth
  aiLimiter,                // 2. Rate limit AI calls
  checkResumeQuota,         // 3. Check subscription
  customizeResume           // 4. Controller
);
```

---

## Best Practices

### 1. Always Validate Input
```typescript
// ✅ Good
router.post('/create', validateBody(createSchema), create);

// ❌ Bad
router.post('/create', create); // No validation
```

### 2. Apply Rate Limiting to Expensive Operations
```typescript
// ✅ Good - AI operations are expensive
router.post('/ai-generate', aiLimiter, generate);

// ❌ Bad - No rate limiting on expensive operation
router.post('/ai-generate', generate);
```

### 3. Use Specific Rate Limiters
```typescript
// ✅ Good - Stricter limits for auth
router.post('/login', authLimiter, login);

// ❌ Bad - Using general limiter for auth
router.post('/login', apiLimiter, login);
```

### 4. Authentication Before Authorization
```typescript
// ✅ Good - Check auth first, then permissions
router.delete('/user/:id', authenticate, requireAdmin, deleteUser);

// ❌ Bad - Wrong order
router.delete('/user/:id', requireAdmin, authenticate, deleteUser);
```

### 5. Validate Before Processing
```typescript
// ✅ Good - Validate before expensive operations
router.post('/process', validateBody(schema), expensiveOperation);

// ❌ Bad - Expensive operation might run on invalid data
router.post('/process', expensiveOperation, validateBody(schema));
```

---

## Testing Middleware

### Testing Rate Limiters
```typescript
describe('authLimiter', () => {
  it('should allow 5 requests', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/auth/login');
      expect(res.status).not.toBe(429);
    }
  });

  it('should block 6th request', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app).post('/api/auth/login');
    }
    const res = await request(app).post('/api/auth/login');
    expect(res.status).toBe(429);
  });
});
```

### Testing Validation
```typescript
describe('validateBody', () => {
  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'Test123', name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should accept valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test123', name: 'Test' });

    expect(res.status).not.toBe(400);
  });
});
```

### Testing Authentication
```typescript
describe('authenticate', () => {
  it('should reject missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should accept valid token', async () => {
    const token = generateToken({ id: '123', email: 'test@test.com', role: 'USER' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).not.toBe(401);
  });
});
```

---

## Troubleshooting

### Rate Limiting Issues

**Problem:** Rate limit triggered too easily
```typescript
// Solution: Increase limit or window
export const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // Increase to 30 minutes
  max: 200,                  // Increase to 200 requests
});
```

**Problem:** Rate limit not working
```typescript
// Check middleware order - must be applied before routes
app.use('/api', apiLimiter); // ✅ Before routes
app.use('/api', routes);

// Not:
app.use('/api', routes);
app.use('/api', apiLimiter); // ❌ After routes (won't work)
```

### Validation Issues

**Problem:** Validation always fails
```typescript
// Check schema matches request data
const schema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Make sure field names match exactly
router.post('/login', validateBody(schema), login);
```

**Problem:** Nested validation not working
```typescript
// Use proper Zod schema for nested objects
const schema = z.object({
  user: z.object({
    email: z.string().email(),
    name: z.string()
  })
});
```

### CORS Issues

**Problem:** CORS errors in browser
```typescript
// Solution: Add origin to ALLOWED_ORIGINS
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

---

## Additional Resources

- [Express Rate Limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Zod Documentation](https://zod.dev/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
