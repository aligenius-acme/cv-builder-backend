import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('Email service not configured. Emails will be logged to console.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = process.env.EMAIL_FROM || 'CV Builder <noreply@cvbuilder.com>';

    if (!this.transporter) {
      // Log email to console in development
      console.log('='.repeat(60));
      console.log('EMAIL (not sent - SMTP not configured)');
      console.log('='.repeat(60));
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('-'.repeat(60));
      console.log(options.text || options.html);
      console.log('='.repeat(60));
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    const name = firstName || 'there';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">CV Builder</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 16px;">Hey ${name}!</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Thanks for signing up for CV Builder. Please verify your email address by clicking the button below.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 32px 0 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hey ${name}!

Thanks for signing up for CV Builder. Please verify your email address by clicking the link below:

${verifyUrl}

If you didn't create an account, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your email address - CV Builder',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const name = firstName || 'there';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">CV Builder</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 16px;">Hey ${name}!</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 32px 0 0;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hey ${name}!

We received a request to reset your password. Click the link below to choose a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your password - CV Builder',
      html,
      text,
    });
  }

  async sendOrgInviteEmail(email: string, orgName: string, inviterName: string, token: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">CV Builder</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 16px;">You're Invited!</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on CV Builder.
              </p>
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 32px 0 0;">
                This invitation will expire in 7 days.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
You're Invited!

${inviterName} has invited you to join ${orgName} on CV Builder.

Click the link below to accept the invitation:
${inviteUrl}

This invitation will expire in 7 days.
    `;

    return this.sendEmail({
      to: email,
      subject: `You're invited to join ${orgName} on CV Builder`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
