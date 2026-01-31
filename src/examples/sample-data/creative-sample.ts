/**
 * Sample Resume Data - Creative/Design
 * For generating previews of creative design templates
 */

import { ParsedResumeData } from '../../types';

export const creativeSampleData: ParsedResumeData = {
  contact: {
    name: 'Jordan Blake',
    email: 'jordan@blakedesign.com',
    phone: '(555) 345-6789',
    location: 'Los Angeles, CA',
    linkedin: 'linkedin.com/in/jordanblake',
    website: 'jordanblake.design',
    portfolio: 'behance.net/jordanblake',
  },

  summary: 'Award-winning UX/UI Designer and Creative Director with 8+ years crafting intuitive digital experiences for startups and Fortune 500 companies. Specializing in mobile-first design, design systems, and user research. Led design for products with 10M+ users. Passionate about inclusive design and mentoring emerging designers.',

  experience: [
    {
      company: 'Netflix',
      position: 'Senior Product Designer',
      location: 'Los Angeles, CA',
      startDate: '2021-02',
      endDate: 'Present',
      highlights: [
        'Lead design for Netflix mobile app features used by 50M+ monthly active users',
        'Redesigned onboarding experience resulting in 35% improvement in user activation and 28% reduction in churn',
        'Established design system components used across 15+ product teams, improving design consistency and development velocity',
        'Conducted user research with 200+ participants to inform personalization features',
        'Collaborated with engineering, product, and data science teams in agile environment',
        'Mentored 3 junior designers and led weekly design critique sessions',
      ],
    },
    {
      company: 'Airbnb',
      position: 'Product Designer',
      location: 'San Francisco, CA',
      startDate: '2018-06',
      endDate: '2021-01',
      highlights: [
        'Designed end-to-end booking flow improvements that increased conversion rate by 22%',
        'Led design for host dashboard redesign, improving host satisfaction scores by 40%',
        'Created interactive prototypes using Figma and Framer for stakeholder presentations',
        'Collaborated with 15+ cross-functional partners including PM, engineering, and research',
        'Contributed to Airbnb Design Language System (DLS) used company-wide',
        'Presented design work at Airbnb Design Talks to audience of 500+ designers',
      ],
    },
    {
      company: 'Digital Agency Co.',
      position: 'UX Designer',
      location: 'San Francisco, CA',
      startDate: '2016-08',
      endDate: '2018-05',
      highlights: [
        'Designed websites and mobile apps for 20+ clients including Coca-Cola, Nike, and Adobe',
        'Led user research initiatives including interviews, usability testing, and A/B testing',
        'Created wireframes, mockups, and interactive prototypes for client presentations',
        'Worked directly with clients to understand business goals and translate into design solutions',
        'Managed projects from discovery through launch, ensuring on-time delivery',
      ],
    },
  ],

  education: [
    {
      institution: 'Rhode Island School of Design (RISD)',
      degree: 'Bachelor of Fine Arts in Graphic Design',
      location: 'Providence, RI',
      graduationDate: '2016-05',
      honors: ['Presidential Scholarship Recipient', 'Senior Thesis Exhibition'],
    },
  ],

  skills: [
    {
      category: 'Design Tools',
      items: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'After Effects', 'Framer', 'Principle'],
    },
    {
      category: 'UX/UI Skills',
      items: ['User Research', 'Wireframing', 'Prototyping', 'Interaction Design', 'Visual Design', 'Design Systems', 'Usability Testing'],
    },
    {
      category: 'Front-End',
      items: ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design', 'Accessibility (WCAG)', 'Animation'],
    },
    {
      category: 'Methodologies',
      items: ['Design Thinking', 'Agile/Scrum', 'Human-Centered Design', 'Lean UX', 'A/B Testing', 'Design Sprints'],
    },
  ],

  projects: [
    {
      name: 'MindfulMoments - Meditation App',
      description: 'Personal project: iOS app for guided meditation and mindfulness',
      technologies: ['Figma', 'React Native', 'After Effects'],
      url: 'mindfulmoments.app',
      highlights: [
        'Featured in Apple App Store "Apps We Love" collection',
        '100K+ downloads with 4.8-star rating',
        'Designed complete brand identity and app experience',
      ],
    },
    {
      name: 'Open Source - Figma Plugin Library',
      description: 'Collection of Figma plugins for design system management',
      technologies: ['TypeScript', 'Figma API', 'React'],
      url: 'github.com/jordanblake/figma-plugins',
      highlights: [
        '5K+ active users across 500+ companies',
        'Featured in Figma Community showcase',
      ],
    },
  ],

  awards: [
    'Webby Award - Best User Experience (2023)',
    'Awwwards - Site of the Day (2022)',
    'Adobe Design Achievement Awards - Semifinalist (2021)',
    'Red Dot Design Award - Communication Design (2020)',
  ],

  publications: [
    {
      title: 'Designing for Accessibility: A Practical Guide',
      venue: 'Smashing Magazine',
      year: '2023',
      type: 'Article',
    },
    {
      title: 'The Future of Mobile Design Systems',
      venue: 'UX Collective',
      year: '2022',
      type: 'Article',
    },
  ],

  speaking: [
    'Adobe MAX - "Building Scalable Design Systems" (2023)',
    'Figma Config - "Collaborative Design in Remote Teams" (2022)',
    'Interaction 23 - Panel on "Ethics in UX Design" (2023)',
  ],

  certifications: [
    {
      name: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      date: '2020-08',
    },
    {
      name: 'Certified Usability Analyst (CUA)',
      issuer: 'Human Factors International',
      date: '2019-11',
    },
  ],
};

export default creativeSampleData;
