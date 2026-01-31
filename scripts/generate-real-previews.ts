import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

const prisma = new PrismaClient();

// Sample data for rendering templates
const sampleData = {
  contact: {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    website: 'alexjohnson.com',
  },
  summary: 'Results-driven professional with 5+ years of experience in software development and project management. Proven track record of delivering high-quality solutions and leading cross-functional teams.',
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2021-01',
      endDate: '2024-01',
      current: false,
      description: [
        'Led development of microservices architecture serving 1M+ users',
        'Reduced system latency by 40% through optimization initiatives',
        'Mentored team of 5 junior developers',
      ],
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: '2019-06',
      endDate: '2021-01',
      current: false,
      description: [
        'Built full-stack web applications using React and Node.js',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California',
      location: 'Berkeley, CA',
      graduationDate: '2019-05',
      gpa: '3.8',
      highlights: ['Dean\'s List', 'Graduated with Honors'],
    },
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'PostgreSQL', 'Git', 'Agile/Scrum',
  ],
  projects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Built scalable e-commerce platform processing $1M+ in transactions',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      url: 'github.com/alexjohnson/ecommerce',
    },
  ],
  certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional'],
  languages: ['English (Native)', 'Spanish (Professional)'],
  awards: ['Employee of the Year 2023', 'Innovation Award 2022'],
};

// Default color palette
const defaultColors = {
  primary: '#1e3a8a',
  secondary: '#64748b',
  accent: '#3b82f6',
  text: '#1f2937',
  background: '#ffffff',
};

async function generatePreview(
  templateId: string,
  templateName: string,
  category: string
): Promise<boolean> {
  try {
    console.log(`  Generating preview for: ${templateName} (${templateId})`);

    // Try to import the template
    let TemplateComponent;
    try {
      const categoryMap: Record<string, string> = {
        'ats-professional': 'ats-professional',
        'tech-startup': 'tech-startup',
        'creative-design': 'creative-design',
        'academic-research': 'academic-research',
        'entry-student': 'entry-student',
        'executive-leadership': 'executive-leadership',
      };

      const categoryPath = categoryMap[category] || 'ats-professional';

      // Try to import the specific template
      const templateModule = await import(`../src/templates/${categoryPath}/${templateName.replace(/[^a-zA-Z0-9]/g, '')}.tsx`);
      TemplateComponent = templateModule.default || templateModule[Object.keys(templateModule)[0]];
    } catch (error) {
      console.log(`    ⚠️  Template component not found, using placeholder`);
      return false;
    }

    if (!TemplateComponent) {
      console.log(`    ⚠️  No component exported`);
      return false;
    }

    // Render the React component to HTML
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TemplateComponent, {
        data: sampleData,
        colors: defaultColors,
      })
    );

    // Wrap in full HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              background: white;
              width: 850px;
              padding: 48px;
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;

    // Use Puppeteer to render and screenshot
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({ width: 850, height: 1100, deviceScaleFactor: 2 });
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Take screenshot
    const thumbnailPath = path.join(
      __dirname,
      '../../frontend/public/template-previews/thumbnails',
      `${templateId}-thumb.png`
    );

    await page.screenshot({
      path: thumbnailPath,
      clip: { x: 0, y: 0, width: 850, height: 1100 },
    });

    // Resize to thumbnail
    // Note: You might want to use sharp or another image library for better resizing
    // For now, we'll just save the full screenshot

    await browser.close();

    console.log(`    ✅ Preview generated`);
    return true;
  } catch (error) {
    console.error(`    ❌ Error generating preview for ${templateId}:`, error);
    return false;
  }
}

async function main() {
  console.log('🎨 Generating Real Template Previews...\n');

  // Get all templates from database
  const templates = await prisma.resumeTemplate.findMany({
    select: {
      id: true,
      name: true,
      primaryCategory: true,
    },
  });

  console.log(`Found ${templates.length} templates\n`);

  let successCount = 0;
  let failureCount = 0;

  // Process templates by category
  const categories = [...new Set(templates.map(t => t.primaryCategory).filter(Boolean))];

  for (const category of categories) {
    const categoryTemplates = templates.filter(t => t.primaryCategory === category);
    console.log(`\n📂 ${category?.toUpperCase()} (${categoryTemplates.length} templates):`);

    for (const template of categoryTemplates) {
      const success = await generatePreview(
        template.id,
        template.name,
        template.primaryCategory || 'ats-professional'
      );

      if (success) successCount++;
      else failureCount++;
    }
  }

  await prisma.$disconnect();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Preview Generation Complete!');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${templates.length}`);
}

main().catch(console.error);
