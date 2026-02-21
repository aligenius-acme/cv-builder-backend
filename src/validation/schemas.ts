import { z } from 'zod';

/**
 * Validation Schemas using Zod
 * Ensures all incoming data meets security and business requirements
 */

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// ============================================================================
// Resume Schemas
// ============================================================================

export const resumeUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  // File validation happens at multer level, but we validate metadata here
});

export const resumeUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.any().optional(), // JSON content, validated separately
  templateId: z.string().uuid().optional(),
});

// ============================================================================
// Job Application/Tracker Schemas
// ============================================================================

export const jobApplicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  company: z.string().min(1, 'Company name is required').max(200),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  jobDescription: z.string().max(50000).optional(),
  status: z
    .enum([
      'WISHLIST',
      'APPLIED',
      'SCREENING',
      'INTERVIEWING',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
    ])
    .optional(),
  applicationDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
});

export const jobApplicationUpdateSchema = z.object({
  jobTitle: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  jobDescription: z.string().max(50000).optional(),
  status: z
    .enum([
      'WISHLIST',
      'APPLIED',
      'SCREENING',
      'INTERVIEWING',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
    ])
    .optional(),
  applicationDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
});

// ============================================================================
// Cover Letter Schemas
// ============================================================================

export const coverLetterSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  companyName: z.string().min(1, 'Company name is required').max(200),
  jobDescription: z.string().min(10, 'Job description is too short').max(50000),
  resumeVersionId: z.string().uuid().optional(),
  tone: z.enum(['professional', 'enthusiastic', 'formal', 'creative']).optional(),
});

export const coverLetterUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
});

// ============================================================================
// AI Writing Schemas
// ============================================================================

export const aiWritingSchema = z.object({
  type: z.enum([
    'resume_summary',
    'experience_description',
    'cover_letter_paragraph',
    'linkedin_summary',
  ]),
  context: z.string().min(10, 'Context is required').max(5000),
  tone: z.enum(['professional', 'enthusiastic', 'formal', 'creative']).optional(),
});

export const resumeTailoringSchema = z.object({
  resumeVersionId: z.string().uuid(),
  jobDescription: z.string().min(10, 'Job description is too short').max(50000),
  targetRole: z.string().min(1).max(200).optional(),
});

// ============================================================================
// Interview Prep Schemas
// ============================================================================

export const interviewPrepSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  companyName: z.string().min(1, 'Company name is required').max(200),
  jobDescription: z.string().min(10).max(50000).optional(),
  resumeVersionId: z.string().uuid().optional(),
});

// ============================================================================
// Profile/User Update Schemas
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').max(255).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
});

// ============================================================================
// Subscription Schemas
// ============================================================================

export const subscriptionSchema = z.object({
  planType: z.enum(['FREE', 'PRO', 'BUSINESS']),
  paymentMethodId: z.string().optional(),
});

// ============================================================================
// Organization Schemas
// ============================================================================

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(200),
  domain: z.string().max(100).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  domain: z.string().max(100).optional(),
});

// ============================================================================
// Share/Collaboration Schemas
// ============================================================================

export const shareResumeSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  permission: z.enum(['VIEW', 'EDIT']),
  message: z.string().max(500).optional(),
});

// ============================================================================
// File Upload Validation (used with multer)
// ============================================================================

export const validateFileUpload = (file: Express.Multer.File) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB.');
  }

  return true;
};
