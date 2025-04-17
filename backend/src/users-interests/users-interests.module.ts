import { Module } from '@nestjs/common/index.js';
import { UsersInterestsService } from './users-interests.service.js';
import { UsersInterestsController } from './users-interests.controller.js';
import { DatabaseModule } from '../db/db.module.js';

@Module({
  imports: [UsersInterestsModule, DatabaseModule],
  controllers: [UsersInterestsController],
  providers: [UsersInterestsService],
})
export class UsersInterestsModule {}
