import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common/index.js";
import { UsersService } from "./users.service.js";
import { UserProfile } from "./interfaces/interface.users.js";
import { CookieAuthGuard } from "../auth/guards/guard.cookie.js";
import { IdDto } from "./dto/dto.id.js";
import { ValidateParam } from "../decorator/decorator.param.js";
import { ValidateBody } from "../decorator/decorator.body.js";
import { GetUserId } from "../decorator/decorator.get-user-id.js";
import { UserProfileDto } from "./dto/dto.user-profile.js";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('')
    @UseGuards(CookieAuthGuard)
    async getAllUsers(): Promise<{ users: Partial<UserProfile>[] }> {
        const result = await this.usersService.getAllUsers();
        return result;
    }

    @Get(':id')
    @UseGuards(CookieAuthGuard)
    async getUserById(
        @ValidateParam(IdDto) params: IdDto,
        @GetUserId() userId: number,
    ): Promise<{ user: Partial<UserProfile>, message: string }> {
        const result = await this.usersService.getUserById(params, userId);
        return result;
    }

    @Patch()
    @UseGuards(CookieAuthGuard)
    async updateUser(
        @ValidateBody(UserProfileDto) body: UserProfileDto,
        @GetUserId() userId: number,
    ): Promise<{ message: string }> {
        const result = await this.usersService.updateUser(body, userId);
        return result;
    }

}