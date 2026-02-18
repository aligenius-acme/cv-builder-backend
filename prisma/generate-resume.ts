import { PrismaClient } from '@prisma/client';
import { fullCustomizationPipeline } from '../src/services/ai';
import { ParsedResumeData } from '../src/types';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'aligenius@gmail.com';

// Public placeholder photo (no upload needed)
const DUMMY_PHOTO = 'https://randomuser.me/api/portraits/men/32.jpg';

// ─── Resume data: Senior Solutions Architect matching the Lumen JD ────────────
// Keywords in JD: solutions architecture, cloud architecture, network architecture,
// cybersecurity, IT service management, technical leadership, connectivity,
// business growth, teamwork, trust, transparency, digital transformation, MPLS,
// SD-WAN, enterprise solutions, pre-sales, ITIL, fiber, data center
const parsedData = {
  contact: {
    name: 'Ali Yousaf',
    email: 'aligenius@gmail.com',
    phone: '+1 (312) 555-8901',
    location: 'Dallas, TX',
    linkedin: 'linkedin.com/in/aligenius',
    github: 'github.com/aligenius',
    website: 'aligenius.dev',
    photoUrl: DUMMY_PHOTO,
  },

  summary:
    'Senior Solutions Architect with 11+ years designing and delivering enterprise connectivity, ' +
    'cloud transformation, and network architecture solutions for Fortune 500 organizations. ' +
    'Specialist in SD-WAN, MPLS, and hybrid cloud connectivity driving measurable business growth ' +
    'through consultative technical leadership. Proven pre-sales record with $75M+ TCV across ' +
    'healthcare, finance, and manufacturing verticals. Deep expertise in cybersecurity frameworks ' +
    '(NIST, Zero Trust), IT service management (ITIL 4), and cross-functional team leadership. ' +
    'Passionate about building cultures of teamwork, trust, and transparency that deliver ' +
    'lasting digital transformation outcomes.',

  experience: [
    {
      title: 'Senior Lead Solutions Architect',
      company: 'CenturyLink (Lumen Technologies)',
      location: 'Dallas, TX',
      startDate: 'Mar 2020',
      endDate: 'Present',
      current: true,
      description: [
        'Lead solution architecture for 50+ enterprise accounts, designing SD-WAN, MPLS, and fiber connectivity solutions with $75M+ total contract value over 4 years.',
        'Drive business growth by 42% YoY as technical lead for strategic pre-sales engagements — translating complex connectivity requirements into compelling solution designs for C-suite stakeholders.',
        'Architect hybrid cloud connectivity solutions (AWS Direct Connect, Azure ExpressRoute, GCP Interconnect) for multi-site enterprise deployments across 300+ locations globally.',
        'Lead a cross-functional team of 12 solutions engineers and network architects; established practice-wide standards for solution design, technical documentation, and customer onboarding.',
        'Spearhead cybersecurity architecture practice — designed Zero Trust frameworks and SASE deployments for 8 regulated-industry clients, achieving full NIST CSF alignment.',
        'Champion culture of teamwork, trust, and transparency through weekly architecture reviews, shared design repositories, and open post-mortem processes across the team.',
      ],
    },
    {
      title: 'Solutions Architect — Enterprise Connectivity',
      company: 'AT&T Business Solutions',
      location: 'Chicago, IL',
      startDate: 'Jun 2016',
      endDate: 'Feb 2020',
      current: false,
      description: [
        'Architected and delivered MPLS and SD-WAN network for Fortune 100 automotive manufacturer across 150+ global manufacturing sites, reducing WAN costs by $2.8M/year.',
        'Designed IT service management (ITSM) transformation using ServiceNow and ITIL 4 best practices for a 12,000-seat financial services client, improving incident response SLA from 68% to 96%.',
        'Led cybersecurity architecture for healthcare network — implemented next-gen firewall (Palo Alto NGFW), micro-segmentation, and HIPAA-compliant data isolation, passing 3 audits with zero findings.',
        'Managed pre-sales technical engagements for 30+ mid-market to enterprise accounts, generating $28M in new connectivity business in FY2019.',
        'Mentored 6 junior architects; 4 promoted to senior roles; introduced architecture review board process adopted across the region.',
      ],
    },
    {
      title: 'Network Architect',
      company: 'Cisco Systems',
      location: 'San Jose, CA',
      startDate: 'Aug 2013',
      endDate: 'May 2016',
      current: false,
      description: [
        'Designed enterprise campus and data center network architectures (BGP, OSPF, EIGRP, VXLAN) for government and healthcare clients with 5,000–25,000 endpoint environments.',
        'Led technical architecture for 3 greenfield data center deployments using Cisco ACI (Application Centric Infrastructure), delivering 40% reduction in provisioning time.',
        'Authored connectivity and network architecture reference designs adopted as Cisco validated designs for SD-WAN and cloud on-ramp solutions.',
        'Delivered technical leadership on Cisco IWAN (Intelligent WAN) migrations for 12 enterprise customers, predecessor program to modern SD-WAN deployments.',
      ],
    },
    {
      title: 'Senior Network Engineer',
      company: 'Verizon Enterprise Solutions',
      location: 'New York, NY',
      startDate: 'Jul 2010',
      endDate: 'Jul 2013',
      current: false,
      description: [
        'Designed and maintained MPLS and private fiber connectivity for 40+ enterprise customers across financial services and media verticals.',
        'Led capacity planning and network architecture reviews supporting 99.99% SLA commitments across a 10,000-node backbone.',
        'Introduced structured ITIL incident and change management processes that cut mean time to resolve (MTTR) by 55%.',
      ],
    },
  ],

  education: [
    {
      degree: 'B.S. Electrical Engineering & Computer Science',
      institution: 'University of Illinois Urbana-Champaign',
      location: 'Champaign, IL',
      graduationDate: 'May 2010',
      gpa: '3.78',
      achievements: [
        "Dean's List — 6 semesters",
        'Senior capstone: "Software-Defined Networking and Programmable Infrastructure" — awarded Best Project by faculty panel',
        'IEEE Student Chapter President — organized 3 industry networking events with 200+ attendees',
        'Teaching Assistant — ECE 385 Digital Systems Laboratory (2 semesters)',
      ],
    },
    {
      degree: 'Executive Education — Business Strategy for Technology Leaders',
      institution: 'Kellogg School of Management, Northwestern University',
      location: 'Evanston, IL',
      graduationDate: 'Jun 2018',
      achievements: [
        '6-month program covering go-to-market strategy, consultative sales leadership, and P&L ownership for technology businesses.',
        'Capstone: Developed a market entry strategy for SD-WAN in the mid-market segment, presented to Kellogg faculty and AT&T senior leadership.',
      ],
    },
    {
      degree: 'ITIL 4 Managing Professional Transition Program',
      institution: 'Axelos / PeopleCert',
      location: 'Online',
      graduationDate: 'Sep 2021',
      achievements: [
        'Completed all 4 ITIL 4 Managing Professional modules: Create/Deliver/Support, Drive Stakeholder Value, High-velocity IT, Direct Plan Improve.',
      ],
    },
  ],

  // Skills must be a flat string array
  skills: [
    // Architecture
    'Solutions Architecture', 'Cloud Architecture', 'Network Architecture', 'Enterprise Architecture',
    'Data Center Design', 'Technical Leadership', 'Pre-Sales Architecture',
    // Networking
    'SD-WAN', 'MPLS', 'BGP', 'OSPF', 'EIGRP', 'VXLAN', 'Fiber Optics',
    'Cisco ACI', 'VMware NSX', 'Juniper Contrail',
    // Connectivity
    'Hybrid Cloud Connectivity', 'AWS Direct Connect', 'Azure ExpressRoute',
    'GCP Interconnect', 'SASE', 'UCaaS',
    // Security
    'Cybersecurity Architecture', 'Zero Trust Security', 'NIST CSF', 'SASE',
    'Palo Alto NGFW', 'Fortinet', 'CrowdStrike', 'HIPAA Compliance', 'SOC 2',
    // ITSM / Process
    'ITIL 4', 'IT Service Management', 'ServiceNow', 'Change Management',
    'Incident Management', 'SLA Management',
    // Cloud
    'AWS', 'Microsoft Azure', 'Google Cloud Platform',
    // Business
    'Business Growth Strategy', 'Enterprise Pre-Sales', 'Consultative Selling',
    'Digital Transformation', 'Stakeholder Management',
    // Tools
    'Cisco DNA Center', 'Meraki', 'Zscaler', 'Terraform', 'Ansible',
  ],

  // Certifications must be a flat string array
  certifications: [
    'Cisco CCIE Enterprise Infrastructure — #62847 (Active, Jan 2024)',
    'AWS Certified Solutions Architect – Professional (Aug 2023)',
    'ITIL 4 Managing Professional (Sep 2021)',
    'Certified Information Systems Security Professional – CISSP (Mar 2022)',
    'CompTIA Network+ (Sep 2010)',
    'Google Professional Cloud Architect (Nov 2022)',
    'VMware Certified Advanced Professional — Data Center Design (VCAP-DCD) (Apr 2019)',
  ],

  projects: [
    {
      name: 'SD-WAN Transformation — National Healthcare Network',
      description:
        'Led end-to-end solution architecture for a 220-site SD-WAN migration replacing legacy MPLS for a national hospital network. Designed dual-ISP active-active overlay, centralized policy management via Cisco vManage, and secure Internet breakout at each site. Reduced WAN costs by $3.2M/year while improving application performance by 60% (measured by Cisco ThousandEyes).',
      technologies: ['Cisco SD-WAN (Viptela)', 'MPLS', 'BGP', 'AWS Direct Connect', 'Cisco ThousandEyes'],
    },
    {
      name: 'Zero Trust Architecture — Financial Services Group',
      description:
        'Designed and delivered Zero Trust network architecture for a 15,000-user financial services firm. Implemented Zscaler ZIA/ZPA for identity-based access, micro-segmentation via Palo Alto Prisma, and continuous compliance monitoring against NIST CSF. Reduced attack surface by 75% and achieved SOC 2 Type II certification within 9 months.',
      technologies: ['Zero Trust', 'Zscaler', 'Palo Alto Prisma', 'NIST CSF', 'SOC 2'],
    },
    {
      name: 'Multi-Cloud Connectivity Platform',
      description:
        'Architected a reusable multi-cloud connectivity reference design connecting on-premises data centers to AWS, Azure, and GCP using a shared services hub. Used Terraform for IaC and BGP route policies for traffic engineering. Deployed for 6 enterprise clients; standard design reduced time-to-connect a new cloud region from 8 weeks to 4 days.',
      technologies: ['AWS Direct Connect', 'Azure ExpressRoute', 'GCP Interconnect', 'BGP', 'Terraform'],
      url: 'github.com/aligenius/multi-cloud-connectivity',
    },
    {
      name: 'ITSM Transformation — Global Manufacturing',
      description:
        'Led ITIL 4-aligned ITSM transformation for a 35,000-employee global manufacturer. Designed ServiceNow workflows for incident, problem, change, and request management. Migrated 8 regional helpdesks to a single global operations center. Achieved 95%+ SLA compliance within 6 months of go-live (up from 62%).',
      technologies: ['ServiceNow', 'ITIL 4', 'ITSM', 'Change Management', 'SLA Management'],
    },
    {
      name: 'Enterprise Fiber Build-Out Strategy',
      description:
        'Authored the connectivity strategy and business case for a 12-city fiber infrastructure expansion targeting healthcare and education verticals. Analysis included competitive benchmarking, ROI modeling, and phased deployment plan. Strategy approved by executive committee; first 4 markets deployed with 340% ROI in year 1.',
      technologies: ['Fiber Optics', 'Network Architecture', 'Business Growth Strategy', 'ROI Analysis'],
    },
  ],

  volunteerWork: [
    {
      role: 'Mentor — Technology Leadership Program',
      organization: 'Chicago Urban League',
      location: 'Chicago, IL',
      startDate: 'Sep 2018',
      endDate: 'Present',
      current: true,
      description: [
        'Mentor 4 early-career professionals from underrepresented communities pursuing careers in network engineering and IT architecture.',
        'Conduct monthly 1:1 coaching sessions covering technical skills, career strategy, and professional networking.',
        '3 of 4 mentees have progressed to mid-level or senior roles at Fortune 500 companies.',
      ],
    },
    {
      role: 'Technical Judge & Advisor',
      organization: 'Illinois Technology Association (ITA) CityLIGHTS Award',
      location: 'Chicago, IL',
      startDate: 'Jan 2020',
      endDate: 'Present',
      current: true,
      description: [
        'Serve as technical judge for the annual ITA CityLIGHTS Award recognizing Illinois tech companies for innovation and community impact.',
        'Evaluate 15-20 submissions per cycle across cloud, connectivity, and cybersecurity categories.',
      ],
    },
    {
      role: 'Pro Bono Network Architect',
      organization: 'NetHope — Global Nonprofit Connectivity Initiative',
      location: 'Remote',
      startDate: 'Mar 2021',
      endDate: 'Sep 2022',
      current: false,
      description: [
        'Volunteered 10 hours/month designing low-cost satellite and LTE connectivity solutions for NGO field offices in sub-Saharan Africa.',
        'Delivered connectivity architecture for 3 organizations (120+ total users) enabling reliable access to cloud-based program management tools.',
      ],
    },
  ],

  // Languages must be a flat string array
  languages: [
    'English (Native)',
    'Arabic (Professional Working Proficiency)',
    'Urdu (Native)',
    'Spanish (Conversational)',
  ],

  // Awards must be a flat string array
  awards: [
    'President\'s Club — AT&T Business Solutions (2018, 2019): Top 5% of enterprise solutions architects nationwide for revenue contribution.',
    'Innovator of the Year — CenturyLink/Lumen (2022): Recognised for developing the Multi-Cloud Connectivity reference architecture adopted across the Americas region.',
    'CCIE Hall of Fame — Cisco Systems Certified Internetwork Expert #62847: One of fewer than 4,000 active CCIEs globally in Enterprise Infrastructure.',
    'IEEE Region 4 Outstanding Student Award (2009): Recognised for academic excellence and leadership in the IEEE Student Chapter.',
    'Top Technical Mentor — AT&T Business Solutions Leadership Development Program (2019): Peer-voted recognition for mentorship impact across the solutions architecture practice.',
  ],
};

const rawText = `
Ali Yousaf
aligenius@gmail.com | +1 (312) 555-8901 | Dallas, TX
LinkedIn: linkedin.com/in/aligenius
GitHub: github.com/aligenius
Website: aligenius.dev

SUMMARY
Senior Solutions Architect with 11+ years designing enterprise connectivity, cloud architecture, and network architecture solutions. Specialist in SD-WAN, MPLS, and hybrid cloud connectivity. $75M+ TCV in pre-sales wins. Deep expertise in cybersecurity (Zero Trust, NIST), IT service management (ITIL 4), and technical leadership. Committed to teamwork, trust, and transparency in every engagement.

EXPERIENCE
Senior Lead Solutions Architect — CenturyLink (Lumen Technologies) | Dallas, TX | Mar 2020 – Present
Solutions Architect — AT&T Business Solutions | Chicago, IL | Jun 2016 – Feb 2020
Network Architect — Cisco Systems | San Jose, CA | Aug 2013 – May 2016
Senior Network Engineer — Verizon Enterprise Solutions | New York, NY | Jul 2010 – Jul 2013

EDUCATION
B.S. Electrical Engineering & Computer Science — University of Illinois Urbana-Champaign | May 2010 | GPA: 3.78
Executive Education — Business Strategy for Technology Leaders, Kellogg / Northwestern | Jun 2018
ITIL 4 Managing Professional Transition — Axelos/PeopleCert | Sep 2021

SKILLS
Solutions Architecture, Cloud Architecture, Network Architecture, SD-WAN, MPLS, BGP, OSPF, Fiber Optics, Hybrid Cloud Connectivity, AWS Direct Connect, Azure ExpressRoute, GCP Interconnect, Cybersecurity Architecture, Zero Trust Security, NIST CSF, SASE, Palo Alto NGFW, ITIL 4, IT Service Management, ServiceNow, AWS, Azure, Google Cloud Platform, Business Growth Strategy, Digital Transformation, Enterprise Pre-Sales, Technical Leadership

CERTIFICATIONS
Cisco CCIE Enterprise Infrastructure | AWS Solutions Architect Professional | ITIL 4 Managing Professional | CISSP | Google Professional Cloud Architect | VMware VCAP-DCD

PROJECTS
SD-WAN Transformation — National Healthcare Network (220 sites, $3.2M savings)
Zero Trust Architecture — Financial Services Group (SOC 2 Type II, 75% attack surface reduction)
Multi-Cloud Connectivity Platform (AWS/Azure/GCP, 6 enterprise clients)
ITSM Transformation — Global Manufacturing (95%+ SLA, ServiceNow)
Enterprise Fiber Build-Out Strategy (340% ROI, 4 markets)

VOLUNTEER WORK
Technology Leadership Mentor — Chicago Urban League | Sep 2018 – Present
Technical Judge — ITA CityLIGHTS Award | Jan 2020 – Present
Pro Bono Network Architect — NetHope | Mar 2021 – Sep 2022

AWARDS
President's Club — AT&T Business Solutions (2018, 2019)
Innovator of the Year — CenturyLink/Lumen (2022)
CCIE Hall of Fame — Cisco #62847
IEEE Region 4 Outstanding Student Award (2009)
Top Technical Mentor — AT&T Business Solutions (2019)

LANGUAGES
English (Native), Arabic (Professional Working Proficiency), Urdu (Native), Spanish (Conversational)
`.trim();

async function main() {
  // 1. Find the user
  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    console.error(`❌  User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }
  console.log(`✅  Found user: ${user.firstName ?? ''} ${user.lastName ?? ''} <${user.email}>`);

  // 2. Delete ALL existing resumes for this user (cascades to versions)
  const existing = await prisma.resume.findMany({ where: { userId: user.id }, select: { id: true, title: true } });
  if (existing.length > 0) {
    for (const r of existing) {
      await prisma.resume.delete({ where: { id: r.id } });
      console.log(`🗑️   Deleted resume: ${r.id} (${r.title})`);
    }
  } else {
    console.log(`ℹ️   No existing resumes to delete.`);
  }

  // 3. Create new Solutions Architect resume with photo
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Senior Solutions Architect Resume',
      originalFileName: 'ali-yousaf-solutions-architect.pdf',
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
  console.log(`\n✅  Resume created:`);
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

  // ── Step 4: Tailor using the first saved job in the DB ──────────────────
  const savedJob = await prisma.savedJob.findFirst({ where: { userId: user.id } });
  if (!savedJob) {
    console.log('\nℹ️   No saved jobs found — skipping tailoring step.');
    return;
  }

  console.log(`\n🎯  Tailoring resume for saved job:`);
  console.log(`    Title   : ${savedJob.title}`);
  console.log(`    Company : ${savedJob.company}`);
  console.log(`    Location: ${savedJob.location}`);
  console.log(`    Salary  : ${savedJob.salary ?? 'Not specified'}`);
  console.log(`\n    Running AI pipeline (job analysis → customise → ATS → truth guard)...`);

  const result = await fullCustomizationPipeline(
    parsedData as unknown as ParsedResumeData,
    rawText,
    savedJob.description,
    savedJob.title,
    savedJob.company,
    user.id,
    null
  );

  // Determine next version number
  const versionCount = await prisma.resumeVersion.count({ where: { resumeId: resume.id } });

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      userId: user.id,
      versionNumber: versionCount + 1,
      jobTitle: savedJob.title,
      companyName: savedJob.company,
      jobDescription: savedJob.description,
      jobData: {},
      tailoredData: result.tailoredData as any,
      tailoredText: result.tailoredText,
      changesExplanation: result.changesExplanation,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      atsScore: result.atsScore,
      atsDetails: result.atsDetails as any,
      truthGuardWarnings: result.truthGuardWarnings as any,
    },
  });

  // ── Analysis output ──────────────────────────────────────────────────────
  const matchStrength = (result as any).matchStrength ?? 'n/a';
  const ats = result.atsDetails as any;

  console.log(`\n✅  Tailored version created:`);
  console.log(`    Version ID    : ${version.id}`);
  console.log(`    ATS Score     : ${result.atsScore}/100`);
  console.log(`    Match Strength: ${matchStrength}`);
  console.log(`    Matched KWs   : ${result.matchedKeywords.length} — ${result.matchedKeywords.slice(0, 10).join(', ')}${result.matchedKeywords.length > 10 ? '...' : ''}`);
  console.log(`    Missing KWs   : ${result.missingKeywords.length} — ${result.missingKeywords.slice(0, 8).join(', ')}${result.missingKeywords.length > 8 ? '...' : ''}`);

  if (ats?.sectionScores) {
    console.log(`\n    Section Scores:`);
    Object.entries(ats.sectionScores).forEach(([k, v]) => console.log(`      ${k.padEnd(12)}: ${v}/100`));
  }

  if (ats?.formattingIssues?.length) {
    console.log(`\n    Formatting Issues (${ats.formattingIssues.length}):`);
    ats.formattingIssues.slice(0, 5).forEach((i: string) => console.log(`      ⚠️  ${i}`));
  }

  if (ats?.riskyElements?.length) {
    console.log(`\n    Risky Elements (${ats.riskyElements.length}):`);
    ats.riskyElements.slice(0, 5).forEach((r: string) => console.log(`      🔴 ${r}`));
  } else {
    console.log(`\n    Risky Elements : ✅ None detected`);
  }

  if (ats?.honestAssessment) {
    console.log(`\n    Honest Assessment:\n      "${ats.honestAssessment}"`);
  }

  if (ats?.quickWins?.length) {
    console.log(`\n    Quick Wins (${ats.quickWins.length}):`);
    ats.quickWins.slice(0, 5).forEach((w: string, i: number) => console.log(`      ${i + 1}. ${w}`));
  }

  if (ats?.actionPlan) {
    console.log(`\n    Action Plan:`);
    if (ats.actionPlan.step1) console.log(`      Step 1: ${ats.actionPlan.step1}`);
    if (ats.actionPlan.step2) console.log(`      Step 2: ${ats.actionPlan.step2}`);
    if (ats.actionPlan.step3) console.log(`      Step 3: ${ats.actionPlan.step3}`);
    if (ats.actionPlan.estimatedScoreAfterFixes) console.log(`      Projected: ${ats.actionPlan.estimatedScoreAfterFixes}`);
  }

  if (result.truthGuardWarnings?.length) {
    console.log(`\n    Truth Guard Warnings (${result.truthGuardWarnings.length}):`);
    result.truthGuardWarnings.slice(0, 6).forEach((w: any) =>
      console.log(`      [${(w.severity ?? '').toUpperCase()}] ${w.type} — ${w.section}: ${w.concern}`)
    );
  } else {
    console.log(`\n    Truth Guard   : ✅ No warnings — no fabrication detected`);
  }

  console.log(`\n   View at: http://localhost:3000/resumes/${resume.id}/versions/${version.id}`);
}

main()
  .catch((e) => {
    console.error('❌  Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
