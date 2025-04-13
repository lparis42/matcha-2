import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../db/db.service.js';
import { ConfigService } from '@nestjs/config/index.js';
import { SignInDto } from './dto/dto.signin.js';
import { SignUpDto } from './dto/dto.signup.js';
import { AskResetEmailDto } from './dto/dto.askresetemail.js';
import { ResetEmailDto } from './dto/dto.resetemail.js';
import { UserData } from '../interfaces/interface.userdata.js';

@Injectable()
export class AuthService {

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) { }

  async signUp(body: SignUpDto): Promise<{ message: string }> {
    const { email, username, first_name, last_name, password } = body;
    // Check if the user already exists in the database
    // If the user exists, throw a conflict exception
    const selectObject = this.databaseService.selectQuery('users',
      ['email', 'username'], `email = '${email}' OR username = '${username}'`);
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
    const insertResult = await this.pool.query(insertObject.query + 'RETURNING id', insertObject.params);
    if (!insertResult.rowCount) {
      throw new InternalServerErrorException('Failed to sign up user!');
    }
    // If the user is successfully inserted, return a success message
    Logger.log(`User '${insertResult.rows[0].id}' signed up successfully!`, 'AuthService');
    return { message: 'User signed up successfully!' };
  }

  async signIn(body: SignInDto): Promise<{ userId: number, message: string }> {
    const { username, password } = body;
    // Check if the user exists in the database
    // If the user does not exist, throw a bad request exception
    const selectObject = this.databaseService.selectQuery('users',
      ['id', 'username', 'password'], `username = '${username}'`);
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
    const userId = result.rows[0].id;
    Logger.log(`User '${userId}' signed in successfully!`, 'AuthService');
    return { userId, message: 'User signed in successfully!' };
  }

  async askResetEmail(body: AskResetEmailDto): Promise<{ message: string }> {
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
    Logger.log(`User '${result.rows[0].id}' reset code sent successfully!`, 'AuthService');
    return { message: 'Reset code sent successfully!' };
  }

  async resetEmail(body: ResetEmailDto): Promise<{ message: string }> {
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
    Logger.log(`User '${result.rows[0].id}' email updated successfully!`, 'AuthService');
    return { message: 'Email updated successfully!' };
  }

  async fortyTwoConnect(user: UserData["profile"]): Promise<{ userId: number, message: string }> {
    const { fortytwo_id, email, username, first_name, last_name, picture } = user!;
    // Check if the user already exists in the database
    // If the user exists, return a success message
    const selectfortyTwoId = this.databaseService.selectQuery('users', ['id', 'fortytwo_id'], `fortytwo_id = '${fortytwo_id}'`);
    const fortyTwoIdResult = await this.pool.query(selectfortyTwoId);
    if (fortyTwoIdResult.rowCount !== 0) {
      const userId = fortyTwoIdResult.rows[0].id;
      Logger.log(`User '${userId}' signed in successfully!`, 'AuthService');
      return { userId: userId, message: 'User signed in successfully!' };
    }
    // Check if the email already exists in the database
    // If the email already exists, update the fortytwo_id field
    const selectEmail = this.databaseService.selectQuery('users', ['email, username'], `email = '${email}' AND username = '${username}'`);
    const emailResult = await this.pool.query(selectEmail);
    if (emailResult.rowCount !== 0) {
      const updateFortyTwoId = this.databaseService.updateQuery('users', ['fortytwo_id'], `email = '${email}'`, [fortytwo_id]);
      const updateFortyTwoIdResult = await this.pool.query(updateFortyTwoId.query, updateFortyTwoId.params);
      if (updateFortyTwoIdResult.rowCount === 0) {
        throw new InternalServerErrorException('Failed to update fortytwo_id!');
      }
      const userId = emailResult.rows[0].id;
      Logger.log(`User '${userId}' signed in successfully!`, 'AuthService');
      return { userId: userId, message: 'User signed in successfully!' };
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
    await this.pool.query('BEGIN');
    const insertObject = this.databaseService.insertQuery(
      'users',
      ['email', 'username', 'first_name', 'last_name', 'fortytwo_id'],
      [email, username, first_name, last_name, fortytwo_id]
    );
    const insertResult = await this.pool.query(insertObject.query + ' RETURNING id', insertObject.params);
    const userId = insertResult.rows[0].id;
    const insertPicture = this.databaseService.updateQuery(
      'users_pictures', ['picture_1'], `user_id = ${userId}`, [picture]
    );
    const insertPictureResult = await this.pool.query(insertPicture.query, insertPicture.params);
    if (!insertResult.rowCount || !insertPictureResult.rowCount) {
      await this.pool.query('ROLLBACK');
      throw new InternalServerErrorException('Failed to sign up user!');
    }
    await this.pool.query('COMMIT');
    // If the user is successfully inserted, return a success message
    Logger.log(`User '${userId}' signed up successfully!`, 'AuthService');
    return { userId, message: 'User signed up successfully!' };
  }
}
