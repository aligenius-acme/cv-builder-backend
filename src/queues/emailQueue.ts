import { createQueue, jobOptions } from './config';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { Job } from 'bull';

// Email job data interface
export interface EmailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

// Create email queue
export const emailQueue = createQueue('email');

// Gmail OAuth2 transporter (if configured)
let gmailTransporter: nodemailer.Transporter | null = null;

if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_FROM_ADDRESS,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  } as any);
}

// Fallback SMTP transporter
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

// Get the appropriate transporter
const getTransporter = (): nodemailer.Transporter => {
  return gmailTransporter || smtpTransporter;
};

// Process email jobs
emailQueue.process(async (job: Job<EmailJobData>) => {
  const { to, subject, html, text, from, cc, bcc, attachments } = job.data;

  const transporter = getTransporter();

  const mailOptions = {
    from: from || `${process.env.EMAIL_FROM_NAME || 'CV Builder'} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // This will trigger retry
  }
});

// Event listeners
emailQueue.on('completed', (job: Job<EmailJobData>, result: any) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job: Job<EmailJobData>, err: Error) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('error', (error: Error) => {
  console.error('Email queue error:', error);
});

// Helper function to add email to queue
export const sendEmailAsync = async (data: EmailJobData): Promise<void> => {
  await emailQueue.add(data, jobOptions.email);
};

// Helper functions for common email types
export const sendWelcomeEmail = async (to: string, firstName: string): Promise<void> => {
  await sendEmailAsync({
    to,
    subject: 'Welcome to CV Builder',
    html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Thank you for signing up for CV Builder. We're excited to help you create amazing resumes and land your dream job.</p>
      <p>Get started by uploading your first resume!</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  firstName: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendEmailAsync({
    to,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendEmailVerification = async (
  to: string,
  verificationToken: string,
  firstName: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await sendEmailAsync({
    to,
    subject: 'Verify Your Email',
    html: `
      <h1>Verify Your Email</h1>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendResumeReadyEmail = async (
  to: string,
  firstName: string,
  jobTitle: string,
  resumeUrl: string
): Promise<void> => {
  await sendEmailAsync({
    to,
    subject: 'Your Resume is Ready!',
    html: `
      <h1>Your Resume is Ready!</h1>
      <p>Hi ${firstName},</p>
      <p>Your tailored resume for <strong>${jobTitle}</strong> has been generated and is ready to download.</p>
      <a href="${resumeUrl}">View Resume</a>
    `,
  });
};

export default emailQueue;
