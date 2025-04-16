import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        user: this.configService.get<string>('GOOGLE_GMAIL_USER'),
        refreshToken: this.configService.get<string>('GOOGLE_MAIL_REFRESH_TOKEN'),
      },
      //logger: true,
      //debug: true,
    });
  }

  async sendVerificationEmail(email: string, userId: string, uuid: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Email Verification',
      text: `
        Hello,
        Please verify your email address by clicking the link below:
        https://localhost:3000/api/auth/verify-email?userId=${userId}&uuid=${uuid}
        If you did not request this, please ignore this email.
      `,
      html: `
        <h1>Hello,</h1>
        <p>Please verify your email address by clicking the link below:</p>
        https://localhost:3000/api/auth/verify-email?userId=${userId}&uuid=${uuid}
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }


  async sendResetPasswordEmail(email: string, newPassword: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Change Email',
      text: `
        Hello,
        Here is your new password: ${newPassword}
        Please change your password after logging in.
      `,
      html: `
        <h1>Hello,</h1>
        <p>Here is your new password: ${newPassword}</p>
        <p>Please change your password after logging in.</p>
      `,
    });
  }
}