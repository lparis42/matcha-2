import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../db/db.service.js';
import { SignInDto } from './dto/dto.signin.js';
import { SignUpDto } from './dto/dto.signup.js';
import { UserData } from '../interfaces/interface.userdata.js';
import { MailService } from '../email/mail.service.js';
import { v4 as uuidv4 } from 'uuid';
import { UUIDDto } from './dto/dto.UUID.js';
import { PasswordDto } from './dto/dto.password.js';
import { EmailDto } from './dto/dto.email.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) { }

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
      ['id', 'username', 'password', 'is_verified'], `username = $1`, [username]);
    const result = await this.databaseService.execute(selectObject.query, selectObject.params);
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
      ['email', 'username'], `email = $1 OR username = $2`, [email, username]);
    const selectResult = await this.databaseService.execute(selectObject.query, selectObject.params);
    if (selectResult.rowCount !== 0) {
      this.logger.error(`User '${email}' or '${username}' already exists!`);
      throw new HttpException('User already exists!', HttpStatus.CONFLICT);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password', 'uuid'],
      [email, username, first_name, last_name, hashPassword, uuid]
    );
    const insertResult = await this.databaseService.execute(insertObject.query + 'RETURNING id', insertObject.params);
    if (!insertResult.rowCount) {
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.mailService.sendVerificationEmail(email, uuid);

    this.logger.log(`User '${insertResult.rows[0].id}' signed up successfully!`);
    return { message: 'User signed up successfully!' };
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
  async verifyEmail(body: UUIDDto): Promise<{ message: string }> {
    const { uuid } = body;
    const selectObject = this.databaseService.selectQuery('users', ['id', 'uuid'], `uuid = $1`, [uuid]);
    const result = await this.databaseService.execute(selectObject.query, selectObject.params);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid UUID '${uuid}'!`);
      throw new HttpException('Invalid UUID!', HttpStatus.BAD_REQUEST);
    }

    const userId = result.rows[0].id;
    if (result.rows[0].uuid !== uuid) {
      this.logger.error(`Invalid verification code for userId '${userId}'!`);
      throw new HttpException('Invalid email or uuid!', HttpStatus.BAD_REQUEST);
    }

    const updateObject = this.databaseService.updateQuery('users', ['is_verified'], `id=$1`, [true], [userId]);
    const updateResult = await this.databaseService.execute(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      this.logger.error(`Failed to update to verify for user '${userId}'!`);
      throw new HttpException('Failed to update to verify!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`User '${result.rows[0].id}' verified successfully!`);
    return { message: 'User verified successfully!' };
  }

  /**
   * Requests a password reset for a user by sending a reset email.
   *
   * @param body - The data required for password reset.
   * @param body.email - The email address of the user requesting the password reset.
   * @returns A promise that resolves to an object containing a success message.
   * @throws {HttpException} If the email is invalid, the password update fails,
   * or if sending the reset email fails.
   */
  async forgotPassword(body: EmailDto): Promise<{ message: string }> {
    const { email } = body;

    const selectObject = this.databaseService.selectQuery('users', ['email', 'id'], `email = $1`, [email]);
    const result = await this.databaseService.execute(selectObject.query, selectObject.params);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid email '${email}'!`);
      throw new HttpException('Invalid email!', HttpStatus.BAD_REQUEST);
    }

    const uuid = uuidv4();
    const updateObject = this.databaseService.updateQuery('users', ['uuid'], `email = $1`, [uuid], [email]);
    await this.databaseService.execute(updateObject.query, updateObject.params);

    await this.mailService.sendResetPasswordEmail(email, uuid);

    this.logger.log(`User '${result.rows[0].id}' password updated successfully!`);
    return { message: 'Password updated successfully!' };
  }

  /**
   * Generates a new password for a user and updates it in the database.
   *
   * @param body - The data required for password generation.
    * @param body.password - The new password for the user.
    * @param body.uuid - The unique verification code sent to the user's email.
    * @returns A promise that resolves to an object containing the new password and a success message.
    * @throws {HttpException} If the user ID is invalid, the password update fails,
   * or if the database operation fails.
   */
  async resetPassword(body: PasswordDto, query: UUIDDto): Promise<{ password: string, message: string }> {
    const { password } = body;
    const { uuid } = query;

    const selectObject = this.databaseService.selectQuery('users', ['email', 'id'], `uuid = $1`, [uuid]);
    const result = await this.databaseService.execute(selectObject.query, selectObject.params);
    if (result.rowCount === 0) {
      this.logger.error(`Invalid UUID '${uuid}'!`);
      throw new HttpException('Invalid UUID!', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const updateObject = this.databaseService.updateQuery('users', ['password'], `uuid = $1`, [hashPassword], [uuid]);
    const updateResult = await this.databaseService.execute(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      this.logger.error(`Failed to update password for userId '${result.rows[0].id}'!`);
      throw new HttpException('Failed to update password!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const invalidateUUID = this.databaseService.updateQuery('users', ['uuid'], `uuid = $1`, [null], [uuid]);
    await this.databaseService.execute(invalidateUUID.query, invalidateUUID.params);

    this.logger.log(`User '${result.rows[0].id}' password updated successfully!`);
    return { password: password, message: 'Password updated successfully!' };
  }

  /**
   * Connects a user to the FortyTwo service.
   *
   * @param user - Partial user data from the FortyTwo service.
   * @returns A promise that resolves to an object containing the user ID and a success message.
   * @throws {HttpException} If the user already exists, the username already exists,
   * or if the database operation fails.
   */
  async fortyTwoConnect(user: UserData): Promise<{ userId: number, message: string }> {
    const { fortytwo_id, email, username, first_name, last_name, picture } = user;

    const selectfortyTwoId = this.databaseService.selectQuery('users', ['id', 'fortytwo_id'], `fortytwo_id = $1`, [fortytwo_id]);
    const fortyTwoIdResult = await this.databaseService.execute(selectfortyTwoId.query, selectfortyTwoId.params);
    if (fortyTwoIdResult.rowCount !== 0) {
      const userId = fortyTwoIdResult.rows[0].id;
      this.logger.log(`User '${userId}' signed in successfully!`);
      return { userId: userId, message: 'User signed in successfully!' };
    }

    const selectEmail = this.databaseService.selectQuery('users', ['email', 'username'], `email = $1 AND username = $2`, [email, username]);
    const emailResult = await this.databaseService.execute(selectEmail.query, selectEmail.params);
    if (emailResult.rowCount !== 0) {
      const updateFortyTwoId = this.databaseService.updateQuery('users', ['fortytwo_id'], `email = $1`, [fortytwo_id], [email]);
      const updateFortyTwoIdResult = await this.databaseService.execute(updateFortyTwoId.query, updateFortyTwoId.params);
      if (updateFortyTwoIdResult.rowCount === 0) {
        this.logger.error(`Failed to update fortytwo_id for email '${email}'!`);
        throw new HttpException('Failed to update fortytwo_id!', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const userId = emailResult.rows[0].id;
      this.logger.log(`User '${userId}' signed in successfully!`);
      return { userId: userId, message: 'User signed in successfully!' };
    }

    const selectUsername = this.databaseService.selectQuery('users', ['username'], `username = $1`, [username]);
    const usernameResult = await this.databaseService.execute(selectUsername.query, selectUsername.params);
    if (usernameResult.rowCount !== 0) {
      this.logger.error(`Username '${username}' already exists!`);
      throw new HttpException('Username already exists!', HttpStatus.CONFLICT);
    }

    await this.databaseService.execute('BEGIN');
    const insertObject = this.databaseService.insertQuery(
      'users',
      ['email', 'username', 'first_name', 'last_name', 'fortytwo_id'],
      [email, username, first_name, last_name, fortytwo_id]
    );
    const insertResult = await this.databaseService.execute(insertObject.query + ' RETURNING id', insertObject.params);
    const userId = insertResult.rows[0].id;
    const insertPicture = this.databaseService.updateQuery(
      'users_pictures', ['picture_1'], `user_id = $1`, [picture], [userId]
    );
    const insertPictureResult = await this.databaseService.execute(insertPicture.query, insertPicture.params);
    if (!insertResult.rowCount || !insertPictureResult.rowCount) {
      await this.databaseService.execute('ROLLBACK');
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.databaseService.execute('COMMIT');

    this.logger.log(`User '${userId}' signed up successfully!`);
    return { userId, message: 'User signed up successfully!' };
  }

  // For testing purposes only

  /**
   * Signs up a new user without sending a verification email.
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
      ['email', 'username'], `email = $1 OR username = $2`, [email, username]);
    const selectResult = await this.databaseService.execute(selectObject.query, selectObject.params);
    if (selectResult.rowCount !== 0) {
      this.logger.error(`User '${email}' or '${username}' already exists!`);
      throw new HttpException('User already exists!', HttpStatus.CONFLICT);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    const insertObject = this.databaseService.insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password', 'uuid', 'is_verified'],
      [email, username, first_name, last_name, hashPassword, uuid, true]
    );
    const insertResult = await this.databaseService.execute(insertObject.query + 'RETURNING id', insertObject.params);
    if (!insertResult.rowCount) {
      this.logger.error(`Failed to sign up user '${email}'!`);
      throw new HttpException('Failed to sign up user!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`User '${insertResult.rows[0].id}' signed up successfully!`);
    return { message: 'User signed up successfully!' };
  }
}
