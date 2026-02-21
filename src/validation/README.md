# Validation Schemas

This directory contains all Zod validation schemas used throughout the application.

---

## Overview

All incoming data is validated using Zod schemas before processing. This ensures:
- Type safety
- Data integrity
- Protection against injection attacks
- Consistent error messages
- Clear API contracts

---

## Available Schemas

### Authentication Schemas

#### `loginSchema`
```typescript
{
  email: string (valid email, max 255 chars)
  password: string (min 8 chars)
}
```

#### `registerSchema`
```typescript
{
  email: string (valid email, max 255 chars)
  password: string (min 8 chars, must contain uppercase, lowercase, number)
  name: string (2-100 chars)
}
```

#### `forgotPasswordSchema`
```typescript
{
  email: string (valid email, max 255 chars)
}
```

#### `resetPasswordSchema`
```typescript
{
  token: string (required)
  password: string (min 8 chars, must contain uppercase, lowercase, number)
}
```

#### `changePasswordSchema`
```typescript
{
  currentPassword: string (required)
  newPassword: string (min 8 chars, must contain uppercase, lowercase, number)
}
```

#### `verifyEmailSchema`
```typescript
{
  token: string (required)
}
```

---

### Resume Schemas

#### `resumeUploadSchema`
```typescript
{
  title: string (1-200 chars)
}
```

#### `resumeUpdateSchema`
```typescript
{
  title?: string (1-200 chars)
  content?: any (JSON content)
  templateId?: string (UUID)
}
```

#### `resumeTailoringSchema`
```typescript
{
  resumeVersionId: string (UUID)
  jobDescription: string (10-50,000 chars)
  targetRole?: string (1-200 chars)
}
```

---

### Job Application Schemas

#### `jobApplicationSchema`
```typescript
{
  jobTitle: string (1-200 chars)
  company: string (1-200 chars)
  location?: string (max 200 chars)
  salary?: string (max 100 chars)
  jobDescription?: string (max 50,000 chars)
  status?: enum (WISHLIST, APPLIED, SCREENING, INTERVIEWING, OFFER, ACCEPTED, REJECTED)
  applicationDate?: string
  notes?: string (max 5,000 chars)
  jobUrl?: string (valid URL or empty)
}
```

#### `jobApplicationUpdateSchema`
```typescript
// Same as jobApplicationSchema but all fields optional
```

---

### Cover Letter Schemas

#### `coverLetterSchema`
```typescript
{
  jobTitle: string (1-200 chars)
  companyName: string (1-200 chars)
  jobDescription: string (10-50,000 chars)
  resumeVersionId?: string (UUID)
  tone?: enum (professional, enthusiastic, formal, creative)
}
```

#### `coverLetterUpdateSchema`
```typescript
{
  title?: string (1-200 chars)
  content?: string (1-50,000 chars)
}
```

---

### AI Writing Schemas

#### `aiWritingSchema`
```typescript
{
  type: enum (resume_summary, experience_description, cover_letter_paragraph, linkedin_summary)
  context: string (10-5,000 chars)
  tone?: enum (professional, enthusiastic, formal, creative)
}
```

---

### Interview Prep Schemas

#### `interviewPrepSchema`
```typescript
{
  jobTitle: string (1-200 chars)
  companyName: string (1-200 chars)
  jobDescription?: string (10-50,000 chars)
  resumeVersionId?: string (UUID)
}
```

---

### User Profile Schemas

#### `updateProfileSchema`
```typescript
{
  name?: string (2-100 chars)
  email?: string (valid email, max 255 chars)
  phone?: string (max 20 chars)
  location?: string (max 200 chars)
}
```

---

### Subscription Schemas

#### `subscriptionSchema`
```typescript
{
  planType: enum (FREE, PRO, BUSINESS)
  paymentMethodId?: string
}
```

---

### Organization Schemas

#### `createOrganizationSchema`
```typescript
{
  name: string (2-200 chars)
  domain?: string (max 100 chars)
}
```

#### `updateOrganizationSchema`
```typescript
{
  name?: string (2-200 chars)
  domain?: string (max 100 chars)
}
```

---

### Share/Collaboration Schemas

#### `shareResumeSchema`
```typescript
{
  email: string (valid email, max 255 chars)
  permission: enum (VIEW, EDIT)
  message?: string (max 500 chars)
}
```

---

## Usage

### In Routes

```typescript
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/schemas';

// Apply validation middleware
router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
```

### In Controllers

While validation happens at the route level, you can also use schemas in controllers for type safety:

```typescript
import { loginSchema } from '../validation/schemas';

export const login = async (req: Request, res: Response) => {
  // At this point, data is already validated by middleware
  const { email, password } = req.body; // Type-safe

  // ... rest of controller logic
};
```

---

## File Upload Validation

File uploads require special handling:

```typescript
import { validateFileUpload } from '../validation/schemas';

// In your controller
const file = req.file;
if (!file) {
  return res.status(400).json({ error: 'No file provided' });
}

try {
  validateFileUpload(file);
  // File is valid, proceed with upload
} catch (error) {
  return res.status(400).json({ error: error.message });
}
```

**Allowed File Types:**
- PDF: `application/pdf`
- Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Images: `image/jpeg`, `image/png`, `image/webp`

**File Size Limits:**
- Documents: 10MB
- Images: 5MB

---

## Error Handling

When validation fails, the middleware returns a standardized error response:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Adding New Schemas

### Step 1: Define the Schema

```typescript
// In validation/schemas.ts
export const myNewSchema = z.object({
  fieldName: z.string().min(1).max(100),
  optionalField: z.string().optional(),
  enumField: z.enum(['VALUE1', 'VALUE2']),
  numberField: z.number().min(0).max(100),
});
```

### Step 2: Use in Routes

```typescript
// In routes/myRoute.ts
import { validateBody } from '../middleware/validate';
import { myNewSchema } from '../validation/schemas';

router.post('/my-endpoint', validateBody(myNewSchema), myController);
```

---

## Common Validation Patterns

### Email Validation
```typescript
email: z.string().email('Invalid email address').max(255)
```

### Strong Password
```typescript
password: z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  )
```

### UUID Validation
```typescript
id: z.string().uuid('Invalid ID format')
```

### URL Validation
```typescript
url: z.string().url('Invalid URL').optional().or(z.literal(''))
```

### Enum Validation
```typescript
status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'])
```

### Optional Fields
```typescript
field: z.string().optional()
// or
field: z.string().nullable()
// or both
field: z.string().optional().nullable()
```

### Nested Objects
```typescript
const schema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  settings: z.object({
    notifications: z.boolean(),
  })
});
```

### Arrays
```typescript
tags: z.array(z.string()).min(1).max(10)
```

### Custom Validation
```typescript
field: z.string().refine((val) => val.startsWith('prefix-'), {
  message: 'Must start with prefix-'
})
```

---

## Best Practices

### 1. Always Set Reasonable Limits
```typescript
// ✅ Good - Prevents abuse
description: z.string().max(5000)

// ❌ Bad - No limit
description: z.string()
```

### 2. Use Descriptive Error Messages
```typescript
// ✅ Good
name: z.string().min(2, 'Name must be at least 2 characters')

// ❌ Bad
name: z.string().min(2) // Generic error message
```

### 3. Make Optional Fields Explicit
```typescript
// ✅ Good - Clear intent
location: z.string().optional()

// ❌ Bad - Ambiguous
location: z.string()
```

### 4. Validate Enums Strictly
```typescript
// ✅ Good - Type-safe
status: z.enum(['ACTIVE', 'INACTIVE'])

// ❌ Bad - Any string allowed
status: z.string()
```

### 5. Combine Related Schemas
```typescript
// ✅ Good - Reuse common parts
const baseUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

export const updateUserSchema = baseUserSchema.partial();
```

---

## Testing Schemas

```typescript
import { loginSchema } from '../validation/schemas';

describe('loginSchema', () => {
  it('should accept valid data', () => {
    const data = { email: 'test@test.com', password: 'Test1234' };
    expect(() => loginSchema.parse(data)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const data = { email: 'invalid', password: 'Test1234' };
    expect(() => loginSchema.parse(data)).toThrow();
  });

  it('should reject short password', () => {
    const data = { email: 'test@test.com', password: 'short' };
    expect(() => loginSchema.parse(data)).toThrow();
  });
});
```

---

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)
- [Express Validator Alternatives](https://express-validator.github.io/docs/)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
