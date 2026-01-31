/**
 * Sample Resume Data - Tech/Software Engineering
 * For generating previews of tech-focused templates
 */

import { ParsedResumeData } from '../../types';

export const techSampleData: ParsedResumeData = {
  contact: {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    website: 'alexchen.dev',
  },

  summary: 'Full-stack software engineer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, Python, and cloud infrastructure. Passionate about clean code, performance optimization, and mentoring junior developers. Led development of microservices architecture serving 2M+ users.',

  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: 'Present',
      highlights: [
        'Led migration of monolithic application to microservices architecture, improving system reliability from 95% to 99.9% uptime',
        'Architected and implemented real-time analytics dashboard using React, Redux, and WebSocket, serving 500K+ daily active users',
        'Reduced API response time by 60% through database query optimization and Redis caching implementation',
        'Mentored 3 junior developers, conducted code reviews, and established team coding standards',
        'Built CI/CD pipeline using GitHub Actions and Docker, reducing deployment time from 2 hours to 15 minutes',
      ],
    },
    {
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2019-06',
      endDate: '2021-02',
      highlights: [
        'Developed RESTful APIs using Node.js and Express, handling 10M+ requests per day',
        'Built responsive single-page application using React and TypeScript, achieving 95+ Lighthouse score',
        'Implemented authentication system with JWT and OAuth 2.0 for secure user management',
        'Collaborated with product team to design and launch 5 major features, increasing user engagement by 40%',
        'Optimized database schemas and queries in PostgreSQL, reducing query time by 45%',
      ],
    },
    {
      company: 'Digital Solutions LLC',
      position: 'Junior Developer',
      location: 'San Jose, CA',
      startDate: '2018-07',
      endDate: '2019-05',
      highlights: [
        'Developed and maintained client-facing websites using HTML, CSS, JavaScript, and WordPress',
        'Fixed 200+ bugs and implemented 50+ feature requests based on client feedback',
        'Participated in agile development process with daily standups and bi-weekly sprints',
        'Created automated testing suite using Jest, increasing code coverage from 40% to 85%',
      ],
    },
  ],

  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Berkeley, CA',
      graduationDate: '2018-05',
      gpa: '3.8',
      honors: ['Dean\'s List (6 semesters)', 'ACM Programming Competition Finalist'],
    },
  ],

  skills: [
    {
      category: 'Programming Languages',
      items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML/CSS'],
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Node.js', 'Express', 'Next.js', 'Django', 'Flask', 'Redux', 'GraphQL'],
    },
    {
      category: 'Tools & Technologies',
      items: ['Git', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis', 'Jenkins'],
    },
    {
      category: 'Methodologies',
      items: ['Agile/Scrum', 'Test-Driven Development', 'CI/CD', 'Microservices', 'RESTful API Design'],
    },
  ],

  projects: [
    {
      name: 'Open Source Contribution - React Testing Library',
      description: 'Active contributor to React Testing Library with 15+ merged PRs',
      technologies: ['React', 'TypeScript', 'Jest'],
      url: 'github.com/testing-library/react-testing-library',
      highlights: [
        'Improved testing utilities for async operations',
        'Added TypeScript type definitions for 10+ utility functions',
      ],
    },
    {
      name: 'DevOps Dashboard',
      description: 'Internal tool for monitoring deployment pipelines and system health',
      technologies: ['React', 'Python', 'Docker', 'Grafana'],
      highlights: [
        'Real-time monitoring of 50+ microservices',
        'Automated alerting system reducing incident response time by 70%',
      ],
    },
  ],

  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      date: '2022-08',
    },
    {
      name: 'Professional Scrum Master I (PSM I)',
      issuer: 'Scrum.org',
      date: '2021-03',
    },
  ],
};

export default techSampleData;
