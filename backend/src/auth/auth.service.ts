import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { insertQuery, selectQuery, updateQuery } from '../db/db.query.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
  ) { }

  async signUp(body: any): Promise<string> {
    const { email, username, first_name, last_name, password } = body;
    // Check if the user already exists in the database
    // If the user exists, throw a conflict exception
    const selectObject = selectQuery('users', ['email', 'username'], `email = '${email}' OR username = '${username}'`);
    const selectResult = await this.pool.query(selectObject);
    if (selectResult.rowCount !== 0) {
      throw new ConflictException('User already exists!');
    }
    // Insert the new user into the database
    // If the insert fails, throw an internal server error exception
    const hashPassword = await bcrypt.hash(password, 10);
    const insertObject = insertQuery('users',
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
    const selectObject = selectQuery('users', ['username', 'password'], `username = '${username}' AND password = '${password}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid username or password!');
    }
    // Check if the password is correct
    // If the password is incorrect, throw a bad request exception
    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password!');
    }
    // If the password is correct, return a success message
    Logger.log(`UserID: ${result.rows[0].id} signed in successfully!`, 'AuthService');
    return 'User signed in successfully!';
  }

  async askResetEmail(email: string): Promise<string> {
    // Check if the email exists in the database
    // If the email does not exist, throw a bad request exception
    const selectObject = selectQuery('users', ['email'], `email = '${email}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Email not found!');
    }
    // Update the user with the reset code
    // If the update fails, throw an internal server error exception
    const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const updateObject = updateQuery('users', ['code'], `email = '${email}'`, [code]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      throw new InternalServerErrorException('Failed to send reset code!');
    }
    // todo: send email with the reset code link.
    // example: https://localhost:5173/reset-email?code=123456
    
    // If the email is successfully sent, return a success message
    Logger.log(`UserID: ${result.rows[0].id} reset code sent successfully!`, 'AuthService');
    return 'Reset code sent to your email address!';
  }

  async resetEmail(body: any): Promise<string> {
    const { email, newEmail, code } = body;
    // Check if the email exists in the database and if the code is valid
    // If the email or code is invalid, throw a bad request exception
    const selectObject = selectQuery('users', ['email'], `email = '${email}' AND code = '${code}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid email or code!');
    }
    // Update the user with the new email
    // If the email already exists, throw a conflict exception
    const updateObject = updateQuery('users', ['email'], `email = '${email}'`, [newEmail]);
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
    const selectfortyTwoId = selectQuery('users', ['fortytwo_id'], `fortytwo_id = '${fortyTwoId}'`);
    const fortyTwoIdResult = await this.pool.query(selectfortyTwoId);
    if (fortyTwoIdResult.rowCount !== 0) {
      Logger.log(`UserID: ${fortyTwoIdResult.rows[0].id} signed in successfully!`, 'AuthService');
      return 'User signed in successfully!';
    }
    // Check if the email already exists in the database
    // If the email already exists, update the fortytwo_id field
    const selectEmail = selectQuery('users', ['email, username'], `email = '${email}' AND username = '${username}'`);
    const emailResult = await this.pool.query(selectEmail);
    if (emailResult.rowCount !== 0) {
      const updateFortyTwoId = updateQuery('users', ['fortytwo_id'], `email = '${email}'`, [fortyTwoId]);
      const updateFortyTwoIdResult = await this.pool.query(updateFortyTwoId.query, updateFortyTwoId.params);
      if (updateFortyTwoIdResult.rowCount === 0) {
        throw new InternalServerErrorException('Failed to update fortytwo_id!');
      }
      Logger.log(`UserID: ${emailResult.rows[0].id} signed in successfully!`, 'AuthService');
      return 'User signed in successfully!';
    }
    // Check if the username already exists in the database
    // If the username already exists, throw a conflict exception
    const selectUsername = selectQuery('users', ['username'], `username = '${username}'`);
    const usernameResult = await this.pool.query(selectUsername);
    if (usernameResult.rowCount !== 0) {
      throw new ConflictException('Username already exists!');
    }
    // Insert the new user into the database
    // If the insert fails, throw an internal server error exception
    const insertObject = insertQuery('users',
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
