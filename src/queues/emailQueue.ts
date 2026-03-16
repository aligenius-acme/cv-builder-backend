import { createQueue, jobOptions } from './config';
import { sendEmail } from '../services/sendgridService';
import { Job } from 'bull';

export interface EmailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// Create email queue
export const emailQueue = createQueue('email');

// Process email jobs using SendGrid
emailQueue.process(async (job: Job<EmailJobData>) => {
  const { to, subject, html, text } = job.data;

  const success = await sendEmail({ to, subject, html, text });

  if (!success) {
    throw new Error(`SendGrid failed to send email to ${to}`);
  }

  console.log(`Email sent successfully to ${to}`);
  return { success: true };
});

emailQueue.on('completed', (job: Job<EmailJobData>) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job: Job<EmailJobData>, err: Error) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('error', (error: Error) => {
  console.error('Email queue error:', error);
});

// Helper to queue an email
export const sendEmailAsync = async (data: EmailJobData): Promise<void> => {
  await emailQueue.add(data, jobOptions.email);
};

// Helper functions for common email types
export const sendWelcomeEmail = async (to: string, firstName: string): Promise<void> => {
  await sendEmailAsync({
    to,
    subject: 'Welcome to JobTools AI',
    html: `<h1>Welcome, ${firstName}!</h1><p>Thanks for joining. Get started at ${process.env.FRONTEND_URL}/dashboard</p>`,
  });
};

export const sendPasswordResetEmail = async (to: string, resetToken: string, firstName: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmailAsync({
    to,
    subject: 'Password Reset Request',
    html: `<h1>Password Reset</h1><p>Hi ${firstName},</p><p><a href="${resetUrl}">Reset your password</a> — link expires in 1 hour.</p>`,
  });
};

export default emailQueue;
