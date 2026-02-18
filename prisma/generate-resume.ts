import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'aligenius@gmail.com';
const OLD_RESUME_ID = '7d645aa4-d5e9-4f21-a44c-a756b785573a';

// Public placeholder photo (no upload needed)
const DUMMY_PHOTO = 'https://randomuser.me/api/portraits/men/32.jpg';

const parsedData = {
  contact: {
    name: 'Ali Yousaf',
    email: 'aligenius@gmail.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/aligenius',
    github: 'github.com/aligenius',
    website: 'aligenius.dev',
    photoUrl: DUMMY_PHOTO,
  },

  summary:
    'Senior Software Engineer with 9+ years of experience designing and delivering scalable, high-availability ' +
    'distributed systems across fintech, e-commerce, and SaaS. Proven track record leading cross-functional ' +
    'engineering teams of 6–12, architecting event-driven microservices, and driving measurable outcomes: ' +
    '60% latency reduction, 45% fewer incidents, $2M+ in daily transaction throughput. Deep expertise in ' +
    'cloud infrastructure (AWS/GCP), Kubernetes, and modern full-stack development. Active open-source ' +
    'contributor and community mentor passionate about developer experience, engineering culture, and giving ' +
    'back through code education initiatives.',

  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      current: true,
      description: [
        'Architected and led migration of a monolithic e-commerce platform (~3M LOC) to microservices, enabling daily deployments (up from bi-weekly) and cutting production incidents by 45%.',
        'Designed real-time inventory sync service handling 50k+ events/sec with Kafka and Redis Streams, maintaining 99.99% uptime over 18 months.',
        'Led a team of 8 engineers across 3 time zones; introduced trunk-based development and GitHub Actions CI/CD pipelines reducing PR cycle time from 4 days to 18 hours.',
        'Profiled and eliminated API bottlenecks reducing p99 latency from 820ms to 110ms through query optimisation, connection pooling, and an in-process LRU cache.',
        'Designed multi-tenant OAuth 2.0 / JWT auth system that onboarded 250+ enterprise clients with zero security incidents across 24 months.',
        'Mentored 4 mid-level engineers; 2 promoted to senior within a year under structured 1-on-1s and growth plans.',
      ],
    },
    {
      title: 'Software Engineer II',
      company: 'TechFlow Inc.',
      location: 'Austin, TX',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      current: false,
      description: [
        'Built and maintained core payment processing microservice (Node.js / TypeScript) handling $2M+ in daily transactions with PCI-DSS Level 1 compliance.',
        'Designed and shipped A/B testing framework used across 6 product teams for 30+ concurrent experiments; contributed to an 18% increase in checkout conversion.',
        'Led Postgres migration from MySQL: designed schema, wrote migration scripts, added covering indexes — reducing slow queries from 120/day to under 15.',
        'Reduced cloud spend by $18k/month by right-sizing EC2 instances and moving cold-path workloads to Lambda.',
        'Authored internal tooling library (npm) adopted by 12 engineering teams, eliminating ~400 lines of boilerplate per service.',
        'Ran weekly code-review calibration sessions; reduced review turnaround from 3 days to same-day.',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: 'Jun 2016',
      endDate: 'Feb 2018',
      current: false,
      description: [
        'Built RESTful and GraphQL APIs powering a SaaS analytics dashboard used by 5,000+ customers in 30 countries.',
        'Integrated Stripe, Twilio, Salesforce, and Segment APIs into a unified data pipeline, eliminating 15 hours of weekly manual operations work.',
        'Established integration test suite (Jest + Supertest) from zero, achieving 85% code coverage and cutting production regressions by 60%.',
        'Proposed and implemented a Redis caching layer for report generation, reducing average load time from 12s to 1.4s.',
      ],
    },
    {
      title: 'Junior Software Engineer',
      company: 'Brightware Solutions',
      location: 'Chicago, IL',
      startDate: 'Jul 2015',
      endDate: 'May 2016',
      current: false,
      description: [
        'Developed internal HR portal features using Angular and .NET, serving 800+ employees across 6 offices.',
        'Resolved 60+ production bugs within first 6 months; improved logging/monitoring coverage enabling faster root-cause analysis.',
        'Contributed to on-call rotation and authored runbooks adopted as team standard operating procedures.',
        'Participated in biweekly architecture reviews, gaining exposure to microservices patterns and cloud migration planning.',
      ],
    },
  ],

  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2015',
      gpa: '3.82',
      achievements: [
        "Dean's List — 4 consecutive semesters",
        'Senior thesis: "Practical Distributed Consensus: Raft vs. Paxos in Real-World Networks"',
        'Teaching Assistant — CS 61B Data Structures (2 semesters)',
        'ACM ICPC Regional Qualifier — Team Lead',
      ],
    },
    {
      degree: 'Online Specialisation — Cloud Architecture',
      institution: 'Coursera / Google Cloud',
      location: 'Online',
      graduationDate: 'Dec 2020',
      achievements: [
        'Completed 5-course specialisation covering GCP infrastructure, Kubernetes, and site reliability engineering.',
        'Capstone project: Designed multi-region active-active architecture for a fictional fintech platform.',
      ],
    },
    {
      degree: 'High School Diploma — Computer Science & Mathematics',
      institution: 'Lincoln High School',
      location: 'Chicago, IL',
      graduationDate: 'Jun 2011',
      gpa: '4.0',
      achievements: [
        'Valedictorian',
        'Founded school programming club — grew to 40 members in first year',
        'State-level Science Olympiad — 1st Place, Computer Science event',
      ],
    },
  ],

  // Skills must be a flat string array for the frontend to render correctly
  skills: [
    // Languages
    'TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'Bash', 'Rust',
    // Backend
    'Node.js', 'Express', 'Fastify', 'NestJS', 'GraphQL', 'REST APIs', 'gRPC', 'tRPC',
    // Frontend
    'React', 'Next.js', 'Tailwind CSS', 'Redux', 'React Query', 'Vite',
    // Databases
    'PostgreSQL', 'MySQL', 'Redis', 'MongoDB', 'Elasticsearch', 'DynamoDB',
    // Messaging
    'Apache Kafka', 'RabbitMQ', 'AWS SQS/SNS', 'Redis Streams',
    // Cloud & DevOps
    'AWS (EKS, EC2, S3, RDS, Lambda)', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Helm',
    'GitHub Actions', 'CircleCI', 'Datadog', 'Prometheus', 'Grafana',
    // Architecture
    'Microservices', 'Event-driven design', 'CQRS', 'Domain-driven design', 'Saga pattern',
  ],

  // Certifications must be a flat string array
  certifications: [
    'AWS Certified Solutions Architect – Professional (Mar 2023)',
    'Certified Kubernetes Administrator – CKA (Sep 2022)',
    'HashiCorp Certified: Terraform Associate (Jan 2022)',
    'Google Professional Cloud Architect (Jun 2021)',
    'AWS Certified Developer – Associate (Aug 2020)',
    'MongoDB Certified Developer Associate (Mar 2019)',
  ],

  projects: [
    {
      name: 'OpenMetrics Dashboard',
      description:
        'Open-source Kubernetes observability dashboard built with React, Prometheus, and Grafana. Supports multi-cluster monitoring, custom alert rules, and Slack/PagerDuty integrations. 1,200+ GitHub stars, 40+ contributors, used by 3 production companies.',
      technologies: ['React', 'TypeScript', 'Prometheus', 'Grafana', 'Kubernetes', 'Helm'],
      url: 'github.com/aligenius/openmetrics-dashboard',
    },
    {
      name: 'Distributed Rate Limiter',
      description:
        'Production-grade Redis-backed distributed rate limiter for Node.js supporting sliding window, fixed window, and token bucket algorithms. Published on npm — 15k+ weekly downloads, used in 3 production services at TechFlow.',
      technologies: ['Node.js', 'TypeScript', 'Redis', 'Lua scripting'],
      url: 'github.com/aligenius/redis-rate-limiter',
    },
    {
      name: 'EventBus — Lightweight In-Process Event System',
      description:
        'Zero-dependency TypeScript event bus with dead-letter queues, retry policies, and OpenTelemetry tracing support. Designed for microservices that need intra-process eventing before scaling to Kafka.',
      technologies: ['TypeScript', 'OpenTelemetry', 'Node.js'],
      url: 'github.com/aligenius/eventbus',
    },
    {
      name: 'QueryLens — Slow Query Analyser',
      description:
        'CLI tool that ingests PostgreSQL slow query logs and generates an interactive HTML report with index recommendations, query plan visualisations, and estimated cost savings. Used internally at Acme Corp to cut slow queries by 80%.',
      technologies: ['Python', 'PostgreSQL', 'Click', 'Jinja2', 'D3.js'],
      url: 'github.com/aligenius/querylens',
    },
    {
      name: 'AutoDeploy — GitHub Actions Toolkit',
      description:
        'Reusable GitHub Actions workflow library for zero-downtime Kubernetes deployments with automated rollback, Slack notifications, and environment promotion gates. Adopted by 5 teams at Acme Corp.',
      technologies: ['GitHub Actions', 'Kubernetes', 'Bash', 'YAML', 'Helm'],
      url: 'github.com/aligenius/autodeploy',
    },
  ],

  volunteerWork: [
    {
      role: 'Lead Coding Instructor',
      organization: 'Code for Good — SF Chapter',
      location: 'San Francisco, CA',
      startDate: 'Sep 2022',
      endDate: 'Present',
      current: true,
      description: [
        'Design and deliver a 12-week full-stack web development curriculum (HTML, CSS, JavaScript, Node.js) for underserved youth aged 16–22.',
        'Manage a cohort of 20 students per cycle with a 78% course completion rate, above the national average of 62%.',
        'Mentored 8 graduates who secured their first tech jobs or internships at Salesforce, Lyft, and various startups.',
        'Coordinate with 5 volunteer TAs and guest speakers to broaden students\' professional networks.',
      ],
    },
    {
      role: 'Open Source Mentor',
      organization: 'Google Summer of Code',
      location: 'Remote',
      startDate: 'May 2023',
      endDate: 'Sep 2023',
      current: false,
      description: [
        'Mentored 2 university students contributing to open-source Node.js tooling projects over 14 weeks.',
        'Conducted weekly code reviews, provided architecture guidance, and helped students navigate large codebases.',
        'Both students had pull requests merged into production projects with 10k+ active users.',
      ],
    },
    {
      role: 'Technical Interview Coach',
      organization: 'Techies Without Borders',
      location: 'Remote',
      startDate: 'Jan 2021',
      endDate: 'Present',
      current: true,
      description: [
        'Volunteer 3 hours per week coaching refugees and displaced individuals preparing for software engineering roles.',
        'Conducted 80+ mock interviews covering data structures, algorithms, system design, and behavioural rounds.',
        '65% of coached candidates received a job offer within 3 months, vs. a 30% industry baseline.',
      ],
    },
    {
      role: 'Hackathon Organizer & Judge',
      organization: 'HackBay — Annual Bay Area Hackathon',
      location: 'San Francisco, CA',
      startDate: 'Mar 2020',
      endDate: 'Present',
      current: true,
      description: [
        'Co-organise annual 48-hour hackathon attracting 300+ participants across 80+ teams from 20+ universities.',
        'Recruit sponsors, manage $50k logistics budget, set judging criteria, and lead a panel of 12 industry judges.',
        'Focus tracks include civic tech, accessibility, and AI for social good.',
      ],
    },
    {
      role: 'STEM Tutor',
      organization: 'Boys & Girls Club of America',
      location: 'Chicago, IL',
      startDate: 'Sep 2013',
      endDate: 'Jun 2015',
      current: false,
      description: [
        'Tutored 15 high school students weekly in mathematics, physics, and introductory programming.',
        'Helped 3 students gain admission to CS programmes at top-10 universities.',
        'Organised a year-end robotics showcase attended by 200+ community members.',
      ],
    },
  ],

  // Languages must be a flat string array
  languages: [
    'English (Native)',
    'Arabic (Professional Working Proficiency)',
    'Spanish (Conversational)',
    'French (Elementary)',
  ],

  // Awards must be a flat string array
  awards: [
    'Engineer of the Year — Acme Corp (2023): Recognised for leading microservices migration delivering 45% incident reduction.',
    '1st Place — Internal AI Hackathon, Acme Corp (2022): Built AI-powered code review assistant using GPT-4 and AST analysis, adopted by 3 teams.',
    'Top Contributor — Node.js Ecosystem, OpenJS Foundation (2021): Recognised for open-source contributions with 15k+ weekly npm downloads.',
    'Outstanding Teaching Assistant Award — UC Berkeley, CS Dept (2014): Awarded by student vote for CS 61B Data Structures.',
    'ACM ICPC Regional Qualifier — 2nd Place (2014): Competed as team lead representing UC Berkeley.',
  ],
};

const rawText = `
Ali Yousaf
aligenius@gmail.com | +1 (555) 123-4567 | San Francisco, CA
linkedin.com/in/aligenius | github.com/aligenius | aligenius.dev

SUMMARY
Senior Software Engineer with 9+ years of experience across fintech, e-commerce, and SaaS. Led migrations, reduced latency 60%, mentored engineers, and actively volunteers as a coding instructor and interview coach.

EXPERIENCE
Senior Software Engineer – Acme Corp | San Francisco, CA | Jan 2021 – Present
Software Engineer II – TechFlow Inc. | Austin, TX | Mar 2018 – Dec 2020
Software Engineer – StartupXYZ | Remote | Jun 2016 – Feb 2018
Junior Software Engineer – Brightware Solutions | Chicago, IL | Jul 2015 – May 2016

EDUCATION
B.S. Computer Science – UC Berkeley | May 2015 | GPA: 3.82
Online Specialisation – Cloud Architecture, Google Cloud | Dec 2020
High School Diploma – Lincoln High School | Jun 2011 | GPA: 4.0

SKILLS
TypeScript, JavaScript, Python, Go, SQL, Bash, Node.js, React, Next.js, PostgreSQL, Redis, MongoDB, Kafka, AWS, GCP, Kubernetes, Docker, Terraform

CERTIFICATIONS
AWS Solutions Architect – Professional | CKA | Terraform Associate | Google Cloud Architect | AWS Developer Associate | MongoDB Developer Associate

PROJECTS
OpenMetrics Dashboard | Distributed Rate Limiter | EventBus | QueryLens | AutoDeploy

VOLUNTEER WORK
Lead Coding Instructor – Code for Good SF | Sep 2022 – Present
Open Source Mentor – Google Summer of Code | May–Sep 2023
Technical Interview Coach – Techies Without Borders | Jan 2021 – Present
Hackathon Organizer & Judge – HackBay | Mar 2020 – Present
STEM Tutor – Boys & Girls Club | Sep 2013 – Jun 2015

AWARDS
Engineer of the Year – Acme Corp 2023
1st Place AI Hackathon – Acme Corp 2022
Top Contributor – OpenJS Foundation 2021
Outstanding TA Award – UC Berkeley 2014
ACM ICPC Regional 2nd Place 2014

LANGUAGES
English (Native), Arabic (Professional), Spanish (Conversational), French (Elementary)
`.trim();

async function main() {
  // 1. Find the user
  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    console.error(`❌  User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }
  console.log(`✅  Found user: ${user.firstName ?? ''} ${user.lastName ?? ''} <${user.email}>`);

  // 2. Delete old resume
  const existing = await prisma.resume.findUnique({ where: { id: OLD_RESUME_ID } });
  if (existing) {
    await prisma.resume.delete({ where: { id: OLD_RESUME_ID } });
    console.log(`🗑️   Deleted old resume: ${OLD_RESUME_ID}`);
  } else {
    console.log(`ℹ️   Old resume not found, continuing...`);
  }

  // 3. Create new resume with photo
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Senior Software Engineer Resume',
      originalFileName: 'ali-yousaf-sr-software-engineer.pdf',
      originalFileUrl: '',
      originalFileKey: '',
      rawText,
      parsedData,
      parseStatus: 'completed',
      isBase: true,
      photoUrl: DUMMY_PHOTO,
    },
  });

  const pd = parsedData as any;
  console.log(`✅  Resume created:`);
  console.log(`    ID    : ${resume.id}`);
  console.log(`    Title : ${resume.title}`);
  console.log(`    Photo : ${resume.photoUrl}`);
  console.log(`\n    Sections:`);
  console.log(`    • Summary        : ✓`);
  console.log(`    • Experience     : ${pd.experience.length} roles`);
  console.log(`    • Education      : ${pd.education.length} entries`);
  console.log(`    • Skills         : ${pd.skills.length} skills (flat array)`);
  console.log(`    • Certifications : ${pd.certifications.length} (flat array)`);
  console.log(`    • Projects       : ${pd.projects.length}`);
  console.log(`    • Volunteer Work : ${pd.volunteerWork.length} entries`);
  console.log(`    • Awards         : ${pd.awards.length} (flat array)`);
  console.log(`    • Languages      : ${pd.languages.length} (flat array)`);
  console.log(`\n   Log in as ${TARGET_EMAIL} at http://localhost:3000 to view.`);
}

main()
  .catch((e) => {
    console.error('❌  Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
