/**
 * Email Service
 * 
 * IMPORTANT: This service is READY but DISABLED by default.
 * To enable:
 * 1. Choose email provider (Gmail/SendGrid/Resend)
 * 2. Get SMTP credentials or API key
 * 3. Add environment variables to .env.local
 * 4. Set NEXT_PUBLIC_EMAIL_ENABLED=true
 */

// Check if email is enabled
export const isEmailEnabled = () => {
  return process.env.NEXT_PUBLIC_EMAIL_ENABLED === 'true';
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'resend';
  // SMTP config
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  // SendGrid config
  sendgridApiKey?: string;
  // Resend config
  resendApiKey?: string;
  // Common
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config?: EmailConfig) {
    // Use provided config or load from environment
    this.config = config || {
      provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'sendgrid' | 'resend') || 'smtp',
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      resendApiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@hicv.app',
      fromName: process.env.SMTP_FROM_NAME || 'HICv',
    };
  }

  /**
   * Check if email is properly configured
   */
  isConfigured(): boolean {
    if (this.config.provider === 'smtp') {
      return !!(this.config.smtpHost && this.config.smtpUser && this.config.smtpPass);
    } else if (this.config.provider === 'sendgrid') {
      return !!this.config.sendgridApiKey;
    } else if (this.config.provider === 'resend') {
      return !!this.config.resendApiKey;
    }
    return false;
  }

  /**
   * Send email using SMTP
   */
  private async sendViaSMTP(options: EmailOptions): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used
      const nodemailer = await import('nodemailer');

      const transporter = nodemailer.default.createTransporter({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
      });

      await transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`Email sent via SMTP to ${options.to}`);
    } catch (error: any) {
      console.error('SMTP email error:', error);
      throw new Error('Failed to send email via SMTP');
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<void> {
    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(this.config.sendgridApiKey!);

      await sgMail.default.send({
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`Email sent via SendGrid to ${options.to}`);
    } catch (error: any) {
      console.error('SendGrid email error:', error);
      throw new Error('Failed to send email via SendGrid');
    }
  }

  /**
   * Send email using Resend
   */
  private async sendViaResend(options: EmailOptions): Promise<void> {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(this.config.resendApiKey);

      await resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`Email sent via Resend to ${options.to}`);
    } catch (error: any) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send email via Resend');
    }
  }

  /**
   * Send email (main method)
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.warn('Email service is not configured. Email not sent.');
        return false;
      }

      if (!isEmailEnabled()) {
        console.log('Email service is disabled. Email not sent.');
        return false;
      }

      // Send based on provider
      if (this.config.provider === 'smtp') {
        await this.sendViaSMTP(options);
      } else if (this.config.provider === 'sendgrid') {
        await this.sendViaSendGrid(options);
      } else if (this.config.provider === 'resend') {
        await this.sendViaResend(options);
      } else {
        throw new Error('Invalid email provider');
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send multiple emails (batch)
   */
  async sendBatch(emails: EmailOptions[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const success = await this.sendEmail(email);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
};

export default EmailService;

