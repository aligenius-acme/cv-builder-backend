/**
 * Generate Template Thumbnails
 * Creates preview images for all templates using Puppeteer
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { uploadImage } from '../src/services/storage';

const prisma = new PrismaClient();

// Sample data for rendering templates
const SAMPLE_DATA = {
  contactInfo: {
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.dev',
  },
  summary: 'Experienced software engineer with 5+ years building scalable web applications. Passionate about clean code and user experience.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: 'Lead development of microservices architecture',
      achievements: [
        'Reduced API response time by 40% through optimization',
        'Mentored team of 5 junior developers',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2020',
      description: 'Full-stack development of customer-facing applications',
      achievements: [
        'Built React dashboard used by 10,000+ users',
        'Integrated payment processing with Stripe',
        'Improved test coverage from 60% to 95%',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California',
      location: 'Berkeley, CA',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.8',
      achievements: [
        'Dean\'s List - 4 semesters',
        'Computer Science Achievement Award',
      ],
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'expert', category: 'Languages' },
    { name: 'TypeScript', level: 'expert', category: 'Languages' },
    { name: 'Python', level: 'advanced', category: 'Languages' },
    { name: 'React', level: 'expert', category: 'Frontend' },
    { name: 'Node.js', level: 'expert', category: 'Backend' },
    { name: 'PostgreSQL', level: 'advanced', category: 'Database' },
    { name: 'AWS', level: 'intermediate', category: 'Cloud' },
    { name: 'Docker', level: 'advanced', category: 'DevOps' },
  ],
};

async function generateThumbnails() {
  console.log('🎨 Starting thumbnail generation...\n');

  try {
    // Get all templates from database
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        templateConfig: true,
      },
    });

    console.log(`📊 Found ${templates.length} templates to process\n`);

    // Launch browser
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const progress = `[${i + 1}/${templates.length}]`;

      try {
        console.log(`${progress} Generating thumbnail for: ${template.name}`);

        // Create a simple HTML preview of the template
        const html = generateTemplateHTML(template, SAMPLE_DATA);

        // Create new page
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1200 });

        // Set content
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 800,
            height: 1200,
          },
        });

        await page.close();

        // Upload to Cloudinary (convert Uint8Array to Buffer)
        const result = await uploadImage(
          Buffer.from(screenshot),
          'system', // system user ID
          `template-thumbnails/${template.id}`
        );

        // Update database with thumbnail URL
        await prisma.resumeTemplate.update({
          where: { id: template.id },
          data: { previewImageUrl: result.url },
        });

        successCount++;
        console.log(`  ✓ Uploaded: ${result.url.substring(0, 60)}...`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Add small delay to avoid rate limiting
      if (i < templates.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    await browser.close();

    console.log('\n✨ Thumbnail generation complete!');
    console.log(`   Success: ${successCount}/${templates.length}`);
    console.log(`   Errors: ${errorCount}/${templates.length}\n`);

    if (errorCount > 0) {
      console.log('⚠️  Some thumbnails failed to generate. Check errors above.');
    }
  } catch (error) {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate simple HTML preview of template
 */
function generateTemplateHTML(template: any, data: typeof SAMPLE_DATA): string {
  const config = template.templateConfig;

  // Extract color scheme
  const colors = config.colorScheme || {
    primary: '#2563eb',
    secondary: '#475569',
    text: '#0f172a',
    textLight: '#334155',
    textMuted: '#64748b',
    background: '#ffffff',
    backgroundAlt: '#f8fafc',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: ${colors.background};
      color: ${colors.text};
      padding: 40px;
      font-size: 10px;
      line-height: 1.5;
    }
    h1 { font-size: 24px; color: ${colors.primary}; margin-bottom: 8px; }
    h2 { font-size: 14px; color: ${colors.primary}; margin: 16px 0 8px 0; text-transform: uppercase; border-bottom: 2px solid ${colors.primary}; padding-bottom: 4px; }
    h3 { font-size: 11px; color: ${colors.text}; margin-bottom: 4px; font-weight: 600; }
    p { font-size: 9px; color: ${colors.textLight}; margin-bottom: 8px; }
    .contact { font-size: 9px; color: ${colors.textMuted}; margin-bottom: 16px; }
    .experience-item { margin-bottom: 14px; }
    .experience-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .company { font-size: 10px; color: ${colors.textMuted}; margin-bottom: 6px; }
    .date { font-size: 8px; color: ${colors.textLight}; }
    .achievements { padding-left: 16px; font-size: 9px; color: ${colors.textLight}; }
    .achievements li { margin-bottom: 3px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { font-size: 8px; padding: 4px 10px; background: ${colors.backgroundAlt}; border: 1px solid ${colors.primary}40; border-radius: 4px; color: ${colors.primary}; }
  </style>
</head>
<body>
  <!-- Header -->
  <h1>${data.contactInfo.name}</h1>
  <div class="contact">
    ${data.contactInfo.email} • ${data.contactInfo.phone} • ${data.contactInfo.location}
  </div>
  <p>${data.summary}</p>

  <!-- Experience -->
  <h2>Experience</h2>
  ${data.experience.map(exp => `
    <div class="experience-item">
      <div class="experience-header">
        <h3>${exp.title}</h3>
        <span class="date">${exp.startDate} - ${exp.endDate}</span>
      </div>
      <div class="company">${exp.company} • ${exp.location}</div>
      <p>${exp.description}</p>
      <ul class="achievements">
        ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <!-- Education -->
  <h2>Education</h2>
  ${data.education.map(edu => `
    <div class="experience-item">
      <div class="experience-header">
        <h3>${edu.degree}</h3>
        <span class="date">${edu.startDate} - ${edu.endDate}</span>
      </div>
      <div class="company">${edu.institution} • ${edu.location} • GPA: ${edu.gpa}</div>
    </div>
  `).join('')}

  <!-- Skills -->
  <h2>Skills</h2>
  <div class="skills">
    ${data.skills.map(skill => `<span class="skill">${skill.name}</span>`).join('')}
  </div>
</body>
</html>
  `;
}

// Run if called directly
if (require.main === module) {
  generateThumbnails();
}

export { generateThumbnails };
