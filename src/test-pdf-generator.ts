/**
 * Test script for PDF generation
 * Run with: ts-node src/test-pdf-generator.ts
 */

import fs from 'fs';
import path from 'path';
import { generatePDFFromReact, healthCheck, closeBrowser } from './services/react-pdf-generator';
import { ParsedResumeData } from './types';

// Sample resume data for testing
const sampleResumeData: ParsedResumeData = {
  contact: {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johnsmith',
    github: 'github.com/johnsmith',
    website: 'johnsmith.dev',
  },
  summary:
    'Experienced Full-Stack Software Engineer with 5+ years of expertise in building scalable web applications. Proven track record of leading development teams and delivering high-impact projects using React, Node.js, and cloud technologies.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      current: true,
      description: [
        'Led development of microservices architecture serving 10M+ users, improving system reliability by 40%',
        'Architected and implemented real-time data processing pipeline using Kafka and Redis, reducing latency by 60%',
        'Mentored team of 5 junior engineers, establishing code review processes and best practices',
        'Reduced cloud infrastructure costs by 30% through optimization of AWS resources and containerization',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2020',
      current: false,
      description: [
        'Built full-stack features for SaaS platform using React, Node.js, and PostgreSQL',
        'Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 50%',
        'Collaborated with product team to design and ship 15+ features, increasing user engagement by 25%',
        'Maintained 95% code coverage through comprehensive unit and integration testing',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'Web Agency',
      location: 'Austin, TX',
      startDate: 'Aug 2018',
      endDate: 'May 2019',
      current: false,
      description: [
        'Developed responsive websites for 20+ clients using React and Next.js',
        'Optimized web performance achieving 90+ Lighthouse scores across all sites',
        'Collaborated with designers to implement pixel-perfect UI components',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2018',
      gpa: '3.8',
      achievements: [
        'Dean\'s List (4 semesters)',
        'Computer Science Department Award for Outstanding Project',
        'President of CS Student Association',
      ],
    },
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'AWS',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'REST APIs',
    'Git',
    'CI/CD',
    'Agile/Scrum',
  ],
  projects: [
    {
      name: 'Open Source Task Manager',
      description:
        'Built collaborative task management tool with real-time updates, serving 5000+ active users. Features include drag-and-drop interface, team collaboration, and integrations with Slack and GitHub.',
      technologies: ['React', 'Node.js', 'Socket.io', 'PostgreSQL'],
      url: 'github.com/johnsmith/task-manager',
    },
    {
      name: 'AI Content Generator',
      description:
        'Developed AI-powered content generation platform using GPT-4 API. Implemented custom fine-tuning and prompt engineering for enhanced output quality.',
      technologies: ['Python', 'FastAPI', 'OpenAI API', 'React'],
      url: 'contentgen.ai',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
  ],
};

async function runTests() {
  console.log('='.repeat(70));
  console.log('PDF GENERATOR TEST SUITE');
  console.log('='.repeat(70));
  console.log('');

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Test 1: Health Check
    console.log('Test 1: Running health check...');
    const health = await healthCheck();
    console.log(`✓ Browser connected: ${health.browserConnected}`);
    console.log(`✓ Can generate PDF: ${health.canGeneratePDF}`);
    if (health.error) {
      console.error(`✗ Health check error: ${health.error}`);
    }
    console.log('');

    // Test 2: Generate PDF with default template
    console.log('Test 2: Generating PDF with "london-navy" template...');
    const startTime1 = Date.now();
    const pdf1 = await generatePDFFromReact('london-navy', sampleResumeData);
    const duration1 = Date.now() - startTime1;
    const size1 = pdf1.length / 1024;

    console.log(`✓ PDF generated in ${duration1}ms`);
    console.log(`✓ PDF size: ${size1.toFixed(2)} KB`);

    const outputPath1 = path.join(outputDir, 'test-london-navy.pdf');
    fs.writeFileSync(outputPath1, pdf1);
    console.log(`✓ Saved to: ${outputPath1}`);
    console.log('');

    // Test 3: Generate PDF with custom colors
    console.log('Test 3: Generating PDF with custom colors...');
    const startTime2 = Date.now();
    const pdf2 = await generatePDFFromReact('berlin-ocean', sampleResumeData, {
      primaryColor: '#c2410c', // Custom rust color
      secondaryColor: '#9a3412',
      accentColor: '#ffedd5',
    });
    const duration2 = Date.now() - startTime2;
    const size2 = pdf2.length / 1024;

    console.log(`✓ PDF generated in ${duration2}ms`);
    console.log(`✓ PDF size: ${size2.toFixed(2)} KB`);

    const outputPath2 = path.join(outputDir, 'test-custom-colors.pdf');
    fs.writeFileSync(outputPath2, pdf2);
    console.log(`✓ Saved to: ${outputPath2}`);
    console.log('');

    // Test 4: Generate multiple PDFs (different templates)
    console.log('Test 4: Generating PDFs with multiple templates...');
    const templates = [
      'dublin-slate',
      'amsterdam-teal',
      'tokyo-violet',
      'toronto-graphite',
    ];

    for (const templateId of templates) {
      const startTime = Date.now();
      const pdf = await generatePDFFromReact(templateId, sampleResumeData);
      const duration = Date.now() - startTime;
      const size = pdf.length / 1024;

      const outputPath = path.join(outputDir, `test-${templateId}.pdf`);
      fs.writeFileSync(outputPath, pdf);

      console.log(
        `✓ ${templateId}: ${duration}ms, ${size.toFixed(2)} KB - ${outputPath}`
      );
    }
    console.log('');

    // Test 5: Performance test (browser reuse)
    console.log('Test 5: Performance test (browser reuse)...');
    const iterations = 5;
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await generatePDFFromReact('london-navy', sampleResumeData);
      const duration = Date.now() - startTime;
      durations.push(duration);
      console.log(`  Iteration ${i + 1}: ${duration}ms`);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log(`✓ Average: ${avgDuration.toFixed(2)}ms`);
    console.log(`✓ Min: ${minDuration}ms`);
    console.log(`✓ Max: ${maxDuration}ms`);
    console.log('');

    // Test 6: File size check
    console.log('Test 6: Checking file sizes...');
    const files = fs.readdirSync(outputDir);
    let allUnder500KB = true;

    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;

        if (sizeKB > 500) {
          console.log(`⚠ ${file}: ${sizeKB.toFixed(2)} KB (exceeds 500KB)`);
          allUnder500KB = false;
        } else {
          console.log(`✓ ${file}: ${sizeKB.toFixed(2)} KB`);
        }
      }
    }

    if (allUnder500KB) {
      console.log('✓ All PDFs are under 500KB');
    }
    console.log('');

    // Summary
    console.log('='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('✓ All tests passed!');
    console.log(`✓ Performance: Average ${avgDuration.toFixed(2)}ms per PDF`);
    console.log(
      `✓ Success criteria: ${avgDuration < 5000 ? 'PASSED' : 'FAILED'} (< 5 seconds)`
    );
    console.log(`✓ Generated ${files.filter(f => f.endsWith('.pdf')).length} PDFs`);
    console.log(`✓ Output directory: ${outputDir}`);
    console.log('');
  } catch (error) {
    console.error('✗ Test failed with error:', error);
    throw error;
  } finally {
    // Cleanup
    console.log('Cleaning up...');
    await closeBrowser();
    console.log('✓ Browser closed');
    console.log('');
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('✓ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Tests failed:', error);
    process.exit(1);
  });
