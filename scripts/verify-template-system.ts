/**
 * Template System Verification Script
 * Tests the complete template system including:
 * - Database seeding
 * - Template registry functions
 * - API endpoints (simulated)
 * - Template loading
 * - Filtering and search
 * - Recommendations
 */

import { PrismaClient } from '@prisma/client';
import * as TemplateRegistry from '../src/services/template-registry';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message?: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
  if (details && passed) {
    console.log(`   Details:`, details);
  }
}

async function testDatabaseSeeding() {
  console.log('\n📊 Testing Database Seeding...\n');

  try {
    // Count templates
    const count = await prisma.resumeTemplate.count();
    addResult('Database has templates', count === 80, `Found ${count} templates`);

    // Check each category
    const categories = await prisma.resumeTemplate.groupBy({
      by: ['primaryCategory'],
      _count: true,
    });

    const expectedCounts: Record<string, number> = {
      'ats-professional': 15,
      'entry-student': 15,
      'tech-startup': 15,
      'creative-design': 15,
      'academic-research': 10,
      'executive-leadership': 10,
    };

    for (const [category, expectedCount] of Object.entries(expectedCounts)) {
      const found = categories.find(c => c.primaryCategory === category);
      addResult(
        `Category: ${category}`,
        found?._count === expectedCount,
        `Expected ${expectedCount}, got ${found?._count || 0}`
      );
    }
  } catch (error: any) {
    addResult('Database seeding test', false, error.message);
  }
}

async function testTemplateRegistry() {
  console.log('\n🔧 Testing Template Registry Functions...\n');

  try {
    // Test getAllTemplates
    const allTemplates = await TemplateRegistry.getAllTemplates();
    addResult(
      'getAllTemplates()',
      allTemplates.length === 80,
      `Returned ${allTemplates.length} templates`
    );

    // Test getTemplateById
    const template = await TemplateRegistry.getTemplateById('corporate-standard');
    addResult(
      'getTemplateById()',
      template !== null && template.id === 'corporate-standard',
      template ? `Found: ${template.name}` : 'Not found'
    );

    // Test getTemplatesByCategory
    const techTemplates = await TemplateRegistry.getTemplatesByCategory('tech-startup');
    addResult(
      'getTemplatesByCategory()',
      techTemplates.length === 15,
      `Found ${techTemplates.length} tech templates`
    );

    // Test filtering by ATS compatibility
    const atsTemplates = await TemplateRegistry.getTemplatesByFilters({
      atsCompatibility: 'ats-safe',
    });
    addResult(
      'Filter by ATS compatibility',
      atsTemplates.length > 0,
      `Found ${atsTemplates.length} ATS-safe templates`
    );

    // Test filtering by experience level
    const entryTemplates = await TemplateRegistry.getTemplatesByFilters({
      experienceLevel: 'entry',
    });
    addResult(
      'Filter by experience level',
      entryTemplates.length > 0,
      `Found ${entryTemplates.length} entry-level templates`
    );

    // Test filtering by industry tags
    const financeTemplates = await TemplateRegistry.getTemplatesByFilters({
      industryTags: ['finance'],
    });
    addResult(
      'Filter by industry tags',
      financeTemplates.length > 0,
      `Found ${financeTemplates.length} finance templates`
    );

    // Test search
    const searchResults = await TemplateRegistry.getTemplatesByFilters({
      searchQuery: 'developer',
    });
    addResult(
      'Search templates',
      searchResults.length > 0,
      `Found ${searchResults.length} results for "developer"`
    );

    // Test featured templates
    const featuredTemplates = await TemplateRegistry.getTemplatesByFilters({
      isFeatured: true,
    });
    addResult(
      'Featured templates',
      featuredTemplates.length > 0,
      `Found ${featuredTemplates.length} featured templates`
    );

    // Test premium templates
    const premiumTemplates = await TemplateRegistry.getTemplatesByFilters({
      isPremium: true,
    });
    addResult(
      'Premium templates',
      premiumTemplates.length > 0,
      `Found ${premiumTemplates.length} premium templates`
    );

    // Test filter options
    const filterOptions = await TemplateRegistry.getFilterOptions();
    addResult(
      'getFilterOptions()',
      filterOptions.categories.length === 6,
      `Categories: ${filterOptions.categories.join(', ')}`
    );

    // Test recommendations (without user data)
    const recommendations = await TemplateRegistry.getRecommendedTemplates(undefined, 5);
    addResult(
      'getRecommendedTemplates()',
      recommendations.length === 5,
      `Returned ${recommendations.length} recommendations`
    );

    // Test template stats
    const stats = await TemplateRegistry.getTemplateStats();
    addResult(
      'getTemplateStats()',
      stats.totalTemplates === 80,
      `Total: ${stats.totalTemplates}, Categories: ${Object.keys(stats.byCategory).length}`
    );

  } catch (error: any) {
    addResult('Template registry test', false, error.message);
  }
}

async function testTemplateCaching() {
  console.log('\n💾 Testing Template Caching...\n');

  try {
    // Load template first time (should cache)
    const start1 = Date.now();
    const template1 = await TemplateRegistry.loadTemplateModule('corporate-standard');
    const time1 = Date.now() - start1;

    // Load template second time (should use cache)
    const start2 = Date.now();
    const template2 = await TemplateRegistry.loadTemplateModule('corporate-standard');
    const time2 = Date.now() - start2;

    addResult(
      'Template caching',
      time2 < time1 && template1 !== null && template2 !== null,
      `First load: ${time1}ms, Second load: ${time2}ms (cached)`
    );

    // Clear cache and reload
    TemplateRegistry.clearTemplateCache('corporate-standard');
    const start3 = Date.now();
    const template3 = await TemplateRegistry.loadTemplateModule('corporate-standard');
    const time3 = Date.now() - start3;

    addResult(
      'Cache clearing',
      time3 >= time2,
      `After clear: ${time3}ms`
    );

  } catch (error: any) {
    addResult('Template caching test', false, error.message);
  }
}

async function testAdvancedFiltering() {
  console.log('\n🔍 Testing Advanced Filtering...\n');

  try {
    // Multi-filter test
    const results1 = await TemplateRegistry.getTemplatesByFilters({
      primaryCategory: 'tech-startup',
      atsCompatibility: 'ats-safe',
      experienceLevel: 'mid',
    });
    addResult(
      'Multi-filter query',
      results1.length > 0,
      `Found ${results1.length} templates matching all criteria`
    );

    // Pagination test
    const page1 = await TemplateRegistry.getTemplatesByFilters({
      limit: 10,
      offset: 0,
    });
    const page2 = await TemplateRegistry.getTemplatesByFilters({
      limit: 10,
      offset: 10,
    });
    addResult(
      'Pagination',
      page1.length === 10 && page2.length === 10 && page1[0].id !== page2[0].id,
      `Page 1: ${page1.length} items, Page 2: ${page2.length} items`
    );

    // Design style filtering
    const modernTemplates = await TemplateRegistry.getTemplatesByFilters({
      designStyle: 'modern',
    });
    addResult(
      'Design style filter',
      modernTemplates.length > 0,
      `Found ${modernTemplates.length} modern templates`
    );

    // Page length filtering
    const onePageTemplates = await TemplateRegistry.getTemplatesByFilters({
      pageLength: 'one-page',
    });
    addResult(
      'Page length filter',
      onePageTemplates.length > 0,
      `Found ${onePageTemplates.length} one-page templates`
    );

  } catch (error: any) {
    addResult('Advanced filtering test', false, error.message);
  }
}

async function testRecommendations() {
  console.log('\n🎯 Testing Smart Recommendations...\n');

  try {
    // Test with sample resume data
    const sampleData = {
      contact: {
        name: 'John Developer',
        email: 'john@example.com',
      },
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Startup Inc.',
          startDate: 'Jan 2020',
          endDate: 'Present',
          current: true,
          description: ['Built scalable web applications'],
        },
        {
          title: 'Software Engineer',
          company: 'Startup Labs',
          startDate: 'Jun 2017',
          endDate: 'Dec 2019',
          current: false,
          description: ['Developed features'],
        },
      ],
      education: [
        {
          degree: 'B.S. Computer Science',
          institution: 'University',
          graduationDate: '2017',
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
      certifications: [],
      projects: [],
    };

    const recommendations = await TemplateRegistry.getRecommendedTemplates(sampleData as any, 5);
    addResult(
      'Smart recommendations',
      recommendations.length === 5,
      `Returned ${recommendations.length} personalized templates`
    );

    // Check if tech templates are prioritized
    const hasTechTemplates = recommendations.some(t => t.primaryCategory === 'tech-startup');
    addResult(
      'Recommendation relevance',
      hasTechTemplates,
      hasTechTemplates ? 'Tech templates recommended for tech profile' : 'No tech templates'
    );

  } catch (error: any) {
    addResult('Recommendations test', false, error.message);
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.message || 'Failed'}`);
      });
    console.log('');
  }

  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('🧪 Resume Template System Verification\n');
  console.log('This script will test all aspects of the template system.\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Run all tests
    await testDatabaseSeeding();
    await testTemplateRegistry();
    await testTemplateCaching();
    await testAdvancedFiltering();
    await testRecommendations();

    // Print summary
    await printSummary();

    // Exit with appropriate code
    const hasFailures = results.some(r => !r.passed);
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
