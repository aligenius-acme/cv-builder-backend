import { createQueue, jobOptions } from './config';
import { PrismaClient } from '@prisma/client';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import axios from 'axios';
import { Job } from 'bull';

const prisma = new PrismaClient();

// Document processing job data
export interface DocumentJobData {
  resumeId: string;
  fileUrl: string;
  fileType: string;
  userId: string;
}

// Create document processing queue
export const documentQueue = createQueue('document-processing');

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParseDefault = (pdfParse as any).default || pdfParse;
  const data = await pdfParseDefault(buffer);
  return data.text;
}

// Helper function to extract text from DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Helper function to parse resume text into structured data
async function parseResumeText(text: string): Promise<any> {
  // Basic parsing logic - extract sections
  const sections = {
    summary: '',
    experience: [] as string[],
    education: [] as string[],
    skills: [] as string[],
    contact: {} as Record<string, string>,
  };

  // Split by common section headers
  const lines = text.split('\n').filter(line => line.trim());

  let currentSection = '';
  const sectionKeywords = {
    summary: ['summary', 'objective', 'profile', 'about'],
    experience: ['experience', 'work history', 'employment', 'work experience'],
    education: ['education', 'academic', 'qualifications'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise'],
  };

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if line is a section header
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        currentSection = section;
        break;
      }
    }

    // Extract content based on current section
    if (currentSection && line.trim().length > 0) {
      if (currentSection === 'summary') {
        sections.summary += line + ' ';
      } else if (currentSection === 'experience' && line.length > 10) {
        sections.experience.push(line);
      } else if (currentSection === 'education' && line.length > 5) {
        sections.education.push(line);
      } else if (currentSection === 'skills' && line.length > 2) {
        sections.skills.push(line);
      }
    }

    // Extract contact information
    if (line.includes('@')) {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        sections.contact = { ...sections.contact, email: emailMatch[0] };
      }
    }

    if (line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
      const phoneMatch = line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
      if (phoneMatch) {
        sections.contact = { ...sections.contact, phone: phoneMatch[0] };
      }
    }
  }

  return sections;
}

// Process document jobs
documentQueue.process(async (job: Job<DocumentJobData>) => {
  const { resumeId, fileUrl, fileType, userId } = job.data;

  try {
    // Update status to processing
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parseStatus: 'processing' },
    });

    // Download file
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Extract text based on file type
    let rawText = '';
    if (fileType === 'application/pdf') {
      rawText = await extractTextFromPDF(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      rawText = await extractTextFromDOCX(buffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Parse text into structured data
    const parsedData = await parseResumeText(rawText);

    // Update resume with parsed data
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        rawText,
        parsedData,
        parseStatus: 'completed',
        parseError: null,
      },
    });

    console.log(`Successfully processed resume ${resumeId}`);
    return { success: true, resumeId };
  } catch (error: any) {
    console.error(`Error processing resume ${resumeId}:`, error);

    // Update resume with error
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parseStatus: 'failed',
        parseError: error.message,
      },
    });

    // Log parsing error
    await prisma.parsingErrorLog.create({
      data: {
        resumeId,
        userId,
        fileName: fileUrl.split('/').pop() || 'unknown',
        fileType,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });

    throw error; // This will trigger retry
  }
});

// Event listeners
documentQueue.on('completed', (job: Job<DocumentJobData>, result: any) => {
  console.log(`Document processing job ${job.id} completed:`, result);
});

documentQueue.on('failed', (job: Job<DocumentJobData>, err: Error) => {
  console.error(`Document processing job ${job.id} failed:`, err.message);
});

documentQueue.on('error', (error: Error) => {
  console.error('Document queue error:', error);
});

// Helper function to add document processing job to queue
export const processDocumentAsync = async (data: DocumentJobData): Promise<void> => {
  await documentQueue.add(data, jobOptions.documentProcessing);
};

export default documentQueue;
