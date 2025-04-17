import { Controller, Get, UseGuards } from "@nestjs/common/index.js";
import { UsersService } from "./users.service.js";
import { UserInfo } from "./interfaces/interface.user-info.js";
import { ValidateBody } from "../decorator/decorator.body.js";
import { UserByIdDto } from "./dto/dto.user-by-id.js";
import { CookieAuthGuard } from "..//auth/guards/guard.cookie.js";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('user-by-id')
    @UseGuards(CookieAuthGuard)
    async getUserById(
        @ValidateBody(UserByIdDto) body: UserByIdDto,
    ): Promise<{ user: UserInfo }> {
        const result = await this.usersService.getUserById(body);
        return result;
    }
}