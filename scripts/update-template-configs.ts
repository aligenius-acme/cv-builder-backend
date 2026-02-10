/**
 * Update Template Configurations
 * Adds modular component configurations to existing templates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define modular configurations for different template styles
const modularConfigs: Record<string, any> = {
  // Modern/Minimal templates
  minimal: {
    layout: 'single-column',
    components: {
      header: 'minimal',
      experience: 'bullet-point',
      skills: 'compact-list',
      education: 'minimalist',
    },
    sections: {
      order: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    },
  },

  // Bold/Modern templates
  modern: {
    layout: 'single-column',
    components: {
      header: 'bold-modern',
      experience: 'timeline-left',
      skills: 'progress-bars',
      education: 'timeline',
    },
    sections: {
      order: ['experience', 'education', 'skills', 'projects', 'certifications'],
    },
  },

  // Professional/Formal templates
  professional: {
    layout: 'single-column',
    components: {
      header: 'professional-formal',
      experience: 'bullet-point',
      skills: 'categorized',
      education: 'detailed',
    },
    sections: {
      order: ['summary', 'experience', 'education', 'skills', 'certifications'],
    },
  },

  // Timeline-based templates
  timeline: {
    layout: 'single-column',
    components: {
      header: 'minimal',
      experience: 'timeline-left',
      skills: 'compact-list',
      education: 'timeline',
    },
    sections: {
      order: ['experience', 'education', 'skills'],
    },
  },

  // Metrics-focused templates
  metrics: {
    layout: 'single-column',
    components: {
      header: 'bold-modern',
      experience: 'metrics-focused',
      skills: 'progress-bars',
      education: 'detailed',
    },
    sections: {
      order: ['experience', 'skills', 'education'],
    },
  },

  // Two-column with sidebar
  'two-column-left': {
    layout: 'two-column-left',
    components: {
      header: 'minimal',
      experience: 'bullet-point',
      skills: 'compact-list',
      education: 'minimalist',
      sidebar: 'contact',
    },
    sections: {
      order: ['experience', 'education'],
    },
  },

  'two-column-profile': {
    layout: 'two-column-left',
    components: {
      header: 'minimal',
      experience: 'timeline-left',
      skills: 'compact-list',
      education: 'timeline',
      sidebar: 'profile',
    },
    sections: {
      order: ['experience', 'education'],
    },
  },
};

// Color schemes
const colorSchemes: Record<string, any> = {
  navy: {
    name: 'Navy',
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    text: '#1e293b',
    muted: '#64748b',
    background: '#ffffff',
  },
  emerald: {
    name: 'Emerald',
    primary: '#047857',
    secondary: '#10b981',
    accent: '#6ee7b7',
    text: '#1e293b',
    muted: '#64748b',
    background: '#ffffff',
  },
  burgundy: {
    name: 'Burgundy',
    primary: '#881337',
    secondary: '#be123c',
    accent: '#fb7185',
    text: '#1e293b',
    muted: '#64748b',
    background: '#ffffff',
  },
  slate: {
    name: 'Slate',
    primary: '#334155',
    secondary: '#64748b',
    accent: '#94a3b8',
    text: '#1e293b',
    muted: '#64748b',
    background: '#ffffff',
  },
};

// Font configurations
const fontConfigs: Record<string, any> = {
  sans: {
    headingFont: 'sans',
    bodyFont: 'sans',
    size: 'medium',
  },
  serif: {
    headingFont: 'serif',
    bodyFont: 'serif',
    size: 'medium',
  },
};

async function updateTemplateConfigs() {
  console.log('🔄 Updating template configurations...\n');

  // Get all templates
  const templates = await prisma.resumeTemplate.findMany({
    select: {
      id: true,
      name: true,
      designStyle: true,
      templateConfig: true,
    },
  });

  let updatedCount = 0;

  for (const template of templates) {
    const name = template.name.toLowerCase();
    const designStyle = (template.designStyle || '').toLowerCase();

    // Determine which modular config to use based on template name/style
    let configType = 'professional'; // default

    if (name.includes('minimal') || name.includes('clean')) {
      configType = 'minimal';
    } else if (name.includes('modern') || name.includes('bold')) {
      configType = 'modern';
    } else if (name.includes('timeline')) {
      configType = 'timeline';
    } else if (name.includes('metrics') || name.includes('achievement')) {
      configType = 'metrics';
    } else if (name.includes('two-column') || designStyle.includes('two-column')) {
      configType = name.includes('profile') ? 'two-column-profile' : 'two-column-left';
    }

    // Determine color scheme
    let colorScheme = colorSchemes.navy; // default
    if (name.includes('emerald') || name.includes('green')) {
      colorScheme = colorSchemes.emerald;
    } else if (name.includes('burgundy') || name.includes('red')) {
      colorScheme = colorSchemes.burgundy;
    } else if (name.includes('slate') || name.includes('gray')) {
      colorScheme = colorSchemes.slate;
    }

    // Determine font
    const fontConfig = name.includes('formal') || name.includes('traditional')
      ? fontConfigs.serif
      : fontConfigs.sans;

    // Build complete modular config
    const modularConfig = {
      id: template.id,
      name: template.name,
      description: `Modular template configuration for ${template.name}`,
      ...modularConfigs[configType],
      colorScheme,
      fontConfig,
      category: 'professional',
      atsCompatibility: 85,
      photoSupport: true,
      experienceLevel: 'all' as const,
    };

    // Update template
    await prisma.resumeTemplate.update({
      where: { id: template.id },
      data: {
        templateConfig: modularConfig as any,
      },
    });

    updatedCount++;
    console.log(`✅ Updated: ${template.name} (${configType})`);
  }

  console.log(`\n✅ Updated ${updatedCount} templates with modular configurations`);
}

updateTemplateConfigs()
  .catch((error) => {
    console.error('❌ Error updating templates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
