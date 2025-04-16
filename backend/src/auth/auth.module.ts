import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { FortyTwoStrategy } from './strategies/strategy.42.js';
import { MailService } from '../email/mail.service.js';
import { DatabaseModule } from '../db/db.module.js';

@Module({
  imports: [PassportModule, ConfigModule, DatabaseModule],
  providers: [AuthService, FortyTwoStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule { }