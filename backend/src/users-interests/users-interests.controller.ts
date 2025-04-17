import { Controller, Post, Put, UseGuards } from '@nestjs/common/index.js';
import { UpdateUsersInterestsDto } from './dto/dto.update-users-interests.js';
import { ValidateBody } from '../decorator/decorator.body.js';
import { UsersInterestsService } from './users-interests.service.js';
import { CookieAuthGuard } from '../auth/guards/guard.cookie.js';

@Controller()
export class UsersInterestsController {
  constructor(private readonly usersInterestsService: UsersInterestsService) {}

  @Put('users-interests')
  @UseGuards(CookieAuthGuard)
  async updateUserInterests(
    @ValidateBody(UpdateUsersInterestsDto) body: UpdateUsersInterestsDto,
  ): Promise<{ message: string }> {
    const result = await this.usersInterestsService.updateUsersInterests(body);
    return result;
  }
}
