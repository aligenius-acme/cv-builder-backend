# Module 6: Database & API Integration - Implementation Guide

## Overview

Module 6 implements the complete database and API integration for the 80-template system, including:

- Database seeding for all 80 templates
- Template registry service with dynamic loading
- REST API endpoints with advanced filtering
- Smart template recommendations
- Performance caching
- Integration with existing PDF/DOCX services

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  - Template browser with filtering                               │
│  - Smart recommendations UI                                       │
│  - Template preview                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Layer (Express)                         │
│  Routes: /api/templates/*                                        │
│  - GET /api/templates                  (list with filters)       │
│  - GET /api/templates/filters          (filter options)          │
│  - GET /api/templates/recommended      (smart suggestions)       │
│  - GET /api/templates/:id              (template details)        │
│  - GET /api/templates/category/:cat    (by category)             │
│  - GET /api/templates/:id/preview      (PDF preview)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   Template Registry Service                      │
│  - Dynamic template loading                                      │
│  - Advanced filtering & search                                   │
│  - Smart recommendations engine                                  │
│  - Performance caching (1 hour TTL)                              │
│  - Usage tracking                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   Database (PostgreSQL)                          │
│  Table: ResumeTemplate (80 records)                              │
│  - Basic fields: id, name, description                           │
│  - Taxonomy: primaryCategory, designStyle, atsCompatibility      │
│  - Targeting: industryTags[], targetRoles[], experienceLevel    │
│  - Engagement: popularityScore, isFeatured, usageCount          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     Template Modules                             │
│  /backend/src/templates/                                         │
│  - ats-professional/     (15 templates)                          │
│  - entry-student/        (15 templates)                          │
│  - tech-startup/         (15 templates)                          │
│  - creative-design/      (15 templates)                          │
│  - academic-research/    (10 templates)                          │
│  - executive-leadership/ (10 templates)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. Database Seed Script
**File:** `backend/prisma/seeds/templates.ts`

Seeds all 80 templates with complete metadata:
- 15 ATS-Professional templates
- 15 Entry-Student templates
- 15 Tech-Startup templates
- 15 Creative-Design templates
- 10 Academic-Research templates
- 10 Executive-Leadership templates

Each template includes:
```typescript
{
  id: string;
  name: string;
  description: string;
  primaryCategory: 'ats-professional' | 'tech-startup' | ...
  designStyle: 'minimal' | 'modern' | 'bold' | 'traditional'
  atsCompatibility: 'ats-safe' | 'ats-friendly' | 'visual-first'
  pageLength: 'one-page' | 'standard' | 'cv-length'
  industryTags: string[];        // ['finance', 'banking', ...]
  targetRoles: string[];         // ['software-engineer', ...]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  searchKeywords: string[];
  popularityScore: number;       // 0-100
  isFeatured: boolean;
  supportedFormats: string[];    // ['pdf', 'docx']
  isPremium: boolean;
  isAtsSafe: boolean;
  // ... other fields
}
```

### 2. Template Registry Service
**File:** `backend/src/services/template-registry.ts`

Core service providing:

#### Functions

**`getAllTemplates(filters?: TemplateFilters)`**
- Returns all templates with optional filtering
- Supports pagination (limit/offset)
- Ordered by: featured > popularity > name

**`getTemplateById(id: string)`**
- Returns single template metadata
- Used for template details page

**`getTemplatesByCategory(category: string)`**
- Filter templates by primary category
- Returns array of templates

**`getTemplatesByFilters(filters: TemplateFilters)`**
- Advanced multi-criteria filtering
- Supports:
  - Category, design style, ATS level
  - Industry tags, target roles
  - Experience level, page length
  - Premium/featured flags
  - Search query (name, description, keywords)
  - Pagination

**`getRecommendedTemplates(userData?, limit?)`**
- Smart recommendation engine
- Analyzes user's resume data:
  - Years of experience → experience level match
  - Job titles → role matching
  - Industries → industry tag matching
  - Skills → category matching (tech/design/etc)
  - Education → academic template boost
- Returns top N templates sorted by relevance score

**`getFilterOptions()`**
- Returns available filter values
- Used to populate filter dropdowns in UI
- Returns: categories, styles, industries, roles, etc.

**`loadTemplateModule(templateId: string)`**
- Dynamically imports template React component
- Caches loaded templates (1 hour TTL)
- Maps templateId → category → module path
- Returns ReactTemplate or null

**`incrementTemplateUsage(templateId: string)`**
- Tracks template usage for popularity scoring
- Called when template is used for PDF/DOCX generation

**`getTemplateStats()`**
- Returns template statistics
- Total count, category breakdown, most used templates

#### Caching

Templates are cached in-memory with:
- 1 hour TTL (configurable)
- Per-template caching
- Cache can be cleared globally or per-template

### 3. Updated Controllers
**File:** `backend/src/controllers/templates.ts`

New endpoints added:

**`getTemplates`** - Updated to support filtering
```typescript
Query params: category, designStyle, atsCompatibility, pageLength,
              experienceLevel, industryTags[], targetRoles[],
              isPremium, isFeatured, search, limit, offset
```

**`getTemplateDetails`** - Get single template
```typescript
GET /api/templates/:templateId
```

**`getTemplatesByCategory`** - Filter by category
```typescript
GET /api/templates/category/:category
```

**`getFilterOptions`** - Get filter metadata
```typescript
GET /api/templates/filters
```

**`getRecommendedTemplates`** - Smart recommendations
```typescript
GET /api/templates/recommended?resumeId=xxx&limit=5
```

**`getTemplateStats`** - Template statistics
```typescript
GET /api/templates/stats
```

### 4. Updated Routes
**File:** `backend/src/routes/templates.ts`

Updated routing with proper ordering:
```
GET  /api/templates                      → List all (filtered)
GET  /api/templates/filters              → Filter options
GET  /api/templates/recommended          → Recommendations
GET  /api/templates/stats                → Statistics
GET  /api/templates/category/:category   → By category
GET  /api/templates/:templateId          → Details
GET  /api/templates/:templateId/preview  → PDF preview
```

### 5. Documents Service Integration
**File:** `backend/src/services/documents.ts`

New functions added:

**`generatePDFFromRegistry(data, templateId)`**
- Loads template from registry
- Uses React PDF renderer if available
- Falls back to legacy PDF generation
- Increments usage counter

**`generateDOCXFromRegistry(data, templateId)`**
- Loads template from registry
- Checks DOCX support in metadata
- Uses React DOCX generator if available
- Falls back to legacy DOCX generation
- Throws error if template doesn't support DOCX

### 6. Setup & Verification Scripts

**`backend/scripts/setup-templates.ts`**
- Runs database seeding
- Verifies template count
- Shows category breakdown
- Lists featured templates

**`backend/scripts/verify-template-system.ts`**
- Comprehensive test suite
- Tests database seeding
- Tests registry functions
- Tests filtering & search
- Tests caching
- Tests recommendations
- Prints detailed test report

## Database Schema

The `ResumeTemplate` table includes all fields from the schema (already defined in `schema.prisma`):

```prisma
model ResumeTemplate {
  id                String   @id @default(uuid())
  name              String
  description       String?

  // Enhanced fields (Module 6)
  primaryCategory   String?
  designStyle       String?
  pageLength        String?
  atsCompatibility  String?
  industryTags      String[]
  targetRoles       String[]
  experienceLevel   String?
  searchKeywords    String[]
  popularityScore   Int      @default(0)
  isFeatured        Boolean  @default(false)
  supportedFormats  String[] @default(["pdf", "docx"])
  usageCount        Int      @default(0)

  // Legacy fields
  isPremium         Boolean  @default(false)
  isDefault         Boolean  @default(false)
  isAtsSafe         Boolean  @default(true)
  templateConfig    Json
  previewImageUrl   String?

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([primaryCategory])
  @@index([designStyle])
  @@index([atsCompatibility])
  @@index([popularityScore])
  @@index([isFeatured])
}
```

## Setup Instructions

### 1. Run Database Migration

If schema changes were needed:
```bash
cd backend
npx prisma migrate dev --name add-template-enhancements
```

### 2. Seed Templates

Option A: Run full seed (includes users, prompts, templates):
```bash
npm run seed
```

Option B: Run template-specific seed:
```bash
npm run setup:templates
# or
ts-node scripts/setup-templates.ts
```

### 3. Verify Installation

```bash
npm run verify:templates
# or
ts-node scripts/verify-template-system.ts
```

This will run comprehensive tests and output a report.

### 4. Start Server

```bash
npm run dev
```

## API Usage Examples

### Get All Templates (with filtering)

```bash
# Get all templates
curl http://localhost:5000/api/templates

# Filter by category
curl http://localhost:5000/api/templates?category=tech-startup

# Filter by multiple criteria
curl "http://localhost:5000/api/templates?category=tech-startup&atsCompatibility=ats-safe&experienceLevel=mid"

# Search
curl "http://localhost:5000/api/templates?search=developer"

# Pagination
curl "http://localhost:5000/api/templates?limit=10&offset=0"

# Featured only
curl "http://localhost:5000/api/templates?isFeatured=true"
```

### Get Filter Options

```bash
curl http://localhost:5000/api/templates/filters
```

Response:
```json
{
  "success": true,
  "data": {
    "categories": ["ats-professional", "tech-startup", ...],
    "designStyles": ["minimal", "modern", "bold", "traditional"],
    "atsCompatibilityLevels": ["ats-safe", "ats-friendly", "visual-first"],
    "industries": ["finance", "technology", "healthcare", ...],
    "roles": ["software-engineer", "designer", "analyst", ...],
    "experienceLevels": ["entry", "mid", "senior", "executive"]
  }
}
```

### Get Recommendations

```bash
# Generic recommendations
curl http://localhost:5000/api/templates/recommended

# Personalized based on resume
curl "http://localhost:5000/api/templates/recommended?resumeId=abc123&limit=5"
```

### Get Template Details

```bash
curl http://localhost:5000/api/templates/corporate-standard
```

### Get Templates by Category

```bash
curl http://localhost:5000/api/templates/category/tech-startup
```

### Get Template Statistics

```bash
curl http://localhost:5000/api/templates/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalTemplates": 80,
    "byCategory": {
      "ats-professional": 15,
      "tech-startup": 15,
      "entry-student": 15,
      "creative-design": 15,
      "academic-research": 10,
      "executive-leadership": 10
    },
    "mostUsed": [
      { "id": "developer-minimal", "name": "Developer Minimal", "usageCount": 45 },
      ...
    ]
  }
}
```

## Integration with Existing Code

### PDF Generation

Update resume download controller:
```typescript
import { generatePDFFromRegistry } from '../services/documents';

// Old way
const buffer = await generatePDF(resumeData, templateConfig);

// New way (Module 6)
const buffer = await generatePDFFromRegistry(resumeData, templateId);
```

### DOCX Generation

```typescript
import { generateDOCXFromRegistry } from '../services/documents';

// Old way
const buffer = await generateDOCX(resumeData, templateConfig);

// New way (Module 6)
const buffer = await generateDOCXFromRegistry(resumeData, templateId);
```

### Loading Templates

```typescript
import { loadTemplateModule } from '../services/template-registry';

// Load template dynamically
const template = await loadTemplateModule('developer-minimal');
if (template) {
  // Use template.PDFComponent or template.generateDOCX
}
```

## Performance Considerations

### Caching Strategy

1. **Template Metadata**: Cached at database level (Prisma query caching)
2. **Template Modules**: Cached in-memory for 1 hour after first load
3. **Filter Options**: Can be cached at API level (consider Redis for production)
4. **Recommendations**: Computed on-demand (consider caching user-specific recommendations)

### Optimization Tips

1. **Use pagination** for large result sets
2. **Index frequently queried fields** (already done: category, style, ATS level)
3. **Clear cache selectively** when templates are updated
4. **Consider CDN** for preview images
5. **Batch template loading** if pre-loading multiple templates

## Testing

### Unit Tests

The verification script (`verify-template-system.ts`) includes:
- Database seeding validation
- Registry function tests
- Filtering tests
- Caching tests
- Recommendation algorithm tests

### Integration Tests

Test API endpoints using:
```bash
# Using curl
curl -X GET http://localhost:5000/api/templates

# Using Postman
Import the API collection from postman/templates.json
```

### Load Testing

For production, test:
- Concurrent template loads
- Cache hit rates
- Database query performance
- API response times

## Troubleshooting

### Templates not loading

Check:
1. Database seeded: `npm run setup:templates`
2. Template modules exist in `/templates/` folders
3. Template IDs match between database and files
4. Category mapping in `loadTemplateModule()`

### Slow API responses

Solutions:
1. Enable Prisma query logging
2. Check database indexes
3. Implement Redis caching
4. Use pagination for large queries

### Recommendations not working

Verify:
1. Resume data is properly parsed
2. Experience dates are in recognized format
3. Skills/titles contain matching keywords
4. Industry extraction logic is correct

## Future Enhancements

### Planned Features

1. **Analytics Dashboard**
   - Template usage trends
   - Popular filter combinations
   - User journey tracking

2. **A/B Testing**
   - Test template variants
   - Compare conversion rates
   - Optimize recommendations

3. **Admin Panel**
   - Edit template metadata
   - Reorder featured templates
   - Bulk operations

4. **Advanced Search**
   - Full-text search with Elasticsearch
   - Fuzzy matching
   - Similar template suggestions

5. **Machine Learning**
   - Improve recommendation algorithm
   - Predict template success
   - Personalize based on outcomes

## Conclusion

Module 6 completes the database and API integration, providing:

✅ 80 templates seeded and ready to use
✅ Comprehensive API with advanced filtering
✅ Smart recommendation engine
✅ Performance-optimized with caching
✅ Fully integrated with existing services
✅ Production-ready with verification tests

The system is now ready for frontend integration and user testing.
