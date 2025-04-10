import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { insertQuery, selectQuery, updateQuery } from './sql/sql.query.js';

@Injectable()
export class AppService {

  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: InstanceType<typeof Pool>,
  ) { }

  async signUp(body: any): Promise<string> {
    const { email, username, first_name, last_name, password } = body;
    const insertObject = insertQuery('users',
      ['email', 'username', 'first_name', 'last_name', 'password'],
      [email, username, first_name, last_name, password]
    );
    const result = await this.pool.query(insertObject.query, insertObject.params);
    if (!result.rowCount) {
      throw new ConflictException('User already exists!');
    }
    Logger.log(`UserID: ${result.rows[0].id} signed up successfully!`, 'AppService');
    return 'User signed up successfully!';
  }

  async signIn(body: any): Promise<string> {
    const { username, password } = body;
    const selectObject = selectQuery('users', ['username', 'password'], `username = '${username}' AND password = '${password}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid username or password!');
    }
    Logger.log(`UserID: ${result.rows[0].id} signed in successfully!`, 'AppService');
    return 'User signed in successfully!';
  }

  async askResetEmail(email: string): Promise<string> {
    const selectObject = selectQuery('users', ['email'], `email = '${email}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Email not found!');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const updateObject = updateQuery('users', ['code'], `email = '${email}'`, [code]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      throw new InternalServerErrorException('Failed to send reset code!');
    }
    // todo: send email with the reset code link.
    // example: https://localhost:5173/reset-email?code=123456
    Logger.log(`UserID: ${result.rows[0].id} reset code sent successfully!`, 'AppService');
    return 'Reset code sent to your email address!';
  }

  async resetEmail(body: any): Promise<string> {
    const { email, newEmail, code } = body;
    const selectObject = selectQuery('users', ['email'], `email = '${email}' AND code = '${code}'`);
    const result = await this.pool.query(selectObject);
    if (result.rowCount === 0) {
      throw new BadRequestException('Invalid email or code!');
    }
    const updateObject = updateQuery('users', ['email'], `email = '${email}'`, [newEmail]);
    const updateResult = await this.pool.query(updateObject.query, updateObject.params);
    if (updateResult.rowCount === 0) {
      throw new InternalServerErrorException('Failed to update email!');
    }
    Logger.log(`UserID: ${result.rows[0].id} email updated successfully!`, 'AppService');
    return 'Email updated successfully!';
  }
}
