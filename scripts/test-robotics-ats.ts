import { PrismaClient } from '@prisma/client';
import { fullCustomizationPipeline } from '../src/services/ai';
import { ParsedResumeData } from '../src/types';

const prisma = new PrismaClient();

async function run() {
  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: 'aligenius@gmail.com' },
    select: { id: true, email: true },
  });
  if (!user) { console.error('User not found'); process.exit(1); }

  // Get the existing Robotics version to reuse its job description
  const roboticsVersion = await prisma.resumeVersion.findFirst({
    where: { user: { email: 'aligenius@gmail.com' }, jobTitle: { contains: 'Robotics' } },
    select: { jobTitle: true, companyName: true, jobDescription: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!roboticsVersion) { console.error('Robotics version not found'); process.exit(1); }

  console.log(`\nJob: ${roboticsVersion.jobTitle} @ ${roboticsVersion.companyName}`);
  console.log(`JD length: ${roboticsVersion.jobDescription.length} chars\n`);

  // Get the test resume
  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!resume) { console.error('Resume not found'); process.exit(1); }

  console.log(`Resume: ${resume.title}\n`);
  console.log('Running pipeline...\n');

  const result = await fullCustomizationPipeline(
    resume.parsedData as unknown as ParsedResumeData,
    resume.rawText,
    roboticsVersion.jobDescription,
    roboticsVersion.jobTitle,
    roboticsVersion.companyName,
    user.id,
  );

  console.log('=== RESULTS ===');
  console.log(`ATS Score:              ${result.atsScore}`);
  console.log(`Match Strength:         ${result.matchStrength}`);
  console.log(`Keyword Match %:        ${result.atsDetails.keywordMatchPercentage}%`);
  console.log(`Matched Keywords:       ${result.atsDetails.matchedKeywords.join(', ') || '(none)'}`);
  console.log(`Missing Keywords:       ${result.atsDetails.missingKeywords.join(', ')}`);
  console.log(`\nSection Scores:`);
  Object.entries(result.atsDetails.sectionScores).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(12)}: ${v}`);
  });
  console.log(`\nHonest Assessment:\n  ${result.atsDetails.honestAssessment ?? '(none)'}`);
  console.log(`\nJob Keywords extracted: ${[...result.jobData.requiredSkills, ...result.jobData.keywords].join(', ')}`);
  console.log(`\nTruthGuard Warnings:    ${result.truthGuardWarnings.length}`);
  result.truthGuardWarnings.forEach(w => {
    console.log(`  [${w.severity.toUpperCase()}] ${w.type} — ${w.section}: ${w.concern}`);
  });

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
