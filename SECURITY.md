# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the CV Builder backend API.

## Table of Contents

1. [Security Headers](#security-headers)
2. [Rate Limiting](#rate-limiting)
3. [CORS Configuration](#cors-configuration)
4. [Input Validation](#input-validation)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Upload Security](#file-upload-security)
7. [Environment Variables](#environment-variables)
8. [Best Practices](#best-practices)

---

## Security Headers

### Helmet.js Configuration

The application uses Helmet.js to set secure HTTP headers:

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  hidePoweredBy: true,
})
```

**What this protects against:**
- **XSS attacks**: Content Security Policy restricts script execution
- **Clickjacking**: Frameguard prevents the site from being embedded in iframes
- **MIME sniffing**: noSniff prevents browsers from MIME-type sniffing
- **Information disclosure**: hidePoweredBy removes the X-Powered-By header
- **Man-in-the-middle attacks**: HSTS forces HTTPS connections

---

## Rate Limiting

### Rate Limiter Types

The application implements multiple rate limiters for different endpoints:

#### 1. General API Rate Limiter
- **Window**: 15 minutes
- **Max requests**: 100 per IP
- **Applied to**: All `/api` routes

#### 2. Authentication Rate Limiter
- **Window**: 15 minutes
- **Max attempts**: 5 per IP
- **Applied to**: `/api/auth/login`, `/api/auth/register`, etc.
- **Skips**: Successful requests (doesn't penalize successful logins)

#### 3. Password Reset Rate Limiter
- **Window**: 1 hour
- **Max requests**: 3 per IP
- **Applied to**: `/api/auth/forgot-password`

#### 4. AI Operations Rate Limiter
- **Window**: 1 minute
- **Max requests**: 10 per IP
- **Applied to**: All AI-powered endpoints (cover letters, resume tailoring, interview prep, etc.)

#### 5. Upload Rate Limiter
- **Window**: 1 minute
- **Max uploads**: 5 per IP
- **Applied to**: File upload endpoints

**What this protects against:**
- Brute force attacks (especially on auth endpoints)
- API abuse and resource exhaustion
- Distributed denial of service (DDoS) attacks
- Cost abuse (AI API calls are expensive)

---

## CORS Configuration

### Dynamic Origin Validation

The application implements strict CORS policies:

```typescript
cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
})
```

**Configuration:**
- Set `ALLOWED_ORIGINS` in `.env` as a comma-separated list
- If not set, defaults to `FRONTEND_URL`
- Supports credentials (cookies, authentication headers)

**What this protects against:**
- Cross-site request forgery (CSRF)
- Unauthorized cross-origin requests
- Data theft from malicious websites

---

## Input Validation

### Zod Schema Validation

All incoming data is validated using Zod schemas before processing.

#### Authentication Schemas

```typescript
// Registration
registerSchema: {
  email: string (valid email, max 255 chars)
  password: string (min 8 chars, must contain uppercase, lowercase, number)
  name: string (min 2 chars, max 100 chars)
}

// Login
loginSchema: {
  email: string (valid email)
  password: string (min 8 chars)
}
```

#### Resume Schemas

```typescript
// Resume Upload
resumeUploadSchema: {
  title: string (1-200 chars)
}

// Resume Update
resumeUpdateSchema: {
  title?: string (1-200 chars)
  content?: any (JSON)
  templateId?: UUID
}
```

#### Job Application Schemas

```typescript
jobApplicationSchema: {
  jobTitle: string (1-200 chars)
  company: string (1-200 chars)
  location?: string (max 200 chars)
  salary?: string (max 100 chars)
  jobDescription?: string (max 50,000 chars)
  status?: enum (WISHLIST, APPLIED, SCREENING, etc.)
  jobUrl?: valid URL or empty string
}
```

#### Cover Letter Schemas

```typescript
coverLetterSchema: {
  jobTitle: string (1-200 chars)
  companyName: string (1-200 chars)
  jobDescription: string (10-50,000 chars)
  resumeVersionId?: UUID
  tone?: enum (professional, enthusiastic, formal, creative)
}
```

**What this protects against:**
- SQL injection (through parameterized queries + validation)
- NoSQL injection
- Buffer overflow attacks
- Malformed data causing application crashes
- Business logic errors

---

## Authentication & Authorization

### JWT-based Authentication

The application uses JSON Web Tokens (JWT) for stateless authentication:

**Token Generation:**
```typescript
jwt.sign(payload, config.jwt.secret, {
  expiresIn: '7d' // Configurable via JWT_EXPIRES_IN
})
```

**Token Verification:**
- All protected routes use the `authenticate` middleware
- Token is extracted from `Authorization: Bearer <token>` header
- Invalid or expired tokens are rejected

### Role-based Access Control

```typescript
// Admin-only routes
router.use(requireAdmin)

// Organization admin routes
router.use(requireOrgAdmin)

// Subscription-based access
router.use(checkCoverLetterAccess)
router.use(checkATSSimulatorAccess)
```

**What this protects against:**
- Unauthorized access to protected resources
- Privilege escalation
- Session hijacking (tokens are short-lived and should be stored securely)

---

## File Upload Security

### Multer Configuration

File uploads are secured with multiple layers of validation:

#### Resume/Document Uploads
```typescript
{
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
}
```

#### Image Uploads
```typescript
{
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
}
```

**Security Measures:**
1. File size limits (5MB for images, 10MB for documents)
2. MIME type validation
3. Double validation (multer + controller level)
4. Memory storage (no direct file system access)
5. Files are processed and stored in Cloudinary (not local filesystem)

**What this protects against:**
- Malicious file uploads
- Server storage exhaustion
- Executable file uploads
- Path traversal attacks
- Resource exhaustion

---

## Environment Variables

### Critical Security Variables

**Required for Production:**

```bash
# Authentication
JWT_SECRET="<64-char-random-string>"
SESSION_SECRET="<32-char-random-string>"
ENCRYPTION_KEY="<32-char-random-string>"

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Database
DATABASE_URL="postgresql://..."
```

**Generate Secure Secrets:**

```bash
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64').slice(0, 32))"
```

---

## Best Practices

### 1. Keep Dependencies Updated
```bash
npm audit
npm audit fix
npm update
```

### 2. Use HTTPS in Production
- Always use HTTPS/TLS in production
- HSTS headers enforce this
- Redirect HTTP to HTTPS at the reverse proxy level

### 3. Secure Database Connections
- Use SSL/TLS for database connections
- Use connection pooling with limits
- Never expose database credentials

### 4. Monitor and Log
- Use Sentry for error tracking (already configured)
- Monitor rate limit hits
- Log authentication failures
- Alert on suspicious patterns

### 5. Regular Security Audits
- Review access logs
- Test rate limiters
- Verify CORS policies
- Check for outdated dependencies
- Perform penetration testing

### 6. Secrets Management
- Never commit `.env` files
- Use environment-specific `.env` files
- Rotate secrets regularly
- Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)

### 7. API Security
- Always validate input
- Use parameterized queries
- Implement request size limits
- Use secure headers
- Version your API

### 8. Authentication Best Practices
- Enforce strong password policies
- Implement account lockout after failed attempts
- Use secure password hashing (bcrypt)
- Implement refresh tokens for long-lived sessions
- Add 2FA for sensitive operations

---

## Security Checklist

- [x] Helmet.js configured with secure headers
- [x] Rate limiting on all API routes
- [x] Strict rate limiting on auth endpoints
- [x] AI endpoints rate limited
- [x] CORS configured with origin validation
- [x] Input validation on all endpoints
- [x] File upload validation and size limits
- [x] JWT authentication
- [x] Role-based access control
- [x] Subscription-based feature access
- [x] Environment variables documented
- [x] Secure secret generation instructions
- [ ] HTTPS enforced in production (infrastructure level)
- [ ] Database SSL enabled (infrastructure level)
- [ ] Regular security audits scheduled
- [ ] Monitoring and alerting configured

---

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** open a public GitHub issue for security vulnerabilities.

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
