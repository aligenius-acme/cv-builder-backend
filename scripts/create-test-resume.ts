import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parsedData = {
  contact: {
    name: 'Ali Genius',
    email: 'aligenius@gmail.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/aligenius',
    github: 'github.com/aligenius',
    website: 'aligenius.dev',
  },
  summary:
    'Results-driven Software Engineer with 6+ years of experience building scalable web applications and leading cross-functional teams. Passionate about clean architecture, developer experience, and shipping impactful products.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: '',
      current: true,
      description: [
        'Led architecture and delivery of a microservices platform serving 2M+ active users, reducing p99 latency by 40%.',
        'Managed a team of 8 engineers across 3 time zones, improving sprint velocity by 30% through process improvements.',
        'Reduced cloud infrastructure costs by $200K/year by migrating workloads to containerised deployments.',
        'Designed and implemented CI/CD pipelines that cut release cycle time from 2 weeks to 3 days.',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      current: false,
      description: [
        'Built the core customer-facing dashboard using React and TypeScript, adopted by 500+ enterprise clients.',
        'Integrated 12 third-party APIs (Stripe, Twilio, SendGrid) and reduced integration error rate by 65%.',
        'Wrote comprehensive test suites achieving 90% code coverage across critical payment flows.',
        'Mentored 3 junior engineers through onboarding and code reviews.',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'Digital Agency Co.',
      location: 'Remote',
      startDate: 'Jun 2016',
      endDate: 'Feb 2018',
      current: false,
      description: [
        'Delivered 20+ client websites using React, Vue.js, and WordPress under tight deadlines.',
        'Optimised page load times by an average of 55% through image compression and lazy loading.',
        'Collaborated directly with clients to gather requirements and iterate on design feedback.',
      ],
    },
  ],
  education: [
    {
      degree: 'B.Sc. Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2016',
      gpa: '3.8',
      achievements: ["Dean's List (4 semesters)", 'Senior Thesis: Distributed Caching Strategies'],
    },
  ],
  skills: [
    'TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'Next.js',
    'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'CI/CD',
    'REST APIs', 'GraphQL', 'Prisma', 'Git', 'Agile/Scrum', 'System Design',
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2022' },
    { name: 'Professional Scrum Master I (PSM I)', issuer: 'Scrum.org', date: '2021' },
  ],
  projects: [
    {
      name: 'OpenMetrics Dashboard',
      description:
        'Open-source real-time analytics dashboard with customisable widgets, used by 3K+ developers on GitHub.',
      technologies: ['React', 'D3.js', 'Node.js', 'WebSockets'],
      url: 'github.com/aligenius/open-metrics',
    },
  ],
  languages: ['English (Native)', 'Arabic (Professional)'],
  awards: [{ name: 'Engineer of the Quarter', issuer: 'TechCorp Inc.', date: 'Q3 2022' }],
};

const rawText = [
  'Ali Genius',
  'aligenius@gmail.com | +1 (555) 123-4567 | San Francisco, CA',
  'LinkedIn: linkedin.com/in/aligenius | GitHub: github.com/aligenius',
  '',
  'SUMMARY',
  parsedData.summary,
  '',
  'EXPERIENCE',
  'Senior Software Engineer at TechCorp Inc., San Francisco, CA',
  'Jan 2021 - Present',
  '• Led architecture and delivery of a microservices platform serving 2M+ active users, reducing p99 latency by 40%.',
  '• Managed a team of 8 engineers across 3 time zones, improving sprint velocity by 30%.',
  '• Reduced cloud infrastructure costs by $200K/year by migrating workloads to containerised deployments.',
  '• Designed CI/CD pipelines that cut release cycle from 2 weeks to 3 days.',
  '',
  'Software Engineer at StartupXYZ, Austin, TX',
  'Mar 2018 - Dec 2020',
  '• Built the core customer-facing dashboard using React and TypeScript, adopted by 500+ enterprise clients.',
  '• Integrated 12 third-party APIs and reduced integration error rate by 65%.',
  '• Wrote test suites achieving 90% code coverage across critical payment flows.',
  '• Mentored 3 junior engineers.',
  '',
  'Junior Developer at Digital Agency Co., Remote',
  'Jun 2016 - Feb 2018',
  '• Delivered 20+ client websites using React, Vue.js, and WordPress.',
  '• Optimised page load times by 55% through image compression and lazy loading.',
  '',
  'EDUCATION',
  'B.Sc. Computer Science',
  'University of California, Berkeley',
  'May 2016 | GPA: 3.8',
  "• Dean's List (4 semesters)",
  '',
  'SKILLS',
  parsedData.skills.join(', '),
  '',
  'CERTIFICATIONS',
  '• AWS Certified Solutions Architect – Associate (2022)',
  '• Professional Scrum Master I (PSM I) (2021)',
  '',
  'PROJECTS',
  'OpenMetrics Dashboard',
  'Open-source real-time analytics dashboard with customisable widgets, used by 3K+ developers on GitHub.',
  'Technologies: React, D3.js, Node.js, WebSockets',
  '',
  'LANGUAGES',
  'English (Native), Arabic (Professional)',
  '',
  'AWARDS & HONORS',
  '• Engineer of the Quarter — TechCorp Inc. — Q3 2022',
].join('\n');

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'aligenius@gmail.com' },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error('User not found: aligenius@gmail.com');
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (${user.id})`);

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Ali Genius – Software Engineer Resume',
      originalFileName: 'ali_genius_resume.pdf',
      originalFileUrl: 'test://placeholder/ali_genius_resume.pdf',
      originalFileKey: 'test/placeholder/ali_genius_resume.pdf',
      rawText,
      parsedData,
      parseStatus: 'completed',
      isBase: true,
    },
  });

  console.log('Resume created successfully!');
  console.log('  ID:     ', resume.id);
  console.log('  Title:  ', resume.title);
  console.log('  Status: ', resume.parseStatus);
  console.log('  User:   ', user.email);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
