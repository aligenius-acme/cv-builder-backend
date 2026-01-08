import sgMail from '@sendgrid/mail';
import config from '../config';

// SendGrid Email Service
// FREE tier: 100 emails/day

// Initialize SendGrid
if (config.email.sendgridApiKey) {
  sgMail.setApiKey(config.email.sendgridApiKey);
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: Array<{
    content: string; // Base64 encoded
    filename: string;
    type: string;
    disposition?: 'attachment' | 'inline';
  }>;
}

// Send email using SendGrid
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!config.email.sendgridApiKey) {
    console.warn('SendGrid API key not configured, skipping email');
    return false;
  }

  try {
    // Build message with required content
    const msg: sgMail.MailDataRequired = {
      to: options.to,
      from: {
        email: config.email.fromEmail || 'noreply@resumeai.com',
        name: config.email.fromName || 'ResumeAI',
      },
      subject: options.subject,
      // Provide default content (will be overwritten if templateId or html/text provided)
      text: options.text || '',
      html: options.html || '',
      ...(options.templateId && {
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
      }),
      ...(options.attachments && options.attachments.length > 0 && {
        attachments: options.attachments,
      }),
    };

    await sgMail.send(msg);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error.response?.body || error.message);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(
  email: string,
  firstName?: string
): Promise<boolean> {
  const name = firstName || 'there';

  return sendEmail({
    to: email,
    subject: 'Welcome to ResumeAI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">ResumeAI</h1>
        </div>

        <h2 style="color: #1e293b;">Welcome, ${name}! 👋</h2>

        <p>Thanks for joining ResumeAI. We're excited to help you land your dream job!</p>

        <p>Here's what you can do:</p>
        <ul style="padding-left: 20px;">
          <li><strong>Upload your resume</strong> - We'll parse and analyze it</li>
          <li><strong>Tailor for jobs</strong> - AI-powered customization for each application</li>
          <li><strong>Generate cover letters</strong> - Matching your resume to job descriptions</li>
          <li><strong>Track applications</strong> - Stay organized with our job tracker</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/dashboard" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">If you have any questions, just reply to this email. We're here to help!</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ResumeAI. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Welcome to ResumeAI, ${name}!\n\nThanks for joining us. Get started at ${config.frontendUrl}/dashboard`,
  });
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  firstName?: string
): Promise<boolean> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  const name = firstName || 'there';

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - ResumeAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">ResumeAI</h1>
        </div>

        <h2 style="color: #1e293b;">Reset Your Password</h2>

        <p>Hi ${name},</p>

        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ResumeAI. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}

// Send email verification
export async function sendVerificationEmail(
  email: string,
  verifyToken: string,
  firstName?: string
): Promise<boolean> {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${verifyToken}`;
  const name = firstName || 'there';

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - ResumeAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">ResumeAI</h1>
        </div>

        <h2 style="color: #1e293b;">Verify Your Email</h2>

        <p>Hi ${name},</p>

        <p>Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ResumeAI. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Verify your email: ${verifyUrl}`,
  });
}

// Send interview reminder
export async function sendInterviewReminder(
  email: string,
  data: {
    firstName?: string;
    jobTitle: string;
    companyName: string;
    interviewDate: Date;
    interviewType?: string;
    notes?: string;
  }
): Promise<boolean> {
  const name = data.firstName || 'there';
  const formattedDate = data.interviewDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return sendEmail({
    to: email,
    subject: `Interview Reminder: ${data.jobTitle} at ${data.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">ResumeAI</h1>
        </div>

        <h2 style="color: #1e293b;">Interview Reminder 📅</h2>

        <p>Hi ${name},</p>

        <p>This is a reminder about your upcoming interview:</p>

        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${data.jobTitle}</p>
          <p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${data.companyName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
          ${data.interviewType ? `<p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${data.interviewType}</p>` : ''}
          ${data.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>

        <p><strong>Tips for success:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Review the job description and your tailored resume</li>
          <li>Research the company and recent news</li>
          <li>Prepare questions to ask the interviewer</li>
          <li>Test your tech setup (for video interviews)</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/job-tracker" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">View in Job Tracker</a>
        </div>

        <p style="color: #64748b;">Good luck! You've got this! 🚀</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ResumeAI. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Interview Reminder\n\nPosition: ${data.jobTitle}\nCompany: ${data.companyName}\nDate: ${formattedDate}\n\nGood luck!`,
  });
}

// Check if SendGrid is configured
export function isSendGridConfigured(): boolean {
  return !!config.email.sendgridApiKey;
}
