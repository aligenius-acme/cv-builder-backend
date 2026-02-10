/**
 * Generate Template Variants
 * Creates 150 diverse template configurations using all 48 components
 * Properly categorized with photo support
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Color schemes
const colorSchemes = {
  navy: { name: 'Navy', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#60a5fa', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  emerald: { name: 'Emerald', primary: '#047857', secondary: '#10b981', accent: '#6ee7b7', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  burgundy: { name: 'Burgundy', primary: '#881337', secondary: '#be123c', accent: '#fb7185', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  slate: { name: 'Slate', primary: '#334155', secondary: '#64748b', accent: '#94a3b8', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  purple: { name: 'Purple', primary: '#6b21a8', secondary: '#a855f7', accent: '#c084fc', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  teal: { name: 'Teal', primary: '#0f766e', secondary: '#14b8a6', accent: '#5eead4', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
  orange: { name: 'Orange', primary: '#c2410c', secondary: '#f97316', accent: '#fb923c', text: '#1e293b', muted: '#64748b', background: '#ffffff' },
};

// Font configurations
const fonts = {
  sans: { headingFont: 'sans', bodyFont: 'sans', size: 'medium' },
  serif: { headingFont: 'serif', bodyFont: 'serif', size: 'medium' },
};

// Template generation recipes
interface TemplateRecipe {
  name: string;
  description: string;
  category: string;
  layout: 'single-column' | 'two-column-left' | 'two-column-right';
  components: {
    header: string;
    experience: string;
    skills: string;
    education: string;
    sidebar?: string;
  };
  sections: { order: string[] };
  colorScheme: keyof typeof colorSchemes;
  fontConfig: keyof typeof fonts;
  atsCompatibility: number;
  atsLevel: 'ATS-Safe' | 'ATS-Friendly' | 'Visual-First';
  designStyle: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive' | 'All';
  photoSupport: boolean;
  photoSize: number;
  industryTags: string[];
}

// Generate template recipes
const templates: TemplateRecipe[] = [
  // ========== ATS-PROFESSIONAL (40 templates) ==========
  // Minimal headers with bullet points (10)
  ...['navy', 'slate', 'teal', 'emerald', 'navy', 'slate', 'teal', 'emerald', 'navy', 'slate'].map((color, i) => ({
    name: `ATS Pro - Minimal ${i + 1}`,
    description: `Clean, ATS-optimized professional template with ${colorSchemes[color as keyof typeof colorSchemes].name} accent`,
    category: 'ats-professional',
    layout: 'single-column' as const,
    components: {
      header: 'minimal',
      experience: 'bullet-point',
      skills: i % 2 === 0 ? 'compact-list' : 'categorized',
      education: 'minimalist',
    },
    sections: { order: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 95,
    atsLevel: 'ATS-Safe' as const,
    designStyle: 'Minimal',
    experienceLevel: 'All' as const,
    photoSupport: true,
    photoSize: 80,
    industryTags: ['technology', 'business', 'engineering'],
  })),

  // Professional formal (10)
  ...['navy', 'slate', 'burgundy', 'teal', 'navy', 'slate', 'burgundy', 'teal', 'navy', 'slate'].map((color, i) => ({
    name: `ATS Pro - Formal ${i + 1}`,
    description: `Traditional professional format with ${colorSchemes[color as keyof typeof colorSchemes].name} styling`,
    category: 'ats-professional',
    layout: 'single-column' as const,
    components: {
      header: 'professional-formal',
      experience: i % 3 === 0 ? 'bullet-point' : (i % 3 === 1 ? 'compact-list' : 'two-column'),
      skills: 'categorized',
      education: 'detailed',
    },
    sections: { order: ['summary', 'experience', 'education', 'skills', 'certifications'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'serif' as const,
    atsCompatibility: 93,
    atsLevel: 'ATS-Safe' as const,
    designStyle: 'Traditional',
    experienceLevel: i < 5 ? 'Mid' as const : 'Senior' as const,
    photoSupport: true,
    photoSize: 85,
    industryTags: ['business', 'legal', 'operations'],
  })),

  // Compact single-line (10)
  ...['navy', 'slate', 'teal', 'emerald', 'navy', 'slate', 'teal', 'emerald', 'navy', 'slate'].map((color, i) => ({
    name: `ATS Pro - Compact ${i + 1}`,
    description: `Space-efficient ATS template with ${colorSchemes[color as keyof typeof colorSchemes].name} highlights`,
    category: 'ats-professional',
    layout: 'single-column' as const,
    components: {
      header: 'compact-single-line',
      experience: 'compact-list',
      skills: 'table-grid',
      education: 'compact',
    },
    sections: { order: ['experience', 'skills', 'education', 'certifications'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 94,
    atsLevel: 'ATS-Safe' as const,
    designStyle: 'Minimal',
    experienceLevel: 'All' as const,
    photoSupport: true,
    photoSize: 70,
    industryTags: ['technology', 'engineering', 'sales'],
  })),

  // Two-column professional (10)
  ...['navy', 'slate', 'teal', 'burgundy', 'navy', 'slate', 'teal', 'burgundy', 'navy', 'slate'].map((color, i) => ({
    name: `ATS Pro - Two Column ${i + 1}`,
    description: `Professional two-column layout with ${colorSchemes[color as keyof typeof colorSchemes].name} sidebar`,
    category: 'ats-professional',
    layout: 'two-column-left' as const,
    components: {
      header: 'minimal',
      experience: 'bullet-point',
      skills: 'compact-list',
      education: 'minimalist',
      sidebar: i % 3 === 0 ? 'contact' : (i % 3 === 1 ? 'minimalist' : 'icon-contact'),
    },
    sections: { order: ['experience', 'education', 'certifications'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 90,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Modern',
    experienceLevel: 'All' as const,
    photoSupport: true,
    photoSize: 90,
    industryTags: ['business', 'technology', 'operations'],
  })),

  // ========== TECH-STARTUP (30 templates) ==========
  // Bold modern (8)
  ...['purple', 'emerald', 'orange', 'teal', 'purple', 'emerald', 'orange', 'teal'].map((color, i) => ({
    name: `Tech - Bold Modern ${i + 1}`,
    description: `Modern tech-focused design with ${colorSchemes[color as keyof typeof colorSchemes].name} gradients`,
    category: 'tech-startup',
    layout: 'single-column' as const,
    components: {
      header: 'bold-modern',
      experience: 'metrics-focused',
      skills: 'icon',
      education: 'timeline',
    },
    sections: { order: ['experience', 'skills', 'education', 'projects'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 83,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Bold',
    experienceLevel: i < 4 ? 'Entry' as const : 'Mid' as const,
    photoSupport: true,
    photoSize: 120,
    industryTags: ['technology', 'creative'],
  })),

  // Icon decorated (8)
  ...['purple', 'emerald', 'orange', 'teal', 'purple', 'emerald', 'orange', 'teal'].map((color, i) => ({
    name: `Tech - Icon Style ${i + 1}`,
    description: `Tech template with icon decorations and ${colorSchemes[color as keyof typeof colorSchemes].name} theme`,
    category: 'tech-startup',
    layout: 'single-column' as const,
    components: {
      header: 'icon-decorated',
      experience: 'skills-tagged',
      skills: 'progress-bars',
      education: 'icon',
    },
    sections: { order: ['skills', 'experience', 'projects', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 82,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Modern',
    experienceLevel: 'Mid' as const,
    photoSupport: true,
    photoSize: 110,
    industryTags: ['technology', 'engineering'],
  })),

  // Gradient backgrounds (7)
  ...['purple', 'emerald', 'orange', 'teal', 'purple', 'emerald', 'orange'].map((color, i) => ({
    name: `Tech - Gradient ${i + 1}`,
    description: `Eye-catching gradient design with ${colorSchemes[color as keyof typeof colorSchemes].name} colors`,
    category: 'tech-startup',
    layout: 'single-column' as const,
    components: {
      header: 'gradient-background',
      experience: 'icon-based',
      skills: 'color-coded',
      education: 'timeline',
    },
    sections: { order: ['experience', 'skills', 'projects', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 80,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Bold',
    experienceLevel: 'Entry' as const,
    photoSupport: true,
    photoSize: 130,
    industryTags: ['technology', 'creative'],
  })),

  // Two-column tech (7)
  ...['purple', 'emerald', 'orange', 'teal', 'purple', 'emerald', 'orange'].map((color, i) => ({
    name: `Tech - Sidebar ${i + 1}`,
    description: `Modern two-column tech layout with ${colorSchemes[color as keyof typeof colorSchemes].name} accents`,
    category: 'tech-startup',
    layout: 'two-column-left' as const,
    components: {
      header: 'two-column',
      experience: 'metrics-focused',
      skills: 'icon',
      education: 'icon',
      sidebar: i % 2 === 0 ? 'colored' : 'profile',
    },
    sections: { order: ['experience', 'projects', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 81,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Modern',
    experienceLevel: 'Mid' as const,
    photoSupport: true,
    photoSize: 115,
    industryTags: ['technology'],
  })),

  // ========== CREATIVE-DESIGN (25 templates) ==========
  // Photo prominent (8)
  ...['orange', 'burgundy', 'purple', 'emerald', 'orange', 'burgundy', 'purple', 'emerald'].map((color, i) => ({
    name: `Creative - Photo Focus ${i + 1}`,
    description: `Creative design with prominent photo and ${colorSchemes[color as keyof typeof colorSchemes].name} styling`,
    category: 'creative-design',
    layout: 'single-column' as const,
    components: {
      header: 'photo-prominent',
      experience: 'card-layout',
      skills: 'pill',
      education: 'card',
    },
    sections: { order: ['experience', 'skills', 'projects', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 72,
    atsLevel: 'Visual-First' as const,
    designStyle: 'Bold',
    experienceLevel: 'All' as const,
    photoSupport: true,
    photoSize: 150,
    industryTags: ['creative', 'sales', 'hospitality'],
  })),

  // Split layout (8)
  ...['orange', 'burgundy', 'purple', 'emerald', 'orange', 'burgundy', 'purple', 'emerald'].map((color, i) => ({
    name: `Creative - Split Layout ${i + 1}`,
    description: `Unique split-screen design with ${colorSchemes[color as keyof typeof colorSchemes].name} theme`,
    category: 'creative-design',
    layout: 'single-column' as const,
    components: {
      header: 'split-layout',
      experience: 'achievement-boxes',
      skills: 'chip',
      education: 'badge',
    },
    sections: { order: ['experience', 'skills', 'education', 'projects'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 70,
    atsLevel: 'Visual-First' as const,
    designStyle: 'Bold',
    experienceLevel: 'Mid' as const,
    photoSupport: true,
    photoSize: 140,
    industryTags: ['creative', 'technology'],
  })),

  // Grid layouts (9)
  ...['orange', 'burgundy', 'purple', 'emerald', 'orange', 'burgundy', 'purple', 'emerald', 'orange'].map((color, i) => ({
    name: `Creative - Grid ${i + 1}`,
    description: `Modern grid-based layout with ${colorSchemes[color as keyof typeof colorSchemes].name} highlights`,
    category: 'creative-design',
    layout: i < 6 ? 'single-column' as const : 'two-column-left' as const,
    components: {
      header: i % 2 === 0 ? 'gradient-background' : 'photo-prominent',
      experience: 'grid-layout',
      skills: 'rated',
      education: 'card',
      ...(i >= 6 && { sidebar: 'colored' }),
    },
    sections: { order: ['skills', 'experience', 'projects', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: 73,
    atsLevel: 'Visual-First' as const,
    designStyle: 'Modern',
    experienceLevel: 'Entry' as const,
    photoSupport: true,
    photoSize: 130,
    industryTags: ['creative', 'sales'],
  })),

  // ========== EXECUTIVE-LEADERSHIP (20 templates) ==========
  // Executive signature (10)
  ...['navy', 'burgundy', 'slate', 'teal', 'navy', 'burgundy', 'slate', 'teal', 'navy', 'burgundy'].map((color, i) => ({
    name: `Executive - Premium ${i + 1}`,
    description: `Executive-level premium template with ${colorSchemes[color as keyof typeof colorSchemes].name} elegance`,
    category: 'executive-leadership',
    layout: 'single-column' as const,
    components: {
      header: 'executive-signature',
      experience: 'two-column',
      skills: 'timeline',
      education: 'detailed',
    },
    sections: { order: ['summary', 'experience', 'education', 'skills'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'serif' as const,
    atsCompatibility: 88,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Traditional',
    experienceLevel: i < 5 ? 'Senior' as const : 'Executive' as const,
    photoSupport: true,
    photoSize: 100,
    industryTags: ['business', 'operations', 'legal'],
  })),

  // Project highlight (10)
  ...['navy', 'burgundy', 'slate', 'teal', 'navy', 'burgundy', 'slate', 'teal', 'navy', 'burgundy'].map((color, i) => ({
    name: `Executive - Leadership ${i + 1}`,
    description: `Leadership-focused template with ${colorSchemes[color as keyof typeof colorSchemes].name} accents`,
    category: 'executive-leadership',
    layout: i < 7 ? 'single-column' as const : 'two-column-left' as const,
    components: {
      header: i % 2 === 0 ? 'professional-formal' : 'underlined',
      experience: 'project-highlight',
      skills: 'rated',
      education: 'two-column',
      ...(i >= 7 && { sidebar: 'icon-contact' }),
    },
    sections: { order: ['summary', 'experience', 'skills', 'education'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: i % 2 === 0 ? 'serif' as const : 'sans' as const,
    atsCompatibility: 87,
    atsLevel: 'ATS-Friendly' as const,
    designStyle: 'Modern',
    experienceLevel: 'Executive' as const,
    photoSupport: true,
    photoSize: 95,
    industryTags: ['business', 'technology', 'operations'],
  })),

  // ========== ACADEMIC-RESEARCH (15 templates) ==========
  ...['navy', 'slate', 'teal', 'navy', 'slate', 'teal', 'navy', 'slate', 'teal', 'navy', 'slate', 'teal', 'navy', 'slate', 'teal'].map((color, i) => ({
    name: `Academic - Research ${i + 1}`,
    description: `Academic template with ${colorSchemes[color as keyof typeof colorSchemes].name} styling`,
    category: 'academic-research',
    layout: 'single-column' as const,
    components: {
      header: i % 2 === 0 ? 'professional-formal' : 'minimal',
      experience: i % 3 === 0 ? 'bullet-point' : (i % 3 === 1 ? 'compact-list' : 'two-column'),
      skills: 'categorized',
      education: 'detailed',
    },
    sections: { order: ['education', 'experience', 'skills', 'projects', 'certifications'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'serif' as const,
    atsCompatibility: 95,
    atsLevel: 'ATS-Safe' as const,
    designStyle: 'Traditional',
    experienceLevel: 'All' as const,
    photoSupport: true,
    photoSize: 60,
    industryTags: ['education', 'healthcare', 'government'],
  })),

  // ========== ENTRY-STUDENT (20 templates) ==========
  ...['navy', 'emerald', 'purple', 'orange', 'teal', 'slate', 'burgundy', 'navy', 'emerald', 'purple', 'orange', 'teal', 'slate', 'burgundy', 'navy', 'emerald', 'purple', 'orange', 'teal', 'slate'].map((color, i) => ({
    name: `Student - Entry ${i + 1}`,
    description: `Beginner-friendly template with ${colorSchemes[color as keyof typeof colorSchemes].name} colors`,
    category: 'entry-student',
    layout: i < 15 ? 'single-column' as const : 'two-column-left' as const,
    components: {
      header: i % 3 === 0 ? 'minimal' : (i % 3 === 1 ? 'compact-single-line' : 'two-column'),
      experience: i % 2 === 0 ? 'bullet-point' : 'icon-based',
      skills: i % 2 === 0 ? 'compact-list' : 'icon',
      education: i % 2 === 0 ? 'timeline' : 'minimalist',
      ...(i >= 15 && { sidebar: i % 2 === 0 ? 'contact' : 'icon-contact' }),
    },
    sections: { order: ['education', 'experience', 'skills', 'projects'] },
    colorScheme: color as keyof typeof colorSchemes,
    fontConfig: 'sans' as const,
    atsCompatibility: i < 10 ? 92 : 88,
    atsLevel: i < 10 ? 'ATS-Safe' as const : 'ATS-Friendly' as const,
    designStyle: 'Minimal',
    experienceLevel: 'Entry' as const,
    photoSupport: true,
    photoSize: 100,
    industryTags: ['education', 'technology', 'business'],
  })),
];

console.log(`📊 Generated ${templates.length} template recipes`);

async function generateTemplateVariants() {
  console.log('🚀 Generating template variants...\n');

  // Clear existing templates (optional - comment out to keep old ones)
  console.log('🗑️  Clearing existing templates...');
  await prisma.resumeTemplate.deleteMany({});
  console.log('✅ Cleared existing templates\n');

  let createdCount = 0;

  for (const recipe of templates) {
    const templateConfig = {
      id: '', // Will be set after creation
      name: recipe.name,
      description: recipe.description,
      layout: recipe.layout,
      components: recipe.components,
      sections: recipe.sections,
      colorScheme: colorSchemes[recipe.colorScheme],
      fontConfig: fonts[recipe.fontConfig],
      category: recipe.category,
      atsCompatibility: recipe.atsCompatibility,
      photoSupport: recipe.photoSupport,
      photoSize: recipe.photoSize,
      experienceLevel: recipe.experienceLevel.toLowerCase(),
    };

    // Create template in database
    const template = await prisma.resumeTemplate.create({
      data: {
        name: recipe.name,
        description: recipe.description,
        templateConfig: templateConfig as any,
        isDefault: createdCount === 0, // First template is default
        isPremium: recipe.experienceLevel === 'Executive' || recipe.category === 'executive-leadership',
        isAtsSafe: recipe.atsCompatibility >= 90,
        primaryCategory: recipe.category,
        designStyle: recipe.designStyle,
        pageLength: 'Single',
        atsCompatibility: recipe.atsLevel,
        industryTags: recipe.industryTags,
        targetRoles: [],
        experienceLevel: recipe.experienceLevel,
        searchKeywords: [recipe.name, recipe.category, recipe.designStyle, colorSchemes[recipe.colorScheme].name],
        popularityScore: Math.floor(Math.random() * 100), // Random for now
        isFeatured: createdCount < 12, // First 12 are featured
        supportedFormats: ['pdf', 'docx'],
        usageCount: 0,
        photoSupport: recipe.photoSupport,
      },
    });

    // Update config with actual ID
    templateConfig.id = template.id;
    await prisma.resumeTemplate.update({
      where: { id: template.id },
      data: { templateConfig: templateConfig as any },
    });

    createdCount++;
    console.log(`✅ Created: ${recipe.name} (${recipe.category})`);
  }

  // Print summary by category
  console.log('\n📊 SUMMARY:');
  const categories = [...new Set(templates.map(t => t.category))];
  for (const category of categories) {
    const count = templates.filter(t => t.category === category).length;
    console.log(`   ${category}: ${count} templates`);
  }
  console.log(`\n✅ Successfully created ${createdCount} template variants!`);
}

generateTemplateVariants()
  .catch((error) => {
    console.error('❌ Error generating templates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
