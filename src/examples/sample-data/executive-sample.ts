/**
 * Sample Resume Data - Executive/C-Level
 * For generating previews of executive leadership templates
 */

import { ParsedResumeData } from '../../types';

export const executiveSampleData: ParsedResumeData = {
  contact: {
    name: 'Sarah J. Martinez',
    email: 'sarah.martinez@example.com',
    phone: '(555) 987-6543',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/sarahmartinez',
  },

  summary: 'Strategic executive leader with 15+ years driving digital transformation and revenue growth across Fortune 500 companies. Proven track record of scaling operations from $50M to $500M+ ARR, building high-performing teams of 200+ employees, and delivering shareholder value through innovation and operational excellence. MBA from Harvard Business School.',

  experience: [
    {
      company: 'Global Tech Solutions Inc.',
      position: 'Chief Operating Officer (COO)',
      location: 'New York, NY',
      startDate: '2020-01',
      endDate: 'Present',
      highlights: [
        'Led company through hyper-growth phase, scaling revenue from $150M to $500M ARR (233% growth) over 3 years',
        'Built and managed cross-functional teams of 200+ employees across 8 departments including Engineering, Sales, Marketing, and Customer Success',
        'Spearheaded digital transformation initiative resulting in 45% improvement in operational efficiency and $25M annual cost savings',
        'Negotiated strategic partnerships with Microsoft and Salesforce, opening new revenue streams worth $80M annually',
        'Implemented data-driven decision-making framework reducing time-to-market for new features by 60%',
        'Achieved 95% customer retention rate (industry average: 75%) through enhanced customer success programs',
      ],
    },
    {
      company: 'Enterprise Software Corp.',
      position: 'Vice President of Operations',
      location: 'San Francisco, CA',
      startDate: '2016-03',
      endDate: '2019-12',
      highlights: [
        'Drove operational excellence across product development, customer operations, and infrastructure teams (150+ employees)',
        'Led $30M cloud migration project, completing ahead of schedule and 15% under budget',
        'Increased operational margins from 18% to 32% through process optimization and strategic vendor negotiations',
        'Established customer success organization from ground up, improving NPS score from 42 to 78',
        'Implemented OKR framework across organization, improving goal alignment and execution by 55%',
        'Built strategic planning process resulting in successful execution of 95% of quarterly objectives',
      ],
    },
    {
      company: 'McKinsey & Company',
      position: 'Senior Engagement Manager',
      location: 'Boston, MA',
      startDate: '2012-08',
      endDate: '2016-02',
      highlights: [
        'Led 20+ strategic consulting engagements for Fortune 500 clients in technology, healthcare, and financial services',
        'Advised C-suite executives on growth strategy, digital transformation, and operational improvement',
        'Delivered $200M+ in value creation for clients through cost reduction and revenue growth initiatives',
        'Managed teams of 5-15 consultants on complex multi-million dollar engagements',
        'Developed go-to-market strategy for tech startup that led to successful $50M Series B funding',
      ],
    },
    {
      company: 'Goldman Sachs',
      position: 'Investment Banking Analyst',
      location: 'New York, NY',
      startDate: '2009-07',
      endDate: '2012-07',
      highlights: [
        'Executed M&A transactions totaling $2.5B+ in enterprise value across technology and healthcare sectors',
        'Built financial models and conducted due diligence for IPOs and private placements',
        'Prepared pitch materials and presentations for C-level executives and board members',
        'Analyzed market trends and competitive dynamics to inform investment recommendations',
      ],
    },
  ],

  education: [
    {
      institution: 'Harvard Business School',
      degree: 'Master of Business Administration (MBA)',
      location: 'Boston, MA',
      graduationDate: '2014-05',
      honors: ['Baker Scholar (top 5% of class)', 'Dean\'s Award for Academic Excellence'],
    },
    {
      institution: 'Stanford University',
      degree: 'Bachelor of Science in Economics',
      location: 'Stanford, CA',
      graduationDate: '2009-06',
      gpa: '3.9',
      honors: ['Phi Beta Kappa', 'Departmental Honors in Economics'],
    },
  ],

  skills: [
    {
      category: 'Leadership & Strategy',
      items: ['Strategic Planning', 'P&L Management', 'Digital Transformation', 'M&A Integration', 'Change Management', 'Board Presentations'],
    },
    {
      category: 'Operations',
      items: ['Operational Excellence', 'Process Optimization', 'Scaling Organizations', 'Vendor Management', 'Budget Management'],
    },
    {
      category: 'Business Development',
      items: ['Partnership Development', 'Revenue Growth', 'Market Expansion', 'Product Strategy', 'Go-to-Market Strategy'],
    },
    {
      category: 'Technical Knowledge',
      items: ['SaaS Business Models', 'Cloud Infrastructure', 'Data Analytics', 'Agile Methodologies', 'Enterprise Software'],
    },
  ],

  certifications: [
    {
      name: 'Certified Professional in Business Analysis (CPBA)',
      issuer: 'IIBA',
      date: '2018-11',
    },
    {
      name: 'Six Sigma Black Belt',
      issuer: 'ASQ',
      date: '2017-06',
    },
  ],

  achievements: [
    'Featured in Forbes "Top 40 Under 40" Technology Leaders (2022)',
    'Recipient of "COO of the Year" Award from Tech Leadership Association (2023)',
    'Published thought leadership articles in Harvard Business Review and Wall Street Journal',
    'Speaker at TechCrunch Disrupt, Web Summit, and SaaStr Annual',
  ],
};

export default executiveSampleData;
