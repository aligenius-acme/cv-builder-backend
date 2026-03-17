import { Resend } from 'resend';
import config from '../config';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@jobtools.io';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Job Tools';
const FROM = `${FROM_NAME} <${FROM_ADDRESS}>`;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string; // Base64 encoded
    filename: string;
    type: string;
    disposition?: 'attachment' | 'inline';
  }>;
}

// Send email using Resend
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping email');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || '',
      text: options.text || '',
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Resend email error:', error.message);
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
    subject: 'Welcome to Job Tools!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Job Tools</h1>
        </div>

        <h2 style="color: #1e293b;">Welcome, ${name}!</h2>

        <p>Thanks for joining Job Tools. We're excited to help you land your dream job!</p>

        <p>Here's what you can do:</p>
        <ul style="padding-left: 20px;">
          <li><strong>Upload your resume</strong> — We'll parse and analyse it</li>
          <li><strong>Tailor for jobs</strong> — AI-powered customisation for each application</li>
          <li><strong>Generate cover letters</strong> — Matching your resume to job descriptions</li>
          <li><strong>Track applications</strong> — Stay organised with our job tracker</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/dashboard" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">If you have any questions, just reply to this email. We're here to help!</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Job Tools. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Welcome to Job Tools, ${name}!\n\nThanks for joining us. Get started at ${config.frontendUrl}/dashboard`,
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
    subject: 'Reset Your Password - Job Tools',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Job Tools</h1>
        </div>

        <h2 style="color: #1e293b;">Reset Your Password</h2>

        <p>Hi ${name},</p>

        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Job Tools. All rights reserved.
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
    subject: 'Verify Your Email - Job Tools',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Job Tools</h1>
        </div>

        <h2 style="color: #1e293b;">Verify Your Email</h2>

        <p>Hi ${name},</p>

        <p>Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Job Tools. All rights reserved.
        </p>
      </body>
      </html>
    `,
    text: `Verify your email: ${verifyUrl}`,
  });
}

// Check if email is configured
export function isSendGridConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
