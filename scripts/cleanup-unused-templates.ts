import fs from 'fs';
import path from 'path';

const templatesDir = path.join(__dirname, '../src/templates');

// Directories and files to KEEP (shared components and core files)
const keepItems = [
  'shared',        // Shared components used by template renderer
  'index.ts',      // Template registry
  '__tests__',     // Tests
];

// Directories to REMOVE (old template files not used anymore)
const removeItems = [
  'academic-research',
  'ats-professional',
  'creative-design',
  'entry-student',
  'executive-leadership',
  'creative',
  'modern',
  'professional',
  'simple',
  'partials',
  'asymmetric',
  'COMPONENTS.md',
  'README.md',
  'README-DOCX.md',
];

async function cleanup() {
  console.log('🗑️  Cleaning up unused template files...\n');

  let removedCount = 0;
  let keptCount = 0;

  for (const item of removeItems) {
    const itemPath = path.join(templatesDir, item);

    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Count files in directory
        const countFiles = (dir: string): number => {
          let count = 0;
          const items = fs.readdirSync(dir);
          for (const i of items) {
            const p = path.join(dir, i);
            const s = fs.statSync(p);
            if (s.isDirectory()) {
              count += countFiles(p);
            } else {
              count++;
            }
          }
          return count;
        };

        const fileCount = countFiles(itemPath);
        console.log(`📁 Removing directory: ${item} (${fileCount} files)`);
        fs.rmSync(itemPath, { recursive: true, force: true });
        removedCount += fileCount;
      } else {
        console.log(`📄 Removing file: ${item}`);
        fs.unlinkSync(itemPath);
        removedCount++;
      }
    }
  }

  // Count kept items
  console.log('\n✅ Kept items:');
  for (const item of keepItems) {
    const itemPath = path.join(templatesDir, item);
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        const items = fs.readdirSync(itemPath, { recursive: true });
        const fileCount = items.filter(i => {
          const p = path.join(itemPath, i.toString());
          return fs.statSync(p).isFile();
        }).length;
        console.log(`   📁 ${item}/ (${fileCount} files)`);
        keptCount += fileCount;
      } else {
        console.log(`   📄 ${item}`);
        keptCount++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   🗑️  Removed: ${removedCount} files`);
  console.log(`   ✅ Kept: ${keptCount} files (shared components)`);
  console.log(`\n✅ Cleanup complete!`);
}

cleanup().catch(console.error);
