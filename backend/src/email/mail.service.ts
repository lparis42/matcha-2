import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private gmailUser: string;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService) {
    this.gmailUser = this.configService.get<string>('GOOGLE_MAIL_USER')!;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        user: this.configService.get<string>('GOOGLE_MAIL_USER'),
        refreshToken: this.configService.get<string>('GOOGLE_MAIL_REFRESH_TOKEN'),
      },
      //logger: true,
      //debug: true, 
    });
  }

  /**
   * Sends a verification email to the user.
   * 
   * @param email - The email address of the user to send the verification email to.
   * @param uuid - The UUID of the user to send the verification email to.
   * @returns A promise that resolves when the email is sent.
   * @throws {Error} If there is an error sending the email.
   */
  async sendVerificationEmail(email: string, uuid: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.gmailUser,
      to: email,
      subject: 'Email Verification',
      text: `
        Hello,
        Please verify your email address by clicking the link below:
        https://localhost:5173/auth/verify-email?uuid=${uuid}
        If you did not request this, please ignore this email.
      `,
      html: `
        <h1>Hello,</h1>
        <p>Please verify your email address by clicking the link below:</p>
        https://localhost:5173/auth/verify-email?uuid=${uuid}
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  /**
   * Sends a password reset email to the user.
   * 
   * @param email - The email address of the user to send the password reset email to.
   * @param uuid - The UUID of the user to send the password reset email to.
   * @returns A promise that resolves when the email is sent.
   * @throws {Error} If there is an error sending the email.
   */
  async sendResetPasswordEmail(email: string, uuid: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.gmailUser,
      to: email,
      subject: 'Password Reset',
      text: `
        Hello,
        Please reset your password by clicking the link below:
        https://localhost:5173/auth/reset-password?uuid=${uuid}
        If you did not request this, please ignore this email.
      `,
      html: `
        <h1>Hello,</h1>
        <p>Please reset your password by clicking the link below:</p>
        https://localhost:5173/auth/reset-password?uuid=${uuid}
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }
}