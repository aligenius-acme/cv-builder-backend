/**
 * Sample Resume Data - Entry-Level/Recent Graduate
 * For generating previews of entry-level and student templates
 */

import { ParsedResumeData } from '../../types';

export const entryLevelSampleData: ParsedResumeData = {
  contact: {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '(555) 456-7890',
    location: 'Boston, MA',
    linkedin: 'linkedin.com/in/emilyrodriguez',
    github: 'github.com/emilyrodriguez',
  },

  summary: 'Recent Computer Science graduate from Boston University with strong foundation in software development, data structures, and algorithms. Completed 3 internships at tech companies building web applications and mobile apps. Passionate about creating user-friendly software solutions and eager to contribute to innovative development team.',

  education: [
    {
      institution: 'Boston University',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Boston, MA',
      graduationDate: '2024-05',
      gpa: '3.7',
      honors: ['Dean\'s List (6 semesters)', 'Presidential Scholarship Recipient'],
      relevantCoursework: [
        'Data Structures & Algorithms',
        'Database Systems',
        'Web Development',
        'Mobile App Development',
        'Software Engineering',
        'Operating Systems',
      ],
    },
  ],

  experience: [
    {
      company: 'TechStart Inc.',
      position: 'Software Engineering Intern',
      location: 'Boston, MA',
      startDate: '2023-06',
      endDate: '2023-08',
      highlights: [
        'Developed 5 new features for customer-facing web application using React and Node.js',
        'Collaborated with team of 4 engineers to implement RESTful APIs serving 10K+ users',
        'Wrote unit tests using Jest achieving 85% code coverage',
        'Participated in agile development with daily standups and bi-weekly sprints',
        'Fixed 20+ bugs improving application stability and user experience',
      ],
    },
    {
      company: 'Mobile Apps Co.',
      position: 'Mobile Development Intern',
      location: 'Cambridge, MA',
      startDate: '2022-06',
      endDate: '2022-08',
      highlights: [
        'Built iOS app features using Swift and UIKit for task management application',
        'Implemented push notifications increasing user engagement by 30%',
        'Collaborated with design team to create intuitive user interfaces',
        'Conducted code reviews and provided feedback to fellow interns',
      ],
    },
    {
      company: 'Boston University IT Department',
      position: 'Student Developer',
      location: 'Boston, MA',
      startDate: '2022-01',
      endDate: '2023-05',
      highlights: [
        'Maintained university website serving 30K+ students and faculty',
        'Built internal tools using Python and Django to automate administrative tasks',
        'Provided technical support and troubleshooting for campus applications',
        'Created documentation for codebase used by team of 6 developers',
      ],
    },
  ],

  projects: [
    {
      name: 'Recipe Sharing Platform',
      description: 'Full-stack web application for sharing and discovering recipes',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS S3'],
      url: 'github.com/emilyrodriguez/recipe-platform',
      highlights: [
        'Implemented user authentication with JWT and password hashing',
        'Built search functionality with filters and pagination',
        'Deployed to AWS using Docker and EC2',
        'Featured in Boston University Computer Science Showcase',
      ],
    },
    {
      name: 'Budget Tracker Mobile App',
      description: 'iOS app for personal finance management and expense tracking',
      technologies: ['Swift', 'SwiftUI', 'Core Data', 'Charts Framework'],
      url: 'github.com/emilyrodriguez/budget-tracker',
      highlights: [
        'Designed and implemented clean MVVM architecture',
        'Created interactive charts for spending visualization',
        'Implemented local data persistence with Core Data',
      ],
    },
    {
      name: 'AI Study Assistant',
      description: 'Chrome extension using AI to generate study materials from web content',
      technologies: ['JavaScript', 'OpenAI API', 'Chrome Extension API'],
      url: 'github.com/emilyrodriguez/study-assistant',
      highlights: [
        'Integrated OpenAI GPT-3.5 for content summarization',
        '500+ active users from campus community',
      ],
    },
  ],

  skills: [
    {
      category: 'Programming Languages',
      items: ['JavaScript', 'Python', 'Java', 'Swift', 'SQL', 'HTML/CSS'],
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Node.js', 'Express', 'Django', 'SwiftUI', 'jQuery'],
    },
    {
      category: 'Tools & Technologies',
      items: ['Git', 'GitHub', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'VS Code', 'Xcode'],
    },
    {
      category: 'Concepts',
      items: ['Data Structures', 'Algorithms', 'RESTful APIs', 'Agile Development', 'Test-Driven Development'],
    },
  ],

  leadership: [
    {
      role: 'President',
      organization: 'Women in Computer Science (WiCS)',
      period: '2023-2024',
      highlights: [
        'Led organization of 150+ members organizing tech talks and networking events',
        'Coordinated mentorship program pairing 40 students with industry professionals',
        'Increased membership by 60% through outreach initiatives',
      ],
    },
    {
      role: 'Teaching Assistant',
      organization: 'CS101: Introduction to Programming',
      period: '2022-2024',
      highlights: [
        'Held weekly office hours helping 30+ students with programming assignments',
        'Graded assignments and provided detailed feedback to support learning',
        'Assisted professor in curriculum development and exam preparation',
      ],
    },
  ],

  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2024-01',
    },
    {
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Meta (Coursera)',
      date: '2023-08',
    },
  ],

  volunteerWork: [
    {
      organization: 'Code for Boston',
      role: 'Volunteer Developer',
      period: '2023-Present',
      description: ['Contributing to open source civic tech projects improving Boston community'],
    },
  ],
};

export default entryLevelSampleData;
