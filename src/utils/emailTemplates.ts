/**
 * Email template utilities for consistent email styling
 */

const BRAND_NAME = 'CV Builder';
const PRIMARY_COLOR = '#6366f1';
const SECONDARY_COLOR = '#8b5cf6';

// Common styles
const styles = {
  body: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;`,
  container: `max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;`,
  header: `background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%); padding: 32px; text-align: center;`,
  headerTitle: `color: white; margin: 0; font-size: 24px;`,
  content: `padding: 40px;`,
  heading: `color: #1e293b; margin: 0 0 16px;`,
  paragraph: `color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;`,
  button: `display: inline-block; background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;`,
  secondaryButton: `display: inline-block; background: #f1f5f9; color: #475569; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 500; font-size: 14px;`,
  muted: `color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 32px 0 0;`,
  divider: `border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;`,
  footer: `color: #94a3b8; font-size: 12px; margin: 0;`,
  link: `color: ${PRIMARY_COLOR};`,
};

/**
 * Base email layout wrapper
 */
export function emailLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  </head>
  <body style="${styles.body}">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">${BRAND_NAME}</h1>
      </div>
      <div style="${styles.content}">
        ${content}
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Create a primary CTA button
 */
export function primaryButton(text: string, href: string): string {
  return `<a href="${href}" style="${styles.button}">${text}</a>`;
}

/**
 * Create a secondary button
 */
export function secondaryButton(text: string, href: string): string {
  return `<a href="${href}" style="${styles.secondaryButton}">${text}</a>`;
}

/**
 * Create a divider
 */
export function divider(): string {
  return `<hr style="${styles.divider}">`;
}

/**
 * Create a link fallback section
 */
export function linkFallback(url: string): string {
  return `
    ${divider()}
    <p style="${styles.footer}">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="${styles.link}; word-break: break-all;">${url}</a>
    </p>`;
}

// Pre-built email templates

export interface VerificationEmailData {
  name: string;
  verifyUrl: string;
}

export function verificationEmail(data: VerificationEmailData): string {
  const content = `
    <h2 style="${styles.heading}">Hey ${data.name}!</h2>
    <p style="${styles.paragraph}">
      Thanks for signing up for ${BRAND_NAME}. Please verify your email address by clicking the button below.
    </p>
    ${primaryButton('Verify Email Address', data.verifyUrl)}
    <p style="${styles.muted}">
      If you didn't create an account, you can safely ignore this email.
    </p>
    ${linkFallback(data.verifyUrl)}
  `;
  return emailLayout(content, 'Verify your email address');
}

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetEmailData): string {
  const content = `
    <h2 style="${styles.heading}">Hi ${data.name},</h2>
    <p style="${styles.paragraph}">
      You requested to reset your password. Click the button below to create a new password.
    </p>
    ${primaryButton('Reset Password', data.resetUrl)}
    <p style="${styles.muted}">
      This link will expire in ${data.expiresIn}. If you didn't request a password reset, you can safely ignore this email.
    </p>
    ${linkFallback(data.resetUrl)}
  `;
  return emailLayout(content, 'Reset your password');
}

export interface WelcomeEmailData {
  name: string;
  loginUrl: string;
  features?: string[];
}

export function welcomeEmail(data: WelcomeEmailData): string {
  const featuresList = data.features
    ? `<ul style="color: #64748b; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
        ${data.features.map((f) => `<li>${f}</li>`).join('')}
       </ul>`
    : '';

  const content = `
    <h2 style="${styles.heading}">Welcome, ${data.name}!</h2>
    <p style="${styles.paragraph}">
      Your account is now verified and ready to use. Start building your perfect resume today!
    </p>
    ${featuresList}
    ${primaryButton('Go to Dashboard', data.loginUrl)}
    <p style="${styles.muted}">
      Need help getting started? Check out our guides or contact support.
    </p>
  `;
  return emailLayout(content, `Welcome to ${BRAND_NAME}!`);
}

export interface NotificationEmailData {
  name: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

export function notificationEmail(data: NotificationEmailData): string {
  const action = data.actionText && data.actionUrl
    ? primaryButton(data.actionText, data.actionUrl)
    : '';

  const content = `
    <h2 style="${styles.heading}">${data.title}</h2>
    <p style="${styles.paragraph}">Hi ${data.name},</p>
    <p style="${styles.paragraph}">${data.message}</p>
    ${action}
  `;
  return emailLayout(content, data.title);
}

export interface JobAlertEmailData {
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string;
  matchScore?: number;
}

export function jobAlertEmail(data: JobAlertEmailData): string {
  const scoreSection = data.matchScore
    ? `<p style="color: #10b981; font-weight: 600; margin: 0 0 16px;">
        Match Score: ${data.matchScore}%
       </p>`
    : '';

  const content = `
    <h2 style="${styles.heading}">New Job Match!</h2>
    <p style="${styles.paragraph}">Hi ${data.name}, we found a job that might interest you:</p>
    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <h3 style="color: #1e293b; margin: 0 0 8px; font-size: 18px;">${data.jobTitle}</h3>
      <p style="color: #64748b; margin: 0 0 8px;">${data.company}</p>
      <p style="color: #94a3b8; margin: 0; font-size: 14px;">${data.location}</p>
      ${scoreSection}
    </div>
    ${primaryButton('View Job', data.jobUrl)}
  `;
  return emailLayout(content, `New job match: ${data.jobTitle} at ${data.company}`);
}
