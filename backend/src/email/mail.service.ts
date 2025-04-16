import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private gmailUser: string;
  private oAuth2Client: any;
  private gmailClient: any;

  constructor(private configService: ConfigService) {
    this.gmailUser = this.configService.get<string>('GOOGLE_MAIL_USER')!;

    // OAuth2 client setup
    this.oAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );

    // Set the credentials for OAuth2 client
    this.oAuth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GOOGLE_MAIL_REFRESH_TOKEN'),
    });

    this.gmailClient = google.gmail({ version: 'v1', auth: this.oAuth2Client });
  }

  /**
   * Create an email message in MIME format.
   * 
   * @param to - The recipient email address.
   * @param subject - The subject of the email.
   * @param message - The HTML content of the email.
   * @returns A base64 encoded MIME string.
   */
  private createMessage(to: string, subject: string, message: string): string {
    const emailLines = [
      `From: ${this.gmailUser}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=UTF-8`,
      '',
      message,
    ];

    const encodedMessage = Buffer.from(emailLines.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Remove padding for the base64 encoding

    return encodedMessage;
  }

  /**
   * Sends an email using Gmail API.
   * 
   * @param message - The HTML message content.
   * @param to - The recipient email address.
   * @param subject - The subject of the email.
   * @returns A promise that resolves when the email is sent.
   * @throws {Error} If there is an error sending the email.
   */
  private async sendEmail(message: string, to: string, subject: string) {
    const encodedMessage = this.createMessage(to, subject, message);
    const res = await this.gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return res.data;
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
    const message = `
      <h1>Hello,</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="https://localhost:5173/auth/verify-email?uuid=${uuid}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await this.sendEmail(message, email, 'Email Verification');
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
    const message = `
      <h1>Hello,</h1>
      <p>Please reset your password by clicking the link below:</p>
      <a href="https://localhost:5173/auth/reset-password?uuid=${uuid}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await this.sendEmail(message, email, 'Password Reset');
  }
}
