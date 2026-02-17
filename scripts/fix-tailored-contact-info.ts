/**
 * Fix all existing tailored resume versions to use correct contact information
 * from their parent resumes instead of placeholder data like "John Doe"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTailoredContactInfo() {
  console.log('🔧 Fixing tailored resume contact information...\n');

  // Get all resume versions
  const versions = await prisma.resumeVersion.findMany({
    include: {
      resume: true,
    },
  });

  console.log(`📊 Found ${versions.length} tailored versions\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const version of versions) {
    const tailoredData = version.tailoredData as any;
    const originalData = version.resume.parsedData as any;

    if (!tailoredData || !originalData) {
      console.log(`⚠️  Skipping version ${version.id} - missing data`);
      skippedCount++;
      continue;
    }

    const tailoredContact = tailoredData.contact || {};
    const originalContact = originalData.contact || {};

    // Check if contact info needs fixing (has placeholder data or is different from original)
    const needsFix =
      tailoredContact.name !== originalContact.name ||
      tailoredContact.email !== originalContact.email ||
      tailoredContact.phone !== originalContact.phone;

    if (!needsFix) {
      skippedCount++;
      continue;
    }

    console.log(`🔄 Fixing version ${version.versionNumber} for "${version.jobTitle || 'Unknown Job'}"`);
    console.log(`   Before: ${tailoredContact.name} (${tailoredContact.email})`);
    console.log(`   After:  ${originalContact.name} (${originalContact.email})`);

    // Update tailored data with correct contact info
    const updatedTailoredData = {
      ...tailoredData,
      contact: {
        ...tailoredContact,
        ...originalContact, // Override with original contact info
        photoUrl: version.resume.photoUrl || originalContact.photoUrl, // Include photo from resume
      },
    };

    // Update the version in database
    await prisma.resumeVersion.update({
      where: { id: version.id },
      data: {
        tailoredData: updatedTailoredData,
      },
    });

    fixedCount++;
  }

  console.log(`\n✅ Fix complete!`);
  console.log(`   Fixed: ${fixedCount} versions`);
  console.log(`   Skipped: ${skippedCount} versions (already correct or missing data)`);

  await prisma.$disconnect();
}

fixTailoredContactInfo()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
