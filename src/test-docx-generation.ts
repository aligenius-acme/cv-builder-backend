/**
 * Test Script for DOCX Generation
 *
 * This script tests the DOCX generation functionality with sample data
 * Run with: ts-node src/test-docx-generation.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateDOCXFromReact, generateDOCXWithMetrics } from './services/react-docx-generator';
import { ParsedResumeData } from './types';

// Sample resume data for testing
const sampleResumeData: ParsedResumeData = {
  contact: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.dev',
  },
  summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers. Passionate about building products that make a difference.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: '',
      current: true,
      description: [
        'Led development of microservices architecture serving 10M+ users, improving system reliability by 40%',
        'Mentored team of 5 junior engineers, establishing code review processes and best practices',
        'Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes',
        'Collaborated with product team to design and ship 15+ features using React and Node.js',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2020',
      current: false,
      description: [
        'Built RESTful APIs handling 1M+ daily requests using Express.js and MongoDB',
        'Developed responsive web applications with React, Redux, and TypeScript',
        'Optimized database queries reducing average response time by 60%',
        'Participated in agile ceremonies and contributed to sprint planning',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'Digital Agency',
      location: 'Austin, TX',
      startDate: 'Jul 2018',
      endDate: 'May 2019',
      current: false,
      description: [
        'Created custom WordPress themes and plugins for client websites',
        'Implemented responsive designs using HTML5, CSS3, and JavaScript',
        'Collaborated with designers to translate mockups into functional websites',
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
        'Dean\'s List all semesters',
        'President of Computer Science Club',
      ],
    },
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Docker',
    'Kubernetes',
    'AWS',
    'MongoDB',
    'PostgreSQL',
    'Git',
    'CI/CD',
    'Agile',
    'REST APIs',
    'GraphQL',
  ],
  projects: [
    {
      name: 'Open Source Task Manager',
      description: 'Built a collaborative task management application with real-time updates using React and Socket.io',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Redux'],
      url: 'github.com/johndoe/task-manager',
    },
    {
      name: 'Weather Dashboard',
      description: 'Created a weather forecast dashboard integrating multiple APIs with data visualization',
      technologies: ['Vue.js', 'Chart.js', 'OpenWeather API'],
      url: 'weather-dash.johndoe.dev',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
    {
      name: 'Certified Kubernetes Administrator',
      issuer: 'Cloud Native Computing Foundation',
      date: '2021',
    },
  ],
  languages: ['English (Native)', 'Spanish (Conversational)'],
  awards: [
    {
      name: 'Employee of the Year',
      issuer: 'Tech Corp',
      date: '2022',
    },
  ],
};

/**
 * Main test function
 */
async function testDOCXGeneration() {
  console.log('🚀 Starting DOCX Generation Test...\n');

  try {
    // Test 1: Basic generation
    console.log('Test 1: Generating DOCX with ATS Professional template...');
    const startTime = Date.now();

    const { buffer, generationTime } = await generateDOCXWithMetrics(
      'ats-professional-navy',
      sampleResumeData
    );

    console.log(`✅ DOCX generated successfully in ${generationTime}ms`);
    console.log(`   Buffer size: ${(buffer.length / 1024).toFixed(2)} KB`);

    // Performance check
    if (generationTime > 3000) {
      console.warn(`⚠️  Warning: Generation took ${generationTime}ms (exceeds 3s target)`);
    } else {
      console.log(`✅ Performance: Under 3 second target`);
    }

    // Test 2: Save to file
    console.log('\nTest 2: Saving DOCX to file...');
    const outputDir = path.join(__dirname, '..', 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'sample-resume.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ DOCX saved to: ${outputPath}`);

    // Test 3: Generate with custom colors
    console.log('\nTest 3: Generating with custom colors...');
    const customBuffer = await generateDOCXFromReact(
      'ats-professional-navy',
      sampleResumeData,
      {
        primary: '#059669', // Green
        secondary: '#047857',
        text: '#1a1a2e',
        muted: '#64748b',
      }
    );

    const customOutputPath = path.join(outputDir, 'sample-resume-custom-colors.docx');
    fs.writeFileSync(customOutputPath, customBuffer);
    console.log(`✅ Custom colored DOCX saved to: ${customOutputPath}`);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Open the generated DOCX files in Microsoft Word');
    console.log('2. Verify formatting (fonts, colors, spacing)');
    console.log('3. Test with an ATS parser tool');
    console.log('4. Check that all sections are properly formatted');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testDOCXGeneration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
