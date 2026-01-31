/**
 * Simple Preview Image Generator Script
 * Generates preview images for all resume templates using Puppeteer
 *
 * This version uses a simpler approach:
 * 1. Renders templates to HTML strings
 * 2. Uses Puppeteer to screenshot
 * 3. Uses sharp to resize to thumbnail and full preview sizes
 *
 * Usage:
 *   npx ts-node scripts/generate-previews-simple.ts
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  batchSize: 5,
  outputDir: path.join(__dirname, '../../frontend/public/template-previews'),
  thumbnailSize: { width: 300, height: 400 },
  fullPreviewSize: { width: 1200, height: 1600 },
  pageSize: { width: 850, height: 1100 },
  screenshotDelay: 1000,
};

// Template metadata - all 80 templates
const TEMPLATE_METADATA = [
  // ATS Professional (15 templates)
  { id: 'corporate-standard', name: 'Corporate Standard', category: 'ats-professional' },
  { id: 'finance-professional', name: 'Finance Professional', category: 'ats-professional' },
  { id: 'legal-traditional', name: 'Legal Traditional', category: 'ats-professional' },
  { id: 'healthcare-clean', name: 'Healthcare Clean', category: 'ats-professional' },
  { id: 'consulting-classic', name: 'Consulting Classic', category: 'ats-professional' },
  { id: 'executive-formal', name: 'Executive Formal', category: 'ats-professional' },
  { id: 'business-elegant', name: 'Business Elegant', category: 'ats-professional' },
  { id: 'banking-conservative', name: 'Banking Conservative', category: 'ats-professional' },
  { id: 'insurance-professional', name: 'Insurance Professional', category: 'ats-professional' },
  { id: 'accounting-standard', name: 'Accounting Standard', category: 'ats-professional' },
  { id: 'corporate-modern', name: 'Corporate Modern', category: 'ats-professional' },
  { id: 'finance-executive', name: 'Finance Executive', category: 'ats-professional' },
  { id: 'legal-minimal', name: 'Legal Minimal', category: 'ats-professional' },
  { id: 'consulting-refined', name: 'Consulting Refined', category: 'ats-professional' },
  { id: 'professional-elite', name: 'Professional Elite', category: 'ats-professional' },

  // Tech/Startup (15 templates)
  { id: 'silicon-valley', name: 'Silicon Valley', category: 'tech-startup' },
  { id: 'developer-focused', name: 'Developer Focused', category: 'tech-startup' },
  { id: 'startup-minimal', name: 'Startup Minimal', category: 'tech-startup' },
  { id: 'tech-modern', name: 'Tech Modern', category: 'tech-startup' },
  { id: 'code-centric', name: 'Code Centric', category: 'tech-startup' },
  { id: 'product-manager', name: 'Product Manager', category: 'tech-startup' },
  { id: 'devops-engineer', name: 'DevOps Engineer', category: 'tech-startup' },
  { id: 'data-scientist', name: 'Data Scientist', category: 'tech-startup' },
  { id: 'software-architect', name: 'Software Architect', category: 'tech-startup' },
  { id: 'tech-lead', name: 'Tech Lead', category: 'tech-startup' },
  { id: 'full-stack-dev', name: 'Full Stack Developer', category: 'tech-startup' },
  { id: 'mobile-developer', name: 'Mobile Developer', category: 'tech-startup' },
  { id: 'frontend-specialist', name: 'Frontend Specialist', category: 'tech-startup' },
  { id: 'backend-engineer', name: 'Backend Engineer', category: 'tech-startup' },
  { id: 'tech-minimalist', name: 'Tech Minimalist', category: 'tech-startup' },

  // Executive/Leadership (10 templates)
  { id: 'c-suite-executive', name: 'C-Suite Executive', category: 'executive-leadership' },
  { id: 'vp-leadership', name: 'VP Leadership', category: 'executive-leadership' },
  { id: 'director-level', name: 'Director Level', category: 'executive-leadership' },
  { id: 'strategic-leader', name: 'Strategic Leader', category: 'executive-leadership' },
  { id: 'board-ready', name: 'Board Ready', category: 'executive-leadership' },
  { id: 'ceo-founder', name: 'CEO/Founder', category: 'executive-leadership' },
  { id: 'cto-technical', name: 'CTO Technical', category: 'executive-leadership' },
  { id: 'cfo-financial', name: 'CFO Financial', category: 'executive-leadership' },
  { id: 'coo-operations', name: 'COO Operations', category: 'executive-leadership' },
  { id: 'executive-minimal', name: 'Executive Minimal', category: 'executive-leadership' },

  // Academic/Research (15 templates)
  { id: 'academic-cv', name: 'Academic CV', category: 'academic-research' },
  { id: 'research-scientist', name: 'Research Scientist', category: 'academic-research' },
  { id: 'professor-tenure', name: 'Professor (Tenure Track)', category: 'academic-research' },
  { id: 'postdoc-researcher', name: 'Postdoc Researcher', category: 'academic-research' },
  { id: 'phd-candidate', name: 'PhD Candidate', category: 'academic-research' },
  { id: 'publications-focused', name: 'Publications Focused', category: 'academic-research' },
  { id: 'grants-research', name: 'Grants & Research', category: 'academic-research' },
  { id: 'teaching-focused', name: 'Teaching Focused', category: 'academic-research' },
  { id: 'stem-researcher', name: 'STEM Researcher', category: 'academic-research' },
  { id: 'humanities-scholar', name: 'Humanities Scholar', category: 'academic-research' },
  { id: 'social-sciences', name: 'Social Sciences', category: 'academic-research' },
  { id: 'medical-researcher', name: 'Medical Researcher', category: 'academic-research' },
  { id: 'lab-director', name: 'Lab Director', category: 'academic-research' },
  { id: 'academic-administrator', name: 'Academic Administrator', category: 'academic-research' },
  { id: 'interdisciplinary', name: 'Interdisciplinary', category: 'academic-research' },

  // Creative/Design (15 templates)
  { id: 'designer-portfolio', name: 'Designer Portfolio', category: 'creative-design' },
  { id: 'ux-ui-designer', name: 'UX/UI Designer', category: 'creative-design' },
  { id: 'graphic-designer', name: 'Graphic Designer', category: 'creative-design' },
  { id: 'creative-director', name: 'Creative Director', category: 'creative-design' },
  { id: 'brand-designer', name: 'Brand Designer', category: 'creative-design' },
  { id: 'product-designer', name: 'Product Designer', category: 'creative-design' },
  { id: 'motion-designer', name: 'Motion Designer', category: 'creative-design' },
  { id: 'illustrator', name: 'Illustrator', category: 'creative-design' },
  { id: 'art-director', name: 'Art Director', category: 'creative-design' },
  { id: 'web-designer', name: 'Web Designer', category: 'creative-design' },
  { id: 'visual-designer', name: 'Visual Designer', category: 'creative-design' },
  { id: 'interaction-designer', name: 'Interaction Designer', category: 'creative-design' },
  { id: 'design-systems', name: 'Design Systems', category: 'creative-design' },
  { id: 'freelance-designer', name: 'Freelance Designer', category: 'creative-design' },
  { id: 'creative-minimal', name: 'Creative Minimal', category: 'creative-design' },

  // Entry-Level/Student (10 templates)
  { id: 'college-grad', name: 'College Graduate', category: 'entry-student' },
  { id: 'intern-seeker', name: 'Intern Seeker', category: 'entry-student' },
  { id: 'recent-grad', name: 'Recent Graduate', category: 'entry-student' },
  { id: 'entry-level-tech', name: 'Entry Level Tech', category: 'entry-student' },
  { id: 'career-starter', name: 'Career Starter', category: 'entry-student' },
  { id: 'student-athlete', name: 'Student Athlete', category: 'entry-student' },
  { id: 'scholarship-focused', name: 'Scholarship Focused', category: 'entry-student' },
  { id: 'first-job', name: 'First Job', category: 'entry-student' },
  { id: 'bootcamp-grad', name: 'Bootcamp Graduate', category: 'entry-student' },
  { id: 'entry-minimal', name: 'Entry Minimal', category: 'entry-student' },
];

interface PreviewResult {
  templateId: string;
  templateName: string;
  category: string;
  success: boolean;
  thumbnailPath?: string;
  fullPreviewPath?: string;
  error?: string;
}

/**
 * Generate a simple HTML page for preview
 */
function generatePreviewHTML(templateId: string, templateName: string, category: string): string {
  // Generate simple placeholder design based on category
  const categoryColors: Record<string, { primary: string; bg: string }> = {
    'ats-professional': { primary: '#2563eb', bg: '#f8fafc' },
    'tech-startup': { primary: '#8b5cf6', bg: '#faf5ff' },
    'executive-leadership': { primary: '#0f172a', bg: '#f1f5f9' },
    'academic-research': { primary: '#059669', bg: '#f0fdf4' },
    'creative-design': { primary: '#ec4899', bg: '#fdf2f8' },
    'entry-student': { primary: '#f59e0b', bg: '#fffbeb' },
  };

  const colors = categoryColors[category] || categoryColors['ats-professional'];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      padding: 40px 50px;
      width: 850px;
      min-height: 1100px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${colors.primary};
    }
    .name {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .contact {
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: ${colors.primary};
      text-transform: uppercase;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    .content-block {
      margin-bottom: 15px;
    }
    .job-title {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .company {
      font-size: 11px;
      color: #666;
      margin-bottom: 6px;
    }
    .description {
      font-size: 10px;
      color: #4b5563;
      line-height: 1.5;
      margin-left: 15px;
    }
    ul {
      margin: 8px 0 0 30px;
      padding: 0;
    }
    li {
      font-size: 10px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 4px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-tag {
      background: ${colors.bg};
      color: ${colors.primary};
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }
    .watermark {
      position: absolute;
      bottom: 20px;
      right: 50px;
      font-size: 8px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">Sample Candidate Name</div>
    <div class="contact">
      email@example.com • (555) 123-4567 • City, State • linkedin.com/in/profile
    </div>
  </div>

  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="description">
      Results-driven professional with 5+ years of experience delivering exceptional results.
      Proven track record of success in fast-paced environments. Strong analytical and
      problem-solving skills with attention to detail.
    </p>
  </div>

  <div class="section">
    <div class="section-title">Professional Experience</div>
    <div class="content-block">
      <div class="job-title">Senior Position Title</div>
      <div class="company">Company Name • City, State • 2021 - Present</div>
      <ul>
        <li>Led key initiatives resulting in measurable improvements and team success</li>
        <li>Collaborated with cross-functional teams to deliver high-impact projects</li>
        <li>Implemented best practices improving efficiency and quality metrics</li>
      </ul>
    </div>
    <div class="content-block">
      <div class="job-title">Mid-Level Position Title</div>
      <div class="company">Previous Company • City, State • 2019 - 2021</div>
      <ul>
        <li>Developed and executed strategies driving growth and innovation</li>
        <li>Managed projects from conception through successful completion</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    <div class="content-block">
      <div class="job-title">Degree Name</div>
      <div class="company">University Name • City, State • Graduation Year</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      <span class="skill-tag">Skill Area 1</span>
      <span class="skill-tag">Skill Area 2</span>
      <span class="skill-tag">Skill Area 3</span>
      <span class="skill-tag">Skill Area 4</span>
      <span class="skill-tag">Skill Area 5</span>
      <span class="skill-tag">Skill Area 6</span>
    </div>
  </div>

  <div class="watermark">${templateName}</div>
</body>
</html>
  `;
}

/**
 * Generate preview for a single template
 */
async function generatePreview(
  browser: any,
  template: typeof TEMPLATE_METADATA[0],
  sharp: any
): Promise<PreviewResult> {
  const result: PreviewResult = {
    templateId: template.id,
    templateName: template.name,
    category: template.category,
    success: false,
  };

  let page: any = null;

  try {
    console.log(`  Processing: ${template.name}`);

    // Generate HTML
    const html = generatePreviewHTML(template.id, template.name, template.category);

    // Create page
    page = await browser.newPage();
    await page.setViewport({
      width: CONFIG.pageSize.width,
      height: CONFIG.pageSize.height,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, CONFIG.screenshotDelay));

    // Take screenshot
    const screenshot = await page.screenshot({ type: 'png', fullPage: false });

    // Save full preview
    const fullPath = path.join(CONFIG.outputDir, 'full', `${template.id}-full.png`);
    await sharp(screenshot)
      .resize(CONFIG.fullPreviewSize.width, CONFIG.fullPreviewSize.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(fullPath);
    result.fullPreviewPath = fullPath;

    // Save thumbnail
    const thumbPath = path.join(CONFIG.outputDir, 'thumbnails', `${template.id}-thumb.png`);
    await sharp(screenshot)
      .resize(CONFIG.thumbnailSize.width, CONFIG.thumbnailSize.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(thumbPath);
    result.thumbnailPath = thumbPath;

    result.success = true;
    console.log(`    ✓ Generated`);
  } catch (error: any) {
    console.error(`    ✗ Error: ${error.message}`);
    result.error = error.message;
  } finally {
    if (page) await page.close();
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Resume Template Preview Generator');
  console.log('='.repeat(80));
  console.log(`\nTotal templates: ${TEMPLATE_METADATA.length}`);
  console.log(`Output directory: ${CONFIG.outputDir}\n`);

  // Check for sharp
  let sharp: any;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Error: sharp is required. Install with: npm install sharp');
    process.exit(1);
  }

  // Ensure directories exist
  const thumbDir = path.join(CONFIG.outputDir, 'thumbnails');
  const fullDir = path.join(CONFIG.outputDir, 'full');
  [thumbDir, fullDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Launch browser
  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const startTime = Date.now();
  const results: PreviewResult[] = [];

  try {
    // Process in batches
    for (let i = 0; i < TEMPLATE_METADATA.length; i += CONFIG.batchSize) {
      const batch = TEMPLATE_METADATA.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(TEMPLATE_METADATA.length / CONFIG.batchSize);

      console.log(`\nBatch ${batchNum}/${totalBatches}:`);

      for (const template of batch) {
        const result = await generatePreview(browser, template, sharp);
        results.push(result);
      }

      // Delay between batches
      if (i + CONFIG.batchSize < TEMPLATE_METADATA.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await browser.close();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('Summary');
  console.log('='.repeat(80));
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nTotal: ${results.length}`);
  console.log(`✓ Success: ${successful.length}`);
  console.log(`✗ Failed: ${failed.length}`);
  console.log(`Time: ${duration}s`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach(r => console.log(`  - ${r.templateName}: ${r.error}`));
  }

  // Save results
  const resultsPath = path.join(CONFIG.outputDir, 'generation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved: ${resultsPath}\n`);
}

// Run
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { main as generatePreviews };
