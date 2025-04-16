import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../db/db.service.js';
import { SignInDto } from './dto/dto.signin.js';
import { SignUpDto } from './dto/dto.signup.js';
import { UserData } from '../interfaces/interface.userdata.js';
import { MailService } from '../email/mail.service.js';
import { VerifyEmailDto } from './dto/dto.verifyEmail.js';
import { v4 as uuidv4 } from 'uuid';
import { generatePassword } from './utils/utils.js';
import { ResetPasswordDto } from './dto/dto.resetPassword.js';
import { ChangePasswordDto } from './dto/dto.changePassword.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) { }

  /**
   * Signs up a new user by validating their credentials and sending a verification email.
   *
   * @param body - The data required for signing up.
   * @param body.email - The email address of the user.
   * @param body.username - The username of the user.
   * @param body.first_name - The first name of the user.
   * @param body.last_name - The last name of the user.
   * @param body.password - The password of the user.
   * @returns A promise that resolves to an object containing a success message.
   * @throws {HttpException} If the email or username already exists, or if the database operation fails.
   */
  async signUp(body: SignUpDto): Promise<{ message: string }> {
    const { email, username, first_name, last_name, password } = body;

    const selectObject = this.databaseService.selectQuery('users',
      ['email', 'username'], `email = '${email}' OR username = '${username}'`);
    const selectResult = await this.pool.query(selectObject);
    if (selectResult.rowCount !== 0) {
      this.logger.error(`User '${email}' or '${username}' already exists!`);
      throw new HttpException('User already exists!', HttpStatus.CONFLICT);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password, verify_email_code'],
      [email, username, first_name, last_name, hashPassword, uuid]
    );
    const insertResult = await this.pool.query(insertObject.query + 'RETURNING id', insertObject.params);
    if (!insertResult.rowCount) {
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      this.mailService.sendVerificationEmail(email, insertResult.rows[0].id, uuid);
    } catch (error) {
      this.logger.error(`Failed to send verification email to '${email}'`);
      throw new HttpException('Failed to send verification email!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`User '${insertResult.rows[0].id}' signed up successfully!`);
    return { message: 'User signed up successfully!' };
  }

  /**
   * Signs up a new user by validating their credentials but without sending a verification email.
   *
   * @param body - The data required for signing up.
   * @param body.email - The email address of the user.
   * @param body.username - The username of the user.
   * @param body.first_name - The first name of the user.
   * @param body.last_name - The last name of the user.
   * @param body.password - The password of the user.
   * @returns A promise that resolves to an object containing a success message.
   * @throws {HttpException} If the email or username already exists, or if the database operation fails.
   */
  async signUpNoEmailVerification(body: SignUpDto): Promise<{ message: string }> {
    const { email, username, first_name, last_name, password } = body;

    const selectObject = this.databaseService.selectQuery('users',
      ['email', 'username'], `email = '${email}' OR username = '${username}'`);
    const selectResult = await this.pool.query(selectObject);
    if (selectResult.rowCount !== 0) {
      this.logger.error(`User '${email}' or '${username}' already exists!`);
      throw new HttpException('User already exists!', HttpStatus.CONFLICT);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password, verify_email_code', 'is_verified'],
      [email, username, first_name, last_name, hashPassword, uuid, true]
    );
    const insertResult = await this.pool.query(insertObject.query + 'RETURNING id', insertObject.params);
    if (!insertResult.rowCount) {
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`User '${insertResult.rows[0].id}' signed up successfully!`);
    return { message: 'User signed up successfully!' };
  }

  /**
   * Signs in a user by validating their credentials.
   *
   * @param body - The data required for signing in.
   * @param body.username - The username of the user.
   * @param body.password - The password of the user.
   * @returns A promise that resolves to an object containing the user ID and a success message.
   * @throws {HttpException} If the username or password is invalid, or if the user is not verified.
   */
  async signIn(body: SignInDto): Promise<{ userId: number, message: string }> {
    const { username, password } = body;

    const selectObject = this.databaseService.selectQuery('users',
      ['id', 'username', 'password, is_verified'], `username = '${username}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid username or password for '${username}'!`);
      throw new HttpException('Invalid username or password!', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
      this.logger.error(`Invalid password for '${username}'!`);
      throw new HttpException('Invalid username or password!', HttpStatus.BAD_REQUEST);
    }

    if (!result.rows[0].is_verified) {
      this.logger.error(`User '${username}' is not verified!`);
      throw new HttpException('User is not verified!', HttpStatus.BAD_REQUEST);
    }

    const userId = result.rows[0].id;
    this.logger.log(`User '${userId}' signed in successfully!`);
    return { userId, message: 'User signed in successfully!' };
  }

  /**
  * Verifies a user's email address using a verification code.
  *
  * @param body - The data required for email verification.
  * @param body.userId - The ID of the user whose email is being verified.
  * @param body.uuid - The unique verification code sent to the user's email.
  * @returns A promise that resolves to an object containing a success message.
  * @throws {HttpException} If the user ID is invalid, the verification code is incorrect,
  * or if the database update fails.
  */
  async verifyEmail(body: VerifyEmailDto): Promise<{ message: string }> {
    const { userId, uuid } = body;
    const selectObject = this.databaseService.selectQuery('users', ['id', 'verify_email_code'], `id = '${userId}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid userId with id ${userId}'!`);
      throw new HttpException('Invalid email or code!', HttpStatus.BAD_REQUEST);
    }

    if (result.rows[0].verify_email_code !== uuid) {
      this.logger.error(`Invalid verification code for userId '${userId}'!`);
      throw new HttpException('Invalid email or code!', HttpStatus.BAD_REQUEST);
    }

    const updateObject = this.databaseService.updateQuery('users', ['is_verified'], `id='${userId}'`, [true]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      this.logger.error(`Failed to update to verify for user '${userId}'!`);
      throw new HttpException('Failed to update to verify!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`User '${result.rows[0].id}' verified successfully!`);
    return { message: 'User verified successfully!' };
  }

  /**
   * Resets the password for a user by sending a reset email.
   *
   * @param body - The data required for password reset.
   * @param body.email - The email address of the user requesting the password reset.
   * @returns A promise that resolves to an object containing a success message.
   * @throws {HttpException} If the email is invalid, the password update fails,
   * or if sending the reset email fails.
   */
  async resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
    const { email } = body;

    const selectObject = this.databaseService.selectQuery('users', ['email', 'id'], `email = '${email}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid email '${email}'!`);
      throw new HttpException('Invalid email!', HttpStatus.BAD_REQUEST);
    }

    const newPassword = generatePassword(10);
    const hashPassword = await bcrypt.hash(newPassword, 10);

    const updateObject = this.databaseService.updateQuery('users', ['password'], `email = '${email}'`, [hashPassword]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      this.logger.error(`Failed to update password for '${email}'!`);
      throw new HttpException('Failed to update password!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    try {
      this.mailService.sendResetPasswordEmail(email, newPassword);
    }
    catch (error) {
      this.logger.error(`Failed to send reset password email to '${email}'`);
      throw new HttpException('Failed to send reset password email!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    this.logger.log(`User '${result.rows[0].id}' password updated successfully!`);
    return { message: 'Password updated successfully!' };
  }

  /**
   * Changes the password for a user.
   *
   * @param body - The data required for changing the password.
   * @param body.userId - The ID of the user whose password is being changed.
   * @param body.oldPassword1 - The current password of the user.
   * @param body.oldPassword2 - A confirmation of the current password.
   * @param body.newPassword - The new password for the user.
   * @returns A promise that resolves to an object containing a success message.
   * @throws {HttpException} If the user ID is invalid, the passwords do not match,
   * or if the database update fails.
   */
  async changePassword(body: ChangePasswordDto): Promise<{ message: string }> {
    const { userId, oldPassword1, oldPassword2, newPassword } = body;

    this.logger.log(`Changing password for userId '${userId}'...`);
    const selectObject = this.databaseService.selectQuery('users', ['id', 'password'], `id = '${userId}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid userId with id ${userId}'!`);
      throw new HttpException('Invalid userId!', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword1, result.rows[0].password);
    if (!isPasswordValid) { 
      this.logger.error(`Invalid password for userId '${userId}'!`);
      throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
    }
    if (oldPassword1 !== oldPassword2) {
      this.logger.error(`Passwords do not match for userId '${userId}'!`);
      throw new HttpException('Passwords do not match!', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    const updateObject = this.databaseService.updateQuery('users', ['password'], `id = '${userId}'`, [hashPassword]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      this.logger.error(`Failed to update password for userId '${userId}'!`);
      throw new HttpException('Failed to update password!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    this.logger.log(`User '${userId}' password updated successfully!`);
    return { message: 'Password updated successfully!' };
  }

  /**
   * Connects a user to the FortyTwo service.
   *
   * @param user - The user data from the FortyTwo service.
   * @returns A promise that resolves to an object containing the user ID and a success message.
   * @throws {HttpException} If the user already exists, the username already exists,
   * or if the database operation fails.
   */
  async fortyTwoConnect(user: UserData): Promise<{ userId: number, message: string }> {
    const { fortytwo_id, email, username, first_name, last_name, picture } = user;

    const selectfortyTwoId = this.databaseService.selectQuery('users', ['id', 'fortytwo_id'], `fortytwo_id = '${fortytwo_id}'`);
    const fortyTwoIdResult = await this.pool.query(selectfortyTwoId);
    if (fortyTwoIdResult.rowCount !== 0) {
      const userId = fortyTwoIdResult.rows[0].id;
      this.logger.log(`User '${userId}' signed in successfully!`);
      return { userId: userId, message: 'User signed in successfully!' };
    }

    const selectEmail = this.databaseService.selectQuery('users', ['email, username'], `email = '${email}' AND username = '${username}'`);
    const emailResult = await this.pool.query(selectEmail);
    if (emailResult.rowCount !== 0) {
      const updateFortyTwoId = this.databaseService.updateQuery('users', ['fortytwo_id'], `email = '${email}'`, [fortytwo_id]);
      const updateFortyTwoIdResult = await this.pool.query(updateFortyTwoId.query, updateFortyTwoId.params);
      if (updateFortyTwoIdResult.rowCount === 0) {
        this.logger.error(`Failed to update fortytwo_id for email '${email}'!`);
        throw new HttpException('Failed to update fortytwo_id!', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const userId = emailResult.rows[0].id;
      this.logger.log(`User '${userId}' signed in successfully!`);
      return { userId: userId, message: 'User signed in successfully!' };
    }

    const selectUsername = this.databaseService.selectQuery('users', ['username'], `username = '${username}'`);
    const usernameResult = await this.pool.query(selectUsername);
    if (usernameResult.rowCount !== 0) {
      this.logger.error(`Username '${username}' already exists!`);
      throw new HttpException('Username already exists!', HttpStatus.CONFLICT);
    }

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
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.pool.query('COMMIT');
    // If the user is successfully inserted, return a success message
    this.logger.log(`User '${userId}' signed up successfully!`);
    return { userId, message: 'User signed up successfully!' };
  }
}
