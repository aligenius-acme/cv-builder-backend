# Template System Scripts

This directory contains utility scripts for managing the template system.

## Preview Generation

### `generate-template-previews-v2.ts`
**Main preview image generator**

Generates preview images for all 126 resume templates.

**What it does:**
- Reads all templates from the database
- Generates realistic sample resume content
- Renders each template using Puppeteer
- Creates two versions: thumbnail (300x400px) and full-size
- Saves images to `frontend/public/template-previews/`

**Usage:**
```bash
ts-node scripts/generate-template-previews-v2.ts
```

**Output:**
- `frontend/public/template-previews/thumbnails/*.png` (126 thumbnails)
- `frontend/public/template-previews/full/*.png` (126 full images)

---

## Database Management

### `update-preview-urls.ts`
**Updates database with preview image paths**

After generating preview images, this script updates the database to reference them.

**What it does:**
- Scans `frontend/public/template-previews/thumbnails/` directory
- Updates each template's `previewImageUrl` field in the database
- Verifies all templates have preview images

**Usage:**
```bash
ts-node scripts/update-preview-urls.ts
```

**Prerequisites:** Run `generate-template-previews-v2.ts` first

---

### `setup-templates.ts`
**Template system initialization**

Sets up the template system for first-time use.

**What it does:**
- Validates database schema
- Initializes template categories
- Sets up default configurations

**Usage:**
```bash
ts-node scripts/setup-templates.ts
```

---

## Verification & Debugging

### `verify-seeding.ts`
**Verify database seeding was successful**

Checks that all templates were properly seeded into the database.

**What it does:**
- Counts templates in database
- Verifies all 126 templates exist
- Checks template metadata is complete
- Reports any missing or invalid templates

**Usage:**
```bash
ts-node scripts/verify-seeding.ts
```

**Expected output:** "✅ All 126 templates verified successfully"

---

### `verify-template-system.ts`
**Comprehensive system verification**

Performs extensive checks on the entire template system.

**What it does:**
- Verifies database schema
- Checks template file structure
- Validates template metadata
- Tests PDF generation
- Verifies preview images exist
- Reports overall system health

**Usage:**
```bash
ts-node scripts/verify-template-system.ts
```

---

### `verify-templates.ts`
**Template validation**

Validates individual template files and configurations.

**What it does:**
- Checks template file existence
- Validates TypeScript syntax
- Verifies template exports
- Checks category assignments

**Usage:**
```bash
ts-node scripts/verify-templates.ts
```

---

### `check-templates-debug.ts`
**Debug template rendering issues**

Debugging tool for troubleshooting template rendering problems.

**What it does:**
- Tests individual template rendering
- Generates debug output
- Identifies common issues
- Provides diagnostic information

**Usage:**
```bash
ts-node scripts/check-templates-debug.ts [template-id]
```

---

## Typical Workflow

### Initial Setup
1. `ts-node scripts/setup-templates.ts` - Initialize system
2. `npm run seed` - Seed database with templates
3. `ts-node scripts/verify-seeding.ts` - Verify seeding

### Preview Generation
1. `ts-node scripts/generate-template-previews-v2.ts` - Generate preview images
2. `ts-node scripts/update-preview-urls.ts` - Update database URLs
3. `ts-node scripts/verify-template-system.ts` - Verify everything works

### Debugging
- If a template renders incorrectly: `ts-node scripts/check-templates-debug.ts [template-id]`
- If database seems off: `ts-node scripts/verify-seeding.ts`
- For full system check: `ts-node scripts/verify-template-system.ts`

---

## Notes

- All scripts use `ts-node` to run TypeScript directly
- Scripts connect to the database configured in `.env`
- Preview generation takes 5-10 minutes for all 126 templates
- Generated images are approximately 100MB total
- Scripts are safe to run multiple times (idempotent)
