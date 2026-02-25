# Utility Scripts

This directory contains utility scripts for the CV Builder backend.

## Available Scripts

### `verify-seeding.ts`
Verify database seeding was successful.
```bash
node -e "require('ts-node').register({transpileOnly:true,compilerOptions:{module:'commonjs'}}); require('./verify-seeding')"
```

### `verify-template-system.ts`
Comprehensive template system health check.
```bash
node -e "require('ts-node').register({transpileOnly:true,compilerOptions:{module:'commonjs'}}); require('./verify-template-system')"
```

### `fix-tailored-contact-info.ts`
One-time fix for tailored resume contact info.

---

## Template System

Templates are managed entirely via the seed file:
```
prisma/seeds/templates.ts   — 100 premium templates (15 layouts × 16 palettes)
prisma/seed.ts              — main seed entry point
```

To re-seed templates:
```bash
node -e "require('ts-node').register({transpileOnly:true,compilerOptions:{module:'commonjs'}}); const {seedTemplates}=require('./prisma/seeds/templates'); seedTemplates().then(()=>process.exit(0))"
```

**Thumbnails** are generated dynamically as SVG at `/api/templates/:id/thumbnail` — no static image files or Cloudinary needed.
