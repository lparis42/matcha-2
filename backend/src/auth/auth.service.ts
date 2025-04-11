import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../db/db.service.js';
import { ConfigService } from '@nestjs/config/index.js';

@Injectable()
export class AuthService {

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) { }

  async signUp(body: any): Promise<string> {
    const { email, username, first_name, last_name, password } = body;
    // Check if the user already exists in the database
    // If the user exists, throw a conflict exception
    const selectObject = this.databaseService.selectQuery('users', ['email', 'username'], `email = '${email}' OR username = '${username}'`);
    const selectResult = await this.pool.query(selectObject);
    if (selectResult.rowCount !== 0) {
      throw new ConflictException('User already exists!');
    }
    // Insert the new user into the database
    // If the insert fails, throw an internal server error exception
    const hashPassword = await bcrypt.hash(password, 10);
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password'],
      [email, username, first_name, last_name, hashPassword]
    );
    const insertResult = await this.pool.query(insertObject.query, insertObject.params);
    if (!insertResult.rowCount) {
      throw new InternalServerErrorException('Failed to sign up user!');
    }
    // If the user is successfully inserted, return a success message
    Logger.log(`UserID: ${insertResult.rows[0].id} signed up successfully!`, 'AuthService');
    return 'User signed up successfully!';
  }

  async signIn(body: any): Promise<string> {
    const { username, password } = body;
    // Check if the user exists in the database
    // If the user does not exist, throw a bad request exception
    const selectObject = this.databaseService.selectQuery('users', ['username', 'password'], `username = '${username}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid username!');
    }
    // Check if the password is correct
    // If the password is incorrect, throw a bad request exception
    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password!');
    }
    // If the password is correct, return a success message
    Logger.log(`UserID: ${result.rows[0].id} signed in successfully!`, 'AuthService');
    return 'User signed in successfully!';
  }

  async askResetEmail(body: any): Promise<string> {
    const { email } = body;
    // Check if the email exists in the database
    // If the email does not exist, throw a bad request exception
    const selectObject = this.databaseService.selectQuery('users', ['email'], `email = '${email}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Email not found!');
    }
    // Update the user with the reset code
    // If the update fails, throw an internal server error exception
    const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const updateObject = this.databaseService.updateQuery('users', ['code'], `email = '${email}'`, [code]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      throw new InternalServerErrorException('Failed to send reset code!');
    }
    // Send the reset link using nodemailer and google OAuth2
    // If the email fails to send, throw an internal server error excepti
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        user: this.configService.get<string>('GOOGLE_MAIL_USER'),
        refreshToken: this.configService.get<string>('GOOGLE_MAIL_REFRESH_TOKEN'),
      },
    });
    await transporter.sendMail({
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Change Email',
      text: `
        Hello,
        You requested to change your email address. Please click the link below to reset your email:
        https://localhost:5173/reset-email?code=${code}
        If you did not request this, please ignore this email.
      `,
      html: `
        <h1>Hello,</h1>
        <p>You requested to change your email address. Please click the link below to reset your email:</p>
        <a href="https://localhost:5173/reset-email?code=${code}">Reset Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    // If the email is successfully sent, return a success message
    Logger.log(`UserID: ${result.rows[0].id} reset code sent successfully!`, 'AuthService');
    return 'Reset code sent to your email address!';
  }

  async resetEmail(body: any): Promise<string> {
    const { email, code } = body;
    // Check if the email exists in the database 
    // If the email does not exist, throw a bad request exception
    const selectObject = this.databaseService.selectQuery('users', ['email'], `code = '${code}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid email or code!');
    }
    // Update the user with the new email
    // If the email already exists, throw a conflict exception
    const updateObject = this.databaseService.updateQuery('users', ['email', 'code'], `code = '${code}'`, [email, null]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      throw new InternalServerErrorException('Failed to update email!');
    }
    // If the email is successfully updated, return a success message
    Logger.log(`UserID: ${result.rows[0].id} email updated successfully!`, 'AuthService');
    return 'Email updated successfully!';
  }


  async fortyTwoConnect(user: any): Promise<string> {
    const { email, username, first_name, last_name, picture, fortyTwoId } = user;
    // Check if the user already exists in the database
    // If the user exists, return a success message
    const selectfortyTwoId = this.databaseService.selectQuery('users', ['fortytwo_id'], `fortytwo_id = '${fortyTwoId}'`);
    const fortyTwoIdResult = await this.pool.query(selectfortyTwoId);
    if (fortyTwoIdResult.rowCount !== 0) {
      Logger.log(`UserID: ${fortyTwoIdResult.rows[0].id} signed in successfully!`, 'AuthService');
      return 'User signed in successfully!';
    }
    // Check if the email already exists in the database
    // If the email already exists, update the fortytwo_id field
    const selectEmail = this.databaseService.selectQuery('users', ['email, username'], `email = '${email}' AND username = '${username}'`);
    const emailResult = await this.pool.query(selectEmail);
    if (emailResult.rowCount !== 0) {
      const updateFortyTwoId = this.databaseService.updateQuery('users', ['fortytwo_id'], `email = '${email}'`, [fortyTwoId]);
      const updateFortyTwoIdResult = await this.pool.query(updateFortyTwoId.query, updateFortyTwoId.params);
      if (updateFortyTwoIdResult.rowCount === 0) {
        throw new InternalServerErrorException('Failed to update fortytwo_id!');
      }
      Logger.log(`UserID: ${emailResult.rows[0].id} signed in successfully!`, 'AuthService');
      return 'User signed in successfully!';
    }
    // Check if the username already exists in the database
    // If the username already exists, throw a conflict exception
    const selectUsername = this.databaseService.selectQuery('users', ['username'], `username = '${username}'`);
    const usernameResult = await this.pool.query(selectUsername);
    if (usernameResult.rowCount !== 0) {
      throw new ConflictException('Username already exists!');
    }
    // Insert the new user into the database
    // If the insert fails, throw an internal server error exception
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'picture', 'fortytwo_id'],
      [email, username, first_name, last_name, picture, fortyTwoId]
    );
    const insertResult = await this.pool.query(insertObject.query, insertObject.params);
    if (!insertResult.rowCount) {
      throw new InternalServerErrorException('Failed to sign up user!');
    }
    // If the user is successfully inserted, return a success message
    Logger.log(`UserID: ${insertResult.rows[0].id} signed up successfully!`, 'AuthService');
    return 'User signed up successfully!';
  }
}
