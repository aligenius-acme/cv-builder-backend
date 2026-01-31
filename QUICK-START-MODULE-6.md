# Module 6: Quick Start Guide

Get up and running with the new template system in 5 minutes.

## Installation

### 1. Install Dependencies (if not already done)
```bash
cd backend
npm install
```

### 2. Update Database Schema (if needed)
```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Seed Templates
```bash
npm run seed
# or
ts-node scripts/setup-templates.ts
```

You should see:
```
✅ Database connection successful
📝 Seeding templates...
✅ Successfully seeded 80 templates
   - ATS-Professional: 15 templates
   - Entry-Student: 15 templates
   - Tech-Startup: 15 templates
   - Creative-Design: 15 templates
   - Academic-Research: 10 templates
   - Executive-Leadership: 10 templates
```

### 4. Verify Installation
```bash
ts-node scripts/verify-template-system.ts
```

Should show all tests passing with 100% success rate.

### 5. Start Server
```bash
npm run dev
```

Server will start on http://localhost:5000

## API Quick Test

### Get All Templates
```bash
curl http://localhost:5000/api/templates
```

### Get Featured Templates
```bash
curl "http://localhost:5000/api/templates?isFeatured=true"
```

### Get Tech Templates
```bash
curl "http://localhost:5000/api/templates?category=tech-startup"
```

### Get Recommendations
```bash
curl "http://localhost:5000/api/templates/recommended?limit=5"
```

### Get Filter Options
```bash
curl http://localhost:5000/api/templates/filters
```

### Search Templates
```bash
curl "http://localhost:5000/api/templates?search=developer"
```

## Common Use Cases

### 1. Browse Templates by Category

**Request:**
```bash
curl http://localhost:5000/api/templates/category/tech-startup
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "developer-minimal",
      "name": "Developer Minimal",
      "description": "Clean, minimalist single-column design for developers",
      "primaryCategory": "tech-startup",
      "designStyle": "minimal",
      "atsCompatibility": "ats-safe",
      "industryTags": ["software", "technology", "engineering", "development"],
      "targetRoles": ["software-engineer", "developer", "programmer"],
      "experienceLevel": "mid",
      "popularityScore": 94,
      "isFeatured": true,
      "supportedFormats": ["pdf", "docx"],
      "isPremium": false
    },
    // ... 14 more templates
  ]
}
```

### 2. Filter Templates

**Request:**
```bash
curl "http://localhost:5000/api/templates?atsCompatibility=ats-safe&experienceLevel=entry&limit=5"
```

This returns entry-level, ATS-safe templates (perfect for students/new grads).

### 3. Get Smart Recommendations

**Without user data:**
```bash
curl http://localhost:5000/api/templates/recommended
```

**With user's resume:**
```bash
curl "http://localhost:5000/api/templates/recommended?resumeId=abc123&limit=5"
```

Returns templates matched to user's experience, skills, and industry.

### 4. Generate PDF with Template

```typescript
import { generatePDFFromRegistry } from './services/documents';

const resumeData = {
  contact: { name: 'John Doe', email: 'john@example.com' },
  experience: [...],
  education: [...],
  skills: [...]
};

const pdfBuffer = await generatePDFFromRegistry(
  resumeData,
  'developer-minimal'
);

// Save or send PDF
res.setHeader('Content-Type', 'application/pdf');
res.send(pdfBuffer);
```

### 5. Generate DOCX with Template

```typescript
import { generateDOCXFromRegistry } from './services/documents';

const docxBuffer = await generateDOCXFromRegistry(
  resumeData,
  'corporate-standard'
);

res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
res.send(docxBuffer);
```

## Integration with Frontend

### Example: Fetch All Templates

```typescript
// In your API client
export async function getTemplates(filters?: TemplateFilters) {
  const params = new URLSearchParams();

  if (filters?.category) params.append('category', filters.category);
  if (filters?.designStyle) params.append('designStyle', filters.designStyle);
  if (filters?.search) params.append('search', filters.search);
  // ... add other filters

  const response = await fetch(`/api/templates?${params}`);
  return response.json();
}
```

### Example: Get Recommendations

```typescript
export async function getRecommendedTemplates(resumeId?: string, limit: number = 5) {
  const params = new URLSearchParams();
  if (resumeId) params.append('resumeId', resumeId);
  params.append('limit', limit.toString());

  const response = await fetch(`/api/templates/recommended?${params}`);
  return response.json();
}
```

### Example: React Component

```tsx
import { useEffect, useState } from 'react';
import { getTemplates, getRecommendedTemplates } from './api';

function TemplateBrowser() {
  const [templates, setTemplates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Load all templates
    getTemplates(filters).then(res => setTemplates(res.data));

    // Load recommendations
    getRecommendedTemplates(resumeId).then(res => setRecommended(res.data));
  }, [filters]);

  return (
    <div>
      <h2>Recommended for You</h2>
      <TemplateGrid templates={recommended} />

      <h2>All Templates</h2>
      <FilterBar onChange={setFilters} />
      <TemplateGrid templates={templates} />
    </div>
  );
}
```

## Troubleshooting

### Issue: "No templates found"

**Solution:**
```bash
# Re-run seed script
npm run setup:templates

# Verify
curl http://localhost:5000/api/templates
```

### Issue: "Template not found: xyz"

**Cause:** Template ID doesn't exist in database.

**Solution:**
```bash
# List all template IDs
curl http://localhost:5000/api/templates | jq '.[].id'

# Use a valid ID
```

### Issue: "DOCX export not supported"

**Cause:** Template only supports PDF (two-column layouts).

**Solution:**
```bash
# Check supported formats
curl http://localhost:5000/api/templates/your-template-id | jq '.supportedFormats'

# Use PDF instead if DOCX not supported
```

### Issue: Slow API responses

**Solution:**
1. Use pagination: `?limit=20&offset=0`
2. Add specific filters instead of loading all
3. Check cache is working (second request should be faster)

## Performance Tips

### 1. Use Pagination
```bash
# First page
curl "http://localhost:5000/api/templates?limit=20&offset=0"

# Second page
curl "http://localhost:5000/api/templates?limit=20&offset=20"
```

### 2. Filter Early
```bash
# Instead of loading all 80 and filtering client-side
curl http://localhost:5000/api/templates

# Filter server-side
curl "http://localhost:5000/api/templates?category=tech-startup&atsCompatibility=ats-safe"
```

### 3. Cache Filter Options
```bash
# Load once on app start
curl http://localhost:5000/api/templates/filters

# Cache in frontend for dropdown menus
```

## Testing

### Manual Testing Checklist

- [ ] Database seeded with 80 templates
- [ ] GET /api/templates returns all templates
- [ ] GET /api/templates?category=tech-startup returns 15 templates
- [ ] GET /api/templates/recommended returns 5 templates
- [ ] GET /api/templates/filters returns all filter options
- [ ] GET /api/templates/corporate-standard returns template details
- [ ] PDF generation works with new templates
- [ ] DOCX generation works (for supported templates)
- [ ] Search works: GET /api/templates?search=developer
- [ ] Pagination works: limit and offset parameters

### Automated Testing

```bash
# Run verification script
npm run verify:templates

# Should show 100% pass rate
```

## What's Next?

After setup is complete:

1. **Frontend Integration**
   - Update template selector UI
   - Add filtering interface
   - Implement recommendations section

2. **Preview Images**
   - Generate preview images for all 80 templates
   - Upload to CDN or public folder
   - Update `previewImageUrl` in database

3. **Analytics**
   - Track template usage
   - Monitor popular templates
   - A/B test recommendations

4. **Optimization**
   - Add Redis caching for production
   - Optimize database queries
   - Implement CDN for static assets

## Resources

- **Full Documentation:** `MODULE-6-IMPLEMENTATION.md`
- **Summary:** `MODULE-6-SUMMARY.md`
- **Database Schema:** `prisma/schema.prisma`
- **API Routes:** `src/routes/templates.ts`
- **Service Code:** `src/services/template-registry.ts`

## Support

If you encounter issues:

1. Check the verification script output
2. Review the full documentation
3. Check database connection
4. Verify all templates are seeded
5. Check server logs for errors

## Success Criteria

You're ready to proceed when:

✅ Database has 80 templates
✅ All API endpoints return data
✅ Verification script shows 100% pass rate
✅ PDF/DOCX generation works
✅ Recommendations return results
✅ Filtering works correctly

Congratulations! Module 6 is complete and ready for production use.
