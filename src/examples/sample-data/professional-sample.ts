/**
 * Sample Resume Data - Professional (Mid-Level)
 * For generating previews of professional templates for mid-career professionals
 */

import { ParsedResumeData } from '../../types';

export const professionalSampleData: ParsedResumeData = {
  contact: {
    name: 'David M. Anderson',
    email: 'david.anderson@email.com',
    phone: '(555) 567-8901',
    location: 'Chicago, IL',
    linkedin: 'linkedin.com/in/davidanderson',
  },

  summary: 'Results-driven Financial Analyst with 7+ years of experience in financial planning, analysis, and strategic decision support. Expertise in budgeting, forecasting, and financial modeling for Fortune 500 companies. Track record of identifying cost savings opportunities totaling $15M+ and improving forecasting accuracy by 30%. CFA Level II candidate.',

  experience: [
    {
      company: 'Global Manufacturing Inc.',
      position: 'Senior Financial Analyst',
      location: 'Chicago, IL',
      startDate: '2020-03',
      endDate: 'Present',
      highlights: [
        'Lead financial planning and analysis for $500M business unit with 1,000+ employees',
        'Develop annual budgets and quarterly forecasts working closely with department heads across 8 functions',
        'Created financial models reducing forecasting variance from 12% to 4%, improving strategic planning accuracy',
        'Identified cost optimization opportunities resulting in $8M annual savings through process improvements',
        'Present monthly financial results and variance analysis to C-suite executives',
        'Manage team of 2 junior analysts providing mentorship and technical guidance',
        'Implemented automated reporting dashboards using Power BI reducing reporting time by 60%',
      ],
    },
    {
      company: 'Tech Solutions Corp.',
      position: 'Financial Analyst',
      location: 'Chicago, IL',
      startDate: '2018-06',
      endDate: '2020-02',
      highlights: [
        'Supported FP&A processes for $200M revenue SaaS business',
        'Built financial models for new product launches analyzing ROI and break-even scenarios',
        'Conducted monthly variance analysis identifying trends and providing actionable insights to management',
        'Collaborated with Sales and Marketing teams on revenue forecasting and pipeline analysis',
        'Developed executive dashboards tracking key financial and operational metrics',
        'Participated in annual budgeting process for company with 500+ employees',
      ],
    },
    {
      company: 'ABC Consulting Group',
      position: 'Business Analyst',
      location: 'Chicago, IL',
      startDate: '2016-08',
      endDate: '2018-05',
      highlights: [
        'Performed financial analysis for consulting engagements across healthcare, retail, and manufacturing clients',
        'Built Excel-based financial models for M&A due diligence and valuation projects',
        'Conducted market research and competitive analysis to support strategic recommendations',
        'Created client presentations and delivered findings to senior management',
        'Analyzed financial statements identifying trends and providing recommendations for improvement',
      ],
    },
  ],

  education: [
    {
      institution: 'University of Illinois at Urbana-Champaign',
      degree: 'Bachelor of Science in Finance',
      location: 'Champaign, IL',
      graduationDate: '2016-05',
      gpa: '3.6',
      honors: ['Dean\'s List (5 semesters)', 'Finance Student of the Year'],
    },
  ],

  skills: [
    {
      category: 'Financial Analysis',
      items: ['Financial Modeling', 'Budgeting & Forecasting', 'Variance Analysis', 'Cost Analysis', 'ROI Analysis', 'Valuation'],
    },
    {
      category: 'Technical Skills',
      items: ['Excel (Advanced)', 'Power BI', 'Tableau', 'SQL', 'SAP', 'Oracle Hyperion', 'Bloomberg Terminal'],
    },
    {
      category: 'Business Skills',
      items: ['Strategic Planning', 'Data Analysis', 'Business Intelligence', 'Process Improvement', 'Stakeholder Management'],
    },
    {
      category: 'Soft Skills',
      items: ['Executive Communication', 'Team Leadership', 'Problem Solving', 'Attention to Detail', 'Project Management'],
    },
  ],

  certifications: [
    {
      name: 'Chartered Financial Analyst (CFA) Level II Candidate',
      issuer: 'CFA Institute',
      date: '2024-06',
      status: 'In Progress',
    },
    {
      name: 'Financial Modeling & Valuation Analyst (FMVA)',
      issuer: 'Corporate Finance Institute',
      date: '2021-09',
    },
    {
      name: 'Microsoft Power BI Data Analyst Professional Certificate',
      issuer: 'Microsoft',
      date: '2022-03',
    },
  ],

  achievements: [
    'Recipient of "Excellence in Analysis" Award for outstanding contributions to strategic planning (2023)',
    'Led cross-functional project team that reduced monthly close timeline from 15 to 8 days',
    'Developed financial dashboard template adopted company-wide across 12 business units',
  ],

  professionalAffiliations: [
    'Member, CFA Institute (2020-Present)',
    'Member, Financial Planning & Analysis Association (FP&A) (2019-Present)',
  ],
};

export default professionalSampleData;
