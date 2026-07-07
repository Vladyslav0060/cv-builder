import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { mailConfig, webConfig } from 'src/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private readonly mail: ConfigType<typeof mailConfig>,
    @Inject(webConfig.KEY)
    private readonly web: ConfigType<typeof webConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.mail.host,
      port: this.mail.port,
      secure: this.mail.secure,
      auth: {
        user: this.mail.user,
        pass: this.mail.pass,
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.mail.from,
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
    const url = `${this.web.baseUrl}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.mail.from,
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
