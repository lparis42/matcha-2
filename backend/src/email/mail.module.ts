import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService], // Si vous voulez l'utiliser dans d'autres modules
})
export class MailModule {}
