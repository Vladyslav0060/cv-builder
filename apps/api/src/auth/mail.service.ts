import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Verify your email – CV Builder',
      html: `
        <p>Hi there,</p>
        <p>Enter the code below to verify your email address. The code expires in 15 minutes.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;">${code}</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });
    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${process.env.WEB_BASE_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Reset your password – CV Builder',
      html: `
        <p>Hi there,</p>
        <p>We received a request to reset your password. Click the link below to set a new one. The link expires in 1 hour.</p>
        <p><a href="${url}">Reset password</a></p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      `,
    });
    this.logger.log(`Password reset email sent to ${to}`);
  }
}
