/**
 * Generate template thumbnails locally and upload them to Cloudinary.
 *
 * Usage (from backend/ directory):
 *   npx ts-node --transpile-only scripts/upload-thumbnails.ts
 *
 * Requires a local .env with DATABASE_URL, CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 *
 * Thumbnails are stored at: cv-builder/thumbnails/<templateId>.jpg
 * The template's previewImageUrl is updated in the DB.
 * Already-uploaded templates are skipped unless --force is passed.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { generateTemplateThumbnail } from '../src/services/react-pdf-generator';

const prisma = new PrismaClient();
const FORCE = process.argv.includes('--force');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBuffer(buffer: Buffer, templateId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'cv-builder/thumbnails',
          public_id: templateId,
          format: 'jpg',
          overwrite: true,
          resource_type: 'image',
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('No result'));
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

async function main() {
  const templates = await prisma.resumeTemplate.findMany({
    select: { id: true, name: true, previewImageUrl: true },
    orderBy: { name: 'asc' },
    ...(ONLY ? { where: { id: ONLY } } : {}),
  });

  console.log(`Found ${templates.length} templates${ONLY ? ` (filtered to: ${ONLY})` : ''}`);
  console.log(`Mode: ${FORCE ? 'force re-upload all' : 'skip already-uploaded'}\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const template of templates) {
    const alreadyUploaded =
      !FORCE &&
      template.previewImageUrl &&
      template.previewImageUrl.includes('cloudinary.com');

    if (alreadyUploaded) {
      console.log(`  skip  ${template.id}`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  gen   ${template.id} ... `);
      const buffer = await generateTemplateThumbnail(template.id);

      process.stdout.write(`upload ... `);
      const url = await uploadBuffer(buffer, template.id);

      await prisma.resumeTemplate.update({
        where: { id: template.id },
        data: { previewImageUrl: url },
      });

      console.log(`done`);
      console.log(`        → ${url}`);
      uploaded++;
    } catch (err) {
      console.log(`FAILED`);
      console.error(`        ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\nDone. uploaded=${uploaded}  skipped=${skipped}  failed=${failed}`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
