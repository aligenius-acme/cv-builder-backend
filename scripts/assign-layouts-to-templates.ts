/**
 * Assign Layout Components to All Templates
 * Distributes 500 templates across unique layout components
 */

import { PrismaClient } from '@prisma/client';
import { LayoutType } from '../src/templates/layouts/types';

const prisma = new PrismaClient();

/**
 * Layout assignment strategy by category (12 unique layouts)
 * Maps each category to suitable layout components
 */
const CATEGORY_LAYOUT_MAP: Record<string, LayoutType[]> = {
  'ats-professional': ['BaseLayout', 'ProfessionalLayout', 'CompactLayout', 'TwoColumnSidebarLayout', 'ExecutiveLayout'],
  'tech-startup': ['TechLayout', 'ModernMinimalLayout', 'TimelineLayout', 'PortfolioLayout', 'CreativeLayout'],
  'creative-design': ['CreativeLayout', 'PortfolioLayout', 'InfographicLayout', 'ModernMinimalLayout', 'TwoColumnSidebarLayout'],
  'executive-leadership': ['ExecutiveLayout', 'ProfessionalLayout', 'TwoColumnSidebarLayout', 'BaseLayout', 'CompactLayout'],
  'academic-research': ['AcademicLayout', 'BaseLayout', 'ProfessionalLayout', 'TwoColumnSidebarLayout', 'CompactLayout'],
  'entry-student': ['ModernMinimalLayout', 'TimelineLayout', 'BaseLayout', 'TwoColumnSidebarLayout', 'CompactLayout'],
  'healthcare-medical': ['ProfessionalLayout', 'BaseLayout', 'TwoColumnSidebarLayout', 'CompactLayout', 'ExecutiveLayout'],
  'finance-banking': ['ExecutiveLayout', 'ProfessionalLayout', 'BaseLayout', 'TwoColumnSidebarLayout', 'CompactLayout'],
  'legal-law': ['ExecutiveLayout', 'ProfessionalLayout', 'AcademicLayout', 'BaseLayout', 'TwoColumnSidebarLayout'],
  'sales-marketing': ['CreativeLayout', 'InfographicLayout', 'ModernMinimalLayout', 'TimelineLayout', 'TwoColumnSidebarLayout'],
  'education-teaching': ['AcademicLayout', 'ProfessionalLayout', 'BaseLayout', 'TwoColumnSidebarLayout', 'TimelineLayout'],
  'engineering': ['TechLayout', 'BaseLayout', 'TimelineLayout', 'TwoColumnSidebarLayout', 'CompactLayout'],
  'hospitality-service': ['ModernMinimalLayout', 'InfographicLayout', 'CreativeLayout', 'TwoColumnSidebarLayout', 'BaseLayout'],
  'construction-trades': ['ProfessionalLayout', 'BaseLayout', 'CompactLayout', 'TwoColumnSidebarLayout', 'ExecutiveLayout'],
  'retail-ecommerce': ['InfographicLayout', 'ModernMinimalLayout', 'CreativeLayout', 'TwoColumnSidebarLayout', 'PortfolioLayout'],
};

/**
 * Default layouts for unknown categories
 */
const DEFAULT_LAYOUTS: LayoutType[] = ['BaseLayout', 'ProfessionalLayout', 'TwoColumnSidebarLayout', 'CompactLayout', 'ModernMinimalLayout'];

async function assignLayoutsToTemplates() {
  console.log('🎨 Starting to assign layout components to templates...\n');

  try {
    // Get all templates
    const templates = await prisma.resumeTemplate.findMany({
      select: {
        id: true,
        primaryCategory: true,
        templateConfig: true,
      },
    });

    console.log(`📊 Found ${templates.length} templates to process\n`);

    // Group templates by category for distribution
    const templatesByCategory = templates.reduce((acc, template) => {
      const category = template.primaryCategory || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, typeof templates>);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each category
    for (const [category, categoryTemplates] of Object.entries(templatesByCategory)) {
      console.log(`\n📁 Processing category: ${category} (${categoryTemplates.length} templates)`);

      // Get layout options for this category
      const layoutOptions = CATEGORY_LAYOUT_MAP[category] || DEFAULT_LAYOUTS;
      console.log(`   Layouts: ${layoutOptions.join(', ')}`);

      // Distribute templates evenly across available layouts
      for (let i = 0; i < categoryTemplates.length; i++) {
        const template = categoryTemplates[i];
        const layoutIndex = i % layoutOptions.length;
        const layoutComponent = layoutOptions[layoutIndex];

        try {
          // Get existing config
          const currentConfig = template.templateConfig as any || {};

          // Force reassignment to distribute across all 12 layouts
          // (Comment out the skip check to redistribute templates)

          // Add layout component to config
          const updatedConfig = {
            ...currentConfig,
            layoutComponent,
          };

          // Update template
          await prisma.resumeTemplate.update({
            where: { id: template.id },
            data: {
              templateConfig: updatedConfig,
            },
          });

          updatedCount++;

          if (updatedCount % 50 === 0) {
            console.log(`   ✓ Updated ${updatedCount} templates...`);
          }
        } catch (error: any) {
          console.error(`   ❌ Failed to update template ${template.id}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Layout assignment complete!`);
    console.log(`   - Successfully updated: ${updatedCount} templates`);
    console.log(`   - Skipped (already assigned): ${skippedCount} templates`);

    // Show distribution by layout
    console.log('\n📈 Layout distribution:');
    const updatedTemplates = await prisma.resumeTemplate.findMany({
      select: { templateConfig: true },
    });

    const layoutCounts: Record<string, number> = {};
    updatedTemplates.forEach(t => {
      const config = t.templateConfig as any;
      const layout = config?.layoutComponent || 'none';
      layoutCounts[layout] = (layoutCounts[layout] || 0) + 1;
    });

    Object.entries(layoutCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([layout, count]) => {
        console.log(`   ${layout}: ${count} templates`);
      });

  } catch (error) {
    console.error('❌ Assignment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignLayoutsToTemplates()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
