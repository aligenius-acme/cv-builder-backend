/**
 * Academic-specific data types
 * Extended types for academic CVs and research resumes
 */

export interface PublicationEntry {
  title: string;
  authors: string[]; // List of authors
  journal?: string; // Journal or conference name
  year: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type?: 'journal' | 'conference' | 'book' | 'chapter' | 'preprint' | 'other';
}

export interface GrantEntry {
  title: string;
  agency: string; // Funding agency
  amount?: string; // Funding amount
  startDate?: string;
  endDate?: string;
  role?: string; // PI, Co-PI, etc.
  status?: 'awarded' | 'pending' | 'completed';
}

export interface TeachingEntry {
  course: string;
  institution: string;
  role?: string; // Instructor, TA, Lecturer, etc.
  semester?: string;
  year?: string;
  students?: number; // Number of students
  description?: string[];
}

export interface PresentationEntry {
  title: string;
  event: string; // Conference or seminar name
  location?: string;
  date?: string;
  type?: 'talk' | 'poster' | 'panel' | 'keynote' | 'invited';
}

export interface AcademicServiceEntry {
  role: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ResearchInterest {
  area: string;
  keywords?: string[];
}

/**
 * Extended ParsedResumeData for academic CVs
 */
export interface AcademicResumeData {
  // Standard fields
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    achievements?: string[];
    dissertationTitle?: string; // Academic-specific
    advisor?: string; // Academic-specific
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  languages?: string[];
  awards?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    orcid?: string; // Academic-specific
  };

  // Academic-specific fields
  publications?: PublicationEntry[];
  grants?: GrantEntry[];
  teaching?: TeachingEntry[];
  presentations?: PresentationEntry[];
  academicService?: AcademicServiceEntry[];
  researchInterests?: ResearchInterest[];
  professionalMemberships?: string[];
}
