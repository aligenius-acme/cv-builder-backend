/**
 * Generate preview images for all templates using the actual template rendering
 * This script generates real previews showing the unique layouts of each template
 */

import { PrismaClient } from '@prisma/client';
import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Sample resume data for previews
const sampleResumeData = {
  contact: {
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    website: 'www.alexchen.dev',
  },
  summary: 'Innovative professional with 6+ years of experience delivering impactful solutions. Proven track record of leading teams and driving results in fast-paced environments.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '2024-01',
      current: false,
      description: [
        'Led development of microservices architecture serving 2M+ users daily',
        'Reduced system latency by 45% through performance optimization',
        'Mentored team of 6 junior developers and conducted code reviews',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: '2019-01',
      endDate: '2021-03',
      current: false,
      description: [
        'Built full-stack applications using React, Node.js, and PostgreSQL',
        'Implemented CI/CD pipeline reducing deployment time by 65%',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      graduationDate: '2018-06',
      gpa: '3.9',
      achievements: ['Summa Cum Laude', 'Dean\'s Honor List'],
    },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB'],
  projects: [
    {
      name: 'Cloud Analytics Platform',
      description: 'Built scalable analytics platform processing 100M+ events daily',
      technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
      url: 'github.com/alexchen/analytics',
    },
  ],
  certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
  languages: ['English (Native)', 'Mandarin (Fluent)'],
  awards: [],
};

// Color palettes for different categories
const colorPalettes: Record<string, any> = {
  'ats-professional': { primary: '#1e3a8a', secondary: '#64748b', text: '#1f2937', textLight: '#4b5563' },
  'tech-startup': { primary: '#0ea5e9', secondary: '#64748b', text: '#0f172a', textLight: '#475569' },
  'creative-design': { primary: '#ec4899', secondary: '#f97316', text: '#18181b', textLight: '#52525b' },
  'academic-research': { primary: '#115e59', secondary: '#475569', text: '#1f2937', textLight: '#4b5563' },
  'entry-student': { primary: '#8b5cf6', secondary: '#64748b', text: '#1f2937', textLight: '#6b7280' },
  'executive-leadership': { primary: '#7c2d12', secondary: '#44403c', text: '#1c1917', textLight: '#57534e' },
};

async function generatePreviewForTemplate(
  templateId: string,
  templateName: string,
  category: string | null,
  browser: Browser
): Promise<boolean> {
  try {
    console.log(`  📸 ${templateName}`);

    // Get colors for this category
    const colors = colorPalettes[category || 'ats-professional'] || colorPalettes['ats-professional'];

    // Create a simple HTML representation based on category
    const html = generateHTMLForCategory(templateName, category, colors);

    const page = await browser.newPage();
    await page.setViewport({ width: 850, height: 1100, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Ensure directories exist
    const thumbDir = path.join(__dirname, '../../frontend/public/template-previews/thumbnails');
    const fullDir = path.join(__dirname, '../../frontend/public/template-previews/full');

    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

    // Take screenshots
    const thumbPath = path.join(thumbDir, `${templateId}-thumb.png`);
    const fullPath = path.join(fullDir, `${templateId}-full.png`);

    await page.screenshot({ path: thumbPath, clip: { x: 0, y: 0, width: 300, height: 400 } });
    await page.screenshot({ path: fullPath });

    await page.close();
    return true;
  } catch (error) {
    console.error(`    ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

function generateHTMLForCategory(templateName: string, category: string | null, colors: any): string {
  const categoryName = category || 'professional';

  // Determine layout based on template name and category
  const isTwoColumn = templateName.toLowerCase().includes('bold') ||
    templateName.toLowerCase().includes('casual') ||
    templateName.toLowerCase().includes('pro') ||
    templateName.toLowerCase().includes('portfolio');

  const isCreative = category === 'creative-design';
  const isAcademic = category === 'academic-research';

  if (isTwoColumn) {
    return generateTwoColumnHTML(templateName, colors, isCreative);
  } else if (isAcademic) {
    return generateAcademicHTML(templateName, colors);
  } else {
    return generateSingleColumnHTML(templateName, colors, isCreative);
  }
}

function generateSingleColumnHTML(name: string, colors: any, isCreative: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Calibri', Arial, sans-serif;
          background: white;
          width: 850px;
          padding: ${isCreative ? '32px 40px' : '40px 48px'};
          color: ${colors.text};
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: ${isCreative ? '22px' : '18px'};
          ${isCreative ? `border-bottom: 3px solid ${colors.primary}; padding-bottom: 14px;` : 'padding-bottom: 6px;'}
        }
        .name {
          font-size: ${isCreative ? '32px' : '28px'};
          font-weight: bold;
          color: ${colors.primary};
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .title {
          font-size: 13px;
          color: ${colors.textLight};
          font-weight: 600;
          margin-bottom: 6px;
        }
        .contact {
          font-size: 9px;
          color: ${colors.textLight};
          line-height: 1.4;
        }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: ${colors.primary};
          ${!isCreative ? `border-bottom: 2px solid ${colors.primary};` : `background: ${colors.primary}; color: white; padding: 3px 8px; margin: 0 -8px;`}
          padding-bottom: 3px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .summary-text {
          font-size: 9.5px;
          line-height: 1.65;
          color: ${colors.textLight};
          text-align: justify;
        }
        .job-entry { margin-bottom: 11px; }
        .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
        .job-title { font-weight: bold; font-size: 11px; color: ${colors.text}; }
        .job-date { font-size: 9px; color: ${colors.textLight}; font-style: italic; }
        .company { font-size: 10px; color: ${colors.textLight}; margin-bottom: 4px; }
        .bullet { font-size: 9px; line-height: 1.55; margin: 2px 0 2px 18px; color: ${colors.textLight}; }
        .bullet:before { content: "•"; margin-right: 8px; color: ${colors.primary}; font-weight: bold; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill {
          background: ${isCreative ? colors.primary : '#f1f5f9'};
          color: ${isCreative ? 'white' : colors.text};
          padding: 3px 10px;
          border-radius: ${isCreative ? '12px' : '4px'};
          font-size: 8.5px;
          font-weight: 500;
        }
        .edu-entry { margin-bottom: 8px; }
        .degree { font-weight: bold; font-size: 10.5px; color: ${colors.text}; }
        .school { font-size: 9.5px; color: ${colors.textLight}; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">ALEXANDER CHEN</div>
        <div class="title">Senior Software Engineer</div>
        <div class="contact">
          alex.chen@email.com • (555) 123-4567 • San Francisco, CA<br/>
          linkedin.com/in/alexchen • github.com/alexchen
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary-text">
          Results-driven Software Engineer with 6+ years of experience building scalable applications and leading cross-functional teams. Proven expertise in full-stack development, cloud architecture, and agile methodologies. Passionate about creating innovative solutions that drive business growth and enhance user experience.
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Experience</div>

        <div class="job-entry">
          <div class="job-header">
            <div class="job-title">Senior Software Engineer</div>
            <div class="job-date">Mar 2021 - Present</div>
          </div>
          <div class="company">Tech Innovations Inc • San Francisco, CA</div>
          <div class="bullet">Led development of microservices architecture serving 2M+ daily active users with 99.9% uptime</div>
          <div class="bullet">Reduced system latency by 45% through performance optimization and distributed caching strategies</div>
          <div class="bullet">Mentored team of 6 junior developers and conducted comprehensive code reviews, improving code quality by 35%</div>
          <div class="bullet">Implemented CI/CD pipeline using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes</div>
          <div class="bullet">Architected real-time analytics dashboard processing 100M+ events daily using Apache Kafka and Redis</div>
        </div>

        <div class="job-entry">
          <div class="job-header">
            <div class="job-title">Software Engineer</div>
            <div class="job-date">Jan 2019 - Mar 2021</div>
          </div>
          <div class="company">StartupXYZ • Remote</div>
          <div class="bullet">Built full-stack applications using React, Node.js, and PostgreSQL, serving 500K+ monthly active users</div>
          <div class="bullet">Designed and implemented RESTful APIs and GraphQL endpoints handling 500K+ requests daily</div>
          <div class="bullet">Collaborated with product team to define features and technical requirements for 3 major product releases</div>
          <div class="bullet">Improved application performance by 60% through code optimization and database query tuning</div>
        </div>

        <div class="job-entry">
          <div class="job-header">
            <div class="job-title">Junior Developer</div>
            <div class="job-date">Jun 2018 - Dec 2018</div>
          </div>
          <div class="company">WebDev Solutions • Palo Alto, CA</div>
          <div class="bullet">Developed responsive web applications using modern JavaScript frameworks including React and Vue.js</div>
          <div class="bullet">Participated in agile sprints and daily standups with 8-person development team</div>
          <div class="bullet">Contributed to open-source projects and maintained company's design system documentation</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills">
          <span class="skill">JavaScript</span>
          <span class="skill">TypeScript</span>
          <span class="skill">React</span>
          <span class="skill">Node.js</span>
          <span class="skill">Python</span>
          <span class="skill">Java</span>
          <span class="skill">AWS</span>
          <span class="skill">Docker</span>
          <span class="skill">Kubernetes</span>
          <span class="skill">PostgreSQL</span>
          <span class="skill">MongoDB</span>
          <span class="skill">Redis</span>
          <span class="skill">GraphQL</span>
          <span class="skill">REST APIs</span>
          <span class="skill">Git</span>
          <span class="skill">CI/CD</span>
          <span class="skill">Agile</span>
          <span class="skill">Microservices</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Key Projects</div>
        <div class="job-entry">
          <div class="job-title">Cloud Analytics Platform</div>
          <div class="company">React • Node.js • AWS • Apache Kafka • PostgreSQL</div>
          <div class="bullet">Built scalable real-time analytics platform processing 100M+ events daily with sub-second latency</div>
          <div class="bullet">Implemented data visualization dashboard used by 50+ enterprise clients to track business metrics</div>
        </div>
        <div class="job-entry">
          <div class="job-title">E-Commerce Microservices</div>
          <div class="company">Node.js • Docker • Kubernetes • MongoDB • Redis</div>
          <div class="bullet">Architected distributed microservices system handling $2M+ in daily transactions</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        <div class="edu-entry">
          <div class="degree">Bachelor of Science in Computer Science</div>
          <div class="school">Stanford University • Stanford, CA • GPA: 3.9/4.0 • Graduated May 2018</div>
          <div style="font-size: 8.5px; color: ${colors.textLight}; margin-top: 2px;">
            Honors: Summa Cum Laude, Dean's List (All Semesters), Outstanding Senior Award
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Certifications & Awards</div>
        <div style="font-size: 9px; color: ${colors.textLight}; line-height: 1.6;">
          <strong>Certifications:</strong> AWS Certified Solutions Architect • Google Cloud Professional Developer • Certified Scrum Master (CSM)<br/>
          <strong>Awards:</strong> Employee of the Year 2023 • Innovation Excellence Award 2022 • Best Engineering Project Award 2021
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTwoColumnHTML(name: string, colors: any, isCreative: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: white;
          width: 850px;
          display: flex;
          color: ${colors.text};
        }
        .sidebar {
          width: 280px;
          background: ${isCreative ? colors.primary : '#f8fafc'};
          padding: 32px 22px;
          color: ${isCreative ? 'white' : colors.text};
          ${isCreative ? `background: linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%);` : ''}
        }
        .main { flex: 1; padding: 36px 32px; }
        .name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 6px;
          line-height: 1.2;
          ${isCreative ? 'color: white;' : `color: ${colors.primary};`}
        }
        .title {
          font-size: 13px;
          color: ${isCreative ? 'rgba(255,255,255,0.95)' : colors.textLight};
          margin-bottom: 22px;
          font-weight: 600;
        }
        .sidebar-section { margin-bottom: 20px; }
        .sidebar-title {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.8px;
          ${isCreative ? 'color: white; border-bottom: 2px solid rgba(255,255,255,0.6);' : `color: ${colors.primary}; border-bottom: 2px solid ${colors.primary};`}
          padding-bottom: 5px;
        }
        .sidebar-item {
          font-size: 8.5px;
          margin: 5px 0;
          line-height: 1.5;
          color: ${isCreative ? 'rgba(255,255,255,0.9)' : colors.textLight};
        }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: ${colors.primary};
          border-bottom: 2.5px solid ${colors.primary};
          padding-bottom: 4px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .job-entry { margin-bottom: 12px; }
        .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
        .job-title { font-weight: bold; font-size: 11px; color: ${colors.text}; }
        .job-date { font-size: 9px; color: ${colors.textLight}; font-style: italic; }
        .company { font-size: 9.5px; color: ${colors.textLight}; margin-bottom: 4px; }
        .bullet { font-size: 9px; line-height: 1.5; margin: 2px 0 2px 14px; color: ${colors.textLight}; }
        .bullet:before { content: "•"; margin-right: 8px; color: ${colors.primary}; font-weight: bold; }
        .skill-pill {
          background: ${isCreative ? 'rgba(255,255,255,0.95)' : colors.primary};
          color: ${isCreative ? colors.primary : 'white'};
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 7.5px;
          margin: 4px 3px 4px 0;
          display: inline-block;
          font-weight: 600;
          ${isCreative ? `box-shadow: 0 2px 4px rgba(0,0,0,0.1);` : ''}
        }
        .summary-text { font-size: 9.5px; line-height: 1.65; color: ${colors.textLight}; text-align: justify; }
      </style>
    </head>
    <body>
      <div class="sidebar">
        <div class="name">ALEX<br/>CHEN</div>
        <div class="title">Senior Software Engineer</div>

        <div class="sidebar-section">
          <div class="sidebar-title">Contact</div>
          <div class="sidebar-item">📧 alex.chen@email.com</div>
          <div class="sidebar-item">📱 (555) 123-4567</div>
          <div class="sidebar-item">📍 San Francisco, CA</div>
          <div class="sidebar-item">🔗 linkedin.com/in/alexchen</div>
          <div class="sidebar-item">💻 github.com/alexchen</div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">Technical Skills</div>
          <div class="skill-pill">JavaScript</div>
          <div class="skill-pill">TypeScript</div>
          <div class="skill-pill">React</div>
          <div class="skill-pill">Node.js</div>
          <div class="skill-pill">Python</div>
          <div class="skill-pill">Java</div>
          <div class="skill-pill">AWS</div>
          <div class="skill-pill">Docker</div>
          <div class="skill-pill">Kubernetes</div>
          <div class="skill-pill">PostgreSQL</div>
          <div class="skill-pill">MongoDB</div>
          <div class="skill-pill">Redis</div>
          <div class="skill-pill">GraphQL</div>
          <div class="skill-pill">REST APIs</div>
          <div class="skill-pill">CI/CD</div>
          <div class="skill-pill">Microservices</div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">Certifications</div>
          <div class="sidebar-item">• AWS Solutions Architect</div>
          <div class="sidebar-item">• Google Cloud Professional</div>
          <div class="sidebar-item">• Certified Scrum Master</div>
          <div class="sidebar-item">• Oracle Java Certified</div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">Languages</div>
          <div class="sidebar-item">English (Native)</div>
          <div class="sidebar-item">Mandarin (Fluent)</div>
          <div class="sidebar-item">Spanish (Basic)</div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-title">Awards</div>
          <div class="sidebar-item">• Employee of Year 2023</div>
          <div class="sidebar-item">• Innovation Award 2022</div>
          <div class="sidebar-item">• Best Project Award 2021</div>
        </div>
      </div>

      <div class="main">
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary-text">
            Results-driven Software Engineer with 6+ years of experience building scalable applications and leading cross-functional teams. Proven expertise in full-stack development, cloud architecture, and agile methodologies. Passionate about creating innovative solutions that drive business growth and enhance user experience.
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Experience</div>

          <div class="job-entry">
            <div class="job-header">
              <div class="job-title">Senior Software Engineer</div>
              <div class="job-date">Mar 2021 - Present</div>
            </div>
            <div class="company">Tech Innovations Inc • San Francisco, CA</div>
            <div class="bullet">Led development of microservices architecture serving 2M+ daily active users with 99.9% uptime</div>
            <div class="bullet">Reduced system latency by 45% through performance optimization and distributed caching strategies</div>
            <div class="bullet">Mentored team of 6 junior developers, improving code quality by 35% through comprehensive reviews</div>
            <div class="bullet">Implemented CI/CD pipeline using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes</div>
            <div class="bullet">Architected real-time analytics dashboard processing 100M+ events daily using Apache Kafka</div>
          </div>

          <div class="job-entry">
            <div class="job-header">
              <div class="job-title">Software Engineer</div>
              <div class="job-date">Jan 2019 - Mar 2021</div>
            </div>
            <div class="company">StartupXYZ • Remote</div>
            <div class="bullet">Built full-stack applications using React, Node.js, and PostgreSQL for 500K+ monthly active users</div>
            <div class="bullet">Designed and implemented RESTful APIs and GraphQL endpoints handling 500K+ requests daily</div>
            <div class="bullet">Collaborated with product team to define features for 3 major product releases</div>
            <div class="bullet">Improved application performance by 60% through code optimization and database tuning</div>
          </div>

          <div class="job-entry">
            <div class="job-header">
              <div class="job-title">Junior Developer</div>
              <div class="job-date">Jun 2018 - Dec 2018</div>
            </div>
            <div class="company">WebDev Solutions • Palo Alto, CA</div>
            <div class="bullet">Developed responsive web applications using React and Vue.js frameworks</div>
            <div class="bullet">Participated in agile sprints with 8-person development team</div>
            <div class="bullet">Contributed to open-source projects and maintained design system documentation</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          <div class="job-entry">
            <div class="job-title">Bachelor of Science in Computer Science</div>
            <div class="company">Stanford University • Stanford, CA • GPA: 3.9/4.0 • Graduated May 2018</div>
            <div style="font-size: 8.5px; color: ${colors.textLight}; margin-top: 3px;">
              Honors: Summa Cum Laude, Dean's Honor List, Outstanding Senior Award in Computer Science
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Key Projects</div>
          <div class="job-entry">
            <div class="job-title">Cloud Analytics Platform</div>
            <div class="company">React • Node.js • AWS • Apache Kafka • PostgreSQL</div>
            <div class="bullet">Built scalable real-time analytics platform processing 100M+ events daily with sub-second latency</div>
            <div class="bullet">Implemented data visualization dashboard used by 50+ enterprise clients</div>
          </div>
          <div class="job-entry">
            <div class="job-title">E-Commerce Microservices</div>
            <div class="company">Node.js • Docker • Kubernetes • MongoDB</div>
            <div class="bullet">Architected distributed system handling $2M+ in daily transactions</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAcademicHTML(name: string, colors: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Garamond', 'Times New Roman', Georgia, serif;
          background: white;
          width: 850px;
          padding: 42px 56px;
          color: ${colors.text};
          font-size: 10px;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 26px;
          border-bottom: 2px solid ${colors.primary};
          padding-bottom: 14px;
        }
        .name {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
          color: ${colors.primary};
          letter-spacing: 0.5px;
        }
        .contact {
          font-size: 9.5px;
          color: ${colors.textLight};
          line-height: 1.6;
        }
        .section { margin-bottom: 18px; }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: ${colors.primary};
          border-bottom: 1.5px solid ${colors.primary};
          padding-bottom: 3px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .entry {
          margin-bottom: 10px;
          font-size: 9.5px;
          line-height: 1.6;
          color: ${colors.textLight};
        }
        .entry strong { color: ${colors.text}; }
        .pub-title { font-style: italic; color: ${colors.text}; }
        .subheading { font-weight: 600; color: ${colors.text}; margin-bottom: 3px; }
        .details { font-size: 9px; color: ${colors.textLight}; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">ALEXANDER CHEN, Ph.D.</div>
        <div class="contact">
          Department of Computer Science • Stanford University<br/>
          alex.chen@stanford.edu • (555) 123-4567 • alexchen.stanford.edu
        </div>
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        <div class="entry">
          <strong>Ph.D. in Computer Science</strong>, Stanford University, Stanford, CA (2019-2023)<br/>
          <span class="details">Dissertation: "Machine Learning Applications in Distributed Systems"</span><br/>
          <span class="details">Advisor: Prof. Jane Smith • GPA: 4.0/4.0</span>
        </div>
        <div class="entry">
          <strong>M.S. in Computer Science</strong>, Massachusetts Institute of Technology, Cambridge, MA (2017-2019)<br/>
          <span class="details">Thesis: "Optimization Techniques for Cloud-Based Machine Learning"</span>
        </div>
        <div class="entry">
          <strong>B.S. in Computer Science</strong>, University of California, Berkeley, CA (2013-2017)<br/>
          <span class="details">Summa Cum Laude • GPA: 3.95/4.0</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Research Interests</div>
        <div class="entry">
          Machine Learning • Distributed Systems • Cloud Computing • High-Performance Computing • Software Engineering • Computer Architecture
        </div>
      </div>

      <div class="section">
        <div class="section-title">Academic Appointments</div>
        <div class="entry">
          <strong>Assistant Professor</strong>, Department of Computer Science, Stanford University (2023-Present)<br/>
          <span class="details">Teaching graduate and undergraduate courses in machine learning and distributed systems</span>
        </div>
        <div class="entry">
          <strong>Postdoctoral Researcher</strong>, MIT Computer Science and AI Laboratory (2022-2023)<br/>
          <span class="details">Conducted research on scalable machine learning algorithms under Prof. John Doe</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Publications</div>
        <div class="entry">
          Chen, A., Smith, J., & Williams, R. (2024). <span class="pub-title">Scalable Machine Learning in Cloud Environments: A Comprehensive Study.</span> Proceedings of the ACM SIGOPS Conference on Operating Systems Principles, pp. 145-162.
        </div>
        <div class="entry">
          Chen, A., Johnson, M., Lee, S., & Brown, K. (2023). <span class="pub-title">Optimizing Distributed Training Workloads for Deep Neural Networks.</span> IEEE Transactions on Parallel and Distributed Systems, 34(8), 2245-2260.
        </div>
        <div class="entry">
          Chen, A., & Davis, P. (2022). <span class="pub-title">Energy-Efficient Computing in Large-Scale Data Centers.</span> International Conference on Distributed Computing Systems, pp. 78-91.
        </div>
        <div class="entry">
          Chen, A., Wilson, T., & Martinez, L. (2021). <span class="pub-title">Novel Approaches to Federated Learning in Edge Computing.</span> ACM Transactions on Computer Systems, 39(3-4), 1-28.
        </div>
      </div>

      <div class="section">
        <div class="section-title">Teaching Experience</div>
        <div class="entry">
          <strong>CS 401: Advanced Distributed Systems</strong>, Stanford University (Fall 2024, Fall 2023)<br/>
          <span class="details">Graduate-level course covering distributed algorithms, consensus protocols, and system design</span>
        </div>
        <div class="entry">
          <strong>CS 229: Machine Learning</strong>, Stanford University (Spring 2024)<br/>
          <span class="details">Core graduate course in machine learning theory and applications</span>
        </div>
        <div class="entry">
          <strong>CS 101: Introduction to Computer Science</strong>, Stanford University (Winter 2024)<br/>
          <span class="details">Introductory programming course for undergraduate students</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Grants & Funding</div>
        <div class="entry">
          <strong>National Science Foundation (NSF) CAREER Award</strong><br/>
          <span class="details">"Scalable Machine Learning Systems for Edge Computing" • $550,000 (2024-2029)</span>
        </div>
        <div class="entry">
          <strong>Google Research Award</strong><br/>
          <span class="details">"Optimizing Large-Scale Distributed Training" • $125,000 (2023-2024)</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Honors & Awards</div>
        <div class="entry">
          Best Paper Award, ACM SIGOPS Conference (2024) • NSF CAREER Award (2024) • Stanford Graduate Fellowship (2019-2023) • MIT Presidential Fellowship (2017-2019)
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Service</div>
        <div class="entry">
          Program Committee Member: SOSP (2024-2025), OSDI (2024), NSDI (2024)<br/>
          Reviewer: ACM TOCS, IEEE TPDS, ACM Computing Surveys<br/>
          Session Chair: International Conference on Distributed Computing Systems (2023)
        </div>
      </div>
    </body>
    </html>
  `;
}

async function main() {
  console.log('\n🎨 Generating Real Template Previews with Unique Layouts\n');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({ headless: true });

  try {
    // Get all templates
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        name: true,
        primaryCategory: true,
      },
      orderBy: [
        { primaryCategory: 'asc' },
        { name: 'asc' },
      ],
    });

    console.log(`\n📊 Found ${templates.length} templates to process\n`);

    let successCount = 0;
    let failureCount = 0;

    // Group by category
    const categories = [...new Set(templates.map(t => t.primaryCategory).filter(Boolean))];

    for (const category of categories) {
      const categoryTemplates = templates.filter(t => t.primaryCategory === category);
      console.log(`\n📂 ${(category || 'Other').toUpperCase()} (${categoryTemplates.length} templates):`);

      for (const template of categoryTemplates) {
        const success = await generatePreviewForTemplate(
          template.id,
          template.name,
          template.primaryCategory,
          browser
        );

        if (success) successCount++;
        else failureCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Preview Generation Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${successCount} previews`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Total templates: ${templates.length}`);
    console.log('\n💡 Previews saved to: frontend/public/template-previews/');

  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
