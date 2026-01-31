/**
 * Sample Resume Data - Academic/Research
 * For generating previews of academic templates
 */

import { ParsedResumeData } from '../../types';

export const academicSampleData: ParsedResumeData = {
  contact: {
    name: 'Dr. Michael R. Thompson',
    email: 'm.thompson@university.edu',
    phone: '(555) 234-5678',
    location: 'Cambridge, MA',
    linkedin: 'linkedin.com/in/drthompson',
    website: 'michaelthompson.edu',
  },

  summary: 'Distinguished researcher and educator specializing in machine learning and artificial intelligence with 12+ years of experience. Published 45+ peer-reviewed papers (h-index: 28, 2,500+ citations). Principal Investigator on $5M+ in funded research grants. Passionate about advancing AI ethics and democratizing access to AI education.',

  experience: [
    {
      company: 'Massachusetts Institute of Technology (MIT)',
      position: 'Associate Professor of Computer Science',
      location: 'Cambridge, MA',
      startDate: '2018-09',
      endDate: 'Present',
      highlights: [
        'Lead research lab with 15 PhD students and 8 postdoctoral researchers focusing on explainable AI and machine learning',
        'Secured $3.2M in research funding from NSF, DARPA, and industry partners over 5 years',
        'Published 25+ papers in top-tier venues (NeurIPS, ICML, CVPR) with 1,800+ citations',
        'Developed and taught 4 graduate-level courses in Machine Learning, AI Ethics, and Deep Learning',
        'Serve on program committees for NeurIPS, ICML, and AAAI conferences',
        'Mentored 12 PhD students to successful dissertation defense and academic/industry placements',
      ],
    },
    {
      company: 'Stanford University',
      position: 'Assistant Professor of Computer Science',
      location: 'Stanford, CA',
      startDate: '2014-09',
      endDate: '2018-08',
      highlights: [
        'Established research program in fairness and interpretability in machine learning',
        'Published 20 peer-reviewed papers including 3 best paper awards',
        'Awarded NSF CAREER Award ($550K) for research on algorithmic fairness',
        'Developed undergraduate course "Introduction to AI Ethics" now required for all CS majors',
        'Served as faculty advisor for Women in Computer Science organization',
      ],
    },
    {
      company: 'Google Research',
      position: 'Research Scientist (Postdoctoral Researcher)',
      location: 'Mountain View, CA',
      startDate: '2012-09',
      endDate: '2014-08',
      highlights: [
        'Conducted research on neural network interpretability and model compression',
        'Published 8 papers at top ML conferences contributing to TensorFlow documentation',
        'Collaborated with product teams to integrate research findings into Google products',
        'Developed novel techniques for model pruning reducing model size by 80% with minimal accuracy loss',
      ],
    },
  ],

  education: [
    {
      institution: 'Carnegie Mellon University',
      degree: 'Ph.D. in Machine Learning',
      location: 'Pittsburgh, PA',
      graduationDate: '2012-08',
      thesis: 'Interpretable and Fair Machine Learning Models: Theory and Applications',
      advisor: 'Professor Jane Smith',
      honors: ['Best Dissertation Award', 'School of Computer Science Fellowship'],
    },
    {
      institution: 'University of California, Berkeley',
      degree: 'M.S. in Computer Science',
      location: 'Berkeley, CA',
      graduationDate: '2008-05',
      gpa: '3.95',
    },
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science, Minor in Mathematics',
      location: 'Berkeley, CA',
      graduationDate: '2006-05',
      gpa: '3.92',
      honors: ['Summa Cum Laude', 'Phi Beta Kappa'],
    },
  ],

  publications: [
    {
      title: 'Towards Fair and Interpretable Machine Learning: A Unified Framework',
      authors: ['Thompson, M.R.', 'Johnson, A.', 'Lee, K.'],
      venue: 'NeurIPS 2023',
      year: '2023',
      citations: 145,
      awards: ['Best Paper Award'],
    },
    {
      title: 'Explainable AI for Healthcare: Methods and Applications',
      authors: ['Thompson, M.R.', 'Garcia, S.', 'Williams, T.'],
      venue: 'Nature Machine Intelligence',
      year: '2023',
      citations: 287,
    },
    {
      title: 'Algorithmic Fairness in Practice: Lessons from Industry Deployment',
      authors: ['Thompson, M.R.', 'Chen, L.', 'Patel, R.'],
      venue: 'ACM FAccT 2022',
      year: '2022',
      citations: 412,
      awards: ['Best Paper Honorable Mention'],
    },
  ],

  grants: [
    {
      title: 'NSF CAREER: Foundations of Fair and Interpretable Machine Learning',
      agency: 'National Science Foundation',
      amount: '$550,000',
      role: 'Principal Investigator',
      period: '2019-2024',
    },
    {
      title: 'DARPA XAI: Explainable Artificial Intelligence for Critical Applications',
      agency: 'DARPA',
      amount: '$1,200,000',
      role: 'Co-Principal Investigator',
      period: '2020-2023',
    },
    {
      title: 'Google Faculty Research Award: Fairness in Recommendation Systems',
      agency: 'Google Research',
      amount: '$75,000',
      role: 'Principal Investigator',
      period: '2021-2022',
    },
  ],

  teaching: [
    'CS 229: Machine Learning (Graduate)',
    'CS 231: Deep Learning for Computer Vision (Graduate)',
    'CS 181: AI Ethics and Societal Impact (Undergraduate)',
    'CS 109: Introduction to Probability for Computer Scientists (Undergraduate)',
  ],

  service: [
    'Area Chair: NeurIPS 2023, 2024',
    'Program Committee: ICML 2020-2024, CVPR 2021-2024, AAAI 2019-2024',
    'Associate Editor: Journal of Machine Learning Research (2022-Present)',
    'Workshop Organizer: Fairness in ML Workshop at NeurIPS 2022',
    'MIT Faculty Search Committee Member (2021-2022)',
  ],

  skills: [
    {
      category: 'Research Areas',
      items: ['Machine Learning', 'Deep Learning', 'Explainable AI', 'Fairness & Ethics', 'Computer Vision', 'Natural Language Processing'],
    },
    {
      category: 'Technical Skills',
      items: ['Python', 'PyTorch', 'TensorFlow', 'R', 'MATLAB', 'Julia', 'Git', 'LaTeX'],
    },
    {
      category: 'Academic Skills',
      items: ['Grant Writing', 'Paper Writing', 'Peer Review', 'Curriculum Development', 'PhD Advising', 'Conference Presentation'],
    },
  ],

  awards: [
    'MIT School of Engineering Teaching Award (2023)',
    'NSF CAREER Award (2019)',
    'Best Paper Award, NeurIPS (2023)',
    'Outstanding Reviewer Award, ICML (2022)',
    'Google Faculty Research Award (2021)',
  ],
};

export default academicSampleData;
